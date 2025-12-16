'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import './RecentImagesHistory.css'

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
        
        console.log('🔍 RecentImagesHistory currentUser:', { currentUser, username: currentUser?.username, isNull: currentUser === null })
        
        // Use API route for server-side database access
        const response = await fetch(`http://localhost:3001/nano-banana/api/images/recent?username=${encodeURIComponent(currentUser.username)}`)
        
        if (!response.ok) {
          const errorData = await response.json()
          console.error('Error loading recent images:', errorData.error)
          return
        }

        const { images } = await response.json()
        console.log('🖼️ Recent images API response:', { images, count: images?.length })
        setRecentImages(images || [])
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
      <div className="recent-images-history">
        <div className="recent-images-header">
          <h3>🎯 Your Nano Bananas</h3>
        </div>
        <div className="loading-container">
          Loading your recent images...
        </div>
      </div>
    )
  }

  if (!currentUser?.username) {
    return (
      <div className="recent-images-history">
        <h3>Deine letzten 20 Bilder</h3>
        <div className="no-images-container">
          <p>Benutzer wird geladen...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="recent-images-history">
        <div className="recent-images-header">
          <h3>Deine letzten 20 Bilder</h3>
          <a 
            href="/gallery" 
            className="gallery-link-button"
          >
            Zur Galerie
          </a>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <p>Lade Bilder...</p>
          </div>
        ) : recentImages.length === 0 ? (
          <div className="no-images-container">
            <p>Noch keine Bilder generiert. Erstelle dein erstes Bild!</p>
          </div>
        ) : (
          <div className="thumbnails-scroll">
            {recentImages.map((img) => (
              <img
                key={img.id}
                src={img.result_image_url}
                className="thumbnail"
                onClick={() => openImageModal(img)}
                loading="lazy"
                alt={`Generated image from ${img.created_at}`}
                title={`${img.generation_type} - ${new Date(img.created_at).toLocaleDateString()}`}
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
                {selectedImage.generation_type === 'single' ? 'Einzelne' :
                 selectedImage.generation_type === '4x' ? '4x' : '10x'} Generierung
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
              alt="Generated Image"
              className={isFullscreen ? "modal-image fullscreen-image" : "modal-image"}
              onClick={toggleFullscreen}
              style={{ cursor: 'pointer' }}
            />
            
            <div className="modal-info">
              <p className="modal-date">
                {new Date(selectedImage.created_at).toLocaleString('de-DE')}
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