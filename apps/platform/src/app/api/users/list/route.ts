import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@repo/database'

export async function GET() {
  try {
    // Get all users from V1 database using server-side client
    const supabase = createServerSupabaseClient()
    
    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, created_at, last_login, is_active, email')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    return NextResponse.json({ users, count: users?.length || 0 })
  } catch (error) {
    console.error('Users API error:', error)
    return NextResponse.json(
      { error: 'Database connection failed' },
      { status: 500 }
    )
  }
}