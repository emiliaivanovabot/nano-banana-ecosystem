import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Mock data for testing dashboard layout (similar to user-stats API)
    // This avoids authentication issues while we work on the dashboard
    
    // Simulate credit usage data based on user's example: 20 nano-banana, 34 wan.25, 4 seedream
    const nanoCredits = 20 // 1 credit per nano image = 20 generations
    const seedreamCredits = 4 // 2 credits per seedream = 2 generations  
    const wanCredits = 34 // 10 credits per video = 3.4 videos (round to 3)

    const totalUsedLast30Days = nanoCredits + seedreamCredits + wanCredits
    const remainingCredits = 100 // From user's dashboard
    
    // Calculate potential actions with remaining credits
    const potentialSeedreamImages = Math.floor(remainingCredits / 2)
    const potentialWanVideos = Math.floor(remainingCredits / 10)
    const potentialNanoImages = remainingCredits // 1 credit each

    // Module usage sorted by most used (based on user's example)
    const moduleUsage = [
      { name: 'WAN Video', credits: wanCredits, icon: '📹', generations: 3 },
      { name: 'Nano Banana', credits: nanoCredits, icon: '🍌', generations: 20 },
      { name: 'Seedream', credits: seedreamCredits, icon: '🎨', generations: 2 }
    ].sort((a, b) => b.credits - a.credits)

    // Recent activity (7 days) - simulate some activity
    const recentNano = 5
    const recentSeedream = 1
    const recentWan = 1
    const totalGenerationsLast7Days = recentNano + recentSeedream + recentWan

    // Calculate trends
    const creditsLast7Days = (recentNano * 1) + (recentSeedream * 2) + (recentWan * 10)
    const avgCreditsPerDay = Math.round(creditsLast7Days / 7)

    // Find most expensive module
    const avgCostPerModule = [
      { name: 'WAN Video', avgCost: 10, total: wanCredits },
      { name: 'Seedream', avgCost: 2, total: seedreamCredits },
      { name: 'Nano Banana', avgCost: 1, total: nanoCredits }
    ].sort((a, b) => b.avgCost - a.avgCost)

    return NextResponse.json({
      // Current status
      creditsRemaining: remainingCredits,
      totalCreditsUsed: totalUsedLast30Days,
      subscriptionTier: 'free',
      
      // Usage breakdown (30 days)
      moduleUsage,
      totalUsedLast30Days,
      
      // Potential actions
      potential: {
        seedreamImages: potentialSeedreamImages,
        wanVideos: potentialWanVideos,
        geminiImages: potentialNanoImages
      },
      
      // Recent activity (7 days)
      recentActivity: {
        totalGenerations: totalGenerationsLast7Days,
        byModule: {
          'Nano Banana': recentNano,
          'Seedream': recentSeedream,
          'WAN Video': recentWan
        }
      },
      
      // Trends
      trends: {
        avgCreditsPerDay,
        creditsLast7Days,
        mostExpensiveModule: avgCostPerModule[0]?.name || 'None'
      }
    })

  } catch (error) {
    console.error('Credit analytics API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}