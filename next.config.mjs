/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Enable standalone output for Docker deployment
  output: 'standalone',
  
  // Move to correct property for Next.js 15
  serverExternalPackages: ['@prisma/client'],
  
  // Force all routes to be dynamic to prevent build-time API calls
  experimental: {
    // Disable static generation
    staticPageGenerationTimeout: 0,
  },
}

export default nextConfig
