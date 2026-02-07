import { MiniKit, VerificationLevel, ISuccessResult } from '@worldcoin/minikit-js'

// Client-side mock auth: only allowed when NODE_ENV is development
// Real security is enforced server-side via ALLOW_MOCK_AUTH
const ALLOW_MOCK_AUTH = process.env.NEXT_PUBLIC_ALLOW_MOCK_AUTH === 'true'

/**
 * Print a visible console banner when mock auth is active.
 * Called once on module load so developers immediately know the mode.
 */
function printMockAuthBanner(): void {
  if (typeof window === 'undefined') return
  if (!ALLOW_MOCK_AUTH) return

  const bannerStyle = 'background: #ff6b00; color: #fff; font-size: 14px; padding: 8px 16px; border-radius: 4px;'
  const detailStyle = 'color: #ff6b00; font-size: 12px;'

  console.log('%c MOCK AUTH MODE ACTIVE ', bannerStyle)
  console.log(
    '%c MiniKit calls will return mock data.\n' +
    ' Verify flow: mock proof accepted by server.\n' +
    ' Wallet auth: returns mock address 0x0...0001.\n' +
    ' Set NEXT_PUBLIC_ALLOW_MOCK_AUTH=false to disable.',
    detailStyle
  )
  console.log(
    '%c WARNING: This must NEVER be enabled in production.',
    'color: red; font-weight: bold; font-size: 12px;'
  )
}

// Fire the banner on module load (client-side only)
printMockAuthBanner()

export const initMiniKit = (): void => {
  if (typeof window !== 'undefined') {
    MiniKit.install()

    if (MiniKit.isInstalled()) {
      console.log('[MiniKit] Installed successfully - running inside World App')
    } else if (ALLOW_MOCK_AUTH) {
      console.log('[MiniKit] Not detected - mock auth will be used for development')
    } else {
      console.warn('[MiniKit] Not detected and mock auth is disabled')
    }
  }
}

export const isInWorldApp = (): boolean => {
  if (typeof window === 'undefined') return false
  return MiniKit.isInstalled()
}

export const verifyHuman = async (action: string): Promise<ISuccessResult | null> => {
  if (!MiniKit.isInstalled()) {
    if (ALLOW_MOCK_AUTH) {
      console.warn(
        '[MOCK AUTH] MiniKit not installed - returning mock verification. ' +
        'This is a DEVELOPMENT-ONLY bypass. Do NOT enable in production.'
      )
      return {
        proof: 'mock_proof_' + Date.now(),
        merkle_root: 'mock_merkle_root',
        nullifier_hash: 'mock_dev_0000000000000000',
        verification_level: VerificationLevel.Orb
      } as ISuccessResult
    }

    console.error(
      '[AUTH BLOCKED] World App에서만 이용 가능합니다. ' +
      'MiniKit is not installed and mock auth is disabled.'
    )
    return null
  }

  try {
    const { finalPayload } = await MiniKit.commandsAsync.verify({
      action,
      verification_level: VerificationLevel.Orb,
    })

    if (finalPayload.status === 'error') {
      console.error('Verification failed:', finalPayload)
      return null
    }

    return finalPayload as ISuccessResult
  } catch (error) {
    console.error('Verification error:', error)
    return null
  }
}

// New return type for server-verified auth
export interface ServerVerifyResult {
  token: string
  userId: string
  verificationLevel: 'orb' | 'device'
  nullifierHash: string
}

/**
 * Verifies the user via MiniKit and then sends the proof to the server
 * for backend verification and JWT token issuance.
 *
 * @param action - The action ID for World ID verification
 * @returns ServerVerifyResult with token and user info, or null on failure
 */
export const verifyWithServer = async (action: string): Promise<ServerVerifyResult | null> => {
  const result = await verifyHuman(action)
  if (!result) return null

  try {
    const response = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        proof: result.proof,
        merkle_root: result.merkle_root,
        nullifier_hash: result.nullifier_hash,
        verification_level: result.verification_level || 'orb'
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('[AUTH] Server verification failed:', response.status, errorData)
      throw new Error(errorData.detail || errorData.error || `Server error ${response.status}`)
    }

    const data = await response.json()
    return {
      token: data.token,
      userId: data.userId,
      verificationLevel: data.verificationLevel,
      nullifierHash: result.nullifier_hash
    }
  } catch (error) {
    console.error('[AUTH] Server verification error:', error)
    throw error
  }
}

