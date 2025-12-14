'use client'

import React from 'react'
import Link from 'next/link'
import { useAuth } from '@repo/auth-config'
import UserInspoGallery from '../components/UserInspoGallery'
import { ArrowLeft, Sparkles } from 'lucide-react'

export default function InspirationPage() {
  const { user } = useAuth()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '24px',
      color: 'white'
    }}>
      {/* Header */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        marginBottom: '24px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          padding: '12px 20px',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <Link 
            href="/dashboard"
            style={{
              color: 'white',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '500',
              padding: '6px 12px',
              borderRadius: '8px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <ArrowLeft size={16} />
            Dashboard
          </Link>
          
          <div style={{
            textAlign: 'center'
          }}>
            <h1 style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              💡 Community Inspiration
            </h1>
            <p style={{
              margin: 0,
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.7)',
              fontStyle: 'italic'
            }}>
              Entdecke kreative Bilder der Community
            </p>
          </div>
          
          <div style={{ width: '80px' }} />
        </div>
      </div>

      {/* Community Stats */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto 24px auto'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(15px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Sparkles size={20} />
          <span style={{ fontSize: '16px', fontWeight: '500' }}>
            Community Creations - Lass dich inspirieren!
          </span>
        </div>
      </div>

      {/* Full Inspiration Gallery */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(15px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '20px',
          padding: '24px'
        }}>
          <UserInspoGallery currentUser={user} />
        </div>
      </div>

      {/* Tips */}
      <div style={{
        maxWidth: '1200px',
        margin: '24px auto 0 auto'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h3 style={{
            margin: '0 0 12px 0',
            fontSize: '16px',
            fontWeight: '600',
            color: 'rgba(255, 255, 255, 0.9)'
          }}>
            💡 Inspiration Tipps
          </h3>
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.7)',
            lineHeight: '1.5'
          }}>
            Klicke auf ein Bild um den Prompt zu kopieren • 
            Nutze die Ideen als Basis für deine eigenen Kreationen • 
            Experimentiere mit verschiedenen Variationen
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <div style={{
        maxWidth: '1200px',
        margin: '24px auto 0 auto',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <Link 
            href="/gallery"
            style={{
              color: 'rgba(255, 255, 255, 0.8)',
              textDecoration: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.1)',
              fontSize: '14px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
            }}
          >
            📸 Deine Gallery
          </Link>
          
          <Link 
            href="/generation-modes"
            style={{
              color: 'rgba(255, 255, 255, 0.8)',
              textDecoration: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.1)',
              fontSize: '14px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
            }}
          >
            🍌 Neue Bilder generieren
          </Link>
        </div>
      </div>
    </div>
  )
}