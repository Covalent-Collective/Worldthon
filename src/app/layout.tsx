import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
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

export const metadata: Metadata = {
  title: 'Seed Vault - Human Knowledge Repository',
  description: 'Dead Internet 시대, 검증된 인간 지식의 보존소',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Seed Vault',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100`}
      >
        <div className="min-h-screen flex justify-center">
          <div className="w-full max-w-[390px] bg-white min-h-screen shadow-xl">
            <MiniKitProvider>
              {children}
            </MiniKitProvider>
          </div>
        </div>
      </body>
    </html>
  )
}
