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
