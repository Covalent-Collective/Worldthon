import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CitationEvent {
  nodeId: string
  timestamp: number
}

interface CitationState {
  // nodeId -> additional citations (on top of base count from mock data)
  citations: Record<string, number>
  // Track recent citations for animation purposes
  recentCitations: CitationEvent[]
  // Record a citation for multiple nodes
  recordCitation: (nodeIds: string[]) => void
  // Get the total citation count (base + additional)
  getCitationCount: (nodeId: string, baseCount: number) => number
  // Check if a node was recently cited (for animation)
  wasRecentlyCited: (nodeId: string) => boolean
  // Clear a recent citation event (after animation completes)
  clearRecentCitation: (nodeId: string) => void
  // Get all recent citation node IDs
  getRecentlycitedNodes: () => string[]
}

const RECENT_CITATION_WINDOW_MS = 3000 // 3 seconds for animation window

export const useCitationStore = create<CitationState>()(
  persist(
    (set, get) => ({
      citations: {},
      recentCitations: [],

      recordCitation: (nodeIds: string[]) => {
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
      name: 'seed-vault-citations'
    }
  )
)
