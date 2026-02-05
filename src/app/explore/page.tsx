'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { expertBots } from '@/lib/mock-data'
import { BottomNav } from '@/components/BottomNav'

// Group bots by category
const categories = expertBots.reduce((acc, bot) => {
  if (!acc[bot.category]) {
    acc[bot.category] = []
  }
  acc[bot.category].push(bot)
  return acc
}, {} as Record<string, typeof expertBots>)

// Get trending bot (most nodes)
const trendingBot = expertBots.reduce((prev, current) =>
  (prev.nodeCount > current.nodeCount) ? prev : current
)

export default function ExplorePage() {
  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-night via-permafrost to-night">
      <div className="flex-1 overflow-auto scrollbar-hide">
        {/* Header */}
        <div className="px-5 pt-6 pb-4">
          <h1 className="text-2xl font-bold text-arctic tracking-tight">Explorer</h1>
          <p className="text-arctic/50 text-sm mt-1 font-mono">
            KNOWLEDGE ARCHIVE | {expertBots.length} VAULTS
          </p>
        </div>

        {/* Trending Bot - Featured Card */}
        <section className="px-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-aurora-cyan animate-pulse" />
            <span className="text-xs text-aurora-cyan font-mono tracking-wider">TRENDING NOW</span>
          </div>
          <Link href={`/explore/${trendingBot.id}`}>
            <ExplorerCard bot={trendingBot} featured />
          </Link>
        </section>

        {/* Category Carousels */}
        {Object.entries(categories).map(([category, bots]) => (
          <CategoryCarousel key={category} category={category} bots={bots} />
        ))}

        {/* Bottom Spacing */}
        <div className="h-4" />
      </div>
      <BottomNav active="explore" />
    </main>
  )
}

function CategoryCarousel({ category, bots }: { category: string; bots: typeof expertBots }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <section className="mb-6">
      {/* Category Header */}
      <div className="px-5 flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-aurora-violet rounded-full" />
          <span className="text-sm font-semibold text-arctic">{category}</span>
          <span className="text-xs text-arctic/30 font-mono">({bots.length})</span>
        </div>
      </div>

      {/* Horizontal Scroll */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide px-5 pb-2"
      >
        {bots.map((bot) => (
          <Link
            key={bot.id}
            href={`/explore/${bot.id}`}
            className="flex-shrink-0"
          >
            <ExplorerCard bot={bot} />
          </Link>
        ))}
      </div>
    </section>
  )
}

function ExplorerCard({ bot, featured = false }: { bot: typeof expertBots[0]; featured?: boolean }) {
  return (
    <div className={`${featured ? 'w-full' : 'w-[280px]'} group`}>
      <div className={`glass-card rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-card-hover group-hover:-translate-y-1 ${
        featured ? '' : 'h-[380px] flex flex-col'
      }`}>
        {/* Profile Image Placeholder */}
        <div className={`relative ${featured ? 'h-48' : 'h-44'} bg-gradient-to-br from-aurora-cyan/20 via-aurora-violet/20 to-aurora-blue/20 flex-shrink-0`}>
          {/* Decorative circles */}
          <div className="absolute top-4 left-4 w-12 h-12 rounded-full bg-aurora-cyan/10 blur-xl" />
          <div className="absolute bottom-8 right-4 w-16 h-16 rounded-full bg-aurora-violet/10 blur-xl" />

          {/* Profile placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`${featured ? 'w-24 h-24' : 'w-20 h-20'} rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border-2 border-white/20 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <span className={`${featured ? 'text-4xl' : 'text-3xl'} font-bold text-arctic/80`}>{bot.icon}</span>
            </div>
          </div>

          {/* Gradient overlay */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-permafrost to-transparent" />

          {/* Category badge */}
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm text-[10px] text-arctic/80 border border-white/10 font-medium">
              {bot.category}
            </span>
          </div>

          {/* Serial Number */}
          <div className="absolute top-3 left-3">
            <span className="px-2 py-0.5 rounded bg-black/20 backdrop-blur-sm text-[9px] text-arctic/50 font-mono">
              VAULT-{bot.id.slice(0, 3).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-4 flex flex-col flex-1">
          <div className="flex-1">
            <h3 className={`font-bold text-arctic ${featured ? 'text-xl' : 'text-lg'}`}>{bot.name}</h3>
            <p className={`text-arctic/60 mt-1.5 line-clamp-2 leading-relaxed ${featured ? 'text-sm' : 'text-xs'}`}>
              {bot.description}
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 py-3 border-t border-white/5 mt-3">
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-aurora-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="3" strokeWidth={2} />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v2m0 16v2M2 12h2m16 0h2" />
              </svg>
              <span className="text-sm text-arctic/70 font-mono">{bot.nodeCount}</span>
              <span className="text-[10px] text-arctic/40">nodes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-aurora-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm text-arctic/70 font-mono">{bot.contributorCount}</span>
              <span className="text-[10px] text-arctic/40">contributors</span>
            </div>
          </div>

          {/* Action Button */}
          <button className={`w-full py-2.5 rounded-xl bg-gradient-to-r from-aurora-cyan to-aurora-violet text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity ${
            featured ? 'py-3' : ''
          }`}>
            탐색하기
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
