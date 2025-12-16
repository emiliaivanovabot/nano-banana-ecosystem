import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createServerSupabaseClient } from '@repo/database'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { user: null, error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Get user from V1 database using server-side client (bypasses RLS)
    const supabase = createServerSupabaseClient()
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('is_active', true)
      .single()

    if (error || !user) {
      console.log('User not found in database:', username)
      
      // Fallback to environment login users for development/testing
      const loginUsersEnv = process.env.NEXT_PUBLIC_LOGIN_USERS || process.env.VITE_LOGIN_USERS
      if (loginUsersEnv) {
        try {
          const loginUsers = JSON.parse(loginUsersEnv)
          const foundUser = loginUsers.find((u: any) => 
            u.username === username && u.password === password
          )
          
          if (foundUser) {
            const fallbackUser = {
              id: foundUser.modelId || foundUser.username,
              username: foundUser.username,
              password_hash: '',
              email: foundUser.username + '@nano-banana.local',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              subscription_level: 'premium' as const,
              credits_remaining: 1000,
              use_personalization: false,
              use_personal_appearance_text: false
            }
            
            return NextResponse.json({ user: fallbackUser, error: null })
          }
        } catch (e) {
          console.error('Fallback auth error:', e)
        }
      }
      
      return NextResponse.json(
        { user: null, error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    // Verify password with bcrypt
    const isValid = await bcrypt.compare(password, user.password_hash)

    if (!isValid) {
      return NextResponse.json(
        { user: null, error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id)

    // Remove password_hash before sending to client
    const { password_hash, ...userWithoutPassword } = user

    return NextResponse.json({ user: userWithoutPassword, error: null })
  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json(
      { user: null, error: 'Authentication failed' },
      { status: 500 }
    )
  }
}