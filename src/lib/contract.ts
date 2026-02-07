import { createPublicClient, http, type Address } from 'viem'
import { worldchain } from 'viem/chains'
import { MiniKit } from '@worldcoin/minikit-js'
import { SEED_VAULT_ABI } from '@/lib/abi/SeedVault'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ZERO_ADDRESS: Address = '0x0000000000000000000000000000000000000000'

export const SEED_VAULT_ADDRESS: Address =
  (process.env.NEXT_PUBLIC_SEED_VAULT_ADDRESS as Address) || ZERO_ADDRESS

export const WLD_TOKEN_ADDRESS: Address =
  (process.env.NEXT_PUBLIC_WLD_TOKEN_ADDRESS as Address) || ZERO_ADDRESS

/** Minimal ERC-20 ABI for balanceOf reads */
const ERC20_BALANCE_ABI = [
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address', internalType: 'address' }],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
] as const

// ---------------------------------------------------------------------------
// Public Client (read-only, no wallet needed)
// ---------------------------------------------------------------------------

export const publicClient = createPublicClient({
  chain: worldchain,
  transport: http(
    process.env.NEXT_PUBLIC_WORLD_CHAIN_RPC ||
      'https://worldchain-mainnet.g.alchemy.com/public'
  ),
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns true when a valid (non-zero) contract address has been configured. */
export function isContractConfigured(): boolean {
  return SEED_VAULT_ADDRESS !== ZERO_ADDRESS
}

// ---------------------------------------------------------------------------
// World ID proof parameter type
// ---------------------------------------------------------------------------

export interface WorldIdProof {
  signal: string
  root: bigint
  nullifierHash: bigint
  proof: bigint[]
}

// ---------------------------------------------------------------------------
// Write Functions (fire-and-forget via MiniKit sendTransaction)
// ---------------------------------------------------------------------------

/**
 * Record a knowledge contribution on-chain alongside the existing DB write.
 *
 * The ABI expects:
 *   recordContribution(bytes32 contentHash, uint256 botId, address signal,
 *                      uint256 root, uint256 nullifierHash, uint256[8] proof)
 *
 * @param contentHash - keccak256 hash of the contributed content (bytes32)
 * @param botId       - numeric identifier of the bot (converted from string)
 * @param worldIdProof - real World ID proof parameters from verification
 * @returns The transaction_id returned by World App, or null when skipped
 */
export async function recordContributionOnChain(
  contentHash: `0x${string}`,
  botId: string,
  worldIdProof: WorldIdProof
): Promise<{ transactionId: string } | null> {
  if (!MiniKit.isInstalled() || !isContractConfigured()) return null

  try {
    // Convert string botId to a numeric uint256.
    // For bots with non-numeric IDs, use a simple hash-based approach.
    const botIdNumeric = BigInt(
      /^\d+$/.test(botId)
        ? botId
        : '0x' + Array.from(new TextEncoder().encode(botId))
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('')
            .slice(0, 16) // truncate to fit safely
    )

    const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
      transaction: [
        {
          address: SEED_VAULT_ADDRESS,
          abi: SEED_VAULT_ABI,
          functionName: 'recordContribution',
          args: [
            contentHash,
            botIdNumeric,
            worldIdProof.signal,
            worldIdProof.root,
            worldIdProof.nullifierHash,
            worldIdProof.proof,
          ],
        },
      ],
    })

    if (finalPayload.status === 'success') {
      console.log('[CONTRACT] Contribution recorded on-chain:', finalPayload.transaction_id)
      return { transactionId: finalPayload.transaction_id }
    }

    console.warn('[CONTRACT] sendTransaction returned error:', finalPayload)
    return null
  } catch (error) {
    console.error('[CONTRACT] recordContributionOnChain failed:', error)
    return null
  }
}

/**
 * Record citation references on-chain in a single batch transaction.
 *
 * @param contentHashes - array of keccak256 content hashes being cited
 * @param citingHashes  - array of hashes identifying the citing content
 * @returns The transaction_id or null when skipped
 */
