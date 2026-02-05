'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useUserStore } from '@/stores/userStore'
import { BottomNav } from '@/components/BottomNav'
import { expertBots } from '@/lib/mock-data'

// Real-time counter that slowly increments
function LiveRewardCounter({ baseValue }: { baseValue: number }) {
  const [value, setValue] = useState(baseValue)
  const frameRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(Date.now())

  useEffect(() => {
    const animate = () => {
      const now = Date.now()
      const delta = now - lastTimeRef.current

      // Increment very slowly (0.000001 per second)
      if (delta > 100) {
        setValue(prev => prev + 0.000001 * (delta / 1000))
        lastTimeRef.current = now
      }

      frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameRef.current)
  }, [])

  return (
    <span className="tabular-nums">
      {value.toFixed(6)}
    </span>
  )
}

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
  const { isVerified, rewards, claimRewards } = useUserStore()
  const [mounted, setMounted] = useState(false)
  const [showClaimSuccess, setShowClaimSuccess] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const handleClaim = () => {
    if (rewards.pendingWLD > 0) {
      claimRewards()
      setShowClaimSuccess(true)
      setTimeout(() => setShowClaimSuccess(false), 3000)
    }
  }

  // Calculate power level (1-10 based on contribution power)
  const powerLevel = Math.min(10, Math.ceil(rewards.contributionPower / 10))

  if (!isVerified) {
    return (
      <main className="min-h-screen flex flex-col bg-gradient-to-b from-night via-permafrost to-night">
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
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-night via-permafrost to-night">
      {/* Header */}
      <header className="px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-arctic tracking-tight">Reward</h1>
        <p className="text-arctic/50 text-sm mt-1 font-mono">GEOTHERMAL POWER STATION</p>
      </header>

      <div className="flex-1 p-5 space-y-5 overflow-auto scrollbar-hide">
        {/* Power Level Infographic */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
          {/* Background Grid Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }} />
          </div>

          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] text-aurora-cyan font-mono tracking-wider">POWER LEVEL</span>
                <div className="text-3xl font-bold text-arctic mt-1">
                  LV.{powerLevel}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-arctic/40 font-mono">CONTRIBUTION</span>
                <div className="text-xl font-bold text-aurora-cyan font-mono">
                  {rewards.contributionPower}%
                </div>
              </div>
            </div>

            {/* Power Meter */}
            <PowerMeter level={powerLevel} />

            {/* Progress to next level */}
            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between text-[10px] text-arctic/40 font-mono mb-2">
                <span>PROGRESS TO LV.{powerLevel + 1}</span>
                <span>{rewards.contributionPower % 10}/10</span>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-aurora-violet rounded-full transition-all duration-500"
                  style={{ width: `${(rewards.contributionPower % 10) * 10}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Reward Counter */}
        <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-aurora-violet/80 to-aurora-purple/80 backdrop-blur-sm">
          {/* Animated Background */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-aurora-cyan/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-aurora-violet/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <div className="w-5 h-5 bg-white rounded-full" />
              </div>
              <div>
                <span className="text-[10px] text-white/60 font-mono tracking-wider">GENERATING</span>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-white/80">Live</span>
                </div>
              </div>
            </div>

            <div className="text-4xl font-bold text-white mb-1 font-mono">
              <LiveRewardCounter baseValue={rewards.pendingWLD} />
            </div>
            <span className="text-sm text-white/60">WLD</span>

            <button
              onClick={handleClaim}
              disabled={rewards.pendingWLD === 0}
              className="w-full mt-4 py-3.5 bg-white text-aurora-purple rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-white/20 transition-all"
            >
              {showClaimSuccess ? 'CLAIMED' : 'CLAIM REWARD'}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card rounded-xl p-4">
            <span className="text-[10px] text-arctic/40 font-mono tracking-wider">CITATIONS</span>
            <div className="text-2xl font-bold text-arctic font-mono mt-1">{rewards.totalCitations}</div>
          </div>
          <div className="glass-card rounded-xl p-4">
            <span className="text-[10px] text-arctic/40 font-mono tracking-wider">NODES</span>
            <div className="text-2xl font-bold text-arctic font-mono mt-1">{rewards.contributions.length}</div>
          </div>
        </div>

        {/* Terminal-style History */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-aurora-cyan" />
            <span className="text-xs text-arctic/60 font-mono tracking-wider">TRANSACTION LOG</span>
          </div>

          <div className="glass-card rounded-xl overflow-hidden">
            {/* Terminal Header */}
            <div className="h-8 bg-white/5 flex items-center px-3 gap-1.5 border-b border-white/5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              <span className="ml-2 text-[10px] text-arctic/30 font-mono">seed-vault://rewards</span>
            </div>

            {/* Terminal Content */}
            <div className="p-3 font-mono text-xs max-h-[200px] overflow-auto scrollbar-hide">
              {rewards.contributions.length === 0 ? (
                <div className="text-arctic/30 py-4 text-center">
                  <span className="text-aurora-cyan">$</span> No transactions yet_
                </div>
              ) : (
                <div className="space-y-2">
                  {rewards.contributions.slice().reverse().map((contribution, i) => {
                    const bot = expertBots.find(b => b.id === contribution.botId)
                    return (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-aurora-cyan">$</span>
                        <div className="flex-1">
                          <span className="text-green-400">+NODE</span>
                          <span className="text-arctic/50"> {bot?.name || 'Unknown'}</span>
                          <div className="text-arctic/30 text-[10px]">
                            {contribution.createdAt.split('T')[0]} | 0 citations
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div className="text-arctic/30 animate-pulse">
                    <span className="text-aurora-cyan">$</span> _
                  </div>
                </div>
              )}
            </div>
          </div>

          {rewards.contributions.length === 0 && (
            <Link
              href="/"
              className="block text-center text-sm text-aurora-cyan hover:underline font-mono"
            >
              {'>'} Start contributing
            </Link>
          )}
        </div>
      </div>

      <BottomNav active="rewards" />
    </main>
  )
}
