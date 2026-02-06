import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { recordCitations } from '@/lib/api'

interface CitationEvent {
  nodeId: string
  timestamp: number
}

interface CitationState {
  // nodeId -> additional citations (on top of base count from mock data)
  citations: Record<string, number>
  // Track recent citations for animation purposes
  recentCitations: CitationEvent[]
  // Record a citation for multiple nodes (with optional context for Supabase sync)
  recordCitation: (nodeIds: string[], context?: string) => void
  // Get the total citation count (base + additional)
  getCitationCount: (nodeId: string, baseCount: number) => number
  // Check if a node was recently cited (for animation)
  wasRecentlyCited: (nodeId: string) => boolean
  // Clear a recent citation event (after animation completes)
  clearRecentCitation: (nodeId: string) => void
  // Get all recent citation node IDs
  getRecentlycitedNodes: () => string[]
  // Per-page-visit session ID for Supabase citation tracking
  _sessionId: string
}

const RECENT_CITATION_WINDOW_MS = 3000 // 3 seconds for animation window

// Generate a stable session ID per store initialization (page visit)
const generateSessionId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export const useCitationStore = create<CitationState>()(
  persist(
    (set, get) => ({
      citations: {},
      recentCitations: [],
      _sessionId: generateSessionId(),

      recordCitation: (nodeIds: string[], context?: string) => {
        const now = Date.now()
        set((state) => {
          const newCitations = { ...state.citations }
          const newRecentCitations: CitationEvent[] = []

          nodeIds.forEach((nodeId) => {
            // Increment the citation count
            newCitations[nodeId] = (newCitations[nodeId] || 0) + 1
            // Add to recent citations for animation
            newRecentCitations.push({ nodeId, timestamp: now })
          })

          return {
            citations: newCitations,
            recentCitations: [
              ...state.recentCitations.filter(
                (event) => now - event.timestamp < RECENT_CITATION_WINDOW_MS
              ),
              ...newRecentCitations
            ]
          }
        })

        // Sync citations to Supabase (fire-and-forget)
        const sessionId = get()._sessionId
        recordCitations(nodeIds, sessionId, context || null).catch(console.error)
      },

      getCitationCount: (nodeId: string, baseCount: number) => {
        const additionalCitations = get().citations[nodeId] || 0
        return baseCount + additionalCitations
      },

      wasRecentlyCited: (nodeId: string) => {
        const now = Date.now()
        return get().recentCitations.some(
          (event) =>
            event.nodeId === nodeId &&
            now - event.timestamp < RECENT_CITATION_WINDOW_MS
        )
      },

      clearRecentCitation: (nodeId: string) => {
        set((state) => ({
          recentCitations: state.recentCitations.filter(
            (event) => event.nodeId !== nodeId
          )
        }))
      },

      getRecentlycitedNodes: () => {
        const now = Date.now()
        return get()
          .recentCitations.filter(
            (event) => now - event.timestamp < RECENT_CITATION_WINDOW_MS
          )
          .map((event) => event.nodeId)
      }
    }),
    {
      name: 'seed-vault-citations',
      // Only persist citation counts; sessionId regenerates per page visit,
      // recentCitations are ephemeral animation state
      partialize: (state) => ({
        citations: state.citations
      })
    }
  )
)
