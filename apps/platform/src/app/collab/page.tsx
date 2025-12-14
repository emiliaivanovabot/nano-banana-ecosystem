'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '@repo/auth-config'
import { createServerSupabaseClient } from '@repo/database'

// V1 User Settings Interface (shared with settings page)
interface UserSettings {
  username: string
  email: string
  gemini_api_key: string
  main_face_image_url: string
  face_2_image_url: string
  face_2_name: string
  face_3_image_url: string
  face_3_name: string
  hair_color: string
  eye_color: string
  skin_tone: string
  age_range: string
  default_resolution: string
  default_aspect_ratio: string
  use_personalization: boolean
  use_personal_appearance_text: boolean
  personal_appearance_text: string
  favorite_prompts: string[]
}

export default function CollabPage() {
  // V1 State Management - exact replication
  const { user } = useAuth()
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null)
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [results, setResults] = useState([])
  const [images, setImages] = useState([])
  const [userGender, setUserGender] = useState('female')
  const [resolution, setResolution] = useState('2K')
  const [aspectRatio, setAspectRatio] = useState('9:16')
  const [collabPartnerImage, setCollabPartnerImage] = useState(null)
  const [hasCollabPartner, setHasCollabPartner] = useState(false)
  const [showMainFaceImage, setShowMainFaceImage] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [templatesCollapsed, setTemplatesCollapsed] = useState(true)
  const [personalAppearanceText, setPersonalAppearanceText] = useState('')
  const [usePersonalization, setUsePersonalization] = useState(true)

  // V1 User Settings Loading - exact copy
  useEffect(() => {
    const loadUserSettings = async () => {
      if (!user?.id) return

      try {
        const response = await fetch(`/api/user/settings?userId=${user.id}`)
        const data = await response.json()
        
        if (data.settings) {
          setUserSettings(data.settings)
          setResolution(data.settings.default_resolution || '2K')
          setAspectRatio(data.settings.default_aspect_ratio || '9:16')
          setPersonalAppearanceText(data.settings.personal_appearance_text || '')
          setUsePersonalization(data.settings.use_personalization !== false)
        }
      } catch (error) {
        console.error('Error loading user settings:', error)
      }
    }

    loadUserSettings()
  }, [user?.id])

  // V1 Personalization Generator - exact copy from Collab
  const generatePersonalizationText = () => {
    if (!userSettings) return ""
    
    const parts = []
    
    // Age - convert to natural description
    if (userSettings && userSettings.age_range) {
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

  // V1 Prompt Templates for Collab - exact copy
  const promptTemplates = [
    {
      category: "Freundschafts-Szenen",
      prompts: [
        "Using the provided images, create a scene with both people from the first and second image together. Show them laughing together in a casual, friendly moment. Place them sitting side by side on a park bench with natural lighting. Ensure both faces maintain their original features completely while creating a warm, genuine friendship vibe.",
        "Using the provided images, create a scene with both people from the first and second image together. Show them walking side by side, having an animated conversation with big smiles. Set the scene on a sunny street or pathway. Ensure both faces maintain their original features completely while capturing their natural friendship energy.",
        "Using the provided images, create a scene with both people from the first and second image together. Show them in a spontaneous moment of shared laughter, perhaps looking at something funny together. Create a cozy indoor setting like a café. Ensure both faces maintain their original features completely."
      ],
      labels: ["Park Lachen", "Spaziergang", "Café Moment"]
    },
    {
      category: "Selfie-Szenen",
      prompts: [
        "Using the provided images, create a realistic selfie of both people from the first and second image together. Show them taking a fun selfie together with big smiles, one person holding the camera. Natural lighting, close-up shot. Ensure both faces maintain their original features completely while creating that authentic selfie feeling.",
        "Using the provided images, create a vacation selfie with both people from the first and second image together. Show them in front of a landmark or beautiful scenery, both making peace signs or waving. Bright, happy outdoor lighting. Ensure both faces maintain their original features completely.",
        "Using the provided images, create a cozy indoor selfie with both people from the first and second image together. Show them taking a mirror selfie in casual outfits, both looking happy and relaxed. Soft, warm indoor lighting. Ensure both faces maintain their original features completely."
      ],
      labels: ["Fun Selfie", "Urlaubs Selfie", "Mirror Selfie"]
    },
    {
      category: "Event-Szenen",
      prompts: [
        "Using the provided images, create a party scene with both people from the first and second image together. Show them at a celebration, perhaps raising drinks in a toast, both dressed up and smiling. Festive party atmosphere with warm lighting. Ensure both faces maintain their original features completely.",
        "Using the provided images, create a graduation scene with both people from the first and second image together. Show them in graduation caps and gowns, celebrating together with proud smiles. Academic setting with natural daylight. Ensure both faces maintain their original features completely.",
        "Using the provided images, create a wedding scene with both people from the first and second image together. Show them as happy guests at a wedding, perhaps dancing or celebrating, dressed elegantly. Romantic, warm lighting. Ensure both faces maintain their original features completely."
      ],
      labels: ["Party Toast", "Graduation", "Hochzeit"]
    },
    {
      category: "Adventure-Szenen",
      prompts: [
        "Using the provided images, create an adventure scene with both people from the first and second image together. Show them hiking together on a mountain trail, both wearing outdoor gear and looking excited about the journey. Natural outdoor lighting with mountain views. Ensure both faces maintain their original features completely.",
        "Using the provided images, create a beach scene with both people from the first and second image together. Show them having fun at the beach, perhaps building sandcastles or playing in the waves, both in summer clothing. Bright, sunny beach lighting. Ensure both faces maintain their original features completely.",
        "Using the provided images, create a city exploration scene with both people from the first and second image together. Show them as tourists exploring a famous city, both looking excited and pointing at landmarks. Urban setting with natural daylight. Ensure both faces maintain their original features completely."
      ],
      labels: ["Wandern", "Strand Fun", "Stadt Tour"]
    }
  ]

  // V1 Template Selection
  const insertPromptTemplate = (template: string, categoryIndex: number, promptIndex: number) => {
    setPrompt(template)
    setSelectedTemplate(`${categoryIndex}-${promptIndex}`)
  }

  // V1 Image Upload Logic - exact copy
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
      setImages(prev => [...prev, ...newImages].slice(0, 14 - 1 - (collabPartnerImage ? 1 : 0)))
    })
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const clearAllImages = () => {
    setImages([])
  }

  // V1 Collab Partner Upload Logic - exact copy
  const handleCollabPartnerUpload = (event: any) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e: any) => {
        setCollabPartnerImage({
          file: file,
          base64: e.target?.result,
          name: file.name
        })
        setHasCollabPartner(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeCollabPartnerImage = () => {
    setCollabPartnerImage(null)
    setHasCollabPartner(false)
  }

  // V1 Generation Logic - EXACT COPY with Collab features
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('Bitte gib einen Prompt ein')
      return
    }

    if (!collabPartnerImage) {
      alert('Bitte lade das Bild deines Collab Partners hoch')
      return
    }

    setIsGenerating(true)
    setResults([])
    
    const startTime = Date.now()

    try {
      // V1 Gemini API Call - EXACT COPY
      const apiKey = userSettings?.gemini_api_key
      const model = 'gemini-2.5-flash-image'
      
      if (!apiKey) {
        throw new Error('Dein Gemini API Key fehlt. Bitte gehe zu Settings und trage ihn ein.')
      }

      console.log('🤝 Starting Collab generation...')

      // Build final prompt with personalization - V1 EXACT
      let finalPrompt = prompt
      if (showMainFaceImage && userSettings?.main_face_image_url && userSettings) {
        const personalizationText = generatePersonalizationText()
        if (personalizationText) {
          finalPrompt = `${personalizationText} and collab partner. ${prompt}`
        }
      }
      
      console.log('🤝 Final collab prompt:', finalPrompt)
      
      // V1 API Format - EXACT COPY
      const parts = [
        { text: finalPrompt }
      ]
      
      // Hauptgesichtsbild hinzufügen - V1 EXACT
      if (userSettings?.main_face_image_url && showMainFaceImage) {
        try {
          const response = await fetch(userSettings.main_face_image_url)
          const blob = await response.blob()
          const base64Data = await new Promise((resolve) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result)
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

      // Collab Partner Image hinzufügen (für Collab Generation) - V1 EXACT
      if (collabPartnerImage && collabPartnerImage.base64) {
        try {
          const base64Data = collabPartnerImage.base64.split(',')[1]
          const mimeType = collabPartnerImage.base64.split(';')[0].split(':')[1]
          
          parts.push({
            inline_data: {
              mime_type: mimeType,
              data: base64Data
            }
          })
          console.log('✅ Collab Partner image added to generation')
        } catch (error) {
          console.warn('Failed to load collab partner image for generation:', error)
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
          } catch (error) {
            console.warn('Failed to add uploaded image:', error)
          }
        }
      }

      // V1 Request Body - EXACT COPY
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

      console.log('🚀 Making Gemini API call for Collab generation...')
      
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
        throw new Error(`Gemini API Error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('📦 Gemini Collab response:', data)

      // Extract image from V1 response format
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const content = data.candidates[0].content
        
        // Look for image in parts
        const imagePart = content.parts?.find(part => part.inline_data)
        
        if (imagePart && imagePart.inline_data) {
          const generationTime = ((Date.now() - startTime) / 1000).toFixed(1)
          
          const imageUrl = `data:${imagePart.inline_data.mime_type};base64,${imagePart.inline_data.data}`
          
          setResults([{
            id: Date.now(),
            prompt: finalPrompt,
            imageUrl: imageUrl,
            timestamp: new Date().toISOString(),
            generationTime: generationTime
          }])
          
          console.log(`✅ Collab image generated in ${generationTime}s`)
        } else {
          throw new Error('No image found in response')
        }
      } else {
        throw new Error('Invalid response format from Gemini API')
      }

    } catch (error) {
      console.error('❌ Collab generation error:', error)
      alert(`Generation failed: ${error.message}`)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header - V1 Style */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-2">
            🤝 Collab Partner
          </h1>
          <p className="text-gray-600 text-center">
            Create images with you and your collaboration partner
          </p>
        </div>

        {/* Settings Panel - V1 Style */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Resolution */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resolution
              </label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="1K">1K</option>
                <option value="2K">2K</option>
                <option value="4K">4K</option>
              </select>
            </div>

            {/* Aspect Ratio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aspect Ratio
              </label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="1:1">1:1 (Square)</option>
                <option value="9:16">9:16 (Portrait)</option>
                <option value="16:9">16:9 (Landscape)</option>
                <option value="4:3">4:3 (Post)</option>
                <option value="3:4">3:4 (Portrait)</option>
              </select>
            </div>

            {/* Face Integration Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Use My Face
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="mainface"
                  checked={showMainFaceImage}
                  onChange={(e) => setShowMainFaceImage(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="mainface" className="text-sm text-gray-600">
                  Include my main face
                </label>
              </div>
            </div>
          </div>

          {/* Personalization Preview */}
          {showMainFaceImage && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>My Face:</strong> {generatePersonalizationText()}
              </p>
            </div>
          )}
        </div>

        {/* Face Upload Section - V1 Style */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Upload Partner Face</h3>
          
          <div className="grid grid-cols-2 gap-4">
            {/* My Face */}
            <div className="text-center">
              <div className="mb-2 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                {userSettings?.main_face_image_url && userSettings.main_face_image_url.length > 0 ? (
                  <img
                    src={decodeURIComponent(userSettings.main_face_image_url)}
                    alt="My Face"
                    className="w-full h-32 object-cover rounded-md"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                    <span className="text-3xl mb-2">👤</span>
                    <span className="text-sm">No face image</span>
                  </div>
                )}
              </div>
              <div className="text-sm font-medium text-gray-700 bg-blue-100 px-2 py-1 rounded">
                My Face
              </div>
            </div>

            {/* Collab Partner Face */}
            <div className="text-center">
              <div 
                className={`mb-2 p-4 border-2 border-dashed rounded-lg cursor-pointer ${
                  collabPartnerImage ? 'border-purple-400 bg-purple-50' : 'border-gray-300'
                }`}
                onClick={() => document.getElementById('collab-partner-upload').click()}
              >
                {collabPartnerImage ? (
                  <div className="relative">
                    <img
                      src={collabPartnerImage.base64}
                      alt="Collab Partner"
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeCollabPartnerImage()
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                    <span className="text-3xl mb-2">📸</span>
                    <span className="text-sm">Upload partner</span>
                  </div>
                )}
              </div>
              <div className="text-sm font-medium text-gray-700 bg-purple-100 px-2 py-1 rounded">
                Collab Partner
              </div>
            </div>
          </div>

          <input
            id="collab-partner-upload"
            type="file"
            accept="image/*"
            onChange={handleCollabPartnerUpload}
            className="hidden"
          />

          {!collabPartnerImage && (
            <div className="mt-3 text-center text-sm text-gray-500">
              Click on the right box to upload your collaboration partner's face
            </div>
          )}
        </div>

        {/* Additional Images Upload */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Additional Images (Optional)</h3>
          
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleImageUpload(e)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
          />
          <p className="text-xs text-gray-500">
            Add background images, outfits, or other references (max 14 total)
          </p>
          
          {images.length > 0 && (
            <div className="mt-3">
              <div className="flex flex-wrap gap-2 mb-2">
                {images.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={img.base64}
                      alt={`Upload ${index + 1}`}
                      className="w-16 h-16 object-cover rounded border"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={clearAllImages}
                className="text-xs text-red-600 hover:underline"
              >
                Clear all images
              </button>
            </div>
          )}
        </div>

        {/* Prompt Templates - V1 Style */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <div
            className="flex justify-between items-center cursor-pointer mb-4"
            onClick={() => setTemplatesCollapsed(!templatesCollapsed)}
          >
            <h3 className="text-lg font-semibold">Prompt Templates</h3>
            <span className={`transition-transform ${templatesCollapsed ? 'rotate-0' : 'rotate-180'}`}>
              ▼
            </span>
          </div>
          
          {!templatesCollapsed && promptTemplates.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-4">
              <h4 className="font-medium text-gray-800 mb-2">{category.category}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {category.prompts.map((template, promptIndex) => (
                  <button
                    key={promptIndex}
                    onClick={() => insertPromptTemplate(template, categoryIndex, promptIndex)}
                    className={`p-2 text-left text-sm border rounded-md hover:bg-gray-50 ${
                      selectedTemplate === `${categoryIndex}-${promptIndex}` 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200'
                    }`}
                  >
                    {category.labels[promptIndex]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Prompt Input - V1 Style */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Prompt</h3>
          
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the scene with you and your collab partner... (e.g., 'Both people laughing together in a park setting')"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={6}
          />

          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-500">
              {prompt.length} characters
            </div>
            
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim() || !userSettings?.gemini_api_key || !collabPartnerImage}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isGenerating || !prompt.trim() || !userSettings?.gemini_api_key || !collabPartnerImage
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isGenerating ? 'Generating...' : '🤝 Generate'}
            </button>
          </div>
          
          {!userSettings?.gemini_api_key && (
            <div className="mt-2 text-sm text-red-600">
              ⚠️ Gemini API Key required. Please add it in Settings.
            </div>
          )}

          {!collabPartnerImage && (
            <div className="mt-2 text-sm text-orange-600">
              ⚠️ Please upload your collaboration partner's image.
            </div>
          )}
        </div>

        {/* Results - V1 Style */}
        {results.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Generated Images</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((result) => (
                <div key={result.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={result.imageUrl}
                    alt="Generated"
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-3">
                    <p className="text-xs text-gray-500 mb-2">
                      {new Date(result.timestamp).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {result.prompt}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Generated in {result.generationTime}s
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isGenerating && (
          <div className="bg-white rounded-lg p-6 shadow-sm text-center">
            <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent text-blue-600 rounded-full mb-4"></div>
            <p className="text-gray-600">Creating your collaboration image...</p>
          </div>
        )}

      </div>
    </div>
  )
}