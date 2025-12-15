'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@repo/auth-config'

export default function NanoBananaPage() {
  // V1 State Management - EXACT REPLICATION
  const { user, session, loading: authLoading } = useAuth()
  const [userSettings, setUserSettings] = useState(null)
  const [prompt, setPrompt] = useState('')
  const [images, setImages] = useState([])
  const [userGender, setUserGender] = useState('female')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [resolution, setResolution] = useState('2K')
  const [aspectRatio, setAspectRatio] = useState('9:16')
  const [showMainFaceImage, setShowMainFaceImage] = useState(true)
  const [generationTime, setGenerationTime] = useState(null)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [templatesCollapsed, setTemplatesCollapsed] = useState(true)
  const [showPersonalization, setShowPersonalization] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  // V1 Style - No complex face image states needed
  const [personalAppearanceText, setPersonalAppearanceText] = useState('')
  const [isEditingPersonalText, setIsEditingPersonalText] = useState(false)
  const [usePersonalization, setUsePersonalization] = useState(true)
  const fileRef = useRef(null)

  // V1 Mobile Detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // V1 Personalization Generator - EXACT COPY
  const generatePersonalizationText = () => {
    if (!userSettings) return ""
    
    const parts = []
    
    // Age - convert to natural description
    if (userSettings.age_range) {
      switch(userSettings.age_range) {
        case 'under-20': parts.push("A teenage woman"); break;
        case 'young-adult': parts.push("A young adult woman"); break;
        case 'adult': parts.push("A confident woman"); break;
        case 'over-40': parts.push("A mature woman"); break;
        default: parts.push("A woman"); break;
      }
    }
    
    const details = []
    
    // Hair
    if (userSettings.hair_color) {
      details.push(`${userSettings.hair_color.toLowerCase()} hair`)
    }
    
    // Eyes  
    if (userSettings.eye_color) {
      details.push(`${userSettings.eye_color.toLowerCase()} eyes`)
    }
    
    // Skin
    if (userSettings.skin_tone) {
      details.push(`${userSettings.skin_tone.toLowerCase()} skin tone`)
    }
    
    // Build the base sentence
    let baseText = ""
    if (parts.length === 0) parts.push("A woman")
    
    if (details.length > 0) {
      baseText = `${parts[0]} with ${details.join(", ")}`
    } else {
      baseText = parts[0]
    }
    
    // Add personal appearance text if available AND toggle is enabled
    if (usePersonalization && personalAppearanceText.trim()) {
      return `${baseText}, ${personalAppearanceText.trim()}`
    }
    
    return baseText
  }

  // User Settings Loading - Dashboard Pattern
  useEffect(() => {
    if (user) {
      console.log('🔄 Loading user settings for user:', user.id)
      loadUserSettings()
    }
  }, [user])

  const loadUserSettings = async () => {
    if (!user?.id) return

    try {
      console.log('🔍 Loading user settings for:', user.id)
      const response = await fetch(`/api/user/settings?userId=${user.id}`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('📦 User settings response:', data)
      
      if (data.settings) {
        console.log('✅ User settings loaded:', data.settings)
        setUserSettings(data.settings)
        setResolution(data.settings.default_resolution || '2K')
        setAspectRatio(data.settings.default_aspect_ratio || '9:16')
        setPersonalAppearanceText(data.settings.personal_appearance_text || '')
        setShowPersonalization(data.settings.use_personalization !== false)
        setUsePersonalization(data.settings.use_personal_appearance_text !== false)
        console.log('🖼️ Face image URL:', data.settings.main_face_image_url)
        // V1 Style - Face image will be displayed immediately when userSettings is set
      } else {
        console.log('❌ No settings in response')
      }
    } catch (error) {
      console.error('❌ Error loading user settings:', error)
    }
  }

  // V1 Style - Face image displayed directly when userSettings is available

  // Save personal appearance text to database - V1 EXACT
  const savePersonalAppearanceText = async (newText) => {
    if (!user?.id) return

    try {
      const response = await fetch('/api/user/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          personal_appearance_text: newText
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save personal appearance text')
      }

      console.log('✅ Personal appearance text saved successfully')
    } catch (error) {
      console.error('❌ Error saving personal appearance text:', error)
    }
  }

  // V1 Prompt Templates - EXACT COPY
  const promptTemplates = [
    {
      category: "Beliebte Anfragen",
      prompts: [
        "sitting in a cozy coffee shop, warm lighting, casual outfit, looking thoughtful",
        "walking through a vibrant city street, stylish outfit, confident pose, urban background",
        "relaxing on a beautiful beach, summer outfit, natural lighting, peaceful expression"
      ],
      labels: ["Coffee Shop", "City Walk", "Beach Vibes"]
    },
    {
      category: "Portrait Styles",
      prompts: [
        "professional headshot, business attire, clean background, confident expression",
        "artistic portrait, dramatic lighting, creative background, expressive pose",
        "casual portrait, natural lighting, comfortable outfit, genuine smile"
      ],
      labels: ["Business", "Artistic", "Casual"]
    },
    {
      category: "Fashion & Style",
      prompts: [
        "elegant evening dress, sophisticated pose, luxurious setting, glamorous lighting",
        "trendy streetwear, urban environment, dynamic pose, modern style",
        "vintage inspired outfit, classic pose, retro background, timeless elegance"
      ],
      labels: ["Elegant", "Streetwear", "Vintage"]
    }
  ]

  // V1 Template Selection
  const insertPromptTemplate = (template: string, categoryIndex: number, promptIndex: number) => {
    setPrompt(template)
    setSelectedTemplate(`${categoryIndex}-${promptIndex}`)
  }

  // V1 Image Upload Logic - EXACT COPY
  const handleImageUpload = (e: any, gender = 'female') => {
    const files = Array.from(e.target.files) as File[]
    if (files.length > 14) {
      alert('Maximal 14 Bilder erlaubt')
      return
    }

    setUserGender(gender)
    
    Promise.all(
      files.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = (e: any) => resolve({
            file: file,
            base64: e.target?.result,
            name: file.name
          })
          reader.readAsDataURL(file)
        })
      })
    ).then(newImages => {
      setImages(prev => [...prev, ...newImages].slice(0, 14))
    })
  }

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const clearAllImages = () => {
    setImages([])
  }

  // V1 Download Function - EXACT COPY
  const downloadImage = () => {
    if (!result?.image) return
    
    try {
      // Convert base64 to blob for proper download
      const base64Data = result.image.split(',')[1] // Remove data:image/png;base64, prefix
      const mimeType = result.image.split(',')[0].split(':')[1].split(';')[0] // Extract MIME type
      
      // Convert base64 to binary
      const binaryData = atob(base64Data)
      const bytes = new Uint8Array(binaryData.length)
      for (let i = 0; i < binaryData.length; i++) {
        bytes[i] = binaryData.charCodeAt(i)
      }
      
      // Create blob and download
      const blob = new Blob([bytes], { type: mimeType })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `nano-banana-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed', error)
      // Fallback to simple download
      const link = document.createElement('a')
      link.href = result.image
      link.download = `nano-banana-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  // V1 Generation Logic - EXACT COPY
  const handleGenerate = async () => {
    console.log('🚀 GENERATE BUTTON CLICKED!')
    console.log('🔍 Current state:', {
      prompt: prompt.trim(),
      promptLength: prompt.length,
      hasUserSettings: !!userSettings,
      hasApiKey: !!userSettings?.gemini_api_key,
      loading,
      imagesCount: images.length,
      showPersonalization,
      showMainFaceImage,
      mainFaceImageUrl: userSettings?.main_face_image_url
    })

    if (!prompt.trim()) {
      console.log('❌ No prompt provided')
      alert('Bitte gib einen Prompt ein')
      return
    }

    setLoading(true)
    setResult(null)
    
    const startTime = Date.now()

    try {
      // V1 Gemini API Call - EXACT COPY
      const apiKey = userSettings?.gemini_api_key
      const model = 'gemini-3-pro-image-preview'
      
      console.log('🔑 API KEY CHECK:', {
        hasUserSettings: !!userSettings,
        hasApiKey: !!apiKey,
        apiKeyLength: apiKey?.length,
        apiKeyStart: apiKey?.substring(0, 10) + '...',
        userSettingsKeys: userSettings ? Object.keys(userSettings) : 'none'
      })
      
      if (!apiKey) {
        throw new Error('Dein Gemini API Key fehlt. Bitte gehe zu Settings und trage ihn ein.')
      }

      // Build final prompt with personalization - V1 EXACT
      let finalPrompt = prompt
      if (showPersonalization && userSettings?.main_face_image_url && showMainFaceImage && userSettings) {
        const personalizationText = generatePersonalizationText()
        if (personalizationText) {
          finalPrompt = `${personalizationText}. ${prompt}`
        }
      }
      
      console.log('🍌 Final prompt:', finalPrompt)
      
      // V1 API Format - EXACT COPY
      const parts: any[] = [
        { text: finalPrompt }
      ]
      
      // Hauptgesichtsbild hinzufügen - V1 EXACT
      if (userSettings?.main_face_image_url && showPersonalization && showMainFaceImage) {
        try {
          const response = await fetch(userSettings.main_face_image_url)
          const blob = await response.blob()
          const base64Data = await new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.readAsDataURL(blob)
          })
          
          const base64String = base64Data.split(',')[1]
          const mimeType = base64Data.split(';')[0].split(':')[1]
          
          parts.push({
            inline_data: {
              mime_type: mimeType,
              data: base64String
            }
          })
          console.log('✅ Main face image added to generation')
        } catch (error) {
          console.warn('Failed to load main face image:', error)
        }
      }

      // Additional uploaded images - V1 EXACT
      for (const image of images) {
        if (image.base64) {
          try {
            const base64Data = image.base64.split(',')[1]
            const mimeType = image.base64.split(';')[0].split(':')[1]
            
            parts.push({
              inline_data: {
                mime_type: mimeType,
                data: base64Data
              }
            })
            console.log('✅ Added uploaded image to parts:', { mimeType, dataLength: base64Data.length })
          } catch (error) {
            console.warn('Failed to add uploaded image:', error)
          }
        }
      }

      console.log('📦 Total parts being sent:', parts.length, 'parts')
      console.log('📋 Parts structure:', parts.map((part, i) => ({
        index: i,
        type: part.text ? 'text' : 'image',
        textLength: part.text?.length,
        hasInlineData: !!part.inline_data
      })))

      // V1 Request Body - WITH GENERATION CONFIG
      const requestBody = {
        contents: [{
          role: "user",
          parts: parts
        }],
        generationConfig: {
          response_modalities: ['TEXT', 'IMAGE'],
          image_config: {
            aspect_ratio: aspectRatio,
            image_size: resolution
          }
        }
      }

      console.log('🚀 Making Gemini API call...')
      console.log('📋 API Details:', {
        model: model,
        url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        hasApiKey: !!apiKey,
        apiKeyStart: apiKey?.substring(0, 10),
        partsCount: parts.length,
        hasImages: parts.filter(p => p.inline_data).length
      })
      
      // V1 API Call - EXACT COPY
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
          },
          body: JSON.stringify(requestBody)
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error('🔴 GEMINI API FULL ERROR:', {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText
        })
        console.error('📦 FULL REQUEST BODY:', JSON.stringify(requestBody, null, 2))
        throw new Error(`Gemini API Error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('📦 Gemini response:', data)

      // Extract image from response - check all possible locations
      if (data.candidates && data.candidates[0]) {
        const candidate = data.candidates[0]
        let imageUrl = null
        
        // Method 1: Check content.parts for inlineData (NEW FORMAT)
        if (candidate.content && candidate.content.parts) {
          const imagePart = candidate.content.parts.find(part => part.inlineData)
          if (imagePart && imagePart.inlineData) {
            imageUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`
            console.log('✅ Found image in content.parts.inlineData')
          }
        }
        
        // Method 2: Check content.parts for inline_data (OLD FORMAT)
        if (!imageUrl && candidate.content && candidate.content.parts) {
          const imagePart = candidate.content.parts.find(part => part.inline_data)
          if (imagePart && imagePart.inline_data) {
            imageUrl = `data:${imagePart.inline_data.mime_type};base64,${imagePart.inline_data.data}`
            console.log('✅ Found image in content.parts.inline_data')
          }
        }
        
        // Method 3: Check direct image property
        if (!imageUrl && candidate.image) {
          imageUrl = candidate.image
          console.log('✅ Found image in direct image property')
        }
        
        // Method 4: Check parts array directly for inlineData
        if (!imageUrl && candidate.parts) {
          const imagePart = candidate.parts.find(part => part.inlineData)
          if (imagePart && imagePart.inlineData) {
            imageUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`
            console.log('✅ Found image in parts.inlineData')
          }
        }
        
        // Method 5: Check parts array directly for inline_data
        if (!imageUrl && candidate.parts) {
          const imagePart = candidate.parts.find(part => part.inline_data)
          if (imagePart && imagePart.inline_data) {
            imageUrl = `data:${imagePart.inline_data.mime_type};base64,${imagePart.inline_data.data}`
            console.log('✅ Found image in parts.inline_data')
          }
        }
        
        if (imageUrl) {
          const finalGenerationTime = ((Date.now() - startTime) / 1000).toFixed(1)
          setGenerationTime(finalGenerationTime)
          
          setResult({
            image: imageUrl,
            prompt: finalPrompt,
            timestamp: new Date().toISOString(),
            generationTime: finalGenerationTime
          })
          
          console.log(`✅ Image generated in ${finalGenerationTime}s`)
        } else {
          console.error('🔍 Response structure:', JSON.stringify(data, null, 2))
          throw new Error('No image found in response - check console for full response')
        }
      } else {
        console.error('🔍 Response structure:', JSON.stringify(data, null, 2))
        throw new Error('Invalid response format from Gemini API')
      }

    } catch (error) {
      console.error('❌ Generation error:', error)
      alert(`Generation failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'hsl(var(--background))',
      padding: '16px',
      color: 'hsl(var(--foreground))'
    }}>
      {/* V1 Header - EXACT COPY */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'hsl(var(--card))',
          backdropFilter: 'blur(20px)',
          padding: '12px 16px',
          borderRadius: '16px',
          border: '1px solid hsl(var(--border))',
          ...(isMobile ? {} : { padding: '16px 20px' })
        }}>
          <Link 
            href="/generation-modes" 
            style={{ 
              color: 'hsl(var(--foreground))',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '8px',
              transition: 'background-color 0.2s'
            }}
          >
            <span>←</span>
            <span>Modi</span>
          </Link>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: '700',
              fontSize: '1.2rem',
              background: 'linear-gradient(135deg, #ec4899 0%, #f59e0b 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              🍌 Nano Banana Classic
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: 'hsl(var(--muted-foreground))',
              fontFamily: "'Space Grotesk', sans-serif"
            }}>
              nano banana pro
            </div>
          </div>
          
          <Link 
            href="/settings" 
            style={{ 
              color: 'hsl(var(--foreground))',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '8px',
              transition: 'background-color 0.2s'
            }}
          >
            <span>⚙️</span>
            <span>Settings</span>
          </Link>
        </div>
      </div>

      {/* Username Display */}
      {user && (
        <div style={{
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'inline-block',
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '20px',
            padding: '6px 16px',
            fontSize: '0.9rem'
          }}>
            <span style={{ color: 'hsl(var(--muted-foreground))' }}>Angemeldet als </span>
            <span style={{ fontWeight: '600' }}>{user.username}</span>
          </div>
        </div>
      )}

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        {/* V1 Settings + Face Image Section - EXACT COPY */}
        <div style={{ 
          marginBottom: '16px',
          fontSize: '0.9rem'
        }}>
          <h3 style={{ marginBottom: '8px', textAlign: 'left', fontSize: '1rem' }}>
            Einstellungen
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 80px',
            gap: '12px',
            alignItems: 'start'
          }}>
            {/* Left Column: Stacked Buttons */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              height: '80px'
            }}>
              <button
                onClick={() => {
                  if (resolution === '1K') setResolution('2K')
                  else if (resolution === '2K') setResolution('4K')
                  else setResolution('1K')
                }}
                style={{
                  padding: '6px 10px',
                  background: 'hsl(47 100% 65%)',
                  color: 'black',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '0.8rem',
                  transition: 'all 0.2s ease',
                  height: '36px',
                  flex: '1'
                }}
                onMouseEnter={(e: any) => {
                  e.target.style.transform = 'scale(1.02)'
                  e.target.style.boxShadow = '0 2px 8px rgba(251, 113, 133, 0.15)'
                }}
                onMouseLeave={(e: any) => {
                  e.target.style.transform = 'scale(1)'
                  e.target.style.boxShadow = 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontWeight: '600', color: 'black' }}>{resolution}</span>
                  <span style={{ fontSize: '0.7rem', color: 'black' }}>
                    {resolution === '1K' ? 'Fast' : resolution === '2K' ? 'Optimal' : 'Max'}
                  </span>
                </div>
              </button>
              
              <button
                onClick={() => {
                  if (aspectRatio === '9:16') setAspectRatio('16:9')
                  else if (aspectRatio === '16:9') setAspectRatio('4:3')
                  else if (aspectRatio === '4:3') setAspectRatio('3:4')
                  else if (aspectRatio === '3:4') setAspectRatio('2:3')
                  else if (aspectRatio === '2:3') setAspectRatio('3:2')
                  else setAspectRatio('9:16')
                }}
                style={{
                  padding: '6px 10px',
                  background: 'hsl(280 70% 60%)',
                  color: 'hsl(var(--secondary-foreground))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '0.8rem',
                  transition: 'all 0.2s ease',
                  height: '36px',
                  flex: '1'
                }}
                onMouseEnter={(e: any) => {
                  e.target.style.transform = 'scale(1.02)'
                  e.target.style.boxShadow = '0 2px 8px rgba(251, 113, 133, 0.15)'
                }}
                onMouseLeave={(e: any) => {
                  e.target.style.transform = 'scale(1)'
                  e.target.style.boxShadow = 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontWeight: '600', color: 'hsl(var(--secondary-foreground))' }}>{aspectRatio}</span>
                  <span style={{ fontSize: '0.7rem', color: 'hsl(var(--secondary-foreground))' }}>
                    {aspectRatio === '9:16' ? 'Story' : 
                     aspectRatio === '16:9' ? 'Widescreen' :
                     aspectRatio === '4:3' ? 'Post' :
                     aspectRatio === '3:4' ? 'Portrait' :
                     aspectRatio === '2:3' ? 'Portrait' : 'Landscape'}
                  </span>
                </div>
              </button>
            </div>

            {/* Right Column: Main Face Image Display */}
            <div 
              style={{
                position: 'relative',
                width: '80px',
                height: '80px',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid rgba(251, 191, 36, 0.3)',
                background: 'hsl(var(--card))'
              }}
            >
              {userSettings?.main_face_image_url && showMainFaceImage ? (
                <>
                  <img 
                    src={userSettings.main_face_image_url}
                    alt="Gesichtsbild"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      console.log('Face image failed to load:', userSettings.main_face_image_url)
                      e.target.style.display = 'none'
                    }}
                  />
                  <button
                    onClick={() => setShowMainFaceImage(false)}
                    style={{
                      position: 'absolute',
                      top: '2px',
                      right: '2px',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: 'rgba(0, 0, 0, 0.7)',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      lineHeight: '1'
                    }}
                    title="Gesichtsbild entfernen"
                  >
                    ×
                  </button>
                </>
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  color: '#9CA3AF',
                  cursor: showMainFaceImage === false ? 'pointer' : 'default'
                }}
                onClick={() => {
                  if (showMainFaceImage === false) {
                    setShowMainFaceImage(true) // Wiederherstellen
                  }
                }}
                title={showMainFaceImage === false ? "Gesichtsbild wiederherstellen" : "Kein Gesichtsbild verfügbar"}
                >
                  👤
                  {showMainFaceImage === false && (
                    <div style={{ fontSize: '8px', marginTop: '2px', textAlign: 'center' }}>
                      Klicken zum<br/>Wiederherstellen
                    </div>
                  )}
                </div>
              )}
              <div style={{
                position: 'absolute',
                bottom: '2px',
                right: '2px',
                fontSize: '8px',
                background: 'rgba(0,0,0,0.6)',
                color: 'white',
                padding: '1px 3px',
                borderRadius: '3px',
                fontWeight: '500'
              }}>
                Face
              </div>
            </div>
          </div>
        </div>

        {/* V1 Image Upload Section - EXACT COPY */}
        <div style={{ 
          marginBottom: '20px',
          padding: '16px',
          background: 'hsl(var(--card))',
          borderRadius: '12px',
          border: '1px solid hsl(var(--border))'
        }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px', 
            fontWeight: '600',
            fontSize: '0.95rem',
            fontFamily: "'Space Grotesk', sans-serif",
            background: 'linear-gradient(135deg, #ec4899 0%, #f59e0b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            <span>📷</span>
            Bilder hochladen (optional, max 14):
          </label>
          
          {/* Hidden file inputs for different genders */}
          <input 
            ref={fileRef}
            type="file" 
            multiple
            accept="image/*" 
            onChange={(e) => handleImageUpload(e, 'female')}
            style={{ display: 'none' }}
          />
          
          <input 
            id="male-upload"
            type="file" 
            multiple
            accept="image/*" 
            onChange={(e) => handleImageUpload(e, 'male')}
            style={{ display: 'none' }}
          />
          
          <input 
            id="neutral-upload"
            type="file" 
            multiple
            accept="image/*" 
            onChange={(e) => handleImageUpload(e, userGender)}
            style={{ display: 'none' }}
          />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Show gender-specific buttons only when main face is removed AND no additional images */}
            {!showMainFaceImage && images.length === 0 ? (
              <>
                <button 
                  onClick={() => fileRef.current?.click()}
                  style={{
                    padding: '10px 15px',
                    backgroundColor: '#F59E0B',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  👩 Frauengesicht
                </button>
                
                <button 
                  onClick={() => document.getElementById('male-upload')?.click()}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#3B82F6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="Spezial-Upload für männliche Fotos - optimiert für Mann-zu-Frau Generierung"
                >
                  👨 Manngesicht
                </button>
              </>
            ) : (
              /* Show neutral upload button when images already exist */
              <button 
                onClick={() => document.getElementById('neutral-upload')?.click()}
                style={{
                  padding: '10px 15px',
                  background: '#9CA3AF',
                  color: 'black',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                Weitere Bilder hinzufügen
              </button>
            )}
            
            {/* Clear all button inside the flex container when images exist */}
            {images.length > 0 && (
              <button 
                onClick={clearAllImages}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#EF4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                🗑️ Alle löschen
              </button>
            )}
          </div>

          <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
            {images.length}/14 Bilder • Text-to-Image wenn keine Bilder, Image-Edit wenn Bilder vorhanden
          </div>
          
          <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px', fontStyle: 'italic' }}>
            {!showMainFaceImage && images.length === 0 ? (
              <>💡 Wähle den passenden Button: "Frauengesicht" (90% der Nutzer) oder "Manngesicht" für männliche Fotos</>
            ) : (
              <>📎 {showMainFaceImage ? 'Gesichtsbild geladen' : 'Gender festgelegt'} - du kannst bis zu {showMainFaceImage ? (13 - images.length) : (14 - images.length)} weitere Bilder hinzufügen</>
            )}
          </div>
        </div>

        {/* Image Preview */}
        {images.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
              gap: '10px',
              width: '100%',
              maxWidth: '100%',
              overflow: 'hidden',
              boxSizing: 'border-box'
            }}>
              {images.map((img, index) => (
                <div key={index} style={{ 
                  position: 'relative',
                  aspectRatio: '1',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid hsl(var(--border))'
                }}>
                  <img
                    src={img.base64}
                    alt={`Upload ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <button
                    onClick={() => removeImage(index)}
                    style={{
                      position: 'absolute',
                      top: '2px',
                      right: '2px',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: 'rgba(0, 0, 0, 0.7)',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: 'bold'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* V1 Prompt Templates - EXACT COPY */}
        <div style={{
          background: 'hsl(var(--card))',
          borderRadius: '12px',
          border: '1px solid hsl(var(--border))',
          marginBottom: '20px'
        }}>
          <div 
            style={{ 
              cursor: 'pointer', 
              padding: '16px',
              borderBottom: templatesCollapsed ? 'none' : '1px solid hsl(var(--border))'
            }}
            onClick={() => setTemplatesCollapsed(!templatesCollapsed)}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>
                Prompt Vorlagen
              </h3>
              <span style={{ 
                fontSize: '0.8rem', 
                color: 'hsl(var(--muted-foreground))', 
                transition: 'transform 0.3s ease', 
                transform: templatesCollapsed ? 'rotate(0deg)' : 'rotate(180deg)' 
              }}>
                ▼
              </span>
            </div>
          </div>
          
          {!templatesCollapsed && promptTemplates.map((category, categoryIndex) => (
            <div key={categoryIndex} style={{ padding: '16px', borderTop: '1px solid hsl(var(--border))' }}>
              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontWeight: '500', color: 'hsl(var(--foreground))' }}>{category.category}</span>
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '8px'
              }}>
                {category.prompts.map((template, promptIndex) => {
                  const templateId = `${categoryIndex}-${promptIndex}`
                  const isSelected = selectedTemplate === templateId
                  
                  return (
                    <button
                      key={promptIndex}
                      onClick={() => insertPromptTemplate(template, categoryIndex, promptIndex)}
                      style={{
                        padding: '12px',
                        background: isSelected ? 'hsl(var(--primary))' : 'hsl(var(--secondary))',
                        color: isSelected ? '#000000' : 'hsl(var(--secondary-foreground))',
                        border: isSelected ? '2px solid hsl(var(--primary))' : '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '0.85rem',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ 
                        fontWeight: '500', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center' 
                      }}>
                        <span>{category.labels[promptIndex]}</span>
                        {isSelected && <span style={{ fontSize: '14px' }}>✓</span>}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* V1 Prompt Input - EXACT COPY */}
        <div style={{
          background: 'hsl(var(--card))',
          borderRadius: '12px',
          border: '1px solid hsl(var(--border))',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '600',
            fontSize: '0.95rem',
            background: 'linear-gradient(135deg, #ec4899 0%, #f59e0b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            💭 Prompt eingeben:
          </label>
          
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Beschreibe was du generieren möchtest..."
            style={{
              width: '100%',
              height: '120px',
              padding: '12px',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              background: 'hsl(var(--background))',
              color: 'hsl(var(--foreground))',
              fontSize: '0.95rem',
              resize: 'vertical',
              fontFamily: 'inherit',
              boxSizing: 'border-box'
            }}
          />
          
          {/* V1 Personalization Section - EXACT COPY */}
        {userSettings?.main_face_image_url && showMainFaceImage && userSettings && (userSettings.hair_color || userSettings.eye_color || userSettings.skin_tone || userSettings.age_range) && (
          <div style={{
            marginBottom: '15px',
            background: 'hsl(var(--card))'
          }}>
            <button
              onClick={async () => {
                const newValue = !showPersonalization
                setShowPersonalization(newValue)
                
                // Save to database
                try {
                  const response = await fetch('/api/user/settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      userId: user.id,
                      use_personalization: newValue
                    })
                  })
                  console.log('✅ Saved personalization toggle:', newValue)
                } catch (error) {
                  console.error('❌ Error saving personalization toggle:', error)
                }
              }}
              style={{
                width: '100%',
                padding: '10px 15px',
                background: showPersonalization ? 'rgba(251, 191, 36, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: 'none',
                borderBottom: showPersonalization ? '1px solid rgba(251, 191, 36, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
                fontSize: '16px',
                fontWeight: '600',
                color: 'hsl(var(--muted-foreground))',
                fontFamily: "'Space Grotesk', sans-serif",
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <span>Mein Aussehen verwenden</span>
              <div style={{
                marginLeft: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '36px',
                  height: '20px',
                  backgroundColor: showPersonalization ? '#22c55e' : '#ccc',
                  borderRadius: '10px',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    position: 'absolute',
                    left: showPersonalization ? '18px' : '2px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }} />
                </div>
              </div>
            </button>

            {showPersonalization && (
              <div style={{
                padding: '15px',
                background: 'rgba(251, 191, 36, 0.05)'
              }}>
                {/* Final prompt preview */}
                {personalAppearanceText.trim() && (
                  <div style={{
                    marginTop: '10px',
                    padding: '8px',
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#059669',
                    fontWeight: '500'
                  }}>
                    ✅ Final prompt: "{generatePersonalizationText()}"
                  </div>
                )}
                
                {/* Zwei Reihen Layout */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Reihe 1: Basis + Personalisierung */}
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '8px' }}>
                    <div style={{ flex: '1' }}>
                      <span style={{
                        color: '#374151',
                        fontWeight: '500',
                        fontSize: '14px'
                      }}>
                        {userSettings && (() => {
                          const parts = []
                          if (userSettings.age_range) {
                            switch(userSettings.age_range) {
                              case 'under-20': parts.push("A teenage woman"); break;
                              case 'young-adult': parts.push("A young adult woman"); break;
                              case 'adult': parts.push("A confident woman"); break;
                              case 'over-40': parts.push("A mature woman"); break;
                              default: parts.push("A woman"); break;
                            }
                          }
                          const details = []
                          if (userSettings.hair_color) details.push(`${userSettings.hair_color.toLowerCase()} hair`)
                          if (userSettings.eye_color) details.push(`${userSettings.eye_color.toLowerCase()} eyes`)
                          if (userSettings.skin_tone) details.push(`${userSettings.skin_tone.toLowerCase()} skin tone`)
                          
                          if (parts.length === 0) parts.push("A woman")
                          
                          if (details.length > 0) {
                            return `${parts[0]} with ${details.join(", ")}`
                          }
                          return parts[0]
                        })()}
                        {usePersonalization && personalAppearanceText.trim() && (
                          <span style={{
                            color: '#059669',
                            fontWeight: '500',
                            fontSize: '14px'
                          }}>
                            {`, ${personalAppearanceText.trim()}`}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                  
                  {/* Reihe 2: Toggle und Editierfeld */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <div 
                      style={{
                        fontSize: '12px',
                        color: '#f59e0b',
                        fontWeight: '500',
                        cursor: 'pointer',
                        padding: '4px 0'
                      }}
                      onClick={() => setIsEditingPersonalText(!isEditingPersonalText)}
                    >
                      + Persönliche Details ändern <span style={{ fontSize: '10px', color: '#6B7280' }}>← klicken</span>
                    </div>
                    <div
                      onClick={async () => {
                        const newValue = !usePersonalization
                        setUsePersonalization(newValue)
                        
                        // Save to database
                        try {
                          const response = await fetch('/api/user/settings', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              userId: user.id,
                              use_personal_appearance_text: newValue
                            })
                          })
                          console.log('✅ Saved text toggle to database:', newValue)
                        } catch (error) {
                          console.error('❌ Exception (text toggle):', error)
                        }
                      }}
                      style={{
                        cursor: 'pointer',
                        width: '28px',
                        height: '14px',
                        backgroundColor: usePersonalization ? '#22c55e' : '#ccc',
                        borderRadius: '7px',
                        position: 'relative',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{
                        width: '10px',
                        height: '10px',
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        position: 'absolute',
                        left: usePersonalization ? '16px' : '2px',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                      }} />
                    </div>
                  </div>
                  
                  {/* Edit textarea */}
                  {isEditingPersonalText && (
                    <textarea
                      value={personalAppearanceText}
                      onChange={(e) => {
                        setPersonalAppearanceText(e.target.value)
                        savePersonalAppearanceText(e.target.value)
                      }}
                      placeholder="z.B. wearing elegant jewelry, confident posture, professional makeup..."
                      style={{
                        width: '100%',
                        minHeight: '60px',
                        padding: '8px',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                        background: 'hsl(var(--background))',
                        color: 'hsl(var(--foreground))',
                        fontSize: '13px',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                        marginTop: '8px'
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setIsEditingPersonalText(false)
                        }
                      }}
                      onBlur={() => {
                        setIsEditingPersonalText(false)
                      }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )}

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '12px',
            gap: '12px'
          }}>
            <div style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>
              {prompt.length} Zeichen
            </div>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              
              <button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim() || !userSettings?.gemini_api_key}
                style={{
                  padding: '10px 20px',
                  background: loading || !prompt.trim() || !userSettings?.gemini_api_key 
                    ? '#9CA3AF' 
                    : 'linear-gradient(135deg, #ec4899 0%, #f59e0b 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading || !prompt.trim() || !userSettings?.gemini_api_key ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '0.95rem',
                  transition: 'all 0.2s ease'
                }}
              >
                {loading ? '⏳ Generiert...' : '🍌 Generieren'}
              </button>
            </div>
          </div>
          
          {!userSettings?.gemini_api_key && (
            <div style={{
              marginTop: '8px',
              padding: '8px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '6px',
              fontSize: '0.8rem',
              color: '#DC2626'
            }}>
              ⚠️ Gemini API Key fehlt. Bitte füge ihn in den Settings hinzu.
            </div>
          )}
        </div>

        {/* V1 Result Display - EXACT COPY */}
        {result && (
          <div style={{
            background: 'hsl(var(--card))',
            borderRadius: '12px',
            border: '1px solid hsl(var(--border))',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <h3 style={{
              margin: '0 0 16px 0',
              fontWeight: '600',
              background: 'linear-gradient(135deg, #ec4899 0%, #f59e0b 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              🎨 Generiertes Bild
            </h3>
            
            <div style={{
              borderRadius: '8px',
              overflow: 'hidden',
              marginBottom: '12px'
            }}>
              <img
                src={result.image}
                alt="Generated"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block'
                }}
              />
            </div>
            
            <div style={{
              fontSize: '0.8rem',
              color: 'hsl(var(--muted-foreground))',
              marginBottom: '8px'
            }}>
              <strong>Prompt:</strong> {result.prompt}
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '12px'
            }}>
              <div style={{
                fontSize: '0.75rem',
                color: 'hsl(var(--muted-foreground))'
              }}>
                ⏱️ Generiert in {result.generationTime}s • {new Date(result.timestamp).toLocaleString()}
              </div>
              
              <button
                onClick={downloadImage}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#10B981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                📥 Download
              </button>
            </div>
          </div>
        )}

        {/* V1 Loading State - EXACT COPY */}
        {loading && (
          <div style={{
            background: 'hsl(var(--card))',
            borderRadius: '12px',
            border: '1px solid hsl(var(--border))',
            padding: '32px',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid hsl(var(--border))',
              borderTop: '3px solid #F59E0B',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px auto'
            }}></div>
            <p style={{
              margin: 0,
              color: 'hsl(var(--muted-foreground))',
              fontSize: '0.9rem'
            }}>
              🍌 Dein Nano Banana wird generiert...
            </p>
          </div>
        )}

      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}