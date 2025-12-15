import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@repo/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    console.log('🖼️ Gallery API called:', { username, limit, offset })

    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from('generations')
      .select('*')
      .eq('username', username)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error loading recent images:', error)
      return NextResponse.json(
        { error: 'Failed to load recent images' },
        { status: 500 }
      )
    }

    return NextResponse.json({ images: data || [] })
  } catch (error) {
    console.error('Recent images API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}