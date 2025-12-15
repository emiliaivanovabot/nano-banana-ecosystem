'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@repo/auth-config'
import '@nano-banana/ui-components'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { user, error: loginError } = await login(username, password)
    
    if (loginError) {
      setError(loginError)
    } else if (user) {
      router.push('/dashboard')
    }
    
    setLoading(false)
  }

  return (
    <div className="page-layout flex-center">
      <div className="bg-nano-card p-8 container-nano-narrow">
        <div className="text-center mb-8">
          <h2 className="title-large">
            Platform Login
          </h2>
          <p className="subtitle">
            Access your Nano Banana Platform account
          </p>
        </div>
        
        <form className="flex-col gap-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-error text-white p-4 rounded">
              {error}
            </div>
          )}
          
          <div className="flex-col gap-4">
            <div>
              <label htmlFor="username" className="text-body-small text-muted mb-2">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded bg-background text-body"
                placeholder="Enter your username (e.g., emilia.berlin)"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="text-body-small text-muted mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded bg-background text-body"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn-base btn-yellow btn-full btn-large"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
        
        <div className="text-center text-caption text-muted mt-6">
          <p>Test credentials: emilia.berlin - password: 2002</p>
          <p>Or any user from the V1 system</p>
        </div>
      </div>
    </div>
  )
}