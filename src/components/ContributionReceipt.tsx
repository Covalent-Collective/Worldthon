'use client'

import { useState, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'

interface ContributionReceiptProps {
  contributions: {
    nodeId: string
    nodeLabel: string
    contributor: string
    percentage: number
    relevanceScore: number
    matchedTerms: string[]
  }[]
  question: string
  totalNodes: number
  timestamp?: string
}

// Generate a unique receipt ID
function generateReceiptId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'RCP-'
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Format timestamp
function formatTimestamp(timestamp?: string): string {
  const date = timestamp ? new Date(timestamp) : new Date()
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

// Truncate hash for display
function truncateHash(hash: string, startChars = 6, endChars = 4): string {
  if (hash.length <= startChars + endChars) return hash
  return `${hash.slice(0, startChars)}...${hash.slice(-endChars)}`
}

// Animated counter component
function AnimatedNumber({
  value,
  duration = 1000,
  suffix = ''
}: {
  value: number
  duration?: number
  suffix?: string
}) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const startTime = Date.now()
    const startValue = 0

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function (ease-out cubic)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = startValue + (value - startValue) * eased

      setDisplayValue(current)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration])

  return (
    <span className="tabular-nums">
      {displayValue.toFixed(value % 1 === 0 ? 0 : 1)}{suffix}
    </span>
  )
}

