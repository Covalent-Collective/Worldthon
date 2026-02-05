'use client'

import Link from 'next/link'
import { expertBots } from '@/lib/mock-data'
import { BottomNav } from '@/components/BottomNav'

export default function ExplorePage() {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1 overflow-auto scrollbar-hide">
        <div className="p-4 space-y-5">
          {/* Header */}
          <div className="pt-2">
            <h1 className="text-xl font-bold text-arctic">지식 탐색</h1>
            <p className="text-arctic/50 text-sm mt-1">
              전문가 봇의 지식 그래프를 탐색하세요
            </p>
          </div>

          {/* Bot List */}
          <div className="space-y-3">
            {expertBots.map((bot, index) => (
              <Link
                key={bot.id}
                href={`/explore/${bot.id}`}
                className="block glass-card rounded-2xl p-4 transition-all duration-300 hover:shadow-card-hover animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex gap-4 items-center">
                  <div className="text-4xl">{bot.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base text-arctic">{bot.name}</h3>
                    <p className="text-arctic/50 text-sm truncate">{bot.description}</p>
                    <p className="text-arctic/40 text-xs mt-1.5 font-mono">
                      {bot.nodeCount} 노드 • {bot.contributorCount} 기여자
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-arctic/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <BottomNav active="explore" />
    </main>
  )
}
