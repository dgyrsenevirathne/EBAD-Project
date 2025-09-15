import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';
import { sqlConfig } from '@/config/database';
import { requireAuth } from '@/lib/auth';

// DELETE /api/wishlist/[id] - Remove item from wishlist
async function removeFromWishlist(request: NextRequest, user: any, productId: string): Promise<Response> {
  let pool: sql.ConnectionPool | null = null;

  try {
    pool = await sql.connect(sqlConfig);

    // Check if wishlist item exists and belongs to user
    const wishlistResult = await pool.request()
      .input('userID', sql.Int, user.UserID)
      .input('productID', sql.Int, parseInt(productId))
      .query(`
        SELECT WishlistID
        FROM Wishlist
        WHERE UserID = @userID AND ProductID = @productID
      `);

    if (wishlistResult.recordset.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Product not found in wishlist' },
        { status: 404 }
      );
    }

    // Remove from wishlist
    await pool.request()
      .input('userID', sql.Int, user.UserID)
      .input('productID', sql.Int, parseInt(productId))
      .query(`
        DELETE FROM Wishlist
        WHERE UserID = @userID AND ProductID = @productID
      `);

    return NextResponse.json({
      success: true,
      message: 'Product removed from wishlist successfully',
    });

  } catch (error) {
    console.error('Remove from wishlist error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to remove product from wishlist' },
      { status: 500 }
    );
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;
  return requireAuth((req, user) => removeFromWishlist(req, user, id))(request);
}