export async function recordCitationsOnChain(
  contentHashes: `0x${string}`[],
  citingHashes: `0x${string}`[]
): Promise<{ transactionId: string } | null> {
  if (!MiniKit.isInstalled() || !isContractConfigured()) return null
  if (contentHashes.length === 0 || contentHashes.length !== citingHashes.length) return null

  try {
    const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
      transaction: [
        {
          address: SEED_VAULT_ADDRESS,
          abi: SEED_VAULT_ABI,
          functionName: 'recordCitations',
          args: [contentHashes, citingHashes],
        },
      ],
    })

    if (finalPayload.status === 'success') {
      console.log('[CONTRACT] Citations recorded on-chain:', finalPayload.transaction_id)
      return { transactionId: finalPayload.transaction_id }
    }

    console.warn('[CONTRACT] recordCitations returned error:', finalPayload)
    return null
  } catch (error) {
    console.error('[CONTRACT] recordCitationsOnChain failed:', error)
    return null
  }
}

/**
 * Claim accumulated WLD rewards from the on-chain contract.
 * This is the user-signed path via MiniKit sendTransaction.
 *
 * @returns The transaction_id
 * @throws Error when MiniKit is not available or the transaction fails
 */
export async function claimRewardOnChain(): Promise<{ transactionId: string }> {
  if (!MiniKit.isInstalled()) {
    throw new Error('World App is required to claim rewards. Please open this app in World App.')
  }

  if (!isContractConfigured()) {
    throw new Error('Smart contract is not configured.')
  }

  const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
    transaction: [
      {
        address: SEED_VAULT_ADDRESS,
        abi: SEED_VAULT_ABI,
        functionName: 'claimReward',
        args: [],
      },
    ],
  })

  if (finalPayload.status === 'success') {
    console.log('[CONTRACT] Reward claimed on-chain:', finalPayload.transaction_id)
    return { transactionId: finalPayload.transaction_id }
  }

  throw new Error(
    `Claim transaction failed: ${
      'error_code' in finalPayload ? finalPayload.error_code : 'unknown error'
    }`
  )
}

// ---------------------------------------------------------------------------
// Read Functions (via public RPC, no wallet needed)
// ---------------------------------------------------------------------------

export interface ContractStats {
  totalContributions: bigint
  totalCitations: bigint
}

/**
 * Fetch aggregate contribution and citation counts from the contract.
 * Uses the getStats() function which returns both values in a single call.
 */
export async function getContractStats(): Promise<ContractStats> {
  if (!isContractConfigured()) {
    return { totalContributions: BigInt(0), totalCitations: BigInt(0) }
  }

  try {
    const result = await publicClient.readContract({
      address: SEED_VAULT_ADDRESS,
      abi: SEED_VAULT_ABI,
      functionName: 'getStats',
    }) as [bigint, bigint]

    return {
      totalContributions: result[0],
      totalCitations: result[1],
    }
  } catch (error) {
    console.error('[CONTRACT] getContractStats failed:', error)
    return { totalContributions: BigInt(0), totalCitations: BigInt(0) }
  }
}

/**
 * Read on-chain totalContributions and totalCitations individually.
 * Alternative to getStats() when the contract doesn't have a combined getter.
 */
export async function getContractStatsOnChain(): Promise<ContractStats> {
  if (!isContractConfigured()) {
    return { totalContributions: BigInt(0), totalCitations: BigInt(0) }
  }

  try {
    const [totalContributions, totalCitations] = await Promise.all([
      publicClient.readContract({
        address: SEED_VAULT_ADDRESS,
        abi: SEED_VAULT_ABI,
        functionName: 'totalContributions',
      }) as Promise<bigint>,
      publicClient.readContract({
        address: SEED_VAULT_ADDRESS,
        abi: SEED_VAULT_ABI,
        functionName: 'totalCitations',
      }) as Promise<bigint>,
    ])

    return { totalContributions, totalCitations }
  } catch (error) {
    console.error('[CONTRACT] getContractStatsOnChain failed:', error)
    return { totalContributions: BigInt(0), totalCitations: BigInt(0) }
  }
}

