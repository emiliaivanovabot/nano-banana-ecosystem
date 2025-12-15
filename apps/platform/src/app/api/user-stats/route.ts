import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@repo/database'

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get ALL user data from database
    
    // 1. USERS table - basic info + last_login
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('username, email, last_login, created_at, default_resolution, default_aspect_ratio, hair_color, eye_color, skin_tone')
      .limit(1)
    
    // 2. USER_STATS table - tokens, costs, daily counts
    const { data: userStats, error: userStatsError } = await supabase
      .from('user_stats')
      .select(`
        daily_prompt_tokens, daily_output_tokens, total_prompt_tokens, total_output_tokens,
        daily_cost_usd, total_cost_usd,
        daily_count_2k_9_16, daily_count_2k_4_3, daily_count_4k_9_16, daily_count_4k_4_3,
        daily_generation_time_seconds, daily_errors, daily_reset_date,
        total_count_2k_9_16, total_count_2k_4_3, total_count_4k_9_16, total_count_4k_4_3,
        total_generation_time_seconds, total_generations, total_errors,
        last_error_message, last_error_timestamp
      `)
      .limit(1)
    
    // 3. GENERATIONS table - all generation data
    const { data: generations, error: generationsError } = await supabase
      .from('generations')
      .select(`
        id, prompt, resolution, aspect_ratio, status, 
        result_image_url, error_message, generation_time_seconds, 
        retry_count, created_at, started_at, completed_at
      `)
      .order('created_at', { ascending: false })
      .limit(20)
    
    // 4. DAILY_USAGE_HISTORY table - trends and analytics
    const { data: dailyHistory, error: dailyHistoryError } = await supabase
      .from('daily_usage_history')
      .select(`
        usage_date, cost_usd, generations_count, generation_time_seconds,
        count_2k_9_16, count_2k_4_3, count_4k_9_16, count_4k_4_3,
        prompt_tokens, output_tokens, errors_count, peak_usage_hour, most_used_prompts
      `)
      .order('usage_date', { ascending: false })
      .limit(30)
    
    // 5. Get total counts
    const { count: totalGenerations } = await supabase
      .from('generations')
      .select('*', { count: 'exact', head: true })
    
    const { count: completedGenerations } = await supabase
      .from('generations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
    
    const { count: failedGenerations } = await supabase
      .from('generations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'failed')

    // Calculate derived statistics
    const successRate = totalGenerations > 0 ? (completedGenerations / totalGenerations) * 100 : 0
    const avgGenerationTime = generations?.length > 0 
      ? generations.filter(g => g.generation_time_seconds).reduce((sum, g) => sum + g.generation_time_seconds, 0) / generations.filter(g => g.generation_time_seconds).length
      : 0

    // Return EVERYTHING
    return NextResponse.json({
      // Basic user info
      user: users?.[0] || null,
      
      // User stats (tokens, costs, counts)
      userStats: userStats?.[0] || null,
      
      // All generations with full data
      generations: generations || [],
      
      // Daily usage history for trends
      dailyHistory: dailyHistory || [],
      
      // Summary stats
      summary: {
        totalGenerations: totalGenerations || 0,
        completedGenerations: completedGenerations || 0,
        failedGenerations: failedGenerations || 0,
        successRate: Math.round(successRate),
        avgGenerationTimeSeconds: Math.round(avgGenerationTime || 0)
      },
      
      // Errors (if any)
      errors: {
        users: usersError?.message || null,
        userStats: userStatsError?.message || null,
        generations: generationsError?.message || null,
        dailyHistory: dailyHistoryError?.message || null
      }
    })
  } catch (error: any) {
    console.error('User stats API error:', error)
    return NextResponse.json({ 
      error: error.message,
      user: null,
      userStats: null,
      generations: [],
      dailyHistory: [],
      summary: { totalGenerations: 0, completedGenerations: 0, failedGenerations: 0, successRate: 0, avgGenerationTimeSeconds: 0 }
    }, { status: 500 })
  }
}