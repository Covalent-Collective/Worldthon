'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { keccak256, toHex } from 'viem'
import { useBotsStore } from '@/stores/botsStore'
import { useUserStore } from '@/stores/userStore'
import { useAuthStore } from '@/stores/authStore'
import { useKnowledgeStore } from '@/stores/knowledgeStore'
import { VerifyButton } from '@/components/VerifyButton'
import { recordContributionOnChain, isContractConfigured, type WorldIdProof } from '@/lib/contract'
import { commitToSegment } from '@/lib/zk-segments'
import type { KnowledgeNode } from '@/lib/types'

export default function ContributePage() {
  const params = useParams()
  const router = useRouter()
  const botId = params.botId as string

  const { getBotById: getStoreBotById, loadBots, isLoaded } = useBotsStore()

  useEffect(() => { loadBots() }, [loadBots])

  const bot = getStoreBotById(botId)

  const { isVerified, verificationLevel, nullifierHash, addContribution } = useUserStore()
  const { isAuthenticated } = useAuthStore()
  const isUserVerified = isAuthenticated || isVerified
  const { addNode, getContributionCount } = useKnowledgeStore()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [onChainRecorded, setOnChainRecorded] = useState(false)

  // Determine if contributions are allowed (Orb only)
  const isDeviceOnly = isUserVerified && verificationLevel === 'device'
  const canContribute = isUserVerified && !isDeviceOnly

  // Get current contribution count for this bot
  const contributionCount = getContributionCount(botId)

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-aurora-cyan rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-aurora-cyan rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-aurora-cyan rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    )
  }

  if (!bot) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-arctic/50">봇을 찾을 수 없습니다</p>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim() || content.length < 20) return

    setIsSubmitting(true)

    try {
      // Add contribution via userStore (handles both Supabase and local modes)
      const nodeId = await addContribution(botId, title, content)

      // Also add to knowledge store for local graph display
      const newNode: KnowledgeNode = {
        id: nodeId,
        label: title,
        content,
        contributor: nullifierHash || '0xnew...anon',
        createdAt: new Date().toISOString().split('T')[0],
        citationCount: 0
      }
      addNode(botId, newNode)

      // On-chain recording (fire-and-forget, supplementary to DB)
      // Real proof verification is handled server-side; the relayer pattern
      // now records on-chain via /api/contribute. This client-side path uses
      // placeholder proof values and only runs if MiniKit + contract are available.
      if (isContractConfigured()) {
        const contentHash = keccak256(toHex(content))
        const placeholderProof: WorldIdProof = {
          signal: '0x0000000000000000000000000000000000000000',
          root: BigInt(0),
          nullifierHash: BigInt(0),
          proof: Array(8).fill(BigInt(0)),
        }
        recordContributionOnChain(contentHash, botId, placeholderProof)
          .then((result) => {
            if (result) {
              console.log('[ON-CHAIN] Contribution tx:', result.transactionId)
              setOnChainRecorded(true)
            }
          })
          .catch(() => {
            // On-chain recording failure is non-fatal; DB record is the source of truth
          })
      }

      // ZK 세그먼트 등록 (fire-and-forget, 기존 플로우 차단 안 함)
      // Enroll user in the category's ZK segment for privacy-preserving matching
      if (nullifierHash && bot.category) {
        commitToSegment(nullifierHash, bot.category)
          .then((result) => {
            if (result) {
              console.log('[ZK-SEGMENT] Committed to segment, tx:', result.transactionId)
            }
          })
          .catch(() => {
            // ZK 세그먼트 등록 실패는 무시 - 핵심 기능이 아님
          })
      }

      setShowSuccess(true)
    } catch (error) {
      console.error('Failed to add contribution:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (showSuccess) {
    return (
      <main className="min-h-screen fixed inset-0 flex flex-col items-center justify-center px-6 z-50 animate-fade-in">
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-permafrost/95 backdrop-blur-sm" />

        {/* Confetti particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              <div className={`w-2 h-2 rounded-full ${
                ['bg-aurora-cyan', 'bg-aurora-violet', 'bg-green-400', 'bg-sky-400', 'bg-yellow-400'][Math.floor(Math.random() * 5)]
              }`} />
            </div>
          ))}
        </div>

        {/* Success content card */}
        <div className="relative glass-card rounded-3xl p-8 mx-4 max-w-sm w-full text-center space-y-6 animate-scale-in">
          {/* Success icon */}
          <div className="relative">
            <div className="absolute inset-0 bg-aurora-cyan/20 blur-3xl rounded-full animate-pulse-glow" />
            <div className="relative w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-aurora-cyan to-aurora-violet flex items-center justify-center animate-bounce-subtle">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Success message */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-arctic">지식이 추가되었습니다!</h1>
            <p className="text-arctic/60 text-sm">
              당신의 지식이 NOAH에<br />영구 보존됩니다
            </p>
          </div>

          {/* Added node preview */}
          <div className="glass rounded-xl p-4 text-left">
            <p className="text-xs text-arctic/40 mb-1">추가된 노드</p>
            <p className="font-medium text-arctic truncate">{title}</p>
          </div>

          {/* Contribution Power indicator */}
          <div className="inline-flex items-center gap-2 bg-aurora-cyan/10 text-aurora-cyan px-5 py-3 rounded-full text-sm font-bold animate-pulse-glow border border-aurora-cyan/30">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            +5 Contribution Power
          </div>

          {/* On-chain confirmation badge */}
          {onChainRecorded && (
            <div className="inline-flex items-center gap-1.5 bg-green-500/10 text-green-400 px-3 py-1.5 rounded-full text-xs font-medium border border-green-500/20">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.172 13.828a4 4 0 015.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" />
              </svg>
              On-chain
            </div>
          )}

          <p className="text-arctic/40 text-xs">
            다른 사용자가 인용할 때마다 WLD를 받게 됩니다
          </p>

          {/* Action buttons */}
          <div className="space-y-2">
            <button
              onClick={() => router.push(`/explore/${botId}`)}
              className="w-full btn-primary rounded-full"
            >
              그래프에서 보기
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full py-3 text-arctic/50 font-medium hover:text-arctic transition-all"
            >
              홈으로
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="glass-dark flex items-center gap-3 p-4">
        <Link href="/" className="p-1 text-arctic/70 hover:text-arctic transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="font-semibold text-arctic">지식 기여하기</h1>
      </header>

      <div className="flex-1 p-4 space-y-6">
        {/* Step 1: Verification */}
        <div className={`glass rounded-xl p-4 ${isUserVerified && verificationLevel === 'orb' ? 'border border-green-500/30' : isUserVerified && verificationLevel === 'device' ? 'border border-amber-500/30' : ''}`}>
          <div className="flex items-center gap-3">
            {isUserVerified ? (
              <>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${verificationLevel === 'orb' ? 'bg-green-500 shadow-glow-green' : 'bg-amber-500'}`}>
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  {verificationLevel === 'orb' ? (
                    <>
                      <p className="font-medium text-green-400">본인 인증 완료</p>
                      <p className="text-sm text-green-400/70">World ID Orb로 인증됨</p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium text-amber-400">Device 인증</p>
                      <p className="text-sm text-amber-400/70">기여하려면 Orb 인증이 필요합니다</p>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-arctic text-xs font-bold">
                  1
                </div>
                <div className="flex-1">
                  <p className="font-medium text-arctic">Step 1: 본인 인증</p>
                  <p className="text-sm text-arctic/50">World ID Orb 인증이 필요합니다</p>
                </div>
              </>
            )}
          </div>

          {!isUserVerified && (
            <div className="mt-4">
              <VerifyButton />
            </div>
          )}
        </div>

        {/* Device-only verification warning */}
        {isDeviceOnly && (
          <div className="glass rounded-xl p-4 border border-amber-500/30 bg-amber-500/5">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="space-y-2">
                <p className="text-sm font-medium text-amber-400">
                  Orb 인증이 필요합니다
                </p>
                <p className="text-xs text-amber-400/70">
                  Device 인증으로는 지식 기여가 제한됩니다. Orb 인증을 완료하면 기여할 수 있습니다.
                </p>
                <a
                  href="https://worldcoin.org/world-id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-xs text-aurora-cyan underline hover:text-aurora-cyan/80 transition-colors"
                >
                  Orb 인증 방법 알아보기
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Input Form */}
        <div className={`space-y-4 ${!canContribute ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-aurora-cyan rounded-full flex items-center justify-center text-permafrost text-xs font-bold">
              2
            </div>
            <p className="font-medium text-arctic">지식 입력</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-arctic/70">제목</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="예: 망리단길 숨은 카페"
                className="w-full input-dark"
                disabled={!canContribute}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-arctic/70">내용</label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value.slice(0, 2000))}
                placeholder="당신만 아는 지식을 공유해주세요... (최소 20자)"
                rows={6}
                className="w-full textarea-dark"
                disabled={!canContribute}
              />
              <p className="text-xs text-arctic/40 text-right">{content.length}/2000</p>
            </div>

            <button
              type="submit"
              disabled={!canContribute || !title.trim() || content.length < 20 || isSubmitting}
              className="w-full btn-primary rounded-full"
            >
              {isSubmitting ? '추가 중...' : '지식 노드 추가하기'}
            </button>
          </form>
        </div>

        {/* Bot Info */}
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{bot.icon}</span>
            <div>
              <p className="font-medium text-arctic">{bot.name}</p>
              <p className="text-sm text-arctic/50 font-mono">
                {bot.graph.nodes.length + contributionCount} 노드 • {bot.contributorCount} 기여자
                {contributionCount > 0 && (
                  <span className="text-aurora-cyan ml-1">(+{contributionCount} 내 기여)</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
