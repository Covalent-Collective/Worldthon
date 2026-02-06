import { describe, it, expect, vi, beforeEach } from 'vitest'

// ========================================
// Supabase mock setup (using vi.hoisted so
// variables are available inside vi.mock)
// ========================================

const {
  mockSingle,
  mockRpc,
  mockOrder,
  mockIn,
  mockEq,
  mockSelect,
  mockInsert,
  mockUpdate,
  mockFrom,
  chain,
  mockClient,
} = vi.hoisted(() => {
  const mockSingle = vi.fn()
  const mockRpc = vi.fn()
  const mockOrder = vi.fn()
  const mockIn = vi.fn()
  const mockEq = vi.fn()
  const mockSelect = vi.fn()
  const mockInsert = vi.fn()
  const mockUpdate = vi.fn()
  const mockFrom = vi.fn()

  const chain: Record<string, ReturnType<typeof vi.fn>> = {
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    eq: mockEq,
    in: mockIn,
    single: mockSingle,
    order: mockOrder,
  }

  // Every chainable method returns the chain so chaining continues
  for (const fn of Object.values(chain)) {
    fn.mockReturnValue(chain)
  }

  mockFrom.mockReturnValue(chain)
  mockRpc.mockResolvedValue({ data: null, error: null })

  const mockClient = {
    from: mockFrom,
    rpc: mockRpc,
  }

  return {
    mockSingle,
    mockRpc,
    mockOrder,
    mockIn,
    mockEq,
    mockSelect,
    mockInsert,
    mockUpdate,
    mockFrom,
    chain,
    mockClient,
  }
})

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: vi.fn().mockReturnValue(true),
  getSupabase: vi.fn().mockReturnValue(mockClient),
}))

// Mock window + localStorage for JWT token access (getToken checks typeof window)
const localStore: Record<string, string> = {}
const mockLocalStorage = {
  getItem: (key: string): string | null => localStore[key] ?? null,
  setItem: (key: string, value: string) => { localStore[key] = value },
  removeItem: (key: string) => { delete localStore[key] },
  clear: () => { for (const k in localStore) delete localStore[k] },
}
vi.stubGlobal('window', globalThis)
vi.stubGlobal('localStorage', mockLocalStorage)

// Mock global fetch for API route calls
const mockFetch = vi.hoisted(() => vi.fn())
vi.stubGlobal('fetch', mockFetch)

// Suppress console.error / console.warn in tests
vi.spyOn(console, 'error').mockImplementation(() => {})
vi.spyOn(console, 'warn').mockImplementation(() => {})

// Import AFTER mocks are registered
import {
  claimRewards,
  recordCitations,
  addContribution,
} from '@/lib/api'

// ========================================
// Reset helpers
// ========================================

beforeEach(() => {
  vi.clearAllMocks()

  // Re-establish default chain behaviour after clearAllMocks
  for (const fn of [mockSelect, mockInsert, mockUpdate, mockEq, mockIn, mockSingle, mockOrder]) {
    fn.mockReturnValue(chain)
  }
  mockFrom.mockReturnValue(chain)
  mockRpc.mockResolvedValue({ data: null, error: null })

  // Clear localStorage and reset fetch
  for (const k in localStore) delete localStore[k]
  mockFetch.mockReset()
})

// ========================================
// P0-2 / P2: claimRewards() via API route
// ========================================

// Helper: set JWT token in localStorage (simulates zustand persist)
function setToken(token: string) {
  localStore['seed-vault-user'] = JSON.stringify({ state: { token } })
}

