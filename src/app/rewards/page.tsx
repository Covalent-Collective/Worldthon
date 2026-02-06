'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useUserStore } from '@/stores/userStore'
import { useBotsStore } from '@/stores/botsStore'
import { BottomNav } from '@/components/BottomNav'
import { AuroraBackground } from '@/components/AuroraBackground'
import { getContractStats, claimRewardOnChain, isContractConfigured } from '@/lib/contract'
import type { ContractStats } from '@/lib/contract'


// Power level visualization
function PowerMeter({ level, maxLevel = 10 }: { level: number; maxLevel?: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: maxLevel }).map((_, i) => (
        <div
          key={i}
          className={`h-8 w-2 rounded-sm transition-all duration-500 ${
            i < level
              ? 'bg-aurora-cyan shadow-[0_0_8px_rgba(0,242,255,0.5)]'
              : 'bg-white/10'
          }`}
          style={{
            transitionDelay: `${i * 50}ms`,
          }}
        />
      ))}
    </div>
  )
}

export default function RewardsPage() {
  const { isVerified, userId, rewards, claimRewards, loadUserData } = useUserStore()
  const { getBotById, loadBots } = useBotsStore()
  const [mounted, setMounted] = useState(false)
  const [showClaimSuccess, setShowClaimSuccess] = useState(false)
  const [onChainStats, setOnChainStats] = useState<ContractStats | null>(null)

  useEffect(() => {
    setMounted(true)
    loadBots()

    // 컨트랙트가 설정된 경우 온체인 통계 로드
    if (isContractConfigured()) {
      getContractStats()
        .then((stats) => {
          if (stats.totalContributions > BigInt(0) || stats.totalCitations > BigInt(0)) {
            setOnChainStats(stats)
          }
        })
        .catch(() => {
          // 온체인 통계 로드 실패는 무시
        })
    }
  }, [loadBots])

  // 인증된 사용자의 보상 데이터를 Supabase에서 로드
  useEffect(() => {
    if (isVerified && userId) {
      loadUserData()
    }
  }, [isVerified, userId, loadUserData])

  if (!mounted) {
    return null
  }

  const handleClaim = async () => {
    try {
      await claimRewards()

      // 온체인 보상 청구 (fire-and-forget, DB 청구와 병행)
      if (isContractConfigured()) {
        claimRewardOnChain().catch(() => {
          // 온체인 청구 실패는 무시 - DB 청구가 우선
        })
      }

      setShowClaimSuccess(true)
      setTimeout(() => setShowClaimSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to claim rewards:', error)
    }
  }

  const powerLevel = Math.min(10, Math.ceil(rewards.contributionPower / 10))

  if (!isVerified) {
    return (
      <AuroraBackground className="min-h-screen pb-20">
        <header className="px-5 pt-6 pb-4">
          <h1 className="text-2xl font-bold text-arctic tracking-tight">Reward</h1>
          <p className="text-arctic/50 text-sm mt-1 font-mono">GEOTHERMAL POWER STATION</p>
        </header>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-arctic/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-arctic/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-arctic/50 font-mono text-sm">
              ACCESS DENIED<br />
              <span className="text-arctic/30">World ID verification required</span>
            </p>
            <Link
              href="/"
              className="inline-block btn-primary rounded-full"
            >
              Verify Identity
            </Link>
          </div>
        </div>

        <BottomNav active="rewards" />
      </AuroraBackground>
    )
  }

  return (
    <AuroraBackground className="min-h-screen pb-20">
      {/* Header */}
      <header className="px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-arctic tracking-tight">Reward</h1>
        <p className="text-arctic/50 text-sm mt-1 font-mono">GEOTHERMAL POWER STATION</p>
      </header>

      <div className="flex-1 p-5 space-y-4 overflow-auto scrollbar-hide">
        {/* Power Level Card */}
        <div className="glass-card rounded-3xl p-5 relative overflow-hidden">
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-arctic/50 text-xs font-mono">POWER LEVEL</p>
                <div className="text-3xl font-bold text-arctic font-digital mt-1">
                  LV.{powerLevel}
                </div>
              </div>
              <div className="text-right">
                <p className="text-arctic/50 text-xs font-mono">CONTRIBUTION</p>
                <div className="text-xl font-bold text-aurora-cyan font-digital mt-1">
                  {rewards.contributionPower}%
                </div>
              </div>
            </div>

            <PowerMeter level={powerLevel} />

            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between text-[10px] text-arctic/40 font-mono mb-2">
                <span>PROGRESS TO LV.{powerLevel + 1}</span>
                <span>{rewards.contributionPower % 10}/10</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(rewards.contributionPower % 10) * 10}%`,
                    background: 'linear-gradient(-20deg, #ddd6f3 0%, #faaca8 100%)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Reward Counter */}
        <div className="relative overflow-hidden rounded-3xl p-5 backdrop-blur-sm" style={{
          background: 'linear-gradient(-20deg, rgba(221,214,243,0.25) 0%, rgba(250,172,168,0.25) 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl animate-pulse" style={{ background: 'rgba(221,214,243,0.2)' }} />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full blur-3xl animate-pulse" style={{ background: 'rgba(250,172,168,0.15)', animationDelay: '1s' }} />

          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <img src="/worldcoin-logo.svg" alt="Worldcoin" className="w-10 h-10" />
              <div>
                <p className="text-arctic/50 text-xs font-mono">PENDING REWARD</p>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-arctic/70">Accumulating</span>
                </div>
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-arctic font-digital tabular-nums">
                {rewards.pendingWLD.toFixed(6)}
              </span>
              <span className="text-sm text-arctic/50 font-mono">WLD</span>
            </div>

            <button onClick={handleClaim} className="w-full mt-4">
              <div className="glass-btn-wrap rounded-xl w-full">
                <div className="glass-btn rounded-xl w-full">
                  <span className="glass-btn-text block py-3 text-center text-sm font-bold">
                    {showClaimSuccess ? 'CLAIMED' : 'CLAIM REWARD'}
                  </span>
                </div>
                <div className="glass-btn-shadow rounded-xl" />
              </div>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card rounded-2xl p-4">
            <p className="text-arctic/50 text-xs font-mono">CITATIONS</p>
            <div className="text-2xl font-bold text-arctic font-digital mt-1">{rewards.totalCitations}</div>
          </div>
          <div className="glass-card rounded-2xl p-4">
            <p className="text-arctic/50 text-xs font-mono">NODES</p>
            <div className="text-2xl font-bold text-arctic font-digital mt-1">{rewards.contributions.length}</div>
          </div>
        </div>

        {/* On-chain Activity (온체인 통계가 있을 때만 표시) */}
        {onChainStats && (
          <div className="glass-card rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-aurora-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.172 13.828a4 4 0 015.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" />
              </svg>
              <p className="text-arctic/50 text-xs font-mono">ON-CHAIN ACTIVITY</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-arctic/40 text-[10px] font-mono">CONTRIBUTIONS</p>
                <p className="text-lg font-bold text-arctic font-digital">
                  {onChainStats.totalContributions.toString()}
                </p>
              </div>
              <div>
                <p className="text-arctic/40 text-[10px] font-mono">CITATIONS</p>
                <p className="text-lg font-bold text-arctic font-digital">
                  {onChainStats.totalCitations.toString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Transaction Log */}
        <div className="space-y-3">
          <p className="text-arctic/50 text-xs font-mono px-1">TRANSACTION LOG</p>

          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="p-4 font-mono text-xs max-h-[200px] overflow-auto scrollbar-hide">
              {rewards.contributions.length === 0 ? (
                <div className="text-arctic/30 py-4 text-center">
                  기여 내역이 없습니다
                </div>
              ) : (
                <div className="space-y-3">
                  {rewards.contributions.slice().reverse().map((contribution, i) => {
                    const bot = getBotById(contribution.botId)
                    const displayName = contribution.botName || bot?.name || contribution.label || 'Unknown'
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{
                          background: 'linear-gradient(-20deg, rgba(221,214,243,0.3) 0%, rgba(250,172,168,0.3) 100%)',
                        }}>
                          <span className="text-[10px] text-arctic/60">+</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-arctic/80 text-xs truncate">{displayName}</p>
                          <p className="text-arctic/30 text-[10px]">
                            {contribution.createdAt.split('T')[0]}
                          </p>
                        </div>
                        <span className="text-aurora-cyan text-[10px] font-mono">+NODE</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {rewards.contributions.length === 0 && (
            <Link href="/" className="block">
              <div className="glass-btn-wrap rounded-xl w-full">
                <div className="glass-btn rounded-xl w-full">
                  <span className="glass-btn-text block py-3 text-center text-sm font-medium">
                    기여 시작하기
                  </span>
                </div>
                <div className="glass-btn-shadow rounded-xl" />
              </div>
            </Link>
          )}
        </div>
      </div>

      <BottomNav active="rewards" />
    </AuroraBackground>
  )
}
