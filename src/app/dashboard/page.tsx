'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useUserStore } from '@/stores/userStore'
import { useAuthStore } from '@/stores/authStore'
import { useBotsStore } from '@/stores/botsStore'
import { BottomNav } from '@/components/BottomNav'
import { AuroraBackground } from '@/components/AuroraBackground'

/** Seeded pseudo-random number generator for deterministic heatmap data */
function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

/** Format relative time in Korean */
function formatRelativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then

  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}시간 전`

  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}일 전`

  const months = Math.floor(days / 30)
  return `${months}개월 전`
}

export default function DashboardPage() {
  const { rewards, loadUserData, isVerified, userId } = useUserStore()
  const { isAuthenticated } = useAuthStore()
  const isUserVerified = isAuthenticated || isVerified
  const { bots, loadBots, getBotById } = useBotsStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadBots()
  }, [loadBots])

  useEffect(() => {
    if (isUserVerified && userId) {
      loadUserData()
    }
  }, [isUserVerified, userId, loadUserData])

  // Generate 66-day activity heatmap data
  const heatmapData = useMemo(() => {
    const cells: number[] = []
    const rand = seededRandom(42)

    // Build a set of contribution dates for lookup
    const contributionDateCounts: Record<string, number> = {}
    for (const c of rewards.contributions) {
      const dateKey = c.createdAt.split('T')[0]
      contributionDateCounts[dateKey] = (contributionDateCounts[dateKey] || 0) + 1
    }

    const today = new Date()
    for (let i = 65; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateKey = date.toISOString().split('T')[0]

      if (contributionDateCounts[dateKey]) {
        // Use actual contribution count
        cells.push(Math.min(contributionDateCounts[dateKey], 3))
      } else {
        // Mock data: recent days (last 14) are more active
        const r = rand()
        if (i < 14) {
          // Recent: higher chance of activity
          if (r < 0.3) cells.push(0)
          else if (r < 0.55) cells.push(1)
          else if (r < 0.8) cells.push(2)
          else cells.push(3)
        } else {
          // Older: lower chance
          if (r < 0.55) cells.push(0)
          else if (r < 0.8) cells.push(1)
          else if (r < 0.95) cells.push(2)
          else cells.push(3)
        }
      }
    }

    return cells
  }, [rewards.contributions])

  // Hardcoded 3 repositories for demo
  const displayRepositories = useMemo(() => {
    return [
      bots.find(b => b.id === 'startup-mentor') || { id: 'startup-mentor', name: '스타트업의 기쁨과 슬픔', icon: '🚀', profileImage: '', nodeCount: 342 },
      bots.find(b => b.id === 'worldcoin-expert') || { id: 'worldcoin-expert', name: 'World Coin 전문가', icon: '🌐', profileImage: '', nodeCount: 128 },
      bots.find(b => b.id === 'seoul-local-guide') || { id: 'seoul-local-guide', name: '서울 로컬 가이드', icon: '🏙️', profileImage: '', nodeCount: 89 },
    ]
  }, [bots])
  const repositoryLabel = '참여 저장소'

  // Recent contributions - mock data for demo
  const recentContributions = useMemo(() => {
    const mock = [
      { botId: 'startup-mentor', botIcon: '🚀', botName: '스타트업의 기쁨과 슬픔', label: 'PMF 찾는 실전 방법론', createdAt: new Date(Date.now() - 1000 * 60 * 23).toISOString() },
      { botId: 'worldcoin-expert', botIcon: '🌐', botName: 'World Coin 전문가', label: 'MiniKit 연동 가이드', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
      { botId: 'startup-mentor', botIcon: '🚀', botName: '스타트업의 기쁨과 슬픔', label: '시드 투자 IR 덱 작성법', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString() },
      { botId: 'seoul-local-guide', botIcon: '🏙️', botName: '서울 로컬 가이드', label: '성수동 카페 루트 추천', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString() },
      { botId: 'worldcoin-expert', botIcon: '🌐', botName: 'World Coin 전문가', label: 'World ID 인증 레벨 비교', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString() },
    ]
    return rewards.contributions.length > 0 ? rewards.contributions.slice(0, 5) : mock
  }, [rewards.contributions])

  if (!mounted) {
    return null
  }

  return (
    <AuroraBackground className="min-h-screen pb-20">
      {/* Header */}
      <header className="px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-arctic tracking-tight">Dashboard</h1>
        <p className="text-arctic/50 text-sm mt-1 font-mono">MY ACTIVITY</p>
      </header>

      <div className="flex-1 p-5 space-y-4 overflow-auto scrollbar-hide">
        {/* Stats Row */}
        <div className="flex gap-3">
          <div className="glass-card rounded-xl px-4 py-2 flex items-center gap-2">
            <span className="text-arctic/50 text-[10px] font-mono">기여 노드</span>
            <span className="text-lg font-bold text-aurora-cyan font-digital">24</span>
          </div>
          <div className="glass-card rounded-xl px-4 py-2 flex items-center gap-2">
            <span className="text-arctic/50 text-[10px] font-mono">총 인용</span>
            <span className="text-lg font-bold text-aurora-cyan font-digital">1,847</span>
          </div>
        </div>

        {/* 66-Day Activity Heatmap */}
        <div className="glass-card rounded-2xl px-4 py-3">
          <p className="text-arctic/60 text-[10px] font-mono mb-2">ACTIVITY HEATMAP</p>
          <div className="grid gap-[3px]" style={{ gridTemplateColumns: 'repeat(22, minmax(0, 1fr))' }}>
            {heatmapData.map((level, i) => (
              <div
                key={i}
                className={`w-full aspect-square rounded-md ${
                  level === 0
                    ? 'bg-white/5'
                    : level === 1
                    ? 'bg-aurora-cyan/20'
                    : level === 2
                    ? 'bg-aurora-cyan/40'
                    : 'bg-aurora-cyan/60'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Repositories */}
        <div className="glass-card rounded-3xl p-4">
          <p className="text-arctic/60 text-xs font-mono mb-2">{repositoryLabel}</p>

          <div className="space-y-0">
            {displayRepositories.length === 0 ? (
              <div className="py-6 text-center text-arctic/30 text-sm font-mono">
                로딩 중...
              </div>
            ) : (
              displayRepositories.map((bot) => (
                <Link
                  key={bot.id}
                  href={`/community/${bot.id}`}
                  className="flex items-center gap-2.5 py-2 px-2 rounded-xl transition-colors hover:bg-white/5 active:bg-white/10"
                >
                  {/* Bot icon */}
                  <div className="relative flex-shrink-0">
                      {bot.profileImage ? (
                      <img
                        src={bot.profileImage}
                        alt={bot.name}
                        className="relative w-10 h-10 rounded-full object-cover border-2 border-permafrost"
                      />
                    ) : (
                      <div className="relative w-10 h-10 rounded-full bg-aurora-cyan/10 flex items-center justify-center text-lg border-2 border-permafrost">
                        {bot.icon}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-arctic text-sm font-medium truncate">{bot.name}</p>
                    </div>
                    <p className="text-arctic/40 text-[10px] font-mono">
                      {bot.nodeCount} nodes
                    </p>
                  </div>

                  {/* Chevron */}
                  <svg
                    className="w-4 h-4 text-arctic/20 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Contributions Timeline */}
        <div className="glass-card rounded-3xl p-5">
          <p className="text-arctic/60 text-xs font-mono mb-4">RECENT CONTRIBUTIONS</p>

          {recentContributions.length === 0 ? (
            <div className="py-8 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-arctic/20"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <p className="text-arctic/30 text-sm font-mono">아직 기여가 없습니다</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentContributions.map((contribution, i) => {
                const bot = getBotById(contribution.botId)
                const displayIcon = contribution.botIcon || bot?.icon || '🌱'
                const displayName = contribution.botName || bot?.name || contribution.label || 'Unknown'

                return (
                  <div key={i} className="flex items-center gap-3">
                    {/* Timeline line */}
                    <div className="relative flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-aurora-cyan/10 flex items-center justify-center text-sm">
                        {displayIcon}
                      </div>
                      {i < recentContributions.length - 1 && (
                        <div className="absolute top-8 left-1/2 w-px h-3 -translate-x-1/2 bg-white/10" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-arctic/80 text-xs truncate">
                        {contribution.label || displayName}
                      </p>
                      <p className="text-arctic/30 text-[10px] font-mono">
                        {displayName}
                      </p>
                    </div>

                    {/* Time */}
                    <span className="text-arctic/30 text-[10px] font-mono flex-shrink-0">
                      {formatRelativeTime(contribution.createdAt)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <BottomNav active="dashboard" />
    </AuroraBackground>
  )
}
