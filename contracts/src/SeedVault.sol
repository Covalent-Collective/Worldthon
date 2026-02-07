// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IWorldID} from "./interfaces/IWorldID.sol";

/// @title IERC20 - Minimal ERC-20 interface for WLD token interactions.
interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

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
///        2. Owner records citations against contributions       (recordCitations)
///        3. Contributors claim accumulated rewards              (claimReward)
///
///      Security highlights:
///        - World ID nullifier prevents double-signaling per action.
///        - Checks-Effects-Interactions on claimReward prevents reentrancy.
///        - Owner-gated admin functions use a minimal onlyOwner modifier
///          (no external dependency needed for a single-owner model).
///        - Citations are owner-gated (server relayer pattern) with duplicate prevention.
///        - Pause/unpause for emergency circuit breaker.
contract SeedVault {
    // -----------------------------------------------------------------------
    //  Errors
    // -----------------------------------------------------------------------

    error InvalidNullifier();
    error DuplicateContribution();
    error DuplicateCitation();
    error ContributionNotFound();
    error NoPendingRewards();
    error TransferFailed();
    error Unauthorized();
    error ZeroAddress();
    error BatchTooLarge();
    error ContractPaused();

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

    /// @notice Emitted when WLD rewards are deposited into the contract.
    event RewardsDeposited(address indexed depositor, uint256 amount);

    /// @notice Emitted when the World ID Router address is updated.
    event WorldIdUpdated(address indexed newWorldId);

    /// @notice Emitted when the owner performs an emergency withdrawal.
    event EmergencyWithdraw(address indexed owner, uint256 amount);

    /// @notice Emitted when contract ownership is transferred.
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /// @notice Emitted when the contract is paused.
    event Paused(address indexed account);

    /// @notice Emitted when the contract is unpaused.
    event Unpaused(address indexed account);

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

    /// @notice Reward paid per citation (0.001 WLD, 18 decimals).
    uint256 public constant REWARD_PER_CITATION = 1e15;

    /// @notice Maximum number of citations that can be recorded in a single batch.
    uint256 public constant MAX_BATCH_SIZE = 50;

    // -----------------------------------------------------------------------
    //  State Variables
    // -----------------------------------------------------------------------

    /// @notice World ID Router contract used for on-chain proof verification.
    IWorldID public worldId;

    /// @notice WLD ERC-20 token used for reward payments.
    IERC20 public wldToken;

    /// @notice World ID group (1 = Orb-verified credentials).
    uint256 public groupId;

    /// @notice World ID app identifier (e.g. "app_staging_...").
    string public appId;

    /// @notice Action identifier scoping each proof (e.g. "contribute").
    string public actionId;

    /// @notice Contract owner — can deposit rewards and update config.
    address public owner;

    /// @notice Whether the contract is paused.
    bool public paused;

    /// @notice Tracks used nullifier hashes to prevent double-signaling.
    mapping(uint256 => bool) public nullifierHashes;

    /// @notice Registry of all contributions keyed by contentHash.
    mapping(bytes32 => Contribution) public contributions;

    /// @notice Accumulated but unclaimed rewards per contributor address.
    mapping(address => uint256) public pendingRewards;

    /// @notice Duplicate citation prevention: contentHash => citingHash => already cited.
    mapping(bytes32 => mapping(bytes32 => bool)) public citedBy;

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

    modifier whenNotPaused() {
        if (paused) revert ContractPaused();
        _;
    }

    // -----------------------------------------------------------------------
    //  Constructor
    // -----------------------------------------------------------------------

    /// @param _worldId  Address of the World ID Router on World Chain.
    /// @param _appId    World ID app identifier.
    /// @param _actionId Action string that scopes the proof.
    /// @param _groupId  Credential group (1 for Orb).
    /// @param _wldToken Address of the WLD ERC-20 token.
    constructor(
        IWorldID _worldId,
        string memory _appId,
        string memory _actionId,
        uint256 _groupId,
        IERC20 _wldToken
    ) {
        worldId = _worldId;
        appId = _appId;
        actionId = _actionId;
        groupId = _groupId;
        wldToken = _wldToken;
        owner = msg.sender;
    }

    // -----------------------------------------------------------------------
    //  Internal Helpers
    // -----------------------------------------------------------------------

    /// @notice Hash a value to a field element (matching World ID's hashToField).
    /// @dev Returns keccak256(value) >> 8 to fit within the BN254 scalar field.
    /// @param value The bytes to hash.
    /// @return The field element.
    function hashToField(bytes memory value) internal pure returns (uint256) {
        return uint256(keccak256(value)) >> 8;
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
    ) external whenNotPaused {
        // --- Checks ---

        // Prevent double-signaling with the same nullifier.
        if (nullifierHashes[nullifierHash]) revert InvalidNullifier();

        // Prevent duplicate contributions for the same content.
        if (contributions[contentHash].exists) revert DuplicateContribution();

        // Compute signal hash using hashToField (matches World ID official implementation).
        uint256 signalHash = hashToField(abi.encodePacked(signal));

        // Compute externalNullifierHash: hashToField(hashToField(appId), actionId)
        uint256 externalNullifierHash = hashToField(
            abi.encodePacked(
                hashToField(abi.encodePacked(appId)),
                actionId
            )
        );

        // Verify the World ID proof on-chain.
        worldId.verifyProof(
            root,
            groupId,
            signalHash,
            nullifierHash,
            externalNullifierHash,
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
    /// @dev Owner-gated (server relayer pattern). Each valid contentHash increments
    ///      its citationCount by exactly 1, and credits the contributor exactly
    ///      REWARD_PER_CITATION. Duplicate citations (same citingHash for a
    ///      contentHash) are rejected.
    ///
    /// @param contentHashes  Array of content hashes that were cited.
    /// @param citingHashes   Array of hashes identifying the citing content (parallel to contentHashes).
    function recordCitations(
        bytes32[] calldata contentHashes,
        bytes32[] calldata citingHashes
    ) external onlyOwner whenNotPaused {
        require(contentHashes.length == citingHashes.length, "Array length mismatch");
        if (contentHashes.length > MAX_BATCH_SIZE) revert BatchTooLarge();

        for (uint256 i = 0; i < contentHashes.length; i++) {
            bytes32 hash = contentHashes[i];
            bytes32 citing = citingHashes[i];
            Contribution storage c = contributions[hash];

            if (!c.exists) revert ContributionNotFound();
            if (citedBy[hash][citing]) revert DuplicateCitation();

            // --- Effects ---
            citedBy[hash][citing] = true;
            c.citationCount++;
            pendingRewards[c.contributor] += REWARD_PER_CITATION;
            totalCitations++;

            emit CitationRecorded(hash, c.citationCount);
        }
    }

    /// @notice Claim all accumulated rewards for the caller.
    /// @dev Vending machine: if pendingRewards > 0, caller receives that exact
    ///      amount in WLD tokens. Uses checks-effects-interactions to prevent
    ///      reentrancy.
    ///
    ///      Flow:
    ///        1. CHECK  — revert if nothing is owed.
    ///        2. EFFECT — zero the balance *before* the external call.
    ///        3. INTERACT — transfer WLD to the caller.
    function claimReward() external whenNotPaused {
        // --- Checks ---
        uint256 amount = pendingRewards[msg.sender];
        if (amount == 0) revert NoPendingRewards();

        // --- Effects (before interaction — reentrancy guard) ---
        pendingRewards[msg.sender] = 0;

        // --- Interactions ---
        bool success = wldToken.transfer(msg.sender, amount);
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
    /// @return The pending reward amount in WLD (18 decimals).
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

    /// @notice Return the current WLD reward pool balance held by this contract.
    /// @return The WLD token balance of this contract.
    function getRewardPoolBalance() external view returns (uint256) {
        return wldToken.balanceOf(address(this));
    }

    // -----------------------------------------------------------------------
    //  Admin Functions
    // -----------------------------------------------------------------------

    /// @notice Deposit WLD tokens into the contract to fund the reward pool.
    /// @dev Only the owner can deposit. Requires prior ERC-20 approval.
    /// @param amount  The amount of WLD tokens to deposit (18 decimals).
    function depositRewards(uint256 amount) external onlyOwner {
        bool success = wldToken.transferFrom(msg.sender, address(this), amount);
        if (!success) revert TransferFailed();

        emit RewardsDeposited(msg.sender, amount);
    }

    /// @notice Update the World ID Router address.
    /// @param _worldId  New IWorldID-compatible router address.
    function updateWorldId(address _worldId) external onlyOwner {
        require(_worldId != address(0), "Zero address");
        worldId = IWorldID(_worldId);

        emit WorldIdUpdated(_worldId);
    }

    /// @notice Transfer ownership of the contract to a new address.
    /// @param newOwner  The address of the new owner.
    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        address previousOwner = owner;
        owner = newOwner;

        emit OwnershipTransferred(previousOwner, newOwner);
    }

    /// @notice Emergency withdraw WLD tokens to the owner address.
    /// @param amount  The amount of WLD tokens to withdraw.
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        bool success = wldToken.transfer(owner, amount);
        if (!success) revert TransferFailed();

        emit EmergencyWithdraw(owner, amount);
    }

    /// @notice Pause the contract, disabling core functions.
    function pause() external onlyOwner {
        paused = true;

        emit Paused(msg.sender);
    }

    /// @notice Unpause the contract, re-enabling core functions.
    function unpause() external onlyOwner {
        paused = false;

        emit Unpaused(msg.sender);
    }
}
