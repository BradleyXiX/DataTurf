/**
 * Helper to construct backend API URLs.
 * If NEXT_PUBLIC_API_URL is configured (e.g. on Vercel), it prepends the URL.
 * Otherwise, it falls back to relative `/api/*` which is proxied by Next.js rewrites
 * to the backend service defined in BACKEND_URL.
 */
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');

export function apiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (!API_BASE_URL) {
    return cleanPath;
  }
  if (API_BASE_URL.endsWith('/api') && cleanPath.startsWith('/api')) {
    return `${API_BASE_URL}${cleanPath.substring(4)}`;
  }
  return `${API_BASE_URL}${cleanPath}`;
}

