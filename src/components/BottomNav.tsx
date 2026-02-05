'use client'

import Link from 'next/link'

interface BottomNavProps {
  active: 'home' | 'explore' | 'rewards'
}

export function BottomNav({ active }: BottomNavProps) {
  return (
    <nav className="sticky bottom-0 safe-area-pb bg-night/70 backdrop-blur-xl border-t border-white/5">
      <div className="flex justify-around py-2">
        {/* Explorer - Left */}
        <Link
          href="/explore"
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${
            active === 'explore'
              ? 'text-aurora-cyan'
              : 'text-arctic/40 hover:text-arctic/70'
          }`}
        >
          <div className={`relative p-2.5 rounded-2xl transition-all duration-300 ${
            active === 'explore' ? 'bg-aurora-cyan/10' : ''
          }`}>
            {active === 'explore' && (
              <div className="absolute inset-0 rounded-2xl bg-aurora-cyan/20 blur-lg animate-pulse" />
            )}
            <svg className="relative w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={active === 'explore' ? 2 : 1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <span className="text-[10px] font-medium tracking-wide">Explorer</span>
        </Link>

        {/* Home - Center */}
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${
            active === 'home'
              ? 'text-aurora-cyan'
              : 'text-arctic/40 hover:text-arctic/70'
          }`}
        >
          <div className={`relative p-2.5 rounded-2xl transition-all duration-300 ${
            active === 'home' ? 'bg-aurora-cyan/10' : ''
          }`}>
            {active === 'home' && (
              <div className="absolute inset-0 rounded-2xl bg-aurora-cyan/20 blur-lg animate-pulse" />
            )}
            <svg className="relative w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={active === 'home' ? 2 : 1.5}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </div>
          <span className="text-[10px] font-medium tracking-wide">Home</span>
        </Link>

        {/* Reward - Right */}
        <Link
          href="/rewards"
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${
            active === 'rewards'
              ? 'text-aurora-cyan'
              : 'text-arctic/40 hover:text-arctic/70'
          }`}
        >
          <div className={`relative p-2.5 rounded-2xl transition-all duration-300 ${
            active === 'rewards' ? 'bg-aurora-cyan/10' : ''
          }`}>
            {active === 'rewards' && (
              <div className="absolute inset-0 rounded-2xl bg-aurora-cyan/20 blur-lg animate-pulse" />
            )}
            <svg className="relative w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={active === 'rewards' ? 2 : 1.5}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <span className="text-[10px] font-medium tracking-wide">Reward</span>
        </Link>
      </div>
    </nav>
  )
}
