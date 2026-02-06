'use client'

import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { useUserStore } from '@/stores/userStore'
import { useKnowledgeStore } from '@/stores/knowledgeStore'
import { useBotsStore } from '@/stores/botsStore'
import { BottomNav } from '@/components/BottomNav'
import { JournalingHome } from '@/components/JournalingHome'
import { AuroraBackground } from '@/components/AuroraBackground'
import { getGlobalStats, subscribeToGlobalStats } from '@/lib/api'

export default function LandingPage() {
  const { isVerified, globalStats } = useUserStore()
  const getTotalContributedNodes = useKnowledgeStore((state) => state.getTotalContributedNodes)
  const { bots, loadBots } = useBotsStore()
  const [mounted, setMounted] = useState(false)
  const [statsLoaded, setStatsLoaded] = useState(false)
  const [liveStats, setLiveStats] = useState<{
    totalNodes: number
    totalContributors: number
    totalBots: number
  } | null>(null)

  const totalContributedNodes = getTotalContributedNodes()

  // Compute fallback stats from mock data when Supabase is not configured
  const mockStats = useMemo(() => {
    if (bots.length === 0) return null
    const totalNodes = bots.reduce((sum, bot) => sum + bot.graph.nodes.length, 0)
    const uniqueContributors = new Set(
      bots.flatMap(bot => bot.graph.nodes.map(n => n.contributor))
    ).size
    return {
      totalNodes,
      totalContributors: uniqueContributors,
      totalBots: bots.length
    }
  }, [bots])

  // Determine which stats to display: live Supabase > store globalStats > mock fallback
  const displayStats = useMemo(() => {
    if (liveStats && (liveStats.totalNodes > 0 || liveStats.totalBots > 0)) {
      return liveStats
    }
    if (globalStats.totalNodes > 0 || globalStats.totalBots > 0) {
      return globalStats
    }
    if (mockStats) {
      return mockStats
    }
    return { totalNodes: 0, totalContributors: 0, totalBots: 0 }
  }, [liveStats, globalStats, mockStats])

  const realTotalNodes = useMemo(
    () => displayStats.totalNodes + totalContributedNodes,
    [displayStats.totalNodes, totalContributedNodes]
  )

  // Fetch global stats from Supabase on mount, subscribe to realtime updates
  const fetchStats = useCallback(async () => {
    try {
      const stats = await getGlobalStats()
      if (stats) {
        setLiveStats({
          totalNodes: stats.total_nodes,
          totalContributors: stats.total_contributors,
          totalBots: stats.total_bots
        })
      }
    } catch {
      // Supabase not configured or network error - fallback to mock data
    } finally {
      setStatsLoaded(true)
    }
  }, [])

  useEffect(() => {
    loadBots()
    fetchStats()
    setMounted(true)

    // Subscribe to realtime global stats updates
    const subscription = subscribeToGlobalStats((stats) => {
      setLiveStats({
        totalNodes: stats.total_nodes,
        totalContributors: stats.total_contributors,
        totalBots: stats.total_bots
      })
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [loadBots, fetchStats])

  if (!mounted) {
    return null
  }

  if (isVerified) {
    return (
      <AuroraBackground className="h-screen pb-20">
        <JournalingHome />
        <BottomNav active="home" />
      </AuroraBackground>
    )
  }

  return (
    <AuroraBackground className="min-h-screen">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="flex flex-col items-center text-center space-y-8 animate-fade-in">
          {/* Logo */}
          <div className="relative">
            <div className="absolute inset-0 blur-3xl rounded-full animate-pulse-glow" style={{ background: 'rgba(221,214,243,0.2)' }} />
            <div
              className="relative w-24 h-24 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(-20deg, #ddd6f3 0%, #faaca8 100%)' }}
            >
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-arctic tracking-tight">Seed Vault</h1>
            <p className="text-arctic/50 text-sm font-mono tracking-wider">
              HUMAN KNOWLEDGE REPOSITORY
            </p>
          </div>

          {/* Description */}
          <p className="text-arctic/60 text-sm max-w-[280px] leading-relaxed">
            Dead Internet 시대,<br />
            <span className="text-arctic/80">검증된 인간 지식</span>의 보존소
          </p>

          {/* Login Button — dev only (프로덕션에서는 World ID MiniKit 사용) */}
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={() => {
                useUserStore.getState().setVerified(true, {
                  token: 'dev_token_' + Date.now(),
                  userId: 'dev_user_' + Math.random().toString(16).slice(2, 10),
                  verificationLevel: 'orb',
                  nullifierHash: '0x' + Math.random().toString(16).slice(2, 10) + '...anon'
                })
              }}
              className="w-full max-w-[280px]"
            >
              <div className="glass-btn-wrap rounded-2xl w-full">
                <div className="glass-btn rounded-2xl w-full">
                  <span className="glass-btn-text flex items-center justify-center gap-3 py-4 text-sm font-bold">
                    <img src="/worldcoin-logo.svg" alt="Worldcoin" className="w-5 h-5" />
                    World ID로 시작하기
                  </span>
                </div>
                <div className="glass-btn-shadow rounded-2xl" />
              </div>
            </button>
          )}

          <p className="text-arctic/40 text-xs font-mono">
            Orb 인증으로 지식을 기여하고 보상받으세요
          </p>

          {/* Stats */}
          <div className="flex gap-3 pt-4">
            <StatCard label="노드" value={realTotalNodes} loading={!statsLoaded && realTotalNodes === 0} />
            <StatCard label="기여자" value={displayStats.totalContributors} loading={!statsLoaded && displayStats.totalContributors === 0} />
            <StatCard label="Vault" value={displayStats.totalBots} loading={!statsLoaded && displayStats.totalBots === 0} />
          </div>
        </div>
      </div>
    </AuroraBackground>
  )
}

function StatCard({ label, value, loading = false }: { label: string; value: number; loading?: boolean }) {
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
        className={`text-xl font-digital font-bold transition-all duration-300 ${
          isAnimating ? 'scale-125 text-aurora-cyan' : 'scale-100 text-arctic'
        }`}
      >
        {loading ? '...' : value}
      </div>
      <div className="text-xs text-arctic/50 font-mono mt-1">{label}</div>
    </div>
  )
}
