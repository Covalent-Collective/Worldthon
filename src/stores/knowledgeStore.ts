import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { KnowledgeNode, KnowledgeEdge } from '@/lib/types'

interface KnowledgeContribution {
  node: KnowledgeNode
  addedAt: string
}

interface KnowledgeState {
  // Store additional nodes added by users: botId -> contributions
  userContributions: Record<string, KnowledgeContribution[]>
  // Store additional edges if user provides relationships
  userEdges: Record<string, KnowledgeEdge[]>

  // Actions
  addNode: (botId: string, node: KnowledgeNode) => void
  addEdge: (botId: string, edge: KnowledgeEdge) => void
  getNodesForBot: (botId: string) => KnowledgeNode[]
  getEdgesForBot: (botId: string) => KnowledgeEdge[]
  getContributionCount: (botId: string) => number
  getTotalContributedNodes: () => number
  removeNode: (botId: string, nodeId: string) => void
}

export const useKnowledgeStore = create<KnowledgeState>()(
  persist(
    (set, get) => ({
      userContributions: {},
      userEdges: {},

      addNode: (botId: string, node: KnowledgeNode) => {
        set((state) => {
          const existingContributions = state.userContributions[botId] || []

          // Prevent duplicate nodes
          if (existingContributions.some(c => c.node.id === node.id)) {
            return state
          }

          return {
            userContributions: {
              ...state.userContributions,
              [botId]: [
                ...existingContributions,
                {
                  node,
                  addedAt: new Date().toISOString()
                }
              ]
            }
          }
        })
      },

      addEdge: (botId: string, edge: KnowledgeEdge) => {
        set((state) => {
          const existingEdges = state.userEdges[botId] || []

          // Prevent duplicate edges
          if (existingEdges.some(e =>
            e.source === edge.source && e.target === edge.target
          )) {
            return state
          }

          return {
            userEdges: {
              ...state.userEdges,
              [botId]: [...existingEdges, edge]
            }
          }
        })
      },

      getNodesForBot: (botId: string) => {
        const contributions = get().userContributions[botId] || []
        return contributions.map(c => c.node)
      },

      getEdgesForBot: (botId: string) => {
        return get().userEdges[botId] || []
      },

      getContributionCount: (botId: string) => {
        const contributions = get().userContributions[botId] || []
        return contributions.length
      },

      getTotalContributedNodes: () => {
        const contributions = get().userContributions
        return Object.values(contributions).reduce(
          (total, botContributions) => total + botContributions.length,
          0
        )
      },

      removeNode: (botId: string, nodeId: string) => {
        set((state) => {
          const existingContributions = state.userContributions[botId] || []
          return {
            userContributions: {
              ...state.userContributions,
              [botId]: existingContributions.filter(c => c.node.id !== nodeId)
            },
            // Also remove any edges connected to this node
            userEdges: {
              ...state.userEdges,
              [botId]: (state.userEdges[botId] || []).filter(
                e => e.source !== nodeId && e.target !== nodeId
              )
            }
          }
        })
      }
    }),
    {
      name: 'seed-vault-knowledge'
    }
  )
)
