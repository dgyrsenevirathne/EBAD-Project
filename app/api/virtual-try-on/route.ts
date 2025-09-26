import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import sql from 'mssql';
import { sqlConfig } from '@/config/database';
import { requireAuth, AuthUser } from '@/lib/auth';

async function connectToDB() {
  const pool = await sql.connect(sqlConfig);
  return pool;
}

async function getProductImage(productId: number): Promise<string | null> {
  const pool = await connectToDB();
  try {
    const result = await pool.request()
      .input('productId', sql.Int, productId)
      .query(`
        SELECT pi.ImageURL
        FROM products p
        LEFT JOIN ProductImages pi ON p.ProductID = pi.ProductID AND pi.IsPrimary = 1
        WHERE p.ProductID = @productId
      `);

    if (result.recordset.length > 0 && result.recordset[0].ImageURL) {
      return path.join(process.cwd(), 'public', result.recordset[0].ImageURL);
    }
    return null;
  } finally {
    await pool.close();
  }
}

async function processTryOn(
  userImagePath: string,
  productImagePath: string,
  customizations: any
): Promise<string> {
  const userImage = sharp(userImagePath);
  const metadata = await userImage.metadata();
  
  const productImage = sharp(productImagePath);
  const productMetadata = await productImage.metadata();
  
  // Resize product to suitable size (e.g., 200px width, maintain aspect)
  const resizedProduct = productImage.resize(200, null, { fit: 'inside' });
  
  // Calculate position: center horizontally, torso vertically (adjust for body type)
  let yOffset = Math.floor(metadata.height * 0.3); // Start at 30% from top
  if (customizations.bodyType === 'plus') {
    yOffset += 30; // Slightly lower for plus size
  } else if (customizations.bodyType === 'slim') {
    yOffset -= 20; // Slightly higher for slim
  }
  
  const xPosition = Math.floor((metadata.width - 200) / 2);
  let yPosition = Math.max(0, yOffset);
  
  // Composite: overlay product on user image
  const resultPath = userImagePath.replace('.jpg', '-result.jpg');
  await userImage
    .composite([{
      input: await resizedProduct.toBuffer(),
      top: yPosition,
      left: xPosition
    }])
    .jpeg({ quality: 80 })
    .toFile(resultPath);
  
  return resultPath;
}

export async function POST(request: NextRequest) {
  return requireAuth(async (request: NextRequest, user: AuthUser) => {
    try {
      const body = await request.json();
      const { productId, userImage, customizations } = body;

      if (!productId || !userImage || !customizations) {
        return NextResponse.json(
          { success: false, message: 'Missing required fields' },
          { status: 400 }
        );
      }

      // Validate base64 image
      if (!userImage.startsWith('data:image/')) {
        return NextResponse.json(
          { success: false, message: 'Invalid image format' },
          { status: 400 }
        );
      }

      const sessionId = uuidv4();
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'tryon', sessionId);
      fs.mkdirSync(uploadsDir, { recursive: true });

      // Save user image from base64
      const base64Data = userImage.replace(/^data:image\/\w+;base64,/, '');
      const userImagePath = path.join(uploadsDir, 'user.jpg');
      fs.writeFileSync(userImagePath, base64Data, 'base64');

      // Get product image path
      const productImagePath = await getProductImage(productId);
      if (!productImagePath || !fs.existsSync(productImagePath)) {
        // Cleanup
        fs.rmSync(uploadsDir, { recursive: true });
        return NextResponse.json(
          { success: false, message: 'Product image not found' },
          { status: 404 }
        );
      }

      // Process try-on
      const resultImagePath = await processTryOn(
        userImagePath,
        productImagePath,
        customizations
      );

      // Save to DB
      const pool = await connectToDB();
      try {
        await pool.request()
          .input('id', sql.UniqueIdentifier, sessionId)
          .input('userId', sql.Int, user.UserID)
          .input('productId', sql.Int, productId)
          .input('userImagePath', sql.NVarChar(500), `/uploads/tryon/${sessionId}/user.jpg`)
          .input('resultImagePath', sql.NVarChar(500), `/uploads/tryon/${sessionId}/user-result.jpg`)
          .input('customizations', sql.NVarChar(sql.MAX), JSON.stringify(customizations))
          .query(`
            INSERT INTO try_on_sessions 
            (id, user_id, product_id, user_image_path, result_image_path, status, customizations)
            VALUES (@id, @userId, @productId, @userImagePath, @resultImagePath, 'completed', @customizations)
          `);
      } finally {
        await pool.close();
      }

      return NextResponse.json({
        success: true,
        data: { sessionId }
      });

    } catch (error) {
      console.error('Virtual try-on error:', error);
      return NextResponse.json(
        { success: false, message: 'Internal server error' },
        { status: 500 }
      );
    }
  })(request);
}
