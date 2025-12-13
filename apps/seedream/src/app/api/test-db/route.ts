import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@repo/database'

export async function GET() {
  try {
    // Test Supabase connection by querying users table
    const supabase = createServerSupabaseClient()
    
    const { data: users, error, count } = await supabase
      .from('users')
      .select('id, username, created_at', { count: 'exact' })
      .limit(1)
    
    if (error) {
      console.error('Database connection error:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        details: error 
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      userCount: count,
      sampleUser: users?.[0] || null,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'not found'
    })
  } catch (error: any) {
    console.error('API route error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

export async function POST() {
  return GET() // Same test for POST requests
}