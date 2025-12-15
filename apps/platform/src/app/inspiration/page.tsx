'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@repo/auth-config'
import { ArrowLeft } from 'lucide-react'
import './inspiration.css'

interface InspoImage {
  id: string
  username: string
  prompt: string
  result_image_url: string
  created_at: string
  generation_type: string
  original_filename: string
}

export default function InspirationPage() {
  const { user, loading: authLoading } = useAuth()
  const [images, setImages] = useState<InspoImage[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [selectedImage, setSelectedImage] = useState<InspoImage | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  // Removed userSettings - using user from useAuth() directly

  // Remove redundant loading - useAuth() provides all needed user data

  const loadImages = useCallback(async () => {
    try {
      setLoading(true)
      console.log('Loading community inspiration images...')
      console.log('🔍 Current user:', user)
      console.log('🔍 Auth loading state:', authLoading)
      console.log('🔍 User has username:', !!user?.username)
      
      // Use user.username from useAuth
      const excludeUsername = user?.username || ''
      console.log('🚫 Excluding username:', excludeUsername)
      const response = await fetch(`/api/images/inspiration?excludeUsername=${encodeURIComponent(excludeUsername)}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Error loading inspiration images:', errorData.error)
        return
      }

      const responseData = await response.json()
      console.log('🎨 Full API response:', responseData)
      
      const fetchedImages = responseData.images
      console.log('🎨 Community images loaded:', { count: fetchedImages?.length, images: fetchedImages })
      
      // Shuffle images for variety like in V1
      const shuffledImages = [...(fetchedImages || [])].sort(() => Math.random() - 0.5)
      console.log('🎨 Setting images:', shuffledImages)
      setImages(shuffledImages)
      setHasMore(false) // For now, load all at once
      
    } catch (error) {
      console.error('Error loading inspiration images:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    // Wait until auth is ready and user has username
    if (!authLoading && user?.username) {
      console.log('🎨 User with username ready, loading images...')
      console.log('🎨 User details:', { id: user.id, username: user.username })
      loadImages()
    } else if (!authLoading && !user) {
      console.log('🚫 No authenticated user, cannot load images')
    } else if (!authLoading && user && !user.username) {
      console.log('⚠️ User authenticated but missing username:', user)
    }
  }, [loadImages, authLoading, user])

  const handleImageClick = (image: InspoImage) => {
    setSelectedImage(image)
    document.body.style.overflow = 'hidden'
  }

  const closeModal = () => {
    setSelectedImage(null)
    setIsFullscreen(false)
    document.body.style.overflow = 'unset'
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

  const getUserDisplayName = (username: string) => username || 'Community'

  // Keyboard navigation
  useEffect(() => {
    if (!selectedImage) return
    
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeModal()
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [selectedImage])

  // Loading state - wait for auth to initialize
  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'hsl(var(--background))',
        color: 'hsl(var(--foreground))'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid hsl(var(--border))',
            borderTop: '3px solid #F59E0B',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px auto'
          }}></div>
          <p>Auth wird geladen...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="inspiration-page">
      <div className="inspiration-header">
        <div className="header-content">
          <Link href="/nano-banana" className="back-link">
            ← Zurück zu Nano Banana
          </Link>
          <div className="title-section">
            <h1>Community Inspiration</h1>
            <p className="subtitle">Entdecke kreative Kunstwerke von der Community</p>
          </div>
        </div>
      </div>

      <div className="masonry-gallery">
        {images.map((img, index) => {
          // V1-style pattern for grid layout
          const patternIndex = index % 8
          let sizeClass = ''
          
          switch(patternIndex) {
            case 0: sizeClass = 'square'; break
            case 1: sizeClass = 'square'; break
            case 2: sizeClass = 'portrait large'; break
            case 3: sizeClass = 'portrait'; break
            case 4: sizeClass = 'square'; break
            case 5: sizeClass = 'square'; break
            case 6: sizeClass = 'portrait large'; break
            case 7: sizeClass = 'landscape'; break
          }
          
          return (
            <div
              key={img.id}
              className={`masonry-item ${sizeClass}`}
              onClick={() => handleImageClick(img)}
            >
              <img
                src={img.result_image_url}
                className="masonry-image"
                alt={`Inspiration by ${getUserDisplayName(img.username)}`}
                loading="lazy"
              />
              <div className="image-overlay">
                <div className="image-info">
                  <div className="masonry-user">
                    <span className="user-icon">👤</span>
                    <span className="username">{getUserDisplayName(img.username)}</span>
                  </div>
                  {img.prompt && (
                    <div className="masonry-actions">
                      <button 
                        className="copy-prompt-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          copyPrompt(img.prompt)
                        }}
                      >
                        Prompt kopieren
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Lade Community-Kunstwerke...</p>
        </div>
      )}

      {!loading && images.length === 0 && (
        <div className="no-images-container">
          <p>Keine Community-Inspirationen verfügbar.</p>
        </div>
      )}

      {/* Modal */}
      {selectedImage && (
        <div 
          className="mobile-viewport-modal"
          onClick={closeModal}
        >
          <div 
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h4>Community Inspiration</h4>
              <button 
                onClick={closeModal}
                className="close-button"
              >
                ✖
              </button>
            </div>
            
            <img 
              src={selectedImage.result_image_url} 
              alt="Community Inspiration"
              className="modal-image"
            />
            
            <div className="modal-info">
              <p className="modal-date">
                {getUserDisplayName(selectedImage.username)} • {new Date(selectedImage.created_at).toLocaleString('de-DE')}
              </p>
              {selectedImage.prompt && (
                <p className="modal-prompt">
                  <strong>Prompt:</strong> {selectedImage.prompt}
                </p>
              )}
            </div>

            {selectedImage.prompt && (
              <div className="modal-actions">
                <div className="action-buttons-row">
                  <button 
                    onClick={() => window.open(selectedImage.result_image_url, '_blank')}
                    className="download-button"
                  >
                    Bild öffnen
                  </button>
                  <button 
                    onClick={() => copyPrompt(selectedImage.prompt)}
                    className="copy-prompt-button"
                  >
                    {copySuccess ? '✅ Copied!' : 'Prompt kopieren'}
                  </button>
                </div>
                <button 
                  onClick={closeModal}
                  className="close-modal-button"
                >
                  Schließen
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}