/**
 * Read the pending reward balance for a specific address.
 *
 * @param address - the wallet address to query
 */
export async function getPendingRewardOnChain(address: Address): Promise<bigint> {
  if (!isContractConfigured()) return BigInt(0)

  try {
    const result = await publicClient.readContract({
      address: SEED_VAULT_ADDRESS,
      abi: SEED_VAULT_ABI,
      functionName: 'pendingRewards',
      args: [address],
    })
    return result as bigint
  } catch (error) {
    console.error('[CONTRACT] getPendingRewardOnChain failed:', error)
    return BigInt(0)
  }
}

/**
 * Read the pending reward balance using the getPendingReward view function.
 * Returns null on failure (rather than 0) so callers can distinguish
 * "no rewards" from "query failed".
 *
 * @param address - the wallet address to query
 */
export async function getPendingRewardsOnChain(address: Address): Promise<bigint | null> {
  if (!isContractConfigured()) return null

  try {
    const result = await publicClient.readContract({
      address: SEED_VAULT_ADDRESS,
      abi: SEED_VAULT_ABI,
      functionName: 'getPendingReward',
      args: [address],
    })
    return result as bigint
  } catch (error) {
    console.error('[CONTRACT] getPendingRewardsOnChain failed:', error)
    return null
  }
}

/**
 * Read the WLD ERC-20 token balance for a given address.
 *
 * @param address - the wallet address to query
 * @returns The token balance in wei, or null on failure
 */
export async function getWldBalance(address: Address): Promise<bigint | null> {
  if (WLD_TOKEN_ADDRESS === ZERO_ADDRESS) return null

  try {
    const result = await publicClient.readContract({
      address: WLD_TOKEN_ADDRESS,
      abi: ERC20_BALANCE_ABI,
      functionName: 'balanceOf',
      args: [address],
    })
    return result
  } catch (error) {
    console.error('[CONTRACT] getWldBalance failed:', error)
    return null
  }
}

/**
 * Read the reward balance for a user via the getPendingReward view function.
 *
 * Convenience alias that returns 0 (not null) when the contract is not
 * configured, making it safe to use directly in UI display logic.
 *
 * @param address - the wallet address to query
 * @returns The pending reward amount in WLD (18 decimals), or 0 on failure.
 */
export async function getRewardBalance(address: Address): Promise<bigint> {
  if (!isContractConfigured()) return BigInt(0)

  try {
    const result = await publicClient.readContract({
      address: SEED_VAULT_ADDRESS,
      abi: SEED_VAULT_ABI,
      functionName: 'getPendingReward',
      args: [address],
    })
    return result as bigint
  } catch (error) {
    console.error('[CONTRACT] getRewardBalance failed:', error)
    return BigInt(0)
  }
}

/**
 * Read the total number of contributions recorded on-chain.
 *
 * @returns The total contribution count, or 0 when not configured / on error.
 */
export async function getContributionCount(): Promise<bigint> {
  if (!isContractConfigured()) return BigInt(0)

  try {
    const result = await publicClient.readContract({
      address: SEED_VAULT_ADDRESS,
      abi: SEED_VAULT_ABI,
      functionName: 'totalContributions',
    })
    return result as bigint
  } catch (error) {
    console.error('[CONTRACT] getContributionCount failed:', error)
    return BigInt(0)
  }
}

/**
 * Read the WLD balance held by the SeedVault contract (the reward pool).
 *
 * @returns The reward pool balance in WLD (18 decimals), or 0 on failure.
 */
export async function getRewardPoolBalance(): Promise<bigint> {
  if (!isContractConfigured()) return BigInt(0)

  try {
    const result = await publicClient.readContract({
      address: SEED_VAULT_ADDRESS,
      abi: SEED_VAULT_ABI,
      functionName: 'getRewardPoolBalance',
    })
    return result as bigint
  } catch (error) {
    console.error('[CONTRACT] getRewardPoolBalance failed:', error)
    return BigInt(0)
  }
}
