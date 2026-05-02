import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
  async rewrites() {
    let backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    if (backendUrl && !backendUrl.startsWith('http')) {
        backendUrl = `https://${backendUrl}`;
    }
    
    // Normalize string to guarantee it ends with /api
    backendUrl = backendUrl.replace(/\/$/, '');
    if (!backendUrl.endsWith('/api')) {
        backendUrl = `${backendUrl}/api`;
    }
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/:path*`
      }
    ];
  }
};

export default nextConfig;
