'use client'

import { useState, useEffect } from 'react'
import { useAuth, requireAuth } from '@repo/auth-config'
import Image from 'next/image'
import Link from 'next/link'

interface GeneratedImage {
  id: string
  prompt: string
  style_preset?: string
  image_url: string
  status: string
  created_at: string
}

function GalleryPage() {
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    fetchUserImages()
  }, [])

  const fetchUserImages = async () => {
    try {
      const response = await fetch('/api/user-images')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch images')
      }

      setImages(data.images)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load images')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-lg">Loading your gallery...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Your Gallery</h1>
          <p className="text-gray-600">
            {images.length} images generated
          </p>
        </div>
        <Link
          href="/generate"
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md transition-colors"
        >
          Generate New Image
        </Link>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-4 text-gray-300 text-6xl">
            🎨
          </div>
          <h3 className="text-xl font-medium mb-2">No images yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first AI-generated image to get started
          </p>
          <Link
            href="/generate"
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-md transition-colors"
          >
            Generate Your First Image
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {images.map((image) => (
            <div key={image.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="aspect-square relative">
                <Image
                  src={image.image_url}
                  alt={image.prompt}
                  fill
                  className="object-cover"
                />
                {image.status !== 'completed' && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="text-white text-sm font-medium">
                      {image.status === 'pending' && 'Pending...'}
                      {image.status === 'generating' && 'Generating...'}
                      {image.status === 'failed' && 'Failed'}
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {image.prompt}
                </p>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{image.style_preset || 'realistic'}</span>
                  <span>
                    {new Date(image.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default requireAuth(GalleryPage)