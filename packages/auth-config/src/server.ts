import 'server-only'

import { createServerSupabaseClient } from '@repo/database'
import type { User } from '@repo/database'

/**
 * Get user session on server-side
 * This reads the session directly from cookies/headers
 * Used in layout.tsx to avoid client-side fetching
 */
export async function getServerSession(): Promise<User | null> {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get session from cookies/headers
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session?.user) {
      console.log('🔒 No server session found')
      return null
    }
    
    // Get full user profile from users table
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()
    
    if (userError || !userProfile) {
      console.error('❌ Could not load user profile:', userError)
      return null
    }
    
    console.log('✅ Server session loaded:', userProfile.username)
    return userProfile
  } catch (error) {
    console.error('❌ Server session error:', error)
    return null
  }
}

/**
 * Validate if user is authenticated on server-side
 * Returns userId if authenticated, null otherwise
 */
export async function validateServerAuth(): Promise<string | null> {
  const user = await getServerSession()
  return user?.id || null
}