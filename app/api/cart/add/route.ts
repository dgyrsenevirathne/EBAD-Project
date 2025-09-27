import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';
import { sqlConfig } from '@/config/database';
import { requireAuth } from '@/lib/auth';

async function addToCart(request: NextRequest, user: any): Promise<Response> {
  const { productId, variantId, quantity = 1 } = await request.json();

  if (!productId) {
    return NextResponse.json(
      { success: false, message: 'Product ID is required' },
      { status: 400 }
    );
  }

  let pool: sql.ConnectionPool | null = null;

  try {
    pool = await sql.connect(sqlConfig);

    // Check if product exists and is active
    const productResult = await pool.request()
      .input('productID', sql.Int, parseInt(productId))
      .query(`
        SELECT ProductID, IsActive
        FROM Products
        WHERE ProductID = @productID AND IsActive = 1
      `);

    if (productResult.recordset.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    // Check stock - if variant specified, use variant stock, otherwise check if product has variants
    let effectiveVariantId = variantId ? parseInt(variantId) : null;
    let availableStock = 0;

    // If no variant specified, check if product has variants and auto-select first one
    if (!effectiveVariantId) {
      const variantCheckResult = await pool.request()
        .input('productID', sql.Int, parseInt(productId))
        .query(`
          SELECT TOP 1 VariantID, Stock
          FROM ProductVariants
          WHERE ProductID = @productID AND IsActive = 1
          ORDER BY VariantID
        `);

      if (variantCheckResult.recordset.length > 0) {
        // Product has variants, auto-select the first one
        effectiveVariantId = variantCheckResult.recordset[0].VariantID;
        availableStock = variantCheckResult.recordset[0].Stock;
      } else {
        // No variants, unlimited stock
        availableStock = 999999;
      }
    } else {
      const variantResult = await pool.request()
        .input('variantID', sql.Int, effectiveVariantId)
        .query(`
          SELECT Stock
          FROM ProductVariants
          WHERE VariantID = @variantID AND IsActive = 1
        `);

      if (variantResult.recordset.length === 0) {
        return NextResponse.json(
          { success: false, message: 'Product variant not found' },
          { status: 404 }
        );
      }

      availableStock = variantResult.recordset[0].Stock;
    }

    if (availableStock < quantity) {
      return NextResponse.json(
        { success: false, message: 'Maximum available quantity reached' },
        { status: 400 }
      );
    }

    // Check if item already exists in cart
    const existingResult = await pool.request()
      .input('userID', sql.Int, user.UserID)
      .input('productID', sql.Int, parseInt(productId))
      .input('variantID', sql.Int, effectiveVariantId)
      .query(`
        SELECT CartID, Quantity
        FROM ShoppingCart
        WHERE UserID = @userID AND ProductID = @productID
        AND VariantID = @variantID
      `);

    if (existingResult.recordset.length > 0) {
      // Update existing item - quantity is the new total quantity
      await pool.request()
        .input('cartID', sql.Int, existingResult.recordset[0].CartID)
        .input('quantity', sql.Int, quantity)
        .query(`
          UPDATE ShoppingCart
          SET Quantity = @quantity
          WHERE CartID = @cartID
        `);
    } else {
      // Add new item
      await pool.request()
        .input('userID', sql.Int, user.UserID)
        .input('productID', sql.Int, parseInt(productId))
        .input('variantID', sql.Int, effectiveVariantId)
        .input('quantity', sql.Int, quantity)
        .query(`
          INSERT INTO ShoppingCart (UserID, ProductID, VariantID, Quantity)
          VALUES (@userID, @productID, @variantID, @quantity)
        `);
    }

    return NextResponse.json({
      success: true,
      message: 'Item added to cart successfully',
    });

  } catch (error) {
    console.error('Add to cart error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to add item to cart' },
      { status: 500 }
    );
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

export async function POST(request: NextRequest) {
  return requireAuth(addToCart)(request);
}
