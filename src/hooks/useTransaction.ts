'use client'

import { useState, useCallback } from 'react'

export interface TransactionState {
  /** The transaction_id returned by World App (not the on-chain tx hash) */
  transactionId: string | null
  /** Whether we are waiting for on-chain confirmation */
  isConfirming: boolean
  /** Whether the transaction has been confirmed */
  isConfirmed: boolean
  /** The on-chain transaction hash once confirmed */
  txHash: string | null
}

/**
 * React hook for tracking the lifecycle of a MiniKit transaction.
 *
 * For the hackathon demo, confirmation is simulated with a short delay.
 * In production this would poll the RPC or listen for World App callbacks.
 */
export function useTransaction() {
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)

  const trackTransaction = useCallback(async (txId: string) => {
    setTransactionId(txId)
    setIsConfirming(true)
    setIsConfirmed(false)
    setTxHash(null)

    // Demo: simulate confirmation after a brief delay.
    // Production: poll publicClient.getTransactionReceipt or use WS.
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setTxHash(txId) // In production, resolve actual hash from txId
      setIsConfirmed(true)
    } catch (error) {
      console.error('[useTransaction] Tracking failed:', error)
    } finally {
      setIsConfirming(false)
    }
  }, [])

  const reset = useCallback(() => {
    setTransactionId(null)
    setIsConfirming(false)
    setIsConfirmed(false)
    setTxHash(null)
  }, [])

  return {
    transactionId,
    isConfirming,
    isConfirmed,
    txHash,
    trackTransaction,
    reset,
  }
}
