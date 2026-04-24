import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.coin-as.com' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'coin-website-8d592.firebasestorage.app' },
    ],
  },
  allowedDevOrigins: ['100.67.235.50'],
}

export default nextConfig
