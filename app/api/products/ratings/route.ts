import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';
import { sqlConfig } from '@/config/database';

const MAX_REVIEW_LENGTH = 1000;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');

  if (!productId) {
    return NextResponse.json(
      { success: false, message: 'Product ID is required' },
      { status: 400 }
    );
  }

  let pool: sql.ConnectionPool | null = null;

  try {
    pool = await sql.connect(sqlConfig);

    // Fetch all ratings and reviews for the product
    const ratingsResult = await pool.request()
      .input('productId', sql.Int, parseInt(productId))
      .query(`
        SELECT
          pr.RatingID,
          pr.UserID,
          pr.ProductID,
          pr.Rating,
          pr.Review,
          pr.CreatedAt,
          pr.UpdatedAt
        FROM ProductRatings pr
        LEFT JOIN Users u ON pr.UserID = u.UserID
        WHERE pr.ProductID = @productId
        ORDER BY pr.CreatedAt DESC
      `);

    // Calculate average rating
    const avgResult = await pool.request()
      .input('productId', sql.Int, parseInt(productId))
      .query(`
        SELECT AVG(CAST(Rating AS FLOAT)) AS AverageRating
        FROM ProductRatings
        WHERE ProductID = @productId
      `);

    const averageRating = avgResult.recordset[0].AverageRating || 0;

    return NextResponse.json({
      success: true,
      data: {
        ratings: ratingsResult.recordset,
        averageRating: parseFloat(averageRating.toFixed(2)),
        totalRatings: ratingsResult.recordset.length,
      },
    });
  } catch (error) {
    console.error('Get product ratings error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch product ratings' },
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
    const { userId, productId, rating, review } = body;

    // Validate inputs
    if (!userId || !productId || !rating) {
      return NextResponse.json(
        { success: false, message: 'User ID, Product ID, and rating are required' },
        { status: 400 }
      );
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: 'Rating must be a number between 1 and 5' },
        { status: 400 }
      );
    }

    if (review && review.length > MAX_REVIEW_LENGTH) {
      return NextResponse.json(
        { success: false, message: `Review must be at most ${MAX_REVIEW_LENGTH} characters` },
        { status: 400 }
      );
    }

    pool = await sql.connect(sqlConfig);

    // Check if rating by this user for this product exists
    const existingResult = await pool.request()
      .input('userId', sql.Int, userId)
      .input('productId', sql.Int, productId)
      .query(`
        SELECT RatingID FROM ProductRatings
        WHERE UserID = @userId AND ProductID = @productId
      `);

    if (existingResult.recordset.length > 0) {
      // Update existing rating
      const ratingId = existingResult.recordset[0].RatingID;
      await pool.request()
        .input('ratingId', sql.Int, ratingId)
        .input('rating', sql.Int, rating)
        .input('review', sql.NVarChar(sql.MAX), review || null)
        .query(`
          UPDATE ProductRatings
          SET Rating = @rating,
              Review = @review,
              UpdatedAt = GETDATE()
          WHERE RatingID = @ratingId
        `);

      return NextResponse.json({
        success: true,
        message: 'Product rating updated successfully',
      });
    } else {
      // Insert new rating
      await pool.request()
        .input('userId', sql.Int, userId)
        .input('productId', sql.Int, productId)
        .input('rating', sql.Int, rating)
        .input('review', sql.NVarChar(sql.MAX), review || null)
        .query(`
          INSERT INTO ProductRatings (UserID, ProductID, Rating, Review, CreatedAt, UpdatedAt)
          VALUES (@userId, @productId, @rating, @review, GETDATE(), GETDATE())
        `);

      return NextResponse.json({
        success: true,
        message: 'Product rating submitted successfully',
      });
    }
  } catch (error) {
    console.error('Submit product rating error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit product rating' },
      { status: 500 }
    );
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}
