'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import './UserInspoGallery.css'

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
      setLoading(true)
      
      console.log('Loading inspiration images from community...')
      
      // Use API route for server-side database access
      const response = await fetch(`/api/images/inspiration?excludeUsername=${encodeURIComponent(currentUser?.username || '')}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Error loading inspiration images:', errorData.error)
        return
      }

      const { images } = await response.json()
      console.log('🌟 Inspiration images API response:', { images, count: images?.length })
      setInspoImages(images || [])
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

  // Utility function to get user display name from username
  const getUserDisplayName = (username: string) => {
    if (!username) return 'Community'
    // Convert username to display format (e.g., "emilia.berlin" -> "emilia.berlin")
    return username
  }

  useEffect(() => {
    if (selectedImage) {
      document.addEventListener('keydown', handleKeyPress)
      document.body.style.overflow = 'hidden'
    } else {
      document.removeEventListener('keydown', handleKeyPress)
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress)
      document.body.style.overflow = 'unset'
    }
  }, [selectedImage])

  return (
    <>
      <div className="user-inspo-gallery">
        <div className="inspo-header">
          <h3>User Inspo</h3>
          <div className="inspo-subtitle">Community Inspiration</div>
          <Link 
            href="/inspiration"
            className="inspiration-link-button"
            title="Zur vollständigen Community Galerie"
          >
            <span className="inspiration-icon">🎨</span>
            Zur Galerie
          </Link>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Lade Inspiration...</p>
          </div>
        ) : inspoImages.length === 0 ? (
          <div className="no-images-container">
            <p>Keine Inspirationen verfügbar. Die Community erstellt gerade neue Kunstwerke!</p>
          </div>
        ) : (
          <div className="inspo-scroll">
            {inspoImages.map((img) => (
              <img
                key={img.id}
                src={img.result_image_url}
                className="inspo-thumbnail"
                onClick={() => handleImageClick(img)}
                loading="lazy"
                alt={`Inspiration by ${getUserDisplayName(img.username)}`}
                title={`${getUserDisplayName(img.username)} - ${new Date(img.created_at).toLocaleDateString()}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal für großes Bild */}
      {selectedImage && (
        <div className="image-modal" onClick={handleModalClick}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>
                Community Inspiration
                {(() => {
                  const imageNumber = getImageNumber(selectedImage.original_filename, selectedImage.generation_type);
                  return imageNumber ? (
                    <span style={{ 
                      fontWeight: 'normal', 
                      fontSize: '0.8em', 
                      color: '#666',
                      marginLeft: '8px'
                    }}>
                      {imageNumber.current} von {imageNumber.total}
                    </span>
                  ) : null;
                })()}
              </h4>
              <button 
                className="close-button"
                onClick={closeModal}
                aria-label="Schließen"
              >
                ✖
              </button>
            </div>
            
            <img 
              src={selectedImage.result_image_url} 
              alt="Community Inspiration"
              className={isFullscreen ? "modal-image fullscreen-image" : "modal-image"}
              onClick={toggleFullscreen}
              style={{ cursor: 'pointer' }}
            />
            
            <div className="modal-info">
              <p className="modal-date">
                Von {getUserDisplayName(selectedImage.username)} • {new Date(selectedImage.created_at).toLocaleString('de-DE')}
              </p>
              {selectedImage.prompt && (
                <p className="modal-prompt">
                  <strong>Prompt:</strong> {selectedImage.prompt}
                </p>
              )}
            </div>
            
            <div className="modal-actions">
              <div className="action-buttons-row">
                <button 
                  className="download-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openImage(selectedImage.result_image_url);
                  }}
                >
                  Im neuen Tab öffnen
                </button>
                {selectedImage.prompt && (
                  <button 
                    className="copy-prompt-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyPrompt(selectedImage.prompt);
                    }}
                  >
                    {copySuccess ? '✅ Copied!' : '📋 Copy Prompt'}
                  </button>
                )}
              </div>
              <button 
                className="close-modal-button"
                onClick={closeModal}
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}