// Donut chart component using conic-gradient
function DonutChart({
  contributions,
  size = 120
}: {
  contributions: { percentage: number; nodeLabel: string }[]
  size?: number
}) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300)
    return () => clearTimeout(timer)
  }, [])

  // Colors for segments
  const colors = [
    '#00F2FF', // aurora-cyan
    '#667EEA', // aurora-violet
    '#4FACFE', // aurora-blue
    '#F093FB', // aurora-pink
    '#22C55E', // green
    '#F5576C', // aurora-red
  ]

  // Build conic-gradient
  let gradientStops = ''
  let currentAngle = 0

  contributions.forEach((c, i) => {
    const color = colors[i % colors.length]
    const endAngle = currentAngle + (c.percentage / 100) * 360
    gradientStops += `${color} ${currentAngle}deg ${endAngle}deg, `
    currentAngle = endAngle
  })

  // Remove trailing comma
  gradientStops = gradientStops.slice(0, -2)

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative transition-all duration-1000 ease-out"
        style={{
          width: size,
          height: size,
          transform: isVisible ? 'scale(1)' : 'scale(0)',
          opacity: isVisible ? 1 : 0,
        }}
      >
        {/* Outer ring with gradient */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(${gradientStops})`,
            mask: 'radial-gradient(farthest-side, transparent calc(100% - 16px), #fff calc(100% - 16px))',
            WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 16px), #fff calc(100% - 16px))',
          }}
        />
        {/* Inner circle */}
        <div className="absolute inset-4 rounded-full bg-permafrost/90 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-aurora-cyan font-mono">
              <AnimatedNumber value={contributions.length} />
            </div>
            <div className="text-[10px] text-arctic/50 uppercase tracking-wider">nodes</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-2 max-w-[160px]">
        {contributions.slice(0, 4).map((c, i) => (
          <div key={i} className="flex items-center gap-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: colors[i % colors.length] }}
            />
            <span className="text-[10px] text-arctic/60 truncate max-w-[50px]">
              {c.nodeLabel}
            </span>
          </div>
        ))}
        {contributions.length > 4 && (
          <span className="text-[10px] text-arctic/40">+{contributions.length - 4}</span>
        )}
      </div>
    </div>
  )
}

// Progress bar with animation
function AnimatedProgressBar({
  value,
  delay = 0,
  color = 'aurora-cyan'
}: {
  value: number
  delay?: number
  color?: string
}) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setWidth(value)
    }, delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  const colorClasses: Record<string, string> = {
    'aurora-cyan': 'bg-aurora-cyan',
    'aurora-violet': 'bg-aurora-violet',
    'aurora-blue': 'bg-aurora-blue',
    'green': 'bg-green-500',
  }

  return (
    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
      <div
        className={cn(
          'h-full rounded-full transition-all duration-1000 ease-out',
          colorClasses[color] || 'bg-aurora-cyan'
        )}
        style={{ width: `${width}%` }}
      />
    </div>
  )
}

export function ContributionReceipt({
  contributions,
  question,
  totalNodes,
  timestamp
}: ContributionReceiptProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const receiptId = useMemo(() => generateReceiptId(), [])
  const formattedTimestamp = useMemo(() => formatTimestamp(timestamp), [timestamp])

  // Calculate unique contributors
  const uniqueContributors = useMemo(() => {
    return new Set(contributions.map(c => c.contributor)).size
  }, [contributions])

  // Animate expansion
  useEffect(() => {
    const timer = setTimeout(() => setIsExpanded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  if (contributions.length === 0) return null

  return (
    <div
      className={cn(
        'glass rounded-xl border border-dashed border-white/20 overflow-hidden',
        'transition-all duration-700 ease-out',
        isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-aurora-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="font-semibold text-arctic">기여도 영수증</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-arctic/40 font-mono">
            <span>{receiptId}</span>
          </div>
        </div>
        <div className="text-[11px] text-arctic/50 font-mono">
          {formattedTimestamp}
        </div>
      </div>

      {/* Question Section */}
      <div className="p-4 border-b border-white/10 bg-white/[0.02]">
        <div className="text-[10px] text-arctic/40 uppercase tracking-wider mb-2">
          질문
        </div>
        <p className="text-sm text-arctic/80 leading-relaxed">
          &ldquo;{question}&rdquo;
        </p>
        <div className="flex items-center gap-3 mt-3 text-[11px] text-arctic/50">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            탐색된 노드: <span className="text-aurora-cyan font-mono">{totalNodes}</span>
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            사용된 노드: <span className="text-aurora-violet font-mono">{contributions.length}</span>
          </span>
        </div>
      </div>

      {/* Main Content: Chart + Details */}
      <div className="p-4 flex flex-col lg:flex-row gap-6">
        {/* Donut Chart */}
        <div className="flex-shrink-0 flex justify-center">
          <DonutChart contributions={contributions} />
        </div>

        {/* Contribution Details */}
        <div className="flex-1 space-y-3">
          <div className="text-[10px] text-arctic/40 uppercase tracking-wider mb-3">
            노드별 기여도 상세
          </div>

          {contributions.map((contribution, index) => (
            <div
              key={contribution.nodeId}
              className="glass-card rounded-lg p-3 space-y-2"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              {/* Node Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-aurora-cyan/20 text-aurora-cyan rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                      {index + 1}
                    </span>
                    <h4 className="text-sm font-medium text-arctic truncate">
                      {contribution.nodeLabel}
                    </h4>
                  </div>
                </div>
                {/* Percentage */}
                <div className="text-right flex-shrink-0">
                  <div className="text-2xl font-bold text-aurora-cyan font-mono leading-none">
                    <AnimatedNumber value={contribution.percentage} suffix="%" duration={800 + index * 200} />
                  </div>
                  <div className="text-[9px] text-arctic/40 uppercase">기여도</div>
                </div>
              </div>

              {/* Matched Terms */}
              {contribution.matchedTerms.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {contribution.matchedTerms.map((term, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-aurora-violet/20 text-aurora-violet px-2 py-0.5 rounded-full"
                    >
                      {term}
                    </span>
                  ))}
                </div>
              )}

              {/* Relevance Score Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-arctic/50">관련성 점수</span>
                  <span className="text-arctic/70 font-mono">
                    {(contribution.relevanceScore * 100).toFixed(0)}%
                  </span>
                </div>
                <AnimatedProgressBar
                  value={contribution.relevanceScore * 100}
                  delay={300 + index * 100}
                  color={contribution.relevanceScore >= 0.7 ? 'aurora-cyan' : contribution.relevanceScore >= 0.4 ? 'aurora-violet' : 'aurora-blue'}
                />
              </div>

              {/* Contributor ID */}
              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                <span className="text-[10px] text-arctic/40">기여자</span>
                <span className="text-[10px] text-arctic/50 font-mono">
                  {truncateHash(contribution.contributor)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 bg-white/[0.02]">
        <div className="flex items-center justify-between">
          <p className="text-xs text-arctic/50">
            이 답변은 <span className="text-aurora-cyan font-semibold">{uniqueContributors}명</span>의 기여자 지식으로 생성되었습니다
          </p>
          {/* GraphRAG Badge */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-aurora-violet/10 border border-aurora-violet/20">
            <svg className="w-3 h-3 text-aurora-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-[10px] text-aurora-violet font-medium">GraphRAG</span>
          </div>
        </div>

        {/* Signature line */}
        <div className="mt-3 pt-3 border-t border-dashed border-white/10 flex items-center justify-center">
          <div className="text-center">
            <div className="text-[9px] text-arctic/30 uppercase tracking-widest mb-1">
              Verified by Seed Vault
            </div>
            <div className="flex items-center justify-center gap-1">
              <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-arctic/40 font-mono">{receiptId}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Export type for external use
export type { ContributionReceiptProps }
