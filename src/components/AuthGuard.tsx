'use client'

import { type ReactNode, useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { AuthFlow } from '@/components/AuthFlow'
import { AuroraBackground } from '@/components/AuroraBackground'

interface AuthGuardProps {
  children: ReactNode
}

/**
 * Wraps protected pages. Shows the AuthFlow component if the user
 * is not authenticated or hasn't completed the auth steps.
 * Renders children once authentication is complete.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, currentStep } = useAuthStore()
  const [hydrated, setHydrated] = useState(false)

  // Wait for zustand persist hydration to avoid flash of auth screen
  useEffect(() => {
    setHydrated(true)
  }, [])

  if (!hydrated) {
    // Return nothing while hydrating to prevent flash
    return null
  }

  const isFullyAuthenticated = isAuthenticated && currentStep === 'complete'

  if (!isFullyAuthenticated) {
    return (
      <AuroraBackground className="min-h-screen">
        <AuthFlow />
      </AuroraBackground>
    )
  }

  return <>{children}</>
}
