'use client'

import { useAuth } from '@repo/auth-config'
import { Button } from '@repo/ui'
import Link from 'next/link'

export default function HomePage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Seedream
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Transform your imagination into stunning visuals with AI-powered image generation
        </p>
      </header>

      {user ? (
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Welcome back, {user.email}!</h2>
          <div className="flex justify-center gap-4">
            <Link href="/generate">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg">
                Create New Image
              </Button>
            </Link>
            <Link href="/gallery">
              <Button className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-8 py-3 text-lg">
                View Gallery
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-6">
            Sign in to start creating amazing images with AI
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/login">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-8 py-3 text-lg">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      )}

      <div className="mt-16 grid md:grid-cols-3 gap-8">
        <div className="text-center p-6 bg-white rounded-lg shadow-sm">
          <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <span className="text-purple-600 text-xl">✨</span>
          </div>
          <h3 className="font-semibold mb-2">AI-Powered</h3>
          <p className="text-gray-600">Advanced AI models create unique, high-quality images</p>
        </div>
        
        <div className="text-center p-6 bg-white rounded-lg shadow-sm">
          <div className="w-12 h-12 bg-pink-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <span className="text-pink-600 text-xl">🎨</span>
          </div>
          <h3 className="font-semibold mb-2">Multiple Styles</h3>
          <p className="text-gray-600">Choose from various artistic styles and presets</p>
        </div>
        
        <div className="text-center p-6 bg-white rounded-lg shadow-sm">
          <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <span className="text-blue-600 text-xl">⚡</span>
          </div>
          <h3 className="font-semibold mb-2">Fast Generation</h3>
          <p className="text-gray-600">Get your images in seconds with optimized processing</p>
        </div>
      </div>
    </div>
  )
}