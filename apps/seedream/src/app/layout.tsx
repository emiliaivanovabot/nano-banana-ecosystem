import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@repo/auth-config'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Seedream - AI Image Generation',
  description: 'Create stunning images with AI-powered generation tools',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}