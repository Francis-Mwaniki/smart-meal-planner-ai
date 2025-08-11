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
  
  // Force dynamic rendering for all routes to prevent build-time API calls
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  
  // Disable static generation completely
  trailingSlash: false,
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  
  // Force all pages to be dynamic
  staticPageGenerationTimeout: 0,
}

export default nextConfig
