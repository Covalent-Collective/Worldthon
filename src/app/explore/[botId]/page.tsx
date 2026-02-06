'use client'

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { generateMockAnswer } from '@/lib/mock-data'
import { KnowledgeGraph } from '@/components/KnowledgeGraph'
import { BottomNav } from '@/components/BottomNav'
import { AuroraBackground } from '@/components/AuroraBackground'
import { motion, AnimatePresence } from 'framer-motion'
import { useCitationStore } from '@/stores/citationStore'
import { useKnowledgeStore } from '@/stores/knowledgeStore'
import { useBotsStore } from '@/stores/botsStore'
import type { KnowledgeNode, KnowledgeEdge } from '@/lib/types'

const ADJECTIVES = ['배고픈', '졸린', '용감한', '느긋한', '수줍은', '호기심많은', '씩씩한', '조용한', '활발한', '지혜로운']
const ANIMALS = ['호랑이', '판다', '고양이', '거북이', '여우', '토끼', '부엉이', '돌고래', '펭귄', '다람쥐']

function getAnonymousName(hash: string): string {
  let sum = 0
  for (let i = 0; i < hash.length; i++) sum += hash.charCodeAt(i)
  const adj = ADJECTIVES[sum % ADJECTIVES.length]
  const animal = ANIMALS[(sum * 7) % ANIMALS.length]
  return `${adj} ${animal}`
}

