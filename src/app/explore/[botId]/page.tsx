'use client'

import { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getBotWithContributions, generateMockAnswer, calculateContribution } from '@/lib/mock-data'
import { KnowledgeGraph } from '@/components/KnowledgeGraph'
import { BottomNav } from '@/components/BottomNav'
import { useCitationStore } from '@/stores/citationStore'
import { useKnowledgeStore } from '@/stores/knowledgeStore'
import type { KnowledgeNode } from '@/lib/types'

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
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([])
  const [recentlyCitedNodes, setRecentlyCitedNodes] = useState<string[]>([])
  const [contributions, setContributions] = useState<{ contributor: string; percentage: number }[]>([])
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [confidence, setConfidence] = useState<number>(0)
  const [matchedTerms, setMatchedTerms] = useState<string[]>([])

  const recordCitation = useCitationStore((state) => state.recordCitation)
  const getCitationCount = useCitationStore((state) => state.getCitationCount)

  if (!bot) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">봇을 찾을 수 없습니다</p>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) return

    setIsLoading(true)
    setAnswer(null)
    setSelectedNode(null)

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800))

    const result = generateMockAnswer(question, bot)
    setAnswer(result.answer)
    setHighlightedNodes(result.usedNodes)
    setConfidence(result.confidence)
    setMatchedTerms(result.matchedTerms)

    // Record citations for the used nodes - this is the key feature!
    recordCitation(result.usedNodes)
    setRecentlyCitedNodes(result.usedNodes)

    // Clear recently cited indicator after animation
    setTimeout(() => {
      setRecentlyCitedNodes([])
    }, 3000)

    const receipts = calculateContribution(result.usedNodes, bot.graph.nodes)
    setContributions(receipts)

    setIsLoading(false)
  }

  const handleNodeClick = (node: KnowledgeNode) => {
    setSelectedNode(node)
  }

  return (
    <main className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="flex items-center gap-3 p-4 border-b border-gray-100">
        <Link href="/" className="p-1">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{bot.icon}</span>
          <h1 className="font-semibold">{bot.name}</h1>
        </div>
      </header>

      {/* Search Bar */}
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex items-center gap-2 bg-gray-50 rounded-full px-4 py-3">
          <input
            type="text"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="질문을 입력하세요..."
            className="flex-1 bg-transparent outline-none text-sm"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="p-1 text-gray-500 hover:text-black disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>

      {/* Graph */}
      <div className="flex-1 px-4">
        <KnowledgeGraph
          bot={bot}
          highlightedNodes={highlightedNodes}
          onNodeClick={handleNodeClick}
          recentlyCitedNodes={recentlyCitedNodes}
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="px-4 py-3">
          <div className="bg-gray-50 rounded-xl p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      )}

      {/* Answer & Receipt */}
      {answer && !isLoading && (
        <div className="px-4 py-3 space-y-3">
          {/* Answer Bubble */}
          <div className="bg-gray-50 rounded-xl p-4">
            {/* Confidence Indicator */}
            {confidence > 0 && (
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500">신뢰도</span>
                  <div className="w-16 bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${
                        confidence >= 70 ? 'bg-green-500' :
                        confidence >= 40 ? 'bg-yellow-500' : 'bg-red-400'
                      }`}
                      style={{ width: `${confidence}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium ${
                    confidence >= 70 ? 'text-green-600' :
                    confidence >= 40 ? 'text-yellow-600' : 'text-red-500'
                  }`}>
                    {confidence}%
                  </span>
                </div>
                {matchedTerms.length > 0 && (
                  <div className="flex items-center gap-1 ml-auto">
                    <span className="text-xs text-gray-400">매칭:</span>
                    {matchedTerms.slice(0, 3).map((term, i) => (
                      <span key={i} className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                        {term}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
            <p className="text-sm text-gray-700 whitespace-pre-line">{answer}</p>
          </div>

          {/* Contribution Receipt */}
          <div className="border border-dashed border-gray-300 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span>📄</span>
              <span className="font-medium text-sm">기여 영수증</span>
            </div>
            <div className="space-y-2">
              {contributions.map((c, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-24 truncate">{c.contributor}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-black rounded-full h-2"
                      style={{ width: `${c.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-10">{c.percentage}%</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">
              이 답변은 위 기여자들의 지식을 기반으로 생성되었습니다
            </p>
          </div>
        </div>
      )}

      {/* Selected Node Detail */}
      {selectedNode && !answer && (
        <div className="px-4 py-3">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold mb-2">{selectedNode.label}</h3>
            <p className="text-sm text-gray-600 mb-3">{selectedNode.content}</p>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>인용 {getCitationCount(selectedNode.id, selectedNode.citationCount)}회</span>
              <span>{selectedNode.contributor}</span>
            </div>
          </div>
        </div>
      )}

      <BottomNav active="explore" />
    </main>
  )
}
