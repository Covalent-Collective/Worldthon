'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import type { ExpertBot, KnowledgeNode } from '@/lib/types'

// Dynamic import for SSR compatibility
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-gray-50 rounded-xl flex items-center justify-center">
      <div className="animate-pulse text-gray-400">그래프 로딩중...</div>
    </div>
  )
})

interface KnowledgeGraphProps {
  bot: ExpertBot
  highlightedNodes?: string[]
  onNodeClick?: (node: KnowledgeNode) => void
}

interface GraphNode {
  id: string
  name: string
  val: number
  color: string
  node: KnowledgeNode
}

interface GraphLink {
  source: string
  target: string
  label: string
}

export function KnowledgeGraph({ bot, highlightedNodes = [], onNodeClick }: KnowledgeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 400, height: 300 })

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: 300
        })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  const graphData = {
    nodes: bot.graph.nodes.map(node => ({
      id: node.id,
      name: node.label,
      val: Math.log(node.citationCount + 1) * 3 + 5,
      color: highlightedNodes.includes(node.id) ? '#000000' : '#9CA3AF',
      node
    })) as GraphNode[],
    links: bot.graph.edges.map(edge => ({
      source: edge.source,
      target: edge.target,
      label: edge.relationship
    })) as GraphLink[]
  }

  const handleNodeClick = useCallback((node: GraphNode) => {
    if (onNodeClick) {
      onNodeClick(node.node)
    }
  }, [onNodeClick])

  return (
    <div ref={containerRef} className="w-full bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
      <ForceGraph2D
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeLabel={(node: GraphNode) => node.name}
        nodeColor={(node: GraphNode) => node.color}
        nodeRelSize={4}
        linkColor={() => '#E5E7EB'}
        linkWidth={1}
        linkDirectionalArrowLength={3}
        linkDirectionalArrowRelPos={1}
        onNodeClick={handleNodeClick}
        cooldownTicks={50}
        nodeCanvasObject={(node: GraphNode, ctx, globalScale) => {
          const label = node.name
          const fontSize = 10 / globalScale
          ctx.font = `${fontSize}px Sans-Serif`

          // Draw node circle
          ctx.beginPath()
          ctx.arc(node.x!, node.y!, node.val, 0, 2 * Math.PI)
          ctx.fillStyle = node.color
          ctx.fill()

          // Draw label
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillStyle = highlightedNodes.includes(node.id) ? '#000' : '#6B7280'
          ctx.fillText(label, node.x!, node.y! + node.val + fontSize)
        }}
      />
    </div>
  )
}
