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

    // Get user profile info
    const userResult = await pool.request()
      .input('userID', sql.Int, user.UserID)
      .query(`
        SELECT FirstName, LastName, Email, Phone
        FROM Users
        WHERE UserID = @userID
      `);

    if (userResult.recordset.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userResult.recordset[0];

    // Get loyalty info
    const loyaltyResult = await pool.request()
      .input('userID', sql.Int, user.UserID)
      .query(`
        SELECT Points, TotalEarned, TotalSpent
        FROM LoyaltyProgram
        WHERE UserID = @userID
      `);

    const loyalty = loyaltyResult.recordset[0] || { Points: 0, TotalEarned: 0, TotalSpent: 0 };

    // Determine tier based on points (simple logic)
    let tier = 'Bronze';
    if (loyalty.Points >= 1000) tier = 'Gold';
    else if (loyalty.Points >= 500) tier = 'Silver';

    // Get total orders and total spent
    const ordersSummaryResult = await pool.request()
      .input('userID', sql.Int, user.UserID)
      .query(`
        SELECT COUNT(*) as totalOrders, SUM(TotalAmount) as totalSpent
        FROM Orders
        WHERE UserID = @userID
      `);

    const ordersSummary = ordersSummaryResult.recordset[0] || { totalOrders: 0, totalSpent: 0 };

    // Get addresses
    const addressesResult = await pool.request()
      .input('userID', sql.Int, user.UserID)
      .query(`
        SELECT AddressID as id, FirstName, LastName, AddressLine1, AddressLine2, City, Province, PostalCode, IsDefault as isDefault
        FROM Addresses
        WHERE UserID = @userID
        ORDER BY IsDefault DESC, CreatedAt DESC
      `);

    // Get orders
    const ordersResult = await pool.request()
      .input('userID', sql.Int, user.UserID)
      .query(`
        SELECT o.OrderID as id, o.OrderNumber, o.TotalAmount as total, o.OrderStatus as status, o.CreatedAt as date,
               COUNT(oi.OrderItemID) as items
        FROM Orders o
        LEFT JOIN OrderItems oi ON o.OrderID = oi.OrderID
        WHERE o.UserID = @userID
        GROUP BY o.OrderID, o.OrderNumber, o.TotalAmount, o.OrderStatus, o.CreatedAt
        ORDER BY o.CreatedAt DESC
      `);

    // Get wishlist
    const wishlistResult = await pool.request()
      .input('userID', sql.Int, user.UserID)
      .query(`
        SELECT DISTINCT w.WishlistID as id, p.ProductName as name, p.BasePrice as price, NULL as originalPrice,
               pi.ImageURL as image,
               CASE WHEN EXISTS (
                 SELECT 1 FROM ProductVariants pv WHERE pv.ProductID = p.ProductID AND pv.Stock > 0 AND pv.IsActive = 1
               ) THEN 1 ELSE 0 END as inStock
        FROM Wishlist w
        JOIN Products p ON w.ProductID = p.ProductID
        LEFT JOIN ProductImages pi ON p.ProductID = pi.ProductID AND pi.IsPrimary = 1
        WHERE w.UserID = @userID AND p.IsActive = 1
      `);

    const profile = {
      firstName: userData.FirstName,
      lastName: userData.LastName,
      email: userData.Email,
      phone: userData.Phone || '',
      loyaltyPoints: loyalty.Points,
      tier,
      totalOrders: ordersSummary.totalOrders,
      totalSpent: ordersSummary.totalSpent || 0,
    };

    const addresses = addressesResult.recordset.map(addr => ({
      id: addr.id,
      firstName: addr.FirstName,
      lastName: addr.LastName,
      addressLine1: addr.AddressLine1,
      addressLine2: addr.AddressLine2,
      city: addr.City,
      province: addr.Province,
      postalCode: addr.PostalCode,
      isDefault: addr.isDefault,
    }));

    const orders = ordersResult.recordset.map(order => ({
      id: order.OrderNumber,
      date: order.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      status: order.status,
      total: order.total,
      items: order.items,
      trackingNumber: null, // Not in schema, set to null
    }));

    const wishlist = wishlistResult.recordset.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      originalPrice: item.originalPrice,
      image: item.image,
      inStock: item.inStock,
    }));

    return NextResponse.json({
      success: true,
      data: {
        profile,
        addresses,
        orders,
        wishlist,
      },
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
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

export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request);

  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const { firstName, lastName, email, phone } = await request.json();

    // Update user profile
    const pool = await sql.connect(sqlConfig);

    await pool.request()
      .input('userID', sql.Int, user.UserID)
      .input('firstName', sql.NVarChar, firstName)
      .input('lastName', sql.NVarChar, lastName)
      .input('email', sql.NVarChar, email)
      .input('phone', sql.NVarChar, phone)
      .query(`
        UPDATE Users
        SET FirstName = @firstName, LastName = @lastName, Email = @email, Phone = @phone, UpdatedAt = GETDATE()
        WHERE UserID = @userID
      `);

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
