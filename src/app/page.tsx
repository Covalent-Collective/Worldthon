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
      <main className="h-screen flex flex-col bg-gradient-to-b from-night via-permafrost to-night overflow-hidden">
        <NetworkPage />
        <BottomNav active="home" />
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="flex flex-col items-center text-center space-y-8 animate-fade-in">
        <div className="relative">
          <div className="absolute inset-0 bg-aurora-cyan/20 blur-3xl rounded-full animate-pulse-glow" />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-aurora-cyan to-aurora-violet flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-arctic">Seed Vault</h1>
          <p className="text-aurora-cyan/80 text-sm font-mono tracking-wider">
            HUMAN KNOWLEDGE REPOSITORY
          </p>
        </div>

        <p className="text-arctic/60 text-sm max-w-[280px] leading-relaxed">
          Dead Internet 시대,<br />
          <span className="text-arctic/80">검증된 인간 지식</span>의 보존소
        </p>

        <button
          onClick={() => {
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
          isAnimating ? 'scale-125 text-aurora-cyan' : 'scale-100 text-arctic'
        }`}
      >
        {value}
      </div>
      <div className="text-xs text-arctic/50 mt-1">{label}</div>
    </div>
  )
}

function NetworkPage() {
  const { nullifierHash, logout } = useUserStore()
  const [selectedBot, setSelectedBot] = useState<string | null>(null)
  const [showQuickAction, setShowQuickAction] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Distribute bots across 3 orbital rings
  const orbitData = useMemo(() => {
    const orbits = [
      { radius: 90, duration: 30, bots: [] as typeof expertBots },
      { radius: 140, duration: 45, bots: [] as typeof expertBots },
      { radius: 185, duration: 60, bots: [] as typeof expertBots },
    ]

    expertBots.forEach((bot, index) => {
      orbits[index % 3].bots.push(bot)
    })

    return orbits
  }, [])

  const handleBotClick = (botId: string) => {
    setSelectedBot(botId)
    setShowQuickAction(true)
  }

  const selectedBotData = selectedBot ? expertBots.find(b => b.id === selectedBot) : null

  return (
    <div className="flex-1 flex flex-col relative">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2 z-10 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-arctic">My Network</h1>
          <p className="text-[10px] text-arctic/40 font-mono">KNOWLEDGE COSMOS</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-arctic/40 font-mono">{nullifierHash?.slice(0, 10)}...</span>
          <button
            onClick={logout}
            className="p-2 text-arctic/40 hover:text-arctic/70 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Solar System Visualization */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden min-h-[400px]">
        {/* Space Background with Stars */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() > 0.8 ? '2px' : '1px',
                height: Math.random() > 0.8 ? '2px' : '1px',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: 0.3 + Math.random() * 0.5,
                animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Orbital Rings */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {orbitData.map((orbit, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-white/5"
              style={{
                width: orbit.radius * 2,
                height: orbit.radius * 2,
                left: -orbit.radius,
                top: -orbit.radius,
              }}
            />
          ))}
        </div>

        {/* Central Sun - ME */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="relative">
            {/* Corona layers - pointer-events-none to allow clicking through */}
            <div className="absolute inset-0 bg-aurora-cyan/10 rounded-full blur-3xl scale-[3] animate-pulse pointer-events-none" style={{ animationDuration: '4s' }} />
            <div className="absolute inset-0 bg-aurora-violet/20 rounded-full blur-2xl scale-[2] animate-pulse pointer-events-none" style={{ animationDuration: '3s', animationDelay: '0.5s' }} />
            <div className="absolute inset-0 bg-aurora-cyan/30 rounded-full blur-xl scale-150 animate-pulse pointer-events-none" style={{ animationDuration: '2s' }} />
            {/* Core */}
            <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-aurora-cyan via-aurora-violet to-aurora-purple border-2 border-white/40 shadow-[0_0_40px_rgba(0,242,255,0.5)]" />
            {/* Rotating ring */}
            <div
              className="absolute -inset-3 rounded-full border-2 border-dashed border-aurora-cyan/20 pointer-events-none"
              style={{ animation: 'spin 10s linear infinite' }}
            />
          </div>
        </div>

        {/* Orbiting Bot Nodes */}
        {orbitData.map((orbit, orbitIndex) => (
          <div
            key={orbitIndex}
            className="absolute left-1/2 top-1/2"
            style={{
              animation: `orbit ${orbit.duration}s linear infinite`,
              animationDirection: orbitIndex % 2 === 0 ? 'normal' : 'reverse',
            }}
          >
            {orbit.bots.map((bot, botIndex) => {
              const angleRad = (botIndex / orbit.bots.length) * 2 * Math.PI
              const x = Math.cos(angleRad) * orbit.radius
              const y = Math.sin(angleRad) * orbit.radius
              return (
                <button
                  key={bot.id}
                  onClick={() => handleBotClick(bot.id)}
                  className="absolute z-20 group -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: x,
                    top: y,
                  }}
                >
                  {/* No rotation - just counter the parent orbit */}
                  <div
                    style={{
                      animation: `counter-orbit ${orbit.duration}s linear infinite`,
                      animationDirection: orbitIndex % 2 === 0 ? 'normal' : 'reverse',
                    }}
                  >
                    <div className={`relative transition-all duration-300 ${
                      selectedBot === bot.id ? 'scale-125' : 'group-hover:scale-110'
                    }`}>
                      {/* Glow on select */}
                      {selectedBot === bot.id && (
                        <div className="absolute inset-0 bg-aurora-cyan/40 rounded-full blur-lg scale-150" />
                      )}
                      {/* Planet body */}
                      <div className={`relative w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        selectedBot === bot.id
                          ? 'bg-aurora-cyan/20 border-aurora-cyan shadow-lg shadow-aurora-cyan/30'
                          : 'bg-night/80 border-white/20 group-hover:border-aurora-cyan/50 group-hover:bg-white/10'
                      }`}>
                        <span className="text-lg font-bold text-arctic/80">{bot.icon}</span>
                      </div>
                      {/* Label */}
                      <div className={`absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap transition-all duration-300 ${
                        selectedBot === bot.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}>
                        <span className="text-[9px] text-arctic/70 font-medium bg-night/90 px-2 py-0.5 rounded-full">
                          {bot.name}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        ))}

        {/* Shooting stars */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-0.5 bg-white rounded-full"
              style={{
                left: `${10 + i * 30}%`,
                top: `${20 + i * 15}%`,
                boxShadow: '0 0 3px 1px rgba(255,255,255,0.5), 20px 0 15px 2px rgba(255,255,255,0.3)',
                animation: `shooting-star ${4 + i}s ease-in-out infinite`,
                animationDelay: `${i * 3}s`,
                opacity: 0,
              }}
            />
          ))}
        </div>
      </div>

      {/* Quick Action Panel */}
      {showQuickAction && selectedBotData && (
        <div className="absolute inset-x-0 bottom-16 z-30 px-4 animate-slide-up">
          <div className="glass-card rounded-2xl p-4 border border-aurora-cyan/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-aurora-cyan/20 to-aurora-violet/20 flex items-center justify-center">
                <span className="text-2xl font-bold">{selectedBotData.icon}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-arctic">{selectedBotData.name}</h3>
                <p className="text-xs text-arctic/50">{selectedBotData.nodeCount} nodes • {selectedBotData.contributorCount} contributors</p>
              </div>
              <button
                onClick={() => {
                  setShowQuickAction(false)
                  setSelectedBot(null)
                }}
                className="p-2 text-arctic/40 hover:text-arctic"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-arctic/60 mb-4 line-clamp-2">{selectedBotData.description}</p>
            <div className="flex gap-2">
              <Link
                href={`/explore/${selectedBotData.id}`}
                className="flex-1 py-3 text-center text-sm font-medium glass rounded-xl text-arctic/80 hover:text-arctic hover:bg-white/10 transition-all"
              >
                탐색하기
              </Link>
              <Link
                href={`/contribute/${selectedBotData.id}`}
                className="flex-1 py-3 text-center text-sm font-medium bg-gradient-to-r from-aurora-cyan to-aurora-violet text-white rounded-xl hover:opacity-90 transition-all"
              >
                기여하기
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
