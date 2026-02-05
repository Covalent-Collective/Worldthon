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
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white`}
      >
        <MiniKitProvider>
          {children}
        </MiniKitProvider>
      </body>
    </html>
  )
}
