import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';
import { sqlConfig } from '@/config/database';
import { requireAuth } from '@/lib/auth';

interface WishlistItem {
  WishlistID: number;
  ProductID: number;
  ProductName: string;
  BasePrice: number;
  WholesalePrice: number | null;
  PrimaryImage: string | null;
  CreatedAt: Date;
}

// GET /api/wishlist - Get user's wishlist items
async function getWishlist(request: NextRequest, user: any): Promise<Response> {
  let pool: sql.ConnectionPool | null = null;

  try {
    pool = await sql.connect(sqlConfig);

    const result = await pool.request()
      .input('userID', sql.Int, user.UserID)
      .query(`
        SELECT
          w.WishlistID,
          w.ProductID,
          p.ProductName,
          p.BasePrice,
          p.WholesalePrice,
          pi.ImageURL as PrimaryImage,
          w.CreatedAt
        FROM Wishlist w
        JOIN Products p ON w.ProductID = p.ProductID
        LEFT JOIN ProductImages pi ON p.ProductID = pi.ProductID AND pi.IsPrimary = 1
        WHERE w.UserID = @userID AND p.IsActive = 1
        ORDER BY w.CreatedAt DESC
      `);

    const wishlistItems: WishlistItem[] = result.recordset;

    return NextResponse.json({
      success: true,
      data: wishlistItems,
    });

  } catch (error) {
    console.error('Get wishlist error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch wishlist' },
      { status: 500 }
    );
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

// POST /api/wishlist - Add item to wishlist
async function addToWishlist(request: NextRequest, user: any): Promise<Response> {
  const { productId } = await request.json();

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

    // Check if item already exists in wishlist
    const existingResult = await pool.request()
      .input('userID', sql.Int, user.UserID)
      .input('productID', sql.Int, parseInt(productId))
      .query(`
        SELECT WishlistID
        FROM Wishlist
        WHERE UserID = @userID AND ProductID = @productID
      `);

    if (existingResult.recordset.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Product already in wishlist' },
        { status: 400 }
      );
    }

    // Add to wishlist
    await pool.request()
      .input('userID', sql.Int, user.UserID)
      .input('productID', sql.Int, parseInt(productId))
      .query(`
        INSERT INTO Wishlist (UserID, ProductID)
        VALUES (@userID, @productID)
      `);

    return NextResponse.json({
      success: true,
      message: 'Product added to wishlist successfully',
    });

  } catch (error) {
    console.error('Add to wishlist error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to add product to wishlist' },
      { status: 500 }
    );
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

export async function GET(request: NextRequest) {
  return requireAuth(getWishlist)(request);
}

export async function POST(request: NextRequest) {
  return requireAuth(addToWishlist)(request);
}
