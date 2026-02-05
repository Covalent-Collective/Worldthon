'use client'

import { useEffect, ReactNode } from 'react'
import { initMiniKit } from '@/lib/minikit'

interface MiniKitProviderProps {
  children: ReactNode
}

export function MiniKitProvider({ children }: MiniKitProviderProps) {
  useEffect(() => {
    initMiniKit()
  }, [])

  return <>{children}</>
}
