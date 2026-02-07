export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          nullifier_hash: string
          created_at: string
          updated_at: string
          contribution_power: number
          total_citations: number
          pending_wld: number
          wallet_address: string | null
          wallet_linked_at: string | null
        }
        Insert: {
          id?: string
          nullifier_hash: string
          created_at?: string
          updated_at?: string
          contribution_power?: number
          total_citations?: number
          pending_wld?: number
          wallet_address?: string | null
          wallet_linked_at?: string | null
        }
        Update: {
          id?: string
          nullifier_hash?: string
          created_at?: string
          updated_at?: string
          contribution_power?: number
          total_citations?: number
          pending_wld?: number
          wallet_address?: string | null
          wallet_linked_at?: string | null
        }
        Relationships: []
      }
      bots: {
        Row: {
          id: string
          name: string
          description: string
          icon: string
          category: string
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          description: string
          icon: string
          category: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          description?: string
          icon?: string
          category?: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Relationships: []
      }
      knowledge_nodes: {
        Row: {
          id: string
          bot_id: string
          label: string
          content: string
          contributor_id: string
          created_at: string
          updated_at: string
          citation_count: number
          embedding: number[] | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          bot_id: string
          label: string
          content: string
          contributor_id: string
          created_at?: string
          updated_at?: string
          citation_count?: number
          embedding?: number[] | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          bot_id?: string
          label?: string
          content?: string
          contributor_id?: string
          created_at?: string
          updated_at?: string
          citation_count?: number
          embedding?: number[] | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: 'knowledge_nodes_bot_id_fkey'
            columns: ['bot_id']
            referencedRelation: 'bots'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'knowledge_nodes_contributor_id_fkey'
            columns: ['contributor_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      node_edges: {
        Row: {
          id: string
          source_node_id: string
          target_node_id: string
          relationship: string
          created_at: string
          weight: number
        }
        Insert: {
          id?: string
          source_node_id: string
          target_node_id: string
          relationship: string
          created_at?: string
          weight?: number
        }
        Update: {
          id?: string
          source_node_id?: string
          target_node_id?: string
          relationship?: string
          created_at?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: 'node_edges_source_node_id_fkey'
            columns: ['source_node_id']
            referencedRelation: 'knowledge_nodes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'node_edges_target_node_id_fkey'
            columns: ['target_node_id']
            referencedRelation: 'knowledge_nodes'
            referencedColumns: ['id']
          }
        ]
      }
      citations: {
        Row: {
          id: string
          node_id: string
          session_id: string
          cited_at: string
          context: string | null
        }
        Insert: {
          id?: string
          node_id: string
          session_id: string
          cited_at?: string
          context?: string | null
        }
        Update: {
          id?: string
          node_id?: string
          session_id?: string
          cited_at?: string
          context?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'citations_node_id_fkey'
            columns: ['node_id']
            referencedRelation: 'knowledge_nodes'
            referencedColumns: ['id']
          }
        ]
      }
      user_rewards: {
        Row: {
          id: string
          user_id: string
          node_id: string
          reward_type: 'citation' | 'contribution' | 'bonus'
          amount: number
          created_at: string
          claimed: boolean
          claimed_at: string | null
          transaction_hash: string | null
        }
        Insert: {
          id?: string
          user_id: string
          node_id: string
          reward_type: 'citation' | 'contribution' | 'bonus'
          amount: number
          created_at?: string
          claimed?: boolean
          claimed_at?: string | null
          transaction_hash?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          node_id?: string
          reward_type?: 'citation' | 'contribution' | 'bonus'
          amount?: number
          created_at?: string
          claimed?: boolean
          claimed_at?: string | null
          transaction_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'user_rewards_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'user_rewards_node_id_fkey'
            columns: ['node_id']
            referencedRelation: 'knowledge_nodes'
            referencedColumns: ['id']
          }
        ]
      }
      contributions: {
        Row: {
          id: string
          user_id: string
          bot_id: string
          node_id: string
          created_at: string
          status: 'pending' | 'approved' | 'rejected'
          reviewed_at: string | null
          tx_hash: string | null
        }
        Insert: {
          id?: string
          user_id: string
          bot_id: string
          node_id: string
          created_at?: string
          status?: 'pending' | 'approved' | 'rejected'
          reviewed_at?: string | null
          tx_hash?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          bot_id?: string
          node_id?: string
          created_at?: string
          status?: 'pending' | 'approved' | 'rejected'
          reviewed_at?: string | null
          tx_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'contributions_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'contributions_bot_id_fkey'
            columns: ['bot_id']
            referencedRelation: 'bots'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'contributions_node_id_fkey'
            columns: ['node_id']
            referencedRelation: 'knowledge_nodes'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_citation_count: {
        Args: {
          node_id: string
        }
        Returns: void
      }
      increment_contributor_rewards: {
        Args: {
          p_contributor_id: string
          p_citation_count: number
        }
        Returns: void
      }
      claim_pending_wld: {
        Args: {
          p_user_id: string
        }
        Returns: number
      }
      get_user_stats: {
        Args: {
          user_nullifier: string
        }
        Returns: {
          contribution_power: number
          total_citations: number
          pending_wld: number
        }
      }
    }
    Enums: {
      reward_type: 'citation' | 'contribution' | 'bonus'
      contribution_status: 'pending' | 'approved' | 'rejected'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience types for use in components
export type User = Database['public']['Tables']['users']['Row']
export type Bot = Database['public']['Tables']['bots']['Row']
export type KnowledgeNode = Database['public']['Tables']['knowledge_nodes']['Row']
export type NodeEdge = Database['public']['Tables']['node_edges']['Row']
export type Citation = Database['public']['Tables']['citations']['Row']
export type UserReward = Database['public']['Tables']['user_rewards']['Row']
export type Contribution = Database['public']['Tables']['contributions']['Row']

// Insert types
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type BotInsert = Database['public']['Tables']['bots']['Insert']
export type KnowledgeNodeInsert = Database['public']['Tables']['knowledge_nodes']['Insert']
export type NodeEdgeInsert = Database['public']['Tables']['node_edges']['Insert']
export type CitationInsert = Database['public']['Tables']['citations']['Insert']
export type UserRewardInsert = Database['public']['Tables']['user_rewards']['Insert']
export type ContributionInsert = Database['public']['Tables']['contributions']['Insert']

// Update types
export type UserUpdate = Database['public']['Tables']['users']['Update']
export type BotUpdate = Database['public']['Tables']['bots']['Update']
export type KnowledgeNodeUpdate = Database['public']['Tables']['knowledge_nodes']['Update']
export type NodeEdgeUpdate = Database['public']['Tables']['node_edges']['Update']
export type CitationUpdate = Database['public']['Tables']['citations']['Update']
export type UserRewardUpdate = Database['public']['Tables']['user_rewards']['Update']
export type ContributionUpdate = Database['public']['Tables']['contributions']['Update']
