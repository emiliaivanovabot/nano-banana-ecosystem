'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import ReactDOM from 'react-dom'
import { useAuth } from '@repo/auth-config'
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
  const [userSettings, setUserSettings] = useState(null)
  const [images, setImages] = useState<InspoImage[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [imagePool, setImagePool] = useState<InspoImage[]>([])
  const [poolExhausted, setPoolExhausted] = useState(false)
  const [poolIndex, setPoolIndex] = useState(0)
  const [selectedImage, setSelectedImage] = useState<InspoImage | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [showFloatingButton, setShowFloatingButton] = useState(false)
  
  // Fisher-Yates shuffle for true randomization (performance: O(n), unbiased)
  const fisherYatesShuffle = (array: InspoImage[]) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // Load user settings like nano-banana does
  const loadUserSettings = async () => {
    if (!user?.id) return
    
    try {
      console.log('🔍 Loading user settings for:', user.id)
      const response = await fetch(`/api/user/settings?userId=${user.id}`)
      
      if (!response.ok) {
        throw new Error('Failed to load user settings')
      }
      
      const data = await response.json()
      console.log('📦 User settings response:', data)
      
      if (data.settings) {
        setUserSettings(data.settings)
        console.log('✅ User settings loaded:', data.settings)
      }
    } catch (error) {
      console.error('Error loading user settings:', error)
    }
  }

  const initializeImagePool = useCallback(async () => {
    try {
      setLoading(true)
      const startTime = performance.now()
      console.log('🎲 Initializing randomized image pool...')
      
      // Use userSettings.username like nano-banana does
      const excludeUsername = userSettings?.username || ''
      console.log('🚫 Excluding username:', excludeUsername)
      const response = await fetch(`/api/images/inspiration?excludeUsername=${encodeURIComponent(excludeUsername)}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Error loading inspiration images:', errorData.error)
        return
      }

      const responseData = await response.json()
      const fetchedImages = responseData.images || []
      
      const shuffleStartTime = performance.now()
      const shuffledPool = fisherYatesShuffle(fetchedImages)
      const shuffleTime = performance.now() - shuffleStartTime
      
      setImagePool(shuffledPool)
      setPoolIndex(0)
      setPoolExhausted(false)
      
      const totalTime = performance.now() - startTime
      console.log(`🚀 Performance Metrics:`)
      console.log(`  - Pool size: ${shuffledPool.length} images`)
      console.log(`  - Shuffle time: ${shuffleTime.toFixed(2)}ms`)
      console.log(`  - Total initialization: ${totalTime.toFixed(2)}ms`)
      console.log(`  - Memory usage: ~${((shuffledPool.length * 0.5) / 1024).toFixed(1)}KB`)
      
      // Load first page from pool
      const firstPageImages = shuffledPool.slice(0, 30)
      setImages(firstPageImages)
      setPoolIndex(30)
      setHasMore(shuffledPool.length > 30)
      
    } catch (error) {
      console.error('❌ Error initializing image pool:', error)
    } finally {
      setLoading(false)
    }
  }, [userSettings?.username])

  const loadMoreFromPool = useCallback(() => {
    if (poolExhausted || loading) return
    
    setLoading(true)
    console.log('🔄 Loading more from pool, index:', poolIndex)
    
    const itemsPerPage = 30
    const nextImages = imagePool.slice(poolIndex, poolIndex + itemsPerPage)
    
    if (nextImages.length > 0) {
      setImages(prev => [...prev, ...nextImages])
      setPoolIndex(prev => prev + itemsPerPage)
      
      // Check if we're near pool exhaustion (less than 60 images left)
      const remainingImages = imagePool.length - (poolIndex + itemsPerPage)
      if (remainingImages <= 60) {
        console.log('⚠️ Pool nearly exhausted, preparing refresh...')
        setHasMore(false)
        setPoolExhausted(true)
      }
    } else {
      setHasMore(false)
      setPoolExhausted(true)
    }
    
    setLoading(false)
  }, [imagePool, poolIndex, poolExhausted, loading])

  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastImageElementRef = useCallback((node: HTMLDivElement | null) => {
    console.log('🔍 lastImageElementRef called:', { node: !!node, loading, hasMore, poolSize: imagePool.length, currentImages: images.length })
    if (loading) return
    if (observerRef.current) observerRef.current.disconnect()
    observerRef.current = new IntersectionObserver(entries => {
      console.log('👀 IntersectionObserver triggered:', { 
        isIntersecting: entries[0].isIntersecting, 
        hasMore, 
        poolExhausted,
        poolIndex,
        poolSize: imagePool.length 
      })
      if (entries[0].isIntersecting && hasMore) {
        console.log('🔄 Loading more images...')
        loadMoreFromPool()
      }
    })
    if (node) {
      console.log('✅ Observing last image element')
      observerRef.current.observe(node)
    }
  }, [loading, hasMore, loadMoreFromPool, imagePool.length, poolExhausted, poolIndex])

  const refreshPool = useCallback(async () => {
    console.log('🔄 Refreshing image pool...')
    await initializeImagePool()
  }, [initializeImagePool])

  // Load user settings when user changes
  useEffect(() => {
    if (user?.id && !userSettings) {
      loadUserSettings()
    }
  }, [user?.id, userSettings])

  useEffect(() => {
    if (!authLoading && userSettings?.username && imagePool.length === 0) {
      console.log('🎨 User settings with username ready, loading images...')
      initializeImagePool()
    }
  }, [authLoading, userSettings?.username, imagePool.length, initializeImagePool])

  // Floating back button scroll logic
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setShowFloatingButton(scrollY > 100) // Show after 100px scroll
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Helper functions
  const getUserDisplayName = (username: string) => username || 'Anonymous'
  
  const classifyImage = (dimensions: string | undefined, index: number) => {
    if (!dimensions) return { sizeClass: 'square size-1x1', classification: 'square', ratio: 1 }
    
    const [width, height] = dimensions.split('x').map(Number)
    if (!width || !height) return { sizeClass: 'square size-1x1', classification: 'square', ratio: 1 }
    
    const ratio = width / height
    
    // Mobile-First Tetris: Mehr 1x1 für 4 Spalten Layout
    const mobileVariations = {
      landscape: ['landscape size-1x1', 'landscape size-2x1'], // Meist 1 Spalte
      portrait: ['portrait size-1x2', 'portrait size-1x1'],    // Meist 1 Spalte hoch
      square: ['square size-1x1', 'square size-2x1', 'square size-1x1', 'square size-1x1'] // 75% sind 1x1
    }
    
    if (ratio > 1.3) {
      // Landscape - 80% sind 1x1 (4 pro Reihe), 20% sind 2x1 (2 pro Reihe) 
      const landscapeSize = index % 5 === 0 ? mobileVariations.landscape[1] : mobileVariations.landscape[0]
      return { sizeClass: landscapeSize, classification: 'landscape', ratio }
    }
    if (ratio < 0.7) {
      // Portrait - meist 1 Spalte breit aber 2 hoch
      const portraitSize = index % 3 === 0 ? mobileVariations.portrait[1] : mobileVariations.portrait[0]
      return { sizeClass: portraitSize, classification: 'portrait', ratio }
    }
    // Square - 75% sind 1x1 für echtes 4-Spalten Layout
    const squareIndex = index % 4
    const squareSize = mobileVariations.square[squareIndex]
    return { sizeClass: squareSize, classification: 'square', ratio }
  }

  const handleImageClick = (image: InspoImage) => {
    setSelectedImage(image)
    
    // Mobile-optimized scroll prevention without position manipulation
    document.body.style.overflow = 'hidden'
    document.body.classList.add('modal-open')
    
    // Store scroll position for restoration (but don't apply positioning)
    const scrollY = window.scrollY
    document.documentElement.style.setProperty('--scroll-y', `${scrollY}px`)
  }
  
  const closeModal = () => {
    setSelectedImage(null)
    setIsFullscreen(false)
    
    // Restore body scroll when modal is closed
    document.body.style.overflow = ''
    document.body.classList.remove('modal-open')
    
    // Restore scroll position
    const scrollY = document.documentElement.style.getPropertyValue('--scroll-y')
    if (scrollY) {
      document.documentElement.style.removeProperty('--scroll-y')
      window.scrollTo(0, parseInt(scrollY, 10))
    }
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

  // Enhanced keyboard and mobile navigation for modal
  useEffect(() => {
    if (!selectedImage) return
    
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeModal()
      }
    }
    
    // Prevent page scrolling when modal is open
    const preventScroll = (event: Event) => {
      if ((event.target as Element)?.closest('.mobile-viewport-modal')) {
        event.preventDefault()
      }
    }
    
    // Focus trap for accessibility
    const modalElement = document.querySelector('.mobile-viewport-modal') as HTMLElement
    if (modalElement) {
      modalElement.focus()
    }
    
    document.addEventListener('keydown', handleEscape)
    document.addEventListener('touchmove', preventScroll, { passive: false })
    document.addEventListener('wheel', preventScroll, { passive: false })
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('touchmove', preventScroll)
      document.removeEventListener('wheel', preventScroll)
    }
  }, [selectedImage])

  const copyPromptAndGenerate = (prompt: string) => {
    navigator.clipboard.writeText(prompt)
    window.location.href = `/nano-banana?prompt=${encodeURIComponent(prompt)}`
  }

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
      {/* HEADER WITH TITLE - NOT STICKY! */}
      <div className="inspiration-header">
        <div className="header-content">
          <a href="/nano-banana" className="back-link">
            ← Zurück zu Nano Banana
          </a>
          <div className="title-section">
            <h1>Community Inspiration</h1>
            <p className="subtitle">Entdecke kreative Kunstwerke von der Community</p>
          </div>
        </div>
      </div>

      {/* FLOATING BACK BUTTON WHEN SCROLLING */}
      {showFloatingButton && ReactDOM.createPortal(
        <a 
          href="/nano-banana" 
          className={`floating-back-button ${showFloatingButton ? 'visible' : ''}`}
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            zIndex: 10000
          }}
        >
          ← Zurück zu Nano Banana
        </a>,
        document.body
      )}
      
      <div className="masonry-gallery">
        {images.map((img, index) => {
          const { classification, ratio } = classifyImage(img.original_filename, index)
          const isLast = images.length === index + 1
          
          // FIXED 8-PATTERN REPEATING TETRIS SYSTEM (from good commit b3b438a)
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
              ref={isLast ? lastImageElementRef : null}
              className={`masonry-item ${sizeClass}`}
              data-classification={classification}
              data-ratio={ratio.toFixed(2)}
              data-index={index}
              onClick={() => handleImageClick(img)}
            >
              <img
                src={img.result_image_url}
                className="masonry-image"
                alt={`Inspiration by ${getUserDisplayName(img.username)} - ${classification}`}
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
                          copyPromptAndGenerate(img.prompt)
                        }}
                      >
                        Use This Prompt
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

      {!hasMore && images.length > 0 && (
        <div className="no-images-container">
          {poolExhausted ? (
            <>
              <p>Du hast alle fantastischen Community-Kreationen aus diesem Set gesehen! 🎨</p>
              <button 
                className="refresh-pool-btn"
                onClick={refreshPool}
                disabled={loading}
              >
                {loading ? 'Lade neue Bilder...' : 'Neue zufällige Auswahl laden 🎲'}
              </button>
            </>
          ) : (
            <p>Du hast alle fantastischen Community-Kreationen gesehen! 🎨</p>
          )}
        </div>
      )}

      {/* Mobile-Optimized Viewport Modal */}
      {selectedImage && ReactDOM.createPortal(
        <div 
          className="mobile-viewport-modal"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          tabIndex={-1}
          style={{
            // Ensure modal appears at current viewport position
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999999
          }}
        >
          <div 
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h4 id="modal-title">Community Inspiration</h4>
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
                    onClick={() => copyPromptAndGenerate(selectedImage.prompt)}
                    className="copy-prompt-button"
                  >
                    Prompt kopieren & verwenden
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
        </div>,
        document.body
      )}
    </div>
  )
}