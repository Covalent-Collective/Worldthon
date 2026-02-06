'use client'

import { useState } from 'react'
import { expertBots } from '@/lib/mock-data'
import { BottomNav } from '@/components/BottomNav'
import { Carousel3D } from '@/components/Carousel3D'
import { AuroraBackground } from '@/components/AuroraBackground'

export default function ExplorePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Get unique categories
  const categories = [...new Set(expertBots.map(bot => bot.category))]

  // Filter bots by category
  const filteredBots = selectedCategory
    ? expertBots.filter(bot => bot.category === selectedCategory)
    : expertBots

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
        <Carousel3D bots={filteredBots} />
      </div>

      <BottomNav active="explore" />
    </AuroraBackground>
  )
}
