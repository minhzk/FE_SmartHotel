/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cần thiết cho Docker deployment
  output: 'standalone',
  
  // Disable ESLint during builds for Railway
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable TypeScript errors during builds (optional)
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Hỗ trợ app directory (nếu dùng Next.js 13+)
  experimental: {
    appDir: true,
    outputFileTracingRoot: undefined,
  },

  // Cấu hình images cho Cloudinary và external domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.up.railway.app',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/**',
      },
    ],
    domains: ['res.cloudinary.com', 'localhost'],
  },

  // Environment variables (nếu cần)
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  },

  // Webpack config (nếu cần custom)
  webpack: (config, { isServer }) => {
    // Fixes for packages that don't work with webpack 5
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    return config;
  },

  // Redirects (nếu cần)
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/dashboard',
        permanent: true,
      },
    ];
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Compiler options for production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Performance optimizations
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;