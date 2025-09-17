import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';
import { sqlConfig } from '@/config/database';
import { requireAuth, authenticateRequest } from '@/lib/auth';

interface CartItem {
  CartID: number;
  ProductID: number;
  VariantID: number | null;
  Quantity: number;
  ProductName: string;
  BasePrice: number;
  WholesalePrice: number | null;
  Size: string | null;
  Color: string | null;
  Stock: number;
  ImageURL: string | null;
}

// GET /api/cart - Get user's cart items
async function getCart(request: NextRequest, user: any): Promise<Response> {
  let pool: sql.ConnectionPool | null = null;

  try {
    pool = await sql.connect(sqlConfig);

    const result = await pool.request()
      .input('userID', sql.Int, user.UserID)
      .query(`
        SELECT
          sc.CartID,
          sc.ProductID,
          sc.VariantID,
          sc.Quantity,
          p.ProductName,
          p.BasePrice,
          p.WholesalePrice,
          p.Festival,
          pv.Size,
          pv.Color,
          COALESCE(pv.Stock, 999999) AS Stock,
          pi.ImageURL
        FROM ShoppingCart sc
        JOIN Products p ON sc.ProductID = p.ProductID
        LEFT JOIN ProductVariants pv ON sc.VariantID = pv.VariantID
        LEFT JOIN ProductImages pi ON p.ProductID = pi.ProductID AND pi.IsPrimary = 1
        WHERE sc.UserID = @userID AND p.IsActive = 1
        ORDER BY sc.CreatedAt DESC
      `);

    const cartItems: CartItem[] = result.recordset;

    return NextResponse.json({
      success: true,
      data: cartItems,
    });

  } catch (error) {
    console.error('Get cart error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch cart' },
      { status: 500 }
    );
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

// POST /api/cart - Add item to cart
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
    let availableStock = 0;
    if (variantId) {
      const variantResult = await pool.request()
        .input('variantID', sql.Int, parseInt(variantId))
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
    } else {
      // Check if product has variants
      const variantCheckResult = await pool.request()
        .input('productID', sql.Int, parseInt(productId))
        .query(`
          SELECT COUNT(*) as VariantCount
          FROM ProductVariants
          WHERE ProductID = @productID AND IsActive = 1
        `);

      if (variantCheckResult.recordset[0].VariantCount > 0) {
        // Product has variants, get total stock from all variants
        const totalStockResult = await pool.request()
          .input('productID', sql.Int, parseInt(productId))
          .query(`
            SELECT SUM(Stock) as TotalStock
            FROM ProductVariants
            WHERE ProductID = @productID AND IsActive = 1
          `);

        availableStock = totalStockResult.recordset[0]?.TotalStock || 0;
      } else {
        // Product has no variants, assume unlimited stock
        availableStock = 999999; // Unlimited for products without variants
      }
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
      .input('variantID', sql.Int, variantId ? parseInt(variantId) : null)
      .query(`
        SELECT CartID, Quantity
        FROM ShoppingCart
        WHERE UserID = @userID AND ProductID = @productID
        AND (@variantID IS NULL OR VariantID = @variantID)
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
        .input('variantID', sql.Int, variantId ? parseInt(variantId) : null)
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

export async function GET(request: NextRequest) {
  // Allow unauthenticated users to get cart items (could be empty or stored in session)
  // For now, require auth as before
  return requireAuth(getCart)(request);
}

export async function POST(request: NextRequest) {
  // Allow adding to cart without login by bypassing requireAuth
  // For authenticated users, pass user info; for unauthenticated, use guest user with UserID = 0 or null

  // Try to authenticate user
  let user = null;
  try {
    user = await authenticateRequest(request);
  } catch {}

  // If no user, create a guest user object with UserID = 0 (or handle accordingly in DB)
  if (!user) {
    user = { UserID: 0, Email: '', UserType: 'guest', FirstName: '', LastName: '' };
  }

  return addToCart(request, user);
}
