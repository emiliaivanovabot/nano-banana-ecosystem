'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@repo/auth-config'
import { V1User } from '@repo/database'
import '@nano-banana/ui-components'
import ImageModal from '../components/ImageModal'

export default function Dashboard() {
  const router = useRouter()
  const { user, loading, logout } = useAuth()
  const [selectedPeriod, setSelectedPeriod] = useState<'7' | '14' | 'month' | 'total'>('7')
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
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

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
          
          {/* HAUPT-BEREICH: Guthaben-Übersicht */}
          {userProfile && (
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8">
              
              {/* Linke Spalte: Haupt-Bereich (3/4) */}
              <div className="xl:col-span-3 space-y-6">
                
                {/* 1. Guthaben-Übersicht - Kompakt */}
                <div className="bg-nano-card p-4 shadow-2xl">
                  <div className="flex items-center justify-between">
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
                </div>

                {/* 1.5 Performance - KOMPAKT */}
                <div className="bg-nano-card p-4 shadow-2xl">
                  <h3 className="text-lg font-bold text-white mb-2">⚡ Performance</h3>
                  <div className="grid grid-cols-6 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-emerald-400">{userProfile.success_rate}%</div>
                      <div className="text-xs text-slate-400">Erfolg</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-400">{userProfile.avg_generation_time}s</div>
                      <div className="text-xs text-slate-400">Ø Zeit</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-400">{Math.round(userProfile.total_prompt_tokens/1000)}k</div>
                      <div className="text-xs text-slate-400">Tokens</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-red-400">{userProfile.total_errors}</div>
                      <div className="text-xs text-slate-400">Errors</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-400">{userProfile.total_credits_used}</div>
                      <div className="text-xs text-slate-400">Credits</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-pink-400">{userProfile.total_generations}</div>
                      <div className="text-xs text-slate-400">Media</div>
                    </div>
                  </div>
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
                              className="drop-shadow-sm cursor-pointer hover:scale-125 transition-all duration-200"
                              style={{
                                opacity: 0,
                                animation: `fadeInPoint 0.5s ease-out ${1.5 + i * 0.1}s forwards`
                              }}
                              key={`${selectedPeriod}-${i}`}
                              onMouseEnter={() => {
                                // Tooltip anzeigen
                                const tooltip = document.getElementById(`tooltip-${i}`);
                                if (tooltip) tooltip.style.opacity = '1';
                              }}
                              onMouseLeave={() => {
                                // Tooltip verstecken
                                const tooltip = document.getElementById(`tooltip-${i}`);
                                if (tooltip) tooltip.style.opacity = '0';
                              }}
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
                            {/* Tooltip Background */}
                            <rect
                              x={x - 8}
                              y={y - 20}
                              width="16"
                              height="14"
                              rx="2"
                              fill="rgba(0,0,0,0.8)"
                              style={{ opacity: 0, transition: 'opacity 0.2s' }}
                              pointerEvents="none"
                            />
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
                      <span className="absolute left-[9%]">3.</span>
                      <span className="absolute left-[27%]">9.</span>
                      <span className="absolute left-[45%]">15.</span>
                      <span className="absolute left-[64%]">21.</span>
                      <span className="absolute left-[82%]">27.</span>
                      <span className="absolute -bottom-4 right-0 text-white font-medium">Heute</span>
                    </div>
                  ) : (
                    <div className="relative text-xs text-slate-400 mt-1 h-5">
                      <span className="absolute left-[14%]">Q1</span>
                      <span className="absolute left-[43%]">Q2</span>
                      <span className="absolute left-[72%]">Q3</span>
                      <span className="absolute -bottom-4 right-0 text-white font-medium">Jetzt</span>
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

                {/* 3. Schnelle Aktionen - Kompakt */}
                <div className="bg-nano-card p-4 shadow-2xl">
                  <h3 className="text-lg font-bold text-white mb-3">Schnelle Aktionen</h3>
                  <div className="flex gap-2">
                    <a
                      href="/generation-modes"
                      className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium flex-1 justify-center"
                    >
                      <span>🍌</span>
                      <span>Bild generieren</span>
                    </a>
                    <a
                      href="http://localhost:3001"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium flex-1 justify-center"
                    >
                      <span>📹</span>
                      <span>Video erstellen</span>
                    </a>
                    <a
                      href="/inspiration"
                      className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium flex-1 justify-center"
                    >
                      <span>💡</span>
                      <span>Inspiration</span>
                    </a>
                  </div>
                </div>

              </div>

              {/* Rechte Spalte: Seiten-Bereich (1/4) */}
              <div className="space-y-6">
                
                {/* 4. Ausgaben-Verlauf */}
                <div className="bg-nano-card p-4 shadow-xl">
                  <h3 className="text-lg font-bold text-white mb-4">💰 Ausgaben-Verlauf</h3>
                  <div className="space-y-3">
                    {todayStats && (
                    <div className="flex justify-between py-2 border-b border-slate-700">
                      <span className="text-slate-300">Heute:</span>
                      <span className="text-yellow-400 font-bold">{todayStats.total_credits_used_today} Credits</span>
                    </div>
                    )}
                    <div className="flex justify-between py-2 border-b border-slate-700">
                      <span className="text-slate-300">Diese Woche:</span>
                      <span className="text-white font-bold">23 Credits</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-700">
                      <span className="text-slate-300">Diesen Monat:</span>
                      <span className="text-emerald-400 font-bold">{userProfile.total_credits_used} Credits</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-slate-300">Total USD:</span>
                      <span className="text-slate-400 font-bold">${userProfile?.total_cost_usd?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                </div>

                {/* 6. Most Used Prompts - NEW */}
                <div className="bg-nano-card p-4 shadow-xl">
                  <h3 className="text-lg font-bold text-white mb-4">🎯 Beliebte Prompts</h3>
                  <div className="space-y-2">
                    {(userProfile?.most_used_prompts || ['Portrait', 'Landscape', 'Abstract']).map((prompt, index) => (
                      <div key={index} className="flex justify-between py-1">
                        <span className="text-slate-300 text-sm">{index + 1}. {prompt}</span>
                        <span className="text-slate-500 text-xs">{Math.floor(Math.random() * 20 + 5)}x</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 7. API & Status - NEW */}
                <div className="bg-nano-card p-4 shadow-xl">
                  <h3 className="text-lg font-bold text-white mb-4">🔑 API Status</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-1">
                      <span className="text-slate-300 text-sm">Gemini API:</span>
                      <span className="text-green-400 font-bold">✅ Aktiv</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-300 text-sm">Nano-Banana:</span>
                      <span className="text-green-400 font-bold">✅ Aktiv</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-300 text-sm">Key Status:</span>
                      <span className="text-blue-400 font-bold">Valid</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-300 text-sm">Last Check:</span>
                      <span className="text-slate-400 font-bold">vor 5min</span>
                    </div>
                  </div>
                </div>

                {/* 8. Technical Stats */}
                <div className="bg-nano-card p-4 shadow-xl">
                  <h3 className="text-lg font-bold text-white mb-4">🔧 Tech Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-1">
                      <span className="text-slate-300 text-sm">Total Errors:</span>
                      <span className="text-red-400 font-bold">{userProfile.total_errors}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-300 text-sm">Avg Time:</span>
                      <span className="text-blue-400 font-bold">{Math.round(userProfile.total_generation_time_seconds / userProfile.total_generations)}s</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-300 text-sm">2K Gens:</span>
                      <span className="text-white font-bold">{userProfile.daily_count_2k_9_16}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-300 text-sm">4K Gens:</span>
                      <span className="text-purple-400 font-bold">{userProfile.daily_count_4k_9_16}</span>
                    </div>
                  </div>
                </div>

                {/* 5. Beliebteste Features */}
                <div className="bg-nano-card p-4 shadow-xl">
                  <h3 className="text-lg font-bold text-white mb-4">⭐ Beliebteste Features</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-300 text-sm">🍌 4K Bilder:</span>
                        <span className="text-white font-bold text-sm">67%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '67%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-300 text-sm">📹 Video-Gen:</span>
                        <span className="text-white font-bold text-sm">5%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '5%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-300 text-sm">🎨 Portraits:</span>
                        <span className="text-white font-bold text-sm">28%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '28%' }}></div>
                      </div>
                    </div>
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
          {recentGenerations && recentGenerations.length > 0 && (
            <div className="mt-8 bg-nano-card p-6">
              <div>
                <h3 className="text-title mb-4">
                  Usage Statistics
                </h3>
                <div className="grid-nano-2 gap-4">
                  <div>
                    <dt className="text-body-small text-muted">Total Generations</dt>
                    <dd className="mt-1 text-title-large">{recentGenerations.length}</dd>
                  </div>
                  <div>
                    <dt className="text-body-small text-muted">Last Generation</dt>
                    <dd className="mt-1 text-body">
                      {new Date(recentGenerations[0].created_at).toLocaleDateString()}
                    </dd>
                  </div>
                </div>
              </div>
            </div>
          )}
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