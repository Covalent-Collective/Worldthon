'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { verifyWithServer, linkWallet as linkWalletApi, getActionId } from '@/lib/minikit'
import { useUserStore } from '@/stores/userStore'

export type AuthStep = 'verify' | 'wallet' | 'complete'

interface AuthState {
  // Auth data
  isAuthenticated: boolean
  token: string | null
  userId: string | null
  walletAddress: string | null
  verificationLevel: 'orb' | 'device' | null

  // Flow state
  currentStep: AuthStep
  isLoading: boolean
  error: string | null

  // Actions
  login: () => Promise<boolean>
  linkWallet: () => Promise<boolean>
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      token: null,
      userId: null,
      walletAddress: null,
      verificationLevel: null,

      currentStep: 'verify',
      isLoading: false,
      error: null,

      login: async (): Promise<boolean> => {
        set({ isLoading: true, error: null })

        try {
          const result = await verifyWithServer(getActionId())

          if (!result) {
            set({
              isLoading: false,
              error: 'World ID verification failed. Please try again.',
            })
            return false
          }

          // Sync with userStore so the rest of the app stays consistent
          await useUserStore.getState().setVerified(true, {
            token: result.token,
            userId: result.userId,
            verificationLevel: result.verificationLevel,
            nullifierHash: result.nullifierHash,
          })

          set({
            isAuthenticated: true,
            token: result.token,
            userId: result.userId,
            verificationLevel: result.verificationLevel,
            currentStep: 'wallet',
            isLoading: false,
            error: null,
          })

          return true
        } catch (err) {
          const message =
            err instanceof Error ? err.message : 'An unexpected error occurred during verification.'
          set({
            isLoading: false,
            error: message,
          })
          return false
        }
      },

      linkWallet: async (): Promise<boolean> => {
        const { token } = get()

        if (!token) {
          set({ error: 'Not authenticated. Please verify with World ID first.' })
          return false
        }

        set({ isLoading: true, error: null })

        try {
          const walletAddress = await linkWalletApi(token)

          if (!walletAddress) {
            set({
              isLoading: false,
              error: 'Wallet linking failed. Please try again.',
            })
            return false
          }

          set({
            walletAddress,
            currentStep: 'complete',
            isLoading: false,
            error: null,
          })

          return true
        } catch (err) {
          const message =
            err instanceof Error ? err.message : 'An unexpected error occurred during wallet linking.'
          set({
            isLoading: false,
            error: message,
          })
          return false
        }
      },

      logout: (): void => {
        // Also clear the userStore
        useUserStore.getState().logout()

        set({
          isAuthenticated: false,
          token: null,
          userId: null,
          walletAddress: null,
          verificationLevel: null,
          currentStep: 'verify',
          isLoading: false,
          error: null,
        })
      },

      clearError: (): void => {
        set({ error: null })
      },
    }),
    {
      name: 'seed-vault-auth',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        userId: state.userId,
        walletAddress: state.walletAddress,
        verificationLevel: state.verificationLevel,
        currentStep: state.currentStep,
      }),
    }
  )
)
