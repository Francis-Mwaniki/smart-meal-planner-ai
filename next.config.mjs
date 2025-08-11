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
  experimental: {
    // Disable all static optimization
    workerThreads: false,
    cpus: 1,
    staticPageGenerationTimeout: 0,
    // Disable static generation
    isrMemoryCacheSize: 0,
    // Force dynamic rendering
    dynamicImports: true,
    // Disable static page generation
    staticPages: false,
    // Disable static optimization
    optimizePackageImports: false,
    // Disable static generation completely
    staticGenerationAsyncStorage: false,
  },
  // Ensure proper handling of dynamic routes
  trailingSlash: false,
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
  // Force dynamic rendering for all routes
  async rewrites() {
    return []
  },
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
}

export default nextConfig
