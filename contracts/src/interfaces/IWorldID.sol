// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IWorldID
/// @notice Interface for the World ID Router contract.
/// @dev See https://github.com/worldcoin/world-id-onchain-template for the
///      canonical implementation. The router dispatches verifyProof to the
///      correct verifier for the given groupId.
interface IWorldID {
    /// @notice Verifies a World ID zero-knowledge proof.
    /// @param root               The Merkle root of the identity group.
    /// @param groupId            The World ID credential type (1 = Orb).
    /// @param signalHash         keccak256 hash of the signal (abi-encoded).
    /// @param nullifierHash      Unique nullifier for this (user, action) pair.
    /// @param externalNullifierHash  Hash of (appId, actionId) — scopes the proof.
    /// @param proof              The eight uint256 elements of the Groth16 proof.
    function verifyProof(
        uint256 root,
        uint256 groupId,
        uint256 signalHash,
        uint256 nullifierHash,
        uint256 externalNullifierHash,
        uint256[8] calldata proof
    ) external view;
}
