'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { useUserStore } from '@/stores/userStore'
import { useKnowledgeStore } from '@/stores/knowledgeStore'
import { expertBots } from '@/lib/mock-data'
import { BottomNav } from '@/components/BottomNav'
import { JournalingHome } from '@/components/JournalingHome'
import { AuroraBackground } from '@/components/AuroraBackground'

export default function LandingPage() {
  const { isVerified, globalStats } = useUserStore()
  const getTotalContributedNodes = useKnowledgeStore((state) => state.getTotalContributedNodes)
  const [mounted, setMounted] = useState(false)

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

          {/* Login Button */}
          <button
            onClick={() => {
              useUserStore.getState().setVerified(true, '0x' + Math.random().toString(16).slice(2, 10) + '...anon')
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

          <p className="text-arctic/40 text-xs font-mono">
            Orb 인증으로 지식을 기여하고 보상받으세요
          </p>

          {/* Stats */}
          <div className="flex gap-3 pt-4">
            <StatCard label="노드" value={realTotalNodes} />
            <StatCard label="기여자" value={globalStats.totalContributors} />
            <StatCard label="Vault" value={globalStats.totalBots} />
          </div>
        </div>
      </div>
    </AuroraBackground>
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
        className={`text-xl font-digital font-bold transition-all duration-300 ${
          isAnimating ? 'scale-125 text-aurora-cyan' : 'scale-100 text-arctic'
        }`}
      >
        {value}
      </div>
      <div className="text-xs text-arctic/50 font-mono mt-1">{label}</div>
    </div>
  )
}
