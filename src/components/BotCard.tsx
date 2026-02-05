'use client'

import Link from 'next/link'
import { Card, CardContent } from './ui/Card'
import { Button } from './ui/Button'
import type { ExpertBot } from '@/lib/types'

interface BotCardProps {
  bot: ExpertBot
}

export function BotCard({ bot }: BotCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="text-4xl">{bot.icon}</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 truncate">
              {bot.name}
            </h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {bot.description}
            </p>
            <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
              <span className="inline-flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                {bot.nodeCount} 노드
              </span>
              <span className="inline-flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                {bot.contributorCount} 기여자
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Link href={`/explore/${bot.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              탐색하기
            </Button>
          </Link>
          <Link href={`/contribute/${bot.id}`} className="flex-1">
            <Button variant="default" size="sm" className="w-full">
              기여하기
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
