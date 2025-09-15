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

    // Get current user points
    const pointsResult = await pool.request()
      .input('userID', sql.Int, user.UserID)
      .query(`
        SELECT Points
        FROM LoyaltyProgram
        WHERE UserID = @userID
      `);

    const currentPoints = pointsResult.recordset[0]?.Points || 0;

    // Define reward options (could be moved to database later)
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

    // Add availability status based on current points
    const optionsWithAvailability = rewardOptions.map(option => ({
      ...option,
      available: currentPoints >= option.points,
    }));

    return NextResponse.json({
      success: true,
      data: optionsWithAvailability,
    });

  } catch (error) {
    console.error('Reward options fetch error:', error);
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
