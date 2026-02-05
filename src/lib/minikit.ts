import { MiniKit, VerificationLevel, MiniAppVerifyActionPayload, ISuccessResult } from '@worldcoin/minikit-js'

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
    console.warn('MiniKit not installed - running in mock mode')
    // Return mock result for development
    return {
      proof: 'mock_proof_' + Date.now(),
      merkle_root: 'mock_merkle_root',
      nullifier_hash: '0x' + Math.random().toString(16).slice(2, 10) + '...anon',
      verification_level: VerificationLevel.Orb
    } as ISuccessResult
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

export const getAppId = (): string => {
  return process.env.NEXT_PUBLIC_APP_ID || 'app_staging_xxx'
}

export const getActionId = (): string => {
  return process.env.NEXT_PUBLIC_ACTION_ID || 'contribute'
}
