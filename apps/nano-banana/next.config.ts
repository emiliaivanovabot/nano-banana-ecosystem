import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: process.env.NODE_ENV === 'production' ? '/nano-banana' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/nano-banana' : '',
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'export',
  distDir: 'out',
}

export default nextConfig