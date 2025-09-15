import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import sql from 'mssql';
import { sqlConfig } from '@/config/database';

export interface AuthUser {
  UserID: number;
  Email: string;
  UserType: string;
  FirstName: string;
  LastName: string;
}

export async function authenticateRequest(request: NextRequest): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
      email: string;
      userType: string;
    };

    // Verify user still exists and is active
    const pool = await sql.connect(sqlConfig);
    const result = await pool.request()
      .input('userID', sql.Int, decoded.userId)
      .query(`
        SELECT UserID, Email, UserType, FirstName, LastName, IsActive
        FROM Users
        WHERE UserID = @userID AND IsActive = 1
      `);

    if (result.recordset.length === 0) {
      return null;
    }

    const user = result.recordset[0];
    return {
      UserID: user.UserID,
      Email: user.Email,
      UserType: user.UserType,
      FirstName: user.FirstName,
      LastName: user.LastName,
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export function requireAuth(handler: (request: NextRequest, user: AuthUser) => Promise<Response>) {
  return async (request: NextRequest): Promise<Response> => {
    const user = await authenticateRequest(request);

    if (!user) {
      return Response.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    return handler(request, user);
  };
}

export function requireAdmin(handler: (request: NextRequest, user: AuthUser) => Promise<Response>) {
  return async (request: NextRequest): Promise<Response> => {
    const user = await authenticateRequest(request);

    if (!user) {
      return Response.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    if (user.UserType !== 'admin') {
      return Response.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    return handler(request, user);
  };
}

export function requireWholesale(handler: (request: NextRequest, user: AuthUser) => Promise<Response>) {
  return async (request: NextRequest): Promise<Response> => {
    const user = await authenticateRequest(request);

    if (!user) {
      return Response.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    if (user.UserType !== 'wholesale' && user.UserType !== 'admin') {
      return Response.json(
        { success: false, message: 'Wholesale access required' },
        { status: 403 }
      );
    }

    return handler(request, user);
  };
}
