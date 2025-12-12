'use client'

import { useState } from 'react'
import { useAuth, requireAuth } from '@repo/auth-config'
import { Button } from '@repo/ui'
import Image from 'next/image'

function GeneratePage() {
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('realistic')
  const [loading, setLoading] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [error, setError] = useState('')
  const { user } = useAuth()

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setLoading(true)
    setError('')
    setGeneratedImage(null)

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          style,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image')
      }

      setGeneratedImage(data.imageUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image')
    } finally {
      setLoading(false)
    }
  }

  const styleOptions = [
    { value: 'realistic', label: 'Realistic', description: 'Photorealistic images' },
    { value: 'artistic', label: 'Artistic', description: 'Painted, artistic style' },
    { value: 'cartoon', label: 'Cartoon', description: 'Fun, cartoon-like images' },
    { value: 'abstract', label: 'Abstract', description: 'Abstract art style' },
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Generate AI Images</h1>
        <p className="text-gray-600">
          Create stunning images from your imagination using AI
        </p>
        {user?.credits_remaining !== undefined && (
          <p className="text-sm text-purple-600 mt-2">
            Credits remaining: {user.credits_remaining}
          </p>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium mb-2">
                Describe your image
              </label>
              <textarea
                id="prompt"
                rows={4}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none"
                placeholder="A beautiful sunset over a mountain lake with golden reflections..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {prompt.length}/500 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Style</label>
              <div className="grid grid-cols-2 gap-3">
                {styleOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`cursor-pointer rounded-lg border p-3 text-center transition-all ${
                      style === option.value
                        ? 'border-purple-500 bg-purple-50 text-purple-900'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="style"
                      value={option.value}
                      checked={style === option.value}
                      onChange={(e) => setStyle(e.target.value)}
                      className="sr-only"
                    />
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {option.description}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating...</span>
                </div>
              ) : (
                'Generate Image'
              )}
            </Button>
          </form>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Result Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium mb-4">Generated Image</h2>
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              {generatedImage ? (
                <Image
                  src={generatedImage}
                  alt="Generated image"
                  width={400}
                  height={400}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-gray-400 text-center">
                  <div className="w-16 h-16 mx-auto mb-2 opacity-20">
                    🎨
                  </div>
                  <p>Your generated image will appear here</p>
                </div>
              )}
            </div>
          </div>

          {generatedImage && (
            <div className="flex space-x-3">
              <Button
                onClick={() => {
                  const link = document.createElement('a')
                  link.href = generatedImage
                  link.download = 'seedream-generated-image.png'
                  link.click()
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800"
              >
                Download
              </Button>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(generatedImage)
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800"
              >
                Copy URL
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default requireAuth(GeneratePage)