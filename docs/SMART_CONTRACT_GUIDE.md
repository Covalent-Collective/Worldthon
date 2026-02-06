# Seed Vault - Smart Contract Integration Guide

> 스마트 컨트랙트가 처음인 팀원을 위한 친절한 가이드
>
> 마지막 업데이트: 2026-02-06

---

## 목차

1. [기본 개념 정리](#1-기본-개념-정리)
2. [World Chain이 뭔데?](#2-world-chain이-뭔데)
3. [우리 프로젝트에 왜 필요한가?](#3-우리-프로젝트에-왜-필요한가)
4. [전체 아키텍처](#4-전체-아키텍처)
5. [컨트랙트 상세 설계](#5-컨트랙트-상세-설계)
6. [개발 환경 세팅](#6-개발-환경-세팅)
7. [배포 가이드](#7-배포-가이드)
8. [프론트엔드 연동](#8-프론트엔드-연동)
9. [용어 사전](#9-용어-사전)

---

## 1. 기본 개념 정리

### 스마트 컨트랙트가 뭐야?

**한 줄 요약**: 블록체인 위에서 자동으로 실행되는 프로그램.

일반적인 프로그램과 비교하면:

| | 일반 서버 프로그램 | 스마트 컨트랙트 |
|---|---|---|
| **어디서 실행?** | AWS 같은 서버 | 블록체인 네트워크 (전 세계 노드) |
| **누가 관리?** | 우리 팀 | 아무도 (코드가 법) |
| **수정 가능?** | 언제든 수정 가능 | 한번 배포하면 변경 불가 |
| **비용** | 서버비 (월 고정) | 가스비 (실행할 때마다) |
| **신뢰** | "우리를 믿어주세요" | "코드를 직접 확인하세요" |

쉽게 말해, **자판기**와 비슷하다. 동전을 넣으면(트랜잭션을 보내면) 자동으로 음료가 나온다(코드가 실행된다). 자판기 주인이 중간에 개입할 수 없고, 규칙은 미리 정해져 있다.

### Solidity가 뭐야?

**한 줄 요약**: 스마트 컨트랙트를 작성하는 프로그래밍 언어.

- JavaScript/TypeScript와 문법이 비슷해서 우리 팀이 배우기 쉬움
- `.sol` 확장자 파일에 작성
- 컴파일하면 EVM 바이트코드로 변환 → 블록체인에 배포

```solidity
// 가장 간단한 예시 - 숫자를 저장하고 읽는 컨트랙트
pragma solidity ^0.8.19;

contract SimpleStorage {
    uint256 public storedNumber;  // 블록체인에 영구 저장되는 숫자

    function store(uint256 _number) public {
        storedNumber = _number;   // 누구나 숫자를 바꿀 수 있음
    }

    function read() public view returns (uint256) {
        return storedNumber;      // 가스비 없이 읽기 가능
    }
}
```

### EVM이 뭐야?

**Ethereum Virtual Machine** - 스마트 컨트랙트를 실행하는 엔진.

비유하면:
- Solidity = TypeScript (우리가 쓰는 언어)
- EVM = Node.js (실행 환경)
- 블록체인 = 서버 (실행 장소)

**EVM 호환**이라는 말은 "Solidity로 짠 코드가 그대로 실행된다"는 뜻이다.
World Chain은 **EVM 호환**이므로, Solidity로 짜면 된다. 별도 언어가 필요 없다.

### 가스비(Gas Fee)가 뭐야?

블록체인에서 코드를 실행하려면 **수수료**를 내야 한다. 이걸 가스비라고 부른다.

| 동작 | 가스비 발생? | 비유 |
|------|-------------|------|
| 데이터 읽기 (view) | 무료 | 도서관에서 책 읽기 |
| 데이터 쓰기 (트랜잭션) | 유료 | 도서관에 책 기부하기 (등록비) |
| 컨트랙트 배포 | 유료 (비쌈) | 도서관 건물 짓기 |

**World Chain의 특별한 점**: Orb 인증된 사용자는 **가스비 무료**! 이게 우리 프로젝트에 큰 장점.

### ERC-20 토큰이 뭐야?

**한 줄 요약**: 블록체인 위의 디지털 화폐를 만드는 표준 규격.

WLD(월드코인 토큰)이 바로 ERC-20 토큰이다.

ERC-20이 정의하는 기본 기능:
- `transfer(to, amount)` - 토큰 보내기
- `balanceOf(address)` - 잔고 확인
- `approve(spender, amount)` - 다른 사람에게 인출 권한 부여
- `transferFrom(from, to, amount)` - 위임받은 토큰 전송

### L1, L2가 뭐야?

| | L1 (Layer 1) | L2 (Layer 2) |
|---|---|---|
| **뭐야?** | 메인 블록체인 | 메인 위에 올린 보조 체인 |
| **예시** | Ethereum | World Chain, Optimism, Base |
| **속도** | 느림 (12초/블록) | 빠름 (2초/블록) |
| **가스비** | 비쌈 | 저렴 |
| **보안** | 자체 보안 | L1의 보안을 빌려씀 |

**World Chain = L2**. Ethereum(L1)의 보안을 활용하면서, 더 빠르고 저렴하게 동작한다.

비유하면:
- L1(Ethereum) = 고속도로 본선 (안전하지만 혼잡)
- L2(World Chain) = 고속도로 위 고가 도로 (빠르고 한산)

### Zero-Knowledge Proof (ZKP)가 뭐야?

**한 줄 요약**: "내가 뭔가를 안다"는 것을 증명하되, 그 내용 자체는 공개하지 않는 기술.

World ID에서의 활용:
```
"나는 Orb로 인증된 인간이다" → 증명 가능
"내 이름은 홍길동이다"     → 공개되지 않음
"내 신분증 번호는 XXX다"   → 공개되지 않음
```

스마트 컨트랙트에서 이 증명(proof)을 검증하면, **익명성을 유지하면서 인간임을 확인**할 수 있다.

---

## 2. World Chain이 뭔데?

### 한 줄 요약

**World Chain = Worldcoin이 만든 블록체인 (Ethereum L2)**

### 왜 만들었나?

Worldcoin의 목표는 "모든 인간에게 디지털 신원과 경제적 기회를 제공"하는 것.
이를 위해 자체 블록체인을 만들었다:

```
World ID (신원 증명)
    +
World Chain (블록체인)
    +
WLD Token (경제적 인센티브)
    =
인간 중심의 디지털 경제
```

### 기술 스펙

| 항목 | 값 |
|------|-----|
| 기반 | OP Stack (Optimism) |
| Chain ID | 480 (Mainnet) |
| 블록 시간 | 2초 |
| 가스 토큰 | ETH |
| EVM 호환 | 100% (Solidity 그대로 사용) |
| 탐색기 | https://worldscan.org |

### RPC 엔드포인트 (우리 앱이 블록체인에 접속하는 주소)

| 환경 | URL |
|------|-----|
| Mainnet | `https://worldchain-mainnet.g.alchemy.com/public` |
| Testnet (Sepolia) | `https://worldchain-sepolia.g.alchemy.com/public` |

### World Chain의 특별한 점

1. **인증된 인간 우선**: Orb 인증 유저는 가스비 무료/우선 처리
2. **봇 억제**: 봇은 가스비를 더 많이 냄
3. **WLD 에어드롭**: 인증된 인간에게 WLD 토큰 자동 지급
4. **Mini App**: World App 안에서 바로 사용 가능

### Solidity로 짜면 바로 배포 가능?

**YES.** 브릿지나 변환 작업이 전혀 필요 없다.

```
Ethereum에서 돌아가는 Solidity 코드
        ↓ 그대로
World Chain에서도 돌아간다
```

이유: World Chain이 OP Stack 기반이라 Ethereum과 동일한 EVM을 사용하기 때문.

---

## 3. 우리 프로젝트에 왜 필요한가?

### 현재 MVP의 한계

지금 우리 Seed Vault MVP는 이런 상태다:

```
사용자 → (가짜 인증) → 지식 기여 → (localStorage) → 보상 표시 (가짜 숫자)
```

모든 게 **클라이언트에서만** 돌아간다. 새로고침하면 데이터가 날아가고, 보상도 진짜가 아니다.

### 스마트 컨트랙트가 해결하는 것

```
사용자 → (진짜 World ID 검증) → 지식 기여 → (블록체인에 영구 기록) → 진짜 WLD 보상
```

| 문제 | 현재 (MVP) | 스마트 컨트랙트 적용 후 |
|------|-----------|---------------------|
| 인증 | 가짜 (버튼 누르면 통과) | 진짜 ZK proof 온체인 검증 |
| 데이터 저장 | localStorage (휘발성) | 블록체인 (영구) |
| 보상 | 가짜 숫자 표시 | 진짜 WLD 토큰 전송 |
| 투명성 | "우리를 믿어주세요" | 누구나 컨트랙트 코드 확인 가능 |
| 중복 방지 | 없음 | nullifier hash로 Sybil 공격 차단 |

### 구체적으로 뭘 만들어야 하나?

3개의 핵심 기능을 스마트 컨트랙트로 구현:

```
┌──────────────────────────────────────────────────┐
│              SeedVaultRewards.sol                 │
│                                                  │
│  1. verifyHuman()    - World ID 인증 확인         │
│  2. contribute()     - 지식 노드 등록             │
│  3. claimReward()    - WLD 보상 수령              │
│                                                  │
│  + recordCitation()  - 인용 기록 (백엔드 호출)     │
│  + getContribution() - 기여 내역 조회             │
└──────────────────────────────────────────────────┘
```

---

## 4. 전체 아키텍처

### 현재 (MVP)

```
┌────────────────────────────┐
│    Next.js 프론트엔드       │
│                            │
│  localStorage + Zustand    │
│  (모든 데이터가 여기)       │
└────────────────────────────┘
```

### 목표 (스마트 컨트랙트 연동)

```
┌─────────────────────────────────────────────────────────────┐
│                      사용자 (World App)                      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │  Next.js    │
                    │  프론트엔드  │
                    │             │
                    │  + ethers.js│ ← 블록체인과 통신하는 라이브러리
                    │  + IDKit    │ ← World ID proof 생성
                    └──┬──────┬──┘
                       │      │
            ┌──────────▼┐  ┌──▼────────────┐
            │  백엔드    │  │  World Chain   │
            │  (API)    │  │  (블록체인)     │
            │           │  │               │
            │  - 질문/답변│  │  스마트 컨트랙트│
            │  - 인용 계산│  │  - 인증 검증   │
            │  - 인덱싱  │  │  - 노드 등록   │
            │           │  │  - 보상 분배   │
            └───────────┘  │               │
                           │  WLD 토큰 ←───│
                           │  (ERC-20)     │
                           └───────────────┘
```

### 데이터 흐름 (기여 시나리오)

```
1. 사용자가 음성 저널링 완료
   └→ 프론트엔드에서 키워드 추출

2. "기여하기" 버튼 클릭
   └→ IDKit이 World ID proof 생성 (ZK proof)

3. proof를 스마트 컨트랙트에 전송
   └→ SeedVaultRewards.contribute() 호출
   └→ 컨트랙트가 proof 검증 (IWorldID.verifyProof)
   └→ 검증 성공 시 지식 노드 해시를 블록체인에 기록

4. 기여 완료!
   └→ 트랜잭션 해시를 영수증으로 표시
```

### 데이터 흐름 (보상 수령 시나리오)

```
1. 누군가 질문 → 백엔드가 관련 노드 검색 → 답변 생성
   └→ 사용된 노드 ID + 기여 비율 계산

2. 백엔드가 SeedVaultRewards.recordCitation() 호출
   └→ 각 기여자의 pendingReward 증가

3. 기여자가 "Claim Reward" 클릭
   └→ SeedVaultRewards.claimReward() 호출
   └→ WLD 토큰이 기여자 지갑으로 전송
```

---

## 5. 컨트랙트 상세 설계

### 5.1 파일 구조

```
seed-vault-contracts/          ← 별도 프로젝트 (Foundry)
├── src/
│   ├── SeedVaultRewards.sol   ← 메인 컨트랙트
│   ├── interfaces/
│   │   └── IWorldID.sol       ← World ID 인터페이스
│   └── helpers/
│       └── ByteHasher.sol     ← 해시 유틸리티
├── test/
│   └── SeedVaultRewards.t.sol ← 테스트
├── script/
│   └── Deploy.s.sol           ← 배포 스크립트
└── foundry.toml               ← 설정
```

### 5.2 IWorldID 인터페이스

World ID 컨트랙트와 통신하기 위한 인터페이스. 우리가 직접 만드는 게 아니라,
이미 World Chain에 배포되어 있는 컨트랙트를 가져다 쓰는 것.

```solidity
// src/interfaces/IWorldID.sol
pragma solidity ^0.8.19;

interface IWorldID {
    /// @notice World ID ZK proof를 검증한다
    /// @param root - Merkle tree root (IDKit에서 받음)
    /// @param groupId - 1이면 Orb 인증 (우리는 항상 1)
    /// @param signalHash - 시그널의 해시 (보통 지갑 주소)
    /// @param nullifierHash - 익명 사용자 ID (같은 사람 = 같은 해시)
    /// @param externalNullifierHash - 앱+액션 조합 식별자
    /// @param proof - ZK proof 데이터 (8개 숫자 배열)
    function verifyProof(
        uint256 root,
        uint256 groupId,
        uint256 signalHash,
        uint256 nullifierHash,
        uint256 externalNullifierHash,
        uint256[8] calldata proof
    ) external view;
    // 검증 실패 시 자동으로 revert (에러 발생)
    // 검증 성공 시 아무것도 반환하지 않고 통과
}
```

**각 파라미터가 하는 일:**

| 파라미터 | 어디서 오는가 | 하는 일 |
|---------|-------------|---------|
| `root` | IDKit (프론트엔드) | "이 시점의 인증 데이터 기준으로 검증해줘" |
| `groupId` | 우리가 고정 (1) | "Orb 인증된 사람만 허용" |
| `signalHash` | 지갑 주소 해시 | "이 지갑 주인이 맞는지 확인" |
| `nullifierHash` | IDKit (프론트엔드) | "이 사람이 이미 이 액션을 했는지 추적" |
| `externalNullifierHash` | 컨트랙트 생성 시 설정 | "어떤 앱의 어떤 액션인지 구분" |
| `proof` | IDKit (프론트엔드) | "위 내용이 진짜라는 수학적 증거" |

### 5.3 ByteHasher 헬퍼

World ID에서 사용하는 특수한 해시 함수.
일반 keccak256과 살짝 다르게, 결과값을 field element 범위로 맞춘다.

```solidity
// src/helpers/ByteHasher.sol
pragma solidity ^0.8.19;

library ByteHasher {
    /// @notice bytes를 ZK proof에서 사용 가능한 field element로 변환
    function hashToField(bytes memory value) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(value))) >> 8;
        //                                                 ^^^^
        // 오른쪽으로 8비트 쉬프트 = 결과를 248비트로 제한
        // ZK proof의 수학적 요구사항을 맞추기 위함
    }
}
```

### 5.4 메인 컨트랙트: SeedVaultRewards

```solidity
// src/SeedVaultRewards.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { IWorldID } from "./interfaces/IWorldID.sol";
import { ByteHasher } from "./helpers/ByteHasher.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract SeedVaultRewards is Ownable {
    using ByteHasher for bytes;

    // ============================================================
    //  상수 & 불변값
    // ============================================================

    /// @notice World ID 컨트랙트 (이미 World Chain에 배포되어 있음)
    IWorldID internal immutable worldId;

    /// @notice WLD 토큰 컨트랙트 (이미 World Chain에 배포되어 있음)
    IERC20 public immutable wldToken;

    /// @notice Orb 인증만 허용 (groupId = 1)
    uint256 internal immutable groupId = 1;

    /// @notice 앱+액션 조합 해시 (생성자에서 계산)
    uint256 internal immutable externalNullifierHash;

    // ============================================================
    //  상태 변수 (블록체인에 영구 저장)
    // ============================================================

    /// @notice 이미 사용된 nullifier 추적 (중복 방지)
    mapping(uint256 => bool) public usedNullifiers;

    /// @notice 지식 노드 정보
    struct KnowledgeNode {
        bytes32 contentHash;       // 콘텐츠 해시 (내용 자체는 오프체인)
        uint256 contributorHash;   // 기여자 nullifier hash (익명)
        string vaultId;            // 어떤 Vault에 기여했는지
        uint256 citationCount;     // 인용 횟수
        uint256 pendingReward;     // 미수령 보상 (wei 단위)
        uint256 createdAt;         // 등록 시간
    }

    /// @notice 노드 ID → 노드 정보
    mapping(bytes32 => KnowledgeNode) public nodes;

    /// @notice 기여자별 노드 목록
    mapping(uint256 => bytes32[]) public contributorNodes;

    /// @notice 총 등록된 노드 수
    uint256 public totalNodes;

    /// @notice 인용당 보상 (기본: 0.001 WLD)
    uint256 public rewardPerCitation = 0.001 ether; // WLD도 18 decimal

    // ============================================================
    //  이벤트 (프론트엔드에서 감지 가능)
    // ============================================================

    event NodeContributed(
        bytes32 indexed nodeId,
        uint256 indexed contributorHash,
        string vaultId,
        uint256 timestamp
    );

    event CitationRecorded(
        bytes32 indexed nodeId,
        uint256 weight,
        uint256 rewardAmount
    );

    event RewardClaimed(
        uint256 indexed contributorHash,
        uint256 amount
    );

    // ============================================================
    //  에러
    // ============================================================

    error DuplicateNullifier();   // 이미 인증한 nullifier
    error InvalidNode();          // 존재하지 않는 노드
    error NoReward();             // 수령할 보상 없음
    error InsufficientBalance();  // 컨트랙트에 WLD 잔고 부족

    // ============================================================
    //  생성자 (배포 시 1번만 실행)
    // ============================================================

    constructor(
        IWorldID _worldId,      // World ID 컨트랙트 주소
        IERC20 _wldToken,       // WLD 토큰 주소
        string memory _appId,   // World Developer Portal의 App ID
        string memory _action   // 액션 이름 (예: "contribute")
    ) Ownable(msg.sender) {
        worldId = _worldId;
        wldToken = _wldToken;

        // externalNullifierHash 계산
        // = hash(hash(appId) + action)
        // 같은 앱의 같은 액션이면 항상 같은 값
        externalNullifierHash = abi
            .encodePacked(
                abi.encodePacked(_appId).hashToField(),
                _action
            )
            .hashToField();
    }

    // ============================================================
    //  핵심 함수 1: 지식 기여
    // ============================================================

    /// @notice World ID로 인증 후 지식 노드를 등록한다
    /// @param signal 시그널 (보통 msg.sender 주소)
    /// @param root Merkle tree root (IDKit에서 받음)
    /// @param nullifierHash 익명 사용자 ID (IDKit에서 받음)
    /// @param proof ZK proof (IDKit에서 받음)
    /// @param contentHash 기여하는 지식의 해시
    /// @param vaultId Vault ID (예: "seoul-guide")
    function contribute(
        address signal,
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof,
        bytes32 contentHash,
        string calldata vaultId
    ) external {
        // 1. 중복 검사 - 같은 nullifier로 이미 기여했는지 확인
        //    (같은 사람이 여러 번 기여하는 건 허용하므로,
        //     실제로는 contentHash+nullifier 조합으로 체크할 수도 있음)

        // 2. World ID proof 검증 (온체인)
        //    이 한 줄이 핵심! 검증 실패 시 자동 revert
        worldId.verifyProof(
            root,
            groupId,
            abi.encodePacked(signal).hashToField(),
            nullifierHash,
            externalNullifierHash,
            proof
        );

        // 3. 노드 ID 생성 (contentHash + contributor로 유니크하게)
        bytes32 nodeId = keccak256(
            abi.encodePacked(contentHash, nullifierHash, block.timestamp)
        );

        // 4. 블록체인에 기록
        nodes[nodeId] = KnowledgeNode({
            contentHash: contentHash,
            contributorHash: nullifierHash,
            vaultId: vaultId,
            citationCount: 0,
            pendingReward: 0,
            createdAt: block.timestamp
        });

        contributorNodes[nullifierHash].push(nodeId);
        totalNodes++;

        // 5. 이벤트 발행 (프론트엔드가 감지)
        emit NodeContributed(nodeId, nullifierHash, vaultId, block.timestamp);
    }

    // ============================================================
    //  핵심 함수 2: 인용 기록 (백엔드가 호출)
    // ============================================================

    /// @notice 질문 답변 시 사용된 노드의 인용을 기록하고 보상을 적립한다
    /// @param nodeIds 인용된 노드 ID 배열
    /// @param weights 각 노드의 기여 비율 (합계 100)
    function recordCitation(
        bytes32[] calldata nodeIds,
        uint256[] calldata weights
    ) external onlyOwner {
        // onlyOwner: 백엔드만 호출 가능 (악용 방지)

        uint256 totalReward = rewardPerCitation;

        for (uint256 i = 0; i < nodeIds.length; i++) {
            KnowledgeNode storage node = nodes[nodeIds[i]];
            if (node.createdAt == 0) revert InvalidNode();

            node.citationCount++;

            // 비례 분배: weight가 60이면 전체 보상의 60%
            uint256 nodeReward = (totalReward * weights[i]) / 100;
            node.pendingReward += nodeReward;

            emit CitationRecorded(nodeIds[i], weights[i], nodeReward);
        }
    }

    // ============================================================
    //  핵심 함수 3: 보상 수령
    // ============================================================

    /// @notice 기여자가 자신의 미수령 보상을 WLD로 수령한다
    /// @param nullifierHash 본인의 nullifier hash
    function claimReward(uint256 nullifierHash) external {
        bytes32[] storage myNodes = contributorNodes[nullifierHash];

        uint256 totalClaim = 0;

        // 모든 노드의 pending reward 합산
        for (uint256 i = 0; i < myNodes.length; i++) {
            KnowledgeNode storage node = nodes[myNodes[i]];
            totalClaim += node.pendingReward;
            node.pendingReward = 0;  // 수령 처리
        }

        if (totalClaim == 0) revert NoReward();

        // 컨트랙트에 WLD가 충분한지 확인
        if (wldToken.balanceOf(address(this)) < totalClaim) {
            revert InsufficientBalance();
        }

        // WLD 토큰 전송!
        wldToken.transfer(msg.sender, totalClaim);

        emit RewardClaimed(nullifierHash, totalClaim);
    }

    // ============================================================
    //  조회 함수 (가스비 무료)
    // ============================================================

    /// @notice 기여자의 노드 개수 조회
    function getContributionCount(uint256 nullifierHash)
        external view returns (uint256)
    {
        return contributorNodes[nullifierHash].length;
    }

    /// @notice 기여자의 총 미수령 보상 조회
    function getPendingReward(uint256 nullifierHash)
        external view returns (uint256)
    {
        bytes32[] storage myNodes = contributorNodes[nullifierHash];
        uint256 total = 0;
        for (uint256 i = 0; i < myNodes.length; i++) {
            total += nodes[myNodes[i]].pendingReward;
        }
        return total;
    }

    /// @notice 노드 정보 조회
    function getNode(bytes32 nodeId)
        external view returns (KnowledgeNode memory)
    {
        return nodes[nodeId];
    }

    // ============================================================
    //  관리 함수 (Owner만)
    // ============================================================

    /// @notice 인용당 보상 금액 변경
    function setRewardPerCitation(uint256 _amount) external onlyOwner {
        rewardPerCitation = _amount;
    }

    /// @notice 컨트랙트에 WLD 토큰 입금 (보상 재원)
    /// 먼저 wldToken.approve(이 컨트랙트 주소, amount) 호출 필요
    function depositRewards(uint256 amount) external onlyOwner {
        wldToken.transferFrom(msg.sender, address(this), amount);
    }
}
```

### 5.5 각 함수가 하는 일 요약

| 함수 | 누가 호출? | 가스비? | 하는 일 |
|------|-----------|--------|---------|
| `contribute()` | 사용자 | 유료 (Orb 인증 시 무료) | World ID 검증 + 노드 등록 |
| `recordCitation()` | 백엔드 (Owner) | 유료 | 인용 기록 + 보상 적립 |
| `claimReward()` | 사용자 | 유료 (Orb 인증 시 무료) | WLD 토큰 수령 |
| `getContributionCount()` | 누구나 | 무료 | 기여 개수 조회 |
| `getPendingReward()` | 누구나 | 무료 | 미수령 보상 조회 |
| `getNode()` | 누구나 | 무료 | 노드 정보 조회 |
| `setRewardPerCitation()` | Owner | 유료 | 보상 금액 변경 |
| `depositRewards()` | Owner | 유료 | 보상 재원 입금 |

---

## 6. 개발 환경 세팅

### 6.1 Foundry 설치

Foundry는 Solidity 개발 도구 모음이다. (JavaScript 세계의 npm 같은 존재)

```bash
# macOS / Linux
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

설치되는 도구:

| 도구 | 역할 | 비유 |
|------|------|------|
| `forge` | 빌드, 테스트, 배포 | npm (패키지 매니저 + 빌드 도구) |
| `cast` | 블록체인 조회/트랜잭션 | curl (API 호출 도구) |
| `anvil` | 로컬 테스트 체인 | localhost:3000 (개발 서버) |

### 6.2 프로젝트 생성

```bash
# seed-vault-mvp 프로젝트 루트에서
mkdir contracts && cd contracts

# Foundry 프로젝트 초기화
forge init

# OpenZeppelin 설치 (ERC-20 등 표준 라이브러리)
forge install OpenZeppelin/openzeppelin-contracts --no-commit
```

### 6.3 설정 파일

```toml
# foundry.toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc = "0.8.19"

[rpc_endpoints]
world_chain_sepolia = "https://worldchain-sepolia.g.alchemy.com/public"
world_chain_mainnet = "https://worldchain-mainnet.g.alchemy.com/public"
```

### 6.4 테스트 실행

```bash
# 전체 테스트
forge test

# 상세 출력
forge test -vvvv

# 특정 테스트만
forge test --match-test testContribute
```

### 6.5 로컬 테스트 체인

```bash
# 로컬 블록체인 실행 (다른 터미널에서)
anvil

# 테스트 계정 10개가 자동 생성됨
# 각각 10000 ETH 보유
```

---

## 7. 배포 가이드

### 7.1 지갑 생성

```bash
# 새 지갑 생성
cast wallet new

# 출력 예시:
# Address:     0x1234...5678
# Private key: 0xabcd...ef01
#
# Private key는 절대 공유하지 말 것!
```

### 7.2 테스트넷 ETH 받기

World Chain Sepolia 테스트넷용 ETH가 필요:
- Alchemy Faucet에서 무료로 받을 수 있음
- https://www.alchemy.com/faucets/world-chain-sepolia

### 7.3 테스트넷 배포

```bash
# 1. 컴파일
forge build

# 2. 테스트넷 배포
forge create src/SeedVaultRewards.sol:SeedVaultRewards \
  --rpc-url https://worldchain-sepolia.g.alchemy.com/public \
  --private-key $PRIVATE_KEY \
  --constructor-args \
    <WORLD_ID_ROUTER_ADDRESS> \
    <WLD_TOKEN_ADDRESS> \
    "app_YOUR_APP_ID" \
    "contribute"

# 3. 배포 성공 시 출력:
# Deployed to: 0xYOUR_CONTRACT_ADDRESS
```

### 7.4 컨트랙트 검증 (소스코드 공개)

```bash
forge verify-contract \
  <YOUR_CONTRACT_ADDRESS> \
  SeedVaultRewards \
  --chain 480 \
  --watch
```

검증 후 WorldScan에서 누구나 소스코드를 확인할 수 있다.
이것이 "투명성"의 핵심.

### 7.5 메인넷 배포 (프로덕션)

테스트넷에서 충분히 테스트한 후:

```bash
forge create src/SeedVaultRewards.sol:SeedVaultRewards \
  --rpc-url https://worldchain-mainnet.g.alchemy.com/public \
  --private-key $PRIVATE_KEY \
  --constructor-args \
    <WORLD_ID_ROUTER_MAINNET> \
    <WLD_TOKEN_MAINNET> \
    "app_YOUR_APP_ID" \
    "contribute"
```

---

## 8. 프론트엔드 연동

### 8.1 필요한 라이브러리

```bash
# seed-vault-mvp 프로젝트에서
npm install ethers @worldcoin/idkit
```

| 라이브러리 | 역할 |
|-----------|------|
| `ethers` | JavaScript에서 블록체인과 통신 |
| `@worldcoin/idkit` | World ID proof 생성 UI |

### 8.2 IDKit으로 World ID proof 받기

```typescript
// 프론트엔드에서 World ID 인증 + proof 생성
import { IDKitWidget, VerificationLevel } from '@worldcoin/idkit'

function ContributeButton() {
  const handleVerify = async (proof) => {
    // proof 객체에 들어있는 것:
    // - merkle_root: Merkle tree root
    // - nullifier_hash: 익명 사용자 ID
    // - proof: ZK proof 데이터
    // - verification_level: "orb" 또는 "device"

    // 이 proof를 스마트 컨트랙트에 전달!
    await submitToContract(proof)
  }

  return (
    <IDKitWidget
      app_id="app_YOUR_APP_ID"
      action="contribute"
      verification_level={VerificationLevel.Orb}
      onSuccess={handleVerify}
    >
      {({ open }) => (
        <button onClick={open}>
          World ID로 인증하고 기여하기
        </button>
      )}
    </IDKitWidget>
  )
}
```

### 8.3 ethers.js로 컨트랙트 호출

```typescript
import { ethers } from 'ethers'
import SeedVaultABI from './SeedVaultRewards.json'

const CONTRACT_ADDRESS = '0xYOUR_CONTRACT_ADDRESS'

// 1. 지갑 연결
const provider = new ethers.BrowserProvider(window.ethereum)
const signer = await provider.getSigner()

// 2. 컨트랙트 인스턴스 생성
const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  SeedVaultABI.abi,
  signer
)

// 3. 기여 트랜잭션 전송
async function submitContribution(proof, contentHash, vaultId) {
  const tx = await contract.contribute(
    await signer.getAddress(),           // signal (지갑 주소)
    proof.merkle_root,                   // root
    proof.nullifier_hash,               // nullifierHash
    ethers.decodeAbiParameters(          // proof 배열
      ['uint256[8]'],
      proof.proof
    )[0],
    contentHash,                         // 콘텐츠 해시
    vaultId                              // Vault ID
  )

  // 트랜잭션이 블록에 포함될 때까지 대기
  const receipt = await tx.wait()
  console.log('기여 완료! TX:', receipt.hash)
}

// 4. 보상 조회 (무료)
async function checkReward(nullifierHash) {
  const pending = await contract.getPendingReward(nullifierHash)
  console.log('미수령 보상:', ethers.formatEther(pending), 'WLD')
}

// 5. 보상 수령
async function claimReward(nullifierHash) {
  const tx = await contract.claimReward(nullifierHash)
  await tx.wait()
  console.log('보상 수령 완료!')
}
```

### 8.4 이벤트 리스닝 (실시간 알림)

```typescript
// 새 기여가 발생할 때마다 실시간 알림
contract.on('NodeContributed', (nodeId, contributorHash, vaultId, timestamp) => {
  console.log(`새 기여! Vault: ${vaultId}, 시간: ${timestamp}`)
  // UI 업데이트...
})

// 인용이 기록될 때
contract.on('CitationRecorded', (nodeId, weight, rewardAmount) => {
  console.log(`인용! 보상: ${ethers.formatEther(rewardAmount)} WLD`)
})
```

---

## 9. 용어 사전

| 용어 | 설명 | Seed Vault에서의 의미 |
|------|------|---------------------|
| **Smart Contract** | 블록체인에서 자동 실행되는 프로그램 | 보상 분배 규칙을 코드로 |
| **Solidity** | 스마트 컨트랙트 프로그래밍 언어 | 우리가 사용할 언어 |
| **EVM** | 스마트 컨트랙트 실행 엔진 | World Chain이 지원 |
| **ERC-20** | 토큰 표준 규격 | WLD 토큰의 규격 |
| **Gas Fee** | 트랜잭션 수수료 | Orb 인증자는 무료 |
| **L1/L2** | 메인체인/보조체인 | Ethereum/World Chain |
| **ZK Proof** | 영지식 증명 | "인간임을 익명으로 증명" |
| **Nullifier Hash** | 익명 사용자 식별자 | 같은 사람 = 같은 해시 |
| **Merkle Root** | 데이터 검증용 해시 트리의 루트 | World ID 상태 기준점 |
| **ABI** | 컨트랙트 함수 명세서 | 프론트가 컨트랙트 호출 시 사용 |
| **Transaction (TX)** | 블록체인 상태 변경 요청 | 기여, 보상 수령 등 |
| **Receipt** | 트랜잭션 처리 결과 | 기여 성공 확인용 |
| **Foundry** | Solidity 개발 도구 세트 | 빌드, 테스트, 배포 |
| **Anvil** | 로컬 테스트 블록체인 | 개발 중 테스트용 |
| **World ID Router** | World ID 검증 컨트랙트 | 이미 배포되어 있음, 우리가 호출 |
| **WLD** | Worldcoin 토큰 | 기여자 보상으로 지급 |
| **Owner** | 컨트랙트 관리자 | 우리 팀 (인용 기록 권한) |
| **revert** | 트랜잭션 실패/취소 | proof 검증 실패 시 |
| **emit** | 이벤트 발행 | 프론트엔드에 알림 |
| **view** | 읽기 전용 함수 | 가스비 무료 |
| **immutable** | 배포 후 변경 불가 | 신뢰성 보장 |
| **mapping** | key-value 저장소 | 노드 ID → 노드 정보 |

---

## 참고 자료

- [World Chain 개발자 문서](https://docs.world.org/world-chain)
- [World Chain 배포 가이드](https://docs.world.org/world-chain/developers/deploy)
- [World ID 온체인 검증](https://docs.world.org/world-id/id/on-chain)
- [WLD 토큰 컨트랙트 (GitHub)](https://github.com/worldcoin/worldcoin-token)
- [World ID 컨트랙트 (GitHub)](https://github.com/worldcoin/world-id-contracts)
- [World ID State Bridge (GitHub)](https://github.com/worldcoin/world-id-state-bridge)
- [Foundry 공식 문서](https://book.getfoundry.sh/)
- [OpenZeppelin 컨트랙트](https://docs.openzeppelin.com/contracts)
- [World Chain on ChainList](https://chainlist.org/chain/480)
- [WorldScan 블록 탐색기](https://worldscan.org)
