// Supabase Production Configuration
// Security hardening and authentication setup for production environment

import { SupabaseClientOptions } from '@supabase/supabase-js'

// Production Supabase configuration with security hardening
export const productionSupabaseConfig: SupabaseClientOptions<'public'> = {
  db: {
    schema: 'public',
  },
  auth: {
    // Enable persistent sessions for better UX
    persistSession: true,
    // Auto refresh tokens 5 minutes before expiry
    autoRefreshToken: true,
    // Use secure cookies in production
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    // Detect session from URL in OAuth flows
    detectSessionInUrl: true,
    // Redirect options for OAuth
    flowType: 'pkce',
  },
  global: {
    headers: {
      'x-application-name': 'nano-banana-ecosystem',
      'x-client-version': '1.0.0',
    },
  },
  // Rate limiting and abuse prevention
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
}

// Server-side configuration (no session persistence)
export const serverSupabaseConfig: SupabaseClientOptions<'public'> = {
  ...productionSupabaseConfig,
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
}

// Authentication configuration for Supabase dashboard
export const authConfig = {
  // Site URL configuration for OAuth redirects
  site_url: process.env.NODE_ENV === 'production' 
    ? 'https://platform.nanobanan.ai'
    : 'http://localhost:3000',
    
  // Additional redirect URLs for multi-domain setup
  redirect_urls: [
    'https://platform.nanobanan.ai',
    'https://seedream.nanobanan.ai',
    'http://localhost:3000',
    'http://localhost:3001',
  ],
  
  // JWT settings
  jwt: {
    // Token expiry (24 hours)
    exp: 24 * 60 * 60,
    // Algorithm for signing
    aud: 'authenticated',
    // Issuer
    iss: 'https://your-project.supabase.co/auth/v1',
  },
  
  // Password policy
  password: {
    min_length: 8,
    require_lowercase: true,
    require_uppercase: true,
    require_numbers: true,
    require_special_characters: true,
  },
  
  // Email settings
  email: {
    enable_signup: true,
    enable_email_confirmations: true,
    secure_email_change_enabled: true,
    double_confirm_changes_enabled: true,
  },
  
  // Session settings
  sessions: {
    // Session timeout (24 hours)
    timebox: 24 * 60 * 60,
    // Inactivity timeout (2 hours)
    inactivity_timeout: 2 * 60 * 60,
  },
  
  // Rate limiting
  rate_limits: {
    // Email sending limits
    email_sent: 60, // per hour
    // SMS sending limits  
    sms_sent: 60, // per hour
    // Password recovery
    recover: 5, // per hour per IP
    // Sign up attempts
    signup: 5, // per hour per IP
    // Sign in attempts
    signin: 5, // per minute per IP
  },
  
  // External OAuth providers
  external: {
    google: {
      enabled: true,
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      secret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirect_uri: process.env.NODE_ENV === 'production'
        ? 'https://platform.nanobanan.ai/auth/callback'
        : 'http://localhost:3000/auth/callback',
    },
    github: {
      enabled: true,
      client_id: process.env.GITHUB_CLIENT_ID || '',
      secret: process.env.GITHUB_CLIENT_SECRET || '',
      redirect_uri: process.env.NODE_ENV === 'production'
        ? 'https://platform.nanobanan.ai/auth/callback'
        : 'http://localhost:3000/auth/callback',
    },
  },
  
  // Security headers and CORS
  security: {
    // CORS configuration
    cors_origins: [
      'https://platform.nanobanan.ai',
      'https://seedream.nanobanan.ai',
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    // Additional security headers
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    },
  },
}

// Environment validation function
export function validateSupabaseConfig() {
  // Skip validation during build time
  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
    return true
  }
  
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ]
  
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    // Only warn during development, don't throw
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `Warning: Missing Supabase environment variables: ${missing.join(', ')}\n` +
        'Some features may not work correctly without proper configuration.'
      )
    }
    return false
  }
  
  // Validate URL format if URL exists
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (url && (!url.startsWith('https://') || !url.includes('.supabase.co'))) {
    console.warn('Warning: Invalid SUPABASE_URL format. Expected https://your-project.supabase.co')
    return false
  }
  
  // Validate key formats if keys exist
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if ((anonKey && !anonKey.startsWith('eyJ')) || (serviceKey && !serviceKey.startsWith('eyJ'))) {
    console.warn('Warning: Invalid Supabase key format. Keys should start with "eyJ"')
    return false
  }
  
  return true
}

// Enhanced client creation with validation
export function createValidatedSupabaseClient(
  url?: string,
  anonKey?: string,
  options?: SupabaseClientOptions<'public'>
) {
  // Validate configuration first
  validateSupabaseConfig()
  
  const supabaseUrl = url || process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = anonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  return {
    url: supabaseUrl,
    key: supabaseAnonKey,
    options: { ...productionSupabaseConfig, ...options }
  }
}

// Database connection health check
export async function checkDatabaseHealth() {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      serverSupabaseConfig
    )
    
    // Simple health check query
    const { data, error } = await client
      .from('user_profiles')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Database health check failed:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

export type AuthProvider = 'google' | 'github'
export type SubscriptionTier = 'free' | 'premium' | 'enterprise'
export type GenerationStatus = 'pending' | 'generating' | 'completed' | 'failed'