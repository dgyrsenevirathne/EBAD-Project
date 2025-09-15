import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';
import { sqlConfig } from '@/config/database';
import { requireAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  return requireAuth(async (request: NextRequest, user) => {
    const { productId, variantId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { success: false, message: 'Product ID is required' },
        { status: 400 }
      );
    }

    let pool: sql.ConnectionPool | null = null;

    try {
      pool = await sql.connect(sqlConfig);

      // Check if notification already exists
      const existingResult = await pool.request()
        .input('userID', sql.Int, user.UserID)
        .input('productID', sql.Int, parseInt(productId))
        .input('variantID', sql.Int, variantId ? parseInt(variantId) : null)
        .query(`
          SELECT NotificationID
          FROM RestockNotifications
          WHERE UserID = @userID AND ProductID = @productID
          AND (@variantID IS NULL OR VariantID = @variantID)
          AND IsNotified = 0
        `);

      if (existingResult.recordset.length > 0) {
        return NextResponse.json(
          { success: false, message: 'Restock notification already requested' },
          { status: 400 }
        );
      }

      // Add notification request
      await pool.request()
        .input('userID', sql.Int, user.UserID)
        .input('productID', sql.Int, parseInt(productId))
        .input('variantID', sql.Int, variantId ? parseInt(variantId) : null)
        .query(`
          INSERT INTO RestockNotifications (UserID, ProductID, VariantID)
          VALUES (@userID, @productID, @variantID)
        `);

      return NextResponse.json({
        success: true,
        message: 'Restock notification requested successfully',
      });

    } catch (error) {
      console.error('Restock notification error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to request restock notification' },
        { status: 500 }
      );
    } finally {
      if (pool) {
        await pool.close();
      }
    }
  })(request);
}
