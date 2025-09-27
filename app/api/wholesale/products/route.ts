import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';
import { sqlConfig } from '@/config/database';

export async function GET(request: NextRequest) {
  try {
    const pool = await sql.connect(sqlConfig);

    // Query to get products with category, primary image, total stock
    const productQuery = `
      SELECT
        p.ProductID as id,
        p.ProductName as name,
        p.SKU as sku,
        c.CategoryName as category,
        p.BasePrice as retailPrice,
        ISNULL(p.WholesalePrice, p.BasePrice) as wholesalePrice,
        10 as minOrderQty,
        ISNULL(SUM(pv.Stock), 0) as stock,
        (SELECT TOP 1 pi.ImageURL FROM ProductImages pi WHERE pi.ProductID = p.ProductID AND pi.IsPrimary = 1) as image
      FROM Products p
      LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
      LEFT JOIN ProductVariants pv ON p.ProductID = pv.ProductID
      WHERE p.IsActive = 1
      GROUP BY p.ProductID, p.ProductName, p.SKU, c.CategoryName, p.BasePrice, p.WholesalePrice, p.CreatedAt
      HAVING ISNULL(SUM(pv.Stock), 0) > 0
      ORDER BY p.CreatedAt DESC
    `;

    const productResult = await pool.request().query(productQuery);

    const products = [];
    for (const row of productResult.recordset) {
      products.push({
        id: row.id,
        name: row.name,
        sku: row.sku,
        category: row.category,
        retailPrice: parseFloat(row.retailPrice),
        wholesalePrice: parseFloat(row.wholesalePrice),
        minOrderQty: row.minOrderQty,
        stock: parseInt(row.stock),
        image: row.image || '/placeholder.svg',
        pricing: []
      });
    }

    await pool.close();

    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error('Error fetching wholesale products:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch products' }, { status: 500 });
  }
}
