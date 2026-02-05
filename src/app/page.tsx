'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useUserStore } from '@/stores/userStore'
import { expertBots } from '@/lib/mock-data'

export default function LandingPage() {
  const { isVerified } = useUserStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const totalNodes = expertBots.reduce((sum, bot) => sum + bot.nodeCount, 0)
  const totalContributors = expertBots.reduce((sum, bot) => sum + bot.contributorCount, 0)

  if (!mounted) {
    return null
  }

  if (isVerified) {
    return (
      <main className="min-h-screen flex flex-col">
        <div className="flex-1 overflow-auto">
          <MarketplacePage />
        </div>
        <BottomNav active="home" />
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="flex flex-col items-center text-center space-y-8">
        <div className="text-6xl">🌱</div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Seed Vault</h1>
          <p className="text-gray-500 text-sm">Human Knowledge Repository</p>
        </div>

        <p className="text-gray-600 text-sm max-w-[280px]">
          Dead Internet 시대,<br />
          검증된 인간 지식의 보존소
        </p>

        <button
          onClick={() => {
            // Mock verification for demo
            useUserStore.getState().setVerified(true, '0x' + Math.random().toString(16).slice(2, 10) + '...anon')
          }}
          className="w-full max-w-[280px] bg-black text-white py-4 px-6 rounded-full font-medium flex items-center justify-center gap-3 hover:bg-gray-800 transition-colors"
        >
          <span className="text-xl">⚫</span>
          World ID로 시작하기
        </button>

        <p className="text-gray-400 text-xs">
          Orb 인증으로 지식을 기여하고 보상받으세요
        </p>

        <div className="flex gap-4 pt-8">
          <StatCard label="노드" value={totalNodes} />
          <StatCard label="기여자" value={totalContributors} />
          <StatCard label="봇" value={expertBots.length} />
        </div>
      </div>
    </main>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-gray-50 rounded-xl px-5 py-3 text-center">
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  )
}

function MarketplacePage() {
  const { nullifierHash, logout } = useUserStore()

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">전문가 봇</h1>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{nullifierHash?.slice(0, 10)}...</span>
          <button
            onClick={logout}
            className="p-2 text-gray-400 hover:text-gray-600"
            title="로그아웃"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {expertBots.map(bot => (
          <BotCard key={bot.id} bot={bot} />
        ))}
      </div>
    </div>
  )
}

function BotCard({ bot }: { bot: typeof expertBots[0] }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
      <div className="flex gap-4">
        <div className="text-4xl">{bot.icon}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base">{bot.name}</h3>
          <p className="text-gray-500 text-sm truncate">{bot.description}</p>
          <p className="text-gray-400 text-xs mt-1">
            {bot.nodeCount} 노드 • {bot.contributorCount} 기여자
          </p>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <Link
          href={`/explore/${bot.id}`}
          className="flex-1 py-2.5 px-4 text-center text-sm font-medium border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
        >
          탐색하기
        </Link>
        <Link
          href={`/contribute/${bot.id}`}
          className="flex-1 py-2.5 px-4 text-center text-sm font-medium bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
        >
          기여하기
        </Link>
      </div>
    </div>
  )
}

function BottomNav({ active }: { active: 'home' | 'explore' | 'rewards' }) {
  return (
    <nav className="border-t border-gray-100 bg-white">
      <div className="flex justify-around py-3">
        <Link href="/" className={`flex flex-col items-center gap-1 ${active === 'home' ? 'text-black' : 'text-gray-400'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs">홈</span>
        </Link>
        <Link href="/explore" className={`flex flex-col items-center gap-1 ${active === 'explore' ? 'text-black' : 'text-gray-400'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-xs">탐색</span>
        </Link>
        <Link href="/rewards" className={`flex flex-col items-center gap-1 ${active === 'rewards' ? 'text-black' : 'text-gray-400'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs">보상</span>
        </Link>
      </div>
    </nav>
  )
}
