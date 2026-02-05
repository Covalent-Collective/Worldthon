export interface KnowledgeNode {
  id: string
  label: string
  content: string
  contributor: string  // nullifier_hash (anonymous)
  createdAt: string
  citationCount: number
}

export interface KnowledgeEdge {
  source: string
  target: string
  relationship: string
}

export interface ExpertBot {
  id: string
  name: string
  description: string
  icon: string
  category: string
  nodeCount: number
  contributorCount: number
  graph: {
    nodes: KnowledgeNode[]
    edges: KnowledgeEdge[]
  }
}

export interface ContributionReceipt {
  nodeId: string
  contributor: string
  percentage: number
}

/**
 * Detailed contribution information with relevance scoring
 * Used for proportional reward distribution based on actual relevance
 */
export interface DetailedContribution {
  nodeId: string
  nodeLabel: string
  contributor: string
  percentage: number
  relevanceScore: number
  matchedTerms: string[]
  estimatedWLD: number
}

/**
 * Node detail information for answer generation
 * Contains relevance scoring and matched terms for each node
 */
export interface NodeDetail {
  nodeId: string
  label: string
  relevanceScore: number
  matchedTerms: string[]
}

/**
 * Extended answer result with detailed node information
 * Supports relevance-based proportional contribution calculation
 */
export interface AnswerResult {
  answer: string
  usedNodes: string[]
  confidence: number
  matchedTerms: string[]
  nodeDetails: NodeDetail[]
}

export interface UserRewards {
  contributionPower: number
  totalCitations: number
  pendingWLD: number
  contributions: {
    botId: string
    nodeId: string
    createdAt: string
  }[]
}
