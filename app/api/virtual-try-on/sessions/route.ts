import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    // In a real implementation, you would fetch from your database
    // For now, return mock data
    const mockSessions = [
      {
        id: 'vto_1234567890_abc123def',
        productId: 1,
        userImage: '/api/placeholder/300/400',
        resultImage: '/api/placeholder/300/400',
        status: 'completed',
        createdAt: '2024-01-15T10:30:00Z'
      },
      {
        id: 'vto_1234567891_ghi456jkl',
        productId: 2,
        userImage: '/api/placeholder/300/400',
        resultImage: null,
        status: 'processing',
        createdAt: '2024-01-15T11:00:00Z'
      }
    ]

    return NextResponse.json({
      success: true,
      data: mockSessions
    })

  } catch (error) {
    console.error('Get sessions error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
