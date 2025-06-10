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
  
  // Configure images
  images: {
    domains: ['api.dicebear.com', 'images.unsplash.com', 'i.pravatar.cc'],
    unoptimized: false,
  },
};

module.exports = nextConfig; 