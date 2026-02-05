'use client'

import { Button } from './ui/Button'
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
      <div className="flex items-center gap-2 text-green-600">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-medium">인증 완료</span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleClick}
        disabled={isVerifying}
        className="w-full bg-gradient-to-r from-gray-900 to-black"
        size="lg"
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" />
        </svg>
        World ID로 인증하기
      </Button>

      {!isInWorldApp && (
        <p className="text-xs text-amber-600 text-center">
          World App에서 실행하면 Orb 인증이 가능합니다
        </p>
      )}

      {error && (
        <p className="text-xs text-red-500 text-center">{error}</p>
      )}
    </div>
  )
}
