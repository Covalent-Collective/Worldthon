import withPWA from 'next-pwa'

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Apply to all routes - required for World App WebView compatibility
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With',
          },
          {
            // Allow the page to be embedded in World App WebView
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
          {
            // CSP: allow MiniKit bridge, World App origins, and ngrok tunnels
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.worldcoin.org",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.worldcoin.org https://*.world.org https://*.supabase.co https://*.ngrok-free.app https://*.ngrok.io wss://*.supabase.co https://worldchain-sepolia.g.alchemy.com",
              "frame-ancestors 'self' https://*.worldcoin.org https://*.world.org",
              "frame-src 'self' https://*.worldcoin.org",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default pwaConfig(nextConfig)
