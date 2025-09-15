import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import sql from 'mssql';
import { sqlConfig } from '@/config/database';

export async function POST(request: Request) {
  let pool: sql.ConnectionPool | null = null;
  
  try {
    // Create a new connection pool
    pool = await new sql.ConnectionPool(sqlConfig).connect();
    
    const { email, password, firstName, lastName, phone, userType } = await request.json();

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !phone) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user exists
    const checkUser = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT Email FROM Users WHERE Email = @email');

    if (checkUser.recordset.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Insert new user
    const userResult = await pool.request()
      .input('email', sql.VarChar, email)
      .input('phone', sql.VarChar, phone)
      .input('password', sql.VarChar, hashedPassword)
      .input('firstName', sql.VarChar, firstName)
      .input('lastName', sql.VarChar, lastName)
      .input('userType', sql.VarChar, userType || 'customer')
      .query(`
        INSERT INTO Users (
          Email, Phone, Password, FirstName, LastName, UserType,
          IsActive, CreatedAt, UpdatedAt
        )
        OUTPUT INSERTED.UserID
        VALUES (
          @email, @phone, @password, @firstName, @lastName, @userType,
          1, GETDATE(), GETDATE()
        )
      `);

    const userId = userResult.recordset[0].UserID;

    // Initialize loyalty program with 100 welcome points
    await pool.request()
      .input('userId', sql.Int, userId)
      .input('initialPoints', sql.Int, 100)
      .query(`
        INSERT INTO LoyaltyProgram (UserID, Points, TotalEarned, TotalSpent)
        VALUES (@userId, @initialPoints, @initialPoints, 0)
      `);

    // Record the initial points transaction
    await pool.request()
      .input('userId', sql.Int, userId)
      .input('points', sql.Int, 100)
      .input('transactionType', sql.NVarChar, 'registration')
      .input('description', sql.NVarChar, 'Welcome bonus points for new account')
      .query(`
        INSERT INTO LoyaltyTransactions (UserID, Points, TransactionType, Description)
        VALUES (@userId, @points, @transactionType, @description)
      `);

    return NextResponse.json(
      { success: true, message: 'Registration successful' },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}