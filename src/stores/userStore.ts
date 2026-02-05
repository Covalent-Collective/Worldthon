import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as api from '@/lib/api'
import { isSupabaseConfigured } from '@/lib/supabase'
import type { UserRewards } from '@/lib/types'

interface GlobalStats {
  totalNodes: number
  totalContributors: number
  totalBots: number
}

interface ContributionRecord {
  botId: string
  nodeId: string
  createdAt: string
  label?: string
  citationCount?: number
  botName?: string
  botIcon?: string
}

interface UserState {
  // 인증 상태 (로컬 캐시)
  isVerified: boolean
  nullifierHash: string | null
  userId: string | null

  // 보상 데이터
  rewards: UserRewards & { contributions: ContributionRecord[] }
  globalStats: GlobalStats
  isLoading: boolean

  // Actions
  setVerified: (verified: boolean, nullifierHash?: string) => Promise<void>
  loadUserData: () => Promise<void>
  addContribution: (botId: string, label: string, content: string) => Promise<string>
  claimRewards: () => Promise<number>
  loadGlobalStats: () => Promise<void>
  logout: () => void

  // Legacy (로컬 전용)
  incrementCitations: (count: number) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      isVerified: false,
      nullifierHash: null,
      userId: null,
      rewards: {
        contributionPower: 0,
        totalCitations: 0,
        pendingWLD: 0,
        contributions: []
      },
      globalStats: {
        totalNodes: 192,
        totalContributors: 65,
        totalBots: 5
      },
      isLoading: false,

      setVerified: async (verified, nullifierHash) => {
        if (!verified || !nullifierHash) {
          set({ isVerified: false, nullifierHash: null, userId: null })
          return
        }

        // Supabase 연결되어 있으면 서버에서 사용자 생성/조회
        if (isSupabaseConfigured()) {
          try {
            const user = await api.getOrCreateUser(nullifierHash)
            set({
              isVerified: true,
              nullifierHash,
              userId: user.id
            })

            // 사용자 데이터 로드
            await get().loadUserData()
            await get().loadGlobalStats()
          } catch (error) {
            console.error('Failed to verify user with Supabase:', error)
            // Fallback: 로컬 모드
            set({
              isVerified: true,
              nullifierHash,
              userId: null
            })
          }
        } else {
          // 로컬 모드
          set({
            isVerified: true,
            nullifierHash,
            userId: null
          })
        }
      },

      loadUserData: async () => {
        const { userId } = get()
        if (!userId || !isSupabaseConfigured()) return

        set({ isLoading: true })

        try {
          const [rewards, contributions] = await Promise.all([
            api.getUserRewards(userId),
            api.getUserContributions(userId)
          ])

          set({
            rewards: {
              contributionPower: rewards?.contribution_power || 0,
              totalCitations: rewards?.total_citations || 0,
              pendingWLD: Number(rewards?.pending_wld || 0),
              contributions: contributions.map((c: {
                bot_id: string
                node_id: string
                created_at: string
                knowledge_nodes?: { label: string; citation_count: number } | null
                bots?: { name: string; icon: string } | null
              }) => ({
                botId: c.bot_id,
                nodeId: c.node_id,
                createdAt: c.created_at,
                label: c.knowledge_nodes?.label,
                citationCount: c.knowledge_nodes?.citation_count || 0,
                botName: c.bots?.name,
                botIcon: c.bots?.icon
              }))
            }
          })
        } catch (error) {
          console.error('Failed to load user data:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      addContribution: async (botId, label, content) => {
        const { userId } = get()

        if (isSupabaseConfigured() && userId) {
          // Supabase 모드
          const nodeId = await api.addContribution(botId, userId, label, content)

          // 로컬 상태 즉시 업데이트 (낙관적 업데이트)
          set(state => ({
            rewards: {
              ...state.rewards,
              contributionPower: Math.min(state.rewards.contributionPower + 5, 100),
              contributions: [
                {
                  botId,
                  nodeId,
                  createdAt: new Date().toISOString(),
                  label
                },
                ...state.rewards.contributions
              ]
            },
            globalStats: {
              ...state.globalStats,
              totalNodes: state.globalStats.totalNodes + 1
            }
          }))

          // 글로벌 통계 비동기 리프레시
          get().loadGlobalStats()

          return nodeId
        } else {
          // 로컬 모드 (기존 로직)
          const nodeId = `node-${Date.now()}`

          set((state) => ({
            rewards: {
              ...state.rewards,
              contributionPower: Math.min(100, state.rewards.contributionPower + 5),
              contributions: [
                {
                  botId,
                  nodeId,
                  createdAt: new Date().toISOString(),
                  label
                },
                ...state.rewards.contributions
              ]
            },
            globalStats: {
              ...state.globalStats,
              totalNodes: state.globalStats.totalNodes + 1
            }
          }))

          return nodeId
        }
      },

      claimRewards: async () => {
        const { userId } = get()

        if (isSupabaseConfigured() && userId) {
          const amount = await api.claimRewards(userId)

          set(state => ({
            rewards: {
              ...state.rewards,
              pendingWLD: 0
            }
          }))

          return amount
        } else {
          // 로컬 모드
          const amount = get().rewards.pendingWLD
          set(state => ({
            rewards: {
              ...state.rewards,
              pendingWLD: 0
            }
          }))
          return amount
        }
      },

      loadGlobalStats: async () => {
        if (!isSupabaseConfigured()) return

        try {
          const stats = await api.getGlobalStats()
          if (stats) {
            set({
              globalStats: {
                totalNodes: stats.total_nodes,
                totalContributors: stats.total_contributors,
                totalBots: stats.total_bots
              }
            })
          }
        } catch (error) {
          console.error('Failed to load global stats:', error)
        }
      },

      incrementCitations: (count) => set((state) => ({
        rewards: {
          ...state.rewards,
          totalCitations: state.rewards.totalCitations + count,
          pendingWLD: state.rewards.pendingWLD + (count * 0.001)
        }
      })),

      logout: () => set({
        isVerified: false,
        nullifierHash: null,
        userId: null,
        rewards: {
          contributionPower: 0,
          totalCitations: 0,
          pendingWLD: 0,
          contributions: []
        }
      })
    }),
    {
      name: 'seed-vault-user',
      // 서버 데이터는 persist하지 않고 인증 정보만 유지
      partialize: (state) => ({
        isVerified: state.isVerified,
        nullifierHash: state.nullifierHash,
        userId: state.userId
      })
    }
  )
)
