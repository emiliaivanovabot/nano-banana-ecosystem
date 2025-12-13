'use client'

import React, { useRef, useState } from 'react'

interface FaceImageUploadProps {
  imageUrl: string
  section: 'main_face' | 'face_2' | 'face_3'
  userId: string
  onImageUploaded: (imageUrl: string) => void
  onImageRemoved: () => void
  disabled?: boolean
}

export default function FaceImageUpload({
  imageUrl,
  section,
  userId,
  onImageUploaded,
  onImageRemoved,
  disabled = false
}: FaceImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('section', section)
      formData.append('userId', userId)

      const response = await fetch('/api/user/upload-image', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      onImageUploaded(result.imageUrl)
    } catch (error) {
      console.error('Upload error:', error)
      setUploadError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = () => {
    setUploadError(null)
    onImageRemoved()
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {imageUrl ? (
        <div className="relative group">
          <img 
            src={imageUrl} 
            alt={`${section} image`}
            className="w-full h-32 object-cover rounded-md border border-gray-300"
          />
          
          {/* Overlay with controls */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-md flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
              <button
                onClick={triggerFileSelect}
                disabled={disabled || isUploading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium"
              >
                {isUploading ? 'Uploading...' : 'Replace'}
              </button>
              <button
                onClick={handleRemoveImage}
                disabled={disabled || isUploading}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium"
              >
                Remove
              </button>
            </div>
          </div>
          
          {/* Loading overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-md">
              <div className="text-sm font-medium text-gray-700">Uploading...</div>
            </div>
          )}
        </div>
      ) : (
        <div 
          onClick={triggerFileSelect}
          className={`border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-gray-400 transition-colors ${
            disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isUploading ? (
            <div className="text-sm text-gray-600">Uploading...</div>
          ) : (
            <>
              <svg
                className="mx-auto h-8 w-8 text-gray-400 mb-2"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="text-sm text-gray-600">
                Click to upload {section === 'main_face' ? 'main face' : section.replace('_', ' ')}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                PNG, JPG, WebP up to 10MB
              </div>
            </>
          )}
        </div>
      )}

      {/* Error message */}
      {uploadError && (
        <div className="mt-2 text-sm text-red-600">
          {uploadError}
        </div>
      )}
    </div>
  )
}