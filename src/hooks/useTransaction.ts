'use client'

import { useState, useCallback } from 'react'
import { createPublicClient, http } from 'viem'
import { worldchain } from 'viem/chains'

export type TransactionStatus = 'idle' | 'pending' | 'confirming' | 'confirmed' | 'failed'

export interface TransactionState {
  /** Current status of the transaction lifecycle */
  status: TransactionStatus
  /** The on-chain transaction hash */
  txHash: string | null
  /** Error message if the transaction failed */
  error: string | null
}

/**
 * React hook for tracking the lifecycle of an on-chain transaction.
 *
 * Uses viem's publicClient to wait for transaction receipt confirmation
 * on World Chain. Replaces the previous simulated/mock tracking.
 */
export function useTransaction() {
  const [status, setStatus] = useState<TransactionStatus>('idle')
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const trackTransaction = useCallback(async (hash: string) => {
    setTxHash(hash)
    setStatus('confirming')
    setError(null)

    try {
      const client = createPublicClient({
        chain: worldchain,
        transport: http(
          process.env.NEXT_PUBLIC_WORLD_CHAIN_RPC ||
            'https://worldchain-mainnet.g.alchemy.com/public'
        ),
      })

      const receipt = await client.waitForTransactionReceipt({
        hash: hash as `0x${string}`,
        confirmations: 1,
      })

      if (receipt.status === 'success') {
        setStatus('confirmed')
      } else {
        setStatus('failed')
        setError('Transaction reverted')
      }
    } catch (err) {
      setStatus('failed')
      setError(err instanceof Error ? err.message : 'Transaction tracking failed')
    }
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setTxHash(null)
    setError(null)
  }, [])

  /** Manually mark as confirmed (for demo/mock flows without real on-chain tx) */
  const setConfirmed = useCallback((hash?: string) => {
    setTxHash(hash ?? null)
    setStatus('confirmed')
    setError(null)
  }, [])

  return { status, txHash, error, trackTransaction, reset, setConfirmed }
}