export default function ExplorePage() {
  const params = useParams()
  const botId = params.botId as string

  // Load bots from store
  const { getBotById: getStoreBotById, loadBots, isLoaded } = useBotsStore()

  useEffect(() => { loadBots() }, [loadBots])

  // Get user-contributed nodes from the knowledge store
  const getNodesForBot = useKnowledgeStore((state) => state.getNodesForBot)
  const getEdgesForBot = useKnowledgeStore((state) => state.getEdgesForBot)

  // Merge base bot data with user contributions
  const contributedNodes = getNodesForBot(botId)
  const contributedEdges = getEdgesForBot(botId)
  const bot = useMemo(() => {
    const baseBot = getStoreBotById(botId)
    if (!baseBot) return undefined
    // Merge base nodes with contributed nodes
    const mergedNodes = [...baseBot.graph.nodes, ...contributedNodes]
    const mergedEdges = [...baseBot.graph.edges, ...contributedEdges]
    // Auto-create edges from new nodes to existing nodes if none provided
    const autoEdges: KnowledgeEdge[] = []
    if (contributedEdges.length === 0 && contributedNodes.length > 0) {
      contributedNodes.forEach((newNode, idx) => {
        const existingNodes = [...baseBot.graph.nodes, ...contributedNodes.slice(0, idx)]
        if (existingNodes.length > 0) {
          const targetNode = existingNodes[Math.floor(Math.random() * existingNodes.length)]
          autoEdges.push({
            source: newNode.id,
            target: targetNode.id,
            relationship: '관련'
          })
        }
      })
    }
    return {
      ...baseBot,
      nodeCount: mergedNodes.length,
      graph: {
        nodes: mergedNodes,
        edges: [...mergedEdges, ...autoEdges]
      }
    }
  }, [botId, contributedNodes, contributedEdges, getStoreBotById])


  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState<string | null>(null)
  const [displayedAnswer, setDisplayedAnswer] = useState('')
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([])
  const [recentlyCitedNodes, setRecentlyCitedNodes] = useState<string[]>([])
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [confidence, setConfidence] = useState<number>(0)
  const [matchedTerms, setMatchedTerms] = useState<string[]>([])
  const [searchPhase, setSearchPhase] = useState<'idle' | 'searching' | 'found' | 'complete'>('idle')
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [storyCitationPopup, setStoryCitationPopup] = useState<{ nodeId: string; nodeIndex: number } | null>(null)
  const answerContainerRef = useRef<HTMLDivElement>(null)

  const recordCitation = useCitationStore((state) => state.recordCitation)
  const getCitationCount = useCitationStore((state) => state.getCitationCount)

  // Dismiss citation modal when tapping outside
  useEffect(() => {
    if (!storyCitationPopup) return
    const handleClickOutside = () => setStoryCitationPopup(null)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [storyCitationPopup])

  // Map highlighted node IDs to actual node objects
  const citedNodes = useMemo(() => {
    if (!bot) return []
    return highlightedNodes
      .map(id => bot.graph.nodes.find(n => n.id === id))
      .filter((n): n is KnowledgeNode => !!n)
  }, [highlightedNodes, bot])

  // Build answer text with inline citation markers (only after typing completes)
  const renderAnswerWithCitations = useCallback((text: string, nodes: KnowledgeNode[], isTypingComplete: boolean) => {
    if (!isTypingComplete || nodes.length === 0) {
      return (
        <>
          {text}
          {!isTypingComplete && (
            <span className="inline-block w-0.5 h-4 bg-aurora-cyan ml-0.5 animate-pulse" />
          )}
        </>
      )
    }

    // Split into sentences (handles Korean and English punctuation)
    const sentences = text.match(/[^.!?。]+[.!?。]?\s*/g) || [text]
    const result: React.ReactNode[] = []
    let citationIndex = 0

    sentences.forEach((sentence, i) => {
      result.push(<span key={`s-${i}`}>{sentence}</span>)
      // Assign a citation every 1-2 sentences, cycling through available nodes
      if ((i + 1) % 2 === 0 || i === sentences.length - 1) {
        if (citationIndex < nodes.length) {
          const node = nodes[citationIndex]
          const markerNum = citationIndex + 1
          const nodeIdx = citationIndex
          result.push(
            <span
              key={`c-${i}`}
              onClick={(e) => {
                e.stopPropagation()
                setStoryCitationPopup({ nodeId: node.id, nodeIndex: nodeIdx })
              }}
              className="text-[10px] text-aurora-cyan cursor-pointer align-super font-mono bg-aurora-cyan/10 px-1 rounded hover:bg-aurora-cyan/20 transition-colors select-none"
            >
              [{markerNum}]
            </span>
          )
          citationIndex++
        }
      }
    })

    return <>{result}</>
  }, [])

  // Answer typing effect
  useEffect(() => {
    if (!answer || searchPhase !== 'complete') {
      setDisplayedAnswer('')
      return
    }

    let i = 0
    const interval = setInterval(() => {
      setDisplayedAnswer(answer.slice(0, i))
      i++
      if (i > answer.length) clearInterval(interval)
    }, 20)

    return () => clearInterval(interval)
  }, [answer, searchPhase])

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-aurora-cyan rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-aurora-cyan rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-aurora-cyan rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    )
  }

  if (!bot) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-arctic/50">봇을 찾을 수 없습니다</p>
      </div>
    )
  }

  const executeSearch = async (searchQuestion: string) => {
    // Phase 1: Searching
    setSearchPhase('searching')
    setIsLoading(true)
    setAnswer(null)
    setDisplayedAnswer('')
    setSelectedNode(null)
    setCurrentQuestion(searchQuestion)
    setHighlightedNodes([])

    // Search animation time
    await new Promise(resolve => setTimeout(resolve, 800))

    // Phase 2: Found
    setSearchPhase('found')

    const result = generateMockAnswer(searchQuestion, bot!)

    // Highlight found nodes
    setHighlightedNodes(result.usedNodes)

    // Brief pause to show found state
    await new Promise(resolve => setTimeout(resolve, 500))

    // Phase 3: Complete
    setSearchPhase('complete')
    setAnswer(result.answer)
    setConfidence(result.confidence)
    setMatchedTerms(result.matchedTerms)

    // Record citations for the used nodes (with question context for Supabase sync)
    recordCitation(result.usedNodes, searchQuestion)
    setRecentlyCitedNodes(result.usedNodes)

    // Clear recently cited indicator after animation
    setTimeout(() => {
      setRecentlyCitedNodes([])
    }, 3000)


    setIsLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) return
    executeSearch(question)
  }

  const handleNodeClick = (node: KnowledgeNode) => {
    setSelectedNode(node)
  }

  return (
    <AuroraBackground className="min-h-screen pb-20">
      {/* Header */}
      <header className="flex items-center gap-3 px-5 pt-6 pb-4">
        <Link href="/explore" className="p-1 text-arctic/50 hover:text-arctic transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-2.5">
          {bot.profileImage ? (
            <img src={bot.profileImage} alt={bot.name} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <span className="text-2xl">{bot.icon}</span>
          )}
          <div>
            <h1 className="text-2xl font-bold text-arctic tracking-tight">{bot.name}</h1>
            <p className="text-arctic/50 text-sm mt-0.5 font-mono">{bot.category}</p>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <form onSubmit={handleSubmit} className="px-5 pb-4">
        <div className="glass-card rounded-2xl flex items-center gap-2 px-4 py-3">
          <svg className="w-4 h-4 text-arctic/30 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="질문을 입력하세요..."
            className="flex-1 bg-transparent outline-none text-sm text-arctic placeholder:text-arctic/40"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="p-1.5 text-arctic/40 hover:text-aurora-cyan disabled:opacity-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>

      {/* Graph */}
      <div className="flex-1 px-5">
        <div className="relative">
          <KnowledgeGraph
            bot={bot}
            highlightedNodes={highlightedNodes}
            onNodeClick={handleNodeClick}
            recentlyCitedNodes={recentlyCitedNodes}
            isSearching={searchPhase === 'searching'}
            searchPhase={searchPhase}
            foundNodeIds={highlightedNodes}
          />
        </div>

        {/* Story Content */}
        {searchPhase === 'idle' && (
          <div className="mt-4 space-y-4">
            <div className="glass-card rounded-2xl p-5 relative">
              <p className="text-sm text-arctic/70 leading-relaxed mb-4">
                {bot.description}
              </p>
              {bot.graph.nodes.slice(0, 6).map((node, idx) => (
                <div key={node.id} className="mb-4 last:mb-0">
                  <h3 className="text-sm font-semibold text-arctic/90 mb-1">{node.label}</h3>
                  <p className="text-sm text-arctic/60 leading-relaxed">
                    {node.content}
                    <span
                      onClick={(e) => {
                        e.stopPropagation()
                        setStoryCitationPopup({ nodeId: node.id, nodeIndex: idx })
                      }}
                      className="inline-block ml-1 text-[10px] text-aurora-cyan cursor-pointer align-super font-mono bg-aurora-cyan/10 px-1 rounded hover:bg-aurora-cyan/20 transition-colors select-none"
                    >
                      [{idx + 1}]
                    </span>
                    {/* Add secondary citation for longer content */}
                    {idx < bot.graph.nodes.slice(0, 6).length - 1 && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation()
                          const nextIdx = idx + 1
                          const nextNode = bot.graph.nodes[nextIdx]
                          if (nextNode) setStoryCitationPopup({ nodeId: nextNode.id, nodeIndex: nextIdx })
                        }}
                        className="inline-block text-[10px] text-aurora-cyan cursor-pointer align-super font-mono bg-aurora-cyan/10 px-1 rounded hover:bg-aurora-cyan/20 transition-colors select-none"
                      >
                        [{idx + 2}]
                      </span>
                    )}
                  </p>
                </div>
              ))}

            </div>
          </div>
        )}
      </div>

      {/* Loading - Searching Phase */}
      {searchPhase === 'searching' && (
        <div className="px-5 py-3">
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-aurora-cyan rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-aurora-cyan rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-aurora-cyan rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm text-arctic/70">지식 그래프 검색 중...</span>
            </div>
          </div>
        </div>
      )}

      {/* Found Phase */}
      {searchPhase === 'found' && (
        <div className="px-5 py-3">
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 text-green-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm text-arctic/70">
                {highlightedNodes.length}개 관련 노드 발견! 답변 생성 중...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Answer & Receipt */}
      {searchPhase === 'complete' && answer && (
        <div className="px-5 py-3 space-y-3">
          {/* Wiki-style Answer Card */}
          <div className="glass-card rounded-2xl p-4 relative" ref={answerContainerRef}>
            {/* Question as title header */}
            <h2 className="text-lg font-bold text-arctic border-b border-white/10 pb-2 mb-3">
              {currentQuestion}
            </h2>

            {/* Confidence bar and matched terms */}
            {confidence > 0 && (
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-arctic/50">신뢰도</span>
                  <div className="w-16 bg-white/10 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        confidence >= 70 ? 'bg-green-500' :
                        confidence >= 40 ? 'bg-yellow-500' : 'bg-red-400'
                      }`}
                      style={{ width: `${confidence}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium ${
                    confidence >= 70 ? 'text-green-400' :
                    confidence >= 40 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {confidence}%
                  </span>
                </div>
                {matchedTerms.length > 0 && (
                  <div className="flex items-center gap-1 ml-auto">
                    <span className="text-xs text-arctic/40">매칭:</span>
                    {matchedTerms.slice(0, 3).map((term, i) => (
                      <span key={i} className="text-xs bg-aurora-violet/20 text-aurora-violet px-1.5 py-0.5 rounded">
                        {term}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Answer text with inline citations */}
            <p className="text-sm text-arctic/80 whitespace-pre-line leading-relaxed">
              {renderAnswerWithCitations(
                displayedAnswer,
                citedNodes,
                displayedAnswer.length >= (answer?.length || 0)
              )}
            </p>

          </div>

          <button
            onClick={() => {
              setSearchPhase('idle')
              setAnswer(null)
              setDisplayedAnswer('')
              setHighlightedNodes([])
              setQuestion('')
              setSelectedNode(null)
              setStoryCitationPopup(null)
            }}
            className="w-full glass-btn rounded-2xl py-3 text-center text-sm font-medium text-arctic/70 hover:text-arctic transition-colors"
          >
            다른 질문하기
          </button>
        </div>
      )}

      {/* Selected Node Detail */}
      {selectedNode && searchPhase === 'idle' && (
        <div className="px-5 py-3">
          <div className="glass-card rounded-2xl p-4">
            <h3 className="font-semibold mb-2 text-arctic">{selectedNode.label}</h3>
            <p className="text-sm text-arctic/70 mb-3">{selectedNode.content}</p>
            <div className="flex items-center justify-between text-xs text-arctic/40 font-mono">
              <span>인용 {getCitationCount(selectedNode.id, selectedNode.citationCount)}회</span>
              <span>{selectedNode.contributor}</span>
            </div>
          </div>
        </div>
      )}

      {/* Story Citation Modal — page level */}
      <AnimatePresence>
        {storyCitationPopup && (() => {
          const popupNode = bot.graph.nodes.find(n => n.id === storyCitationPopup.nodeId)
          if (!popupNode) return null

          const contextBefore = `...${bot.description.slice(-60)}`
          const highlightedText = popupNode.content
          const contextAfter = bot.graph.nodes
            .filter(n => n.id !== popupNode.id)
            .slice(0, 1)
            .map(n => n.content.slice(0, 80))
            .join(' ') + '...'

          return (
            <>
              <motion.div
                key="story-citation-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
                onClick={() => setStoryCitationPopup(null)}
              />
              <motion.div
                key="story-citation-modal"
                initial={{ opacity: 0, scale: 0.92, x: '-50%', y: '-50%' }}
                animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
                exit={{ opacity: 0, scale: 0.92, x: '-50%', y: '-50%' }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="fixed left-1/2 top-1/2 z-[70] w-[calc(100%-40px)] max-w-[390px] bg-[#0d0d1a]/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl max-h-[70vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-aurora-cyan bg-aurora-cyan/10 px-1.5 py-0.5 rounded">
                      [{storyCitationPopup.nodeIndex + 1}]
                    </span>
                    <span className="text-sm font-semibold text-arctic">{popupNode.label}</span>
                  </div>
                  <button
                    onClick={() => setStoryCitationPopup(null)}
                    className="p-1 text-arctic/40 hover:text-arctic transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                  <p className="text-[10px] font-mono text-arctic/30 uppercase tracking-wider">원본 문서</p>
                  <div className="text-sm text-arctic/50 leading-relaxed">
                    <span>{contextBefore} </span>
                    <span className="bg-aurora-cyan/20 text-arctic/90 px-0.5 rounded border-l-2 border-aurora-cyan">
                      {highlightedText}
                    </span>
                    <span> {contextAfter}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/10 bg-white/5">
                  <div className="flex items-center gap-3 text-[10px] font-mono text-arctic/40">
                    <span>{getAnonymousName(popupNode.contributor)}</span>
                    <span className="text-white/20">|</span>
                    <span className="text-aurora-cyan">인용 {getCitationCount(popupNode.id, popupNode.citationCount)}회</span>
                  </div>
                  <span className="text-[10px] font-mono text-arctic/30">
                    {new Date(popupNode.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </motion.div>
            </>
          )
        })()}
      </AnimatePresence>

      <BottomNav active="explore" />

    </AuroraBackground>
  )
}
