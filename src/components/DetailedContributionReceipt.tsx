'use client'

import type { DetailedContribution } from '@/lib/types'
import { truncateHash } from '@/lib/utils'

interface DetailedContributionReceiptProps {
  contributions: DetailedContribution[]
  question: string
  totalNodes: number
}

export function DetailedContributionReceipt({
  contributions,
  question,
  totalNodes
}: DetailedContributionReceiptProps) {
  if (contributions.length === 0) return null

  const totalWLD = contributions.reduce((sum, c) => sum + c.estimatedWLD, 0)

  return (
    <div className="glass rounded-xl p-4 border border-dashed border-white/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-aurora-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="font-medium text-sm text-arctic">기여 영수증</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-arctic/50">예상 보상</span>
          <span className="text-aurora-cyan font-semibold">
            {totalWLD.toFixed(6)} WLD
          </span>
        </div>
      </div>

      {/* Query Info */}
      <div className="mb-4 p-2.5 rounded-lg bg-white/5">
        <div className="text-xs text-arctic/50 mb-1">질문</div>
        <div className="text-sm text-arctic/80 line-clamp-2">{question}</div>
      </div>

      {/* Contributions List */}
      <div className="space-y-3">
        {contributions.map((c, i) => (
          <div key={c.nodeId} className="group">
            <div className="flex items-start gap-3">
              {/* Rank Badge */}
              <div className={`
                flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold
                ${i === 0 ? 'bg-aurora-cyan text-night' : 'bg-white/10 text-arctic/70'}
              `}>
                {i + 1}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-sm text-arctic truncate">{c.nodeLabel}</span>
                  <span className={`
                    text-xs font-medium px-1.5 py-0.5 rounded
                    ${i === 0 ? 'bg-aurora-cyan/20 text-aurora-cyan' : 'bg-white/10 text-arctic/70'}
                  `}>
                    {c.percentage}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-white/10 rounded-full h-1.5 mb-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      i === 0 ? 'bg-aurora-cyan' : 'bg-aurora-violet'
                    }`}
                    style={{ width: `${c.percentage}%` }}
                  />
                </div>

                {/* Details Row */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-arctic/40 font-mono">
                      {truncateHash(c.contributor)}
                    </span>
                    {c.matchedTerms.length > 0 && (
                      <div className="flex items-center gap-1">
                        {c.matchedTerms.slice(0, 2).map((term, idx) => (
                          <span
                            key={idx}
                            className="bg-aurora-violet/20 text-aurora-violet px-1 py-0.5 rounded text-[10px]"
                          >
                            {term}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-aurora-cyan/70">
                    +{c.estimatedWLD.toFixed(6)} WLD
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Stats */}
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-arctic/40">
        <span>
          {totalNodes}개 노드 중 {contributions.length}개 인용됨
        </span>
        <span>
          관련도 기반 비례 분배
        </span>
      </div>

      {/* Info Note */}
      <p className="text-xs text-arctic/40 mt-3">
        이 답변은 위 기여자들의 지식을 기반으로 생성되었습니다.
        각 기여자는 관련도에 따라 비례적으로 WLD 보상을 받습니다.
      </p>
    </div>
  )
}
