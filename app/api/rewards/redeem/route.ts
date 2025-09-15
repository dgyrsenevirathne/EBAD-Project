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

  const { rewardId } = await request.json();

  if (!rewardId) {
    return NextResponse.json(
      { success: false, message: 'Reward ID is required' },
      { status: 400 }
    );
  }

  let pool: sql.ConnectionPool | null = null;

  try {
    pool = await sql.connect(sqlConfig);

    // Get reward options (same as in options route)
    const rewardOptions = [
      {
        id: 1,
        name: 'LKR 500 Discount',
        points: 500,
        description: 'Get LKR 500 off your next purchase',
        type: 'discount',
        value: 500,
      },
      {
        id: 2,
        name: 'Free Shipping',
        points: 200,
        description: 'Free shipping on your next order',
        type: 'shipping',
        value: 0,
      },
      {
        id: 3,
        name: 'LKR 1000 Discount',
        points: 1000,
        description: 'Get LKR 1000 off your next purchase',
        type: 'discount',
        value: 1000,
      },
      {
        id: 4,
        name: 'Exclusive Product',
        points: 1500,
        description: 'Access to exclusive limited edition products',
        type: 'access',
        value: null,
      },
    ];

    const reward = rewardOptions.find(r => r.id === rewardId);

    if (!reward) {
      return NextResponse.json(
        { success: false, message: 'Invalid reward ID' },
        { status: 400 }
      );
    }

    // Check if user has enough points
    const pointsResult = await pool.request()
      .input('userID', sql.Int, user.UserID)
      .query(`
        SELECT Points
        FROM LoyaltyProgram
        WHERE UserID = @userID
      `);

    const currentPoints = pointsResult.recordset[0]?.Points || 0;

    if (currentPoints < reward.points) {
      return NextResponse.json(
        { success: false, message: 'Insufficient loyalty points' },
        { status: 400 }
      );
    }

    // Deduct points
    await pool.request()
      .input('userID', sql.Int, user.UserID)
      .input('pointsUsed', sql.Int, reward.points)
      .query(`
        UPDATE LoyaltyProgram
        SET Points = Points - @pointsUsed, TotalSpent = TotalSpent + @pointsUsed
        WHERE UserID = @userID
      `);

    // Log redemption transaction
    await pool.request()
      .input('userID', sql.Int, user.UserID)
      .input('points', sql.Int, -reward.points)
      .input('transactionType', sql.NVarChar, 'redemption')
      .input('description', sql.NVarChar, `Redeemed reward: ${reward.name}`)
      .query(`
        INSERT INTO LoyaltyTransactions (UserID, Points, TransactionType, Description)
        VALUES (@userID, @points, @transactionType, @description)
      `);

    return NextResponse.json({
      success: true,
      message: `Successfully redeemed reward: ${reward.name}`,
    });

  } catch (error) {
    console.error('Reward redemption error:', error);
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
