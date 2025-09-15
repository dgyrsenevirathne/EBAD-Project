import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';
import { sqlConfig } from '@/config/database';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
  const sortBy = searchParams.get('sortBy') || 'created';
  const sortOrder = searchParams.get('sortOrder') || 'desc';

  let pool: sql.ConnectionPool | null = null;

  try {
    pool = await sql.connect(sqlConfig);

    const whereConditions: string[] = ['p.IsActive = 1'];
    const requestObj = pool.request();

    // Build WHERE conditions
    if (category) {
      whereConditions.push('p.CategoryID = @category');
      requestObj.input('category', sql.Int, parseInt(category));
    }

    if (minPrice) {
      whereConditions.push('p.BasePrice >= @minPrice');
      requestObj.input('minPrice', sql.Decimal(10, 2), parseFloat(minPrice));
    }

    if (maxPrice) {
      whereConditions.push('p.BasePrice <= @maxPrice');
      requestObj.input('maxPrice', sql.Decimal(10, 2), parseFloat(maxPrice));
    }

    if (search) {
      whereConditions.push('(p.ProductName LIKE @search OR p.Description LIKE @search)');
      requestObj.input('search', sql.NVarChar, `%${search}%`);
    }

    // Build ORDER BY clause
    let orderBy = 'p.CreatedAt DESC';
    switch (sortBy) {
      case 'name':
        orderBy = `p.ProductName ${sortOrder.toUpperCase()}`;
        break;
      case 'price':
        orderBy = `p.BasePrice ${sortOrder.toUpperCase()}`;
        break;
      case 'featured':
        orderBy = `p.IsFeatured DESC, p.CreatedAt ${sortOrder.toUpperCase()}`;
        break;
    }

    const offset = (page - 1) * limit;

    const query = `
      SELECT
        p.*,
        c.CategoryName,
        pi.ImageURL as PrimaryImage,
        (SELECT COUNT(*) FROM ProductVariants pv WHERE pv.ProductID = p.ProductID AND pv.IsActive = 1) as VariantCount,
        (SELECT SUM(pv.Stock) FROM ProductVariants pv WHERE pv.ProductID = p.ProductID AND pv.IsActive = 1) as TotalStock,
        (SELECT AVG(CAST(pr.Rating AS FLOAT)) FROM ProductRatings pr WHERE pr.ProductID = p.ProductID) as AverageRating,
        (SELECT COUNT(*) FROM ProductRatings pr WHERE pr.ProductID = p.ProductID) as RatingCount
      FROM Products p
      LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
      LEFT JOIN ProductImages pi ON p.ProductID = pi.ProductID AND pi.IsPrimary = 1
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY ${orderBy}
      OFFSET ${offset} ROWS
      FETCH NEXT ${limit} ROWS ONLY
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM Products p
      WHERE ${whereConditions.join(' AND ')}
    `;

    const [productsResult, countResult] = await Promise.all([
      requestObj.query(query),
      requestObj.query(countQuery)
    ]);

    const totalProducts = countResult.recordset[0].total;
    const totalPages = Math.ceil(totalProducts / limit);

    return NextResponse.json({
      success: true,
      data: {
        products: productsResult.recordset,
        pagination: {
          currentPage: page,
          totalPages,
          totalProducts,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });

  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch products' },
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
    const contentType = request.headers.get('content-type') || '';

    let productName: string;
    let description: string;
    let categoryId: number;
    let basePrice: number;
    let stock: number;
    let isFeatured: boolean;
    let imageUrl: string | null = null;
    let imageFile: File | null = null;

    if (contentType.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await request.formData();
      productName = formData.get('productName') as string;
      description = formData.get('description') as string;
      categoryId = parseInt(formData.get('categoryId') as string);
      basePrice = parseFloat(formData.get('basePrice') as string);
      stock = parseInt(formData.get('stock') as string) || 0;
      isFeatured = formData.get('isFeatured') === 'true';
      imageUrl = formData.get('imageUrl') as string || null;
      imageFile = formData.get('imageFile') as File || null;
    } else {
      // Handle JSON request
      const body = await request.json();
      productName = body.productName;
      description = body.description;
      categoryId = body.categoryId;
      basePrice = body.basePrice;
      stock = body.stock || 0;
      isFeatured = body.isFeatured || false;
      imageUrl = body.imageUrl || null;
    }

    // Validation
    if (!productName || !categoryId || !basePrice) {
      return NextResponse.json(
        { success: false, message: 'Product name, category, and base price are required' },
        { status: 400 }
      );
    }

    pool = await sql.connect(sqlConfig);

    // Generate unique SKU
    const sku = 'PROD-' + Math.random().toString(36).substr(2, 9).toUpperCase();

    // Insert product
    const result = await pool.request()
      .input('productName', sql.NVarChar(255), productName)
      .input('description', sql.NVarChar(sql.MAX), description || '')
      .input('categoryId', sql.Int, categoryId)
      .input('basePrice', sql.Decimal(10, 2), basePrice)
      .input('sku', sql.NVarChar(100), sku)
      .input('isFeatured', sql.Bit, isFeatured || false)
      .query(`
        INSERT INTO Products (ProductName, Description, CategoryID, BasePrice, SKU, IsFeatured, IsActive, CreatedAt)
        OUTPUT INSERTED.ProductID
        VALUES (@productName, @description, @categoryId, @basePrice, @sku, @isFeatured, 1, GETDATE())
      `);

    const productId = result.recordset[0].ProductID;

    // Insert default variant with stock
    const variantStock = stock || 0;
    const variantSku = sku + '-DEFAULT';
    await pool.request()
      .input('productId', sql.Int, productId)
      .input('stock', sql.Int, variantStock)
      .input('variantSku', sql.NVarChar(100), variantSku)
      .query(`
        INSERT INTO ProductVariants (ProductID, Stock, VariantSKU, IsActive)
        VALUES (@productId, @stock, @variantSku, 1)
      `);

    // Handle image
    if (imageFile) {
      // Handle file upload - save to public/uploads directory
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate unique filename
      const fileExtension = imageFile.name.split('.').pop();
      const fileName = `product-${productId}-${Date.now()}.${fileExtension}`;
      const filePath = `public/uploads/${fileName}`;

      // Save file to disk (you might want to use a cloud storage service in production)
      const fs = require('fs').promises;
      await fs.mkdir('public/uploads', { recursive: true });
      await fs.writeFile(filePath, buffer);

      // Store relative path in database
      const imagePath = `/uploads/${fileName}`;
      await pool.request()
        .input('productId', sql.Int, productId)
        .input('imageUrl', sql.NVarChar(500), imagePath)
        .query(`
          INSERT INTO ProductImages (ProductID, ImageURL, IsPrimary)
          VALUES (@productId, @imageUrl, 1)
        `);
    } else if (imageUrl) {
      // Handle URL
      await pool.request()
        .input('productId', sql.Int, productId)
        .input('imageUrl', sql.NVarChar(500), imageUrl)
        .query(`
          INSERT INTO ProductImages (ProductID, ImageURL, IsPrimary)
          VALUES (@productId, @imageUrl, 1)
        `);
    }

    return NextResponse.json({
      success: true,
      message: 'Product added successfully',
      data: { productId }
    });

  } catch (error) {
    console.error('Add product error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to add product' },
      { status: 500 }
    );
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}
