import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';
import { sqlConfig } from '@/config/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  let pool: sql.ConnectionPool | null = null;
  const maxRetries = 3;
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
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
          ORDER BY IsPrimary DESC
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
      console.error(`Get product error (attempt ${attempt}/${maxRetries}):`, error);
      lastError = error;

      // Close the pool if it exists
      if (pool) {
        try {
          await pool.close();
        } catch (closeError) {
          console.error('Error closing pool:', closeError);
        }
        pool = null;
      }

      // If this is not the last attempt, wait before retrying
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
      }
    }
  }

  // All retries failed
  console.error('All retry attempts failed:', lastError);
  return NextResponse.json(
    { success: false, message: 'Failed to fetch product after multiple attempts' },
    { status: 500 }
  );
}
