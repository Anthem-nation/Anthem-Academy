import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Enable React strict mode for highlighting potential issues
  reactStrictMode: true,
  // Experimental features
  experimental: {
    // Required for server actions in Next.js 15
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
}

export default nextConfig
