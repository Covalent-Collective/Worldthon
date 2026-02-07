import {
  createWalletClient,
  createPublicClient,
  http,
  keccak256,
  toBytes,
  type Address,
  type Hash,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { worldchain } from 'viem/chains'

import { SEED_VAULT_ABI } from '@/lib/abi/SeedVault'

// ---------------------------------------------------------------------------
// Configuration (server-only, never prefixed with NEXT_PUBLIC_)
// ---------------------------------------------------------------------------

const SEED_VAULT_ADDRESS = process.env.NEXT_PUBLIC_SEED_VAULT_ADDRESS as Address | undefined
const RELAYER_PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY as `0x${string}` | undefined
const RPC_URL =
  process.env.NEXT_PUBLIC_WORLD_CHAIN_RPC ||
  'https://worldchain-sepolia.g.alchemy.com/public'

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

/** Returns true when both the contract address and relayer key are set. */
export function isRelayerConfigured(): boolean {
  return !!(SEED_VAULT_ADDRESS && RELAYER_PRIVATE_KEY)
}

/** Hash arbitrary content to a bytes32 value for on-chain storage. */
export function hashContent(content: string): `0x${string}` {
  return keccak256(toBytes(content))
}

// ---------------------------------------------------------------------------
// Internal: lazy client creation
// ---------------------------------------------------------------------------

function getClients() {
  if (!RELAYER_PRIVATE_KEY || !SEED_VAULT_ADDRESS) {
    throw new Error(
      'Relayer not configured: RELAYER_PRIVATE_KEY and NEXT_PUBLIC_SEED_VAULT_ADDRESS are required'
    )
  }

  const account = privateKeyToAccount(RELAYER_PRIVATE_KEY)

  const walletClient = createWalletClient({
    account,
    chain: worldchain,
    transport: http(RPC_URL),
  })

  const publicClient = createPublicClient({
    chain: worldchain,
    transport: http(RPC_URL),
  })

  return { walletClient, publicClient, account }
}

/** Create a read-only public client (does not require the relayer key). */
function getPublicClient() {
  return createPublicClient({
    chain: worldchain,
    transport: http(RPC_URL),
  })
}

// ---------------------------------------------------------------------------
// Write: record contribution via relayer
// ---------------------------------------------------------------------------

export interface RelayContributionParams {
  contentHash: `0x${string}`
  botId: number
  signal: Address
  root: bigint
  nullifierHash: bigint
  proof: bigint[]
}

/**
 * Submit a `recordContribution` transaction through the server-side relayer.
 *
 * Returns the transaction hash on success, or null when the relayer is not
 * configured or the transaction fails. Callers should treat a null return as
 * a non-fatal condition (graceful degradation).
 */
export async function relayRecordContribution(
  params: RelayContributionParams
): Promise<Hash | null> {
  if (!isRelayerConfigured()) return null

  try {
    const { walletClient, publicClient } = getClients()

    // World ID proofs are always 8 elements; cast to the expected fixed-size tuple
    const proofTuple = params.proof as unknown as readonly [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint]

    const hash = await walletClient.writeContract({
      address: SEED_VAULT_ADDRESS!,
      abi: SEED_VAULT_ABI,
      functionName: 'recordContribution',
      args: [
        params.contentHash,
        BigInt(params.botId),
        params.signal,
        params.root,
        params.nullifierHash,
        proofTuple,
      ],
    })

    const receipt = await publicClient.waitForTransactionReceipt({ hash })

    if (receipt.status === 'success') {
      console.log('[RELAYER] Contribution recorded on-chain:', hash)
      return hash
    }

    console.error('[RELAYER] recordContribution transaction reverted:', hash)
    return null
  } catch (error) {
    console.error('[RELAYER] recordContribution failed:', error)
    return null
  }
}

// ---------------------------------------------------------------------------
// Write: record citations via relayer (batch)
// ---------------------------------------------------------------------------

/**
 * Submit a `recordCitations` transaction for a batch of content hashes.
 *
 * Returns the transaction hash on success, or null on failure / when not
 * configured.
 */
export async function relayRecordCitations(
  contentHashes: `0x${string}`[],
  citingHashes: `0x${string}`[]
): Promise<Hash | null> {
  if (!isRelayerConfigured() || contentHashes.length === 0) return null
  if (contentHashes.length !== citingHashes.length) return null

  try {
    const { walletClient, publicClient } = getClients()

    const hash = await walletClient.writeContract({
      address: SEED_VAULT_ADDRESS!,
      abi: SEED_VAULT_ABI,
      functionName: 'recordCitations',
      args: [contentHashes, citingHashes],
    })

    const receipt = await publicClient.waitForTransactionReceipt({ hash })

    if (receipt.status === 'success') {
      console.log('[RELAYER] Citations recorded on-chain:', hash)
      return hash
    }

    console.error('[RELAYER] recordCitations transaction reverted:', hash)
    return null
  } catch (error) {
    console.error('[RELAYER] recordCitations failed:', error)
    return null
  }
}

// ---------------------------------------------------------------------------
// Read: contract stats (public client only, no relayer key needed)
// ---------------------------------------------------------------------------

export interface OnChainStats {
  totalContributions: number
  totalCitations: number
}

/**
 * Fetch aggregate stats from the SeedVault contract via `getStats()`.
 *
 * Returns null when the contract address is not configured or the call fails.
 */
export async function getOnChainStats(): Promise<OnChainStats | null> {
  if (!SEED_VAULT_ADDRESS) return null

  try {
    const publicClient = getPublicClient()

    const result = (await publicClient.readContract({
      address: SEED_VAULT_ADDRESS,
      abi: SEED_VAULT_ABI,
      functionName: 'getStats',
    })) as [bigint, bigint]

    return {
      totalContributions: Number(result[0]),
      totalCitations: Number(result[1]),
    }
  } catch (error) {
    console.error('[RELAYER] getOnChainStats failed:', error)
    return null
  }
}

// ---------------------------------------------------------------------------
// Read: verify a transaction receipt
// ---------------------------------------------------------------------------

export interface TxVerificationResult {
  confirmed: boolean
  blockNumber: bigint | null
}

/**
 * Verify that a transaction was confirmed on-chain by checking its receipt.
 *
 * This is used by the claim confirmation flow to ensure the client-side
 * MiniKit transaction actually succeeded before updating Supabase.
 */
export async function verifyTransactionReceipt(
  txHash: Hash
): Promise<TxVerificationResult> {
  try {
    const publicClient = getPublicClient()

    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
      timeout: 60_000, // 60 seconds max wait
    })

    return {
      confirmed: receipt.status === 'success',
      blockNumber: receipt.blockNumber,
    }
  } catch (error) {
    console.error('[RELAYER] verifyTransactionReceipt failed:', error)
    return { confirmed: false, blockNumber: null }
  }
}
