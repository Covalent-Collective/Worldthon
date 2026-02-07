'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { BottomNav } from '@/components/BottomNav'
import { AuroraBackground } from '@/components/AuroraBackground'
import { useBotsStore } from '@/stores/botsStore'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
}

export default function RepositoryPage() {
  const { bots, loadBots, isLoaded } = useBotsStore()

  useEffect(() => {
    loadBots()
  }, [loadBots])

  return (
    <AuroraBackground className="min-h-screen pb-20">
      {/* Header */}
      <header className="px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-arctic tracking-tight">Repository</h1>
        <p className="text-arctic/50 text-sm mt-1 font-mono">COLLECTIVE INTELLIGENCE</p>
      </header>

      <div className="flex-1 px-5">
        {!isLoaded ? (
          <div className="flex items-center justify-center py-20">
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
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {bots.map((bot) => (
              <motion.div key={bot.id} variants={item}>
                <Link
                  href={`/community/${bot.id}`}
                  className="glass-card rounded-2xl p-4 flex items-center gap-3 hover:bg-white/[0.06] transition-colors block"
                >
                  {bot.profileImage ? (
                    <img
                      src={bot.profileImage}
                      alt={bot.name}
                      className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-xl flex-shrink-0">
                      {bot.icon}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-semibold text-arctic truncate">
                        {bot.name}
                      </h2>
                      <span className="text-[10px] font-mono text-aurora-cyan/60 bg-aurora-cyan/10 px-1.5 py-0.5 rounded-full flex-shrink-0">
                        {bot.nodeCount} nodes
                      </span>
                    </div>
                    <p className="text-xs text-arctic/50 mt-0.5 line-clamp-1">
                      {bot.description}
                    </p>
                  </div>
                  <svg
                    className="w-4 h-4 text-arctic/30 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <BottomNav active="explore" />
    </AuroraBackground>
  )
}
