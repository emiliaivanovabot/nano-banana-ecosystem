'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@repo/auth-config'
import { V1User } from '@repo/database'
import '@nano-banana/ui-components'

export default function Dashboard() {
  const router = useRouter()
  const { user, loading, logout } = useAuth()
  const [userStats, setUserStats] = useState<{
    generationsCount: number
    recentGenerations: any[]
  } | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      // Fetch user statistics
      fetchUserStats()
    }
  }, [user])

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/user-stats')
      if (response.ok) {
        const stats = await response.json()
        setUserStats(stats)
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return (
      <div className="page-layout flex-center">
        <div className="text-body">Loading...</div>
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
              <div>
                <h1 className="title-large">
                  Nano Banana Platform
                </h1>
                <p className="subtitle">Welcome back, {v1User.username}</p>
              </div>
              <div className="flex-nano">
                <button
                  onClick={() => router.push('/settings')}
                  className="btn-base btn-blue"
                >
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="btn-base btn-error"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container-nano py-6">
          {/* User Info Card */}
          <div className="bg-nano-card p-6 mb-6">
            <div>
              <h3 className="text-title mb-4">
                Account Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <dt className="text-body-small text-muted">Username</dt>
                  <dd className="mt-1 text-body">{v1User.username}</dd>
                </div>
                <div>
                  <dt className="text-body-small text-muted">Subscription Level</dt>
                  <dd className="mt-1 text-body">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${{
                      free: 'bg-gray-100 text-gray-800',
                      premium: 'bg-blue-100 text-blue-800',
                      enterprise: 'bg-purple-100 text-purple-800'
                    }[v1User.subscription_level || 'free']}`}>
                      {(v1User.subscription_level || 'free').toUpperCase()}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-body-small text-muted">Credits Remaining</dt>
                  <dd className="mt-1 text-body">{v1User.credits_remaining || 0}</dd>
                </div>
                <div>
                  <dt className="text-body-small text-muted">Member Since</dt>
                  <dd className="mt-1 text-body">
                    {new Date(v1User.created_at).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-body-small text-muted">Status</dt>
                  <dd className="mt-1 text-body">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      v1User.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {v1User.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </dd>
                </div>
                {v1User.default_resolution && (
                  <div>
                    <dt className="text-body-small text-muted">Default Resolution</dt>
                    <dd className="mt-1 text-body">{v1User.default_resolution}</dd>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Apps Grid */}
          <div className="grid-nano-3 gap-6">
            <div className="bg-nano-card shadow-nano hover:shadow-nano-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">🍌</span>
                  </div>
                  <h3 className="ml-3 text-title">Nano Banana</h3>
                </div>
                <p className="mt-2 text-body-small text-muted">
                  AI image generation suite with 5 specialized modules
                </p>
                <div className="mt-4">
                  <div className="flex gap-2">
                    <a
                      href="/generation-modes"
                      className="btn-base btn-yellow"
                    >
                      Launch Nano Banana
                    </a>
                    <a
                      href="/gallery"
                      className="btn-base btn-secondary"
                    >
                      📸 Gallery
                    </a>
                    <a
                      href="/inspiration"
                      className="btn-base btn-secondary"
                    >
                      💡 Inspiration
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-nano-card shadow-nano hover:shadow-nano-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">S</span>
                  </div>
                  <h3 className="ml-3 text-title">Seedream</h3>
                </div>
                <p className="mt-2 text-body-small text-muted">
                  AI-powered image generation with face-based personalization
                </p>
                <div className="mt-4">
                  <a
                    href="http://localhost:3001"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-base btn-purple"
                  >
                    Launch Seedream
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-nano-card shadow-nano hover:shadow-nano-md transition-shadow opacity-50">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">V</span>
                  </div>
                  <h3 className="ml-3 text-title">Video Generator</h3>
                </div>
                <p className="mt-2 text-body-small text-muted">
                  Create stunning AI videos from images and prompts
                </p>
                <div className="mt-4">
                  <button
                    disabled
                    className="btn-base btn-disabled"
                  >
                    Coming Soon
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-nano-card shadow-nano hover:shadow-nano-md transition-shadow opacity-50">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">C</span>
                  </div>
                  <h3 className="ml-3 text-title">Chat Assistant</h3>
                </div>
                <p className="mt-2 text-body-small text-muted">
                  AI-powered conversations and content creation
                </p>
                <div className="mt-4">
                  <button
                    disabled
                    className="btn-base btn-disabled"
                  >
                    Coming Soon
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          {userStats && (
            <div className="mt-8 bg-nano-card p-6">
              <div>
                <h3 className="text-title mb-4">
                  Usage Statistics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-body-small text-muted">Total Generations</dt>
                    <dd className="mt-1 text-title-large">{userStats.generationsCount}</dd>
                  </div>
                  {userStats.recentGenerations.length > 0 && (
                    <div>
                      <dt className="text-body-small text-muted">Last Generation</dt>
                      <dd className="mt-1 text-body">
                        {new Date(userStats.recentGenerations[0].created_at).toLocaleDateString()}
                      </dd>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
  )
}