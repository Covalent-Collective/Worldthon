'use client'

import Link from 'next/link'

interface BottomNavProps {
  active: 'home' | 'explore' | 'rewards'
}

export function BottomNav({ active }: BottomNavProps) {
  return (
    <nav className="border-t border-gray-100 bg-white sticky bottom-0">
      <div className="flex justify-around py-3">
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 ${active === 'home' ? 'text-black' : 'text-gray-400'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <span className="text-xs">홈</span>
        </Link>
        <Link
          href="/explore/seoul-local-guide"
          className={`flex flex-col items-center gap-1 ${active === 'explore' ? 'text-black' : 'text-gray-400'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <span className="text-xs">탐색</span>
        </Link>
        <Link
          href="/rewards"
          className={`flex flex-col items-center gap-1 ${active === 'rewards' ? 'text-black' : 'text-gray-400'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-xs">보상</span>
        </Link>
      </div>
    </nav>
  )
}
