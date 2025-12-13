import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@repo/database'

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    
    // For now, return mock stats since we don't have session management yet
    // In a full implementation, you'd get the user ID from the session
    
    // Get total generations count
    const { count: generationsCount, error: countError } = await supabase
      .from('generations')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.error('Error fetching generations count:', countError)
    }
    
    // Get recent generations
    const { data: recentGenerations, error: recentError } = await supabase
      .from('generations')
      .select('id, created_at, generation_type, status')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (recentError) {
      console.error('Error fetching recent generations:', recentError)
    }
    
    return NextResponse.json({
      generationsCount: generationsCount || 0,
      recentGenerations: recentGenerations || []
    })
  } catch (error: any) {
    console.error('User stats API error:', error)
    return NextResponse.json({ 
      error: error.message,
      generationsCount: 0,
      recentGenerations: []
    }, { status: 500 })
  }
}