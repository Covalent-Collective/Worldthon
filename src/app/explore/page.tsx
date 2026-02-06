'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useBotsStore } from '@/stores/botsStore'
import { BottomNav } from '@/components/BottomNav'
import { Carousel3D } from '@/components/Carousel3D'
import { PaymentModal } from '@/components/PaymentModal'
import { AuroraBackground } from '@/components/AuroraBackground'
import type { ExpertBot } from '@/lib/types'

export default function ExplorePage() {
  const router = useRouter()
  const { bots, isLoading, loadBots } = useBotsStore()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showPayment, setShowPayment] = useState(false)
  const [selectedBot, setSelectedBot] = useState<ExpertBot | null>(null)

  useEffect(() => {
    loadBots()
  }, [loadBots])

  // Get unique categories
  const categories = [...new Set(bots.map(bot => bot.category))]

  // Filter bots by category
  const filteredBots = selectedCategory
    ? bots.filter(bot => bot.category === selectedCategory)
    : bots

  const handleBotSelect = (bot: ExpertBot) => {
    setSelectedBot(bot)
    setShowPayment(true)
  }

  const handlePaymentConfirm = () => {
    setShowPayment(false)
    if (selectedBot) {
      router.push(`/explore/${selectedBot.id}`)
    }
  }

  if (isLoading) {
    return (
      <AuroraBackground className="h-screen pb-20">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-aurora-cyan border-t-transparent rounded-full" />
        </div>
        <BottomNav active="explore" />
      </AuroraBackground>
    )
  }

  return (
    <AuroraBackground className="h-screen pb-20">
      {/* Header */}
      <header className="px-5 pt-6 pb-4 flex-shrink-0">
        <h1 className="text-2xl font-bold text-arctic tracking-tight">Explore</h1>
        <p className="text-arctic/50 text-sm mt-1 font-mono">
          KNOWLEDGE ARCHIVE | {filteredBots.length} VAULTS
        </p>
      </header>

      {/* Category Filter */}
      <div className="px-5 pb-4 flex-shrink-0">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === null
                ? 'bg-gradient-to-r from-aurora-cyan to-aurora-violet text-white'
                : 'glass text-arctic/60 hover:text-arctic'
            }`}
          >
            전체
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-aurora-cyan to-aurora-violet text-white'
                  : 'glass text-arctic/60 hover:text-arctic'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Carousel */}
      <div className="flex-1 flex items-center justify-center">
        <Carousel3D bots={filteredBots} onBotSelect={handleBotSelect} paused={showPayment} />
      </div>

      <BottomNav active="explore" />

      {selectedBot && (
        <PaymentModal
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          onConfirm={handlePaymentConfirm}
          botName={selectedBot.name}
          botIcon={selectedBot.icon}
          storyTitle={`${selectedBot.name} 지식 탐색`}
          wldAmount={0.001}
        />
      )}
    </AuroraBackground>
  )
}
