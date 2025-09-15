import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';
import { sqlConfig } from '@/config/database';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await authenticateRequest(request);

  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Authentication required' },
      { status: 401 }
    );
  }

  let pool: sql.ConnectionPool | null = null;

  try {
    pool = await sql.connect(sqlConfig);

    // Get loyalty info
    const loyaltyResult = await pool.request()
      .input('userID', sql.Int, user.UserID)
      .query(`
        SELECT Points, TotalEarned, TotalSpent
        FROM LoyaltyProgram
        WHERE UserID = @userID
      `);

    const loyalty = loyaltyResult.recordset[0] || { Points: 0, TotalEarned: 0, TotalSpent: 0 };

    // Determine tier based on points
    let tier = 'Bronze';
    let nextTier = 'Silver';
    let pointsToNextTier = 500;

    if (loyalty.Points >= 2000) {
      tier = 'Platinum';
      nextTier = 'Platinum';
      pointsToNextTier = 0;
    } else if (loyalty.Points >= 1000) {
      tier = 'Gold';
      nextTier = 'Platinum';
      pointsToNextTier = 2000 - loyalty.Points;
    } else if (loyalty.Points >= 500) {
      tier = 'Silver';
      nextTier = 'Gold';
      pointsToNextTier = 1000 - loyalty.Points;
    } else {
      pointsToNextTier = 500 - loyalty.Points;
    }

    // Get referral code
    const referralResult = await pool.request()
      .input('userID', sql.Int, user.UserID)
      .query(`
        SELECT ReferralCode
        FROM LoyaltyProgram
        WHERE UserID = @userID
      `);

    const referralCode = referralResult.recordset[0]?.ReferralCode || null;

    // Get referrals count
    const referralsResult = await pool.request()
      .input('userID', sql.Int, user.UserID)
      .query(`
        SELECT COUNT(*) as referralsCount
        FROM LoyaltyTransactions
        WHERE TransactionType = 'referral' AND ReferenceID = @userID
      `);

    const referralsCount = referralsResult.recordset[0]?.referralsCount || 0;

    return NextResponse.json({
      success: true,
      data: {
        points: loyalty.Points,
        totalEarned: loyalty.TotalEarned,
        totalSpent: loyalty.TotalSpent,
        tier,
        nextTier,
        pointsToNextTier,
        referralCode,
        referralsCount,
      },
    });

  } catch (error) {
    console.error('Loyalty fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}
