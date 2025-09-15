import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';
import { sqlConfig } from '@/config/database';

export async function GET() {
  let pool: sql.ConnectionPool | null = null;

  try {
    pool = await sql.connect(sqlConfig);

    const result = await pool.request().query(`
      SELECT
        c.*,
        COUNT(p.ProductID) as ProductCount
      FROM Categories c
      LEFT JOIN Products p ON c.CategoryID = p.CategoryID AND p.IsActive = 1
      WHERE c.IsActive = 1
      GROUP BY c.CategoryID, c.CategoryName, c.ParentCategoryID, c.IsActive, c.CreatedAt
      ORDER BY c.CategoryName
    `);

    return NextResponse.json({
      success: true,
      data: result.recordset,
    });

  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch categories' },
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
    const { categoryName, description, parentCategoryId } = body;

    // Validation
    if (!categoryName) {
      return NextResponse.json(
        { success: false, message: 'Category name is required' },
        { status: 400 }
      );
    }

    pool = await sql.connect(sqlConfig);

    // Insert category
    const result = await pool.request()
      .input('categoryName', sql.NVarChar(255), categoryName)
      .input('description', sql.NVarChar(sql.MAX), description || '')
      .input('parentCategoryId', sql.Int, parentCategoryId || null)
      .query(`
        INSERT INTO Categories (CategoryName, Description, ParentCategoryID, IsActive, CreatedAt)
        OUTPUT INSERTED.CategoryID
        VALUES (@categoryName, @description, @parentCategoryId, 1, GETDATE())
      `);

    const categoryId = result.recordset[0].CategoryID;

    return NextResponse.json({
      success: true,
      message: 'Category added successfully',
      data: { categoryId }
    });

  } catch (error) {
    console.error('Add category error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to add category' },
      { status: 500 }
    );
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}
