'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useUserStore } from '@/stores/userStore'
import { BottomNav } from '@/components/BottomNav'
import { expertBots } from '@/lib/mock-data'
import { AuroraBackground } from '@/components/AuroraBackground'


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

// Static mock data for demo
const STATIC_REWARDS = {
  contributionPower: 37,
  totalCitations: 128,
  pendingWLD: 6.666666,
  contributions: [
    { botId: 'world-coin', nodeId: 'node-wc-001', createdAt: '2025-01-15T09:30:00Z' },
    { botId: 'seoul-guide', nodeId: 'node-sg-001', createdAt: '2025-01-22T14:20:00Z' },
    { botId: 'doctor', nodeId: 'node-dc-001', createdAt: '2025-02-01T11:45:00Z' },
  ],
}
const STATIC_POWER_LEVEL = Math.min(10, Math.ceil(STATIC_REWARDS.contributionPower / 10))

export default function RewardsPage() {
  const { isVerified } = useUserStore()
  const [mounted, setMounted] = useState(false)
  const [showClaimSuccess, setShowClaimSuccess] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const handleClaim = () => {
    setShowClaimSuccess(true)
    setTimeout(() => setShowClaimSuccess(false), 3000)
  }

  const rewards = STATIC_REWARDS
  const powerLevel = STATIC_POWER_LEVEL

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
                    const bot = expertBots.find(b => b.id === contribution.botId)
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{
                          background: 'linear-gradient(-20deg, rgba(221,214,243,0.3) 0%, rgba(250,172,168,0.3) 100%)',
                        }}>
                          <span className="text-[10px] text-arctic/60">+</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-arctic/80 text-xs truncate">{bot?.name || 'Unknown'}</p>
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
