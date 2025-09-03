import { NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import sql from 'mssql';
import { sqlConfig } from '@/config/database';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  let pool: sql.ConnectionPool | null = null;

  try {
    const { email, password } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create connection pool
    pool = await new sql.ConnectionPool(sqlConfig).connect();

    // Find user
    const result = await pool.request()
      .input('email', sql.VarChar, email)
      .query(`
        SELECT UserID, Email, Password, FirstName, LastName, UserType, IsActive
        FROM Users 
        WHERE Email = @email AND IsActive = 1
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const user = result.recordset[0];

    // Verify password
    const isValidPassword = await compare(password, user.Password);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.UserID,
        email: user.Email,
        userType: user.UserType 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.UserID,
          email: user.Email,
          firstName: user.FirstName,
          lastName: user.LastName,
          userType: user.UserType,
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
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