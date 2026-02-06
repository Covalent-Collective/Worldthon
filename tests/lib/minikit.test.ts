import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Top-level mock for @worldcoin/minikit-js
vi.mock('@worldcoin/minikit-js', () => ({
  MiniKit: {
    isInstalled: vi.fn(),
    install: vi.fn(),
    commandsAsync: {
      verify: vi.fn(),
    },
  },
  VerificationLevel: {
    Orb: 'orb',
  },
}))

describe('minikit', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    process.env = { ...originalEnv }
    vi.restoreAllMocks()
  })

  describe('verifyHuman', () => {
    it('P0-1: should return null when MiniKit not installed in production', async () => {
      process.env.NODE_ENV = 'production'
      delete process.env.NEXT_PUBLIC_ALLOW_MOCK_AUTH

      const { MiniKit } = await import('@worldcoin/minikit-js')
      vi.mocked(MiniKit.isInstalled).mockReturnValue(false)

      const { verifyHuman } = await import('@/lib/minikit')

      const result = await verifyHuman('test-action')
      expect(result).toBeNull()
    })

    it('P0-1: should return null when development but ALLOW_MOCK_AUTH is not set', async () => {
      process.env.NODE_ENV = 'development'
      delete process.env.NEXT_PUBLIC_ALLOW_MOCK_AUTH

      const { MiniKit } = await import('@worldcoin/minikit-js')
      vi.mocked(MiniKit.isInstalled).mockReturnValue(false)

      const { verifyHuman } = await import('@/lib/minikit')

      const result = await verifyHuman('test-action')
      expect(result).toBeNull()
    })

    it('P0-1: should return mock result when development + ALLOW_MOCK_AUTH=true', async () => {
      process.env.NODE_ENV = 'development'
      process.env.NEXT_PUBLIC_ALLOW_MOCK_AUTH = 'true'

      const { MiniKit } = await import('@worldcoin/minikit-js')
      vi.mocked(MiniKit.isInstalled).mockReturnValue(false)

      const { verifyHuman } = await import('@/lib/minikit')

      const result = await verifyHuman('test-action')

      expect(result).not.toBeNull()
      expect(result).toHaveProperty('proof')
      expect(result).toHaveProperty('merkle_root', 'mock_merkle_root')
      expect(result).toHaveProperty('nullifier_hash')
      expect(result).toHaveProperty('verification_level', 'orb')
    })

    it('P0-1: mock nullifier_hash should start with mock_dev_ prefix', async () => {
      process.env.NODE_ENV = 'development'
      process.env.NEXT_PUBLIC_ALLOW_MOCK_AUTH = 'true'

      const { MiniKit } = await import('@worldcoin/minikit-js')
      vi.mocked(MiniKit.isInstalled).mockReturnValue(false)

      const { verifyHuman } = await import('@/lib/minikit')

      const result = await verifyHuman('test-action')

      expect(result).not.toBeNull()
      expect(result!.nullifier_hash).toMatch(/^mock_dev_/)
    })

    it('P0-1: should call real verify when MiniKit is installed', async () => {
      process.env.NODE_ENV = 'production'
      delete process.env.NEXT_PUBLIC_ALLOW_MOCK_AUTH

      const { MiniKit } = await import('@worldcoin/minikit-js')
      vi.mocked(MiniKit.isInstalled).mockReturnValue(true)

      const mockPayload = {
        proof: 'real_proof_abc',
        merkle_root: 'real_merkle_root',
        nullifier_hash: 'real_nullifier_hash',
        verification_level: 'orb',
        status: 'success',
      }
      vi.mocked(MiniKit.commandsAsync.verify).mockResolvedValue({
        finalPayload: mockPayload,
      } as any)

      const { verifyHuman } = await import('@/lib/minikit')

      const result = await verifyHuman('test-action')

      expect(MiniKit.commandsAsync.verify).toHaveBeenCalledWith({
        action: 'test-action',
        verification_level: 'orb',
      })
      expect(result).toEqual(mockPayload)
    })

    it('P0-1: should return null when MiniKit verify returns error status', async () => {
      process.env.NODE_ENV = 'production'
      delete process.env.NEXT_PUBLIC_ALLOW_MOCK_AUTH

      const { MiniKit } = await import('@worldcoin/minikit-js')
      vi.mocked(MiniKit.isInstalled).mockReturnValue(true)

      vi.mocked(MiniKit.commandsAsync.verify).mockResolvedValue({
        finalPayload: { status: 'error', error_code: 'generic_error' },
      } as any)

      const { verifyHuman } = await import('@/lib/minikit')

      const result = await verifyHuman('test-action')
      expect(result).toBeNull()
    })

    it('P0-1: should return null when MiniKit verify throws exception', async () => {
      process.env.NODE_ENV = 'production'
      delete process.env.NEXT_PUBLIC_ALLOW_MOCK_AUTH

      const { MiniKit } = await import('@worldcoin/minikit-js')
      vi.mocked(MiniKit.isInstalled).mockReturnValue(true)

      vi.mocked(MiniKit.commandsAsync.verify).mockRejectedValue(
        new Error('Network error')
      )

      const { verifyHuman } = await import('@/lib/minikit')

      const result = await verifyHuman('test-action')
      expect(result).toBeNull()
    })
  })

  describe('initMiniKit', () => {
    it('P0-1: should call MiniKit.install when window is defined', async () => {
      process.env.NODE_ENV = 'production'

      const { MiniKit } = await import('@worldcoin/minikit-js')
      const { initMiniKit } = await import('@/lib/minikit')

      // window is defined in vitest node environment via globalThis
      // We need to simulate window existing
      const originalWindow = globalThis.window
      // @ts-ignore
      globalThis.window = {}

      initMiniKit()
      expect(MiniKit.install).toHaveBeenCalled()

      // Restore
      if (originalWindow === undefined) {
        // @ts-ignore
        delete globalThis.window
      } else {
        globalThis.window = originalWindow
      }
    })
  })

  describe('isInWorldApp', () => {
    it('P0-1: should return false when window is undefined', async () => {
      process.env.NODE_ENV = 'production'

      const originalWindow = globalThis.window
      // @ts-ignore
      delete globalThis.window

      const { isInWorldApp } = await import('@/lib/minikit')

      expect(isInWorldApp()).toBe(false)

      // Restore
      if (originalWindow !== undefined) {
        globalThis.window = originalWindow
      }
    })
  })

  describe('getAppId', () => {
    it('P0-1: should return env value when NEXT_PUBLIC_APP_ID is set', async () => {
      process.env.NEXT_PUBLIC_APP_ID = 'app_my_custom_id'

      const { getAppId } = await import('@/lib/minikit')

      expect(getAppId()).toBe('app_my_custom_id')
    })

    it('P0-1: should return default when NEXT_PUBLIC_APP_ID is not set', async () => {
      delete process.env.NEXT_PUBLIC_APP_ID

      const { getAppId } = await import('@/lib/minikit')

      expect(getAppId()).toBe('app_staging_xxx')
    })
  })

  describe('getActionId', () => {
    it('P0-1: should return env value when NEXT_PUBLIC_ACTION_ID is set', async () => {
      process.env.NEXT_PUBLIC_ACTION_ID = 'my-custom-action'

      const { getActionId } = await import('@/lib/minikit')

      expect(getActionId()).toBe('my-custom-action')
    })

    it('P0-1: should return default when NEXT_PUBLIC_ACTION_ID is not set', async () => {
      delete process.env.NEXT_PUBLIC_ACTION_ID

      const { getActionId } = await import('@/lib/minikit')

      expect(getActionId()).toBe('contribute')
    })
  })
})
