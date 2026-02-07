'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserStore } from '@/stores/userStore'
import { useAuthStore } from '@/stores/authStore'
import { useBotsStore } from '@/stores/botsStore'
import { VoiceOrb } from '@/components/VoiceOrb'

type RecordingState = 'idle' | 'recording' | 'processing' | 'camera' | 'complete' | 'contributed'

interface ExtractedKeyword {
  text: string
  type: 'emotion' | 'topic' | 'entity'
}

interface RecommendedRepository {
  id: string
  name: string
  icon: string
  matchScore: number
  reason: string
}

/** Mock speech-to-text transcript */
const MOCK_TRANSCRIPT = '매출도 안 나는데 자비를 태워가며 푼돈 벌고, 그 돈으로 클로드 결제하고 멤버들 월급까지 주고 있는 상황이라 고민이 많네. 지금 시점에서 프리 A 투자를 받아야 할지, 받는다면 적정 밸류는 얼마가 좋을지, 혹은 투자를 받음으로써 내가 너무 묶이게 되는 건 아닌지 걱정돼. 특히나 지금 같은 AI 시대에 정말 투자를 받는 게 맞는 방향인지도 의문이고. 다른 사람들은 도대체 어떻게 생각하고 있을까?'

export function JournalingHome() {
  const { nullifierHash } = useUserStore()
  const logout = useAuthStore((s) => s.logout)
  const { bots, loadBots } = useBotsStore()
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [recordingTime, setRecordingTime] = useState(0)
  const [extractedKeywords, setExtractedKeywords] = useState<ExtractedKeyword[]>([])
  const [recommendedRepositories, setRecommendedRepositories] = useState<RecommendedRepository[]>([])
  const [selectedVaultIds, setSelectedVaultIds] = useState<Set<string>>(new Set())
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [typedText, setTypedText] = useState('')
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const typingRef = useRef<NodeJS.Timeout | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    loadBots()
  }, [loadBots])

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

  // Typing animation during recording
  useEffect(() => {
    if (recordingState === 'recording') {
      let charIndex = 0
      setTypedText('')
      typingRef.current = setInterval(() => {
        charIndex++
        if (charIndex <= MOCK_TRANSCRIPT.length) {
          setTypedText(MOCK_TRANSCRIPT.slice(0, charIndex))
          if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
          }
        } else {
          if (typingRef.current) clearInterval(typingRef.current)
        }
      }, 50)
    } else {
      if (typingRef.current) {
        clearInterval(typingRef.current)
      }
    }
    return () => {
      if (typingRef.current) clearInterval(typingRef.current)
    }
  }, [recordingState])

  const startRecording = useCallback(() => {
    setRecordingState('recording')
    setRecordingTime(0)
    setTypedText('')
    setExtractedKeywords([])
    setRecommendedRepositories([])
  }, [])

  const stopRecording = useCallback(() => {
    setRecordingState('processing')

    // Simulate AI processing
    setTimeout(() => {
      setExtractedKeywords([
        { text: '프리A 투자', type: 'topic' },
        { text: '밸류에이션', type: 'entity' },
        { text: '번아웃', type: 'emotion' },
        { text: 'AI 시대', type: 'topic' },
        { text: '부트스트래핑', type: 'entity' },
        { text: '걱정', type: 'emotion' },
      ])

      // Startup-related recommended repositories
      setRecommendedRepositories([
        {
          id: 'startup-mentor',
          name: '스타트업의 기쁨과 슬픔',
          icon: '🚀',
          matchScore: 97,
          reason: '창업·투자 키워드 일치',
        },
        {
          id: 'worldcoin-expert',
          name: 'World Coin 전문가',
          icon: '🌐',
          matchScore: 85,
          reason: 'Web3 투자 연관',
        },
        {
          id: 'seoul-local-guide',
          name: '서울 로컬 가이드',
          icon: '🗺️',
          matchScore: 72,
          reason: '창업 네트워킹 장소',
        },
      ])

      setRecordingState('camera')
    }, 2000)
  }, [bots])

  const handleContribute = useCallback(() => {
    setRecordingState('contributed')
  }, [])

  // Mock BeReal capture - use static image instead of real camera
  const capturePhoto = useCallback(() => {
    setCapturedPhoto('/bereal-mock.png')
    setRecordingState('complete')
  }, [])

  const resetRecording = useCallback(() => {
    setRecordingState('idle')
    setRecordingTime(0)
    setTypedText('')
    setExtractedKeywords([])
    setRecommendedRepositories([])
    setSelectedVaultIds(new Set())
    setCapturedPhoto(null)
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
          {recordingState !== 'camera' && recordingState !== 'complete' && recordingState !== 'contributed' && (
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
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-3xl font-digital font-bold text-aurora-cyan tracking-wider">{formatTime(recordingTime)}</span>
                  </div>
                  {/* Live transcript */}
                  {typedText && (
                    <div
                      ref={scrollRef}
                      className="w-full max-w-sm max-h-[120px] overflow-y-auto scrollbar-hide mb-4 px-1"
                    >
                      <p className="text-arctic/70 text-sm leading-relaxed">
                        {typedText}
                        <span className="inline-block w-[2px] h-[14px] bg-aurora-cyan ml-0.5 animate-pulse align-text-bottom" />
                      </p>
                    </div>
                  )}
                </>
              )}

              {recordingState === 'processing' && (
                <>
                  {typedText && (
                    <div className="w-full max-w-sm max-h-[100px] overflow-y-auto scrollbar-hide mb-3 px-1 opacity-50">
                      <p className="text-arctic/50 text-xs leading-relaxed">{typedText}</p>
                    </div>
                  )}
                  <p className="text-arctic/50 text-sm mb-4">AI가 분석 중입니다...</p>
                </>
              )}

              <VoiceOrb
                state={recordingState}
                onTap={recordingState === 'idle' ? startRecording : recordingState === 'recording' ? stopRecording : undefined}
              />

              <p className="text-arctic/40 text-xs mt-6 font-mono">
                {recordingState === 'idle' && 'TAP TO START'}
                {recordingState === 'recording' && 'TAP TO STOP'}
                {recordingState === 'processing' && '키워드 추출 및 저장소 매칭'}
              </p>
            </motion.div>
          )}

          {recordingState === 'camera' && (
            <motion.div
              key="camera"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center w-full max-w-sm cursor-pointer"
              onClick={capturePhoto}
            >
              {/* BeReal-style mock — tap to capture */}
              <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden border border-aurora-cyan/20 shadow-[0_0_40px_rgba(0,242,255,0.1)]">
                <img
                  src="/bereal-mock.png"
                  alt="BeReal style capture"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-arctic/40 text-xs mt-4 font-mono">TAP TO CAPTURE</p>
            </motion.div>
          )}

          {recordingState === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center w-full max-w-sm overflow-y-auto max-h-[calc(100vh-180px)] scrollbar-hide"
            >
              {/* Hero image with overlaid success indicator */}
              <div className="relative w-3/5 mx-auto aspect-[3/4] rounded-2xl overflow-hidden mb-4 flex-shrink-0">
                <img
                  src={capturedPhoto || '/bereal-mock.png'}
                  alt="Captured moment"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30" />
                {/* Centered checkmark + message */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
                    style={{ background: 'linear-gradient(-20deg, #ddd6f3 0%, #faaca8 100%)' }}
                  >
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                  <p className="text-white text-lg font-bold drop-shadow-lg">분석 완료</p>
                  <p className="text-white/60 text-xs drop-shadow">{formatTime(recordingTime)} 녹음됨</p>
                </div>
              </div>

              {/* Extracted Keywords */}
              <div className="w-full glass-card rounded-3xl p-4 mb-4 flex-shrink-0">
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
              <div className="w-full glass-card rounded-3xl p-4 mb-6 flex-shrink-0">
                <p className="text-arctic/60 text-xs mb-3 font-mono">RECOMMENDED VAULT</p>
                <div className="space-y-2">
                  {recommendedRepositories.map((repository, i) => (
                    <motion.button
                      key={repository.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.15 }}
                      onClick={() => setSelectedVaultIds(prev => {
                        const next = new Set(prev)
                        if (next.has(repository.id)) {
                          next.delete(repository.id)
                        } else {
                          next.add(repository.id)
                        }
                        return next
                      })}
                      className={`flex items-center gap-3 p-2.5 rounded-xl w-full text-left transition-all ${
                        selectedVaultIds.has(repository.id)
                          ? 'bg-white/10 ring-1 ring-aurora-cyan/40'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        selectedVaultIds.has(repository.id)
                          ? 'bg-gradient-to-br from-aurora-cyan/30 to-aurora-violet/30'
                          : 'bg-gradient-to-br from-aurora-cyan/20 to-aurora-violet/20'
                      }`}>
                        <span className="text-xl">{repository.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-arctic text-sm font-medium">{repository.name}</p>
                          {i === 0 && (
                            <span className="px-1.5 py-0.5 rounded-md bg-aurora-violet/20 text-aurora-violet text-[10px] font-medium whitespace-nowrap">
                              참여중
                            </span>
                          )}
                        </div>
                        <p className="text-arctic/40 text-xs">{repository.reason}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                        selectedVaultIds.has(repository.id)
                          ? 'border-aurora-cyan bg-aurora-cyan'
                          : 'border-arctic/20'
                      }`}>
                        {selectedVaultIds.has(repository.id) && (
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
