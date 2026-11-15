import type { NextConfig } from "next";
import path from "path";

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
  // Trace parent repository root when deployed from frontend/ on Vercel
  outputFileTracingRoot: path.resolve(__dirname, '..'),
  // Include Premier League snapshots in server bundles for research studio routes
  outputFileTracingIncludes: {
    '/': ['./data/snapshots/epl/**/*', '../data/snapshots/epl/**/*'],
    '/compare': ['./data/snapshots/epl/**/*', '../data/snapshots/epl/**/*'],
    '/club/[id]': ['./data/snapshots/epl/**/*', '../data/snapshots/epl/**/*'],
    '/**': ['./data/snapshots/epl/**/*', '../data/snapshots/epl/**/*'],
  },
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
