import { createPublicClient, http, type Hash } from 'viem'
import { worldchain } from 'viem/chains'

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const RPC_URL =
  process.env.NEXT_PUBLIC_WORLD_CHAIN_RPC ||
  'https://worldchain-mainnet.g.alchemy.com/public'

// ---------------------------------------------------------------------------
// Public Client (read-only, for transaction lookups)
// ---------------------------------------------------------------------------

const publicClient = createPublicClient({
  chain: worldchain,
  transport: http(RPC_URL),
})

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TransactionStatus = 'pending' | 'confirmed' | 'reverted' | 'not_found'

export interface TransactionResult {
  status: TransactionStatus
  blockNumber: bigint | null
  transactionHash: Hash | null
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Default polling interval in milliseconds. */
const DEFAULT_POLL_INTERVAL_MS = 2_000

/** Default timeout in milliseconds (2 minutes). */
const DEFAULT_TIMEOUT_MS = 120_000

/** Maximum number of poll attempts before timing out. */
const MAX_POLL_ATTEMPTS = 60

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Sleep for the given number of milliseconds.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ---------------------------------------------------------------------------
// Transaction Status Functions
// ---------------------------------------------------------------------------

/**
 * Check the current status of a transaction by its hash.
 *
 * Uses the viem publicClient to fetch the transaction receipt from the
 * World Chain RPC endpoint. Returns a structured result indicating whether
 * the transaction is pending, confirmed, reverted, or not found.
 *
 * @param txHash - The transaction hash to look up (0x-prefixed).
 * @returns A TransactionResult with status and block information.
 */
export async function getTransactionStatus(txHash: Hash): Promise<TransactionResult> {
  try {
    const receipt = await publicClient.getTransactionReceipt({ hash: txHash })

    return {
      status: receipt.status === 'success' ? 'confirmed' : 'reverted',
      blockNumber: receipt.blockNumber,
      transactionHash: txHash,
    }
  } catch (error: unknown) {
    // If the receipt is not available yet, the transaction may be pending.
    // viem throws when the receipt does not exist.
    const message = error instanceof Error ? error.message : String(error)

    if (
      message.includes('could not be found') ||
      message.includes('not found') ||
      message.includes('TransactionReceiptNotFoundError')
    ) {
      // Check if the transaction itself exists (pending in mempool)
      try {
        const tx = await publicClient.getTransaction({ hash: txHash })
        if (tx) {
          return {
            status: 'pending',
            blockNumber: null,
            transactionHash: txHash,
          }
        }
      } catch {
        // Transaction not found at all
      }

      return {
        status: 'not_found',
        blockNumber: null,
        transactionHash: txHash,
      }
    }

    // Unexpected error — treat as not found
    console.error('[TRANSACTION] getTransactionStatus failed:', error)
    return {
      status: 'not_found',
      blockNumber: null,
      transactionHash: txHash,
    }
  }
}

/**
 * Wait for a transaction to be confirmed on-chain by polling its receipt.
 *
 * Polls the World Chain RPC at a configurable interval until the transaction
 * is either confirmed, reverted, or the timeout is reached. This is useful
 * for MiniKit sendTransaction flows where the client receives a transaction
 * ID and needs to wait for finality before updating application state.
 *
 * @param txHash           - The transaction hash to wait for (0x-prefixed).
 * @param options.timeout  - Maximum wait time in ms (default: 120_000).
 * @param options.interval - Polling interval in ms (default: 2_000).
 * @returns A TransactionResult once the transaction is finalized or timed out.
 */
export async function waitForTransaction(
  txHash: Hash,
  options?: {
    timeout?: number
    interval?: number
  }
): Promise<TransactionResult> {
  const timeout = options?.timeout ?? DEFAULT_TIMEOUT_MS
  const interval = options?.interval ?? DEFAULT_POLL_INTERVAL_MS
  const maxAttempts = Math.min(
    Math.ceil(timeout / interval),
    MAX_POLL_ATTEMPTS
  )

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = await getTransactionStatus(txHash)

    // Terminal states — return immediately
    if (result.status === 'confirmed' || result.status === 'reverted') {
      return result
    }

    // Still pending or not yet visible — wait and retry
    if (attempt < maxAttempts - 1) {
      await sleep(interval)
    }
  }

  // Timed out — return the last known state (likely 'pending' or 'not_found')
  console.warn(
    `[TRANSACTION] waitForTransaction timed out after ${timeout}ms for tx:`,
    txHash
  )
  return {
    status: 'pending',
    blockNumber: null,
    transactionHash: txHash,
  }
}

/**
 * Wait for a transaction using viem's built-in waitForTransactionReceipt.
 *
 * This is a simpler alternative to the polling-based `waitForTransaction`
 * that delegates entirely to viem's internal retry/polling logic. It throws
 * on timeout rather than returning a 'pending' status.
 *
 * @param txHash          - The transaction hash to wait for.
 * @param timeoutMs       - Maximum wait time in ms (default: 60_000).
 * @returns The confirmed transaction result.
 * @throws When the transaction is not confirmed within the timeout.
 */
export async function waitForTransactionReceipt(
  txHash: Hash,
  timeoutMs: number = 60_000
): Promise<TransactionResult> {
  try {
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
      timeout: timeoutMs,
    })

    return {
      status: receipt.status === 'success' ? 'confirmed' : 'reverted',
      blockNumber: receipt.blockNumber,
      transactionHash: txHash,
    }
  } catch (error) {
    console.error('[TRANSACTION] waitForTransactionReceipt failed:', error)
    throw new Error(
      `Transaction ${txHash} was not confirmed within ${timeoutMs}ms`
    )
  }
}
