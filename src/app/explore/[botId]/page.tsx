'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getBotById, generateMockAnswer, calculateContribution } from '@/lib/mock-data'
import { KnowledgeGraph } from '@/components/KnowledgeGraph'
import { BottomNav } from '@/components/BottomNav'
import type { KnowledgeNode } from '@/lib/types'

export default function ExplorePage() {
  const params = useParams()
  const botId = params.botId as string
  const bot = getBotById(botId)

  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState<string | null>(null)
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([])
  const [contributions, setContributions] = useState<{ contributor: string; percentage: number }[]>([])
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null)
  const [isLoading, setIsLoading] = useState(false)

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
              <span>인용 {selectedNode.citationCount}회</span>
              <span>{selectedNode.contributor}</span>
            </div>
          </div>
        </div>
      )}

      <BottomNav active="explore" />
    </main>
  )
}
