'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import type { ExpertBot, KnowledgeNode } from '@/lib/types'
import { useCitationStore } from '@/stores/citationStore'

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[360px] bg-[#0a0a0f] rounded-3xl flex items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
        <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse delay-100" />
        <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse delay-200" />
      </div>
    </div>
  )
})

interface KnowledgeGraphProps {
  bot: ExpertBot
  highlightedNodes?: string[]
  onNodeClick?: (node: KnowledgeNode) => void
  recentlyCitedNodes?: string[]
}

interface GraphNode {
  id: string
  name: string
  val: number
  node: KnowledgeNode
  citationCount: number
  colorIndex: number
  x?: number
  y?: number
}

// 66days style gradient colors
const GRADIENT_SETS = [
  { from: '#667eea', to: '#764ba2' }, // purple-violet
  { from: '#f093fb', to: '#f5576c' }, // pink-red
  { from: '#4facfe', to: '#00f2fe' }, // blue-cyan
  { from: '#43e97b', to: '#38f9d7' }, // green-teal
  { from: '#fa709a', to: '#fee140' }, // pink-yellow
  { from: '#a8edea', to: '#fed6e3' }, // teal-pink
]

export function KnowledgeGraph({
  bot,
  highlightedNodes = [],
  onNodeClick,
  recentlyCitedNodes = []
}: KnowledgeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 400, height: 360 })
  const [animationPhase, setAnimationPhase] = useState(0)
  const [hoverNode, setHoverNode] = useState<string | null>(null)
  const getCitationCount = useCitationStore((state) => state.getCitationCount)

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: 360
        })
      }
    }
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  useEffect(() => {
    if (recentlyCitedNodes.length > 0) {
      setAnimationPhase(1)
      const t1 = setTimeout(() => setAnimationPhase(2), 200)
      const t2 = setTimeout(() => setAnimationPhase(3), 400)
      const t3 = setTimeout(() => setAnimationPhase(4), 600)
      const t4 = setTimeout(() => setAnimationPhase(0), 2500)
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
    }
  }, [recentlyCitedNodes])

  const graphData = {
    nodes: bot.graph.nodes.map((node, index) => {
      const realCitationCount = getCitationCount(node.id, node.citationCount)
      return {
        id: node.id,
        name: node.label,
        val: 6,
        node,
        citationCount: realCitationCount,
        colorIndex: index % GRADIENT_SETS.length
      }
    }),
    links: bot.graph.edges.map(edge => ({
      source: edge.source,
      target: edge.target,
      label: edge.relationship
    }))
  }

  const handleNodeClick = useCallback((node: object) => {
    if (onNodeClick) onNodeClick((node as GraphNode).node)
  }, [onNodeClick])

  return (
    <div ref={containerRef} className="relative w-full rounded-3xl overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[#0a0a0f]">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/20 via-transparent to-fuchsia-950/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-[100px]" />
      </div>

      {/* Graph */}
      <div className="relative z-10">
        <ForceGraph2D
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          backgroundColor="transparent"
          nodeLabel=""
          nodeRelSize={1}
          linkColor={() => 'rgba(139, 92, 246, 0.15)'}
          linkWidth={1}
          linkCurvature={0.25}
          onNodeClick={handleNodeClick}
          onNodeHover={(node) => setHoverNode(node ? (node as GraphNode).id : null)}
          cooldownTicks={80}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.25}
          nodeCanvasObjectMode={() => 'replace'}
          nodeCanvasObject={(node: object, ctx: CanvasRenderingContext2D, globalScale: number) => {
            void globalScale // required by react-force-graph-2d callback signature
            const n = node as GraphNode
            const x = n.x || 0
            const y = n.y || 0
            const isHighlighted = highlightedNodes.includes(n.id)
            const isRecentlyCited = recentlyCitedNodes.includes(n.id)
            const isHovered = hoverNode === n.id
            const colors = GRADIENT_SETS[n.colorIndex]

            const baseRadius = 5
            const radius = isHighlighted || isHovered ? baseRadius + 2 : baseRadius

            // Outer glow rings for cited nodes
            if (isRecentlyCited && animationPhase > 0) {
              for (let i = 3; i >= 1; i--) {
                const ringRadius = radius + (animationPhase * 4) + (i * 6)
                const alpha = Math.max(0, 0.3 - (animationPhase * 0.05) - (i * 0.08))
                ctx.beginPath()
                ctx.arc(x, y, ringRadius, 0, Math.PI * 2)
                ctx.strokeStyle = `rgba(74, 222, 128, ${alpha})`
                ctx.lineWidth = 2
                ctx.stroke()
              }
            }

            // Glow effect
            const glowRadius = radius + (isHighlighted || isHovered ? 12 : 8)
            const glow = ctx.createRadialGradient(x, y, radius * 0.5, x, y, glowRadius)
            if (isRecentlyCited && animationPhase > 0) {
              glow.addColorStop(0, 'rgba(74, 222, 128, 0.6)')
              glow.addColorStop(0.5, 'rgba(74, 222, 128, 0.2)')
              glow.addColorStop(1, 'rgba(74, 222, 128, 0)')
            } else {
              glow.addColorStop(0, `${colors.from}66`)
              glow.addColorStop(0.5, `${colors.from}22`)
              glow.addColorStop(1, `${colors.from}00`)
            }
            ctx.beginPath()
            ctx.arc(x, y, glowRadius, 0, Math.PI * 2)
            ctx.fillStyle = glow
            ctx.fill()

            // Main node with gradient
            const gradient = ctx.createRadialGradient(x - radius/3, y - radius/3, 0, x, y, radius * 1.2)
            if (isRecentlyCited && animationPhase > 0) {
              gradient.addColorStop(0, '#86efac')
              gradient.addColorStop(1, '#22c55e')
            } else if (isHighlighted) {
              gradient.addColorStop(0, '#ffffff')
              gradient.addColorStop(1, '#e0e7ff')
            } else {
              gradient.addColorStop(0, colors.from)
              gradient.addColorStop(1, colors.to)
            }

            ctx.beginPath()
            ctx.arc(x, y, radius, 0, Math.PI * 2)
            ctx.fillStyle = gradient
            ctx.fill()

            // Inner highlight (glossy effect)
            const innerGlow = ctx.createRadialGradient(x - radius/2, y - radius/2, 0, x, y, radius)
            innerGlow.addColorStop(0, 'rgba(255,255,255,0.4)')
            innerGlow.addColorStop(0.5, 'rgba(255,255,255,0)')
            innerGlow.addColorStop(1, 'rgba(255,255,255,0)')
            ctx.beginPath()
            ctx.arc(x, y, radius, 0, Math.PI * 2)
            ctx.fillStyle = innerGlow
            ctx.fill()

            // Label
            const label = n.name.length > 12 ? n.name.slice(0, 11) + '…' : n.name
            const fontSize = 10
            ctx.font = `500 ${fontSize}px "Pretendard", -apple-system, sans-serif`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'top'

            // Text glow
            ctx.shadowColor = 'rgba(0,0,0,0.8)'
            ctx.shadowBlur = 4
            ctx.fillStyle = isHighlighted || isRecentlyCited || isHovered
              ? '#ffffff'
              : 'rgba(255,255,255,0.7)'
            ctx.fillText(label, x, y + radius + 6)
            ctx.shadowBlur = 0

            // Citation badge
            if (n.citationCount > 0 && (isHighlighted || isRecentlyCited || isHovered)) {
              const badgeText = n.citationCount.toString()
              ctx.font = `600 8px "Pretendard", sans-serif`
              const tw = ctx.measureText(badgeText).width
              const bx = x + radius + 4
              const by = y - radius - 2
              const pad = 4

              ctx.beginPath()
              ctx.roundRect(bx - pad, by - 6 - pad, tw + pad * 2, 12 + pad, 6)
              ctx.fillStyle = isRecentlyCited && animationPhase > 0 ? '#22c55e' : colors.from
              ctx.fill()

              ctx.fillStyle = '#fff'
              ctx.textAlign = 'center'
              ctx.textBaseline = 'middle'
              ctx.fillText(badgeText, bx + tw/2, by)
            }

            // +1 floating animation
            if (isRecentlyCited && animationPhase > 0 && animationPhase < 4) {
              const floatY = y - radius - 16 - (animationPhase * 8)
              const alpha = Math.max(0, 1 - animationPhase * 0.25)
              ctx.font = `bold 14px "Pretendard", sans-serif`
              ctx.textAlign = 'center'
              ctx.textBaseline = 'bottom'
              ctx.fillStyle = `rgba(74, 222, 128, ${alpha})`
              ctx.fillText('+1', x, floatY)
            }
          }}
          linkCanvasObject={(link: object, ctx: CanvasRenderingContext2D) => {
            const l = link as { source: GraphNode; target: GraphNode; label?: string }
            if (!l.source.x || !l.target.x) return

            const sx = l.source.x, sy = l.source.y || 0
            const tx = l.target.x, ty = l.target.y || 0

            // Curved line
            const mx = (sx + tx) / 2
            const my = (sy + ty) / 2
            const dx = tx - sx
            const dy = ty - sy
            const curve = 0.2
            const cx = mx - dy * curve
            const cy = my + dx * curve

            // Gradient stroke
            const grad = ctx.createLinearGradient(sx, sy, tx, ty)
            grad.addColorStop(0, 'rgba(139, 92, 246, 0.3)')
            grad.addColorStop(0.5, 'rgba(139, 92, 246, 0.15)')
            grad.addColorStop(1, 'rgba(139, 92, 246, 0.3)')

            ctx.beginPath()
            ctx.moveTo(sx, sy)
            ctx.quadraticCurveTo(cx, cy, tx, ty)
            ctx.strokeStyle = grad
            ctx.lineWidth = 1.5
            ctx.stroke()

            // Arrow
            const angle = Math.atan2(ty - cy, tx - cx)
            const aLen = 5
            ctx.beginPath()
            ctx.moveTo(tx, ty)
            ctx.lineTo(tx - aLen * Math.cos(angle - Math.PI/6), ty - aLen * Math.sin(angle - Math.PI/6))
            ctx.lineTo(tx - aLen * Math.cos(angle + Math.PI/6), ty - aLen * Math.sin(angle + Math.PI/6))
            ctx.closePath()
            ctx.fillStyle = 'rgba(139, 92, 246, 0.5)'
            ctx.fill()

            // Edge label
            const dist = Math.sqrt(dx*dx + dy*dy)
            if (l.label && dist > 80) {
              ctx.font = '9px "Pretendard", sans-serif'
              ctx.textAlign = 'center'
              ctx.textBaseline = 'middle'
              ctx.fillStyle = 'rgba(167, 139, 250, 0.6)'
              ctx.fillText(l.label, cx, cy)
            }
          }}
          linkCanvasObjectMode={() => 'replace'}
        />
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0a0a0f] to-transparent pointer-events-none z-20" />
    </div>
  )
}
