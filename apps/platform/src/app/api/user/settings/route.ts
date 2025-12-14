import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@repo/database'

// GET - Load user settings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()
    
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id,
        username,
        email,
        gemini_api_key,
        main_face_image_url,
        face_2_image_url,
        face_2_name,
        face_3_image_url,
        face_3_name,
        hair_color,
        eye_color,
        skin_tone,
        age_range,
        default_resolution,
        default_aspect_ratio,
        use_personalization,
        use_personal_appearance_text,
        personal_appearance_text,
        favorite_prompts,
        updated_at
      `)
      .eq('id', userId)
      .eq('is_active', true)
      .single()

    if (error || !user) {
      console.error('Error loading user settings:', error)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Return user settings (without sensitive data like password_hash)
    return NextResponse.json({ settings: user })
  } catch (error) {
    console.error('Settings API error:', error)
    return NextResponse.json(
      { error: 'Failed to load settings' },
      { status: 500 }
    )
  }
}

// POST - Update user settings (individual field updates)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, ...updateFields } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()
    
    // Build update object with only provided fields
    const updateData = {
      ...updateFields,
      updated_at: new Date().toISOString()
    }

    // Update user settings in database
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating user settings:', error)
      return NextResponse.json(
        { error: 'Failed to update settings' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      settings: data,
      message: 'Settings updated successfully'
    })
  } catch (error) {
    console.error('Settings update API error:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}

// PUT - Update user settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, settings } = body

    if (!userId || !settings) {
      return NextResponse.json(
        { error: 'User ID and settings are required' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()
    
    // Update user settings in database
    const { data, error } = await supabase
      .from('users')
      .update({
        email: settings.email || '',
        gemini_api_key: settings.gemini_api_key || '',
        main_face_image_url: settings.main_face_image_url || '',
        face_2_image_url: settings.face_2_image_url || '',
        face_2_name: settings.face_2_name || '',
        face_3_image_url: settings.face_3_image_url || '',
        face_3_name: settings.face_3_name || '',
        hair_color: settings.hair_color || '',
        eye_color: settings.eye_color || '',
        skin_tone: settings.skin_tone || '',
        age_range: settings.age_range || '',
        default_resolution: settings.default_resolution || '',
        default_aspect_ratio: settings.default_aspect_ratio || '',
        use_personalization: settings.use_personalization || false,
        use_personal_appearance_text: settings.use_personal_appearance_text || false,
        personal_appearance_text: settings.personal_appearance_text || '',
        favorite_prompts: settings.favorite_prompts || [],
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating user settings:', error)
      return NextResponse.json(
        { error: 'Failed to update settings' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      settings: data,
      message: 'Settings updated successfully'
    })
  } catch (error) {
    console.error('Settings update API error:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}