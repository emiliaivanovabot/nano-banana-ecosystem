'use client'

import React, { useState } from 'react'

export default function TestUploadPage() {
  const [uploadResult, setUploadResult] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    console.log('🚀 Test upload starting:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    })

    setIsUploading(true)
    setUploadResult('Uploading...')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('section', 'main_face')
      formData.append('userId', '5bcc1012-7b1b-4ac3-a2e6-3093d492d2c0') // emilia user ID

      console.log('📝 FormData prepared for test upload')

      const response = await fetch('/api/user/upload-image', {
        method: 'POST',
        body: formData
      })

      console.log('📡 Test upload response:', {
        status: response.status,
        ok: response.ok
      })

      const result = await response.json()
      console.log('📦 Test upload result:', result)

      if (response.ok) {
        setUploadResult(`✅ Upload successful! Image URL: ${result.imageUrl}`)
      } else {
        setUploadResult(`❌ Upload failed: ${result.error}`)
      }

    } catch (error) {
      console.error('❌ Test upload error:', error)
      setUploadResult(`❌ Upload error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">Face Upload Test Page</h1>
      
      <div className="max-w-md">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={isUploading}
          className="mb-4 block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
        
        <div className="mt-4 p-4 bg-gray-100 rounded-md">
          <h3 className="font-semibold mb-2">Result:</h3>
          <p className="text-sm">{uploadResult || 'No upload attempted yet'}</p>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-md">
          <h3 className="font-semibold mb-2">Instructions:</h3>
          <p className="text-sm">
            1. Select an image file<br/>
            2. Check browser console for detailed logs<br/>
            3. Check this result area for upload status
          </p>
        </div>
      </div>
    </div>
  )
}