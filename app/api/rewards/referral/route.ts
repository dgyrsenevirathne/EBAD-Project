import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';
import { sqlConfig } from '@/config/database';
import { authenticateRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request);

  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Authentication required' },
      { status: 401 }
    );
  }

  const { referralCode } = await request.json();

  if (!referralCode) {
    return NextResponse.json(
      { success: false, message: 'Referral code is required' },
      { status: 400 }
    );
  }

  let pool: sql.ConnectionPool | null = null;

  try {
    pool = await sql.connect(sqlConfig);

    // Find user by referral code
    const referrerResult = await pool.request()
      .input('referralCode', sql.NVarChar, referralCode)
      .query(`
        SELECT UserID
        FROM LoyaltyProgram
        WHERE ReferralCode = @referralCode
      `);

    if (referrerResult.recordset.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid referral code' },
        { status: 400 }
      );
    }

    const referrerId = referrerResult.recordset[0].UserID;

    // Prevent self-referral
    if (referrerId === user.UserID) {
      return NextResponse.json(
        { success: false, message: 'Cannot use your own referral code' },
        { status: 400 }
      );
    }

    // Check if user already used a referral
    const existingReferral = await pool.request()
      .input('userId', sql.Int, user.UserID)
      .query(`
        SELECT COUNT(*) as count
        FROM LoyaltyTransactions
        WHERE UserID = @userId AND TransactionType = 'referral'
      `);

    if (existingReferral.recordset[0].count > 0) {
      return NextResponse.json(
        { success: false, message: 'Referral code already used' },
        { status: 400 }
      );
    }

    // Add referral points to referrer and referee
    const referralPoints = 50;

    // Add points to referrer
    await pool.request()
      .input('referrerId', sql.Int, referrerId)
      .input('referralPoints', sql.Int, referralPoints)
      .query(`
        UPDATE LoyaltyProgram
        SET Points = Points + @referralPoints, TotalEarned = TotalEarned + @referralPoints
        WHERE UserID = @referrerId
      `);

    // Log referral transaction for referrer
    await pool.request()
      .input('referrerId', sql.Int, referrerId)
      .input('points', sql.Int, referralPoints)
      .input('transactionType', sql.NVarChar, 'referral')
      .input('description', sql.NVarChar, 'Referral bonus points')
      .query(`
        INSERT INTO LoyaltyTransactions (UserID, Points, TransactionType, Description)
        VALUES (@referrerId, @points, @transactionType, @description)
      `);

    // Add points to referee (current user)
    await pool.request()
      .input('userId', sql.Int, user.UserID)
      .input('referralPoints', sql.Int, referralPoints)
      .query(`
        UPDATE LoyaltyProgram
        SET Points = Points + @referralPoints, TotalEarned = TotalEarned + @referralPoints
        WHERE UserID = @userId
      `);

    // Log referral transaction for referee
    await pool.request()
      .input('userId', sql.Int, user.UserID)
      .input('points', sql.Int, referralPoints)
      .input('transactionType', sql.NVarChar, 'referral')
      .input('description', sql.NVarChar, 'Referral bonus points')
      .query(`
        INSERT INTO LoyaltyTransactions (UserID, Points, TransactionType, Description)
        VALUES (@userId, @points, @transactionType, @description)
      `);

    return NextResponse.json({
      success: true,
      message: 'Referral code applied successfully',
    });

  } catch (error) {
    console.error('Referral error:', error);
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
