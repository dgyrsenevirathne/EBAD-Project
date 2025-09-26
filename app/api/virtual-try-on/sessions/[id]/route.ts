import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';
import { sqlConfig } from '@/config/database';
import { requireAuth, AuthUser } from '@/lib/auth';

async function connectToDB() {
  const pool = await sql.connect(sqlConfig);
  return pool;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  return requireAuth(async (request: NextRequest, user: AuthUser) => {
    try {
      const { id } = params;
      if (!id) {
        return NextResponse.json(
          { success: false, message: 'Session ID required' },
          { status: 400 }
        );
      }

      const pool = await connectToDB();
      try {
        const result = await pool.request()
          .input('sessionId', sql.UniqueIdentifier, id)
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
              tos.customizations,
              tos.created_at as createdAt
            FROM try_on_sessions tos
            INNER JOIN products p ON tos.product_id = p.ProductID
            LEFT JOIN ProductImages pi ON p.ProductID = pi.ProductID AND pi.IsPrimary = 1
            WHERE tos.id = @sessionId AND tos.user_id = @userId
          `);

        if (result.recordset.length === 0) {
          return NextResponse.json(
            { success: false, message: 'Session not found' },
            { status: 404 }
          );
        }

        const session = result.recordset[0];
        return NextResponse.json({
          success: true,
          data: {
            id: session.id,
            productId: session.productId,
            productName: session.productName,
            PrimaryImage: session.PrimaryImage,
            userImagePath: session.userImagePath,
            resultImagePath: session.resultImagePath,
            status: session.status,
            customizations: session.customizations ? JSON.parse(session.customizations) : null,
            createdAt: session.createdAt
          }
        });
      } finally {
        await pool.close();
      }
    } catch (error) {
      console.error('Fetch session error:', error);
      return NextResponse.json(
        { success: false, message: 'Internal server error' },
        { status: 500 }
      );
    }
  })(request);
}
