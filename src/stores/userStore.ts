import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserRewards, KnowledgeNode } from '@/lib/types'

interface UserState {
  isVerified: boolean
  nullifierHash: string | null
  rewards: UserRewards
  setVerified: (verified: boolean, nullifierHash?: string) => void
  addContribution: (botId: string, node: KnowledgeNode) => void
  incrementCitations: (count: number) => void
  claimRewards: () => void
  logout: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      isVerified: false,
      nullifierHash: null,
      rewards: {
        contributionPower: 0,
        totalCitations: 0,
        pendingWLD: 0,
        contributions: []
      },

      setVerified: (verified, nullifierHash) => set({
        isVerified: verified,
        nullifierHash: nullifierHash || null
      }),

      addContribution: (botId, node) => set((state) => ({
        rewards: {
          ...state.rewards,
          contributionPower: Math.min(100, state.rewards.contributionPower + 5),
          contributions: [
            ...state.rewards.contributions,
            {
              botId,
              nodeId: node.id,
              createdAt: new Date().toISOString()
            }
          ]
        }
      })),

      incrementCitations: (count) => set((state) => ({
        rewards: {
          ...state.rewards,
          totalCitations: state.rewards.totalCitations + count,
          pendingWLD: state.rewards.pendingWLD + (count * 0.001) // Mock: 0.001 WLD per citation
        }
      })),

      claimRewards: () => set((state) => ({
        rewards: {
          ...state.rewards,
          pendingWLD: 0
        }
      })),

      logout: () => set({
        isVerified: false,
        nullifierHash: null,
        rewards: {
          contributionPower: 0,
          totalCitations: 0,
          pendingWLD: 0,
          contributions: []
        }
      })
    }),
    {
      name: 'seed-vault-user'
    }
  )
)
