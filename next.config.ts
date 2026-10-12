import type { NextConfig } from 'next'

// Static security headers for every response, API included. The per-request CSP lives in proxy.ts.
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Keeps the full same-origin Referer (the mock API reads `__scenario` from it), origin-only cross-site.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Legacy fallback for browsers that ignore CSP frame-ancestors.
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
}

export default nextConfig
