/** @type {import('next').NextConfig} */

const securityHeaders = [
  // Prevent clickjacking
  { key: 'X-Frame-Options',           value: 'DENY' },
  // Prevent MIME-type sniffing
  { key: 'X-Content-Type-Options',    value: 'nosniff' },
  // Legacy XSS filter (belt-and-suspenders)
  { key: 'X-XSS-Protection',          value: '1; mode=block' },
  // Referrer policy
  { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
  // Disable unnecessary browser features
  { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=(self), payment=()' },
  // Prevent Flash/PDF cross-domain access
  { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
  // Force HTTPS for 1 year (only set in production; harmless in dev)
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Next.js still needs unsafe-inline for its runtime inline scripts.
      // unsafe-eval is required for dev HMR; in production this can be removed
      // once nonce-based CSP is implemented.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com",
      // Supabase realtime (wss), Gemini API, Nominatim — no Maps/Places API needed
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://generativelanguage.googleapis.com https://nominatim.openstreetmap.org",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
]

// CORS headers — only allow requests from our own origin to the API
// Browsers enforce this; server-to-server calls are unaffected.
const apiCorsHeaders = [
  { key: 'Access-Control-Allow-Origin',  value: 'https://sidequest.app' },
  { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
  { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
  { key: 'Access-Control-Max-Age',       value: '86400' },
]

const nextConfig = {
  transpilePackages: ['@sidequest/core'],

  async headers() {
    return [
      // Security headers on all routes
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      // CORS headers on API routes
      {
        source: '/api/(.*)',
        headers: apiCorsHeaders,
      },
    ]
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
}

module.exports = nextConfig
