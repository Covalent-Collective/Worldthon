'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserStore } from '@/stores/userStore'
import { expertBots } from '@/lib/mock-data'
import { VoiceOrb } from '@/components/VoiceOrb'

type RecordingState = 'idle' | 'recording' | 'processing' | 'complete' | 'contributed'

interface ExtractedKeyword {
  text: string
  type: 'emotion' | 'topic' | 'entity'
}

interface RecommendedCommunity {
  id: string
  name: string
  icon: string
  matchScore: number
  reason: string
}

export function JournalingHome() {
  const { nullifierHash, logout } = useUserStore()
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [recordingTime, setRecordingTime] = useState(0)
  const [extractedKeywords, setExtractedKeywords] = useState<ExtractedKeyword[]>([])
  const [recommendedCommunities, setRecommendedCommunities] = useState<RecommendedCommunity[]>([])
  const [selectedVaultIds, setSelectedVaultIds] = useState<Set<string>>(new Set())
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Recording timer
  useEffect(() => {
    if (recordingState === 'recording') {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [recordingState])

  const startRecording = useCallback(() => {
    setRecordingState('recording')
    setRecordingTime(0)
    setExtractedKeywords([])
    setRecommendedCommunities([])
  }, [])

  const stopRecording = useCallback(() => {
    setRecordingState('processing')

    // Simulate AI processing
    setTimeout(() => {
      // Mock extracted keywords
      setExtractedKeywords([
        { text: '도전', type: 'emotion' },
        { text: '창업', type: 'topic' },
        { text: '실패', type: 'emotion' },
        { text: '배움', type: 'topic' },
        { text: '성장', type: 'emotion' },
      ])

      // Mock recommended communities based on "journal content"
      const shuffledBots = [...expertBots].sort(() => Math.random() - 0.5).slice(0, 3)
      setRecommendedCommunities(
        shuffledBots.map((bot, i) => ({
          id: bot.id,
          name: bot.name,
          icon: bot.icon,
          matchScore: 95 - i * 10,
          reason: i === 0 ? '감정 유사도 높음' : i === 1 ? '관심사 일치' : '경험 공유 가능'
        }))
      )

      setRecordingState('complete')
    }, 2000)
  }, [])

  const handleContribute = useCallback(() => {
    setRecordingState('contributed')
  }, [])

  const resetRecording = useCallback(() => {
    setRecordingState('idle')
    setRecordingTime(0)
    setExtractedKeywords([])
    setRecommendedCommunities([])
    setSelectedVaultIds(new Set())
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex-1 flex flex-col relative">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4 z-10 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-arctic tracking-tight">Journal</h1>
          <p className="text-arctic/50 text-sm mt-1 font-mono">RECORD YOUR TRUTH</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-arctic/40 font-mono">{nullifierHash?.slice(0, 10)}...</span>
          <button
            onClick={logout}
            className="p-2 text-arctic/40 hover:text-arctic/70 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <AnimatePresence mode="wait">
          {recordingState !== 'complete' && recordingState !== 'contributed' && (
            <motion.div
              key="orb"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center"
            >
              {recordingState === 'idle' && (
                <p className="text-arctic/60 text-center mb-6 text-sm leading-relaxed">
                  오늘의 이야기를 들려주세요.<br />
                  <span className="text-arctic/40">당신의 경험이 집단지성이 됩니다.</span>
                </p>
              )}

              {recordingState === 'recording' && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-3xl font-digital font-bold text-aurora-cyan tracking-wider">{formatTime(recordingTime)}</span>
                </div>
              )}

              {recordingState === 'processing' && (
                <p className="text-arctic/50 text-sm mb-4">AI가 분석 중입니다...</p>
              )}

              <VoiceOrb
                state={recordingState}
                onTap={recordingState === 'idle' ? startRecording : recordingState === 'recording' ? stopRecording : undefined}
              />

              <p className="text-arctic/40 text-xs mt-6 font-mono">
                {recordingState === 'idle' && 'TAP TO START'}
                {recordingState === 'recording' && 'TAP TO STOP'}
                {recordingState === 'processing' && '키워드 추출 및 커뮤니티 매칭'}
              </p>
            </motion.div>
          )}

          {recordingState === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center w-full max-w-sm"
            >
              {/* Success indicator */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ background: 'linear-gradient(-20deg, #ddd6f3 0%, #faaca8 100%)' }}
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>

              <p className="text-arctic text-lg font-bold mb-1">분석 완료</p>
              <p className="text-arctic/40 text-xs mb-6">{formatTime(recordingTime)} 녹음됨</p>

              {/* Extracted Keywords */}
              <div className="w-full glass-card rounded-3xl p-4 mb-4">
                <p className="text-arctic/60 text-xs mb-3 font-mono">EXTRACTED KEYWORDS</p>
                <div className="flex flex-wrap gap-2">
                  {extractedKeywords.map((keyword, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className={`px-3 py-1 rounded-full text-sm ${
                        keyword.type === 'emotion'
                          ? 'bg-aurora-violet/20 text-aurora-violet border border-aurora-violet/30'
                          : keyword.type === 'topic'
                          ? 'bg-aurora-cyan/20 text-aurora-cyan border border-aurora-cyan/30'
                          : 'bg-aurora-blue/20 text-aurora-blue border border-aurora-blue/30'
                      }`}
                    >
                      {keyword.text}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Recommended Vault */}
              <div className="w-full glass-card rounded-3xl p-4 mb-6">
                <p className="text-arctic/60 text-xs mb-3 font-mono">RECOMMENDED VAULT</p>
                <div className="space-y-2">
                  {recommendedCommunities.map((community, i) => (
                    <motion.button
                      key={community.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.15 }}
                      onClick={() => setSelectedVaultIds(prev => {
                        const next = new Set(prev)
                        if (next.has(community.id)) {
                          next.delete(community.id)
                        } else {
                          next.add(community.id)
                        }
                        return next
                      })}
                      className={`flex items-center gap-3 p-2.5 rounded-xl w-full text-left transition-all ${
                        selectedVaultIds.has(community.id)
                          ? 'bg-white/10 ring-1 ring-aurora-cyan/40'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        selectedVaultIds.has(community.id)
                          ? 'bg-gradient-to-br from-aurora-cyan/30 to-aurora-violet/30'
                          : 'bg-gradient-to-br from-aurora-cyan/20 to-aurora-violet/20'
                      }`}>
                        <span className="text-xl">{community.icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-arctic text-sm font-medium">{community.name}</p>
                        <p className="text-arctic/40 text-xs">{community.reason}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                        selectedVaultIds.has(community.id)
                          ? 'border-aurora-cyan bg-aurora-cyan'
                          : 'border-arctic/20'
                      }`}>
                        {selectedVaultIds.has(community.id) && (
                          <svg className="w-3 h-3 text-permafrost" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 w-full">
                <button onClick={resetRecording} className="flex-1">
                  <div className="glass-btn-wrap rounded-xl w-full">
                    <div className="glass-btn rounded-xl w-full">
                      <span className="glass-btn-text block py-3 text-center text-sm font-medium">
                        다시 녹음
                      </span>
                    </div>
                    <div className="glass-btn-shadow rounded-xl" />
                  </div>
                </button>
                <button
                  onClick={handleContribute}
                  disabled={selectedVaultIds.size === 0}
                  className="flex-1 disabled:opacity-40"
                >
                  <div className="glass-btn-wrap rounded-xl w-full">
                    <div className="glass-btn rounded-xl w-full">
                      <span className="glass-btn-text block py-3 text-center text-sm font-bold">
                        기여하기
                      </span>
                    </div>
                    <div className="glass-btn-shadow rounded-xl" />
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {recordingState === 'contributed' && (
            <motion.div
              key="contributed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center w-full max-w-sm"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                style={{ background: 'linear-gradient(-20deg, #ddd6f3 0%, #faaca8 100%)' }}
              >
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-arctic text-xl font-bold mb-2"
              >
                기여 완료!
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-arctic/50 text-sm mb-2"
              >
                {selectedVaultIds.size}개 Vault에 기여되었습니다.
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-aurora-cyan text-xs font-mono mb-8"
              >
                +{(selectedVaultIds.size * 0.001).toFixed(3)} WLD earned
              </motion.p>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                onClick={resetRecording}
                className="w-full"
              >
                <div className="glass-btn-wrap rounded-xl w-full">
                  <div className="glass-btn rounded-xl w-full">
                    <span className="glass-btn-text block py-3 text-center text-sm font-bold">
                      새로운 기록 시작
                    </span>
                  </div>
                  <div className="glass-btn-shadow rounded-xl" />
                </div>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  )
}
