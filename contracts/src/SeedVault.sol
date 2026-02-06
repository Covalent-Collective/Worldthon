// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IWorldID} from "./interfaces/IWorldID.sol";

/// @title SeedVault
/// @notice On-chain registry for knowledge contributions to expert bots.
///         Users contribute knowledge, earn citations, and claim WLD rewards.
///
/// @dev Follows the "vending machine" pattern throughout:
///      every public state-changing function is *deterministic* — the same valid
///      inputs always produce the same outputs with no hidden randomness or
///      off-chain oracle dependency. This makes the contract fully auditable
///      and predictable for integrators.
///
///      Reward flow:
///        1. User submits a contribution with a World ID proof  (recordContribution)
///        2. Anyone can register citations against contributions (recordCitations)
///        3. Contributors claim accumulated rewards              (claimReward)
///
///      Security highlights:
///        - World ID nullifier prevents double-signaling per action.
///        - Checks-Effects-Interactions on claimReward prevents reentrancy.
///        - Owner-gated admin functions use a minimal onlyOwner modifier
///          (no external dependency needed for a single-owner model).
contract SeedVault {
    // -----------------------------------------------------------------------
    //  Errors
    // -----------------------------------------------------------------------

    error InvalidNullifier();
    error DuplicateContribution();
    error ContributionNotFound();
    error NoPendingRewards();
    error TransferFailed();
    error Unauthorized();

    // -----------------------------------------------------------------------
    //  Events
    // -----------------------------------------------------------------------

    /// @notice Emitted when a new contribution is recorded on-chain.
    event ContributionRecorded(
        bytes32 indexed contentHash,
        address indexed contributor,
        uint256 botId
    );

    /// @notice Emitted for each citation added to a contribution.
    event CitationRecorded(bytes32 indexed contentHash, uint256 newCount);

    /// @notice Emitted when a user successfully claims their reward.
    event RewardClaimed(address indexed user, uint256 amount);

    // -----------------------------------------------------------------------
    //  Structs
    // -----------------------------------------------------------------------

    struct Contribution {
        bytes32 contentHash;    // keccak256 of the contributed content
        address contributor;    // contributor address (derived from signal)
        uint256 botId;          // which expert bot received the contribution
        uint256 timestamp;      // block.timestamp at recording time
        uint256 citationCount;  // how many times this contribution was cited
        bool exists;            // guard flag for mapping lookups
    }

    // -----------------------------------------------------------------------
    //  Constants
    // -----------------------------------------------------------------------

    /// @notice Reward paid per citation (0.001 ether as a WLD proxy).
    uint256 public constant REWARD_PER_CITATION = 0.001 ether;

    // -----------------------------------------------------------------------
    //  State Variables
    // -----------------------------------------------------------------------

    /// @notice World ID Router contract used for on-chain proof verification.
    IWorldID public worldId;

    /// @notice World ID group (1 = Orb-verified credentials).
    uint256 public groupId;

    /// @notice World ID app identifier (e.g. "app_staging_...").
    string public appId;

    /// @notice Action identifier scoping each proof (e.g. "contribute").
    string public actionId;

    /// @notice Contract owner — can deposit rewards and update config.
    address public owner;

    /// @notice Tracks used nullifier hashes to prevent double-signaling.
    mapping(uint256 => bool) public nullifierHashes;

    /// @notice Registry of all contributions keyed by contentHash.
    mapping(bytes32 => Contribution) public contributions;

    /// @notice Accumulated but unclaimed rewards per contributor address.
    mapping(address => uint256) public pendingRewards;

    /// @notice Running total of contributions recorded.
    uint256 public totalContributions;

    /// @notice Running total of citations recorded.
    uint256 public totalCitations;

    // -----------------------------------------------------------------------
    //  Modifiers
    // -----------------------------------------------------------------------

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    // -----------------------------------------------------------------------
    //  Constructor
    // -----------------------------------------------------------------------

    /// @param _worldId  Address of the World ID Router on World Chain.
    /// @param _appId    World ID app identifier.
    /// @param _actionId Action string that scopes the proof.
    /// @param _groupId  Credential group (1 for Orb).
    constructor(
        IWorldID _worldId,
        string memory _appId,
        string memory _actionId,
        uint256 _groupId
    ) {
        worldId = _worldId;
        appId = _appId;
        actionId = _actionId;
        groupId = _groupId;
        owner = msg.sender;
    }

    // -----------------------------------------------------------------------
    //  Core Functions — Vending Machine Pattern
    //  (deterministic: same valid input -> same output, always)
    // -----------------------------------------------------------------------

    /// @notice Record a knowledge contribution backed by a World ID proof.
    /// @dev Vending machine: valid proof + unique contentHash -> stored contribution.
    ///      The World ID proof guarantees the caller is a unique human, and the
    ///      nullifierHash ensures they cannot re-use the same proof for this action.
    ///
    /// @param contentHash    keccak256 hash of the contributed content.
    /// @param botId          Identifier of the expert bot that received the content.
    /// @param signal         The signal verified inside the ZK proof (contributor address).
    /// @param root           Merkle root of the World ID identity set.
    /// @param nullifierHash  Unique nullifier for this (user, action) pair.
    /// @param proof          Groth16 proof (8 x uint256).
    function recordContribution(
        bytes32 contentHash,
        uint256 botId,
        address signal,
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) external {
        // --- Checks ---

        // Prevent double-signaling with the same nullifier.
        if (nullifierHashes[nullifierHash]) revert InvalidNullifier();

        // Prevent duplicate contributions for the same content.
        if (contributions[contentHash].exists) revert DuplicateContribution();

        // Verify the World ID proof on-chain.
        // externalNullifierHash scopes the proof to this app + action.
        worldId.verifyProof(
            root,
            groupId,
            abi.encodePacked(signal).length == 20
                ? uint256(uint160(signal))
                : uint256(keccak256(abi.encodePacked(signal))),
            nullifierHash,
            uint256(keccak256(abi.encodePacked(appId, actionId))),
            proof
        );

        // --- Effects ---

        nullifierHashes[nullifierHash] = true;

        contributions[contentHash] = Contribution({
            contentHash: contentHash,
            contributor: signal,
            botId: botId,
            timestamp: block.timestamp,
            citationCount: 0,
            exists: true
        });

        totalContributions++;

        emit ContributionRecorded(contentHash, signal, botId);
    }

    /// @notice Record one or more citations against existing contributions.
    /// @dev Vending machine: each valid contentHash increments its citationCount
    ///      by exactly 1, and credits the contributor exactly REWARD_PER_CITATION.
    ///      Citations are public — anyone can submit them (e.g. a bot backend).
    ///
    /// @param contentHashes  Array of content hashes that were cited.
    function recordCitations(bytes32[] calldata contentHashes) external {
        for (uint256 i = 0; i < contentHashes.length; i++) {
            bytes32 hash = contentHashes[i];
            Contribution storage c = contributions[hash];

            if (!c.exists) revert ContributionNotFound();

            // --- Effects ---
            c.citationCount++;
            pendingRewards[c.contributor] += REWARD_PER_CITATION;
            totalCitations++;

            emit CitationRecorded(hash, c.citationCount);
        }
    }

    /// @notice Claim all accumulated rewards for the caller.
    /// @dev Vending machine: if pendingRewards > 0, caller receives that exact
    ///      amount. Uses checks-effects-interactions to prevent reentrancy.
    ///
    ///      Flow:
    ///        1. CHECK  — revert if nothing is owed.
    ///        2. EFFECT — zero the balance *before* the external call.
    ///        3. INTERACT — transfer ETH/WLD to the caller.
    function claimReward() external {
        // --- Checks ---
        uint256 amount = pendingRewards[msg.sender];
        if (amount == 0) revert NoPendingRewards();

        // --- Effects (before interaction — reentrancy guard) ---
        pendingRewards[msg.sender] = 0;

        // --- Interactions ---
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) revert TransferFailed();

        emit RewardClaimed(msg.sender, amount);
    }

    // -----------------------------------------------------------------------
    //  View Functions
    // -----------------------------------------------------------------------

    /// @notice Look up a contribution by its content hash.
    /// @param contentHash  The keccak256 hash used when the contribution was recorded.
    /// @return The full Contribution struct.
    function getContribution(bytes32 contentHash)
        external
        view
        returns (Contribution memory)
    {
        return contributions[contentHash];
    }

    /// @notice Check the unclaimed reward balance for any address.
    /// @param user  The address to query.
    /// @return The pending reward amount in wei.
    function getPendingReward(address user) external view returns (uint256) {
        return pendingRewards[user];
    }

    /// @notice Return aggregate protocol statistics.
    /// @return _totalContributions  Total contributions recorded.
    /// @return _totalCitations      Total citations recorded.
    function getStats()
        external
        view
        returns (uint256 _totalContributions, uint256 _totalCitations)
    {
        return (totalContributions, totalCitations);
    }

    // -----------------------------------------------------------------------
    //  Admin Functions
    // -----------------------------------------------------------------------

    /// @notice Deposit ETH/WLD into the contract to fund the reward pool.
    /// @dev Only the owner can deposit. The vending machine needs to be stocked.
    function depositRewards() external payable onlyOwner {
        // Funds are held by the contract; no further bookkeeping needed.
    }

    /// @notice Update the World ID Router address.
    /// @param _worldId  New IWorldID-compatible router address.
    function updateWorldId(address _worldId) external onlyOwner {
        worldId = IWorldID(_worldId);
    }

    /// @notice Allow the contract to receive plain ETH transfers (e.g. for funding).
    receive() external payable {}
}
