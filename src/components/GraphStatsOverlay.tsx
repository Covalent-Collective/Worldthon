'use client'

import { useEffect, useState, useRef, useMemo } from 'react'

interface GraphStatsOverlayProps {
  totalNodes: number
  totalEdges: number
  activeNodes: number
  totalCitations?: number
  topContributors?: { id: string; citations: number }[]
  isSearching: boolean
  currentQuery?: string
  searchResults?: {
    nodesFound: number
    confidence: number
  }
}

// Animated counter hook for smooth number transitions
function useAnimatedCounter(value: number, duration: number = 500): number {
  const [displayValue, setDisplayValue] = useState(value)
  const previousValue = useRef(value)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    if (previousValue.current === value) return

    const startValue = previousValue.current
    const endValue = value
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function (ease-out cubic)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(startValue + (endValue - startValue) * eased)

      setDisplayValue(current)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        previousValue.current = value
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [value, duration])

  return displayValue
}

// Pulse animation component for new citations
function PulseIndicator({ isActive }: { isActive: boolean }) {
  const [pulse, setPulse] = useState(false)
  const prevActive = useRef(isActive)

  useEffect(() => {
    if (isActive && !prevActive.current) {
      setPulse(true)
      const timeout = setTimeout(() => setPulse(false), 600)
      prevActive.current = isActive
      return () => clearTimeout(timeout)
    }
    prevActive.current = isActive
  }, [isActive])

  if (!pulse) return null

  return (
    <span className="absolute inset-0 rounded-lg bg-aurora-cyan/30 animate-ping" />
  )
}

// Format wallet address for display
function formatAddress(address: string): string {
  if (address.length <= 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function GraphStatsOverlay({
  totalNodes,
  totalEdges,
  activeNodes,
  totalCitations = 0,
  topContributors = [],
  isSearching,
  currentQuery,
  searchResults
}: GraphStatsOverlayProps) {
  const animatedNodes = useAnimatedCounter(totalNodes)
  const animatedEdges = useAnimatedCounter(totalEdges)
  const animatedActive = useAnimatedCounter(activeNodes)
  const animatedCitations = useAnimatedCounter(totalCitations)

  // Track citation changes for pulse effect
  const [lastCitationCount, setLastCitationCount] = useState(totalCitations)
  const [showPulse, setShowPulse] = useState(false)

  useEffect(() => {
    if (totalCitations > lastCitationCount) {
      setShowPulse(true)
      const timeout = setTimeout(() => setShowPulse(false), 600)
      setLastCitationCount(totalCitations)
      return () => clearTimeout(timeout)
    }
    setLastCitationCount(totalCitations)
  }, [totalCitations, lastCitationCount])

  // Progress bar animation for search
  const [searchProgress, setSearchProgress] = useState(0)

  useEffect(() => {
    if (isSearching && searchResults) {
      setSearchProgress(searchResults.confidence * 100)
    } else if (!isSearching) {
      setSearchProgress(0)
    }
  }, [isSearching, searchResults])

  // Memoize top contributors for performance
  const displayContributors = useMemo(() => {
    return topContributors.slice(0, 3)
  }, [topContributors])

  return (
    <div className="absolute inset-0 pointer-events-none z-30 hidden md:block">
      {/* Top Left: Graph Stats - Hidden on mobile */}
      <div className="absolute top-3 left-3 pointer-events-auto">
        <div className="glass-dark rounded-lg px-3 py-2 min-w-[160px]">
          {/* Header */}
          <div className="flex items-center gap-1.5 mb-2">
            <svg className="w-3.5 h-3.5 text-aurora-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-xs font-medium text-arctic/90 tracking-wide">
              Graph Stats
            </span>
          </div>

          {/* Stats Grid */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-arctic/50">Nodes</span>
              <span className="text-xs font-mono text-aurora-cyan font-medium">
                {animatedNodes}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-arctic/50">Edges</span>
              <span className="text-xs font-mono text-aurora-cyan font-medium">
                {animatedEdges}
              </span>
            </div>
            <div className="flex items-center justify-between relative">
              <span className="text-xs text-arctic/50">Active</span>
              <span className="text-xs font-mono text-aurora-violet font-medium relative">
                <PulseIndicator isActive={activeNodes > 0} />
                {animatedActive}
              </span>
            </div>
          </div>

          {/* Citation Counter */}
          <div className="mt-2 pt-2 border-t border-white/5">
            <div className="flex items-center justify-between relative">
              <span className="text-xs text-arctic/50">Citations</span>
              <div className="relative">
                {showPulse && (
                  <span className="absolute -inset-1 rounded bg-green-500/30 animate-ping" />
                )}
                <span className={`text-xs font-mono font-medium transition-colors duration-300 ${
                  showPulse ? 'text-green-400' : 'text-aurora-cyan'
                }`}>
                  {animatedCitations}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Right: Search Status (only when searching) */}
      {isSearching && (
        <div className="absolute top-3 right-3 pointer-events-auto">
          <div className="glass-dark rounded-lg px-3 py-2 min-w-[180px] animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-1.5 mb-2">
              <svg className="w-3.5 h-3.5 text-aurora-cyan animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-xs font-medium text-arctic/90 tracking-wide">
                Searching...
              </span>
            </div>

            {/* Query Display */}
            {currentQuery && (
              <div className="mb-2">
                <span className="text-xs text-arctic/70 line-clamp-1">
                  &quot;{currentQuery}&quot;
                </span>
              </div>
            )}

            {/* Progress Bar */}
            <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-aurora-cyan to-aurora-violet rounded-full transition-all duration-300 ease-out"
                style={{ width: `${searchProgress}%` }}
              />
              {/* Shimmer effect */}
              <div
                className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
                style={{
                  backgroundSize: '200% 100%',
                }}
              />
            </div>

            {/* Confidence */}
            {searchResults && (
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-[10px] text-arctic/40">Confidence</span>
                <span className="text-[10px] font-mono text-aurora-cyan">
                  {Math.round(searchResults.confidence * 100)}%
                </span>
              </div>
            )}

            {/* Nodes Found */}
            {searchResults && searchResults.nodesFound > 0 && (
              <div className="mt-1 flex items-center justify-between">
                <span className="text-[10px] text-arctic/40">Found</span>
                <span className="text-[10px] font-mono text-green-400">
                  {searchResults.nodesFound} nodes
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Left: Top Contributors */}
      {displayContributors.length > 0 && (
        <div className="absolute bottom-3 left-3 pointer-events-auto">
          <div className="glass-dark rounded-lg px-3 py-2 min-w-[160px]">
            {/* Header */}
            <div className="flex items-center gap-1.5 mb-2">
              <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-xs font-medium text-arctic/90 tracking-wide">
                Top Contributors
              </span>
            </div>

            {/* Contributors List */}
            <div className="space-y-1.5">
              {displayContributors.map((contributor, index) => (
                <div
                  key={contributor.id}
                  className="flex items-center justify-between gap-2"
                >
                  {/* Rank */}
                  <span className={`text-[10px] font-medium ${
                    index === 0 ? 'text-yellow-400' :
                    index === 1 ? 'text-gray-300' :
                    'text-amber-600'
                  }`}>
                    {index + 1}.
                  </span>

                  {/* Address */}
                  <span className="text-xs font-mono text-arctic/60 flex-1 truncate">
                    {formatAddress(contributor.id)}
                  </span>

                  {/* Citation Count */}
                  <span className="text-[10px] text-arctic/40">
                    ({contributor.citations} 인용)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GraphStatsOverlay
