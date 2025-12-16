import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@repo/database'

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    
    // Check specific user ID from tests
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, username, main_face_image_url, face_2_image_url, face_3_image_url')
      .eq('id', '5bcc1012-7b1b-4ac3-a2e6-3093d492d2c0')
      .single()
      
    if (error) {
      return NextResponse.json({
        error: 'Failed to fetch user',
        details: error.message
      })
    }
    
    return NextResponse.json({
      success: true,
      user: user,
      hasMainFace: !!user.main_face_image_url,
      hasFace2: !!user.face_2_image_url,
      hasFace3: !!user.face_3_image_url,
      imageUrls: {
        main_face: user.main_face_image_url,
        face_2: user.face_2_image_url,
        face_3: user.face_3_image_url
      }
    })
    
  } catch (error) {
    console.error('User images debug error:', error)
    return NextResponse.json({
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}