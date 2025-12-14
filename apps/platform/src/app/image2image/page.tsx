'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '@repo/auth-config'
import { createServerSupabaseClient } from '@repo/database'

export default function Image2ImagePage() {
  // V1 State Management - exact replication
  const { user } = useAuth()
  const [userSettings, setUserSettings] = useState(null)
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [results, setResults] = useState([])
  const [images, setImages] = useState([])
  const [userGender, setUserGender] = useState('female')
  const [resolution, setResolution] = useState('2K')
  const [aspectRatio, setAspectRatio] = useState('9:16')
  const [showMainFaceImage, setShowMainFaceImage] = useState(true)
  const [collabPartnerImage, setCollabPartnerImage] = useState(null)
  const [hasCollabPartner, setHasCollabPartner] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)

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
        }
      } catch (error) {
        console.error('Error loading user settings:', error)
      }
    }

    loadUserSettings()
  }, [user?.id])

  // V1 Prompt Templates - exact copy
  const promptTemplates = [
    {
      category: "Szenario-Änderungen",
      prompts: [
        "Using the provided images, take the face from the first image and place it on the person in the second image. Change the background to a tropical beach with palms and turquoise water. Ensure the facial features from the first image remain completely unchanged while adapting to the lighting and pose of the second image.",
        "Using the provided images, take the face from the first image and place it on the person in the second image. Change the facial expression to a radiant smile with sparkling eyes. Ensure all facial features from the first image remain identical while adapting to the second image's pose and setting.",
        "Using the provided images, take the face from the first image and place it on the person in the second image. Change the pose to a confident, dynamic stance with crossed arms. Ensure the facial features from the first image remain completely unchanged."
      ],
      labels: ["Strand Hintergrund", "Lächeln", "Selbstbewusste Pose"]
    },
    {
      category: "Outfit Changes", 
      prompts: [
        "Using the provided images, take the face from the first image and place it on the person in the second image. Transform the outfit into an elegant black evening dress with jewelry. Ensure the facial features from the first image remain completely unchanged while maintaining the pose from the second image.",
        "Using the provided images, take the face from the first image and place it on the person in the second image. Change the clothing to a modern streetwear look with hoodie and sneakers. Ensure all facial features from the first image remain identical.",
        "Using the provided images, take the face from the first image and place it on the person in the second image. Create a vintage 80s outfit with colorful patterns. Ensure the facial features from the first image remain completely unchanged."
      ],
      labels: ["Abendkleid", "Streetwear", "Vintage 80s"]
    },
    {
      category: "Posen-Transfer",
      prompts: [
        "Using the provided images, take the face from the first image and place it exactly on the person in the second image. Keep the exact pose, outfit and background from the second image unchanged. Ensure the facial features from the first image remain completely identical with natural lighting and shadows.",
        "Using the provided images, take the face from the first image and place it on the person in the second image. Maintain the dynamic pose from the second image completely. Ensure all facial features, hair color and skin tone from the first image are preserved exactly.",
        "Using the provided images, take the face from the first image and place it on the person in the second image. Keep the professional pose from the second image unchanged. Ensure the facial features from the first image remain completely unchanged with realistic integration."
      ],
      labels: ["Exakte Pose", "Dynamische Pose", "Profi-Pose"]
    },
    {
      category: "Perspektiven",
      prompts: [
        "Using the provided images, take the face from the first image and place it on the person in the second image. Change the camera angle to a dramatic upward perspective. Ensure the facial features from the first image remain completely unchanged while adapting to the new viewing angle.",
        "Using the provided images, take the face from the first image and place it on the person in the second image. Transform the perspective to a bird's eye view from above. Ensure all facial features from the first image remain identical.",
        "Using the provided images, take the face from the first image and place it on the person in the second image. Create a side profile view with artistic shadows. Ensure the facial features from the first image remain completely unchanged."
      ],
      labels: ["Von unten", "Von oben", "Profil"]
    },
    {
      category: "Perfekte Face-Swaps",
      prompts: [
        "Using the provided images, take the face from the first image and place it exactly on the person in the second image. Keep the pose, outfit, and background from the second image completely unchanged. Ensure the facial features from the first image remain completely identical with natural lighting adaptation.",
        "Using the provided images, take the face from the first image and seamlessly place it on the person in the second image. Maintain everything from the second image except replace the face. Ensure all facial features, hair color and skin tone from the first image are preserved exactly.",
        "Using the provided images, take the face from the first image and place it on the person in the second image with perfect lighting integration. Keep the scene from the second image unchanged. Ensure the facial features from the first image remain completely unchanged with realistic shadows and highlights."
      ],
      labels: ["Exakter Swap", "Nahtlos", "Perfekte Beleuchtung"]
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

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const clearAllImages = () => {
    setImages([])
  }

  // V1 Collab Partner Upload Logic - exact copy
  const handleCollabPartnerUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setCollabPartnerImage({
          file: file,
          base64: e.target.result,
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

  // V1 Generation Logic - EXACT COPY with Image2Image features
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('Bitte gib einen Prompt ein')
      return
    }

    if (!collabPartnerImage && images.length === 0) {
      alert('Bitte lade mindestens ein Bild hoch')
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

      console.log('🖼️ Starting Image2Image generation...')
      
      // V1 API Format - EXACT COPY
      const parts: any[] = [
        { text: prompt }
      ]
      
      // Hauptgesichtsbild hinzufügen - V1 EXACT
      if (userSettings?.main_face_image_url && showMainFaceImage) {
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

      // Collab Partner Image hinzufügen (VORLAGENBILD für Image2Image) - V1 EXACT
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
          console.log('✅ Template image added for Image2Image')
        } catch (error) {
          console.warn('Failed to add template image:', error)
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

      console.log('🚀 Making Gemini API call for Image2Image...')
      
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
      console.log('📦 Gemini Image2Image response:', data)

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
            prompt: prompt,
            imageUrl: imageUrl,
            timestamp: new Date().toISOString(),
            generationTime: generationTime
          }])
          
          console.log(`✅ Image2Image generated in ${generationTime}s`)
        } else {
          throw new Error('No image found in response')
        }
      } else {
        throw new Error('Invalid response format from Gemini API')
      }

    } catch (error) {
      console.error('❌ Image2Image generation error:', error)
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
            🖼️ Image2Image
          </h1>
          <p className="text-gray-600 text-center">
            Face Swap & Image Transformation with AI
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
        </div>

        {/* Image Upload Section - V1 Style */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Upload Images</h3>
          
          {/* Template Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Image (Required for Face Swap)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleCollabPartnerUpload}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
            />
            <p className="text-xs text-gray-500">
              Upload the image where you want your face to be placed
            </p>
            
            {collabPartnerImage && (
              <div className="mt-3 relative inline-block">
                <img
                  src={collabPartnerImage.base64}
                  alt="Template"
                  className="w-24 h-24 object-cover rounded-md border"
                />
                <button
                  onClick={removeCollabPartnerImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          {/* Additional Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Images (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleImageUpload(e)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
            />
            <p className="text-xs text-gray-500">
              Add more reference images (max 14 total)
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
        </div>

        {/* Prompt Templates - V1 Style */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Prompt Templates</h3>
          
          {promptTemplates.map((category, categoryIndex) => (
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
            placeholder="Describe how you want to transform the image... (e.g., 'Using the provided images, take my face and place it on the person in the template image')"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={6}
          />

          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-500">
              {prompt.length} characters
            </div>
            
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim() || !userSettings?.gemini_api_key || (!collabPartnerImage && images.length === 0)}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isGenerating || !prompt.trim() || !userSettings?.gemini_api_key || (!collabPartnerImage && images.length === 0)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isGenerating ? 'Generating...' : '🖼️ Generate'}
            </button>
          </div>
          
          {!userSettings?.gemini_api_key && (
            <div className="mt-2 text-sm text-red-600">
              ⚠️ Gemini API Key required. Please add it in Settings.
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
            <p className="text-gray-600">Processing your Image2Image transformation...</p>
          </div>
        )}

      </div>
    </div>
  )
}