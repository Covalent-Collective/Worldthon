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
  x?: number
  y?: number
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
    })),
    links: bot.graph.edges.map(edge => ({
      source: edge.source,
      target: edge.target,
      label: edge.relationship
    }))
  }

  const handleNodeClick = useCallback((node: object) => {
    if (onNodeClick) {
      onNodeClick((node as GraphNode).node)
    }
  }, [onNodeClick])

  return (
    <div ref={containerRef} className="w-full bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
      <ForceGraph2D
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeLabel={(node: object) => (node as GraphNode).name}
        nodeColor={(node: object) => (node as GraphNode).color}
        nodeRelSize={4}
        linkColor={() => '#E5E7EB'}
        linkWidth={1}
        linkDirectionalArrowLength={3}
        linkDirectionalArrowRelPos={1}
        onNodeClick={handleNodeClick}
        cooldownTicks={50}
        nodeCanvasObject={(node: object, ctx: CanvasRenderingContext2D, globalScale: number) => {
          const graphNode = node as GraphNode
          const label = graphNode.name
          const fontSize = 10 / globalScale
          ctx.font = `${fontSize}px Sans-Serif`

          // Draw node circle
          ctx.beginPath()
          ctx.arc(graphNode.x || 0, graphNode.y || 0, graphNode.val, 0, 2 * Math.PI)
          ctx.fillStyle = graphNode.color
          ctx.fill()

          // Draw label
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillStyle = highlightedNodes.includes(graphNode.id) ? '#000' : '#6B7280'
          ctx.fillText(label, graphNode.x || 0, (graphNode.y || 0) + graphNode.val + fontSize)
        }}
      />
    </div>
  )
}
