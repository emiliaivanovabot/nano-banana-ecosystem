import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createServerSupabaseClient } from '@repo/database'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { valid: false, error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Get user from V1 database using server-side client
    const supabase = createServerSupabaseClient()
    
    const { data: user, error } = await supabase
      .from('users')
      .select('password_hash')
      .eq('username', username)
      .eq('is_active', true)
      .single()

    if (error || !user) {
      console.log('User not found in database:', username)
      return NextResponse.json({ valid: false }, { status: 401 })
    }

    // Verify password with bcrypt
    const isValid = await bcrypt.compare(password, user.password_hash)

    return NextResponse.json({ valid: isValid })
  } catch (error) {
    console.error('Auth verification error:', error)
    return NextResponse.json(
      { valid: false, error: 'Authentication failed' },
      { status: 500 }
    )
  }
}