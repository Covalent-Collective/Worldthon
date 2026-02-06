import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { Orbitron } from 'next/font/google'
import './globals.css'
import { MiniKitProvider } from '@/components/MiniKitProvider'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})
const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  weight: ['400', '700'],
})

export const metadata: Metadata = {
  title: 'Seed Vault - Human Knowledge Repository',
  description: 'Dead Internet 시대, 검증된 인간 지식의 보존소',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Seed Vault',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0A0A0F',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className="dark">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#0A0A0F" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} antialiased bg-permafrost`}
      >
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-permafrost-gradient" />
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-aurora-violet/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-aurora-cyan/5 rounded-full blur-[100px]" />
        </div>

        {/* App Container */}
        <div className="relative min-h-screen flex justify-center">
          <div className="w-full max-w-[390px] min-h-screen relative">
            <MiniKitProvider>
              {children}
            </MiniKitProvider>
          </div>
        </div>
      </body>
    </html>
  )
}
