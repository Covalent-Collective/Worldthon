'use client'

import { ReactNode } from 'react'
import { MiniKitProvider as WorldMiniKitProvider } from '@worldcoin/minikit-js/minikit-provider'

// Re-export useMiniKit hook for convenience
export { useMiniKit } from '@worldcoin/minikit-js/minikit-provider'

interface MiniKitProviderProps {
  children: ReactNode
}

/**
 * Wraps the official MiniKitProvider from @worldcoin/minikit-js.
 * Passes NEXT_PUBLIC_APP_ID as the app_id configuration.
 * The official provider calls MiniKit.install() internally and
 * exposes an isInstalled state via the useMiniKit() hook.
 */
export function MiniKitProvider({ children }: MiniKitProviderProps) {
  const appId = process.env.NEXT_PUBLIC_APP_ID || 'app_staging_xxx'

  return (
    <WorldMiniKitProvider props={{ appId }}>
      {children}
    </WorldMiniKitProvider>
  )
}
