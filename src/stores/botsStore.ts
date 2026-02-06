import { create } from 'zustand'
import { fetchAllBots } from '@/lib/mock-data'
import type { ExpertBot } from '@/lib/types'

interface BotsState {
  bots: ExpertBot[]
  isLoading: boolean
  isLoaded: boolean

  // Actions
  loadBots: () => Promise<void>
  getBotById: (id: string) => ExpertBot | undefined
}

export const useBotsStore = create<BotsState>()((set, get) => ({
  bots: [],
  isLoading: false,
  isLoaded: false,

  loadBots: async () => {
    if (get().isLoaded || get().isLoading) return
    set({ isLoading: true })
    try {
      const bots = await fetchAllBots()
      set({ bots, isLoaded: true })
    } catch (error) {
      console.error('Failed to load bots:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  getBotById: (id: string) => {
    return get().bots.find(bot => bot.id === id)
  },
}))
