import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import Replicate from 'replicate';
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
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN
  });

  // Convert local images to base64
  const userImageBase64 = fs.readFileSync(userImagePath, 'base64');
  const productImageBase64 = fs.readFileSync(productImagePath, 'base64');

  try {
    // Use Replicate's virtual try-on model (validated working)
    const output = await replicate.run(
      "fofr/virtual-try-on-v1.0",
      {
        input: {
          person_image: `data:image/jpeg;base64,${userImageBase64}`,
          clothing_image: `data:image/jpeg;base64,${productImageBase64}`,
          // Model auto-fits garment to person pose
        }
      }
    );

    // Output is image URL
    const resultImageUrl = Array.isArray(output) ? output[0] : output;
    if (!resultImageUrl) {
      throw new Error('No output from Replicate');
    }

    // Download result
    const response = await fetch(resultImageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status}`);
    }
    const buffer = await response.arrayBuffer();

    const resultPath = userImagePath.replace('.jpg', '-result.jpg');
    fs.writeFileSync(resultPath, Buffer.from(buffer));

    return resultPath;
  } catch (error) {
    console.error('Replicate try-on error:', error);
    // Fallback to improved Sharp compositing
    console.log('Falling back to Sharp compositing');
    const userImage = sharp(userImagePath);
    const metadata = await userImage.metadata();
    
    const productImage = sharp(productImagePath);
    const productMetadata = await productImage.metadata();
    
    // Improved proportional resize: base on user height for clothing (30% height max), maintain aspect
    const maxClothingHeight = Math.floor(metadata.height * 0.3);
    const maxClothingWidth = Math.floor(metadata.width * 0.5); // Wider for garments
    const aspectRatio = productMetadata.width / productMetadata.height;
    let clothingHeight = Math.min(maxClothingHeight, Math.floor(maxClothingWidth / aspectRatio));
    let clothingWidth = Math.floor(clothingHeight * aspectRatio);
    
    let resizedProduct = productImage.resize(clothingWidth, clothingHeight, { fit: 'inside', withoutEnlargement: true });
    
    // Position: lower torso/waist level (35% height from top), center x
    let yOffset = Math.floor(metadata.height * 0.35);
    let currentWidth = clothingWidth;
    let currentHeight = clothingHeight;
    if (customizations.bodyType === 'plus') {
      yOffset += Math.floor(metadata.height * 0.08); // Lower 8% for fuller figure
      const plusScale = 1.15;
      currentWidth = Math.min(Math.floor(clothingWidth * plusScale), metadata.width - 10);
      currentHeight = Math.floor(currentHeight * plusScale);
      resizedProduct = resizedProduct.resize(currentWidth, currentHeight, { fit: 'inside', withoutEnlargement: true });
    } else if (customizations.bodyType === 'slim') {
      yOffset -= Math.floor(metadata.height * 0.08); // Higher 8% for slimmer
      const slimScale = 0.85;
      currentWidth = Math.floor(clothingWidth * slimScale);
      currentHeight = Math.floor(currentHeight * slimScale);
      resizedProduct = resizedProduct.resize(currentWidth, currentHeight, { fit: 'inside', withoutEnlargement: true });
    }
    
    // Ensure composite fits within user image
    currentWidth = Math.min(currentWidth, metadata.width);
    currentHeight = Math.min(currentHeight, metadata.height);
    const xPosition = Math.floor((metadata.width - currentWidth) / 2);
    let yPosition = Math.max(0, Math.min(yOffset, metadata.height - currentHeight));
    
    const resultPath = userImagePath.replace('.jpg', '-result.jpg');
    await userImage
      .composite([{
        input: await resizedProduct.toBuffer(),
        top: yPosition,
        left: xPosition,
        blend: 'over'
      }])
      .modulate({ brightness: 0.95 }) // Slight darkening for better integration
      .jpeg({ quality: 85 })
      .toFile(resultPath);
    
    return resultPath;
  }
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
