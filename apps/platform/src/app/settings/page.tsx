'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@repo/auth-config'
import { V1User } from '@repo/database'
import FaceImageUpload from '../../components/FaceImageUpload'

// V1 User Settings Interface (exact replication)
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

// V1 Option Values (exact replication)
const HAIR_COLORS = ['', 'blonde', 'brown', 'black', 'red', 'gray']
const EYE_COLORS = ['', 'blue', 'brown', 'green', 'hazel', 'gray']
const SKIN_TONES = ['', 'light', 'medium', 'dark', 'latin', 'asian']
const AGE_RANGES = ['', 'teen', 'young-adult', 'adult', 'middle-aged', 'senior']
const RESOLUTIONS = ['', '1K', '2K', '4K']
const ASPECT_RATIOS = ['', '9:16', '16:9', '1:1', '4:3']

export default function SettingsPage() {
  const [userSettings, setUserSettings] = useState<UserSettings>({
    username: '',
    email: '',
    gemini_api_key: '',
    main_face_image_url: '',
    face_2_image_url: '',
    face_2_name: '',
    face_3_image_url: '',
    face_3_name: '',
    hair_color: '',
    eye_color: '',
    skin_tone: '',
    age_range: '',
    default_resolution: '',
    default_aspect_ratio: '',
    use_personalization: false,
    use_personal_appearance_text: false,
    personal_appearance_text: '',
    favorite_prompts: []
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string; isAutoSave?: boolean } | null>(null)
  const [uploadingSection, setUploadingSection] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [canNavigateAway, setCanNavigateAway] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  // Check if user can navigate away (has API key) - exact V1 logic
  useEffect(() => {
    if (userSettings && typeof userSettings.gemini_api_key === 'string') {
      const hasApiKey = userSettings.gemini_api_key.trim().length > 0
      setCanNavigateAway(hasApiKey)
    } else {
      setCanNavigateAway(false)
    }
  }, [userSettings?.gemini_api_key])

  // Prevent navigation without API key - exact V1 logic
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!canNavigateAway && hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = 'Du hast noch nicht alle erforderlichen Einstellungen gespeichert. Möchtest du wirklich die Seite verlassen?'
        return e.returnValue
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [canNavigateAway, hasUnsavedChanges])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
    if (user?.id && (!userSettings || !userSettings.username)) {
      loadUserSettings()
    }
  }, [authLoading, user, router])

  // Cleanup auto-save timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [])

  const loadUserSettings = async () => {
    if (!user?.id) return

    try {
      const response = await fetch(`/api/user/settings?userId=${user.id}`)
      
      if (!response.ok) {
        throw new Error('Failed to load settings')
      }

      const { settings } = await response.json()
      
      if (settings) {
        setUserSettings({
          username: settings.username || '',
          email: settings.email || '',
          gemini_api_key: settings.gemini_api_key || '',
          main_face_image_url: settings.main_face_image_url || '',
          face_2_image_url: settings.face_2_image_url || '',
          face_2_name: settings.face_2_name || '',
          face_3_image_url: settings.face_3_image_url || '',
          face_3_name: settings.face_3_name || '',
          hair_color: settings.hair_color || '',
          eye_color: settings.eye_color || '',
          skin_tone: settings.skin_tone || '',
          age_range: settings.age_range || '',
          default_resolution: settings.default_resolution || '',
          default_aspect_ratio: settings.default_aspect_ratio || '',
          use_personalization: settings.use_personalization || false,
          use_personal_appearance_text: settings.use_personal_appearance_text || false,
          personal_appearance_text: settings.personal_appearance_text || '',
          favorite_prompts: settings.favorite_prompts || []
        })
      }
    } catch (error) {
      console.error('Error loading user settings:', error)
      setMessage({ type: 'error', text: 'Fehler beim Laden der Einstellungen' })
    } finally {
      setIsLoading(false)
    }
  }

  // Debounced auto-save function - exact V1 logic
  const autoSaveSettings = useCallback(async (settingsToSave: UserSettings) => {
    if (!user?.id) return

    setIsAutoSaving(true)
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          settings: settingsToSave
        })
      })

      if (!response.ok) {
        throw new Error('Auto-save failed')
      }

      setLastSaved(new Date())
      setHasUnsavedChanges(false)
      setMessage({ type: 'success', text: 'Automatisch gespeichert ✓', isAutoSave: true })
      
      // Clear auto-save message after 3 seconds
      setTimeout(() => {
        setMessage(null)
      }, 3000)

    } catch (error) {
      console.error('Auto-save failed:', error)
      setMessage({ type: 'error', text: 'Auto-Speichern fehlgeschlagen', isAutoSave: true })
    } finally {
      setIsAutoSaving(false)
    }
  }, [user?.id])

  const handleInputChange = (field: keyof UserSettings, value: string | boolean | string[]) => {
    setUserSettings(prev => {
      if (!prev || typeof prev !== 'object') {
        console.warn('handleInputChange called with invalid userSettings state')
        return prev
      }
      
      const updatedSettings = { ...prev, [field]: value }
      
      // Clear any existing auto-save timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }

      // Only set auto-save timeout if user is authenticated and settings are valid
      if (user?.id && updatedSettings) {
        autoSaveTimeoutRef.current = setTimeout(() => {
          autoSaveSettings(updatedSettings)
        }, 1500) // 1.5 second debounce - exact V1 timing
      }
      
      return updatedSettings
    })
    setHasUnsavedChanges(true)
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  const v1User = user as V1User

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                User Settings
              </h1>
              <p className="text-sm text-gray-500">Configure your Nano Banana settings</p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Status Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.text}
            {isAutoSaving && <span className="ml-2">Saving...</span>}
          </div>
        )}

        {/* Account Information */}
        <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Account & API Configuration
            </h3>
            
            <div className="space-y-4">
              {/* Username (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  value={userSettings.username}
                  disabled
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email <span className="text-sm text-gray-500 font-normal">(optional)</span>
                </label>
                <input
                  type="email"
                  value={userSettings.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your.email@example.com"
                />
              </div>

              {/* Gemini API Key */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Gemini API Key <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={userSettings.gemini_api_key}
                    onChange={(e) => handleInputChange('gemini_api_key', e.target.value)}
                    className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="AIza..."
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <span className="text-gray-400 text-sm">
                      {showApiKey ? 'Hide' : 'Show'}
                    </span>
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Required for image generation. Get your key from Google AI Studio.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Face Images Section */}
        <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Face Images
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Upload up to 3 face images for personalized generation
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Main Face */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Main Face
                </label>
                <FaceImageUpload
                  imageUrl={userSettings.main_face_image_url}
                  section="main_face"
                  userId={user.id}
                  onImageUploaded={(imageUrl) => handleInputChange('main_face_image_url', imageUrl)}
                  onImageRemoved={() => handleInputChange('main_face_image_url', '')}
                  disabled={isAutoSaving}
                />
              </div>

              {/* Face 2 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Face 2
                </label>
                <input
                  type="text"
                  value={userSettings.face_2_name}
                  onChange={(e) => handleInputChange('face_2_name', e.target.value)}
                  className="w-full px-3 py-1 mb-2 border border-gray-300 rounded-md text-sm"
                  placeholder="Face name (optional)"
                />
                <FaceImageUpload
                  imageUrl={userSettings.face_2_image_url}
                  section="face_2"
                  userId={user.id}
                  onImageUploaded={(imageUrl) => handleInputChange('face_2_image_url', imageUrl)}
                  onImageRemoved={() => handleInputChange('face_2_image_url', '')}
                  disabled={isAutoSaving}
                />
              </div>

              {/* Face 3 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Face 3
                </label>
                <input
                  type="text"
                  value={userSettings.face_3_name}
                  onChange={(e) => handleInputChange('face_3_name', e.target.value)}
                  className="w-full px-3 py-1 mb-2 border border-gray-300 rounded-md text-sm"
                  placeholder="Face name (optional)"
                />
                <FaceImageUpload
                  imageUrl={userSettings.face_3_image_url}
                  section="face_3"
                  userId={user.id}
                  onImageUploaded={(imageUrl) => handleInputChange('face_3_image_url', imageUrl)}
                  onImageRemoved={() => handleInputChange('face_3_image_url', '')}
                  disabled={isAutoSaving}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Personalization Settings */}
        <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Personalization
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Hair Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hair Color
                </label>
                <select
                  value={userSettings.hair_color}
                  onChange={(e) => handleInputChange('hair_color', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {HAIR_COLORS.map(color => (
                    <option key={color} value={color}>
                      {color || 'Not specified'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Eye Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Eye Color
                </label>
                <select
                  value={userSettings.eye_color}
                  onChange={(e) => handleInputChange('eye_color', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {EYE_COLORS.map(color => (
                    <option key={color} value={color}>
                      {color || 'Not specified'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Skin Tone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skin Tone
                </label>
                <select
                  value={userSettings.skin_tone}
                  onChange={(e) => handleInputChange('skin_tone', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {SKIN_TONES.map(tone => (
                    <option key={tone} value={tone}>
                      {tone || 'Not specified'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Age Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age Range
                </label>
                <select
                  value={userSettings.age_range}
                  onChange={(e) => handleInputChange('age_range', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {AGE_RANGES.map(range => (
                    <option key={range} value={range}>
                      {range || 'Not specified'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Generation Defaults */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Generation Defaults
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Default Resolution */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Resolution
                </label>
                <select
                  value={userSettings.default_resolution}
                  onChange={(e) => handleInputChange('default_resolution', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {RESOLUTIONS.map(resolution => (
                    <option key={resolution} value={resolution}>
                      {resolution || 'Not specified'}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  1K (fast), 2K (balanced), 4K (high quality)
                </p>
              </div>

              {/* Default Aspect Ratio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Aspect Ratio
                </label>
                <select
                  value={userSettings.default_aspect_ratio}
                  onChange={(e) => handleInputChange('default_aspect_ratio', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {ASPECT_RATIOS.map(ratio => (
                    <option key={ratio} value={ratio}>
                      {ratio || 'Not specified'}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  9:16 (portrait), 16:9 (landscape), 1:1 (square), 4:3 (classic)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Save Status */}
        {lastSaved && (
          <div className="mt-4 text-center text-sm text-gray-500">
            Last saved: {lastSaved.toLocaleTimeString()}
          </div>
        )}
      </main>
    </div>
  )
}