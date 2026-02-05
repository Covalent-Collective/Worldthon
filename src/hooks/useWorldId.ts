'use client'

import { useState, useCallback } from 'react'
import { verifyHuman, getActionId, isInWorldApp } from '@/lib/minikit'
import { useUserStore } from '@/stores/userStore'

export function useWorldId() {
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isVerified, setVerified, nullifierHash } = useUserStore()

  const verify = useCallback(async () => {
    setIsVerifying(true)
    setError(null)

    try {
      const result = await verifyHuman(getActionId())

      if (result) {
        setVerified(true, result.nullifier_hash)
        return true
      } else {
        setError('인증에 실패했습니다. 다시 시도해주세요.')
        return false
      }
    } catch (err) {
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
    error,
    nullifierHash,
    verify,
    reset,
    isInWorldApp: isInWorldApp()
  }
}
