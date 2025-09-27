import { NextResponse } from 'next/server';
import sql from 'mssql';
import { sqlConfig } from '@/config/database';
import { getPool } from '@/lib/database';

export async function GET() {
  let pool: sql.ConnectionPool | null = null;

  try {
    pool = await getPool();

    const result = await pool.request().query(`
      SELECT TOP 12
        p.*,
        c.CategoryName,
        pi.ImageURL as PrimaryImage,
        (SELECT SUM(pv.Stock) FROM ProductVariants pv WHERE pv.ProductID = p.ProductID AND pv.IsActive = 1) as TotalStock
      FROM Products p
      LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
      LEFT JOIN ProductImages pi ON p.ProductID = pi.ProductID AND pi.IsPrimary = 1
      WHERE p.IsFeatured = 1 AND p.IsActive = 1
      ORDER BY p.CreatedAt DESC
    `);

    return NextResponse.json({
      success: true,
      data: result.recordset,
    });

  } catch (error) {
    console.error('Get featured products error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch featured products' },
      { status: 500 }
    );
  }
}
