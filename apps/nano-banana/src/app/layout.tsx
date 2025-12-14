import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nano Banana',
  description: 'AI Image Generation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-black">{children}</body>
    </html>
  )
}