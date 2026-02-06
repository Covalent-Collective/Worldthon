'use client'

import Link from 'next/link'

interface BottomNavProps {
  active: 'home' | 'dashboard' | 'explore' | 'rewards'
}

export function BottomNav({ active }: BottomNavProps) {
  const tabs = [
    {
      key: 'home' as const,
      href: '/',
      label: 'Journal',
      icon: (isActive: boolean) => (
        <svg className="relative w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={isActive ? 2 : 1.5}
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m-4-4h8m-4-12a3 3 0 00-3 3v4a3 3 0 006 0V7a3 3 0 00-3-3z"
          />
        </svg>
      ),
    },
    {
      key: 'dashboard' as const,
      href: '/dashboard',
      label: 'Dashboard',
      icon: (isActive: boolean) => (
        <svg className="relative w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={isActive ? 2 : 1.5}
            d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
          />
        </svg>
      ),
    },
    {
      key: 'explore' as const,
      href: '/explore',
      label: 'Explore',
      icon: (isActive: boolean) => (
        <svg className="relative w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={isActive ? 2 : 1.5}
            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      key: 'rewards' as const,
      href: '/rewards',
      label: 'Reward',
      icon: (isActive: boolean) => (
        <svg className="relative w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={isActive ? 2 : 1.5}
            d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
          />
        </svg>
      ),
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-pb flex justify-center">
      <div className="mx-3 mb-2 rounded-2xl glass-nav w-full max-w-[390px]">
        <div className="flex justify-around py-2">
          {tabs.map((tab) => {
            const isActive = active === tab.key
            return (
              <Link
                key={tab.key}
                href={tab.href}
                className={`flex flex-col items-center gap-0.5 transition-all duration-300 ${
                  isActive
                    ? 'text-aurora-cyan'
                    : 'text-arctic/40 hover:text-arctic/70'
                }`}
              >
                <div className={`relative p-2 rounded-xl transition-all duration-300 ${
                  isActive ? 'bg-aurora-cyan/[0.12] shadow-[0_0_16px_rgba(0,242,255,0.15)]' : ''
                }`}>
                  {isActive && (
                    <div className="absolute inset-0 rounded-xl bg-aurora-cyan/20 blur-lg" />
                  )}
                  {tab.icon(isActive)}
                </div>
                <span className="text-[10px] font-medium tracking-wide">{tab.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
