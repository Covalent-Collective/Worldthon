'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { KnowledgeGraph } from '@/components/KnowledgeGraph'
import { AuroraBackground } from '@/components/AuroraBackground'
import { useBotsStore } from '@/stores/botsStore'
import { useCitationStore } from '@/stores/citationStore'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

/** Mock weekly photo archive data */
interface WeekDay {
  day: string
  imageUrl: string
}

interface WeekData {
  week: number
  dateRange: string
  days: WeekDay[]
}

const MOCK_WEEKS: WeekData[] = [
  {
    week: 1,
    dateRange: 'Jan 6 - Jan 12',
    days: [
      { day: 'Mon', imageUrl: 'https://picsum.photos/seed/w1mon/200/280' },
      { day: 'Tue', imageUrl: 'https://picsum.photos/seed/w1tue/200/280' },
      { day: 'Wed', imageUrl: 'https://picsum.photos/seed/w1wed/200/280' },
      { day: 'Thu', imageUrl: 'https://picsum.photos/seed/w1thu/200/280' },
      { day: 'Fri', imageUrl: 'https://picsum.photos/seed/w1fri/200/280' },
      { day: 'Sat', imageUrl: 'https://picsum.photos/seed/w1sat/200/280' },
      { day: 'Sun', imageUrl: 'https://picsum.photos/seed/w1sun/200/280' },
    ],
  },
  {
    week: 2,
    dateRange: 'Jan 13 - Jan 19',
    days: [
      { day: 'Mon', imageUrl: 'https://picsum.photos/seed/w2mon/200/280' },
      { day: 'Tue', imageUrl: 'https://picsum.photos/seed/w2tue/200/280' },
      { day: 'Wed', imageUrl: 'https://picsum.photos/seed/w2wed/200/280' },
      { day: 'Thu', imageUrl: 'https://picsum.photos/seed/w2thu/200/280' },
      { day: 'Fri', imageUrl: 'https://picsum.photos/seed/w2fri/200/280' },
      { day: 'Sat', imageUrl: 'https://picsum.photos/seed/w2sat/200/280' },
      { day: 'Sun', imageUrl: 'https://picsum.photos/seed/w2sun/200/280' },
    ],
  },
  {
    week: 3,
    dateRange: 'Jan 20 - Jan 26',
    days: [
      { day: 'Mon', imageUrl: 'https://picsum.photos/seed/w3mon/200/280' },
      { day: 'Tue', imageUrl: 'https://picsum.photos/seed/w3tue/200/280' },
      { day: 'Wed', imageUrl: 'https://picsum.photos/seed/w3wed/200/280' },
      { day: 'Thu', imageUrl: 'https://picsum.photos/seed/w3thu/200/280' },
      { day: 'Fri', imageUrl: 'https://picsum.photos/seed/w3fri/200/280' },
      { day: 'Sat', imageUrl: 'https://picsum.photos/seed/w3sat/200/280' },
      { day: 'Sun', imageUrl: 'https://picsum.photos/seed/w3sun/200/280' },
    ],
  },
  {
    week: 4,
    dateRange: 'Jan 27 - Feb 2',
    days: [
      { day: 'Mon', imageUrl: 'https://picsum.photos/seed/w4mon/200/280' },
      { day: 'Tue', imageUrl: 'https://picsum.photos/seed/w4tue/200/280' },
      { day: 'Wed', imageUrl: 'https://picsum.photos/seed/w4wed/200/280' },
      { day: 'Thu', imageUrl: 'https://picsum.photos/seed/w4thu/200/280' },
      { day: 'Fri', imageUrl: 'https://picsum.photos/seed/w4fri/200/280' },
      { day: 'Sat', imageUrl: 'https://picsum.photos/seed/w4sat/200/280' },
      { day: 'Sun', imageUrl: 'https://picsum.photos/seed/w4sun/200/280' },
    ],
  },
]

