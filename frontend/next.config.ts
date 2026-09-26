import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Enable WebSocket proxy for development
  async rewrites() {
    return [
      {
        source: '/ws/:path*',
        destination: 'http://localhost:8000/ws/:path*',
      },
    ]
  },
}

export default nextConfig
