/**
 * Typed ABI for the SeedVault contract.
 *
 * This is the canonical TypeScript ABI source. It covers only the functions,
 * events, and errors used by the front-end and relayer. Admin-only functions
 * (depositRewards, emergencyWithdraw, pause, unpause, updateWorldId,
 * transferOwnership) are included for completeness but are only callable by
 * the contract owner.
 *
 * Generated from contracts/src/SeedVault.sol — keep in sync manually when
 * the Solidity contract changes.
 */
export const SEED_VAULT_ABI = [
  // ---------------------------------------------------------------------------
  // Core write functions
  // ---------------------------------------------------------------------------
  {
    type: 'function',
    name: 'recordContribution',
    inputs: [
      { name: 'contentHash', type: 'bytes32', internalType: 'bytes32' },
      { name: 'botId', type: 'uint256', internalType: 'uint256' },
      { name: 'signal', type: 'address', internalType: 'address' },
      { name: 'root', type: 'uint256', internalType: 'uint256' },
      { name: 'nullifierHash', type: 'uint256', internalType: 'uint256' },
      { name: 'proof', type: 'uint256[8]', internalType: 'uint256[8]' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'recordCitations',
    inputs: [
      { name: 'contentHashes', type: 'bytes32[]', internalType: 'bytes32[]' },
      { name: 'citingHashes', type: 'bytes32[]', internalType: 'bytes32[]' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'claimReward',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },

  // ---------------------------------------------------------------------------
  // View functions
  // ---------------------------------------------------------------------------
  {
    type: 'function',
    name: 'getContribution',
    inputs: [
      { name: 'contentHash', type: 'bytes32', internalType: 'bytes32' },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct SeedVault.Contribution',
        components: [
          { name: 'contentHash', type: 'bytes32', internalType: 'bytes32' },
          { name: 'contributor', type: 'address', internalType: 'address' },
          { name: 'botId', type: 'uint256', internalType: 'uint256' },
          { name: 'timestamp', type: 'uint256', internalType: 'uint256' },
          { name: 'citationCount', type: 'uint256', internalType: 'uint256' },
          { name: 'exists', type: 'bool', internalType: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getPendingReward',
    inputs: [
      { name: 'user', type: 'address', internalType: 'address' },
    ],
    outputs: [
      { name: '', type: 'uint256', internalType: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getStats',
    inputs: [],
    outputs: [
      { name: '_totalContributions', type: 'uint256', internalType: 'uint256' },
      { name: '_totalCitations', type: 'uint256', internalType: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getRewardPoolBalance',
    inputs: [],
    outputs: [
      { name: '', type: 'uint256', internalType: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'contributions',
    inputs: [
      { name: '', type: 'bytes32', internalType: 'bytes32' },
    ],
    outputs: [
      { name: 'contentHash', type: 'bytes32', internalType: 'bytes32' },
      { name: 'contributor', type: 'address', internalType: 'address' },
      { name: 'botId', type: 'uint256', internalType: 'uint256' },
      { name: 'timestamp', type: 'uint256', internalType: 'uint256' },
      { name: 'citationCount', type: 'uint256', internalType: 'uint256' },
      { name: 'exists', type: 'bool', internalType: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'pendingRewards',
    inputs: [
      { name: '', type: 'address', internalType: 'address' },
    ],
    outputs: [
      { name: '', type: 'uint256', internalType: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'totalContributions',
    inputs: [],
    outputs: [
      { name: '', type: 'uint256', internalType: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'totalCitations',
    inputs: [],
    outputs: [
      { name: '', type: 'uint256', internalType: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'REWARD_PER_CITATION',
    inputs: [],
    outputs: [
      { name: '', type: 'uint256', internalType: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'nullifierHashes',
    inputs: [
      { name: '', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [
      { name: '', type: 'bool', internalType: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'citedBy',
    inputs: [
      { name: '', type: 'bytes32', internalType: 'bytes32' },
      { name: '', type: 'bytes32', internalType: 'bytes32' },
    ],
    outputs: [
      { name: '', type: 'bool', internalType: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'paused',
    inputs: [],
    outputs: [
      { name: '', type: 'bool', internalType: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'owner',
    inputs: [],
    outputs: [
      { name: '', type: 'address', internalType: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'worldId',
    inputs: [],
    outputs: [
      { name: '', type: 'address', internalType: 'contract IWorldID' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'wldToken',
    inputs: [],
    outputs: [
      { name: '', type: 'address', internalType: 'contract IERC20' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'groupId',
    inputs: [],
    outputs: [
      { name: '', type: 'uint256', internalType: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'appId',
    inputs: [],
    outputs: [
      { name: '', type: 'string', internalType: 'string' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'actionId',
    inputs: [],
    outputs: [
      { name: '', type: 'string', internalType: 'string' },
    ],
    stateMutability: 'view',
  },

  // ---------------------------------------------------------------------------
  // Admin write functions
  // ---------------------------------------------------------------------------
  {
    type: 'function',
    name: 'depositRewards',
    inputs: [
      { name: 'amount', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'updateWorldId',
    inputs: [
      { name: '_worldId', type: 'address', internalType: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'transferOwnership',
    inputs: [
      { name: 'newOwner', type: 'address', internalType: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'emergencyWithdraw',
    inputs: [
      { name: 'amount', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'pause',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'unpause',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },

  // ---------------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------------
  {
    type: 'event',
    name: 'ContributionRecorded',
    inputs: [
      { name: 'contentHash', type: 'bytes32', indexed: true, internalType: 'bytes32' },
      { name: 'contributor', type: 'address', indexed: true, internalType: 'address' },
      { name: 'botId', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'CitationRecorded',
    inputs: [
      { name: 'contentHash', type: 'bytes32', indexed: true, internalType: 'bytes32' },
      { name: 'newCount', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'RewardClaimed',
    inputs: [
      { name: 'user', type: 'address', indexed: true, internalType: 'address' },
      { name: 'amount', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'RewardsDeposited',
    inputs: [
      { name: 'depositor', type: 'address', indexed: true, internalType: 'address' },
      { name: 'amount', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'WorldIdUpdated',
    inputs: [
      { name: 'newWorldId', type: 'address', indexed: true, internalType: 'address' },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'EmergencyWithdraw',
    inputs: [
      { name: 'owner', type: 'address', indexed: true, internalType: 'address' },
      { name: 'amount', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OwnershipTransferred',
    inputs: [
      { name: 'previousOwner', type: 'address', indexed: true, internalType: 'address' },
      { name: 'newOwner', type: 'address', indexed: true, internalType: 'address' },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Paused',
    inputs: [
      { name: 'account', type: 'address', indexed: true, internalType: 'address' },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Unpaused',
    inputs: [
      { name: 'account', type: 'address', indexed: true, internalType: 'address' },
    ],
    anonymous: false,
  },

  // ---------------------------------------------------------------------------
  // Custom errors
  // ---------------------------------------------------------------------------
  { type: 'error', name: 'InvalidNullifier', inputs: [] },
  { type: 'error', name: 'DuplicateContribution', inputs: [] },
  { type: 'error', name: 'DuplicateCitation', inputs: [] },
  { type: 'error', name: 'ContributionNotFound', inputs: [] },
  { type: 'error', name: 'NoPendingRewards', inputs: [] },
  { type: 'error', name: 'TransferFailed', inputs: [] },
  { type: 'error', name: 'Unauthorized', inputs: [] },
  { type: 'error', name: 'ZeroAddress', inputs: [] },
  { type: 'error', name: 'BatchTooLarge', inputs: [] },
  { type: 'error', name: 'ContractPaused', inputs: [] },
] as const
