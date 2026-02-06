'use client'

import { useState, useMemo, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getBotWithContributions, generateMockAnswer, calculateDetailedContribution } from '@/lib/mock-data'
import { KnowledgeGraph } from '@/components/KnowledgeGraph'
import { DetailedContributionReceipt } from '@/components/DetailedContributionReceipt'
import { BottomNav } from '@/components/BottomNav'
import { AuroraBackground } from '@/components/AuroraBackground'
import { useCitationStore } from '@/stores/citationStore'
import { useKnowledgeStore } from '@/stores/knowledgeStore'
import type { KnowledgeNode, DetailedContribution } from '@/lib/types'

export default function ExplorePage() {
  const params = useParams()
  const botId = params.botId as string

  // Get user-contributed nodes from the knowledge store
  const getNodesForBot = useKnowledgeStore((state) => state.getNodesForBot)
  const getEdgesForBot = useKnowledgeStore((state) => state.getEdgesForBot)

  // Merge base bot data with user contributions
  const contributedNodes = getNodesForBot(botId)
  const contributedEdges = getEdgesForBot(botId)
  const bot = useMemo(
    () => getBotWithContributions(botId, contributedNodes, contributedEdges),
    [botId, contributedNodes, contributedEdges]
  )

  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState<string | null>(null)
  const [displayedAnswer, setDisplayedAnswer] = useState('')
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([])
  const [recentlyCitedNodes, setRecentlyCitedNodes] = useState<string[]>([])
  const [detailedContributions, setDetailedContributions] = useState<DetailedContribution[]>([])
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [confidence, setConfidence] = useState<number>(0)
  const [matchedTerms, setMatchedTerms] = useState<string[]>([])
  const [searchPhase, setSearchPhase] = useState<'idle' | 'searching' | 'found' | 'complete'>('idle')
  const [currentQuestion, setCurrentQuestion] = useState('')

  const recordCitation = useCitationStore((state) => state.recordCitation)
  const getCitationCount = useCitationStore((state) => state.getCitationCount)

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

  if (!bot) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-arctic/50">봇을 찾을 수 없습니다</p>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) return

    // Phase 1: Searching
    setSearchPhase('searching')
    setIsLoading(true)
    setAnswer(null)
    setDisplayedAnswer('')
    setSelectedNode(null)
    setCurrentQuestion(question)
    setHighlightedNodes([])

    // Search animation time
    await new Promise(resolve => setTimeout(resolve, 800))

    // Phase 2: Found
    setSearchPhase('found')

    const result = generateMockAnswer(question, bot)

    // Highlight found nodes
    setHighlightedNodes(result.usedNodes)

    // Brief pause to show found state
    await new Promise(resolve => setTimeout(resolve, 500))

    // Phase 3: Complete
    setSearchPhase('complete')
    setAnswer(result.answer)
    setConfidence(result.confidence)
    setMatchedTerms(result.matchedTerms)

    // Record citations for the used nodes
    recordCitation(result.usedNodes)
    setRecentlyCitedNodes(result.usedNodes)

    // Clear recently cited indicator after animation
    setTimeout(() => {
      setRecentlyCitedNodes([])
    }, 3000)

    // Calculate detailed contributions with relevance-based distribution
    const detailedReceipts = calculateDetailedContribution(
      result.nodeDetails,
      bot.graph.nodes,
      0.001 // totalWLD
    )
    setDetailedContributions(detailedReceipts)

    setIsLoading(false)
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
          <span className="text-2xl">{bot.icon}</span>
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

        {/* Stats Below Graph */}
        {searchPhase === 'idle' && (
          <div className="mt-3 space-y-3">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              <div className="glass-card rounded-2xl px-4 py-2.5 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-arctic/50">노드</span>
                  <span className="text-sm font-digital text-aurora-cyan">{bot.graph.nodes.length}</span>
                </div>
              </div>
              <div className="glass-card rounded-2xl px-4 py-2.5 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-arctic/50">연결</span>
                  <span className="text-sm font-digital text-aurora-cyan">{bot.graph.edges.length}</span>
                </div>
              </div>
              <div className="glass-card rounded-2xl px-4 py-2.5 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-arctic/50">인용</span>
                  <span className="text-sm font-digital text-aurora-cyan">
                    {bot.graph.nodes.reduce((sum, n) => sum + getCitationCount(n.id, n.citationCount), 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Top Contributors */}
            {(() => {
              const contributorData = Object.entries(
                bot.graph.nodes.reduce((acc, node) => {
                  const contributor = node.contributor
                  const citations = getCitationCount(node.id, node.citationCount)
                  acc[contributor] = (acc[contributor] || 0) + citations
                  return acc
                }, {} as Record<string, number>)
              )
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
              const maxCitations = contributorData[0]?.[1] || 1

              return (
                <div className="glass-card rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-arctic/50 text-xs font-mono">TOP CONTRIBUTORS</p>
                    <p className="text-arctic/30 text-[10px] font-mono">{contributorData.length}명</p>
                  </div>
                  <div className="space-y-2.5">
                    {contributorData.map(([id, citations], index) => {
                      const percentage = Math.round((citations / maxCitations) * 100)
                      return (
                        <div key={id}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold w-4 text-right ${
                                index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-amber-600' : 'text-arctic/40'
                              }`}>
                                {index + 1}
                              </span>
                              <span className="font-mono text-xs text-arctic/70">
                                {id.length > 14 ? `${id.slice(0, 8)}...${id.slice(-4)}` : id}
                              </span>
                            </div>
                            <span className="text-xs text-arctic/50 font-mono">{citations} citations</span>
                          </div>
                          <div className="ml-6 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${percentage}%`,
                                background: index === 0
                                  ? 'linear-gradient(-20deg, #ddd6f3 0%, #faaca8 100%)'
                                  : `rgba(102,126,234,${0.6 - index * 0.1})`,
                              }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-arctic/30 font-mono">
                    <span>총 인용 {contributorData.reduce((s, [, c]) => s + c, 0)}회</span>
                    <span>기여도 기반 정렬</span>
                  </div>
                </div>
              )
            })()}
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
          <div className="glass-card rounded-2xl p-4">
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
            <p className="text-sm text-arctic/80 whitespace-pre-line">
              {displayedAnswer}
              {displayedAnswer.length < (answer?.length || 0) && (
                <span className="inline-block w-0.5 h-4 bg-aurora-cyan ml-0.5 animate-pulse" />
              )}
            </p>
          </div>

          <DetailedContributionReceipt
            contributions={detailedContributions}
            question={currentQuestion}
            totalNodes={bot.graph.nodes.length}
          />
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

      <BottomNav active="explore" />
    </AuroraBackground>
  )
}
