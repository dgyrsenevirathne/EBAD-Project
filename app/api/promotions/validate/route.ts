import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';
import { sqlConfig } from '@/config/database';

export async function POST(request: NextRequest) {
  const { promoCode, subtotal } = await request.json();

  if (!promoCode) {
    return NextResponse.json(
      { success: false, message: 'Promo code is required' },
      { status: 400 }
    );
  }

  let pool: sql.ConnectionPool | null = null;

  try {
    pool = await sql.connect(sqlConfig);

    const result = await pool.request()
      .input('promoCode', sql.NVarChar, promoCode.toUpperCase())
      .input('currentDate', sql.DateTime, new Date())
      .query(`
        SELECT *
        FROM Promotions
        WHERE UPPER(PromotionName) = @promoCode
        AND IsActive = 1
        AND StartDate <= @currentDate
        AND EndDate >= @currentDate
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired promo code' },
        { status: 400 }
      );
    }

    const promotion = result.recordset[0];

    // Check minimum order amount
    if (subtotal < promotion.MinOrderAmount) {
      return NextResponse.json(
        {
          success: false,
          message: `Minimum order amount of LKR ${promotion.MinOrderAmount.toLocaleString()} required`
        },
        { status: 400 }
      );
    }

    // Calculate discount
    let discountAmount = 0;
    if (promotion.DiscountType === 'percentage') {
      discountAmount = (subtotal * promotion.DiscountValue) / 100;
    } else if (promotion.DiscountType === 'fixed') {
      discountAmount = promotion.DiscountValue;
    }

    return NextResponse.json({
      success: true,
      data: {
        code: promotion.PromotionName,
        discountType: promotion.DiscountType,
        discountValue: promotion.DiscountValue,
        discountAmount: Math.min(discountAmount, subtotal), // Don't exceed subtotal
        minOrderAmount: promotion.MinOrderAmount,
      },
    });

  } catch (error) {
    console.error('Validate promo code error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to validate promo code' },
      { status: 500 }
    );
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}
