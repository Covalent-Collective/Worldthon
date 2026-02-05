'use client'

import Link from 'next/link'

interface BottomNavProps {
  active: 'home' | 'explore' | 'rewards'
}

export function BottomNav({ active }: BottomNavProps) {
  return (
    <nav className="glass-dark sticky bottom-0 safe-area-pb">
      <div className="flex justify-around py-3">
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${
            active === 'home'
              ? 'text-aurora-cyan'
              : 'text-arctic/50 hover:text-arctic/80'
          }`}
        >
          <div className={`p-2 rounded-xl transition-all duration-300 ${
            active === 'home' ? 'bg-aurora-cyan/10' : ''
          }`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={active === 'home' ? 2.5 : 1.5}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </div>
          <span className="text-xs font-medium">홈</span>
        </Link>
        <Link
          href="/explore/seoul-local-guide"
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${
            active === 'explore'
              ? 'text-aurora-cyan'
              : 'text-arctic/50 hover:text-arctic/80'
          }`}
        >
          <div className={`p-2 rounded-xl transition-all duration-300 ${
            active === 'explore' ? 'bg-aurora-cyan/10' : ''
          }`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={active === 'explore' ? 2.5 : 1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <span className="text-xs font-medium">탐색</span>
        </Link>
        <Link
          href="/rewards"
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${
            active === 'rewards'
              ? 'text-aurora-cyan'
              : 'text-arctic/50 hover:text-arctic/80'
          }`}
        >
          <div className={`p-2 rounded-xl transition-all duration-300 ${
            active === 'rewards' ? 'bg-aurora-cyan/10' : ''
          }`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={active === 'rewards' ? 2.5 : 1.5}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <span className="text-xs font-medium">보상</span>
        </Link>
      </div>
    </nav>
  )
}
