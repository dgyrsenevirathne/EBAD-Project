import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';
import { sqlConfig } from '@/config/database';

// POST /api/products/ratings
// Body: { productId: number, rating: number, review?: string }
// Requires user authentication (assumed to be via some auth middleware or token)
export async function POST(request: NextRequest) {
  let pool: sql.ConnectionPool | null = null;

  try {
    const body = await request.json();
    const { productId, rating, review } = body;

    if (!productId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: 'Invalid product ID or rating' },
        { status: 400 }
      );
    }

    // TODO: Replace with actual user ID from auth context/session
    // For now, assume user ID is passed in header for demonstration
    const userIdHeader = request.headers.get('x-user-id');
    if (!userIdHeader) {
      return NextResponse.json(
        { success: false, message: 'User not authenticated' },
        { status: 401 }
      );
    }
    const userId = parseInt(userIdHeader);
    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid user ID' },
        { status: 401 }
      );
    }

    pool = await sql.connect(sqlConfig);

    // Check if user already rated this product
    const existingRating = await pool.request()
      .input('userId', sql.Int, userId)
      .input('productId', sql.Int, productId)
      .query(`
        SELECT RatingID FROM ProductRatings
        WHERE UserID = @userId AND ProductID = @productId
      `);

    if (existingRating.recordset.length > 0) {
      // Update existing rating
      await pool.request()
        .input('ratingId', sql.Int, existingRating.recordset[0].RatingID)
        .input('rating', sql.Int, rating)
        .input('review', sql.NVarChar(sql.MAX), review || '')
        .query(`
          UPDATE ProductRatings
          SET Rating = @rating, Review = @review, UpdatedAt = GETDATE()
          WHERE RatingID = @ratingId
        `);
    } else {
      // Insert new rating
      await pool.request()
        .input('userId', sql.Int, userId)
        .input('productId', sql.Int, productId)
        .input('rating', sql.Int, rating)
        .input('review', sql.NVarChar(sql.MAX), review || '')
        .query(`
          INSERT INTO ProductRatings (UserID, ProductID, Rating, Review, CreatedAt, UpdatedAt)
          VALUES (@userId, @productId, @rating, @review, GETDATE(), GETDATE())
        `);
    }

    return NextResponse.json({ success: true, message: 'Rating saved successfully' });

  } catch (error) {
    console.error('Save product rating error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save rating' },
      { status: 500 }
    );
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

// GET /api/products/ratings?productId=123
// Returns average rating, count, and individual ratings for a product
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const productIdParam = url.searchParams.get('productId');
  if (!productIdParam) {
    return NextResponse.json(
      { success: false, message: 'Product ID is required' },
      { status: 400 }
    );
  }
  const productId = parseInt(productIdParam);
  if (isNaN(productId)) {
    return NextResponse.json(
      { success: false, message: 'Invalid product ID' },
      { status: 400 }
    );
  }

  let pool: sql.ConnectionPool | null = null;

  try {
    pool = await sql.connect(sqlConfig);

    // Get summary
    const summaryResult = await pool.request()
      .input('productId', sql.Int, productId)
      .query(`
        SELECT
          AVG(CAST(Rating AS FLOAT)) AS AverageRating,
          COUNT(*) AS RatingCount
        FROM ProductRatings
        WHERE ProductID = @productId
      `);

    // Get individual ratings with user info
    const ratingsResult = await pool.request()
      .input('productId', sql.Int, productId)
      .query(`
        SELECT
          pr.RatingID,
          pr.Rating,
          pr.Review,
          pr.CreatedAt,
          u.FirstName,
          u.LastName
        FROM ProductRatings pr
        JOIN Users u ON pr.UserID = u.UserID
        WHERE pr.ProductID = @productId
        ORDER BY pr.CreatedAt DESC
      `);

    const summary = summaryResult.recordset[0];
    const ratings = ratingsResult.recordset.map(r => ({
      id: r.RatingID,
      rating: r.Rating,
      review: r.Review,
      date: r.CreatedAt.toISOString().split('T')[0],
      name: `${r.FirstName} ${r.LastName}`,
    }));

    return NextResponse.json({
      success: true,
      data: {
        averageRating: summary.AverageRating ? parseFloat(summary.AverageRating.toFixed(2)) : 0,
        ratingCount: summary.RatingCount || 0,
        ratings: ratings,
      },
    });

  } catch (error) {
    console.error('Get product ratings error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch ratings' },
      { status: 500 }
    );
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}
