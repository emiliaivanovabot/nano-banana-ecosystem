'use client'

// Auth configuration package - shared authentication logic
import React, { createContext, useContext, useEffect, useState } from 'react'
import { createSupabaseClient } from '@repo/database'
import type { User } from '@repo/database'

// Authentication configuration for cross-subdomain sharing
export const authConfig = {
  // Cookie domain for cross-subdomain auth sharing
  cookieDomain: process.env.NODE_ENV === 'development' 
    ? '.nano-banana.local' 
    : '.nano-banana.app',
  
  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || 'development-secret',
  
  // Cookie settings for secure cross-subdomain sharing
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  },

  // Supabase client configuration
  supabaseUrl: process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || 'placeholder-anon-key'
}

// Auth context type
interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>
  register: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseClient(authConfig.supabaseUrl, authConfig.supabaseAnonKey)

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (mounted) {
          if (session?.user) {
            // Fetch user profile data
            const { data: userProfile } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single()
            
            setUser(userProfile)
          }
          setLoading(false)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        if (event === 'SIGNED_OUT' || !session) {
          setUser(null)
        } else if (session?.user) {
          // Fetch user profile data
          const { data: userProfile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          setUser(userProfile)
        }
        
        setLoading(false)
      }
    )

    initializeAuth()

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { user: null, error: error.message }
      }

      return { user: data.user as any, error: null }
    } catch (error) {
      return { user: null, error: 'Login failed' }
    }
  }

  const register = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })

      if (error) {
        return { user: null, error: error.message }
      }

      return { user: data.user as any, error: null }
    } catch (error) {
      return { user: null, error: 'Registration failed' }
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const refreshUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.user) {
      const { data: userProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()
      
      setUser(userProfile)
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser
  }

  return React.createElement(AuthContext.Provider, { value }, children)
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Higher-order component for protected routes
export const requireAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  const AuthenticatedComponent: React.FC<P> = (props) => {
    const { user, loading } = useAuth()

    if (loading) {
      return React.createElement('div', { className: 'flex items-center justify-center min-h-screen' },
        React.createElement('div', { className: 'text-lg' }, 'Loading...')
      )
    }

    if (!user) {
      // Redirect to login page or show login component
      window.location.href = '/login'
      return null
    }

    return React.createElement(WrappedComponent, props)
  }

  return AuthenticatedComponent
}

// Utility functions for cookie management
export const setCrossDomainCookie = (name: string, value: string) => {
  document.cookie = `${name}=${value}; Domain=${authConfig.cookieDomain}; Secure; HttpOnly; SameSite=Lax; Max-Age=${authConfig.cookieOptions.maxAge}`
}

export const getCrossDomainCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift()
    return cookieValue || null
  }
  return null
}

export const removeCrossDomainCookie = (name: string) => {
  document.cookie = `${name}=; Domain=${authConfig.cookieDomain}; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
}