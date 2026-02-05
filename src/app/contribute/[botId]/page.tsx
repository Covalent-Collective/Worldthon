'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getBotById } from '@/lib/mock-data'
import { useUserStore } from '@/stores/userStore'
import { VerifyButton } from '@/components/VerifyButton'

export default function ContributePage() {
  const params = useParams()
  const router = useRouter()
  const botId = params.botId as string
  const bot = getBotById(botId)

  const { isVerified, addContribution } = useUserStore()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  if (!bot) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">봇을 찾을 수 없습니다</p>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim() || content.length < 20) return

    setIsSubmitting(true)

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Add to store
    addContribution(botId, {
      id: `node-${Date.now()}`,
      label: title,
      content,
      contributor: '0xnew...anon',
      createdAt: new Date().toISOString().split('T')[0],
      citationCount: 0
    })

    setIsSubmitting(false)
    setShowSuccess(true)
  }

  if (showSuccess) {
    return (
      <main className="min-h-screen fixed inset-0 flex flex-col items-center justify-center px-6 bg-black/90 z-50 animate-fade-in">
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
              <span className="text-2xl">
                {['🎉', '✨', '🌟', '💫', '🎊'][Math.floor(Math.random() * 5)]}
              </span>
            </div>
          ))}
        </div>

        {/* Success content card */}
        <div className="relative bg-white rounded-3xl p-8 mx-4 max-w-sm w-full text-center space-y-6 animate-scale-in shadow-2xl">
          {/* Celebration emoji */}
          <div className="text-6xl animate-bounce">
            🎉
          </div>

          {/* Success message */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">지식이 추가되었습니다!</h1>
            <p className="text-gray-500 text-sm">
              당신의 지식이 Seed Vault에<br />영구 보존됩니다
            </p>
          </div>

          {/* Added node preview */}
          <div className="bg-gray-50 rounded-xl p-4 text-left">
            <p className="text-xs text-gray-400 mb-1">추가된 노드</p>
            <p className="font-medium text-gray-800 truncate">{title}</p>
          </div>

          {/* Contribution Power indicator */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 px-5 py-3 rounded-full text-sm font-bold animate-pulse border border-green-200">
            <span className="text-lg">⚡</span>
            +5 Contribution Power
          </div>

          <p className="text-gray-400 text-xs">
            다른 사용자가 인용할 때마다 WLD를 받게 됩니다
          </p>

          {/* Confirm button */}
          <button
            onClick={() => router.push('/')}
            className="w-full py-4 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-all active:scale-95"
          >
            확인
          </button>
        </div>

        {/* Custom keyframe animations */}
        <style jsx>{`
          @keyframes fade-in {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          @keyframes scale-in {
            from {
              opacity: 0;
              transform: scale(0.8) translateY(20px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
          @keyframes confetti {
            0% {
              transform: translateY(-100%) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(100vh) rotate(720deg);
              opacity: 0;
            }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
          }
          .animate-scale-in {
            animation: scale-in 0.4s ease-out 0.1s forwards;
            opacity: 0;
          }
          .animate-confetti {
            animation: confetti 3s ease-in-out infinite;
          }
        `}</style>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="flex items-center gap-3 p-4 border-b border-gray-100">
        <Link href="/" className="p-1">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="font-semibold">지식 기여하기</h1>
      </header>

      <div className="flex-1 p-4 space-y-6">
        {/* Step 1: Verification */}
        <div className={`rounded-xl p-4 ${isVerified ? 'bg-green-50' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-3">
            {isVerified ? (
              <>
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-green-800">본인 인증 완료</p>
                  <p className="text-sm text-green-600">World ID Orb로 인증됨</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-white text-xs">
                  1
                </div>
                <div className="flex-1">
                  <p className="font-medium">Step 1: 본인 인증</p>
                  <p className="text-sm text-gray-500">World ID Orb 인증이 필요합니다</p>
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
            <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center text-white text-xs">
              2
            </div>
            <p className="font-medium">지식 입력</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">제목</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="예: 망리단길 숨은 카페"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-black transition-colors"
                disabled={!isVerified}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">내용</label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value.slice(0, 2000))}
                placeholder="당신만 아는 지식을 공유해주세요... (최소 20자)"
                rows={6}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-black transition-colors resize-none"
                disabled={!isVerified}
              />
              <p className="text-xs text-gray-400 text-right">{content.length}/2000</p>
            </div>

            <button
              type="submit"
              disabled={!isVerified || !title.trim() || content.length < 20 || isSubmitting}
              className="w-full py-4 bg-black text-white rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
            >
              {isSubmitting ? '추가 중...' : '지식 노드 추가하기'}
            </button>
          </form>
        </div>

        {/* Bot Info */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{bot.icon}</span>
            <div>
              <p className="font-medium">{bot.name}</p>
              <p className="text-sm text-gray-500">{bot.nodeCount} 노드 • {bot.contributorCount} 기여자</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
