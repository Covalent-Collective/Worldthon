import { keccak256, encodePacked, toHex, type Hex } from 'viem'
import { createPublicClient, http } from 'viem'
import { worldchain } from 'viem/chains'
import { MiniKit } from '@worldcoin/minikit-js'
import { ZK_SEGMENT_ABI } from '@/lib/abi/ZKSegment'

// ---------------------------------------------------------------------------
//  ZK 프라이버시 핵심 (ZK Privacy Core):
//
//  1. commitment = hash(nullifierHash + segmentId + salt)
//  2. 온체인에는 commitment만 저장 → 누가 어떤 세그먼트인지 모름
//     (Only the commitment is stored on-chain — nobody knows who belongs to which segment)
//  3. 매칭: 두 commitment가 같은 세그먼트에 존재하는지만 확인
//     (Matching: only checks whether two commitments exist in the same segment)
//  4. 예: "이 유저가 건강 카테고리에 관심있다" → 증명 가능
//     (Example: "this user is interested in the health category" — provable)
//     "이 유저가 어떤 건강 데이터를 썼는지" → 알 수 없음
//     ("what health data this user wrote" — unknowable)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
//  Constants
// ---------------------------------------------------------------------------

/** ZKSegment contract address on World Chain (set via env). */
const ZK_SEGMENT_ADDRESS = (
  process.env.NEXT_PUBLIC_ZK_SEGMENT_ADDRESS ?? '0x0000000000000000000000000000000000000000'
) as `0x${string}`

/**
 * Maps bot categories (Korean and English) to segment IDs.
 * Must match the constructor order in ZKSegment.sol:
 *   0: web3, 1: travel, 2: health, 3: food, 4: business, 5: entertainment
 *
 * 봇 카테고리 → segmentId 매핑 (컨트랙트 constructor 순서와 동일)
 */
const CATEGORY_SEGMENT_MAP: Record<string, number> = {
  // English keys
  web3: 0,
  travel: 1,
  health: 2,
  food: 3,
  business: 4,
  entertainment: 5,

  // Korean keys (한국어 카테고리)
  'Web3': 0,
  '여행': 1,
  '의료': 2,
  '요리': 3,
  '비즈니스': 4,
  '엔터테인먼트': 5,
}

/** localStorage key prefix for storing salts. */
const SALT_STORAGE_PREFIX = 'zk-segment-salt-'

// ---------------------------------------------------------------------------
//  Viem Public Client (read-only)
// ---------------------------------------------------------------------------

const publicClient = createPublicClient({
  chain: worldchain,
  transport: http(
    process.env.NEXT_PUBLIC_WORLD_CHAIN_RPC ||
      'https://worldchain-mainnet.g.alchemy.com/public'
  ),
})

// ---------------------------------------------------------------------------
//  Helper: random hex salt
// ---------------------------------------------------------------------------

function randomHexSalt(): string {
  if (typeof window !== 'undefined' && window.crypto) {
    const bytes = new Uint8Array(32)
    window.crypto.getRandomValues(bytes)
    return toHex(bytes)
  }
  // Fallback for non-browser (SSR) — should never be used in practice
  return toHex(
    new Uint8Array(32).map(() => Math.floor(Math.random() * 256))
  )
}

// ---------------------------------------------------------------------------
//  Public Functions
// ---------------------------------------------------------------------------

/**
 * Generate a ZK commitment for segment membership.
 *
 * commitment = keccak256(abi.encodePacked(nullifierHash, segmentId, salt))
 *
 * The salt MUST be stored locally so the user can reproduce the commitment
 * for future proof generation.
 *
 * @param nullifierHash - The user's World ID nullifier hash.
 * @param segmentId     - The segment to commit to (0-5).
 * @param salt          - Optional salt; a random one is generated if omitted.
 * @returns The commitment hash.
 */
export function generateCommitment(
  nullifierHash: string,
  segmentId: number,
  salt?: string
): Hex {
  const actualSalt = salt ?? randomHexSalt()
  return keccak256(
    encodePacked(
      ['string', 'uint256', 'string'],
      [nullifierHash, BigInt(segmentId), actualSalt]
    )
  )
}

/**
 * Generate the nullifier key that prevents double-join per segment.
 *
 * nullifierKey = keccak256(abi.encodePacked(nullifierHash, segmentId))
 *
 * @param nullifierHash - The user's World ID nullifier hash.
 * @param segmentId     - The segment ID.
 * @returns The nullifier key hash.
 */
export function generateNullifierKey(
  nullifierHash: string,
  segmentId: number
): Hex {
  return keccak256(
    encodePacked(
      ['string', 'uint256'],
      [nullifierHash, BigInt(segmentId)]
    )
  )
}

/**
 * Map a bot category string to a segment ID.
 *
 * Supports both English ("web3") and Korean ("의료") category names.
 *
 * @param botCategory - The bot's category string.
 * @returns The segment ID (0-5) or -1 if the category is unknown.
 */
export function getCategorySegmentId(botCategory: string): number {
  const normalized = botCategory.trim().toLowerCase()

  // Try exact match first (handles Korean and mixed-case English)
  if (botCategory in CATEGORY_SEGMENT_MAP) {
    return CATEGORY_SEGMENT_MAP[botCategory]
  }

  // Try lowercase match for English categories
  if (normalized in CATEGORY_SEGMENT_MAP) {
    return CATEGORY_SEGMENT_MAP[normalized]
  }

  return -1
}

