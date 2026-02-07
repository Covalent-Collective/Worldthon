'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getWldBalance } from '@/lib/contract'
import { useUserStore } from '@/stores/userStore'
import { formatUnits } from 'viem'
import type { Address } from 'viem'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  botName: string
  botIcon: string
  storyTitle: string
  wldAmount: number
}

function generateRandomHex(length: number): string {
  const chars = '0123456789abcdef'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}

// Mock constants for payment flow (Phase 2 will replace these)
const MOCK_USD_RATE = 1.68 // 1 WLD = $1.68 USD
const MOCK_GAS_FEE = 0.0001
const MOCK_BLOCK = '#48,291,037'
const MOCK_TX_HASH = '0x7a3f...c2d1'
const MOCK_FROM = '0x1b9e...a4f8'

export function PaymentModal({
  isOpen,
  onClose,
  onConfirm,
  botName,
  botIcon,
  storyTitle,
  wldAmount,
}: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [showCheckmark, setShowCheckmark] = useState(false)
  const [confirmStep, setConfirmStep] = useState(0) // A2: 0, 1, 2, 3
  const [copiedHash, setCopiedHash] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const confirmTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Real WLD balance state
  const [wldBalance, setWldBalance] = useState<string | null>(null)
  const [isLoadingBalance, setIsLoadingBalance] = useState(false)
  const { nullifierHash } = useUserStore()

  const usdEquivalent = (wldAmount * MOCK_USD_RATE).toFixed(2)

  // Fetch real WLD balance on mount when modal opens
  useEffect(() => {
    if (!isOpen) return

    const maybeAddress = nullifierHash && nullifierHash.startsWith('0x') && nullifierHash.length === 42
      ? nullifierHash as Address
      : null

    if (!maybeAddress) {
      setWldBalance(null)
      return
    }

    let cancelled = false
    setIsLoadingBalance(true)

    getWldBalance(maybeAddress)
      .then((balance) => {
        if (cancelled) return
        if (balance !== null) {
          setWldBalance(Number(formatUnits(balance, 18)).toFixed(2))
        } else {
          setWldBalance(null)
        }
      })
      .catch(() => {
        if (!cancelled) setWldBalance(null)
      })
      .finally(() => {
        if (!cancelled) setIsLoadingBalance(false)
      })

    return () => {
      cancelled = true
    }
  }, [isOpen, nullifierHash])

  // Animate the fake tx hash while processing
  useEffect(() => {
    if (!isProcessing) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    setTxHash('0x' + generateRandomHex(40))
    intervalRef.current = setInterval(() => {
      setTxHash('0x' + generateRandomHex(40))
    }, 80)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isProcessing])

  // A2: Confirmation step animation (3 steps, 0.5s each)
  useEffect(() => {
    if (!isProcessing) {
      setConfirmStep(0)
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current)
      return
    }

    setConfirmStep(1)

    const timer1 = setTimeout(() => setConfirmStep(2), 500)
    const timer2 = setTimeout(() => setConfirmStep(3), 1000)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [isProcessing])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsProcessing(false)
      setShowCheckmark(false)
      setTxHash('')
      setConfirmStep(0)
      setCopiedHash(false)
    }
  }, [isOpen])

  const handleConfirm = useCallback(() => {
    setIsProcessing(true)

    // After 1.5s, show receipt (A3: no auto-close)
    setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      setIsProcessing(false)
      setShowCheckmark(true)
    }, 1500)
  }, [])

  // A3: User clicks confirm on receipt to close
  const handleReceiptConfirm = useCallback(() => {
    setShowCheckmark(false)
    onConfirm()
  }, [onConfirm])

  const handleCopyHash = useCallback(() => {
    navigator.clipboard?.writeText('0x7a3f9b2e1d4c6a8f0e3b5d7c9a1f2e4d6b8c0a2e4f6d8b0c2d1').catch(() => {})
    setCopiedHash(true)
    setTimeout(() => setCopiedHash(false), 1500)
  }, [])

  // A2: Progress bar width based on confirm step
  const progressWidth = confirmStep === 0 ? 0 : confirmStep === 1 ? 33 : confirmStep === 2 ? 66 : 100

  // Display balance string
  const balanceDisplay = isLoadingBalance
    ? 'Loading...'
    : wldBalance !== null
      ? `${wldBalance} WLD`
      : '\u2014'

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={!isProcessing && !showCheckmark ? onClose : undefined}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative glass-card rounded-3xl max-w-[340px] w-full p-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Processing State (A2: 3-step confirmation) */}
            {isProcessing && (
              <motion.div
                className="flex flex-col items-center gap-4 py-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-10 h-10 border-2 border-aurora-cyan/30 border-t-aurora-cyan rounded-full animate-spin" />
                <p className="text-sm text-arctic/70">
                  Processing transaction...
                </p>

                {/* Tx hash animation */}
                <div className="w-full overflow-hidden rounded-lg bg-white/5 px-3 py-2">
                  <p className="text-[10px] font-mono text-aurora-cyan/60 truncate">
                    {txHash}
                  </p>
                </div>

                {/* A2: Confirmation steps */}
                <div className="w-full space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-arctic/50">
                      {confirmStep >= 3
                        ? 'Confirm 3/3'
                        : confirmStep === 2
                          ? 'Confirm 2/3...'
                          : 'Confirm 1/3...'}
                    </span>
                    <span className="text-[10px] font-mono text-arctic/25">
                      {progressWidth}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-aurora-cyan/70"
                      initial={{ width: '0%' }}
                      animate={{ width: `${progressWidth}%` }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    />
                  </div>

                  {/* Network + Block info */}
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] font-mono text-arctic/25">
                      Network: World Chain
                    </span>
                    <span className="text-[10px] font-mono text-arctic/25">
                      Block: {MOCK_BLOCK}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Checkmark / Receipt State (A3) */}
            {showCheckmark && !isProcessing && (
              <motion.div
                className="flex flex-col items-center gap-3 py-4"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 15, stiffness: 200 }}
              >
                {/* Checkmark */}
                <div className="w-14 h-14 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center">
                  <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm text-green-400 font-medium">Payment Complete</p>

                {/* A3: Receipt */}
                <div className="w-full mt-2 rounded-2xl bg-white/5 border border-white/10 p-4 space-y-2.5">
                  {/* Tx Hash with copy */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-arctic/40">Tx Hash</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-mono text-aurora-cyan/70">{MOCK_TX_HASH}</span>
                      <button
                        onClick={handleCopyHash}
                        className="text-arctic/30 hover:text-arctic/60 transition-colors"
                        aria-label="Copy transaction hash"
                      >
                        {copiedHash ? (
                          <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <rect x="9" y="9" width="13" height="13" rx="2" strokeWidth={2} />
                            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth={2} />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* From */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-arctic/40">From</span>
                    <span className="text-[11px] font-mono text-arctic/50">{MOCK_FROM}</span>
                  </div>

                  {/* To */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-arctic/40">To</span>
                    <span className="text-[11px] font-mono text-arctic/50">{botName} Vault</span>
                  </div>

                  {/* Amount */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-arctic/40">Amount</span>
                    <span className="text-[11px] font-mono text-aurora-cyan/70">{wldAmount} WLD</span>
                  </div>

                  {/* Block */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-arctic/40">Block</span>
                    <span className="text-[11px] font-mono text-arctic/50">{MOCK_BLOCK}</span>
                  </div>

                  {/* Network */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-arctic/40">Network</span>
                    <span className="text-[11px] font-mono text-arctic/50">World Chain</span>
                  </div>
                </div>

                {/* A3: Confirm button (replaces auto-close) */}
                <button
                  onClick={handleReceiptConfirm}
                  className="w-full mt-2 rounded-xl py-2.5 text-center text-sm font-medium text-white transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #00F2FF 0%, #667EEA 100%)',
                  }}
                >
                  Confirm
                </button>
              </motion.div>
            )}

            {/* Default Payment Content */}
            {!isProcessing && !showCheckmark && (
              <>
                {/* Wallet balance (top-right aligned, real query) */}
                <div className="flex justify-end mb-3">
                  <span className="text-[11px] text-arctic/40">
                    Balance: {balanceDisplay}
                  </span>
                </div>

                {/* Bot Icon + Name */}
                <div className="flex flex-col items-center gap-1.5 mb-3">
                  <span className="text-4xl">{botIcon}</span>
                  <h3 className="text-lg font-bold text-arctic">{botName}</h3>
                </div>

                {/* Story Title Preview */}
                <p className="text-sm text-arctic/70 text-center line-clamp-2 mb-4">
                  {storyTitle}
                </p>

                {/* Divider */}
                <div className="border-t border-white/10 mb-4" />

                {/* WLD Amount + USD equivalent + gas fee */}
                <div className="flex flex-col items-center gap-1 mb-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-digital text-aurora-cyan">
                      {wldAmount}
                    </span>
                    <span className="text-sm font-mono text-arctic/50">WLD</span>
                  </div>
                  {/* USD conversion */}
                  <span className="text-[11px] text-arctic/30">
                    ~ ${usdEquivalent} USD
                  </span>
                  {/* Gas fee */}
                  <span className="text-[10px] text-arctic/25">
                    Gas: ~{MOCK_GAS_FEE} WLD
                  </span>
                  <span className="text-xs text-arctic/40 mt-0.5">Knowledge access fee</span>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-5">
                  <button
                    onClick={onClose}
                    className="flex-1 glass-btn rounded-xl py-2.5 text-center text-sm font-medium text-arctic/70 hover:text-arctic transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="flex-1 rounded-xl py-2.5 text-center text-sm font-medium text-white transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #00F2FF 0%, #667EEA 100%)',
                    }}
                  >
                    Pay
                  </button>
                </div>

                {/* Footer */}
                <p className="text-[10px] text-arctic/30 text-center mt-4">
                  Charged from your World ID verified wallet
                </p>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
