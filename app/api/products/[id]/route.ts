import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';
import { sqlConfig } from '@/config/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  let pool: sql.ConnectionPool | null = null;

  try {
    pool = await sql.connect(sqlConfig);

    // Get product details
    const productResult = await pool.request()
      .input('productID', sql.Int, parseInt(id))
      .query(`
        SELECT
          p.*,
          c.CategoryName
        FROM Products p
        LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
        WHERE p.ProductID = @productID AND p.IsActive = 1
      `);

    if (productResult.recordset.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    const product = productResult.recordset[0];

    // Get product variants
    const variantsResult = await pool.request()
      .input('productID', sql.Int, parseInt(id))
      .query(`
        SELECT *
        FROM ProductVariants
        WHERE ProductID = @productID AND IsActive = 1
        ORDER BY Size, Color
      `);

    // Get product images
    const imagesResult = await pool.request()
      .input('productID', sql.Int, parseInt(id))
      .query(`
        SELECT *
        FROM ProductImages
        WHERE ProductID = @productID
        ORDER BY IsPrimary DESC, DisplayOrder
      `);

    // Get product ratings summary
    const ratingsResult = await pool.request()
      .input('productID', sql.Int, parseInt(id))
      .query(`
        SELECT
          AVG(CAST(Rating AS FLOAT)) AS AverageRating,
          COUNT(*) AS RatingCount
        FROM ProductRatings
        WHERE ProductID = @productID
      `);

    const ratingsData = ratingsResult.recordset[0];

    return NextResponse.json({
      success: true,
      data: {
        ...product,
        variants: variantsResult.recordset,
        images: imagesResult.recordset,
        averageRating: ratingsData.AverageRating ? parseFloat(ratingsData.AverageRating.toFixed(2)) : 0,
        ratingCount: ratingsData.RatingCount || 0,
      },
    });

  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch product' },
      { status: 500 }
    );
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}
