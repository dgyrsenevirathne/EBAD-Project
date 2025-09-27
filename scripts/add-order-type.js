require('dotenv').config();
const sql = require('mssql');
const { sqlConfig } = require('../config/database');

async function addOrderType() {
  try {
    const pool = await sql.connect(sqlConfig);
    const request = pool.request();

    await request.query('USE SriLankanEcommerce;');

    // Add OrderType to Orders if not exists
    await request.query(`
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Orders') AND name = 'OrderType')
      ALTER TABLE Orders ADD OrderType NVARCHAR(20) DEFAULT 'retail';
    `);

    console.log('OrderType column added to Orders.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await sql.close();
  }
}

addOrderType();