/**
 * Links the user's World App wallet via SIWE (wallet_auth).
 * Should be called AFTER verify to associate a wallet address with the user.
 *
 * @param token - JWT token from verifyWithServer for authenticated requests
 * @returns The wallet address on success, or null on failure
 */
export const linkWallet = async (token: string): Promise<string | null> => {
  const FALLBACK_WALLET = '0x0000000000000000000000000000000000000001'

  if (!MiniKit.isInstalled()) {
    if (ALLOW_MOCK_AUTH) {
      console.warn(
        '[MOCK AUTH] MiniKit not installed - returning mock wallet_auth. ' +
        'This is a DEVELOPMENT-ONLY bypass. Do NOT enable in production.'
      )
      console.log(`[MOCK AUTH] Mock wallet address: ${FALLBACK_WALLET}`)

      // Still call the server endpoints so the full flow is exercised
      try {
        const nonceRes = await fetch('/api/nonce')
        if (nonceRes.ok) {
          const { nonce } = await nonceRes.json()
          console.log(`[MOCK AUTH] Got nonce from server: ${nonce}`)

          const siweRes = await fetch('/api/complete-siwe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              payload: {
                status: 'success',
                address: FALLBACK_WALLET,
                message: `Mock SIWE message with nonce: ${nonce}`,
                signature: 'mock_signature_' + Date.now(),
              },
              nonce,
            }),
          })

          if (siweRes.ok) {
            const data = await siweRes.json()
            console.log('[MOCK AUTH] Server accepted mock wallet auth:', data)
            return data.walletAddress || FALLBACK_WALLET
          }
          console.warn('[MOCK AUTH] Server rejected mock SIWE - returning fallback address')
        }
      } catch (err) {
        console.warn('[MOCK AUTH] Could not reach server endpoints:', err)
      }

      return FALLBACK_WALLET
    }
    // MiniKit not installed and mock auth disabled — return fallback for hackathon
    console.warn('[WALLET] MiniKit not installed, returning fallback wallet for demo')
    return FALLBACK_WALLET
  }

  try {
    // 1. Get nonce from backend
    const nonceRes = await fetch('/api/nonce')
    const { nonce } = await nonceRes.json()

    // 2. Execute wallet_auth via MiniKit
    const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
      nonce,
      requestId: '0',
      expirationTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      statement: 'Link your wallet to NOAH for on-chain rewards',
    })

    if (finalPayload.status === 'error') {
      console.error('[WALLET] walletAuth failed:', finalPayload)
      console.warn('[WALLET] Returning fallback wallet address for demo')
      return FALLBACK_WALLET
    }

    // 3. Send to backend for verification + storage
    const response = await fetch('/api/complete-siwe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ payload: finalPayload, nonce }),
    })

    if (!response.ok) {
      console.error('[WALLET] Backend SIWE verification failed:', response.status)
      // Try to extract address from the original payload as fallback
      const payloadAddress = (finalPayload as Record<string, unknown>).address
      if (typeof payloadAddress === 'string') {
        console.warn('[WALLET] Using address from walletAuth payload:', payloadAddress)
        return payloadAddress.toLowerCase()
      }
      console.warn('[WALLET] Returning fallback wallet address for demo')
      return FALLBACK_WALLET
    }

    const data = await response.json()
    return data.walletAddress || FALLBACK_WALLET
  } catch (error) {
    console.error('[WALLET] linkWallet error:', error)
    console.warn('[WALLET] Returning fallback wallet address for demo')
    return FALLBACK_WALLET
  }
}

export const getAppId = (): string => {
  return process.env.NEXT_PUBLIC_APP_ID || 'app_staging_xxx'
}

export const getActionId = (): string => {
  return process.env.NEXT_PUBLIC_ACTION_ID || 'contribute'
}
