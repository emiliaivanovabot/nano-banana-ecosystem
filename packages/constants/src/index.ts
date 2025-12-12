// Constants package - shared configuration and URLs
// Prevents magic strings and centralizes app configuration

// Environment detection
const isDevelopment = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'

// Base domains
const DOMAIN_LOCAL = 'nano-banana.local'
const DOMAIN_PRODUCTION = 'nano-banana.app'
const BASE_DOMAIN = isDevelopment ? DOMAIN_LOCAL : DOMAIN_PRODUCTION

// Development ports
const DEV_PORTS = {
  platform: 3000,
  gemini: 3001,
  seedream: 3002,
  'wan-video': 3003,
  'qwen-edit': 3004,
  'kling-avatar': 3005,
  'grok-playground': 3006
} as const

// App URLs - NO MAGIC STRINGS!
export const APP_URLS = {
  platform: isDevelopment 
    ? `http://platform.${DOMAIN_LOCAL}:${DEV_PORTS.platform}` 
    : `https://platform.${DOMAIN_PRODUCTION}`,
  
  gemini: isDevelopment
    ? `http://gemini.${DOMAIN_LOCAL}:${DEV_PORTS.gemini}` 
    : `https://gemini.${DOMAIN_PRODUCTION}`,
  
  seedream: isDevelopment
    ? `http://seedream.${DOMAIN_LOCAL}:${DEV_PORTS.seedream}` 
    : `https://seedream.${DOMAIN_PRODUCTION}`,
  
  'wan-video': isDevelopment
    ? `http://wan-video.${DOMAIN_LOCAL}:${DEV_PORTS['wan-video']}` 
    : `https://wan-video.${DOMAIN_PRODUCTION}`,
  
  'qwen-edit': isDevelopment
    ? `http://qwen-edit.${DOMAIN_LOCAL}:${DEV_PORTS['qwen-edit']}` 
    : `https://qwen-edit.${DOMAIN_PRODUCTION}`,
  
  'kling-avatar': isDevelopment
    ? `http://kling-avatar.${DOMAIN_LOCAL}:${DEV_PORTS['kling-avatar']}` 
    : `https://kling-avatar.${DOMAIN_PRODUCTION}`,
  
  'grok-playground': isDevelopment
    ? `http://grok-playground.${DOMAIN_LOCAL}:${DEV_PORTS['grok-playground']}` 
    : `https://grok-playground.${DOMAIN_PRODUCTION}`
} as const

// API endpoints
export const API_ENDPOINTS = {
  auth: `${APP_URLS.platform}/api/auth`,
  billing: `${APP_URLS.platform}/api/billing`,
  credits: `${APP_URLS.platform}/api/credits`,
  user: `${APP_URLS.platform}/api/user`,
  
  // Product-specific API endpoints
  gemini: `${APP_URLS.gemini}/api`,
  seedream: `${APP_URLS.seedream}/api`,
  'wan-video': `${APP_URLS['wan-video']}/api`,
  'qwen-edit': `${APP_URLS['qwen-edit']}/api`,
  'kling-avatar': `${APP_URLS['kling-avatar']}/api`,
  'grok-playground': `${APP_URLS['grok-playground']}/api`
} as const

// App metadata
export const APP_METADATA = {
  platform: {
    name: 'Nano Banana Platform',
    description: 'Authentication, Dashboard, and Billing Hub',
    emoji: '🏢'
  },
  gemini: {
    name: 'Nano Banana (Gemini)',
    description: 'AI Image Generation with Gemini',
    emoji: '🍌'
  },
  seedream: {
    name: 'Seedream',
    description: 'Advanced AI Art Generation',
    emoji: '🎨'
  },
  'wan-video': {
    name: 'WAN Video',
    description: 'AI Video Generation',
    emoji: '🎬'
  },
  'qwen-edit': {
    name: 'Qwen Edit',
    description: 'AI Image Editing',
    emoji: '✏️'
  },
  'kling-avatar': {
    name: 'Kling Avatar',
    description: 'AI Avatar Generation',
    emoji: '🎭'
  },
  'grok-playground': {
    name: 'Grok Playground',
    description: 'AI Chat and Interaction',
    emoji: '🤖'
  }
} as const

// Credit costs for different operations
export const CREDIT_COSTS = {
  gemini: {
    basic: 1,
    hd: 2,
    premium: 3
  },
  seedream: {
    standard: 2,
    hd: 4,
    premium: 6
  },
  'wan-video': {
    short: 5,
    medium: 10,
    long: 20
  },
  'qwen-edit': {
    basic: 1,
    advanced: 3
  },
  'kling-avatar': {
    basic: 3,
    premium: 6
  },
  'grok-playground': {
    query: 0.1, // Very cheap for chat
    premium: 1
  }
} as const

// Subscription tiers
export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free',
    monthlyCredits: 10,
    price: 0,
    features: ['Basic access', 'Standard quality']
  },
  premium: {
    name: 'Premium',
    monthlyCredits: 100,
    price: 9.99,
    features: ['HD quality', 'Priority processing', 'Advanced features']
  },
  enterprise: {
    name: 'Enterprise',
    monthlyCredits: 1000,
    price: 49.99,
    features: ['Unlimited HD', 'API access', 'Priority support', 'Custom models']
  }
} as const

// Database table names (prefixed for isolation)
export const DB_TABLES = {
  // Shared tables
  users: 'users',
  subscriptions: 'subscriptions',
  billing_events: 'billing_events',
  
  // Product-specific tables
  gemini_generations: 'gemini_generations',
  seedream_generations: 'seedream_generations',
  wan_video_generations: 'wan_video_generations',
  qwen_edit_sessions: 'qwen_edit_sessions',
  kling_avatar_generations: 'kling_avatar_generations',
  grok_conversations: 'grok_conversations'
} as const

// Environment variables
export const ENV_KEYS = {
  SUPABASE_URL: 'SUPABASE_URL',
  SUPABASE_ANON_KEY: 'SUPABASE_ANON_KEY',
  SUPABASE_SERVICE_ROLE_KEY: 'SUPABASE_SERVICE_ROLE_KEY',
  JWT_SECRET: 'JWT_SECRET',
  NEXT_PUBLIC_APP_ENV: 'NEXT_PUBLIC_APP_ENV'
} as const

// Navigation helpers
export const createAppUrl = (
  appName: keyof typeof APP_URLS, 
  path: string = '', 
  query: Record<string, string> = {}
) => {
  const baseUrl = APP_URLS[appName]
  const queryString = Object.keys(query).length > 0 
    ? '?' + new URLSearchParams(query).toString()
    : ''
  
  return `${baseUrl}${path}${queryString}`
}

// User context passing helpers
export const createUserContextUrl = (
  appName: keyof typeof APP_URLS,
  userId: string,
  returnUrl?: string
) => {
  const query: Record<string, string> = { user: userId }
  if (returnUrl) {
    query.redirect = encodeURIComponent(returnUrl)
  }
  
  return createAppUrl(appName, '', query)
}

// Type exports for TypeScript auto-completion
export type AppName = keyof typeof APP_URLS
export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS
export type CreditOperation = keyof typeof CREDIT_COSTS

// Utility constants
export const CONSTANTS = {
  BASE_DOMAIN,
  DEV_PORTS,
  isDevelopment,
  isProduction
} as const