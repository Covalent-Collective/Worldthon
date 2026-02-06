import { MiniKit, VerificationLevel, ISuccessResult } from '@worldcoin/minikit-js'

// 클라이언트 측 mock auth: NODE_ENV가 development일 때만 허용
// 실제 보안은 서버 측(ALLOW_MOCK_AUTH)에서 강제됨
const ALLOW_MOCK_AUTH =
  process.env.NODE_ENV === 'development' &&
  process.env.NEXT_PUBLIC_ALLOW_MOCK_AUTH === 'true'

export const initMiniKit = () => {
  if (typeof window !== 'undefined') {
    MiniKit.install()
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
      console.error('[AUTH] Server verification failed:', response.status)
      return null
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
    return null
  }
}

export const getAppId = (): string => {
  return process.env.NEXT_PUBLIC_APP_ID || 'app_staging_xxx'
}

export const getActionId = (): string => {
  return process.env.NEXT_PUBLIC_ACTION_ID || 'contribute'
}
