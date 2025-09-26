import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';
import { sqlConfig } from '@/config/database';
import { requireAuth, AuthUser } from '@/lib/auth';

async function connectToDB() {
  const pool = await sql.connect(sqlConfig);
  return pool;
}

export async function GET(request: NextRequest) {
  return requireAuth(async (request: NextRequest, user: AuthUser) => {
    try {
      const pool = await connectToDB();
      try {
        const result = await pool.request()
          .input('userId', sql.Int, user.UserID)
          .query(`
            SELECT
              tos.id,
              tos.product_id as productId,
              p.ProductName as productName,
              pi.ImageURL as PrimaryImage,
              tos.user_image_path as userImagePath,
              tos.result_image_path as resultImagePath,
              tos.status,
              tos.created_at as createdAt
            FROM try_on_sessions tos
            INNER JOIN products p ON tos.product_id = p.ProductID
            LEFT JOIN ProductImages pi ON p.ProductID = pi.ProductID AND pi.IsPrimary = 1
            WHERE tos.user_id = @userId
            ORDER BY tos.created_at DESC
          `);

        const sessions = result.recordset.map(session => ({
          id: session.id,
          productId: session.productId,
          productName: session.productName,
          PrimaryImage: session.PrimaryImage,
          userImagePath: session.userImagePath,
          resultImagePath: session.resultImagePath,
          status: session.status,
          createdAt: session.createdAt
        }));

        return NextResponse.json({
          success: true,
          data: sessions
        });
      } finally {
        await pool.close();
      }
    } catch (error) {
      console.error('Fetch sessions error:', error);
      return NextResponse.json(
        { success: false, message: 'Internal server error' },
        { status: 500 }
      );
    }
  })(request);
}
