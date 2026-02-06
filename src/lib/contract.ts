import { createPublicClient, http, type Address } from 'viem'
import { worldchain } from 'viem/chains'
import { MiniKit } from '@worldcoin/minikit-js'
import SeedVaultABI from '@/abi/SeedVault.json'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ZERO_ADDRESS: Address = '0x0000000000000000000000000000000000000000'

export const SEED_VAULT_ADDRESS: Address =
  (process.env.NEXT_PUBLIC_SEED_VAULT_ADDRESS as Address) || ZERO_ADDRESS

export const WLD_TOKEN_ADDRESS: Address =
  (process.env.NEXT_PUBLIC_WLD_TOKEN_ADDRESS as Address) || ZERO_ADDRESS

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
// Write Functions (fire-and-forget via MiniKit sendTransaction)
// ---------------------------------------------------------------------------

/**
 * Record a knowledge contribution on-chain alongside the existing DB write.
 *
 * The existing ABI expects:
 *   recordContribution(bytes32 contentHash, uint256 botId, address signal,
 *                      uint256 root, uint256 nullifierHash, uint256[8] proof)
 *
 * @param contentHash - keccak256 hash of the contributed content (bytes32)
 * @param botId       - numeric identifier of the bot (converted from string)
 * @returns The transaction_id returned by World App, or null when skipped
 */
export async function recordContributionOnChain(
  contentHash: `0x${string}`,
  botId: string
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

    // Hackathon demo: World ID proof params use placeholder values.
    // Real verification is handled server-side via /api/auth/verify.
    // The on-chain contract will be deployed with proof verification
    // disabled or with a trusted relayer pattern for the demo.
    const PLACEHOLDER_SIGNAL: Address = ZERO_ADDRESS
    const PLACEHOLDER_ROOT = BigInt(0)
    const PLACEHOLDER_NULLIFIER = BigInt(0)
    const PLACEHOLDER_PROOF: bigint[] = Array(8).fill(BigInt(0))

    const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
      transaction: [
        {
          address: SEED_VAULT_ADDRESS,
          abi: SeedVaultABI,
          functionName: 'recordContribution',
          args: [
            contentHash,
            botIdNumeric,
            PLACEHOLDER_SIGNAL,
            PLACEHOLDER_ROOT,
            PLACEHOLDER_NULLIFIER,
            PLACEHOLDER_PROOF,
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
 * @returns The transaction_id or null when skipped
 */
export async function recordCitationsOnChain(
  contentHashes: `0x${string}`[]
): Promise<{ transactionId: string } | null> {
  if (!MiniKit.isInstalled() || !isContractConfigured()) return null
  if (contentHashes.length === 0) return null

  try {
    const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
      transaction: [
        {
          address: SEED_VAULT_ADDRESS,
          abi: SeedVaultABI,
          functionName: 'recordCitations',
          args: [contentHashes],
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
 *
 * @returns The transaction_id or null when skipped
 */
export async function claimRewardOnChain(): Promise<{ transactionId: string } | null> {
  if (!MiniKit.isInstalled() || !isContractConfigured()) return null

  try {
    const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
      transaction: [
        {
          address: SEED_VAULT_ADDRESS,
          abi: SeedVaultABI,
          functionName: 'claimReward',
          args: [],
        },
      ],
    })

    if (finalPayload.status === 'success') {
      console.log('[CONTRACT] Reward claimed on-chain:', finalPayload.transaction_id)
      return { transactionId: finalPayload.transaction_id }
    }

    console.warn('[CONTRACT] claimReward returned error:', finalPayload)
    return null
  } catch (error) {
    console.error('[CONTRACT] claimRewardOnChain failed:', error)
    return null
  }
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
      abi: SeedVaultABI,
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
 * Read the pending reward balance for a specific address.
 *
 * @param address - the wallet address to query
 */
export async function getPendingRewardOnChain(address: Address): Promise<bigint> {
  if (!isContractConfigured()) return BigInt(0)

  try {
    const result = await publicClient.readContract({
      address: SEED_VAULT_ADDRESS,
      abi: SeedVaultABI,
      functionName: 'pendingRewards',
      args: [address],
    })
    return result as bigint
  } catch (error) {
    console.error('[CONTRACT] getPendingRewardOnChain failed:', error)
    return BigInt(0)
  }
}
