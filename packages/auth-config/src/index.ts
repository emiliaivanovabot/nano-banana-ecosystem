'use client'

// Auth configuration package - shared authentication logic
import React, { createContext, useContext, useEffect, useState } from 'react'
import { createSupabaseClient } from '@repo/database'
import type { User } from '@repo/database'

// Authentication configuration for cross-subdomain sharing
export const authConfig = {
  // Cookie domain for cross-subdomain auth sharing
  cookieDomain: (() => {
    if (process.env.NODE_ENV === 'development') {
      return '.nano-banana.local'
    }
    // Vercel staging URLs
    if (process.env.VERCEL_URL) {
      return '.vercel.app'
    }
    // Production domain
    return '.nano-banana.app'
  })(),
  
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
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'placeholder-anon-key'
}

// Auth context type - V1 schema compatibility
interface AuthContextType {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<{ user: User | null; error: string | null }>
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

  // Initialize V1 auth state
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        // Check for stored V1 user session
        const storedUser = localStorage.getItem('v1_user')
        
        if (mounted && storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser)
            // Verify user still exists and is active
            const { data: currentUser } = await supabase
              .from('users')
              .select('*')
              .eq('id', parsedUser.id)
              .eq('is_active', true)
              .single()
            
            if (currentUser) {
              setUser(currentUser)
            } else {
              localStorage.removeItem('v1_user')
            }
          } catch (e) {
            localStorage.removeItem('v1_user')
          }
        }
        
        if (mounted) {
          setLoading(false)
        }
      } catch (error) {
        console.error('V1 Auth initialization error:', error)
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

  const login = async (username: string, password: string) => {
    try {
      // V1 Authentication: Use server-side API route to avoid RLS issues
      const authResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      
      if (!authResponse.ok) {
        const errorData = await authResponse.json().catch(() => ({}))
        return { user: null, error: errorData.error || 'Login failed' }
      }
      
      const { user: authenticatedUser, error: authError } = await authResponse.json()
      
      if (authError || !authenticatedUser) {
        return { user: null, error: authError || 'Invalid username or password' }
      }

      // Store user in session
      localStorage.setItem('v1_user', JSON.stringify(authenticatedUser))
      setUser(authenticatedUser)
      
      return { user: authenticatedUser, error: null }
    } catch (error) {
      console.error('Login error:', error)
      return { user: null, error: 'Network error - please try again' }
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
    // V1 logout: Clear stored session
    localStorage.removeItem('v1_user')
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