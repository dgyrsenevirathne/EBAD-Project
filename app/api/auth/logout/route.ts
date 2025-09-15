import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // Optional: verify token if needed, but since logout is client-side, just return success
    // For backend logout, could add token to blacklist, but for simplicity, just respond

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
