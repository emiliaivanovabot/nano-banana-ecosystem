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

// V1 Database Schema Types (Legacy Schema from nano-banana-friends)
// Based on analysis of live V1 database structure

// V1 Users table (23 columns) - Face-based Image Generation System
export interface V1User {
  id: string
  username: string
  password_hash: string
  gemini_api_key?: string
  email: string
  hair_color?: string
  eye_color?: string
  skin_tone?: string
  age_range?: string
  default_resolution?: string
  default_aspect_ratio?: string
  favorite_prompts?: string[]
  main_face_image_url?: string
  face_2_image_url?: string
  face_2_name?: string
  face_3_image_url?: string
  face_3_name?: string
  is_active: boolean
  created_at: string
  updated_at: string
  last_login?: string
  personal_appearance_text?: string
  use_personalization: boolean
  use_personal_appearance_text: boolean
  // Phase 1 subscription extensions (to be added)
  subscription_level?: 'free' | 'premium' | 'enterprise'
  subscription_expires_at?: string
  credits_remaining?: number
}

// V1 Generations table (21 columns) - Unified Generation History
export interface V1Generation {
  id: string
  user_id: string
  prompt: string
  status: 'pending' | 'generating' | 'completed' | 'failed'
  result_image_url?: string
  created_at: string
  completed_at?: string
  username?: string
  generation_type?: string
  original_filename?: string
  file_size?: number
  resolution?: string
  aspect_ratio?: string
  generation_time_seconds?: number
  gemini_metadata?: Record<string, any>
  retry_count: number
  main_face_image_url?: string
  additional_images?: string[]
  result_base64?: string
  error_message?: string
  started_at?: string
}

// Backward compatibility aliases for V2 migration
export type User = V1User
export type Generation = V1Generation

// Legacy V2 interfaces for gradual migration (will be deprecated)
export interface UserProfile extends V1User {}
export interface GeminiGeneration extends V1Generation {
  model_version?: string
  credits_used?: number
}
export interface SeedreamGeneration extends V1Generation {
  style_preset?: string
  model_version?: string
  credits_used?: number
}
export interface WanVideoGeneration extends V1Generation {
  video_url?: string
  thumbnail_url?: string
  model_version?: string
  credits_used?: number
}

// Deprecated V2 interfaces (kept for compilation)
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

// Export additional utilities and configurations
// V1 Schema specific types
export type HairColor = 'blonde' | 'brown' | 'black' | 'red' | 'gray' | 'other'
export type EyeColor = 'blue' | 'brown' | 'green' | 'hazel' | 'gray' | 'other'
export type SkinTone = 'light' | 'medium' | 'dark' | 'latin' | 'asian' | 'other'
export type AgeRange = 'teen' | 'young-adult' | 'adult' | 'middle-aged' | 'senior'
export type GenerationType = 'single' | 'multi' | 'batch'

// Re-export from supabase-config
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