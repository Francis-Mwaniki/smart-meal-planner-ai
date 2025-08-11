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
  // Completely disable static generation
  output: 'standalone',
  // Force dynamic rendering for all pages
  generateStaticParams: false,
  // Disable static exports
  distDir: '.next',
  // Force server-side rendering
  ssr: true,
  // Disable static generation
  generateBuildId: () => 'build',
  // Force dynamic rendering
  dynamicParams: true,
  // Disable static optimization
  swcMinify: false,
  // Disable static generation completely
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ]
  },
  // Disable static generation
  async redirects() {
    return []
  },
  // Disable static generation completely
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
}

export default nextConfig
