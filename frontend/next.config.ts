import type { NextConfig } from "next";

const rawBackendUrl =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000');

// Normalize backend URL by removing trailing slash or /api suffix
const backendUrl = rawBackendUrl
  ? rawBackendUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '')
  : '';

const nextConfig: NextConfig = {
  // Only enable standalone output when explicitly requested (e.g. for container builds)
  ...(process.env.DOCKER_BUILD === 'true' ? { output: 'standalone' } : {}),
  async rewrites() {
    if (!backendUrl) {
      return [];
    }
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
