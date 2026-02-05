'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getBotById } from '@/lib/mock-data'
import { useUserStore } from '@/stores/userStore'
import { useKnowledgeStore } from '@/stores/knowledgeStore'
import { VerifyButton } from '@/components/VerifyButton'
import type { KnowledgeNode } from '@/lib/types'

export default function ContributePage() {
  const params = useParams()
  const router = useRouter()
  const botId = params.botId as string
  const bot = getBotById(botId)

  const { isVerified, nullifierHash, addContribution } = useUserStore()
  const { addNode, getContributionCount } = useKnowledgeStore()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Get current contribution count for this bot
  const contributionCount = getContributionCount(botId)

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
              당신의 지식이 Seed Vault에<br />영구 보존됩니다
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
        <div className={`glass rounded-xl p-4 ${isVerified ? 'border border-green-500/30' : ''}`}>
          <div className="flex items-center gap-3">
            {isVerified ? (
              <>
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-glow-green">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-green-400">본인 인증 완료</p>
                  <p className="text-sm text-green-400/70">World ID Orb로 인증됨</p>
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

          {!isVerified && (
            <div className="mt-4">
              <VerifyButton />
            </div>
          )}
        </div>

        {/* Step 2: Input Form */}
        <div className={`space-y-4 ${!isVerified ? 'opacity-50 pointer-events-none' : ''}`}>
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
                disabled={!isVerified}
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
                disabled={!isVerified}
              />
              <p className="text-xs text-arctic/40 text-right">{content.length}/2000</p>
            </div>

            <button
              type="submit"
              disabled={!isVerified || !title.trim() || content.length < 20 || isSubmitting}
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