/**
 * Commit a user's membership in a knowledge segment on-chain.
 *
 * This is the main entry point for ZK segment enrollment. It:
 *   1. Resolves the bot category to a segment ID.
 *   2. Generates a commitment and nullifier key off-chain.
 *   3. Sends a transaction via MiniKit to the ZKSegment contract.
 *   4. Stores the salt in localStorage for future proof reproduction.
 *
 * 사용자를 카테고리 세그먼트에 등록합니다 (프라이버시 보호).
 * 온체인에는 commitment만 기록되며, 사용자 신원은 노출되지 않습니다.
 *
 * @param nullifierHash - The user's World ID nullifier hash.
 * @param botCategory   - The bot's category (e.g., "Web3", "의료").
 * @returns The commitment, salt, and transaction ID — or null if outside World App
 *          or if the category is unknown.
 */
export async function commitToSegment(
  nullifierHash: string,
  botCategory: string
): Promise<{ commitment: Hex; salt: string; transactionId: string } | null> {
  // Resolve segment
  const segmentId = getCategorySegmentId(botCategory)
  if (segmentId === -1) {
    console.warn('[ZKSegment] Unknown category, skipping segment commit:', botCategory)
    return null
  }

  // Check if already committed to this segment (local cache)
  const existingKey = `${SALT_STORAGE_PREFIX}${nullifierHash}-${segmentId}`
  if (typeof window !== 'undefined' && localStorage.getItem(existingKey)) {
    console.info('[ZKSegment] Already committed to segment:', segmentId)
    return null
  }

  // Generate cryptographic material off-chain
  const salt = randomHexSalt()
  const commitment = generateCommitment(nullifierHash, segmentId, salt)
  const nullifierKey = generateNullifierKey(nullifierHash, segmentId)

  // Send transaction via MiniKit (only works inside World App)
  if (!MiniKit.isInstalled()) {
    // 개발 환경에서는 로컬 저장만 수행
    // (In development, just store locally without sending a real transaction)
    if (process.env.NODE_ENV === 'development') {
      console.info('[ZKSegment][DEV] Mock commit to segment', segmentId, 'commitment:', commitment)
      if (typeof window !== 'undefined') {
        localStorage.setItem(existingKey, JSON.stringify({ commitment, salt }))
      }
      return { commitment, salt, transactionId: `mock_tx_${Date.now()}` }
    }
    console.warn('[ZKSegment] MiniKit not installed — cannot send transaction')
    return null
  }

  try {
    const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
      transaction: [
        {
          address: ZK_SEGMENT_ADDRESS,
          abi: ZK_SEGMENT_ABI,
          functionName: 'commitMembership',
          args: [BigInt(segmentId), commitment, nullifierKey],
        },
      ],
    })

    if (finalPayload.status === 'error') {
      console.error('[ZKSegment] Transaction failed:', finalPayload)
      return null
    }

    // salt를 localStorage에 저장 (나중에 증명 재생성에 필요)
    // Store salt in localStorage — needed for future proof reproduction
    if (typeof window !== 'undefined') {
      localStorage.setItem(existingKey, JSON.stringify({ commitment, salt }))
    }

    const transactionId = 'transaction_id' in finalPayload
      ? String(finalPayload.transaction_id)
      : `tx_${Date.now()}`

    return { commitment, salt, transactionId }
  } catch (error) {
    console.error('[ZKSegment] commitToSegment error:', error)
    return null
  }
}

/**
 * Verify that a commitment exists on-chain (proves segment membership).
 *
 * 온체인에서 commitment 존재 여부를 확인합니다 (세그먼트 멤버십 증명).
 *
 * @param commitment - The commitment hash to verify.
 * @returns True if the commitment is recorded on-chain.
 */
export async function verifySegmentMembership(commitment: Hex): Promise<boolean> {
  try {
    const result = await publicClient.readContract({
      address: ZK_SEGMENT_ADDRESS,
      abi: ZK_SEGMENT_ABI,
      functionName: 'verifyMembership',
      args: [commitment],
    })
    return result as boolean
  } catch (error) {
    console.error('[ZKSegment] verifySegmentMembership error:', error)
    return false
  }
}

/**
 * Check if two users share a segment by verifying both commitments exist.
 *
 * 두 사용자가 같은 세그먼트에 속하는지 확인합니다.
 * commitment만으로 확인하므로 사용자 신원은 노출되지 않습니다.
 *
 * @param commitmentA - First user's commitment.
 * @param commitmentB - Second user's commitment.
 * @returns True if both commitments exist (shared segment membership).
 */
export async function checkSegmentMatch(
  commitmentA: Hex,
  commitmentB: Hex
): Promise<boolean> {
  try {
    const result = await publicClient.readContract({
      address: ZK_SEGMENT_ADDRESS,
      abi: ZK_SEGMENT_ABI,
      functionName: 'verifySegmentMatch',
      args: [commitmentA, commitmentB],
    })
    return result as boolean
  } catch (error) {
    console.error('[ZKSegment] checkSegmentMatch error:', error)
    return false
  }
}