export default function CommunityDetailPage() {
  const params = useParams()
  const id = params.id as string

  const { getBotById, loadBots, isLoaded } = useBotsStore()
  const getCitationCount = useCitationStore((state) => state.getCitationCount)

  useEffect(() => {
    loadBots()
  }, [loadBots])

  const [graphOpen, setGraphOpen] = useState(false)
  const [publishOpen, setPublishOpen] = useState(false)
  const bot = getBotById(id)

  /** Total citations across all graph nodes */
  const totalCitations = useMemo(() => {
    if (!bot) return 0
    return bot.graph.nodes.reduce(
      (sum, n) => sum + getCitationCount(n.id, n.citationCount),
      0,
    )
  }, [bot, getCitationCount])

  // Loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-night">
        <div className="flex gap-1">
          <div
            className="w-2 h-2 bg-aurora-cyan rounded-full animate-bounce"
            style={{ animationDelay: '0ms' }}
          />
          <div
            className="w-2 h-2 bg-aurora-cyan rounded-full animate-bounce"
            style={{ animationDelay: '150ms' }}
          />
          <div
            className="w-2 h-2 bg-aurora-cyan rounded-full animate-bounce"
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>
    )
  }

  if (!bot) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-night">
        <p className="text-arctic/50">커뮤니티를 찾을 수 없습니다</p>
      </div>
    )
  }

  return (
    <AuroraBackground className="min-h-screen pb-24">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col"
      >
        {/* 1. Header */}
        <motion.header variants={item} className="flex items-center gap-3 px-5 pt-6 pb-4">
          <Link
            href="/dashboard"
            className="p-1 text-arctic/50 hover:text-arctic transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <div className="flex items-center gap-2.5">
            {bot.profileImage ? (
              <img
                src={bot.profileImage}
                alt={bot.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-2xl">
                {bot.icon}
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-arctic tracking-tight">
                {bot.name}
              </h1>
              <span className="inline-block text-[10px] font-mono text-aurora-cyan/80 bg-aurora-cyan/10 px-2 py-0.5 rounded-full mt-0.5">
                {bot.category}
              </span>
            </div>
          </div>
        </motion.header>

        {/* 2. Community Stats Row */}
        <motion.div variants={item} className="px-5 pb-4">
          <div className="grid grid-cols-3 gap-2">
            {/* Members */}
            <div className="glass-card rounded-2xl px-3 py-3 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <svg
                  className="w-3.5 h-3.5 text-aurora-cyan/60"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="text-[10px] text-arctic/50 font-mono">멤버</span>
              </div>
              <span className="text-lg font-digital text-aurora-cyan">
                {bot.contributorCount}
              </span>
            </div>
            {/* Nodes */}
            <div className="glass-card rounded-2xl px-3 py-3 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <svg
                  className="w-3.5 h-3.5 text-aurora-violet/60"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span className="text-[10px] text-arctic/50 font-mono">노드</span>
              </div>
              <span className="text-lg font-digital text-aurora-violet">
                {bot.nodeCount}
              </span>
            </div>
            {/* Citations */}
            <div className="glass-card rounded-2xl px-3 py-3 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <svg
                  className="w-3.5 h-3.5 text-pink-400/60"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                  />
                </svg>
                <span className="text-[10px] text-arctic/50 font-mono">인용</span>
              </div>
              <span className="text-lg font-digital text-pink-400">
                {totalCitations}
              </span>
            </div>
          </div>
        </motion.div>

        {/* 3. Graph View Accordion */}
        <motion.div variants={item} className="px-5 pb-4">
          <button
            onClick={() => setGraphOpen(!graphOpen)}
            className="glass-card rounded-2xl w-full px-4 py-3 flex items-center justify-between hover:bg-white/[0.04] transition-colors"
          >
            <span className="text-arctic/60 text-xs font-mono">GRAPH VIEW</span>
            <svg
              className={`w-4 h-4 text-arctic/40 transition-transform duration-300 ${graphOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <AnimatePresence>
            {graphOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="pt-2">
                  <KnowledgeGraph bot={bot} searchPhase="idle" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 3.5 Publish Bot Accordion */}
        <motion.div variants={item} className="px-5 pb-4">
          <button
            onClick={() => setPublishOpen(!publishOpen)}
            className="glass-card rounded-2xl w-full px-4 py-3 flex items-center justify-between hover:bg-white/[0.04] transition-colors"
          >
            <span className="text-arctic/60 text-xs font-mono">PUBLISH BOT</span>
            <svg
              className={`w-4 h-4 text-arctic/40 transition-transform duration-300 ${publishOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <AnimatePresence>
            {publishOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="pt-3 space-y-4">
                  {/* Publish Status */}
                  <div className="glass-card rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-arctic text-sm font-semibold">v2.4 출봇 투표</span>
                      <span className="text-[10px] font-mono text-amber-400/80 bg-amber-400/10 px-2 py-0.5 rounded-full">
                        진행 중
                      </span>
                    </div>
                    <p className="text-arctic/40 text-xs mb-4">
                      {bot.contributorCount}명의 멤버가 참여할 수 있습니다
                    </p>

                    {/* Vote Bar */}
                    {(() => {
                      const total = bot.contributorCount
                      const agree = Math.round(total * 0.68)
                      const disagree = Math.round(total * 0.18)
                      const pending = total - agree - disagree
                      const agreePercent = Math.round((agree / total) * 100)
                      const disagreePercent = Math.round((disagree / total) * 100)

                      return (
                        <>
                          <div className="h-3 rounded-full overflow-hidden flex bg-white/5">
                            <div
                              className="bg-emerald-400/70 transition-all duration-500"
                              style={{ width: `${agreePercent}%` }}
                            />
                            <div
                              className="bg-rose-400/70 transition-all duration-500"
                              style={{ width: `${disagreePercent}%` }}
                            />
                          </div>

                          {/* Vote Stats */}
                          <div className="flex justify-between mt-3">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full bg-emerald-400/70" />
                              <span className="text-emerald-400/90 text-xs font-mono">
                                찬성 {agree}명
                              </span>
                              <span className="text-arctic/30 text-[10px] font-mono">
                                ({agreePercent}%)
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full bg-rose-400/70" />
                              <span className="text-rose-400/90 text-xs font-mono">
                                반대 {disagree}명
                              </span>
                              <span className="text-arctic/30 text-[10px] font-mono">
                                ({disagreePercent}%)
                              </span>
                            </div>
                          </div>

                          {/* Pending */}
                          <div className="mt-2 flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-white/20" />
                            <span className="text-arctic/40 text-[11px] font-mono">
                              미투표 {pending}명
                            </span>
                          </div>

                          {/* Quorum Info */}
                          <div className="mt-4 pt-3 border-t border-white/5">
                            <div className="flex items-center justify-between text-[10px] font-mono text-arctic/30">
                              <span>정족수: {Math.ceil(total * 0.5)}명 (50%)</span>
                              <span className="text-emerald-400/60">
                                달성 ({agree + disagree}/{Math.ceil(total * 0.5)})
                              </span>
                            </div>
                          </div>

                          {/* Vote Buttons */}
                          <div className="flex gap-2 mt-4">
                            <button className="flex-1 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/30 transition-colors">
                              찬성
                            </button>
                            <button className="flex-1 py-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-semibold hover:bg-rose-500/30 transition-colors">
                              반대
                            </button>
                          </div>
                        </>
                      )
                    })()}
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 4. Weekly Photo Archive */}
        <motion.div variants={item} className="px-5 pb-4 space-y-4">
          {[...MOCK_WEEKS].reverse().map((week) => (
            <div key={week.week}>
              {/* Week Header */}
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-sm font-bold text-arctic">Week {week.week}</span>
                <span className="text-[11px] text-arctic/40 font-mono">{week.dateRange}</span>
              </div>
              {/* Horizontal Scroll Cards */}
              <div className="flex gap-[3px] overflow-x-auto scrollbar-hide">
                {week.days.map((slot, idx) => {
                  const isFirst = idx === 0
                  const isLast = idx === week.days.length - 1
                  const roundedClass = isFirst
                    ? 'rounded-l-2xl'
                    : isLast
                      ? 'rounded-r-2xl'
                      : ''

                  return (
                    <div
                      key={slot.day}
                      className={`relative flex-shrink-0 w-[72px] aspect-[5/7] overflow-hidden ${roundedClass}`}
                    >
                      <img
                        src={slot.imageUrl}
                        alt={slot.day}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </motion.div>

      </motion.div>

    </AuroraBackground>
  )
}
