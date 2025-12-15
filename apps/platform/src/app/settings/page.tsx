'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@repo/auth-config'
import { V1User } from '@repo/database'
import '@nano-banana/ui-components'
import { BackButton } from '@nano-banana/ui-components'

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
    console.log('🔍 Settings useEffect:', { user: !!user, authLoading, userExists: !!user })
    if (!authLoading && !user) {
      console.log('🚨 Settings redirecting to login - no user found')
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
    <div className="page-layout">
      {/* Header */}
      <header className="bg-nano-header">
        <div className="container-nano">
          <div className="flex-between py-4">
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <BackButton href="/dashboard" />
                <div>
                  <h1 className="title-large">
                    Einstellungen
                  </h1>
                  <p className="subtitle">Konfiguriere deine Nano Banana Einstellungen</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-nano py-8">
        {/* Status Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}>
            {message.text}
            {isAutoSaving && <span className="ml-2">Speichert...</span>}
          </div>
        )}

        {/* Account Information */}
        <div className="bg-nano-card p-6 shadow-xl mb-6">
          <h3 className="text-title-large text-white mb-4">
            Account & API Konfiguration
          </h3>
            
          <div className="space-y-4">
            {/* Username (Read-only) */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-slate-300 min-w-[80px]">Username:</label>
              <input
                type="text"
                value={userSettings.username}
                disabled
                className="flex-1 px-3 py-2 border border-slate-600 rounded-md shadow-sm bg-slate-700/50 text-slate-400 focus:outline-none"
              />
            </div>

            {/* Email */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-slate-300 min-w-[80px]">
                Email:
              </label>
              <input
                type="email"
                value={userSettings.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-600 rounded-md shadow-sm bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="(optional)"
              />
            </div>

            {/* Gemini API Key */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Gemini API Key <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={userSettings.gemini_api_key}
                  onChange={(e) => handleInputChange('gemini_api_key', e.target.value)}
                  className="block w-full px-3 py-2 pr-16 border border-slate-600 rounded-md shadow-sm bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="AIza..."
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300 text-sm"
                >
                  {showApiKey ? 'Verbergen' : 'Anzeigen'}
                </button>
              </div>
              <p className="mt-1 text-sm text-slate-400">
                Erforderlich für Bildgenerierung. Hole deinen Key von Google AI Studio.
              </p>
            </div>

            {/* Seedream API Key */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Seedream API Key <span className="text-slate-500">(optional)</span>
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value=""
                  className="block w-full px-3 py-2 pr-16 border border-slate-600 rounded-md shadow-sm bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="Seedream API Key..."
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300 text-sm"
                >
                  {showApiKey ? 'Verbergen' : 'Anzeigen'}
                </button>
              </div>
              <p className="mt-1 text-sm text-slate-400">
                Optional für Seedream Bildgenerierung.
              </p>
            </div>
          </div>
        </div>

        {/* Face Images Section */}
        <div className="bg-nano-card p-6 shadow-xl mb-6">
          <h3 className="text-title-large text-white mb-4">
            Gesichts-Bilder
          </h3>
          <p className="text-sm text-slate-400 mb-6">
            Lade bis zu 3 Gesichtsbilder für personalisierte Generierung hoch
          </p>
          
          <div className="grid grid-cols-3 gap-4">
            {/* Main Face */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Haupt-Gesicht
              </label>
              {userSettings.main_face_image_url && userSettings.main_face_image_url.length > 0 ? (
                <div className="relative group">
                  <img 
                    src={decodeURIComponent(userSettings.main_face_image_url)} 
                    alt="Main face"
                    className="w-full aspect-square object-cover rounded-md border border-slate-600"
                  />
                  <button
                    onClick={() => handleInputChange('main_face_image_url', '')}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => document.getElementById('main_face_input').click()}
                  className="w-full aspect-square border-2 border-dashed border-slate-600 rounded-md text-center cursor-pointer hover:border-slate-500 transition-colors bg-slate-800/50 flex flex-col items-center justify-center"
                >
                  <svg
                    className="h-8 w-8 text-slate-400 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <div className="text-xs text-slate-400">
                    Upload
                  </div>
                </button>
              )}
              <input
                id="main_face_input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file || !user?.id) return
                  
                  try {
                    const formData = new FormData()
                    formData.append('file', file)
                    formData.append('section', 'main_face')
                    formData.append('userId', user.id)
                    
                    const response = await fetch('/api/user/upload-image', {
                      method: 'POST',
                      body: formData
                    })
                    
                    const result = await response.json()
                    
                    if (response.ok) {
                      handleInputChange('main_face_image_url', result.imageUrl)
                    }
                  } catch (error) {
                    console.error('Upload failed:', error)
                  }
                }}
              />
            </div>
            
            {/* Face 2 */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Gesicht 2
              </label>
              {userSettings.face_2_image_url && userSettings.face_2_image_url.length > 0 ? (
                <div className="relative group">
                  <img 
                    src={decodeURIComponent(userSettings.face_2_image_url)} 
                    alt="Face 2"
                    className="w-full aspect-square object-cover rounded-md border border-slate-600"
                  />
                  <button
                    onClick={() => handleInputChange('face_2_image_url', '')}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => document.getElementById('face_2_input').click()}
                  className="w-full aspect-square border-2 border-dashed border-slate-600 rounded-md text-center cursor-pointer hover:border-slate-500 transition-colors bg-slate-800/50 flex flex-col items-center justify-center"
                >
                  <svg
                    className="h-8 w-8 text-slate-400 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <div className="text-xs text-slate-400">
                    Upload
                  </div>
                </button>
              )}
              <input
                id="face_2_input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file || !user?.id) return
                  
                  try {
                    const formData = new FormData()
                    formData.append('file', file)
                    formData.append('section', 'face_2')
                    formData.append('userId', user.id)
                    
                    const response = await fetch('/api/user/upload-image', {
                      method: 'POST',
                      body: formData
                    })
                    
                    const result = await response.json()
                    
                    if (response.ok) {
                      handleInputChange('face_2_image_url', result.imageUrl)
                    }
                  } catch (error) {
                    console.error('Upload failed:', error)
                  }
                }}
              />
            </div>
            
            {/* Face 3 */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Gesicht 3
              </label>
              {userSettings.face_3_image_url && userSettings.face_3_image_url.length > 0 ? (
                <div className="relative group">
                  <img 
                    src={decodeURIComponent(userSettings.face_3_image_url)} 
                    alt="Face 3"
                    className="w-full aspect-square object-cover rounded-md border border-slate-600"
                  />
                  <button
                    onClick={() => handleInputChange('face_3_image_url', '')}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => document.getElementById('face_3_input').click()}
                  className="w-full aspect-square border-2 border-dashed border-slate-600 rounded-md text-center cursor-pointer hover:border-slate-500 transition-colors bg-slate-800/50 flex flex-col items-center justify-center"
                >
                  <svg
                    className="h-8 w-8 text-slate-400 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <div className="text-xs text-slate-400">
                    Upload
                  </div>
                </button>
              )}
              <input
                id="face_3_input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file || !user?.id) return
                  
                  try {
                    const formData = new FormData()
                    formData.append('file', file)
                    formData.append('section', 'face_3')
                    formData.append('userId', user.id)
                    
                    const response = await fetch('/api/user/upload-image', {
                      method: 'POST',
                      body: formData
                    })
                    
                    const result = await response.json()
                    
                    if (response.ok) {
                      handleInputChange('face_3_image_url', result.imageUrl)
                    }
                  } catch (error) {
                    console.error('Upload failed:', error)
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Personalization and Generation Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Personalization Settings */}
          <div className="bg-nano-card p-6 shadow-xl">
            <h3 className="text-title-large text-white mb-4">
              Physische Eigenschaften <span className="text-sm text-slate-400 font-normal">(für AI-Prompts)</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Hair Color */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Haarfarbe
                  </label>
                  <select
                    value={userSettings.hair_color || ''}
                    onChange={(e) => handleInputChange('hair_color', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      fontSize: '14px',
                      backgroundColor: userSettings.hair_color ? 'hsl(47 100% 65%)' : 'hsl(var(--background))',
                      color: userSettings.hair_color ? '#374151' : 'hsl(var(--foreground))',
                      fontFamily: 'inherit',
                      fontWeight: '500',
                      outline: 'none'
                    }}
                  >
                    {!userSettings.hair_color && <option value="">Wählen...</option>}
                    <option value="black">Schwarz</option>
                    <option value="darkbrown">Dunkelbraun</option>
                    <option value="brunette">Brunette</option>
                    <option value="blonde">Blond</option>
                    <option value="red">Rot</option>
                  </select>
                </div>

                {/* Eye Color */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Augenfarbe
                  </label>
                  <select
                    value={userSettings.eye_color || ''}
                    onChange={(e) => handleInputChange('eye_color', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      fontSize: '14px',
                      backgroundColor: userSettings.eye_color ? 'hsl(280 70% 60%)' : 'hsl(var(--background))',
                      color: 'hsl(var(--foreground))',
                      fontFamily: 'inherit',
                      fontWeight: '500',
                      outline: 'none'
                    }}
                  >
                    {!userSettings.eye_color && <option value="">Wählen...</option>}
                    <option value="brown">Braun</option>
                    <option value="blue">Blau</option>
                    <option value="green">Grün</option>
                    <option value="gray">Grau</option>
                    <option value="hazel">Haselnuss</option>
                  </select>
                </div>

                {/* Skin Tone */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Hautton
                  </label>
                  <select
                    value={userSettings.skin_tone || ''}
                    onChange={(e) => handleInputChange('skin_tone', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      fontSize: '14px',
                      backgroundColor: userSettings.skin_tone ? 'hsl(47 100% 65%)' : 'hsl(var(--background))',
                      color: userSettings.skin_tone ? '#374151' : 'hsl(var(--foreground))',
                      fontFamily: 'inherit',
                      fontWeight: '500',
                      outline: 'none'
                    }}
                  >
                    {!userSettings.skin_tone && <option value="">Wählen...</option>}
                    <option value="european">Europäisch</option>
                    <option value="latin">Lateinamerikanisch</option>
                    <option value="asian">Asiatisch</option>
                    <option value="african">Afrikanisch</option>
                    <option value="arabic">Arabisch</option>
                  </select>
                </div>

                {/* Age Range */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Altersbereich
                  </label>
                  <select
                    value={userSettings.age_range || ''}
                    onChange={(e) => handleInputChange('age_range', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      fontSize: '14px',
                      backgroundColor: userSettings.age_range ? 'hsl(280 70% 60%)' : 'hsl(var(--background))',
                      color: 'hsl(var(--foreground))',
                      fontFamily: 'inherit',
                      fontWeight: '500',
                      outline: 'none'
                    }}
                  >
                    {!userSettings.age_range && <option value="">Wählen...</option>}
                    <option value="under-20">unter 20</option>
                    <option value="young-adult">23-27</option>
                    <option value="adult">28-35</option>
                    <option value="over-40">über 40</option>
                  </select>
                </div>
            </div>
          </div>

          {/* Generation Defaults */}
          <div className="bg-nano-card p-6 shadow-xl">
            <h3 className="text-title-large text-white mb-4">
              Generierungs-Einstellungen
            </h3>
            
            <div className="space-y-4">
                {/* Default Resolution */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Standard Auflösung
                  </label>
                  <select
                    value={userSettings.default_resolution || ''}
                    onChange={(e) => handleInputChange('default_resolution', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      fontSize: '14px',
                      backgroundColor: userSettings.default_resolution ? 'hsl(47 100% 65%)' : 'hsl(var(--background))',
                      color: userSettings.default_resolution ? '#374151' : 'hsl(var(--foreground))',
                      fontFamily: 'inherit',
                      fontWeight: '500',
                      outline: 'none'
                    }}
                  >
                    <option value="1K">1K</option>
                    <option value="2K">2K</option>
                    <option value="4K">4K</option>
                  </select>
                </div>

                {/* Default Aspect Ratio */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Standard Seitenverhältnis
                  </label>
                  <select
                    value={userSettings.default_aspect_ratio || ''}
                    onChange={(e) => handleInputChange('default_aspect_ratio', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      fontSize: '14px',
                      backgroundColor: userSettings.default_aspect_ratio ? 'hsl(280 70% 60%)' : 'hsl(var(--background))',
                      color: 'hsl(var(--foreground))',
                      fontFamily: 'inherit',
                      fontWeight: '500',
                      outline: 'none'
                    }}
                  >
                    <option value="1:1">1:1 (Quadrat)</option>
                    <option value="9:16">9:16 (Hochformat/Story)</option>
                    <option value="16:9">16:9 (Querformat/Widescreen)</option>
                    <option value="4:3">4:3 (Post)</option>
                    <option value="3:4">3:4 (Portrait)</option>
                    <option value="2:3">2:3 (Portrait)</option>
                    <option value="3:2">3:2 (Landscape)</option>
                  </select>
                </div>
            </div>
          </div>
        </div>

        {/* Save Status */}
        {lastSaved && (
          <div className="mt-4 text-center text-sm text-slate-400">
            Zuletzt gespeichert: {lastSaved.toLocaleTimeString()}
          </div>
        )}
      </main>
    </div>
  )
}