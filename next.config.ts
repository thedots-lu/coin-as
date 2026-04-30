import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.coin-as.com' },
      // Cloudflare R2 — public dev subdomain (pub-*.r2.dev). Add a custom
      // domain entry here if/when you migrate away from r2.dev.
      { protocol: 'https', hostname: '*.r2.dev' },
      // Legacy Firebase Storage URLs (kept until existing data is migrated)
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'coin-website-8d592.firebasestorage.app' },
    ],
  },
  allowedDevOrigins: ['100.67.235.50'],
  async redirects() {
    return [
      { source: '/knowledge-hub', destination: '/resources', permanent: true },
      { source: '/knowledge-hub/:path*', destination: '/resources/:path*', permanent: true },
    ]
  },
}

export default nextConfig
