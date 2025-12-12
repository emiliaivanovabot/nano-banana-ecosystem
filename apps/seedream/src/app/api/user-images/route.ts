import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@repo/database'

export async function GET(request: NextRequest) {
  try {
    // TODO: Replace with actual auth verification
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // TODO: Get user from auth token
    const userId = 'temp-user-id' // This will be replaced by api-builder specialist

    // Create database client
    const supabase = createServerSupabaseClient()

    // Fetch user's images
    const { data: images, error } = await supabase
      .from('seedream_generations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch images' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      images: images || []
    })

  } catch (error) {
    console.error('User images error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}