// Database package - shared Supabase client and configuration
import { createClient } from '@supabase/supabase-js'

// Import production configurations
import { 
  productionSupabaseConfig, 
  serverSupabaseConfig, 
  validateSupabaseConfig,
  createValidatedSupabaseClient 
} from '../supabase-config'

// Backward compatible configuration
const supabaseConfig = productionSupabaseConfig

// Create Supabase client with enhanced production configuration
export const createSupabaseClient = (
  url?: string,
  anonKey?: string
) => {
  // Validate environment first
  validateSupabaseConfig()
  
  const finalUrl = url || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const finalKey = anonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
  
  return createClient(finalUrl, finalKey, productionSupabaseConfig)
}

// Server-side client for server components and API routes
export const createServerSupabaseClient = (
  url?: string,
  serviceRoleKey?: string
) => {
  // Validate environment first
  validateSupabaseConfig()
  
  const finalUrl = url || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const finalKey = serviceRoleKey || process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key'
  
  return createClient(finalUrl, finalKey, serverSupabaseConfig)
}

// Database table types for shared schemas
export interface User {
  id: string
  email: string
  created_at: string
  subscription_tier?: 'free' | 'premium' | 'enterprise'
  credits_remaining?: number
}

export interface Subscription {
  id: string
  user_id: string
  tier: 'free' | 'premium' | 'enterprise'
  status: 'active' | 'cancelled' | 'expired'
  created_at: string
  expires_at?: string
}

export interface BillingEvent {
  id: string
  user_id: string
  type: 'credit_purchase' | 'subscription_change' | 'usage'
  amount: number
  description: string
  created_at: string
}

// Product-specific generation types
export interface GeminiGeneration {
  id: string
  user_id: string
  prompt: string
  image_url?: string
  status: 'pending' | 'generating' | 'completed' | 'failed'
  created_at: string
  completed_at?: string
}

export interface SeedreamGeneration {
  id: string
  user_id: string
  prompt: string
  style_preset?: string
  image_url?: string
  status: 'pending' | 'generating' | 'completed' | 'failed'
  created_at: string
  completed_at?: string
}

export interface WanVideoGeneration {
  id: string
  user_id: string
  prompt: string
  video_url?: string
  thumbnail_url?: string
  status: 'pending' | 'generating' | 'completed' | 'failed'
  created_at: string
  completed_at?: string
}

// Export additional utilities and configurations
export { 
  validateSupabaseConfig,
  checkDatabaseHealth,
  authConfig,
  type AuthProvider,
  type SubscriptionTier,
  type GenerationStatus
} from '../supabase-config'

// Simple production client for immediate use
export const createProductionClient = () => {
  return createSupabaseClient()
}