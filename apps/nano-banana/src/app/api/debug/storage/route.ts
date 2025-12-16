import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@repo/database'

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    
    // Check if face-images bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      return NextResponse.json({
        error: 'Failed to list buckets',
        details: bucketsError.message
      })
    }
    
    const faceImagesBucket = buckets.find(bucket => bucket.name === 'face-images')
    
    if (!faceImagesBucket) {
      return NextResponse.json({
        error: 'face-images bucket does not exist',
        availableBuckets: buckets.map(b => b.name)
      })
    }
    
    // Try to list files in the bucket
    const { data: files, error: filesError } = await supabase.storage
      .from('face-images')
      .list('', { limit: 5 })
      
    if (filesError) {
      return NextResponse.json({
        error: 'Cannot access face-images bucket',
        bucketExists: true,
        details: filesError.message
      })
    }
    
    return NextResponse.json({
      success: true,
      bucketExists: true,
      bucketInfo: faceImagesBucket,
      sampleFiles: files || [],
      message: 'face-images bucket is accessible'
    })
    
  } catch (error) {
    console.error('Storage debug error:', error)
    return NextResponse.json({
      error: 'Storage debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}