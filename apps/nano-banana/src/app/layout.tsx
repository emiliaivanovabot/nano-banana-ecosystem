'use client'

import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@repo/auth-config'

// Note: Metadata export moved to separate metadata file for client component compatibility

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-black">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}