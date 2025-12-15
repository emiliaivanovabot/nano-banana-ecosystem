'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@repo/auth-config'
import { V1User } from '@repo/database'
import '@nano-banana/ui-components'
import ImageModal from '../components/ImageModal'

export default function Dashboard() {
  const router = useRouter()
  const { user, loading: authLoading, logout } = useAuth()
  const [selectedPeriod, setSelectedPeriod] = useState<'7' | '14' | 'month' | 'total'>('7')
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false)
  const [selectedImage, setSelectedImage] = useState<{
    id: string
    result_image_url: string
    prompt?: string
    created_at: string
    generation_type?: string
    username?: string
  } | null>(null)
  const [userProfile, setUserProfile] = useState<{
    credits_remaining: number
    total_credits_used: number
    subscription_tier: string
    display_name: string
    last_login: string
    // USER_STATS Daten
    total_prompt_tokens: number
    total_output_tokens: number
    total_cost_usd: number
    daily_cost_usd: number
    total_generations: number
    total_errors: number
    total_generation_time_seconds: number
    daily_count_2k_9_16: number
    daily_count_4k_9_16: number
    success_rate: number
    avg_generation_time: number
    // DAILY_USAGE_HISTORY
    peak_usage_hour: number
    most_used_prompts: string[]
  } | null>({
    credits_remaining: 127,
    total_credits_used: 89,
    subscription_tier: 'premium', 
    display_name: 'Max Mustermann',
    last_login: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6h ago
    // USER_STATS fake data
    total_prompt_tokens: 45230,
    total_output_tokens: 12890,
    total_cost_usd: 0.45,
    daily_cost_usd: 0.08,
    total_generations: 156,
    total_errors: 3,
    total_generation_time_seconds: 2340, // 39 minutes total
    daily_count_2k_9_16: 4,
    daily_count_4k_9_16: 2,
    success_rate: 98,
    avg_generation_time: 15, // seconds
    // DAILY_USAGE_HISTORY
    peak_usage_hour: 14, // 2 PM
    most_used_prompts: ['Portrait', 'Landscape', 'Abstract']
  })
  
  const [recentGenerations, setRecentGenerations] = useState<Array<{
    id: string
    username: string
    prompt: string
    result_image_url: string
    created_at: string
    generation_type: string
    original_filename: string
    status: string
  }> | null>(null)
  
  const [todayStats, setTodayStats] = useState<{
    nano_banana_count: number
    seedream_count: number
    wan_video_count: number
    total_credits_used_today: number
  } | null>({
    nano_banana_count: 6,
    seedream_count: 0, 
    wan_video_count: 1,
    total_credits_used_today: 8
  })

  // Credit Analytics - calculated from userProfile data
  const creditAnalytics = userProfile ? {
    moduleUsage: [
      {
        name: 'Nano Banana',
        icon: '🍌',
        credits: Math.round(userProfile.total_credits_used * 0.6),
        generations: Math.round(userProfile.total_credits_used * 0.6)
      },
      {
        name: 'Seedream',
        icon: '🎨',
        credits: Math.round(userProfile.total_credits_used * 0.3),
        generations: Math.round(userProfile.total_credits_used * 0.15)
      },
      {
        name: 'WAN Video',
        icon: '📹',
        credits: Math.round(userProfile.total_credits_used * 0.1),
        generations: Math.round(userProfile.total_credits_used * 0.01)
      }
    ],
    trends: {
      avgCreditsPerDay: 15
    },
    potential: {
      geminiImages: Math.floor(userProfile.credits_remaining / 1),
      seedreamImages: Math.floor(userProfile.credits_remaining / 2),
      wanVideos: Math.floor(userProfile.credits_remaining / 10)
    }
  } : null

  // User Stats - simple calculation from existing data
  const userStats = recentGenerations ? {
    generationsCount: recentGenerations.length,
    recentGenerations: recentGenerations
  } : null

  useEffect(() => {
    console.log('🔍 Dashboard useEffect:', { user: !!user, authLoading, userExists: !!user })
    if (!authLoading && !user) {
      console.log('🚨 Dashboard redirecting to login - no user found')
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      // fetchUserProfile()
      fetchRecentGenerations()
      // fetchTodayStats()
      // Use fake data for containers 1,2 and real API for container 3 (images)
    }
  }, [user])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user-stats')
      if (response.ok) {
        const profile = await response.json()
        setUserProfile(profile)
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
    }
  }

  const fetchRecentGenerations = async () => {
    try {
      const v1User = user as V1User
      const response = await fetch(`/api/images/recent?username=${v1User.username}&limit=8`)
      if (response.ok) {
        const data = await response.json()
        setRecentGenerations(data.images || [])
      } else {
        setRecentGenerations([])
      }
    } catch (error) {
      console.error('Failed to fetch recent generations:', error)
      setRecentGenerations([])
    }
  }

  const fetchTodayStats = async () => {
    try {
      const response = await fetch('/api/user-credit-analytics')
      if (response.ok) {
        const stats = await response.json()
        setTodayStats(stats)
      }
    } catch (error) {
      console.error('Failed to fetch today stats:', error)
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

  if (authLoading) {
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
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h1 className="title-large">
                    Nano Banana Platform
                  </h1>
                  <button
                    onClick={handleLogout}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded transition-colors text-xs font-medium"
                  >
                    Logout
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <p className="subtitle">Welcome back, <span className="text-yellow font-bold text-lg capitalize">{v1User.username?.split('.')[0]}</span> 👋</p>
                  <button
                    onClick={() => router.push('/settings')}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-1.5 rounded transition-colors text-sm font-medium"
                  >
                    Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container-nano py-8">
          
          {/* HAUPT-BEREICH: Guthaben-Übersicht */}
          {userProfile && (
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8">
              
              {/* Linke Spalte: Haupt-Bereich (3/4) */}
              <div className="xl:col-span-3 space-y-6">
                
                {/* 0. Favoriten - Kompakt */}
                <div className="bg-nano-card p-3 shadow-xl">
                  <h3 className="text-sm font-bold text-white mb-2">⭐ Favoriten</h3>
                  <div className="flex gap-1">
                    <a
                      href="/generation-modes"
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded transition-colors text-xs font-medium flex-1 text-center"
                    >
                      Nano-Banana
                    </a>
                    <a
                      href="http://localhost:3001"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded transition-colors text-xs font-medium flex-1 text-center"
                    >
                      WAN 2.5
                    </a>
                    <a
                      href="/inspiration"
                      className="bg-slate-600 hover:bg-slate-700 text-white px-2 py-1 rounded transition-colors text-xs font-medium flex-1 text-center"
                    >
                      Grok Prompts
                    </a>
                    <a
                      href="/generation-modes"
                      className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded transition-colors text-xs font-medium flex-1 text-center"
                    >
                      Seedream
                    </a>
                  </div>
                </div>
                
                {/* 1. Guthaben-Übersicht - Kompakt */}
                <div className="bg-nano-card p-4 shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-bold text-white mb-1">Verbleibendes Guthaben</h2>
                      <div className="text-2xl font-bold text-emerald-400">{userProfile.credits_remaining} Credits</div>
                      <p className="text-sm text-slate-300">(≈{Math.round(userProfile.credits_remaining * 0.33)}€)</p>
                    </div>
                    {todayStats && (
                      <div className="text-right">
                        <p className="text-sm text-slate-400">Heute verbraucht:</p>
                        <p className="text-lg font-bold text-yellow-400">{todayStats.total_credits_used_today} Credits</p>
                        <p className="text-xs text-slate-500">{todayStats.nano_banana_count + todayStats.seedream_count} Bilder, {todayStats.wan_video_count} Videos</p>
                        <p className="text-xs text-slate-500 mt-1">Last Login: vor 6 Stunden</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t border-slate-700 pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-slate-300">⚡ Performance</h4>
                      <button
                        onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                        className="text-xs text-slate-400 hover:text-slate-300 transition-colors flex items-center gap-1"
                      >
                        Details
                        <svg
                          className={`w-3 h-3 transition-transform ${isDetailsExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                    <div className="grid grid-cols-6 gap-4">
                      <div className="text-center">
                        <div className="text-sm font-bold text-white">{userProfile.success_rate}%</div>
                        <div className="text-xs text-slate-400">Erfolg</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-bold text-white">{userProfile.avg_generation_time}s</div>
                        <div className="text-xs text-slate-400">Ø Zeit</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-bold text-white">{Math.round(userProfile.total_prompt_tokens/1000)}k</div>
                        <div className="text-xs text-slate-400">Tokens</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-bold text-white">{userProfile.total_errors}</div>
                        <div className="text-xs text-slate-400">Errors</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-bold text-white">{userProfile.total_credits_used}</div>
                        <div className="text-xs text-slate-400">Credits</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-bold text-white">{userProfile.total_generations}</div>
                        <div className="text-xs text-slate-400">Media</div>
                      </div>
                    </div>
                  </div>
                  
                  {isDetailsExpanded && (
                    <>
                      <div className="border-t border-slate-700 pt-3 mt-3">
                        <h4 className="text-sm font-medium text-slate-300 mb-2">💰 Ausgaben-Verlauf</h4>
                        <div className="grid grid-cols-4 gap-2">
                          <div className="text-center">
                            <div className="text-sm font-bold text-white">{todayStats?.total_credits_used_today || 0}</div>
                            <div className="text-xs text-slate-400">Heute</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-bold text-white">{Math.round(userProfile.total_credits_used * 0.15)}</div>
                            <div className="text-xs text-slate-400">Woche</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-bold text-white">{userProfile.total_credits_used}</div>
                            <div className="text-xs text-slate-400">Monat</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-bold text-white">${userProfile?.total_cost_usd?.toFixed(2) || '0.00'}</div>
                            <div className="text-xs text-slate-400">Total</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t border-slate-700 pt-3 mt-3">
                        <h4 className="text-sm font-medium text-slate-300 mb-2">⭐ Beliebteste Programme</h4>
                        <div className="relative bg-slate-700 h-4 mb-2 flex rounded overflow-hidden shadow-sm">
                          <div className="bg-yellow-400/60 h-4 transition-all hover:brightness-110" style={{width: '67%'}}></div>
                          <div className="bg-blue-400/60 h-4 transition-all hover:brightness-110" style={{width: '28%'}}></div>
                          <div className="bg-purple-400/60 h-4 transition-all hover:brightness-110" style={{width: '5%'}}></div>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-yellow-400/70 font-bold">Nano-Banana</span>
                          <span className="text-blue-400/70 font-bold">Seedream</span>
                          <span className="text-purple-400/70 font-bold">WAN</span>
                        </div>
                      </div>
                      
                      <div className="border-t border-slate-700 pt-3 mt-3">
                        <h4 className="text-sm font-medium text-slate-300 mb-2">📐 Formate & Tech Stats</h4>
                        <div className="space-y-3">
                          {/* Beliebte Formate */}
                          <div>
                            <h5 className="text-xs font-medium text-slate-400 mb-1">Beliebte Formate</h5>
                            <div className="relative bg-slate-700 h-4 mb-3 flex rounded overflow-hidden shadow-sm">
                              <div className="bg-yellow-400/60 h-4 flex items-center justify-center transition-all hover:brightness-110" style={{width: '45%'}}>
                                <span className="text-black text-xs font-bold">16:9</span>
                              </div>
                              <div className="bg-purple-400/60 h-4 flex items-center justify-center transition-all hover:brightness-110" style={{width: '28%'}}>
                                <span className="text-black text-xs font-bold">1:1</span>
                              </div>
                              <div className="bg-emerald-400/60 h-4 flex items-center justify-center transition-all hover:brightness-110" style={{width: '18%'}}>
                                <span className="text-black text-xs font-bold">9:16</span>
                              </div>
                              <div className="bg-blue-400/60 h-4 flex items-center justify-center transition-all hover:brightness-110" style={{width: '9%'}}>
                                <span className="text-black text-xs font-bold">4:3</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Tech Stats */}
                          <div>
                            <h5 className="text-xs font-medium text-slate-400 mb-1">Tech Stats</h5>
                            <div className="grid grid-cols-4 gap-2">
                              <div className="text-center">
                                <div className="text-sm font-bold text-white">{userProfile.total_errors}</div>
                                <div className="text-xs text-slate-400">Fehler</div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm font-bold text-white">{userProfile.avg_generation_time}s</div>
                                <div className="text-xs text-slate-400">Ø Zeit</div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm font-bold text-white">{userProfile.daily_count_2k_9_16 || 0}</div>
                                <div className="text-xs text-slate-400">2K</div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm font-bold text-white">{userProfile.daily_count_4k_9_16 || 0}</div>
                                <div className="text-xs text-slate-400">4K</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t border-slate-700 pt-3 mt-3">
                        <h4 className="text-sm font-medium text-slate-300 mb-2">🔑 API Status</h4>
                        <div className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-slate-300">Gemini</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-slate-300">Nano-Banana</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            <span className="text-slate-300">Keys Valid</span>
                          </div>
                          <div className="text-slate-400 text-xs">5min ago</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* 1.6 Nutzungstrend Chart */}
                <div className="bg-nano-card p-4 shadow-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-white">📈 Nutzungstrend</h3>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                      </svg>
                      <span className="text-sm font-medium">
                        {selectedPeriod === '7' && '+15/Tag'}
                        {selectedPeriod === '14' && '+12/Tag'}
                        {selectedPeriod === 'month' && '+8/Tag'}
                        {selectedPeriod === 'total' && '+5/Tag'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Zeitraum Banner */}
                  <div className="flex gap-2 mb-3">
                    <span 
                      className={`text-xs px-2 py-1 rounded cursor-pointer font-medium ${selectedPeriod === '7' ? 'bg-emerald-600/30 text-emerald-300' : 'bg-slate-600/30 text-slate-400'}`}
                      onClick={() => setSelectedPeriod('7')}
                    >
                      7 Tage
                    </span>
                    <span 
                      className={`text-xs px-2 py-1 rounded cursor-pointer ${selectedPeriod === '14' ? 'bg-emerald-600/30 text-emerald-300 font-medium' : 'bg-slate-600/30 text-slate-400'}`}
                      onClick={() => setSelectedPeriod('14')}
                    >
                      14 Tage
                    </span>
                    <span 
                      className={`text-xs px-2 py-1 rounded cursor-pointer ${selectedPeriod === 'month' ? 'bg-emerald-600/30 text-emerald-300 font-medium' : 'bg-slate-600/30 text-slate-400'}`}
                      onClick={() => setSelectedPeriod('month')}
                    >
                      Dieser Monat
                    </span>
                    <span 
                      className={`text-xs px-2 py-1 rounded cursor-pointer ${selectedPeriod === 'total' ? 'bg-emerald-600/30 text-emerald-300 font-medium' : 'bg-slate-600/30 text-slate-400'}`}
                      onClick={() => setSelectedPeriod('total')}
                    >
                      Gesamt
                    </span>
                  </div>
                  
                  {/* Premium SVG Chart */}
                  <div className="h-48 w-full">
                    <svg viewBox="0 0 300 120" className="w-full h-full" preserveAspectRatio="none">
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
                      
                      {/* Day markers (vertical lines) */}
                      <g stroke="rgb(71, 85, 105)" strokeWidth="0.5" opacity="0.4">
                        {[0, 50, 100, 150, 200, 250, 300].map((x, i) => (
                          <line key={i} x1={x} y1="105" x2={x} y2="115"/>
                        ))}
                      </g>
                      
                      {(() => {
                        const data7Days = { x: [0, 50, 100, 150, 200, 250, 300], y: [100, 85, 70, 45, 35, 25, 15], generations: [5, 8, 12, 18, 22, 28, 35] };
                        const data14Days = { 
                          x: [0, 22, 44, 66, 88, 110, 132, 154, 176, 198, 220, 242, 264, 286, 300], 
                          y: [100, 95, 88, 82, 75, 68, 55, 48, 42, 38, 32, 28, 22, 18, 12],
                          generations: [3, 5, 7, 9, 12, 15, 18, 20, 22, 25, 28, 30, 32, 35, 38]
                        };
                        const dataMonth = {
                          x: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300],
                          y: [95, 80, 65, 70, 55, 45, 40, 30, 20, 15, 8],
                          generations: [45, 52, 38, 44, 67, 89, 95, 112, 134, 156, 178]
                        };
                        const dataTotal = {
                          x: [0, 43, 86, 129, 172, 215, 258, 300],
                          y: [98, 85, 75, 65, 50, 35, 20, 5],
                          generations: [12, 45, 89, 134, 267, 445, 678, 890]
                        };
                        
                        let currentData;
                        switch(selectedPeriod) {
                          case '14': currentData = data14Days; break;
                          case 'month': currentData = dataMonth; break;
                          case 'total': currentData = dataTotal; break;
                          default: currentData = data7Days;
                        }
                        
                        const pathData = currentData.x.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x} ${currentData.y[i]}`).join(' ');
                        const areaPath = pathData + ` L 300 120 L 0 120 Z`;
                        
                        return (
                          <>
                            {/* Chart area */}
                            <path
                              d={areaPath}
                              fill="url(#chartGradient)"
                              className="animate-pulse"
                            />
                            
                            {/* Chart line */}
                            <path
                              d={pathData}
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
                          </>
                        );
                      })()}
                      
                      {/* Data points */}
                      {(() => {
                        const data7Days = { x: [0, 50, 100, 150, 200, 250, 300], y: [100, 85, 70, 45, 35, 25, 15], generations: [5, 8, 12, 18, 22, 28, 35] };
                        const data14Days = { 
                          x: [0, 22, 44, 66, 88, 110, 132, 154, 176, 198, 220, 242, 264, 286, 300], 
                          y: [100, 95, 88, 82, 75, 68, 55, 48, 42, 38, 32, 28, 22, 18, 12],
                          generations: [3, 5, 7, 9, 12, 15, 18, 20, 22, 25, 28, 30, 32, 35, 38]
                        };
                        const dataMonth = {
                          x: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300],
                          y: [95, 80, 65, 70, 55, 45, 40, 30, 20, 15, 8],
                          generations: [45, 52, 38, 44, 67, 89, 95, 112, 134, 156, 178]
                        };
                        const dataTotal = {
                          x: [0, 43, 86, 129, 172, 215, 258, 300],
                          y: [98, 85, 75, 65, 50, 35, 20, 5],
                          generations: [12, 45, 89, 134, 267, 445, 678, 890]
                        };
                        
                        let currentData;
                        switch(selectedPeriod) {
                          case '14': currentData = data14Days; break;
                          case 'month': currentData = dataMonth; break;
                          case 'total': currentData = dataTotal; break;
                          default: currentData = data7Days;
                        }
                        
                        return currentData.x.map((x, i) => {
                          const y = currentData.y[i];
                          const generations = currentData.generations[i];
                        return (
                          <g key={i}>
                            <circle
                              cx={x}
                              cy={y}
                              r="2.5"
                              fill="rgb(34, 197, 94)"
                              stroke="rgb(22, 163, 74)"
                              strokeWidth="0.5"
                              className="drop-shadow-sm cursor-pointer"
                              style={{
                                opacity: 0,
                                animation: `fadeInPoint 0.5s ease-out ${1.5 + i * 0.1}s forwards`
                              }}
                              key={`${selectedPeriod}-${i}`}
                              onMouseEnter={() => {
                                // Tooltip anzeigen
                                const tooltip = document.getElementById(`tooltip-${i}`);
                                const bg = document.getElementById(`tooltip-bg-${i}`);
                                if (tooltip) tooltip.style.opacity = '1';
                                if (bg) bg.style.opacity = '1';
                              }}
                              onMouseLeave={() => {
                                // Tooltip verstecken
                                const tooltip = document.getElementById(`tooltip-${i}`);
                                const bg = document.getElementById(`tooltip-bg-${i}`);
                                if (tooltip) tooltip.style.opacity = '0';
                                if (bg) bg.style.opacity = '0';
                              }}
                            />
                            {/* Tooltip Background */}
                            <rect
                              id={`tooltip-bg-${i}`}
                              x={x - 8}
                              y={y - 20}
                              width="16"
                              height="14"
                              rx="2"
                              fill="rgba(0,0,0,0.8)"
                              style={{ opacity: 0, transition: 'opacity 0.2s' }}
                              pointerEvents="none"
                            />
                            {/* Tooltip */}
                            <text
                              id={`tooltip-${i}`}
                              x={x}
                              y={y - 12}
                              textAnchor="middle"
                              fontSize="10"
                              fill="white"
                              fontWeight="bold"
                              style={{ opacity: 0, transition: 'opacity 0.2s' }}
                              pointerEvents="none"
                            >
                              {generations}
                            </text>
                          </g>
                        );
                        });
                      })()}
                    </svg>
                  </div>
                  
                  {selectedPeriod === '7' ? (
                    <div className="relative text-xs text-slate-400 mt-1 h-5">
                      <span className="absolute left-0">Mo</span>
                      <span className="absolute left-[16.7%]">Di</span>
                      <span className="absolute left-[33.3%]">Mi</span>
                      <span className="absolute left-[50%]">Do</span>
                      <span className="absolute left-[66.7%]">Fr</span>
                      <span className="absolute left-[83.3%]">Sa</span>
                      <span className="absolute left-[100%] -translate-x-full text-emerald-400 font-medium">Heute</span>
                    </div>
                  ) : selectedPeriod === '14' ? (
                    <div className="relative text-xs text-slate-400 mt-1 h-5">
                      <span className="absolute left-0 text-emerald-400">So</span>
                      <span className="absolute left-[50%] -translate-x-1/2 text-emerald-400">So</span>
                      <span className="absolute left-[100%] -translate-x-full text-emerald-400 font-medium">Heute</span>
                    </div>
                  ) : selectedPeriod === 'month' ? (
                    <div className="relative text-xs text-slate-400 mt-1 h-5">
                      <span className="absolute left-[10%]">3.</span>
                      <span className="absolute left-[20%]">6.</span>
                      <span className="absolute left-[30%]">9.</span>
                      <span className="absolute left-[40%]">12.</span>
                      <span className="absolute left-[50%]">15.</span>
                      <span className="absolute left-[60%]">18.</span>
                      <span className="absolute left-[70%]">21.</span>
                      <span className="absolute left-[80%]">24.</span>
                      <span className="absolute left-[90%]">27.</span>
                      <span className="absolute left-[100%] -translate-x-full text-emerald-400 font-medium">Heute</span>
                    </div>
                  ) : (
                    <div className="relative text-xs text-slate-400 mt-1 h-5">
                      <span className="absolute left-[14%]">Q1</span>
                      <span className="absolute left-[28%]">Q1 Ende</span>
                      <span className="absolute left-[42%]">Q2</span>
                      <span className="absolute left-[57%]">Q2 Ende</span>
                      <span className="absolute left-[71%]">Q3</span>
                      <span className="absolute left-[85%]">Q3 Ende</span>
                      <span className="absolute left-[100%] -translate-x-full text-emerald-400 font-medium">Jetzt</span>
                    </div>
                  )}
                </div>

                {/* 2. Letzte Aktivität */}
                <div className="bg-nano-card p-4 shadow-2xl">
                  <h3 className="text-lg font-bold text-white mb-3">Letzte Aktivität</h3>
                  <div className="space-y-3">
                    {!user ? (
                      <div className="text-center text-slate-400">Bitte einloggen um Bilder zu sehen.</div>
                    ) : recentGenerations === null ? (
                      <div className="text-center text-slate-400">Lade Bilder...</div>
                    ) : recentGenerations.length === 0 ? (
                      <div className="text-center text-slate-400">Noch keine Bilder generiert.</div>
                    ) : (
                      <div className="flex gap-2 overflow-x-auto pb-2" style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#ccc transparent'
                      }}>
                        {recentGenerations.map((generation, index) => (
                          <img
                            key={generation.id}
                            src={generation.result_image_url}
                            className="w-20 h-20 object-cover rounded-lg cursor-pointer transition-all duration-200 flex-shrink-0 border-2 border-transparent hover:scale-105 hover:border-blue-500 shadow-sm hover:shadow-md"
                            onClick={() => {
                              setSelectedImage({
                                id: generation.id,
                                result_image_url: generation.result_image_url,
                                prompt: generation.prompt,
                                created_at: generation.created_at,
                                generation_type: generation.generation_type,
                                username: generation.username
                              })
                            }}
                            loading="lazy"
                            alt={`Generated image from ${generation.created_at}`}
                            title={`${generation.generation_type} - ${new Date(generation.created_at).toLocaleDateString()}`}
                          />
                        ))}
                      </div>
                    )}
                    
                    {todayStats && (
                    <div className="grid grid-cols-3 gap-4 text-center border-t border-slate-700 pt-3">
                      <div>
                        <div className="text-lg font-bold text-emerald-400">{userProfile?.total_generations || 156}</div>
                        <div className="text-xs text-slate-400">Bilder gesamt</div>
                        <div className="flex flex-col gap-1 mt-1">
                          <span className="text-xs bg-yellow-600/30 text-yellow-300 px-2 py-0.5 rounded">nano-banana</span>
                          <span className="text-xs bg-purple-600/30 text-purple-300 px-2 py-0.5 rounded">seedream</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-blue-400">{todayStats.wan_video_count || 1}</div>
                        <div className="text-xs text-slate-400">Videos gesamt</div>
                        <div className="flex flex-col gap-1 mt-1">
                          <span className="text-xs bg-blue-600/30 text-blue-300 px-2 py-0.5 rounded">wan2.5</span>
                          <span className="text-xs bg-gray-600/30 text-gray-300 px-2 py-0.5 rounded">grok</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-purple-400">{(userProfile?.total_generations || 156) + (todayStats.wan_video_count || 1)}</div>
                        <div className="text-xs text-slate-400">Media gesamt</div>
                      </div>
                    </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Rechte Spalte: Seiten-Bereich (1/4) */}
              <div className="space-y-6">
                
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

          {/* 2. Letzte Aktivität - NACH UNTEN VERSCHOBEN */}
          <div className="bg-nano-card p-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-3">Letzte Aktivität</h3>
            <div className="space-y-3">
              {!user ? (
                <div className="text-center text-slate-400">Bitte einloggen um Bilder zu sehen.</div>
              ) : recentGenerations === null ? (
                <div className="text-center text-slate-400">Lade Bilder...</div>
              ) : recentGenerations.length === 0 ? (
                <div className="text-center text-slate-400">Noch keine Bilder generiert.</div>
              ) : (
                <div className="flex gap-2 overflow-x-auto pb-2" style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#ccc transparent'
                }}>
                  {recentGenerations.map((generation, index) => (
                    <img
                      key={generation.id}
                      src={generation.result_image_url}
                      className="w-20 h-20 object-cover rounded-lg cursor-pointer transition-all duration-200 flex-shrink-0 border-2 border-transparent hover:scale-105 hover:border-blue-500 shadow-sm hover:shadow-md"
                      onClick={() => {
                        setSelectedImage({
                          id: generation.id,
                          result_image_url: generation.result_image_url,
                          prompt: generation.prompt,
                          created_at: generation.created_at,
                          generation_type: generation.generation_type,
                          username: generation.username
                        })
                      }}
                      loading="lazy"
                      alt={`Generated image from ${generation.created_at}`}
                      title={`${generation.generation_type} - ${new Date(generation.created_at).toLocaleDateString()}`}
                    />
                  ))}
                  {/* Button zur Galerie */}
                  <a
                    href="/gallery"
                    className="w-20 h-20 rounded-lg cursor-pointer transition-all duration-200 flex-shrink-0 border-2 border-dashed border-slate-500 hover:scale-105 hover:border-blue-500 shadow-sm hover:shadow-md bg-slate-700/50 backdrop-blur flex flex-col items-center justify-center hover:bg-slate-600/50"
                    title="Alle Bilder anzeigen"
                  >
                    <svg className="w-6 h-6 text-slate-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-xs text-slate-400 font-medium">Alle</span>
                  </a>
                </div>
              )}
              
              {todayStats && (
              <div className="grid grid-cols-3 gap-4 text-center border-t border-slate-700 pt-3">
                <div>
                  <div className="text-lg font-bold text-emerald-400">{userProfile?.total_generations || 156}</div>
                  <div className="text-xs text-slate-400">Bilder gesamt</div>
                  <div className="flex flex-col gap-1 mt-1">
                    <span className="text-xs bg-yellow-600/30 text-yellow-300 px-2 py-0.5 rounded">nano-banana</span>
                    <span className="text-xs bg-purple-600/30 text-purple-300 px-2 py-0.5 rounded">seedream</span>
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold text-blue-400">{todayStats.wan_video_count || 1}</div>
                  <div className="text-xs text-slate-400">Videos gesamt</div>
                  <div className="flex flex-col gap-1 mt-1">
                    <span className="text-xs bg-blue-600/30 text-blue-300 px-2 py-0.5 rounded">wan2.5</span>
                    <span className="text-xs bg-gray-600/30 text-gray-300 px-2 py-0.5 rounded">grok</span>
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold text-purple-400">{(userProfile?.total_generations || 156) + (todayStats.wan_video_count || 1)}</div>
                  <div className="text-xs text-slate-400">Media gesamt</div>
                </div>
              </div>
              )}
            </div>
          </div>

        </main>
        </div>
        
        {/* Image Modal */}
        <ImageModal
          selectedImage={selectedImage}
          onClose={() => setSelectedImage(null)}
          title="Generated Image"
          showUsername={false}
        />
      </>
  )
}