import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@repo/database'

export async function GET() {
  try {
    // Get users with password_hash info from V1 database
    const supabase = createServerSupabaseClient()
    
    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, password_hash, created_at, last_login')
      .order('last_login', { ascending: false, nullsFirst: false })

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    // Check password hash status for each user
    const passwordStatus = users?.map(user => ({
      username: user.username,
      hasPasswordHash: !!user.password_hash,
      passwordHashLength: user.password_hash?.length || 0,
      isBcryptHash: user.password_hash?.startsWith('$2b$') || user.password_hash?.startsWith('$2a$'),
      lastLogin: user.last_login,
      createdAt: user.created_at
    })) || []

    return NextResponse.json({ 
      passwordStatus,
      summary: {
        totalUsers: users?.length || 0,
        usersWithPasswords: passwordStatus.filter(u => u.hasPasswordHash).length,
        usersWithBcryptHashes: passwordStatus.filter(u => u.isBcryptHash).length
      }
    })
  } catch (error) {
    console.error('Password check API error:', error)
    return NextResponse.json(
      { error: 'Database connection failed' },
      { status: 500 }
    )
  }
}