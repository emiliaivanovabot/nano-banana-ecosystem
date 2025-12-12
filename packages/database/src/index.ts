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
  
  const finalUrl = url || process.env.SUPABASE_URL!
  const finalKey = anonKey || process.env.SUPABASE_ANON_KEY!
  
  return createClient(finalUrl, finalKey, productionSupabaseConfig)
}

// Server-side client for server components and API routes
export const createServerSupabaseClient = (
  url?: string,
  serviceRoleKey?: string
) => {
  // Validate environment first
  validateSupabaseConfig()
  
  const finalUrl = url || process.env.SUPABASE_URL!
  const finalKey = serviceRoleKey || process.env.SUPABASE_SERVICE_ROLE_KEY!
  
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

export {
  SupabaseMigrationRunner,
  runMigrations,
  validateEnvironment,
  getCrossDomainConfig,
  healthCheck
} from '../migrations'

// Enhanced database client with health checking
export const createHealthCheckedClient = async (
  url?: string,
  anonKey?: string
) => {
  const client = createSupabaseClient(url, anonKey)
  
  // Perform health check
  const isHealthy = await checkDatabaseHealth()
  if (!isHealthy) {
    throw new Error('Database health check failed - connection issues detected')
  }
  
  return client
}

// Production-ready client factory with all validations
export const createProductionClient = async () => {
  // Validate environment
  if (!validateEnvironment()) {
    throw new Error('Environment validation failed')
  }
  
  // Create client with health check
  return createHealthCheckedClient()
}