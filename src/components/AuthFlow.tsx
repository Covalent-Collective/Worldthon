'use client'

import { useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore, type AuthStep } from '@/stores/authStore'

const stepVariants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.95 },
}

const transition = {
  duration: 0.4,
  ease: [0.25, 0.46, 0.45, 0.94] as const,
}

export function AuthFlow() {
  const { currentStep, isLoading, error, login, linkWallet, clearError } = useAuthStore()

  const handleVerify = useCallback(async () => {
    clearError()
    await login()
  }, [login, clearError])

  const handleLinkWallet = useCallback(async () => {
    clearError()
    await linkWallet()
  }, [linkWallet, clearError])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="flex flex-col items-center text-center space-y-8 w-full max-w-[320px]">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative"
        >
          <div
            className="absolute inset-0 blur-3xl rounded-full animate-pulse-glow"
            style={{ background: 'rgba(221,214,243,0.2)' }}
          />
          <img
            src="/logo.png"
            alt="NOAH"
            className="relative w-24 h-24 rounded-2xl"
          />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-3"
        >
          <h1 className="text-4xl font-bold text-arctic tracking-tight">NOAH</h1>
          <p className="text-arctic/50 text-sm font-mono tracking-wider">
            HUMAN KNOWLEDGE REPOSITORY
          </p>
        </motion.div>

        {/* Step Indicator */}
        <StepIndicator currentStep={currentStep} />

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === 'verify' && (
            <motion.div
              key="verify"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={transition}
              className="w-full space-y-4"
            >
              <p className="text-arctic/60 text-sm leading-relaxed">
                World ID로 인간임을 증명하세요.<br />
                <span className="text-arctic/40">Orb 인증으로 기여하고 보상받을 수 있습니다.</span>
              </p>

              <button
                onClick={handleVerify}
                disabled={isLoading}
                className="w-full"
              >
                <div className="glass-btn-wrap rounded-2xl w-full">
                  <div className="glass-btn rounded-2xl w-full">
                    <span className="glass-btn-text flex items-center justify-center gap-3 py-4 text-sm font-bold">
                      {isLoading ? (
                        <LoadingSpinner />
                      ) : (
                        <img src="/worldcoin-logo.svg" alt="Worldcoin" className="w-5 h-5" />
                      )}
                      {isLoading ? 'Verifying...' : 'Verify with World ID'}
                    </span>
                  </div>
                  <div className="glass-btn-shadow rounded-2xl" />
                </div>
              </button>
            </motion.div>
          )}

          {currentStep === 'wallet' && (
            <motion.div
              key="wallet"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={transition}
              className="w-full space-y-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-14 h-14 mx-auto rounded-full flex items-center justify-center bg-green-500/20 border border-green-500/30"
              >
                <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>

              <p className="text-arctic/60 text-sm leading-relaxed">
                Identity verified.<br />
                <span className="text-arctic/40">Link your wallet for on-chain rewards.</span>
              </p>

              <button
                onClick={handleLinkWallet}
                disabled={isLoading}
                className="w-full"
              >
                <div className="glass-btn-wrap rounded-2xl w-full">
                  <div className="glass-btn rounded-2xl w-full">
                    <span className="glass-btn-text flex items-center justify-center gap-3 py-4 text-sm font-bold">
                      {isLoading ? (
                        <LoadingSpinner />
                      ) : (
                        <WalletIcon />
                      )}
                      {isLoading ? 'Linking wallet...' : 'Link Wallet'}
                    </span>
                  </div>
                  <div className="glass-btn-shadow rounded-2xl" />
                </div>
              </button>

              <button
                onClick={() => {
                  // Allow skipping wallet linking
                  useAuthStore.setState({ currentStep: 'complete' })
                }}
                disabled={isLoading}
                className="text-arctic/40 text-xs hover:text-arctic/60 transition-colors"
              >
                Skip for now
              </button>
            </motion.div>
          )}

          {currentStep === 'complete' && (
            <motion.div
              key="complete"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={transition}
              className="w-full space-y-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
                className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(-20deg, #ddd6f3 0%, #faaca8 100%)' }}
              >
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-arctic text-lg font-bold"
              >
                Welcome to NOAH
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-arctic/50 text-sm"
              >
                You are ready to contribute knowledge.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full glass-card rounded-xl p-3 border-red-500/20"
            >
              <p className="text-red-400 text-xs text-center">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function StepIndicator({ currentStep }: { currentStep: AuthStep }) {
  const steps: { key: AuthStep; label: string }[] = [
    { key: 'verify', label: 'Verify' },
    { key: 'wallet', label: 'Wallet' },
    { key: 'complete', label: 'Ready' },
  ]

  const currentIndex = steps.findIndex((s) => s.key === currentStep)

  return (
    <div className="flex items-center gap-2 w-full max-w-[240px] mx-auto">
      {steps.map((step, index) => {
        const isActive = index === currentIndex
        const isCompleted = index < currentIndex

        return (
          <div key={step.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                  backgroundColor: isCompleted
                    ? 'rgba(34, 197, 94, 0.5)'
                    : isActive
                    ? 'rgba(0, 242, 255, 0.3)'
                    : 'rgba(255, 255, 255, 0.1)',
                  borderColor: isCompleted
                    ? 'rgba(34, 197, 94, 0.6)'
                    : isActive
                    ? 'rgba(0, 242, 255, 0.5)'
                    : 'rgba(255, 255, 255, 0.15)',
                }}
                transition={{ duration: 0.3 }}
                className="w-6 h-6 rounded-full border flex items-center justify-center"
              >
                {isCompleted ? (
                  <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span
                    className={`text-[10px] font-mono ${
                      isActive ? 'text-aurora-cyan' : 'text-arctic/40'
                    }`}
                  >
                    {index + 1}
                  </span>
                )}
              </motion.div>
              <span
                className={`text-[10px] mt-1 font-mono ${
                  isActive ? 'text-arctic/80' : isCompleted ? 'text-green-400/70' : 'text-arctic/30'
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-px flex-1 mx-1 mb-4 transition-colors duration-300 ${
                  isCompleted ? 'bg-green-500/40' : 'bg-white/10'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

function LoadingSpinner() {
  return (
    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

function WalletIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 110-6h5.25A2.25 2.25 0 0121 6v6zm0 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18V6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6m-3 6h.008v.008H18V12z"
      />
    </svg>
  )
}
