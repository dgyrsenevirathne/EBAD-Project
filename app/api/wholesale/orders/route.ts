import { NextRequest, NextResponse } from 'next/server';
import { requireWholesale } from '@/lib/auth';
import sql from 'mssql';
import { sqlConfig } from '@/config/database';

async function GET(request: NextRequest) {
  return requireWholesale(async (request, user) => {
    try {
      const pool = await sql.connect(sqlConfig);
      const requestSql = pool.request();
      requestSql.input('userID', sql.Int, user.UserID);

      const query = `
        SELECT 
          o.OrderID as id,
          o.OrderNumber as orderNumber,
          CONVERT(VARCHAR, o.CreatedAt, 103) as date,
          o.Status as status,
          o.TotalAmount as total,
          ISNULL(o.DiscountAmount, 0) as discount,
          o.InvoiceNumber as invoiceNumber,
          (SELECT COUNT(*) FROM OrderItems oi WHERE oi.OrderID = o.OrderID) as items
        FROM Orders o
        WHERE o.UserID = @userID AND o.OrderType = 'wholesale'
        ORDER BY o.CreatedAt DESC
      `;

      const result = await requestSql.query(query);

      await pool.close();

      return NextResponse.json({ success: true, data: result.recordset });
    } catch (error) {
      console.error('Error fetching wholesale orders:', error);
      return NextResponse.json({ success: false, message: 'Failed to fetch orders' }, { status: 500 });
    }
  })(request);
}

async function POST(request: NextRequest) {
  return requireWholesale(async (request, user) => {
    try {
      const body = await request.json();
      const { items, total, discount } = body; // items: [{sku, quantity, color, size, price}]

      const pool = await sql.connect(sqlConfig);
      const transaction = new sql.Transaction(pool);
      await transaction.begin();

      try {
        const requestSql = transaction.request();
        requestSql.input('userID', sql.Int, user.UserID);
        requestSql.input('total', sql.Decimal(10,2), total);
        requestSql.input('discount', sql.Decimal(10,2), discount || 0);
        requestSql.input('orderType', sql.NVarChar, 'wholesale');

        // Generate OrderNumber
        const orderNumber = `WH-${Date.now()}`;
        requestSql.input('orderNumber', sql.NVarChar(50), orderNumber);

        const orderQuery = `
          INSERT INTO Orders (UserID, OrderNumber, TotalAmount, DiscountAmount, OrderType, Status)
          OUTPUT INSERTED.OrderID
          VALUES (@userID, @orderNumber, @total, @discount, @orderType, 'processing')
        `;
        const orderResult = await requestSql.query(orderQuery);
        const orderID = orderResult.recordset[0].OrderID;

        // Insert order items and update stock
        for (const item of items) {
          // Find ProductID by SKU
          const productRequest = transaction.request();
          productRequest.input('sku', sql.NVarChar, item.sku);
          const productResult = await productRequest.query('SELECT ProductID FROM Products WHERE SKU = @sku');
          if (productResult.recordset.length === 0) throw new Error(`Product with SKU ${item.sku} not found`);
          const productID = productResult.recordset[0].ProductID;

          // Find VariantID by color/size if provided
          let variantID = null;
          if (item.color || item.size) {
            const variantRequest = transaction.request();
            variantRequest.input('productID', sql.Int, productID);
            variantRequest.input('color', sql.NVarChar, item.color || null);
            variantRequest.input('size', sql.NVarChar, item.size || null);
            const variantResult = await variantRequest.query(`
              SELECT VariantID FROM ProductVariants
              WHERE ProductID = @productID AND (Color = @color OR @color IS NULL) AND (Size = @size OR @size IS NULL)
            `);
            if (variantResult.recordset.length > 0) {
              variantID = variantResult.recordset[0].VariantID;
            }
          }

          const itemRequest = transaction.request();
          itemRequest.input('orderID', sql.Int, orderID);
          itemRequest.input('productID', sql.Int, productID);
          itemRequest.input('variantID', sql.Int, variantID);
          itemRequest.input('quantity', sql.Int, item.quantity);
          itemRequest.input('unitPrice', sql.Decimal(10,2), item.price);
          itemRequest.input('color', sql.NVarChar, item.color);
          itemRequest.input('size', sql.NVarChar, item.size);

          const itemQuery = `
            INSERT INTO OrderItems (OrderID, ProductID, VariantID, Quantity, UnitPrice, Color, Size)
            VALUES (@orderID, @productID, @variantID, @quantity, @unitPrice, @color, @size)
          `;
          await itemRequest.query(itemQuery);

          // Update stock - ProductVariants if variant, else Products
          if (variantID) {
            const stockRequest = transaction.request();
            stockRequest.input('variantID', sql.Int, variantID);
            stockRequest.input('quantity', sql.Int, item.quantity);
            await stockRequest.query(`
              UPDATE ProductVariants SET Stock = Stock - @quantity WHERE VariantID = @variantID AND Stock >= @quantity
            `);
          } else {
            const stockRequest = transaction.request();
            stockRequest.input('productID', sql.Int, productID);
            stockRequest.input('quantity', sql.Int, item.quantity);
            await stockRequest.query(`
              UPDATE Products SET Stock = Stock - @quantity WHERE ProductID = @productID AND Stock >= @quantity
            `);
          }
        }

        await transaction.commit();

        await pool.close();

        return NextResponse.json({ success: true, message: 'Order created', data: { orderID, orderNumber } });
      } catch (err) {
        await transaction.rollback();
        throw err;
      }
    } catch (error) {
      console.error('Error creating wholesale order:', error);
      return NextResponse.json({ success: false, message: 'Failed to create order' }, { status: 500 });
    }
  })(request);
}

export { GET, POST };
