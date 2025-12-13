'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@repo/auth-config'

export default function GenerationModesPage() {
  const { user } = useAuth()
  const [isMobile, setIsMobile] = useState(false)

  // Mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const generationModes = [
    {
      id: 'nano-banana-classic',
      path: '/nano-banana',
      title: 'Nano Banana Classic',
      subtitle: `Erstelle Bilder für ${user?.username || 'dich'}`,
      description: 'Erstelle Bilder aus Text-Beschreibungen mit Face-Integration',
      icon: '🍌',
      color: '#a86d09',
      available: true
    },
    {
      id: 'image-to-image',
      path: '/image2image',
      title: 'Image2Image',
      subtitle: 'Higgsfield für Reiche',
      description: 'Face-Swap und Bild-Transformation mit KI',
      icon: '🖼️',
      color: '#992f63',
      available: true
    },
    {
      id: 'collab-generation', 
      path: '/collab',
      title: 'Collab Partner',
      subtitle: 'Mache Collabs mit anderen',
      description: 'Gemeinsame Bildgenerierung mit Collab Partner',
      icon: '🤝',
      color: '#5a387d',
      available: true
    },
    {
      id: 'multi-prompts',
      path: '/multi-prompts',
      title: 'Multi Prompts Generation',
      subtitle: 'Mehrere Prompts gleichzeitig',
      description: 'Generiere Bilder aus mehreren Prompts parallel',
      icon: '⚡',
      color: '#059669',
      available: false // Noch nicht implementiert
    },
    {
      id: 'grok-generator',
      path: '/grok',
      title: 'Grok Prompt Generator',
      subtitle: 'Powered by Grok AI',
      description: 'Beschreibe deine Idee und lass Grok professionelle Prompts generieren',
      icon: '🤖',
      color: '#d97706',
      available: false // Noch nicht implementiert
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center bg-white backdrop-blur-sm p-4 rounded-2xl border shadow-sm">
            <Link 
              href="/dashboard" 
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <span>←</span>
              <span>Dashboard</span>
            </Link>
            
            <div className="text-center">
              <h1 className="text-xl font-bold">🍌 Generation Modi</h1>
              <p className="text-sm text-gray-600">nano banana ecosystem</p>
            </div>
            
            <div className="w-20"></div>
          </div>
        </div>

        {/* Username Display */}
        {user && (
          <div className="text-center mb-6">
            <div className="inline-block bg-white px-4 py-2 rounded-full border shadow-sm">
              <span className="text-sm text-gray-600">Angemeldet als </span>
              <span className="font-medium text-gray-900">{user.username}</span>
            </div>
          </div>
        )}

        {/* Generation Modes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {generationModes.map((mode) => (
            <div key={mode.id}>
              {mode.available ? (
                <Link href={mode.path}>
                  <div 
                    className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      borderLeftColor: mode.color,
                      borderLeftWidth: '4px'
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                          style={{
                            backgroundColor: `${mode.color}20`,
                            color: mode.color
                          }}
                        >
                          {mode.icon}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{mode.title}</h3>
                          <p className="text-sm text-gray-600">{mode.subtitle}</p>
                        </div>
                      </div>
                      <div className="text-gray-400">
                        →
                      </div>
                    </div>
                    
                    <p className="text-gray-700 text-sm">
                      {mode.description}
                    </p>
                    
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-xs text-gray-500 uppercase font-medium">Verfügbar</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ) : (
                <div 
                  className="bg-gray-50 p-6 rounded-2xl border border-gray-200 opacity-60 cursor-not-allowed"
                  style={{
                    borderLeftColor: '#e5e7eb',
                    borderLeftWidth: '4px'
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center text-2xl text-gray-400">
                        {mode.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-500">{mode.title}</h3>
                        <p className="text-sm text-gray-400">{mode.subtitle}</p>
                      </div>
                    </div>
                    <div className="text-gray-300">
                      ⏳
                    </div>
                  </div>
                  
                  <p className="text-gray-500 text-sm">
                    {mode.description}
                  </p>
                  
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                      <span className="text-xs text-gray-400 uppercase font-medium">Bald verfügbar</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <p className="text-sm text-gray-600">
              🚀 <strong>V2 Migration in Progress</strong> - Alle Modi werden 1:1 von V1 kopiert
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Deine V1 Settings und Face-Bilder sind bereits verfügbar
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}