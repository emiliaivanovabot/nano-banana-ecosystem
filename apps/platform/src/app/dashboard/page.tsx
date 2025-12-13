'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@repo/auth-config'
import { V1User } from '@repo/database'

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
                  Nano Banana Platform
                </h1>
                <p className="text-sm text-gray-500">Welcome back, {v1User.username}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* User Info Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Account Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Username</dt>
                  <dd className="mt-1 text-sm text-gray-900">{v1User.username}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Subscription Level</dt>
                  <dd className="mt-1 text-sm text-gray-900">
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
                  <dt className="text-sm font-medium text-gray-500">Credits Remaining</dt>
                  <dd className="mt-1 text-sm text-gray-900">{v1User.credits_remaining || 0}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(v1User.created_at).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      v1User.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {v1User.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </dd>
                </div>
                {v1User.preferred_model && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Preferred Model</dt>
                    <dd className="mt-1 text-sm text-gray-900">{v1User.preferred_model}</dd>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Apps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">S</span>
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-gray-900">Seedream</h3>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  AI-powered image generation with face-based personalization
                </p>
                <div className="mt-4">
                  <a
                    href="http://localhost:3001"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Launch Seedream
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow opacity-50">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">V</span>
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-gray-900">Video Generator</h3>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Create stunning AI videos from images and prompts
                </p>
                <div className="mt-4">
                  <button
                    disabled
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-500 bg-gray-100 cursor-not-allowed"
                  >
                    Coming Soon
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow opacity-50">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">C</span>
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-gray-900">Chat Assistant</h3>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  AI-powered conversations and content creation
                </p>
                <div className="mt-4">
                  <button
                    disabled
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-500 bg-gray-100 cursor-not-allowed"
                  >
                    Coming Soon
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          {userStats && (
            <div className="mt-8 bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Usage Statistics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Total Generations</dt>
                    <dd className="mt-1 text-2xl font-semibold text-gray-900">{userStats.generationsCount}</dd>
                  </div>
                  {userStats.recentGenerations.length > 0 && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Last Generation</dt>
                      <dd className="mt-1 text-sm text-gray-900">
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