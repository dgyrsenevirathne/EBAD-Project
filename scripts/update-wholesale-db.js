require('dotenv').config();
const sql = require('mssql');
const { sqlConfig } = require('../config/database');

async function updateDB() {
  try {
    const pool = await sql.connect(sqlConfig);
    const request = pool.request();

    await request.query('USE SriLankanEcommerce;');

    // Add Stock to Products if not exists
    await request.query(`
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Products') AND name = 'Stock')
      ALTER TABLE Products ADD Stock INT DEFAULT 0;
    `);

    // Create WholesaleTieredPricing if not exists
    await request.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='WholesaleTieredPricing' AND xtype='U')
      CREATE TABLE WholesaleTieredPricing (
        TierID INT IDENTITY(1,1) PRIMARY KEY,
        ProductID INT FOREIGN KEY REFERENCES Products(ProductID),
        MinQty INT NOT NULL,
        MaxQty INT NULL,
        Price DECIMAL(10,2) NOT NULL,
        Discount NVARCHAR(20) NOT NULL,
        CreatedAt DATETIME DEFAULT GETDATE()
      );
    `);

    // Create WholesaleInquiries if not exists
    await request.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='WholesaleInquiries' AND xtype='U')
      CREATE TABLE WholesaleInquiries (
        InquiryID INT IDENTITY(1,1) PRIMARY KEY,
        CompanyName NVARCHAR(255) NOT NULL,
        ContactPerson NVARCHAR(255) NOT NULL,
        Email NVARCHAR(255) NOT NULL,
        Phone NVARCHAR(50) NOT NULL,
        BusinessType NVARCHAR(100) NULL,
        ExpectedVolume NVARCHAR(100) NULL,
        Message NTEXT,
        Status NVARCHAR(20) DEFAULT 'pending',
        InquiryDate DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
      );
    `);

    // Add Color and Size to OrderItems if not exists
    await request.query(`
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('OrderItems') AND name = 'Color')
      ALTER TABLE OrderItems ADD Color NVARCHAR(50) NULL;
    `);
    await request.query(`
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('OrderItems') AND name = 'Size')
      ALTER TABLE OrderItems ADD Size NVARCHAR(50) NULL;
    `);

    // Insert sample tiers (assume ProductIDs 1,2,3 exist)
    await request.query(`
      IF NOT EXISTS (SELECT * FROM WholesaleTieredPricing WHERE ProductID = 1 AND MinQty = 10)
      INSERT INTO WholesaleTieredPricing (ProductID, MinQty, MaxQty, Price, Discount) VALUES
      (1, 10, 49, 10000.00, '20%'),
      (1, 50, 99, 9375.00, '25%'),
      (1, 100, NULL, 8750.00, '30%'),
      (2, 20, 49, 2800.00, '20%'),
      (2, 50, 99, 2625.00, '25%'),
      (2, 100, NULL, 2450.00, '30%'),
      (3, 25, 49, 2240.00, '20%'),
      (3, 50, 99, 2100.00, '25%'),
      (3, 100, NULL, 1960.00, '30%');
    `);

    console.log('Wholesale DB updates completed successfully.');
  } catch (err) {
    console.error('Error updating DB:', err);
  } finally {
    await sql.close();
  }
}

updateDB();
