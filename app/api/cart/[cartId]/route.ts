import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';
import { sqlConfig } from '@/config/database';
import { requireAuth } from '@/lib/auth';

// PUT /api/cart/[cartId] - Update cart item quantity
async function updateCartItem(request: NextRequest, user: any, cartId: string): Promise<Response> {
  const { quantity } = await request.json();

  if (!quantity || quantity < 1) {
    return NextResponse.json(
      { success: false, message: 'Valid quantity is required' },
      { status: 400 }
    );
  }

  let pool: sql.ConnectionPool | null = null;

  try {
    pool = await sql.connect(sqlConfig);

    // Check if cart item exists and belongs to user
    const cartResult = await pool.request()
      .input('cartID', sql.Int, parseInt(cartId))
      .input('userID', sql.Int, user.UserID)
      .query(`
        SELECT CartID, ProductID, VariantID, Quantity
        FROM ShoppingCart
        WHERE CartID = @cartID AND UserID = @userID
      `);

    if (cartResult.recordset.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Cart item not found' },
        { status: 404 }
      );
    }

    const cartItem = cartResult.recordset[0];

    // Check stock if variant is specified
    if (cartItem.VariantID) {
      const stockResult = await pool.request()
        .input('variantID', sql.Int, cartItem.VariantID)
        .query(`
          SELECT Stock
          FROM ProductVariants
          WHERE VariantID = @variantID AND IsActive = 1
        `);

      if (stockResult.recordset.length === 0 || stockResult.recordset[0].Stock < quantity) {
        return NextResponse.json(
          { success: false, message: 'Insufficient stock' },
          { status: 400 }
        );
      }
    }

    // Update cart item quantity
    await pool.request()
      .input('cartID', sql.Int, parseInt(cartId))
      .input('quantity', sql.Int, quantity)
      .query(`
        UPDATE ShoppingCart
        SET Quantity = @quantity
        WHERE CartID = @cartID
      `);

    return NextResponse.json({
      success: true,
      message: 'Cart item updated successfully',
    });

  } catch (error) {
    console.error('Update cart item error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update cart item' },
      { status: 500 }
    );
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

// DELETE /api/cart/[cartId] - Remove cart item
async function deleteCartItem(request: NextRequest, user: any, cartId: string): Promise<Response> {
  let pool: sql.ConnectionPool | null = null;

  try {
    pool = await sql.connect(sqlConfig);

    // Check if cart item exists and belongs to user
    const cartResult = await pool.request()
      .input('cartID', sql.Int, parseInt(cartId))
      .input('userID', sql.Int, user.UserID)
      .query(`
        SELECT CartID
        FROM ShoppingCart
        WHERE CartID = @cartID AND UserID = @userID
      `);

    if (cartResult.recordset.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Cart item not found' },
        { status: 404 }
      );
    }

    // Delete cart item
    await pool.request()
      .input('cartID', sql.Int, parseInt(cartId))
      .query(`
        DELETE FROM ShoppingCart
        WHERE CartID = @cartID
      `);

    return NextResponse.json({
      success: true,
      message: 'Cart item removed successfully',
    });

  } catch (error) {
    console.error('Delete cart item error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to remove cart item' },
      { status: 500 }
    );
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

export async function PUT(request: NextRequest, { params }: { params: { cartId: string } }) {
  const { cartId } = await params;
  return requireAuth((req, user) => updateCartItem(req, user, cartId))(request);
}

export async function DELETE(request: NextRequest, { params }: { params: { cartId: string } }) {
  const { cartId } = await params;
  return requireAuth((req, user) => deleteCartItem(req, user, cartId))(request);
}
