import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@repo/database'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const section = formData.get('section') as string
    const userId = formData.get('userId') as string

    if (!file || !section || !userId) {
      return NextResponse.json(
        { error: 'File, section, and userId are required' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload JPEG, PNG, or WebP images.' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()
    
    // Generate unique filename - exact V1 pattern
    const fileName = `${userId}_${section}_${Date.now()}_${file.name}`
    const filePath = `${userId}/${fileName}`

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('face-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload image' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('face-images')
      .getPublicUrl(filePath)

    // Update user record with new image URL
    const fieldName = section === 'main_face' ? 'main_face_image_url' : `${section}_image_url`
    
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        [fieldName]: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Database update error:', updateError)
      
      // Try to clean up uploaded file if database update fails
      await supabase.storage
        .from('face-images')
        .remove([filePath])
        
      return NextResponse.json(
        { error: 'Failed to update user record' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      imageUrl: publicUrl,
      message: 'Image uploaded successfully'
    })

  } catch (error) {
    console.error('Image upload API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}