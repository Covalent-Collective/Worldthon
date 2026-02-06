'use client'

import { useState, useCallback } from 'react'
import { verifyWithServer, getActionId, isInWorldApp } from '@/lib/minikit'
import { useUserStore } from '@/stores/userStore'

export function useWorldId() {
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isVerified, verificationLevel, setVerified, nullifierHash } = useUserStore()

  const verify = useCallback(async () => {
    setIsVerifying(true)
    setError(null)

    try {
      const result = await verifyWithServer(getActionId())

      if (result) {
        await setVerified(true, result)
        return true
      } else {
        setError('인증에 실패했습니다. 다시 시도해주세요.')
        return false
      }
    } catch {
      setError('인증 중 오류가 발생했습니다.')
      return false
    } finally {
      setIsVerifying(false)
    }
  }, [setVerified])

  const reset = useCallback(() => {
    setVerified(false)
    setError(null)
  }, [setVerified])

  return {
    isVerified,
    isVerifying,
    verificationLevel,
    error,
    nullifierHash,
    verify,
    reset,
    isInWorldApp: isInWorldApp()
  }
}
