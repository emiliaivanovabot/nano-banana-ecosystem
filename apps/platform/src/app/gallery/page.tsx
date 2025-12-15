'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import ReactDOM from 'react-dom'
import { useAuth } from '@repo/auth-config'
import ImageModal from '../components/ImageModal'
import './gallery.css'

interface GalleryImage {
  id: string
  username: string  
  prompt: string
  result_image_url: string
  created_at: string
  generation_type: string
  original_filename: string
  status: string
}

export default function GalleryPage() {
  const { user, loading: authLoading } = useAuth()
  const [userSettings, setUserSettings] = useState<any>(null)
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [showFloatingButton, setShowFloatingButton] = useState(false)
  // Pool system like inspiration
  const [imagePool, setImagePool] = useState<GalleryImage[]>([])
  const [poolExhausted, setPoolExhausted] = useState(false)
  const [poolIndex, setPoolIndex] = useState(0)

  // Mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Load user settings like nano-banana and inspiration pages
  const loadUserSettings = async () => {
    if (!user?.id) return
    
    try {
      console.log('🔍 Loading user settings for:', user.id)
      const response = await fetch(`/api/user/settings?userId=${user.id}`)
      
      if (!response.ok) {
        throw new Error('Failed to load user settings')
      }
      
      const data = await response.json()
      console.log('📦 Gallery user settings response:', data)
      
      if (data.settings) {
        setUserSettings(data.settings)
        console.log('✅ Gallery user settings loaded:', data.settings)
      }
    } catch (error) {
      console.error('Error loading user settings:', error)
    }
  }

  // Initialize image pool - exactly like inspiration
  const initializeImagePool = useCallback(async () => {
    try {
      setLoading(true)
      const startTime = performance.now()
      console.log('🎲 Initializing gallery image pool...')
      
      console.log('🖼️ Loading all gallery images for:', userSettings?.username)
      const response = await fetch(`/api/images/recent?username=${encodeURIComponent(userSettings?.username || '')}&limit=500&offset=0`)
      
      if (!response.ok) {
        throw new Error('Failed to load gallery images')
      }
      
      const { images: fetchedImages } = await response.json()
      
      // Keep chronological order (newest first) - no shuffling for gallery
      const chronologicalPool = [...(fetchedImages || [])]
      
      setImagePool(chronologicalPool)
      setPoolIndex(0)
      setPoolExhausted(false)
      
      const totalTime = performance.now() - startTime
      console.log(`🚀 Gallery Performance Metrics:`)
      console.log(`  - Pool size: ${chronologicalPool.length} images`)
      console.log(`  - Total initialization: ${totalTime.toFixed(2)}ms`)
      
      // Load first page from pool
      const firstPageImages = chronologicalPool.slice(0, 30)
      setImages(firstPageImages)
      setPoolIndex(30)
      setHasMore(chronologicalPool.length > 30)
      
    } catch (error) {
      console.error('❌ Error initializing gallery image pool:', error)
    } finally {
      setLoading(false)
    }
  }, [userSettings?.username])

  const loadMoreFromPool = useCallback(() => {
    if (poolExhausted || loading) return
    
    setLoading(true)
    console.log('🔄 Loading more from gallery pool, index:', poolIndex)
    
    const itemsPerPage = 30
    const nextImages = imagePool.slice(poolIndex, poolIndex + itemsPerPage)
    
    if (nextImages.length > 0) {
      setImages(prev => [...prev, ...nextImages])
      setPoolIndex(prev => prev + itemsPerPage)
      
      // Check if we're near pool exhaustion
      const remainingImages = imagePool.length - (poolIndex + itemsPerPage)
      if (remainingImages <= 60) {
        console.log('⚠️ Gallery pool nearly exhausted...')
        setHasMore(false)
        setPoolExhausted(true)
      }
    } else {
      setHasMore(false)
      setPoolExhausted(true)
    }
    
    setLoading(false)
  }, [imagePool, poolIndex, poolExhausted, loading])

  const refreshPool = useCallback(async () => {
    console.log('🔄 Refreshing gallery pool...')
    await initializeImagePool()
  }, [initializeImagePool])

  // Load user settings when user changes
  useEffect(() => {
    if (user?.id && !userSettings) {
      loadUserSettings()
    }
  }, [user?.id, userSettings])

  // Load images when userSettings changes
  useEffect(() => {
    if (!authLoading && userSettings?.username && imagePool.length === 0) {
      console.log('🖼️ Gallery user settings ready, loading images...')
      initializeImagePool()
    }
  }, [authLoading, userSettings?.username, imagePool.length, initializeImagePool])

  // Infinite scrolling - exactly like inspiration
  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastImageElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return
    if (observerRef.current) observerRef.current.disconnect()
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        console.log('🔄 Loading more gallery images from pool...')
        loadMoreFromPool()
      }
    })
    if (node) observerRef.current.observe(node)
  }, [loading, hasMore, loadMoreFromPool])

  // Floating back button scroll logic
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setShowFloatingButton(scrollY > 100)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // No filtering needed - just use all images
  const filteredImages = images

  // Image handlers
  const handleImageClick = (image: GalleryImage) => {
    setSelectedImage(image)
    document.body.style.overflow = 'hidden'
  }

  const closeModal = () => {
    setSelectedImage(null)
    document.body.style.overflow = 'unset'
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

  // No filters needed

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'hsl(var(--background))',
      paddingBottom: '40px',
      transition: 'background-color 0.3s ease',
      WebkitOverflowScrolling: 'touch',
      scrollBehavior: 'smooth',
      transform: 'translateZ(0)',
      backfaceVisibility: 'hidden',
      perspective: '1000px'
    }}>
      {/* FLOATING BACK BUTTON WHEN SCROLLING */}
      {showFloatingButton && ReactDOM.createPortal(
        <a 
          href="/nano-banana" 
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            zIndex: 10000,
            display: 'inline-flex',
            alignItems: 'center',
            textDecoration: 'none',
            fontSize: '0.9rem',
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(16px)',
            color: 'rgba(255, 255, 255, 0.95)',
            padding: '12px 16px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.15)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.9)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)'
          }}
        >
          ← Zurück
        </a>,
        document.body
      )}

      <div className="inspiration-header">
        <div className="header-content">
          <a href="/nano-banana" className="back-link">
            ← Zurück zu Nano Banana
          </a>
          <div className="title-section">
            <h1>Meine Galerie</h1>
            <p className="subtitle">Alle deine generierten Bilder in chronologischer Reihenfolge</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {loading ? (
          <div style={{
            background: 'hsl(var(--card))',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '60px',
            textAlign: 'center',
            border: '1px solid hsl(var(--border))'
          }}>
            <p style={{ color: 'hsl(var(--foreground))', margin: 0, fontSize: '18px' }}>
              Lade Bilder...
            </p>
          </div>
        ) : filteredImages.length === 0 ? (
          <div style={{
            background: 'hsl(var(--card))',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '60px',
            textAlign: 'center',
            border: '1px solid hsl(var(--border))'
          }}>
            <h2 style={{ color: 'hsl(var(--foreground))', margin: '0 0 16px 0', fontSize: '20px' }}>
              Keine Bilder gefunden
            </h2>
            <p style={{ 
              color: 'hsl(var(--muted-foreground))', 
              margin: '0 0 24px 0',
              fontSize: '16px' 
            }}>
              Du hast noch keine Bilder generiert.
            </p>
            <a 
              href="/nano-banana"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                background: 'linear-gradient(135deg, hsl(47 100% 65%), hsl(280 70% 60%))',
                color: 'hsl(var(--primary-foreground))',
                textDecoration: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              Erstes Bild generieren
            </a>
          </div>
        ) : (
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)',
              gap: '2px',
              marginBottom: '40px',
              transform: 'translate3d(0, 0, 0)',
              WebkitBackfaceVisibility: 'hidden',
              WebkitPerspective: '1000',
              WebkitTransform: 'translate3d(0, 0, 0)',
            }}
          >
            {filteredImages.map((image, index) => {
              if (!image || !image.id) return null
              
              const isLast = filteredImages.length === index + 1

              return (
                <div
                  key={image.id}
                  ref={isLast ? lastImageElementRef : null}
                  onClick={() => handleImageClick(image)}
                  style={{
                    aspectRatio: '1',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    position: 'relative',
                    transform: 'translateZ(0)',
                    backfaceVisibility: 'hidden'
                  }}
                >
                  <img
                    src={image.result_image_url}
                    alt={`Generated image ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.02)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)'
                    }}
                    loading="lazy"
                  />
                  
                  {/* Image Number Overlay */}
                  {(() => {
                    const imageNumber = getImageNumber(image.original_filename, image.generation_type);
                    return imageNumber ? (
                      <div style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '500'
                      }}>
                        {imageNumber.current}/{imageNumber.total}
                      </div>
                    ) : null;
                  })()}
                </div>
              )
            })}
          </div>
        )}
        
        {/* Pool exhausted handling like inspiration */}
        {!hasMore && images.length > 0 && (
          <div style={{
            background: 'hsl(var(--card))',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '20px',
            textAlign: 'center',
            border: '1px solid hsl(var(--border))',
            margin: '20px auto',
            maxWidth: '1200px'
          }}>
            {poolExhausted ? (
              <>
                <p style={{ color: 'hsl(var(--foreground))', margin: '0 0 15px 0' }}>
                  Du hast alle deine Bilder gesehen! 🎨
                </p>
                <button 
                  onClick={refreshPool}
                  disabled={loading}
                  style={{
                    background: 'linear-gradient(135deg, hsl(47 100% 65%), hsl(280 70% 60%))',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  {loading ? 'Lade neue Reihenfolge...' : 'Neue zufällige Reihenfolge 🎲'}
                </button>
              </>
            ) : (
              <p style={{ color: 'hsl(var(--foreground))', margin: 0 }}>
                Du hast alle deine Bilder gesehen! 🎨
              </p>
            )}
          </div>
        )}
      </div>

      {/* Unified Modal System with new ImageModal Component */}
      <ImageModal
        selectedImage={selectedImage}
        onClose={closeModal}
        title="Meine Galerie"
        showUsername={false}
      />
    </div>
  )
}