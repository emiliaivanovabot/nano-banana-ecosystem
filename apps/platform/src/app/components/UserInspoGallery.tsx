'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

interface InspoImage {
  id: string
  username: string
  prompt: string
  result_image_url: string
  created_at: string
  generation_type: string
  original_filename: string
}

interface UserInspoGalleryProps {
  currentUser: { username: string } | null
}

export default function UserInspoGallery({ currentUser }: UserInspoGalleryProps) {
  const [inspoImages, setInspoImages] = useState<InspoImage[]>([])
  const [selectedImage, setSelectedImage] = useState<InspoImage | null>(null)
  const [loading, setLoading] = useState(true)
  const [copySuccess, setCopySuccess] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const loadInspoImages = async () => {
    try {
      setLoading(refreshing ? false : true)
      
      console.log('Loading inspiration images from community...')
      
      // V1 Database Access - Service Role for RLS bypass
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      
      // Get quality images from all users (excluding current user)
      const { data, error } = await supabase
        .from('generations')
        .select('id, username, prompt, result_image_url, created_at, generation_type, original_filename')
        .neq('username', currentUser?.username || '') // Exclude current user
        .eq('status', 'completed')
        .not('result_image_url', 'is', null) // Ensure image exists
        .not('username', 'is', null) // Ensure username exists
        .order('created_at', { ascending: false })
        .limit(100) // Get more images to ensure fair user distribution

      if (error) {
        console.error('Error loading inspiration images:', error)
        return
      }

      // Filter for quality images
      const qualityImages = data?.filter(img => 
        img.result_image_url && 
        img.prompt && 
        img.prompt.length > 10 && // Relaxed: 10+ chars instead of 15+
        img.username && 
        !img.prompt.toLowerCase().includes('test') && 
        !img.prompt.toLowerCase().includes('debug')
      ) || []

      // Group images by username for fair distribution
      const imagesByUser: { [key: string]: InspoImage[] } = {}
      qualityImages.forEach(img => {
        if (!imagesByUser[img.username]) {
          imagesByUser[img.username] = []
        }
        imagesByUser[img.username].push(img)
      })

      // Take max 14 random images per user for more variety in teaser
      const fairSelection: InspoImage[] = []
      Object.keys(imagesByUser).forEach(username => {
        const userImages = imagesByUser[username]
        // Shuffle user's images and take up to 14
        const shuffledUserImages = userImages.sort(() => Math.random() - 0.5)
        fairSelection.push(...shuffledUserImages.slice(0, 14))
      })

      // Final shuffle of the fair selection and limit to 14 for display
      const shuffledImages = fairSelection
        .sort(() => Math.random() - 0.5)
        .slice(0, 14)

      console.log('🎨 User distribution:', Object.keys(imagesByUser).map(user => 
        `${user}: ${imagesByUser[user].length} images`
      ).join(', '))
      console.log('📊 Final selection: showing', shuffledImages.length, 'images from', 
        new Set(shuffledImages.map(img => img.username)).size, 'different users')

      setInspoImages(shuffledImages)
    } catch (error) {
      console.error('Error loading inspiration images:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInspoImages()
  }, [currentUser?.username])

  const handleRefresh = async () => {
    setRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 500)) // Small delay for UX
    await loadInspoImages()
    setRefreshing(false)
  }

  const handleImageClick = (image: InspoImage) => {
    setSelectedImage(image)
  }

  const closeModal = () => {
    setSelectedImage(null)
    setIsFullscreen(false)
  }

  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt).then(() => {
      console.log('✅ Prompt copied to clipboard')
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    }).catch(err => {
      console.error('❌ Failed to copy prompt:', err)
    })
  }

  if (loading) {
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(15px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '20px',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{ color: 'white', fontSize: '14px' }}>
          Loading inspiration...
        </div>
      </div>
    )
  }

  return (
    <>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(15px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '20px',
        padding: '20px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h3 style={{
            margin: 0,
            color: 'white',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            💡 Community Inspiration
          </h3>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 12px',
              color: 'white',
              fontSize: '12px',
              cursor: refreshing ? 'not-allowed' : 'pointer'
            }}
          >
            {refreshing ? '🔄' : '↻'} Refresh
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
          gap: '8px'
        }}>
          {inspoImages.slice(0, 14).map((image, index) => (
            <div
              key={image.id}
              onClick={() => handleImageClick(image)}
              style={{
                aspectRatio: '1',
                borderRadius: '8px',
                overflow: 'hidden',
                cursor: 'pointer',
                background: 'rgba(255, 255, 255, 0.1)',
                position: 'relative'
              }}
            >
              <img
                src={image.result_image_url}
                alt={`Inspiration ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                loading="lazy"
              />
            </div>
          ))}
        </div>

        <div style={{
          marginTop: '12px',
          textAlign: 'center'
        }}>
          <Link 
            href="/inspiration"
            style={{
              color: 'rgba(255, 255, 255, 0.8)',
              textDecoration: 'none',
              fontSize: '12px'
            }}
          >
            → Alle Community Bilder ansehen
          </Link>
        </div>
      </div>

      {/* Modal */}
      {selectedImage && (
        <div
          onClick={closeModal}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '20px',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
          >
            <img
              src={selectedImage.result_image_url}
              alt="Inspiration"
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '8px',
                marginBottom: '16px'
              }}
            />
            
            <div style={{ marginBottom: '12px' }}>
              <strong>By:</strong> {selectedImage.username}
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <strong>Prompt:</strong>
              <div style={{
                background: '#f5f5f5',
                padding: '8px',
                borderRadius: '4px',
                fontSize: '14px',
                marginTop: '4px'
              }}>
                {selectedImage.prompt}
              </div>
            </div>

            <button
              onClick={() => copyPrompt(selectedImage.prompt)}
              style={{
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 16px',
                cursor: 'pointer',
                marginRight: '8px'
              }}
            >
              {copySuccess ? '✅ Copied!' : '📋 Copy Prompt'}
            </button>

            <button
              onClick={closeModal}
              style={{
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 16px',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}