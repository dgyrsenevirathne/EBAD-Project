require('dotenv').config();
const sql = require('mssql');
const { sqlConfig } = require('../config/database');

async function checkSchema() {
  try {
    const pool = await sql.connect(sqlConfig);
    const request = pool.request();

    // List tables
    const tablesResult = await request.query('SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = \'BASE TABLE\';');
    console.log('Tables:', tablesResult.recordset.map(r => r.TABLE_NAME));

    // Check Products columns
    const productsColumns = await request.query('SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = \'Products\';');
    console.log('Products columns:', productsColumns.recordset.map(r => r.COLUMN_NAME));

    // Check if WholesaleTieredPricing exists
    const wholesaleColumns = await request.query('SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = \'WholesaleTieredPricing\';');
    console.log('WholesaleTieredPricing columns:', wholesaleColumns.recordset.map(r => r.COLUMN_NAME));

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await sql.close();
  }
}

checkSchema();
