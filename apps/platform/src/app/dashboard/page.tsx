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
  
  const [creditAnalytics, setCreditAnalytics] = useState<{
    creditsRemaining: number
    totalCreditsUsed: number
    subscriptionTier: string
    moduleUsage: Array<{
      name: string
      credits: number
      icon: string
      generations: number
    }>
    totalUsedLast30Days: number
    potential: {
      seedreamImages: number
      wanVideos: number
      geminiImages: number
    }
    recentActivity: {
      totalGenerations: number
      byModule: Record<string, number>
    }
    trends: {
      avgCreditsPerDay: number
      creditsLast7Days: number
      mostExpensiveModule: string
    }
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
      // Fetch credit analytics
      fetchCreditAnalytics()
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

  const fetchCreditAnalytics = async () => {
    try {
      const response = await fetch('/api/user-credit-analytics')
      if (response.ok) {
        const analytics = await response.json()
        setCreditAnalytics(analytics)
      }
    } catch (error) {
      console.error('Failed to fetch credit analytics:', error)
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
      <>
        <style jsx>{`
          @keyframes drawLine {
            to {
              stroke-dashoffset: 0;
            }
          }
          
          @keyframes fadeInPoint {
            to {
              opacity: 1;
            }
          }
          
          .credit-card {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .credit-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          }
        `}</style>
        <div className="page-layout">
        {/* Header */}
        <header className="bg-nano-header">
          <div className="container-nano">
            <div className="flex-between py-4">
              <div>
                <h1 className="title-large">
                  Nano Banana Platform
                </h1>
                <p className="subtitle">Welcome back, <span className="text-yellow font-bold text-lg capitalize">{v1User.username?.split('.')[0]}</span> 👋</p>
              </div>
              <div className="flex-nano">
                <button
                  onClick={() => router.push('/settings')}
                  className="btn-base btn-secondary"
                >
                  ⚙️ Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="btn-base btn-red"
                >
                  👋 Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container-nano py-8">
          
          {/* Premium Credit Analytics - MAIN FOCUS */}
          {creditAnalytics && (
            <div className="space-y-6 mb-8">
              {/* Header with Main Credits Display */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Credit Analytics</h2>
                    <p className="text-slate-400">Track your AI generation spending</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-emerald-400">{creditAnalytics.creditsRemaining}</div>
                    <div className="text-sm text-slate-400">Credits Remaining</div>
                  </div>
                </div>

                {/* Credit Usage Breakdown - Horizontal Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left: Usage Breakdown */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Where Your Credits Went</h3>
                    {creditAnalytics.moduleUsage.map((module, index) => {
                      const total = creditAnalytics.moduleUsage.reduce((sum, m) => sum + m.credits, 0);
                      const percentage = total > 0 ? (module.credits / total) * 100 : 0;
                      
                      return (
                        <div key={module.name} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{module.icon}</span>
                              <span className="text-white font-medium">{module.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-emerald-400">{module.credits}</div>
                              <div className="text-xs text-slate-400">{module.generations} gens</div>
                            </div>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-1000 ease-out ${
                                index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                                index === 1 ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
                                'bg-gradient-to-r from-purple-400 to-purple-500'
                              }`}
                              style={{ 
                                width: `${percentage}%`,
                                animationDelay: `${index * 0.2}s`
                              }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Right: Motivational Trending Chart */}
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Usage Trend</h3>
                      <div className="flex items-center gap-2 text-emerald-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                        </svg>
                        <span className="text-sm font-medium">+{creditAnalytics.trends.avgCreditsPerDay}/day</span>
                      </div>
                    </div>
                    
                    {/* Premium SVG Chart */}
                    <div className="h-32 w-full">
                      <svg viewBox="0 0 300 120" className="w-full h-full">
                        <defs>
                          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity="0.3"/>
                            <stop offset="100%" stopColor="rgb(34, 197, 94)" stopOpacity="0"/>
                          </linearGradient>
                        </defs>
                        
                        {/* Grid lines */}
                        <g stroke="rgb(71, 85, 105)" strokeWidth="0.5" opacity="0.3">
                          <line x1="0" y1="30" x2="300" y2="30"/>
                          <line x1="0" y1="60" x2="300" y2="60"/>
                          <line x1="0" y1="90" x2="300" y2="90"/>
                        </g>
                        
                        {/* Chart area */}
                        <path
                          d="M 0 100 L 50 85 L 100 70 L 150 45 L 200 35 L 250 25 L 300 15 L 300 120 L 0 120 Z"
                          fill="url(#chartGradient)"
                          className="animate-pulse"
                        />
                        
                        {/* Chart line */}
                        <path
                          d="M 0 100 L 50 85 L 100 70 L 150 45 L 200 35 L 250 25 L 300 15"
                          stroke="rgb(34, 197, 94)"
                          strokeWidth="2"
                          fill="none"
                          className="drop-shadow-sm"
                          style={{
                            strokeDasharray: "600",
                            strokeDashoffset: "600",
                            animation: "drawLine 2s ease-out forwards"
                          }}
                        />
                        
                        {/* Data points */}
                        {[0, 50, 100, 150, 200, 250, 300].map((x, i) => {
                          const y = [100, 85, 70, 45, 35, 25, 15][i];
                          return (
                            <circle
                              key={i}
                              cx={x}
                              cy={y}
                              r="3"
                              fill="rgb(34, 197, 94)"
                              stroke="white"
                              strokeWidth="1"
                              className="drop-shadow-sm"
                              style={{
                                opacity: 0,
                                animation: `fadeInPoint 0.5s ease-out ${1.5 + i * 0.1}s forwards`
                              }}
                            />
                          );
                        })}
                      </svg>
                    </div>
                    
                    <div className="flex justify-between text-xs text-slate-400 mt-2">
                      <span>7 days ago</span>
                      <span>Today</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Potential Generations - Clean Grid */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Remaining Potential
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="credit-card bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200 cursor-pointer">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-lg">🍌</span>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-yellow-700">{creditAnalytics.potential.geminiImages}</div>
                        <div className="text-sm text-yellow-600">Nano Images</div>
                      </div>
                    </div>
                    <div className="text-xs text-yellow-600">1 credit per image</div>
                  </div>
                  
                  <div className="credit-card bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200 cursor-pointer">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-lg">🎨</span>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-700">{creditAnalytics.potential.seedreamImages}</div>
                        <div className="text-sm text-purple-600">Seedream Images</div>
                      </div>
                    </div>
                    <div className="text-xs text-purple-600">2 credits per image</div>
                  </div>
                  
                  <div className="credit-card bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200 cursor-pointer">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-lg">📹</span>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-700">{creditAnalytics.potential.wanVideos}</div>
                        <div className="text-sm text-blue-600">WAN Videos</div>
                      </div>
                    </div>
                    <div className="text-xs text-blue-600">10 credits per video</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Apps Grid */}
          <div className="grid-nano-3 gap-8">
            <div className="bg-nano-card shadow-nano hover:shadow-nano-md transition-shadow">
              <div className="p-8">
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
              <div className="p-8">
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
                <div className="grid-nano-2 gap-4">
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
      </>
  )
}