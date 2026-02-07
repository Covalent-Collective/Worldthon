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

/** Mock user contribution entries — each row = one user's contribution */
interface ContributionRow {
  nickname: string
  label: string
  timeAgo: string
  images: string[]
}

const MOCK_CONTRIBUTIONS: ContributionRow[] = [
  { nickname: '졸린 호랑이', label: 'VC 미팅 후기', timeAgo: '23분 전', images: [
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=200&h=280&fit=crop',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=200&h=280&fit=crop',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200&h=280&fit=crop',
  ]},
  { nickname: '배고픈 판다', label: '데모데이 발표 준비', timeAgo: '1시간 전', images: [
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&h=280&fit=crop',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=280&fit=crop',
  ]},
  { nickname: '용감한 수달', label: 'IR 덱 피드백 정리', timeAgo: '3시간 전', images: [
    'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=200&h=280&fit=crop',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=200&h=280&fit=crop',
    'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=200&h=280&fit=crop',
    'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=200&h=280&fit=crop',
  ]},
  { nickname: '느긋한 거북이', label: '팀 회고 미팅 기록', timeAgo: '1일 전', images: [
    'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=200&h=280&fit=crop',
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200&h=280&fit=crop',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&h=280&fit=crop',
  ]},
  { nickname: '신나는 토끼', label: '사용자 인터뷰 요약', timeAgo: '1일 전', images: [
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=200&h=280&fit=crop',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=200&h=280&fit=crop',
  ]},
  { nickname: '꼼꼼한 다람쥐', label: '경쟁사 분석 노트', timeAgo: '2일 전', images: [
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=200&h=280&fit=crop',
    'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=200&h=280&fit=crop',
    'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=200&h=280&fit=crop',
  ]},
  { nickname: '현명한 부엉이', label: '제품 로드맵 초안', timeAgo: '3일 전', images: [
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=200&h=280&fit=crop',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=200&h=280&fit=crop',
  ]},
  { nickname: '배고픈 판다', label: '투자자 Q&A 정리', timeAgo: '5일 전', images: [
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200&h=280&fit=crop',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&h=280&fit=crop',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=280&fit=crop',
  ]},
  { nickname: '졸린 호랑이', label: '온보딩 플로우 개선', timeAgo: '6일 전', images: [
    'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=200&h=280&fit=crop',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=200&h=280&fit=crop',
  ]},
  { nickname: '용감한 수달', label: '공동창업자 역할 분담', timeAgo: '8일 전', images: [
    'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=200&h=280&fit=crop',
    'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=200&h=280&fit=crop',
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200&h=280&fit=crop',
  ]},
]

export default function RepositoryDetailPage() {
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
        <p className="text-arctic/50">저장소를 찾을 수 없습니다</p>
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

        {/* 2. Repository Stats Row */}
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

        {/* 4. Contribution Archive — one row per user */}
        <motion.div variants={item} className="px-5 pb-4 space-y-4">
          {MOCK_CONTRIBUTIONS.map((row, ri) => (
            <div key={`${row.nickname}-${ri}`}>
              {/* Nickname header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-arctic">{row.nickname}</span>
                  <span className="text-[11px] text-arctic/40 truncate">{row.label}</span>
                </div>
                <span className="text-[10px] text-arctic/30 font-mono flex-shrink-0">{row.timeAgo}</span>
              </div>
              {/* Image cards */}
              <div className="flex gap-[3px] overflow-x-auto scrollbar-hide">
                {row.images.map((url, idx) => {
                  const isFirst = idx === 0
                  const isLast = idx === row.images.length - 1
                  const roundedClass = isFirst
                    ? 'rounded-l-2xl'
                    : isLast
                      ? 'rounded-r-2xl'
                      : ''

                  return (
                    <div
                      key={idx}
                      className={`relative flex-shrink-0 w-[72px] aspect-[5/7] overflow-hidden ${roundedClass}`}
                    >
                      <img
                        src={url}
                        alt={row.label}
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
