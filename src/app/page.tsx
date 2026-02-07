'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useBotsStore } from '@/stores/botsStore'
import { BottomNav } from '@/components/BottomNav'
import { JournalingHome } from '@/components/JournalingHome'
import { AuroraBackground } from '@/components/AuroraBackground'
import { AuthGuard } from '@/components/AuthGuard'

export default function LandingPage() {
  const { walletAddress } = useAuthStore()
  const { loadBots } = useBotsStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    loadBots()
    setMounted(true)
  }, [loadBots])

  if (!mounted) {
    return null
  }

  return (
    <AuthGuard>
      <AuroraBackground className="h-screen pb-20">
        {/* Wallet address badge in the top-right area */}
        {walletAddress && (
          <div className="absolute top-4 right-4 z-20">
            <div className="glass-card rounded-full px-3 py-1.5 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-[10px] text-arctic/70 font-mono">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
            </div>
          </div>
        )}
        <JournalingHome />
        <BottomNav active="home" />
      </AuroraBackground>
    </AuthGuard>
  )
}
