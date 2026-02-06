'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { expertBots } from '@/lib/mock-data'

interface CarouselProps {
  bots: typeof expertBots
}

function Carousel3D({ bots }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(Math.floor(bots.length / 2))
  const autoTimerRef = useRef<NodeJS.Timeout | null>(null)
  const touchStartX = useRef(0)
  const touchDeltaX = useRef(0)

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % bots.length)
  }, [bots.length])

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + bots.length) % bots.length)
  }, [bots.length])

  // Reset auto-rotate on interaction
  const resetAutoRotate = useCallback(() => {
    if (autoTimerRef.current) clearInterval(autoTimerRef.current)
    autoTimerRef.current = setInterval(handleNext, 5000)
  }, [handleNext])

  // Auto-rotate
  useEffect(() => {
    autoTimerRef.current = setInterval(handleNext, 5000)
    return () => { if (autoTimerRef.current) clearInterval(autoTimerRef.current) }
  }, [handleNext])

  // Touch swipe
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchDeltaX.current = 0
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current
  }, [])

  const onTouchEnd = useCallback(() => {
    const threshold = 40
    if (touchDeltaX.current > threshold) {
      handlePrev()
      resetAutoRotate()
    } else if (touchDeltaX.current < -threshold) {
      handleNext()
      resetAutoRotate()
    }
    touchDeltaX.current = 0
  }, [handlePrev, handleNext, resetAutoRotate])

  // Click side card to navigate
  const handleCardClick = useCallback((pos: number) => {
    if (pos === 0) return
    if (pos < 0) handlePrev()
    if (pos > 0) handleNext()
    resetAutoRotate()
  }, [handlePrev, handleNext, resetAutoRotate])

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center">
      {/* Cards area */}
      <div
        className="relative w-full flex-1 flex items-center justify-center"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="relative w-full h-[400px] flex items-center justify-center" style={{ perspective: '1000px' }}>
          {bots.map((bot, index) => {
            const offset = index - currentIndex
            const total = bots.length
            let pos = (offset + total) % total
            if (pos > Math.floor(total / 2)) {
              pos = pos - total
            }

            const isCenter = pos === 0
            const isAdjacent = Math.abs(pos) === 1
            const isVisible = Math.abs(pos) <= 2

            return (
              <div
                key={bot.id}
                className={`absolute w-64 h-[400px] transition-all duration-500 ease-out ${
                  !isCenter && isAdjacent ? 'cursor-pointer' : ''
                }`}
                style={{
                  transform: `
                    translateX(${pos * 55}%)
                    scale(${isCenter ? 1 : isAdjacent ? 0.85 : 0.7})
                    rotateY(${pos * -8}deg)
                  `,
                  zIndex: isCenter ? 20 : isAdjacent ? 10 : 1,
                  opacity: isCenter ? 1 : isAdjacent ? 0.5 : 0.2,
                  filter: isCenter ? 'blur(0px)' : isAdjacent ? 'blur(2px)' : 'blur(4px)',
                  visibility: isVisible ? 'visible' : 'hidden',
                  pointerEvents: isCenter || isAdjacent ? 'auto' : 'none',
                }}
                onClick={() => handleCardClick(pos)}
              >
                <BotCard bot={bot} isCenter={isCenter} />
              </div>
            )
          })}
        </div>
      </div>

      {/* Dots - below cards */}
      <div className="flex gap-2 py-4 flex-shrink-0">
        {bots.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'w-8 bg-aurora-cyan'
                : 'w-1.5 bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

function BotCard({ bot, isCenter }: { bot: typeof expertBots[0]; isCenter: boolean }) {
  return (
    <div className={`w-full h-full rounded-2xl overflow-hidden border transition-all duration-500 flex flex-col ${
      isCenter
        ? 'border-aurora-cyan/30 shadow-[0_0_60px_rgba(0,242,255,0.2)]'
        : 'border-white/10'
    } ${isCenter ? 'bg-[#0d0d1a]' : 'bg-permafrost/90 backdrop-blur-xl'}`}>

      {/* Photo — 4 parts */}
      <div className="relative flex-[4] min-h-0 overflow-hidden">
        {bot.profileImage ? (
          <img src={bot.profileImage} alt={bot.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-aurora-cyan/20 via-aurora-violet/20 to-aurora-purple/20 flex items-center justify-center">
            <span className="text-5xl">{bot.icon}</span>
          </div>
        )}
        <span className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-medium ${
          isCenter ? 'bg-black/60 text-arctic/90' : 'bg-black/40 text-arctic/70'
        }`}>
          {bot.category}
        </span>
        <div className={`absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t ${
          isCenter ? 'from-[#0d0d1a]' : 'from-permafrost/90'
        } to-transparent`} />
      </div>

      {/* Info */}
      <div className="px-4 pt-2 pb-1 flex flex-col gap-0.5">
        <h3 className="text-base font-bold text-arctic leading-tight">{bot.name}</h3>
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className="text-aurora-cyan">{bot.nodeCount} nodes</span>
          <span className="text-white/20">|</span>
          <span className="text-aurora-violet">{bot.contributorCount} contributors</span>
        </div>
      </div>

      {/* Button */}
      <div className="px-4 pb-3 pt-1 flex items-center">
        <Link href={`/explore/${bot.id}`} className="block w-full">
          <div className="glass-btn-wrap rounded-xl w-full">
            <div className="glass-btn rounded-xl w-full">
              <span className="glass-btn-text block py-2.5 text-center text-sm font-medium">
                탐색하기
              </span>
            </div>
            <div className="glass-btn-shadow rounded-xl" />
          </div>
        </Link>
      </div>
    </div>
  )
}

export { Carousel3D }
