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

    // Get loyalty transaction history
    const historyResult = await pool.request()
      .input('userID', sql.Int, user.UserID)
      .query(`
        SELECT
          TransactionID as id,
          Points,
          TransactionType,
          Description,
          CreatedAt as date
        FROM LoyaltyTransactions
        WHERE UserID = @userID
        ORDER BY CreatedAt DESC
      `);

    const history = historyResult.recordset.map(transaction => ({
      id: transaction.id,
      points: transaction.Points,
      description: transaction.Description,
      date: transaction.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      type: transaction.TransactionType,
    }));

    return NextResponse.json({
      success: true,
      data: history,
    });

  } catch (error) {
    console.error('Loyalty history fetch error:', error);
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
