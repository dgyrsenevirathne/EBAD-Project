import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';
import { sqlConfig } from '@/config/database';

export async function GET(request: NextRequest) {
  let pool: sql.ConnectionPool | null = null;

  try {
    pool = await sql.connect(sqlConfig);

    // Query to get wholesale products with tiered pricing and stock info
    const query = `
      SELECT
        wp.WholesaleProductID,
        wp.ProductName,
        wp.SKU,
        wp.Category,
        wp.BasePrice,
        wp.MinOrderQty,
        wp.Stock,
        wp.ImageURL,
        wt.MinQty,
        wt.MaxQty,
        wt.Price,
        wt.Discount
      FROM WholesaleProducts wp
      LEFT JOIN WholesaleTieredPricing wt ON wp.WholesaleProductID = wt.WholesaleProductID
      WHERE wp.IsActive = 1
      ORDER BY wp.ProductName, wt.MinQty
    `;

    const result = await pool.request().query(query);

    // Transform result to group tiered pricing by product
    const productsMap = new Map();

    for (const row of result.recordset) {
      if (!productsMap.has(row.WholesaleProductID)) {
        productsMap.set(row.WholesaleProductID, {
          id: row.WholesaleProductID,
          name: row.ProductName,
          sku: row.SKU,
          category: row.Category,
          basePrice: row.BasePrice,
          minOrderQty: row.MinOrderQty,
          stock: row.Stock,
          image: row.ImageURL,
          pricing: [],
        });
      }
      if (row.MinQty !== null) {
        productsMap.get(row.WholesaleProductID).pricing.push({
          minQty: row.MinQty,
          maxQty: row.MaxQty,
          price: row.Price,
          discount: row.Discount,
        });
      }
    }

    const products = Array.from(productsMap.values());

    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error('Get wholesale products error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch wholesale products' },
      { status: 500 }
    );
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}
