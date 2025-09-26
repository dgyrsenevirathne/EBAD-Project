require('dotenv').config();

const sql = require('mssql');
const fs = require('fs');
const path = require('path');

const { sqlConfig } = require('../config/database.js');

async function runMigration() {
  try {
    console.log('Connecting to database...');
    await sql.connect(sqlConfig);
    console.log('Connected successfully.');

    const sqlPath = path.join(__dirname, '11-create-tryon-sessions.sql');
    const sqlScript = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Executing migration script...');
    const result = await sql.query(sqlScript);
    console.log('Migration executed successfully:', result);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await sql.close();
    console.log('Database connection closed.');
  }
}

runMigration();
