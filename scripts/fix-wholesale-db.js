require('dotenv').config();
const sql = require('mssql');
const { sqlConfig } = require('../config/database');

async function fixDB() {
  try {
    const pool = await sql.connect(sqlConfig);
    const request = pool.request();

    await request.query('USE SriLankanEcommerce;');

    // Drop FK if exists
    await request.query(`
      IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK__WholesaleTieredPricing__WholesaleProductID')
      ALTER TABLE WholesaleTieredPricing DROP CONSTRAINT FK__WholesaleTieredPricing__WholesaleProductID;
    `);

    // Alter column to ProductID
    await request.query(`
      ALTER TABLE WholesaleTieredPricing ALTER COLUMN WholesaleProductID INT;
    `);

    // Add FK to Products
    await request.query(`
      ALTER TABLE WholesaleTieredPricing ADD CONSTRAINT FK_WholesaleTieredPricing_ProductID FOREIGN KEY (WholesaleProductID) REFERENCES Products(ProductID);
    `);

    // Rename column to ProductID
    await request.query(`
      EXEC sp_rename 'WholesaleTieredPricing.WholesaleProductID', 'ProductID', 'COLUMN';
    `);

    // Update sample data if needed (assume existing data is for WholesaleProducts, but since sample, drop and reinsert for Products 1-3)
    await request.query(`
      DELETE FROM WholesaleTieredPricing;
    `);

    await request.query(`
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

    console.log('WholesaleTieredPricing fixed to use ProductID.');
  } catch (err) {
    console.error('Error fixing DB:', err);
  } finally {
    await sql.close();
  }
}

fixDB();
