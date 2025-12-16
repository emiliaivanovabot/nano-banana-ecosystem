'use client'

import React, { useState, useCallback } from 'react'
import ReactDOM from 'react-dom'
import './shared-modal.css'

interface ImageModalProps {
  selectedImage: {
    id: string
    result_image_url: string
    prompt?: string
    created_at: string
    generation_type?: string
    username?: string
  } | null
  onClose: () => void
  title: string
  showUsername?: boolean
}

export default function ImageModal({ 
  selectedImage, 
  onClose, 
  title, 
  showUsername = false 
}: ImageModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  
  // Pan/Drag state für Fullscreen
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [currentScale, setCurrentScale] = useState(1)

  const toggleFullscreen = useCallback(() => {
    if (!selectedImage) return
    
    if (!isFullscreen) {
      // Fullscreen aktivieren
      setIsFullscreen(true)
      document.body.style.overflow = 'hidden'
    } else {
      // Fullscreen deaktivieren - States zurücksetzen
      setIsFullscreen(false)
      setCurrentScale(1)
      setPanOffset({ x: 0, y: 0 })
      setIsPanning(false)
      document.body.style.overflow = 'hidden' // Modal bleibt
    }
  }, [selectedImage, isFullscreen])

  const closeModal = useCallback(() => {
    setIsFullscreen(false)
    setCurrentScale(1)
    setPanOffset({ x: 0, y: 0 })
    setIsPanning(false)
    document.body.style.overflow = 'unset'
    onClose()
  }, [onClose])

  const copyPrompt = useCallback((prompt: string) => {
    navigator.clipboard.writeText(prompt).then(() => {
      console.log('✅ Prompt copied to clipboard')
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    }).catch(err => {
      console.error('❌ Failed to copy prompt:', err)
    })
  }, [])

  if (!selectedImage) return null

  return (
    <>
      {/* Normal Modal */}
      {ReactDOM.createPortal(
        <div 
          className="mobile-viewport-modal"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          tabIndex={-1}
        >
          <div 
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h4 id="modal-title">{title}</h4>
              <button 
                onClick={closeModal}
                className="close-button"
              >
                ✖
              </button>
            </div>
            
            <img 
              src={selectedImage.result_image_url} 
              alt="Modal Image"
              className="modal-image"
              onClick={(e) => {
                // Smart Click Logic: Links/Rechts = Close, Mitte = Fullscreen
                const rect = e.currentTarget.getBoundingClientRect()
                const clickX = e.clientX - rect.left
                const width = rect.width
                
                if (clickX < width * 0.2 || clickX > width * 0.8) {
                  closeModal()
                } else {
                  toggleFullscreen()
                }
              }}
            />
            
            <div className="modal-info">
              <p className="modal-date">
                {showUsername && selectedImage.username && `${selectedImage.username} • `}
                {new Date(selectedImage.created_at).toLocaleString('de-DE')}
                {selectedImage.generation_type && ` • ${selectedImage.generation_type}`}
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
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(selectedImage.result_image_url, '_blank')
                    }}
                    className="download-button"
                  >
                    Bild öffnen
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      copyPrompt(selectedImage.prompt!)
                    }}
                    className="copy-prompt-button"
                  >
                    {copySuccess ? '✅ Kopiert!' : 'Prompt kopieren'}
                  </button>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    closeModal()
                  }}
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

      {/* Fullscreen Overlay mit Pan & Zoom */}
      {isFullscreen && ReactDOM.createPortal(
        <div className="fullscreen-overlay">
          <img 
            src={selectedImage.result_image_url} 
            alt="Fullscreen View"
            className="fullscreen-image"
            style={{
              cursor: currentScale > 1 ? (isPanning ? 'grabbing' : 'grab') : 'zoom-out',
              transition: isPanning ? 'none' : 'transform 0.1s ease',
              transform: `scale(${currentScale}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            }}
            onWheel={(e) => {
              e.preventDefault()
              e.stopPropagation()
              
              // Zoom Delta
              const zoomDelta = e.deltaY > 0 ? -0.2 : 0.2
              
              // Neuer Zoom - Minimum ist 1, Maximum 5
              const newScale = Math.max(1, Math.min(5, currentScale + zoomDelta))
              
              // Bei Zoom zurück zu 1 → Pan Offset resetten
              if (newScale === 1) {
                setPanOffset({ x: 0, y: 0 })
              }
              
              setCurrentScale(newScale)
              console.log(`Zoom: ${newScale}`)
            }}
            onMouseDown={(e) => {
              if (currentScale > 1) {
                e.preventDefault()
                e.stopPropagation()
                setIsPanning(true)
                setPanStart({ 
                  x: e.clientX - panOffset.x, 
                  y: e.clientY - panOffset.y 
                })
              }
            }}
            onMouseMove={(e) => {
              if (isPanning && currentScale > 1) {
                e.preventDefault()
                e.stopPropagation()
                setPanOffset({
                  x: e.clientX - panStart.x,
                  y: e.clientY - panStart.y
                })
              }
            }}
            onMouseUp={(e) => {
              if (isPanning) {
                e.preventDefault()
                e.stopPropagation()
                setIsPanning(false)
              } else if (!isPanning && currentScale === 1) {
                // Nur bei Scale 1 und ohne Pan → zurück
                e.stopPropagation()
                toggleFullscreen()
              }
            }}
            onMouseLeave={() => {
              setIsPanning(false)
            }}
            // Touch Events für Mobile
            onTouchStart={(e) => {
              if (currentScale > 1 && e.touches.length === 1) {
                e.preventDefault()
                setIsPanning(true)
                const touch = e.touches[0]
                setPanStart({ 
                  x: touch.clientX - panOffset.x, 
                  y: touch.clientY - panOffset.y 
                })
              }
            }}
            onTouchMove={(e) => {
              if (isPanning && currentScale > 1 && e.touches.length === 1) {
                e.preventDefault()
                const touch = e.touches[0]
                setPanOffset({
                  x: touch.clientX - panStart.x,
                  y: touch.clientY - panStart.y
                })
              }
            }}
            onTouchEnd={(e) => {
              if (isPanning) {
                e.preventDefault()
                setIsPanning(false)
              } else if (currentScale === 1) {
                e.preventDefault()
                toggleFullscreen()
              }
            }}
          />
        </div>,
        document.body
      )}
    </>
  )
}