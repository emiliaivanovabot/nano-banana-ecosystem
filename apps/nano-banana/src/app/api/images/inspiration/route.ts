import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@repo/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const excludeUsername = searchParams.get('excludeUsername') || ''

    console.log('🎨 Inspiration API called with excludeUsername:', excludeUsername)

    const supabase = createServerSupabaseClient()
    
    // Get quality images from all users (excluding current user if specified)
    let query = supabase
      .from('generations')
      .select('*')
    
    // Only exclude username if one is provided
    if (excludeUsername && excludeUsername.trim()) {
      query = query.neq('username', excludeUsername)
      console.log('🚫 Excluding username:', excludeUsername)
    } else {
      console.log('📖 Loading all community images (no user to exclude)')
    }
    
    const { data, error } = await query
      .eq('status', 'completed')
      .not('result_image_url', 'is', null) // Ensure image exists
      .not('username', 'is', null) // Ensure username exists
      .not('prompt', 'ilike', '%test%')
      .not('prompt', 'ilike', '%example%')
      .gte('prompt', 'aaaaaaaaaa') // At least 10 characters
      .order('created_at', { ascending: false })
      .limit(500) // Get more for fair distribution - like v1

    if (error) {
      console.error('Error loading inspiration images:', error)
      return NextResponse.json(
        { error: 'Failed to load inspiration images' },
        { status: 500 }
      )
    }

    // Fair distribution algorithm - ensure variety from different users
    const fairDistribution = []
    const userImageCounts = new Map()
    const shuffledData = (data || []).sort(() => Math.random() - 0.5)

    for (const image of shuffledData) {
      const userCount = userImageCounts.get(image.username) || 0
      
      if (userCount < 3 && fairDistribution.length < 300) {
        fairDistribution.push(image)
        userImageCounts.set(image.username, userCount + 1)
      }
    }

    // If we have less than 300, fill remaining spots  
    if (fairDistribution.length < 300) {
      const remaining = shuffledData.filter(img => !fairDistribution.includes(img))
      fairDistribution.push(...remaining.slice(0, 300 - fairDistribution.length))
    }

    return NextResponse.json({ images: fairDistribution })
  } catch (error) {
    console.error('Inspiration images API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}