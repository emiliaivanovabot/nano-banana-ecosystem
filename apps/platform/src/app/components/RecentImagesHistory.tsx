'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

interface RecentImage {
  id: string
  username: string
  prompt: string
  result_image_url: string
  created_at: string
  generation_type: string
  original_filename: string
  status: string
}

interface RecentImagesHistoryProps {
  currentUser: { username: string } | null
}

export default function RecentImagesHistory({ currentUser }: RecentImagesHistoryProps) {
  const [recentImages, setRecentImages] = useState<RecentImage[]>([])
  const [selectedImage, setSelectedImage] = useState<RecentImage | null>(null)
  const [loading, setLoading] = useState(true)
  const [copySuccess, setCopySuccess] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    if (!currentUser?.username) return

    const loadRecentImages = async () => {
      try {
        setLoading(true)
        
        console.log('Loading recent images for:', currentUser?.username)
        
        // V1 Database Access - Service Role for RLS bypass
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )
        
        const { data, error } = await supabase
          .from('generations')
          .select('*')
          .eq('username', currentUser.username)
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(20)

        if (error) {
          console.error('Error loading recent images:', error)
          return
        }

        setRecentImages(data || [])
      } catch (error) {
        console.error('Error loading recent images:', error)
      } finally {
        setLoading(false)
      }
    }

    loadRecentImages()
  }, [currentUser?.username])

  const openImageModal = (image: RecentImage) => {
    setSelectedImage(image)
  }

  const closeModal = () => {
    setSelectedImage(null)
    setIsFullscreen(false)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const getImageNumber = (filename: string, generationType: string) => {
    if (!filename || generationType === 'single') return null
    
    // Extract number from filename like "nano-banana-4x-3-1764109853661.webp"
    const match = filename.match(/nano-banana-\w+-(\d+)-\d+\.(webp|jpg|png|avif)/)
    if (match) {
      const imageNum = parseInt(match[1])
      const total = generationType === '4x' ? 4 : 10
      return { current: imageNum, total }
    }
    return null
  }

  const openImage = (imageUrl: string) => {
    window.open(imageUrl, '_blank')
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

  const handleModalClick = (e: React.MouseEvent) => {
    // Close modal when clicking outside the content
    if ((e.target as HTMLElement).className === 'image-modal') {
      closeModal()
    }
  }

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal()
    }
  }

  useEffect(() => {
    if (selectedImage) {
      document.addEventListener('keydown', handleKeyPress)
      return () => document.removeEventListener('keydown', handleKeyPress)
    }
  }, [selectedImage])

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
          Loading your recent images...
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
            📸 Deine letzten Bilder
          </h3>
          <Link 
            href="/gallery"
            style={{
              color: 'rgba(255, 255, 255, 0.8)',
              textDecoration: 'none',
              fontSize: '12px'
            }}
          >
            → Alle ansehen
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
          gap: '8px'
        }}>
          {recentImages.slice(0, 14).map((image, index) => {
            const imageNumber = getImageNumber(image.original_filename, image.generation_type)
            
            return (
              <div
                key={image.id}
                onClick={() => openImageModal(image)}
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
                  alt={`Recent ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  loading="lazy"
                />
                {imageNumber && (
                  <div style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    fontSize: '10px',
                    padding: '2px 4px',
                    borderRadius: '3px'
                  }}>
                    {imageNumber.current}/{imageNumber.total}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {recentImages.length === 0 && (
          <div style={{
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '14px',
            padding: '20px'
          }}>
            Noch keine Bilder generiert. Starte deine erste Generation! 🍌
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedImage && (
        <div
          className="image-modal"
          onClick={handleModalClick}
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
              alt="Recent image"
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '8px',
                marginBottom: '16px',
                cursor: isFullscreen ? 'zoom-out' : 'zoom-in'
              }}
              onClick={toggleFullscreen}
            />
            
            <div style={{ marginBottom: '12px' }}>
              <strong>Generated:</strong> {new Date(selectedImage.created_at).toLocaleString()}
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
              onClick={() => openImage(selectedImage.result_image_url)}
              style={{
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 16px',
                cursor: 'pointer',
                marginRight: '8px'
              }}
            >
              🔗 Open Full Size
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