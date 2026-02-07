/**
 * Typed ABI for the ZKSegment contract.
 *
 * This is the canonical TypeScript ABI source. It covers the functions,
 * events, and errors used by the front-end for ZK segment membership
 * operations.
 *
 * Generated from contracts/src/ZKSegment.sol — keep in sync manually when
 * the Solidity contract changes.
 */
export const ZK_SEGMENT_ABI = [
  // ---------------------------------------------------------------------------
  // Core write functions
  // ---------------------------------------------------------------------------
  {
    type: 'function',
    name: 'commitMembership',
    inputs: [
      { name: 'segmentId', type: 'uint256', internalType: 'uint256' },
      { name: 'commitment', type: 'bytes32', internalType: 'bytes32' },
      { name: 'nullifierKey', type: 'bytes32', internalType: 'bytes32' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },

  // ---------------------------------------------------------------------------
  // View functions
  // ---------------------------------------------------------------------------
  {
    type: 'function',
    name: 'verifyMembership',
    inputs: [
      { name: 'commitment', type: 'bytes32', internalType: 'bytes32' },
    ],
    outputs: [
      { name: '', type: 'bool', internalType: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'verifySegmentMatch',
    inputs: [
      { name: 'commitmentA', type: 'bytes32', internalType: 'bytes32' },
      { name: 'commitmentB', type: 'bytes32', internalType: 'bytes32' },
    ],
    outputs: [
      { name: '', type: 'bool', internalType: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getSegment',
    inputs: [
      { name: 'segmentId', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [
      { name: 'name', type: 'string', internalType: 'string' },
      { name: 'memberCount', type: 'uint256', internalType: 'uint256' },
      { name: 'active', type: 'bool', internalType: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'segments',
    inputs: [
      { name: '', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [
      { name: 'name', type: 'string', internalType: 'string' },
      { name: 'memberCount', type: 'uint256', internalType: 'uint256' },
      { name: 'active', type: 'bool', internalType: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'segmentCount',
    inputs: [],
    outputs: [
      { name: '', type: 'uint256', internalType: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'commitments',
    inputs: [
      { name: '', type: 'bytes32', internalType: 'bytes32' },
    ],
    outputs: [
      { name: '', type: 'bool', internalType: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'segmentNullifiers',
    inputs: [
      { name: '', type: 'bytes32', internalType: 'bytes32' },
    ],
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

  // ---------------------------------------------------------------------------
  // Admin write functions
  // ---------------------------------------------------------------------------
  {
    type: 'function',
    name: 'createSegment',
    inputs: [
      { name: 'name', type: 'string', internalType: 'string' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'deactivateSegment',
    inputs: [
      { name: 'segmentId', type: 'uint256', internalType: 'uint256' },
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

  // ---------------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------------
  {
    type: 'event',
    name: 'SegmentCreated',
    inputs: [
      { name: 'segmentId', type: 'uint256', indexed: true, internalType: 'uint256' },
      { name: 'name', type: 'string', indexed: false, internalType: 'string' },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'MembershipCommitted',
    inputs: [
      { name: 'segmentId', type: 'uint256', indexed: true, internalType: 'uint256' },
      { name: 'commitment', type: 'bytes32', indexed: false, internalType: 'bytes32' },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'MembershipVerified',
    inputs: [
      { name: 'segmentId', type: 'uint256', indexed: true, internalType: 'uint256' },
      { name: 'commitment', type: 'bytes32', indexed: false, internalType: 'bytes32' },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'SegmentDeactivated',
    inputs: [
      { name: 'segmentId', type: 'uint256', indexed: true, internalType: 'uint256' },
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

  // ---------------------------------------------------------------------------
  // Custom errors
  // ---------------------------------------------------------------------------
  { type: 'error', name: 'SegmentNotActive', inputs: [] },
  { type: 'error', name: 'AlreadyCommitted', inputs: [] },
  { type: 'error', name: 'CommitmentExists', inputs: [] },
  { type: 'error', name: 'Unauthorized', inputs: [] },
  { type: 'error', name: 'ZeroAddress', inputs: [] },
] as const
