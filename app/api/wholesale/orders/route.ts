import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';
import { sqlConfig } from '@/config/database';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json(
      { success: false, message: 'User ID is required' },
      { status: 400 }
    );
  }

  let pool: sql.ConnectionPool | null = null;

  try {
    pool = await sql.connect(sqlConfig);

    const query = `
      SELECT
        wo.WholesaleOrderID,
        wo.OrderNumber,
        wo.OrderDate,
        wo.Status,
        wo.TotalAmount,
        wo.DiscountAmount,
        wo.InvoiceNumber,
        COUNT(woi.WholesaleOrderItemID) as ItemCount
      FROM WholesaleOrders wo
      LEFT JOIN WholesaleOrderItems woi ON wo.WholesaleOrderID = woi.WholesaleOrderID
      WHERE wo.UserID = @userId
      GROUP BY wo.WholesaleOrderID, wo.OrderNumber, wo.OrderDate, wo.Status, wo.TotalAmount, wo.DiscountAmount, wo.InvoiceNumber
      ORDER BY wo.OrderDate DESC
    `;

    const result = await pool.request()
      .input('userId', sql.Int, parseInt(userId))
      .query(query);

    const orders = result.recordset.map(order => ({
      id: order.OrderNumber,
      date: order.OrderDate.toISOString().split('T')[0],
      status: order.Status,
      total: order.TotalAmount,
      discount: order.DiscountAmount,
      invoiceNumber: order.InvoiceNumber,
      items: order.ItemCount,
    }));

    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error('Get wholesale orders error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch wholesale orders' },
      { status: 500 }
    );
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

export async function POST(request: NextRequest) {
  let pool: sql.ConnectionPool | null = null;

  try {
    const body = await request.json();
    const { userId, items, totalAmount, discountAmount } = body;

    if (!userId || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User ID and items are required' },
        { status: 400 }
      );
    }

    pool = await sql.connect(sqlConfig);

    // Generate order number
    const orderNumber = 'WHO' + Date.now().toString().slice(-6);

    // Insert order
    const orderResult = await pool.request()
      .input('userId', sql.Int, userId)
      .input('orderNumber', sql.NVarChar(50), orderNumber)
      .input('totalAmount', sql.Decimal(10, 2), totalAmount)
      .input('discountAmount', sql.Decimal(10, 2), discountAmount || 0)
      .query(`
        INSERT INTO WholesaleOrders (UserID, OrderNumber, TotalAmount, DiscountAmount, Status, OrderDate)
        OUTPUT INSERTED.WholesaleOrderID
        VALUES (@userId, @orderNumber, @totalAmount, @discountAmount, 'processing', GETDATE())
      `);

    const orderId = orderResult.recordset[0].WholesaleOrderID;

    // Insert order items
    for (const item of items) {
      await pool.request()
        .input('orderId', sql.Int, orderId)
        .input('wholesaleProductId', sql.Int, item.wholesaleProductId)
        .input('quantity', sql.Int, item.quantity)
        .input('unitPrice', sql.Decimal(10, 2), item.unitPrice)
        .input('color', sql.NVarChar(50), item.color || null)
        .input('size', sql.NVarChar(50), item.size || null)
        .query(`
          INSERT INTO WholesaleOrderItems (WholesaleOrderID, WholesaleProductID, Quantity, UnitPrice, Color, Size)
          VALUES (@orderId, @wholesaleProductId, @quantity, @unitPrice, @color, @size)
        `);
    }

    return NextResponse.json({
      success: true,
      message: 'Wholesale order created successfully',
      data: { orderId, orderNumber },
    });
  } catch (error) {
    console.error('Create wholesale order error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create wholesale order' },
      { status: 500 }
    );
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}
