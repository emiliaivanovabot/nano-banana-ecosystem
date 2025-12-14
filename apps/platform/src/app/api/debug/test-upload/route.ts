import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@repo/database'

export async function POST() {
  try {
    const supabase = createServerSupabaseClient()
    
    // Create a simple test file (1x1 pixel PNG)
    const testImageData = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      'base64'
    )
    
    const testFile = new File([testImageData], 'test.png', { type: 'image/png' })
    const testUserId = 'test-user-123'
    const testSection = 'main_face'
    
    // Generate filename like V1 does
    const fileName = `${testUserId}_${testSection}_${Date.now()}_test.png`
    const filePath = `${testUserId}/${fileName}`
    
    console.log('Testing upload with path:', filePath)
    
    // Try to upload
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('face-images')
      .upload(filePath, testFile, {
        cacheControl: '3600',
        upsert: true
      })
      
    if (uploadError) {
      console.error('Upload failed:', uploadError)
      return NextResponse.json({
        success: false,
        error: 'Upload failed',
        details: uploadError.message,
        code: uploadError.name || 'unknown'
      })
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('face-images')
      .getPublicUrl(filePath)
      
    // Try to delete the test file
    await supabase.storage
      .from('face-images')
      .remove([filePath])
      
    return NextResponse.json({
      success: true,
      message: 'Test upload successful',
      uploadPath: filePath,
      publicUrl,
      uploadData
    })
    
  } catch (error) {
    console.error('Test upload error:', error)
    return NextResponse.json({
      success: false,
      error: 'Test upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}