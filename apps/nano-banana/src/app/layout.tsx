import type { Metadata } from 'next'

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
      <body>{children}</body>
    </html>
  )
}