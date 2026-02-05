'use client'

import { useWorldId } from '@/hooks/useWorldId'

interface VerifyButtonProps {
  onVerified?: () => void
}

export function VerifyButton({ onVerified }: VerifyButtonProps) {
  const { isVerified, isVerifying, error, verify, isInWorldApp } = useWorldId()

  const handleClick = async () => {
    const success = await verify()
    if (success && onVerified) {
      onVerified()
    }
  }

  if (isVerified) {
    return (
      <div className="flex items-center gap-2 text-green-400">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-medium">인증 완료</span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleClick}
        disabled={isVerifying}
        className="w-full btn-primary flex items-center justify-center gap-2 rounded-xl"
      >
        <span className="w-5 h-5 bg-permafrost rounded-full flex items-center justify-center">
          <span className="w-2.5 h-2.5 bg-arctic rounded-full" />
        </span>
        {isVerifying ? '인증 중...' : 'World ID로 인증하기'}
      </button>

      {!isInWorldApp && (
        <p className="text-xs text-amber-400/80 text-center">
          World App에서 실행하면 Orb 인증이 가능합니다
        </p>
      )}

      {error && (
        <p className="text-xs text-red-400 text-center">{error}</p>
      )}
    </div>
  )
}
