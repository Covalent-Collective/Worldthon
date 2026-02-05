'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import Link from 'next/link'
import { useUserStore } from '@/stores/userStore'
import { useKnowledgeStore } from '@/stores/knowledgeStore'
import { expertBots } from '@/lib/mock-data'
import { BottomNav } from '@/components/BottomNav'

export default function LandingPage() {
  const { isVerified, globalStats } = useUserStore()
  const getTotalContributedNodes = useKnowledgeStore((state) => state.getTotalContributedNodes)
  const [mounted, setMounted] = useState(false)

  // Calculate real total nodes: base nodes + user contributions
  const totalContributedNodes = getTotalContributedNodes()
  const baseNodeCount = expertBots.reduce((sum, bot) => sum + bot.graph.nodes.length, 0)
  const realTotalNodes = useMemo(
    () => baseNodeCount + totalContributedNodes,
    [baseNodeCount, totalContributedNodes]
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  if (isVerified) {
    return (
      <main className="min-h-screen flex flex-col">
        <div className="flex-1 overflow-auto scrollbar-hide">
          <MarketplacePage />
        </div>
        <BottomNav active="home" />
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="flex flex-col items-center text-center space-y-8 animate-fade-in">
        {/* Logo with Glow */}
        <div className="relative">
          <div className="absolute inset-0 bg-aurora-cyan/20 blur-3xl rounded-full animate-pulse-glow" />
          <div className="relative text-7xl animate-float">🌱</div>
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-arctic">Seed Vault</h1>
          <p className="text-aurora-cyan/80 text-sm font-mono tracking-wider">
            HUMAN KNOWLEDGE REPOSITORY
          </p>
        </div>

        {/* Description */}
        <p className="text-arctic/60 text-sm max-w-[280px] leading-relaxed">
          Dead Internet 시대,<br />
          <span className="text-arctic/80">검증된 인간 지식</span>의 보존소
        </p>

        {/* CTA Button */}
        <button
          onClick={() => {
            // Mock verification for demo
            useUserStore.getState().setVerified(true, '0x' + Math.random().toString(16).slice(2, 10) + '...anon')
          }}
          className="w-full max-w-[280px] btn-primary flex items-center justify-center gap-3 py-4 rounded-full"
        >
          <span className="w-6 h-6 bg-permafrost rounded-full flex items-center justify-center">
            <span className="w-3 h-3 bg-arctic rounded-full" />
          </span>
          World ID로 시작하기
        </button>

        <p className="text-arctic/40 text-xs">
          Orb 인증으로 지식을 기여하고 보상받으세요
        </p>

        {/* Stats */}
        <div className="flex gap-3 pt-6">
          <StatCard label="노드" value={realTotalNodes} />
          <StatCard label="기여자" value={globalStats.totalContributors} />
          <StatCard label="봇" value={globalStats.totalBots} />
        </div>
      </div>
    </main>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  const [isAnimating, setIsAnimating] = useState(false)
  const prevValueRef = useRef(value)

  useEffect(() => {
    if (prevValueRef.current !== value) {
      setIsAnimating(true)
      prevValueRef.current = value
      const timer = setTimeout(() => setIsAnimating(false), 600)
      return () => clearTimeout(timer)
    }
  }, [value])

  return (
    <div className="glass-card rounded-2xl px-5 py-3 text-center min-w-[80px]">
      <div
        className={`text-xl font-bold transition-all duration-300 ${
          isAnimating
            ? 'scale-125 text-aurora-cyan'
            : 'scale-100 text-arctic'
        }`}
      >
        {value}
      </div>
      <div className="text-xs text-arctic/50 mt-1">{label}</div>
    </div>
  )
}

function MarketplacePage() {
  const { nullifierHash, logout } = useUserStore()

  return (
    <div className="p-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-xl font-bold text-arctic">전문가 봇</h1>
          <p className="text-sm text-arctic/50 mt-0.5">지식 그래프를 탐색하고 기여하세요</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-arctic/40 font-mono">{nullifierHash?.slice(0, 10)}...</span>
          <button
            onClick={logout}
            className="p-2 text-arctic/40 hover:text-arctic/70 transition-colors"
            title="로그아웃"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Bot Cards */}
      <div className="space-y-3">
        {expertBots.map((bot, index) => (
          <BotCard key={bot.id} bot={bot} index={index} />
        ))}
      </div>
    </div>
  )
}

function BotCard({ bot, index }: { bot: typeof expertBots[0]; index: number }) {
  // Get contribution count for this specific bot
  const getContributionCount = useKnowledgeStore((state) => state.getContributionCount)
  const contributionCount = getContributionCount(bot.id)

  // Calculate total node count: base nodes + user contributions
  const totalNodes = bot.graph.nodes.length + contributionCount

  return (
    <div
      className="glass-card rounded-2xl p-4 transition-all duration-300 hover:shadow-card-hover animate-slide-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex gap-4">
        <div className="text-4xl">{bot.icon}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base text-arctic">{bot.name}</h3>
          <p className="text-arctic/50 text-sm truncate">{bot.description}</p>
          <p className="text-arctic/40 text-xs mt-1.5 font-mono">
            {totalNodes} 노드 • {bot.contributorCount} 기여자
            {contributionCount > 0 && (
              <span className="text-aurora-cyan ml-1">(+{contributionCount})</span>
            )}
          </p>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <Link
          href={`/explore/${bot.id}`}
          className="flex-1 py-2.5 px-4 text-center text-sm font-medium glass rounded-xl text-arctic/80 hover:text-arctic hover:bg-white/10 transition-all"
        >
          탐색하기
        </Link>
        <Link
          href={`/contribute/${bot.id}`}
          className="flex-1 py-2.5 px-4 text-center text-sm font-medium bg-aurora-cyan text-permafrost rounded-xl hover:shadow-glow-cyan transition-all"
        >
          기여하기
        </Link>
      </div>
    </div>
  )
}
