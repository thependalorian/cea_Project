/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Python backend URL configuration
    PYTHON_BACKEND_URL: 'http://localhost:8000',
  },
  
  // Other Next.js configuration options
  reactStrictMode: true,
  swcMinify: true,
  
  // Enable standalone output for Docker containers
  output: 'standalone',
  
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  // Configure images with updated remotePatterns
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cea.georgenekwaya.com',
        port: '',
        pathname: '/**',
      },
    ],
    unoptimized: false,
    formats: ['image/webp', 'image/avif'],
  },
  
  // Security headers for production
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ],
      },
    ];
  },
  
  // Redirects for production
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
  
  // Compress responses
  compress: true,
  
  // Remove X-Powered-By header
  poweredByHeader: false,
};

module.exports = nextConfig; 