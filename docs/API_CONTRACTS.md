# Seed Vault - API Contracts

## Overview

MVP는 Mock 데이터를 사용하지만, 이 문서는 프로덕션 백엔드 구현을 위한 API 계약을 정의합니다.

---

## Base URL

| Environment | URL |
|-------------|-----|
| Local Mock | `http://localhost:3000/api` |
| Staging | `https://api.staging.seedvault.io/v1` |
| Production | `https://api.seedvault.io/v1` |

---

## Authentication

### Headers
```
Authorization: Bearer <jwt_token>
X-Nullifier-Hash: <nullifier_hash>
```

---

## Endpoints

### POST /api/verify

World ID proof 서버사이드 검증

**Request:**
```json
{
  "proof": {
    "merkle_root": "0x1234...",
    "nullifier_hash": "0x5678...",
    "proof": "0xabcd...",
    "verification_level": "orb"
  },
  "action": "contribute",
  "signal": "optional_message_hash"
}
```

**Response (200):**
```json
{
  "success": true,
  "nullifier_hash": "0x5678...",
  "jwt": "eyJ...",
  "expires_at": "2026-02-05T12:00:00Z"
}
```

**Response (400):**
```json
{
  "success": false,
  "error": {
    "code": "invalid_proof",
    "message": "Proof verification failed"
  }
}
```

---

### GET /api/bots

전문가 봇 목록 조회

**Response:**
```json
{
  "bots": [
    {
      "id": "seoul-local-guide",
      "name": "서울 로컬 가이드",
      "description": "서울의 숨은 명소와 맛집",
      "icon": "🗺️",
      "category": "local",
      "stats": {
        "node_count": 24,
        "contributor_count": 12,
        "query_count": 1523
      }
    }
  ]
}
```

---

### GET /api/bots/:botId/graph

봇의 지식 그래프 조회

**Response:**
```json
{
  "bot_id": "seoul-local-guide",
  "graph": {
    "nodes": [
      {
        "id": "node_001",
        "label": "을지로 골목 맛집",
        "content": "...",
        "contributor_hash": "0x1234...",
        "created_at": "2026-01-15T10:00:00Z",
        "citation_count": 45
      }
    ],
    "edges": [
      {
        "source": "node_001",
        "target": "node_002",
        "relationship": "related_location"
      }
    ]
  }
}
```

---

### POST /api/bots/:botId/contribute

지식 노드 추가 (인증 필요)

**Request:**
```json
{
  "label": "망리단길 카페 추천",
  "content": "망원역 2번 출구에서...",
  "keywords": ["카페", "망원동"]
}
```

**Response (201):**
```json
{
  "success": true,
  "node": {
    "id": "node_025",
    "label": "망리단길 카페 추천",
    "contributor_hash": "0x5678...",
    "created_at": "2026-02-05T11:30:00Z"
  }
}
```

---

### POST /api/bots/:botId/query

지식 그래프 질의

**Request:**
```json
{
  "question": "숨은 맛집 추천해줘",
  "max_nodes": 5
}
```

**Response:**
```json
{
  "answer": "을지로 3가역 근처...",
  "sources": [
    {
      "node_id": "node_001",
      "contribution_ratio": 0.6,
      "contributor_hash": "0x1234..."
    },
    {
      "node_id": "node_003",
      "contribution_ratio": 0.4,
      "contributor_hash": "0x5678..."
    }
  ],
  "query_id": "q_abc123"
}
```

---

### GET /api/rewards

사용자 보상 현황 조회 (인증 필요)

**Response:**
```json
{
  "nullifier_hash": "0x5678...",
  "contribution_power": 15,
  "total_citations": 23,
  "pending_wld": "0.0230",
  "contributions": [
    {
      "node_id": "node_025",
      "bot_id": "seoul-local-guide",
      "label": "망리단길 카페 추천",
      "created_at": "2026-02-05T11:30:00Z",
      "citation_count": 0,
      "earned_wld": "0.0000"
    }
  ]
}
```

---

### POST /api/rewards/claim

보상 수령 요청 (인증 필요)

**Request:**
```json
{
  "amount": "0.0230"
}
```

**Response:**
```json
{
  "success": true,
  "transaction_hash": "0x...",
  "amount_claimed": "0.0230",
  "new_balance": "0.0000"
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `invalid_proof` | 400 | World ID proof 검증 실패 |
| `duplicate_action` | 409 | 중복 액션 (일회성 액션) |
| `rate_limited` | 429 | 요청 제한 초과 |
| `unauthorized` | 401 | 인증 필요/실패 |
| `not_found` | 404 | 리소스 없음 |
| `validation_error` | 422 | 입력 검증 실패 |
| `internal_error` | 500 | 서버 에러 |

---

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/verify` | 5회 | 1분 |
| `/api/bots/:id/contribute` | 10회 | 1시간 |
| `/api/bots/:id/query` | 30회 | 1분 |
| `/api/rewards/claim` | 3회 | 1시간 |

---

## Webhook Events (Future)

```json
{
  "event": "node.cited",
  "data": {
    "node_id": "node_001",
    "contributor_hash": "0x1234...",
    "query_id": "q_xyz789",
    "earned_wld": "0.0001"
  },
  "timestamp": "2026-02-05T12:00:00Z"
}
```
