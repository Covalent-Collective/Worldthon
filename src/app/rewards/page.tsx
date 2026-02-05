'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useUserStore } from '@/stores/userStore'
import { BottomNav } from '@/components/BottomNav'
import { expertBots } from '@/lib/mock-data'

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

  if (!isVerified) {
    return (
      <main className="min-h-screen flex flex-col">
        <header className="glass-dark p-4">
          <h1 className="text-xl font-bold text-arctic">내 보상</h1>
        </header>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <div className="text-5xl">🔒</div>
            <p className="text-arctic/50">
              보상을 확인하려면<br />World ID 인증이 필요합니다
            </p>
            <Link
              href="/"
              className="inline-block btn-primary rounded-full"
            >
              인증하러 가기
            </Link>
          </div>
        </div>

        <BottomNav active="rewards" />
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="glass-dark p-4">
        <h1 className="text-xl font-bold text-arctic">내 보상</h1>
      </header>

      <div className="flex-1 p-4 space-y-4 overflow-auto scrollbar-hide">
        {/* Contribution Power */}
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-arctic/70">Contribution Power</span>
            <span className="text-lg font-bold text-aurora-cyan">{rewards.contributionPower}%</span>
          </div>
          <div className="bg-white/10 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-aurora-violet to-aurora-cyan rounded-full h-3 transition-all duration-500"
              style={{ width: `${rewards.contributionPower}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-arctic">{rewards.totalCitations}</div>
            <div className="text-sm text-arctic/50 mt-1">총 인용 횟수</div>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-arctic">{rewards.contributions.length}</div>
            <div className="text-sm text-arctic/50 mt-1">기여한 노드</div>
          </div>
        </div>

        {/* Rewards Card */}
        <div className="relative overflow-hidden rounded-xl p-5 bg-gradient-to-br from-aurora-violet to-aurora-purple">
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-aurora-cyan/20 rounded-full blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="w-5 h-5 bg-white rounded-full" />
              </div>
              <span className="text-sm text-white/80">수령 가능한 보상</span>
            </div>

            <div className="text-3xl font-bold text-white mb-4">
              {rewards.pendingWLD.toFixed(4)} WLD
            </div>

            <button
              onClick={handleClaim}
              disabled={rewards.pendingWLD === 0}
              className="w-full py-3 bg-white text-aurora-purple rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
            >
              {showClaimSuccess ? '✓ 수령 완료!' : 'Claim'}
            </button>

            {rewards.pendingWLD === 0 && (
              <p className="text-center text-xs text-white/60 mt-3">
                지식을 기여하고 인용되면 보상을 받을 수 있어요
              </p>
            )}
          </div>
        </div>

        {/* Recent Contributions */}
        <div className="space-y-3">
          <h2 className="font-semibold text-arctic">최근 기여</h2>

          {rewards.contributions.length === 0 ? (
            <div className="glass rounded-xl p-6 text-center">
              <p className="text-arctic/50 text-sm">
                아직 기여한 지식이 없습니다
              </p>
              <Link
                href="/"
                className="inline-block mt-3 text-sm text-aurora-cyan hover:underline"
              >
                지식 기여하러 가기
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {rewards.contributions.slice().reverse().map((contribution, i) => {
                const bot = expertBots.find(b => b.id === contribution.botId)
                return (
                  <div key={i} className="glass rounded-xl p-4">
                    <div className="flex items-center gap-2">
                      <span>{bot?.icon || '📝'}</span>
                      <span className="font-medium text-sm text-arctic">{bot?.name || '알 수 없음'}</span>
                    </div>
                    <p className="text-xs text-arctic/40 mt-1 font-mono">
                      {contribution.createdAt.split('T')[0]} • 인용 0회
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <BottomNav active="rewards" />
    </main>
  )
}
