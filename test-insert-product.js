const sql = require('mssql');
const { sqlConfig } = require('./config/database'); // Adjust path if needed

async function insertTestProduct() {
  try {
    const pool = await sql.connect(sqlConfig);
    
    // Insert test product
    await pool.request()
      .input('name', sql.NVarChar(100), 'Test Saree')
      .input('price', sql.Decimal(10, 2), 2500.00)
      .input('category', sql.NVarChar(50), 'Traditional')
      .input('description', sql.NVarChar(sql.MAX), 'Test product for virtual try-on')
      .query(`
        INSERT INTO products (ProductName, BasePrice, CategoryName, Description)
        OUTPUT INSERTED.ProductID
        VALUES (@name, @price, @category, @description)
      `);
    
    // Insert primary image (assume public/uploads/test-saree.jpg exists or placeholder)
    const result = await pool.request()
      .input('productId', sql.Int, 1) // Assume ID 1; adjust if auto-increment
      .input('imageUrl', sql.NVarChar(500), '/uploads/test-saree.jpg')
      .input('isPrimary', sql.Bit, 1)
      .query(`
        INSERT INTO ProductImages (ProductID, ImageURL, IsPrimary)
        VALUES (@productId, @imageUrl, @isPrimary)
      `);
    
    console.log('Test product inserted successfully');
  } catch (error) {
    console.error('Error inserting test product:', error);
  } finally {
    sql.close();
  }
}

insertTestProduct();
