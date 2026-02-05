'use client'

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
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
  isSearching?: boolean
  searchPhase?: 'idle' | 'searching' | 'found' | 'complete'
  foundNodeIds?: string[]  // Nodes found during search
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

// Wave Overlay component for search animation
interface WaveOverlayProps {
  width: number
  height: number
  waveTime: number
}

function WaveOverlay({ width, height, waveTime }: WaveOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    const centerX = width / 2
    const centerY = height / 2
    const maxRadius = Math.max(width, height) * 0.6

    // Draw multiple expanding waves
    const waveCycle = 2000 // ms per wave cycle
    const numWaves = 3

    for (let i = 0; i < numWaves; i++) {
      const waveOffset = (waveCycle / numWaves) * i
      const normalizedTime = ((waveTime + waveOffset) % waveCycle) / waveCycle
      const waveRadius = normalizedTime * maxRadius

      // Wave opacity fades as it expands
      const opacity = Math.max(0, 0.4 * (1 - normalizedTime))

      // Draw wave ring
      ctx.beginPath()
      ctx.arc(centerX, centerY, waveRadius, 0, Math.PI * 2)

      // Create gradient stroke (ensure inner radius is never negative)
      const innerRadius = Math.max(0, waveRadius - 10)
      const gradient = ctx.createRadialGradient(
        centerX, centerY, innerRadius,
        centerX, centerY, waveRadius + 10
      )
      gradient.addColorStop(0, `rgba(14, 165, 233, 0)`)
      gradient.addColorStop(0.5, `rgba(14, 165, 233, ${opacity})`)
      gradient.addColorStop(1, `rgba(14, 165, 233, 0)`)

      ctx.strokeStyle = `rgba(14, 165, 233, ${opacity})`
      ctx.lineWidth = 3
      ctx.stroke()

      // Add inner glow ring
      ctx.beginPath()
      ctx.arc(centerX, centerY, waveRadius, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(56, 189, 248, ${opacity * 0.5})`
      ctx.lineWidth = 8
      ctx.stroke()
    }

    // Draw central pulse point
    const pulsePhase = (waveTime % 500) / 500
    const pulseSize = 4 + Math.sin(pulsePhase * Math.PI * 2) * 2
    const pulseOpacity = 0.6 + Math.sin(pulsePhase * Math.PI * 2) * 0.3

    // Outer glow
    const glowGradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, 30
    )
    glowGradient.addColorStop(0, `rgba(14, 165, 233, ${pulseOpacity * 0.8})`)
    glowGradient.addColorStop(0.5, `rgba(14, 165, 233, ${pulseOpacity * 0.3})`)
    glowGradient.addColorStop(1, 'rgba(14, 165, 233, 0)')

    ctx.beginPath()
    ctx.arc(centerX, centerY, 30, 0, Math.PI * 2)
    ctx.fillStyle = glowGradient
    ctx.fill()

    // Central dot
    ctx.beginPath()
    ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2)
    const dotGradient = ctx.createRadialGradient(
      centerX - pulseSize / 3, centerY - pulseSize / 3, 0,
      centerX, centerY, pulseSize
    )
    dotGradient.addColorStop(0, '#e0f2fe')
    dotGradient.addColorStop(1, '#0ea5e9')
    ctx.fillStyle = dotGradient
    ctx.fill()
  }, [width, height, waveTime])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 z-5 pointer-events-none"
      style={{ zIndex: 5 }}
    />
  )
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
  recentlyCitedNodes = [],
  // isSearching is derived from searchPhase, kept for API compatibility
  isSearching: _isSearching = false,
  searchPhase = 'idle',
  foundNodeIds = []
}: KnowledgeGraphProps) {
  void _isSearching // API compatibility - actual state derived from searchPhase
  const containerRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const graphRef = useRef<any>(null)
  const [dimensions, setDimensions] = useState({ width: 400, height: 360 })
  const [animationPhase, setAnimationPhase] = useState(0)
  const [hoverNode, setHoverNode] = useState<string | null>(null)
  const [waveTime, setWaveTime] = useState(0)
  const [isStabilized, setIsStabilized] = useState(false)
  const getCitationCount = useCitationStore((state) => state.getCitationCount)

  // Zoom out to fit all nodes after graph stabilizes
  useEffect(() => {
    if (graphRef.current && isStabilized) {
      // Zoom to fit with some padding
      graphRef.current.zoomToFit(400, 60)
    }
  }, [isStabilized])

  // Wave animation timer for search phase (continues for 'searching' and 'found')
  useEffect(() => {
    if (searchPhase === 'searching' || searchPhase === 'found') {
      const startTime = Date.now()
      const interval = setInterval(() => {
        setWaveTime(Date.now() - startTime)
      }, 16) // ~60fps
      return () => clearInterval(interval)
    } else {
      setWaveTime(0)
    }
  }, [searchPhase])

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

  // Memoize graph data to prevent re-renders when typing
  const graphData = useMemo(() => ({
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [bot.id, bot.graph.nodes.length, bot.graph.edges.length])

  const handleNodeClick = useCallback((node: object) => {
    if (onNodeClick) onNodeClick((node as GraphNode).node)
  }, [onNodeClick])

  return (
    <div ref={containerRef} className="relative w-full rounded-3xl overflow-hidden">
      {/* Light background with subtle blue tint */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-sky-50 to-cyan-50">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-100/30 via-transparent to-cyan-100/30" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-200/40 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-200/30 rounded-full blur-[100px]" />
      </div>

      {/* Central Wave Overlay for Search Phase */}
      {searchPhase === 'searching' && (
        <WaveOverlay
          width={dimensions.width}
          height={dimensions.height}
          waveTime={waveTime}
        />
      )}

      {/* Graph */}
      <div className="relative z-10">
        <ForceGraph2D
          ref={graphRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          backgroundColor="transparent"
          nodeLabel=""
          nodeRelSize={1}
          linkColor={() => 'rgba(56, 189, 248, 0.3)'}
          linkWidth={1}
          linkCurvature={0.25}
          onNodeClick={handleNodeClick}
          onNodeHover={(node) => setHoverNode(node ? (node as GraphNode).id : null)}
          onEngineStop={() => setIsStabilized(true)}
          warmupTicks={100}
          cooldownTicks={0}
          cooldownTime={0}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
          d3AlphaMin={0.001}
          nodeVal={10}
          enableZoomInteraction={true}
          enablePanInteraction={true}
          minZoom={0.3}
          maxZoom={3}
          nodeCanvasObjectMode={() => 'replace'}
          nodeCanvasObject={(node: object, ctx: CanvasRenderingContext2D, globalScale: number) => {
            void globalScale // required by react-force-graph-2d callback signature
            const n = node as GraphNode
            const x = n.x || 0
            const y = n.y || 0
            const isHighlighted = highlightedNodes.includes(n.id)
            const isRecentlyCited = recentlyCitedNodes.includes(n.id)
            const isHovered = hoverNode === n.id
            const isFoundNode = foundNodeIds.includes(n.id)
            const colors = GRADIENT_SETS[n.colorIndex]

            // Calculate distance from center for wave effect
            const distFromCenter = Math.sqrt(x * x + y * y)
            const maxRadius = 200 // Max wave radius

            // Search phase effects
            let searchWaveHit = false
            let searchBrightness = 1
            let nodeOpacity = 1

            if (searchPhase === 'searching') {
              // Multiple waves expanding from center
              const waveCycle = 2000 // ms per wave cycle
              const waveSpeed = maxRadius / waveCycle
              const numWaves = 3

              for (let i = 0; i < numWaves; i++) {
                const waveOffset = (waveCycle / numWaves) * i
                const waveRadius = ((waveTime + waveOffset) % waveCycle) * waveSpeed

                // Check if wave is hitting this node
                const waveThickness = 30
                if (Math.abs(distFromCenter - waveRadius) < waveThickness) {
                  searchWaveHit = true
                  // Brightness based on how close to wave center
                  const waveProximity = 1 - Math.abs(distFromCenter - waveRadius) / waveThickness
                  searchBrightness = Math.max(searchBrightness, 1 + waveProximity * 0.8)
                }
              }
            } else if (searchPhase === 'found') {
              // Found nodes pulse, others dim
              if (isFoundNode) {
                const pulsePhase = (waveTime % 800) / 800
                searchBrightness = 1.2 + Math.sin(pulsePhase * Math.PI * 2) * 0.3
              } else {
                nodeOpacity = 0.3
              }
            } else if (searchPhase === 'complete') {
              // Final state: found nodes stay highlighted
              if (!isFoundNode && foundNodeIds.length > 0) {
                nodeOpacity = 0.4
              } else if (isFoundNode) {
                searchBrightness = 1.3
              }
            }

            const baseRadius = 3
            let radius = isHighlighted || isHovered ? baseRadius + 1.5 : baseRadius

            // Expand radius slightly when wave hits
            if (searchWaveHit) {
              radius += 1.5
            }

            ctx.globalAlpha = nodeOpacity

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

            // Search wave hit glow
            if (searchWaveHit || (searchPhase === 'found' && isFoundNode)) {
              const waveGlowRadius = radius + 15
              const waveGlow = ctx.createRadialGradient(x, y, radius, x, y, waveGlowRadius)
              const glowIntensity = searchWaveHit ? 0.6 : 0.4
              waveGlow.addColorStop(0, `rgba(124, 58, 237, ${glowIntensity})`)
              waveGlow.addColorStop(0.5, `rgba(124, 58, 237, ${glowIntensity * 0.3})`)
              waveGlow.addColorStop(1, 'rgba(124, 58, 237, 0)')
              ctx.beginPath()
              ctx.arc(x, y, waveGlowRadius, 0, Math.PI * 2)
              ctx.fillStyle = waveGlow
              ctx.fill()
            }

            // Glow effect
            const glowRadius = radius + (isHighlighted || isHovered ? 8 : 5)
            const glow = ctx.createRadialGradient(x, y, radius * 0.5, x, y, glowRadius)
            if (isRecentlyCited && animationPhase > 0) {
              glow.addColorStop(0, 'rgba(74, 222, 128, 0.6)')
              glow.addColorStop(0.5, 'rgba(74, 222, 128, 0.2)')
              glow.addColorStop(1, 'rgba(74, 222, 128, 0)')
            } else if (isFoundNode && (searchPhase === 'found' || searchPhase === 'complete')) {
              glow.addColorStop(0, 'rgba(124, 58, 237, 0.7)')
              glow.addColorStop(0.5, 'rgba(124, 58, 237, 0.3)')
              glow.addColorStop(1, 'rgba(124, 58, 237, 0)')
            } else {
              const brightnessMultiplier = searchBrightness
              glow.addColorStop(0, `${colors.from}${Math.min(255, Math.round(0x66 * brightnessMultiplier)).toString(16).padStart(2, '0')}`)
              glow.addColorStop(0.5, `${colors.from}${Math.min(255, Math.round(0x22 * brightnessMultiplier)).toString(16).padStart(2, '0')}`)
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
            } else if (isFoundNode && (searchPhase === 'found' || searchPhase === 'complete')) {
              gradient.addColorStop(0, '#a78bfa')
              gradient.addColorStop(1, '#7c3aed')
            } else if (isHighlighted) {
              gradient.addColorStop(0, '#ffffff')
              gradient.addColorStop(1, '#e0e7ff')
            } else if (searchWaveHit) {
              // Brighten color when wave hits
              gradient.addColorStop(0, '#e0e7ff')
              gradient.addColorStop(1, colors.from)
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
            const label = n.name.length > 10 ? n.name.slice(0, 9) + '…' : n.name
            const fontSize = 8
            ctx.font = `500 ${fontSize}px "Pretendard", -apple-system, sans-serif`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'top'

            // Text shadow for readability on light background
            ctx.shadowColor = 'rgba(255,255,255,0.9)'
            ctx.shadowBlur = 3
            ctx.fillStyle = isHighlighted || isRecentlyCited || isHovered || isFoundNode
              ? '#1e293b'
              : '#475569'
            ctx.fillText(label, x, y + radius + 6)
            ctx.shadowBlur = 0

            // Citation badge
            if (n.citationCount > 0 && (isHighlighted || isRecentlyCited || isHovered)) {
              const badgeText = n.citationCount.toString()
              ctx.font = `600 7px "Pretendard", sans-serif`
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
              const floatY = y - radius - 12 - (animationPhase * 6)
              const alpha = Math.max(0, 1 - animationPhase * 0.25)
              ctx.font = `bold 10px "Pretendard", sans-serif`
              ctx.textAlign = 'center'
              ctx.textBaseline = 'bottom'
              ctx.fillStyle = `rgba(74, 222, 128, ${alpha})`
              ctx.fillText('+1', x, floatY)
            }

            // Reset global alpha
            ctx.globalAlpha = 1
          }}
          linkCanvasObject={(link: object, ctx: CanvasRenderingContext2D) => {
            const l = link as { source: GraphNode; target: GraphNode; label?: string }
            if (!l.source.x || !l.target.x) return

            const sx = l.source.x, sy = l.source.y || 0
            const tx = l.target.x, ty = l.target.y || 0

            // Check if this link connects found nodes
            const sourceFound = foundNodeIds.includes(l.source.id)
            const targetFound = foundNodeIds.includes(l.target.id)
            const isFoundLink = sourceFound && targetFound

            // Curved line
            const mx = (sx + tx) / 2
            const my = (sy + ty) / 2
            const dx = tx - sx
            const dy = ty - sy
            const curve = 0.2
            const cx = mx - dy * curve
            const cy = my + dx * curve

            // Calculate link opacity based on search phase
            let linkOpacity = 1
            let linkBrightness = 1

            if (searchPhase === 'searching') {
              // Wave effect on links
              const linkCenterDist = Math.sqrt(cx * cx + cy * cy)
              const maxRadius = 200
              const waveCycle = 2000
              const waveSpeed = maxRadius / waveCycle
              const waveRadius = (waveTime % waveCycle) * waveSpeed
              const waveThickness = 30

              if (Math.abs(linkCenterDist - waveRadius) < waveThickness) {
                linkBrightness = 1.5
              }
            } else if (searchPhase === 'found' || searchPhase === 'complete') {
              if (foundNodeIds.length > 0) {
                if (isFoundLink) {
                  linkBrightness = searchPhase === 'complete' ? 2 : 1.5
                } else {
                  linkOpacity = 0.2
                }
              }
            }

            ctx.globalAlpha = linkOpacity

            // Gradient stroke
            const grad = ctx.createLinearGradient(sx, sy, tx, ty)
            if (isFoundLink && (searchPhase === 'found' || searchPhase === 'complete')) {
              // Bright purple for found connections
              const intensity = searchPhase === 'complete' ? 0.9 : 0.6
              grad.addColorStop(0, `rgba(167, 139, 250, ${intensity})`)
              grad.addColorStop(0.5, `rgba(139, 92, 246, ${intensity * 0.8})`)
              grad.addColorStop(1, `rgba(167, 139, 250, ${intensity})`)

              // Add glow effect for complete phase
              if (searchPhase === 'complete') {
                ctx.shadowColor = 'rgba(139, 92, 246, 0.8)'
                ctx.shadowBlur = 8
              }
            } else {
              const baseIntensity = 0.3 * linkBrightness
              const midIntensity = 0.15 * linkBrightness
              grad.addColorStop(0, `rgba(139, 92, 246, ${Math.min(1, baseIntensity)})`)
              grad.addColorStop(0.5, `rgba(139, 92, 246, ${Math.min(1, midIntensity)})`)
              grad.addColorStop(1, `rgba(139, 92, 246, ${Math.min(1, baseIntensity)})`)
            }

            ctx.beginPath()
            ctx.moveTo(sx, sy)
            ctx.quadraticCurveTo(cx, cy, tx, ty)
            ctx.strokeStyle = grad
            ctx.lineWidth = isFoundLink && searchPhase === 'complete' ? 2.5 : 1.5
            ctx.stroke()

            // Reset shadow
            ctx.shadowBlur = 0

            // Arrow
            const angle = Math.atan2(ty - cy, tx - cx)
            const aLen = 5
            ctx.beginPath()
            ctx.moveTo(tx, ty)
            ctx.lineTo(tx - aLen * Math.cos(angle - Math.PI/6), ty - aLen * Math.sin(angle - Math.PI/6))
            ctx.lineTo(tx - aLen * Math.cos(angle + Math.PI/6), ty - aLen * Math.sin(angle + Math.PI/6))
            ctx.closePath()
            ctx.fillStyle = isFoundLink && (searchPhase === 'found' || searchPhase === 'complete')
              ? 'rgba(167, 139, 250, 0.9)'
              : 'rgba(139, 92, 246, 0.5)'
            ctx.fill()

            // Edge label
            const dist = Math.sqrt(dx*dx + dy*dy)
            if (l.label && dist > 80) {
              ctx.font = '9px "Pretendard", sans-serif'
              ctx.textAlign = 'center'
              ctx.textBaseline = 'middle'
              ctx.fillStyle = isFoundLink && (searchPhase === 'found' || searchPhase === 'complete')
                ? 'rgba(167, 139, 250, 1)'
                : 'rgba(167, 139, 250, 0.6)'
              ctx.fillText(l.label, cx, cy)
            }

            // Reset global alpha
            ctx.globalAlpha = 1
          }}
          linkCanvasObjectMode={() => 'replace'}
        />
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none z-20" />
    </div>
  )
}