describe('claimRewards', () => {
  it('should throw "Authentication required" when no token in localStorage', async () => {
    await expect(claimRewards('user-1', 'any-hash')).rejects.toThrow(
      'Authentication required'
    )
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should call /api/claim with Bearer token and return amount', async () => {
    // Arrange
    setToken('valid-jwt-token')
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ amount: 5.5 }),
    })

    // Act
    const result = await claimRewards('user-1', 'correct-hash')

    // Assert
    expect(result).toBe(5.5)
    expect(mockFetch).toHaveBeenCalledWith('/api/claim', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-jwt-token',
      },
    })
  })

  it('should throw server error message when API returns non-ok', async () => {
    // Arrange
    setToken('valid-jwt-token')
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Orb verification required' }),
    })

    // Act & Assert
    await expect(claimRewards('user-1', 'hash')).rejects.toThrow(
      'Orb verification required'
    )
  })
})

// ========================================
// P0-3: recordCitations() race condition
// ========================================

describe('recordCitations', () => {
  it('should batch INSERT all citations in one call', async () => {
    // Arrange: insert returns success
    mockInsert.mockReturnValueOnce({ error: null })

    // rpc returns success
    mockRpc.mockResolvedValue({ data: null, error: null })

    // For the contributor reward update: from('knowledge_nodes').select().in()
    mockIn.mockResolvedValueOnce({ data: [], error: null })

    // Act
    await recordCitations(['node-1', 'node-2', 'node-3'], 'session-1', null)

    // Assert: insert was called with an array of 3 citation objects
    expect(mockInsert).toHaveBeenCalledWith([
      { node_id: 'node-1', session_id: 'session-1', context: null },
      { node_id: 'node-2', session_id: 'session-1', context: null },
      { node_id: 'node-3', session_id: 'session-1', context: null },
    ])
  })

  it('should call RPC increment_citation_count in parallel for each nodeId', async () => {
    // Arrange
    mockInsert.mockReturnValueOnce({ error: null })
    mockRpc.mockResolvedValue({ data: null, error: null })
    mockIn.mockResolvedValueOnce({ data: [], error: null })

    // Act
    await recordCitations(['node-1', 'node-2'], 'session-1', null)

    // Assert: rpc called once per node
    expect(mockRpc).toHaveBeenCalledTimes(2)
    expect(mockRpc).toHaveBeenCalledWith('increment_citation_count', { node_id: 'node-1' })
    expect(mockRpc).toHaveBeenCalledWith('increment_citation_count', { node_id: 'node-2' })
  })

  it('should not throw when RPC fails (graceful degradation)', async () => {
    // Arrange: insert succeeds
    mockInsert.mockReturnValueOnce({ error: null })

    // rpc returns errors
    mockRpc.mockResolvedValue({ data: null, error: { message: 'RPC failed' } })

    // contributor reward path
    mockIn.mockResolvedValueOnce({ data: [], error: null })

    // Act & Assert: function completes without throwing
    await expect(
      recordCitations(['node-1'], 'session-1', 'some-context')
    ).resolves.toBeUndefined()
  })
})

// ========================================
// P0-4 / P2: addContribution() via API route
// ========================================

describe('addContribution', () => {
  it('should throw "Authentication required" when no token in localStorage', async () => {
    await expect(
      addContribution('bot-1', 'user-1', 'Test Label', 'Test Content')
    ).rejects.toThrow('Authentication required')
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should call /api/contribute with Bearer token and return nodeId', async () => {
    // Arrange
    setToken('valid-jwt-token')
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ nodeId: 'new-node-id' }),
    })

    // Act
    const nodeId = await addContribution('bot-1', 'user-1', 'Test Label', 'Test Content')

    // Assert
    expect(nodeId).toBe('new-node-id')
    expect(mockFetch).toHaveBeenCalledWith('/api/contribute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-jwt-token',
      },
      body: JSON.stringify({ botId: 'bot-1', label: 'Test Label', content: 'Test Content' }),
    })
  })

  it('should throw server error when API returns 403 (not Orb verified)', async () => {
    // Arrange
    setToken('valid-jwt-token')
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Orb verification required for contributions' }),
    })

    // Act & Assert
    await expect(
      addContribution('bot-1', 'user-1', 'Label', 'Content')
    ).rejects.toThrow('Orb verification required for contributions')
  })
})
