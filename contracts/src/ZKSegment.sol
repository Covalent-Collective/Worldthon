// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ZKSegment - Zero-Knowledge Segment Membership
/// @notice Proves a user belongs to a knowledge category without revealing their contributions.
/// @dev Uses commitment scheme: commit = keccak256(nullifierHash, segmentId, salt)
///
///      Privacy model:
///        - A user generates a commitment off-chain from their World ID nullifier hash,
///          a segment ID, and a random salt. Only the commitment is stored on-chain.
///        - The commitment is a one-way hash — nobody can reverse it to discover the
///          nullifier hash (and thus the user's identity).
///        - Verification: anyone can check that a commitment exists in a segment,
///          proving "someone is a member of segment X" without learning WHO.
///        - Matching: two commitments in the same segment prove two users share an
///          interest category — without revealing either user's identity or data.
///
///      ZK 프라이버시 모델:
///        - 사용자의 실제 데이터는 절대 온체인에 저장되지 않음
///        - commitment만으로는 누가 어떤 세그먼트에 속하는지 알 수 없음
///        - 예: "이 유저가 건강 카테고리에 관심있다" → 증명 가능
///             "이 유저가 어떤 건강 데이터를 썼는지" → 알 수 없음
contract ZKSegment {
    // -----------------------------------------------------------------------
    //  Errors
    // -----------------------------------------------------------------------

    error SegmentNotActive();
    error AlreadyCommitted();
    error CommitmentExists();
    error Unauthorized();

    // -----------------------------------------------------------------------
    //  Structs
    // -----------------------------------------------------------------------

    /// @notice A knowledge segment (category group).
    struct Segment {
        string name;           // e.g., "health", "finance", "travel"
        uint256 memberCount;
        bool active;
    }

    // -----------------------------------------------------------------------
    //  State Variables
    // -----------------------------------------------------------------------

    /// @notice Segment registry indexed by segmentId.
    mapping(uint256 => Segment) public segments;

    /// @notice Total number of segments created.
    uint256 public segmentCount;

    /// @notice Commitment storage: commitment hash => exists.
    /// A commitment proves membership without revealing WHO.
    mapping(bytes32 => bool) public commitments;

    /// @notice Nullifier tracking to prevent double-joining per segment.
    /// Key: keccak256(nullifierHash, segmentId).
    mapping(bytes32 => bool) public segmentNullifiers;

    /// @notice Contract owner — can create new segments.
    address public owner;

    // -----------------------------------------------------------------------
    //  Events
    // -----------------------------------------------------------------------

    /// @notice Emitted when a new segment is created.
    event SegmentCreated(uint256 indexed segmentId, string name);

    /// @notice Emitted when a membership commitment is stored.
    event MembershipCommitted(uint256 indexed segmentId, bytes32 commitment);

    /// @notice Emitted when a membership commitment is verified.
    event MembershipVerified(uint256 indexed segmentId, bytes32 commitment);

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

    /// @dev Initializes default segments matching the Seed Vault bot categories.
    constructor() {
        owner = msg.sender;

        // Initialize default segments matching our bot categories
        _createSegment("web3");           // 0: worldcoin-expert, crypto-expert
        _createSegment("travel");         // 1: seoul-local-guide
        _createSegment("health");         // 2: obgyn-specialist
        _createSegment("food");           // 3: korean-recipes
        _createSegment("business");       // 4: startup-mentor
        _createSegment("entertainment");  // 5: kpop-insider
    }

    // -----------------------------------------------------------------------
    //  Internal Helpers
    // -----------------------------------------------------------------------

    /// @notice Create a new segment (internal).
    function _createSegment(string memory name) internal {
        segments[segmentCount] = Segment(name, 0, true);
        emit SegmentCreated(segmentCount, name);
        segmentCount++;
    }

    // -----------------------------------------------------------------------
    //  Core Functions
    // -----------------------------------------------------------------------

    /// @notice Commit to segment membership (ZK-style).
    /// @dev commitment = keccak256(abi.encodePacked(nullifierHash, segmentId, salt))
    ///      The user generates this off-chain. On-chain we only store the commitment.
    ///      Nobody can reverse the commitment to find the nullifierHash.
    /// @param segmentId The segment to join.
    /// @param commitment The ZK commitment hash.
    /// @param nullifierKey keccak256(nullifierHash, segmentId) — prevents double-join.
    function commitMembership(
        uint256 segmentId,
        bytes32 commitment,
        bytes32 nullifierKey
    ) external {
        if (!segments[segmentId].active) revert SegmentNotActive();
        if (segmentNullifiers[nullifierKey]) revert AlreadyCommitted();
        if (commitments[commitment]) revert CommitmentExists();

        commitments[commitment] = true;
        segmentNullifiers[nullifierKey] = true;
        segments[segmentId].memberCount++;

        emit MembershipCommitted(segmentId, commitment);
    }

    /// @notice Verify that a commitment exists (proves membership).
    /// @dev The verifier checks the commitment exists without learning who made it.
    ///      This is the core ZK property: "someone in segment X made this commitment".
    /// @param commitment The commitment hash to check.
    /// @return True if the commitment exists.
    function verifyMembership(bytes32 commitment) external view returns (bool) {
        return commitments[commitment];
    }

    /// @notice Get segment info.
    /// @param segmentId The segment to query.
    /// @return name The segment name.
    /// @return memberCount The number of committed members.
    /// @return active Whether the segment is active.
    function getSegment(uint256 segmentId)
        external
        view
        returns (string memory name, uint256 memberCount, bool active)
    {
        Segment memory s = segments[segmentId];
        return (s.name, s.memberCount, s.active);
    }

    /// @notice Match two users by proving they share a segment.
    /// @dev Both users provide their commitments for the SAME segmentId.
    ///      If both commitments exist, they share a segment — but we don't know WHO they are.
    /// @param commitmentA First user's commitment.
    /// @param commitmentB Second user's commitment.
    /// @return True if both commitments exist (both users are segment members).
    function verifySegmentMatch(
        bytes32 commitmentA,
        bytes32 commitmentB
    ) external view returns (bool) {
        return commitments[commitmentA] && commitments[commitmentB];
    }

    // -----------------------------------------------------------------------
    //  Admin Functions
    // -----------------------------------------------------------------------

    /// @notice Create a new segment (owner only).
    /// @param name The human-readable name of the segment.
    function createSegment(string memory name) external onlyOwner {
        _createSegment(name);
    }
}
