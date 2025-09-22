import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await authenticateRequest(request)

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    const sessionId = params.id

    // In a real implementation, you would fetch from your database
    // For now, return mock data based on session ID
    const mockSession = {
      id: sessionId,
      productId: 1,
      userImage: '/api/placeholder/300/400',
      resultImage: sessionId.includes('completed') ? '/api/placeholder/300/400' : null,
      status: sessionId.includes('processing') ? 'processing' :
              sessionId.includes('failed') ? 'failed' : 'completed',
      createdAt: '2024-01-15T10:30:00Z',
      customization: {
        bodyType: 'regular',
        skinTone: 'medium',
        showAccessories: true,
        autoAdjustSize: true
      }
    }

    return NextResponse.json({
      success: true,
      data: mockSession
    })

  } catch (error) {
    console.error('Get session error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
