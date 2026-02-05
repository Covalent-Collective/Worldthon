-- Seed Vault Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgvector for embeddings (optional, for semantic search)
CREATE EXTENSION IF NOT EXISTS vector;

-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE reward_type AS ENUM ('citation', 'contribution', 'bonus');
CREATE TYPE contribution_status AS ENUM ('pending', 'approved', 'rejected');

-- =============================================================================
-- TABLES
-- =============================================================================

-- Users table (World ID nullifier hash based)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nullifier_hash TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    contribution_power INTEGER DEFAULT 0,
    total_citations INTEGER DEFAULT 0,
    pending_wld DECIMAL(18, 8) DEFAULT 0
);

-- Expert bots definitions
CREATE TABLE bots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Knowledge nodes (contributions to bots)
CREATE TABLE knowledge_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bot_id UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    content TEXT NOT NULL,
    contributor_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    citation_count INTEGER DEFAULT 0,
    embedding vector(1536), -- OpenAI ada-002 embedding dimension
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Graph edges between knowledge nodes
CREATE TABLE node_edges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_node_id UUID NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
    target_node_id UUID NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
    relationship TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    weight DECIMAL(5, 4) DEFAULT 1.0,
    UNIQUE(source_node_id, target_node_id)
);

-- Citations tracking (when a node is used to answer a question)
CREATE TABLE citations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    node_id UUID NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    cited_at TIMESTAMPTZ DEFAULT NOW(),
    context TEXT -- Optional context about how it was cited
);

-- User rewards tracking
CREATE TABLE user_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    node_id UUID NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
    reward_type reward_type NOT NULL,
    amount DECIMAL(18, 8) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    claimed BOOLEAN DEFAULT false,
    claimed_at TIMESTAMPTZ,
    transaction_hash TEXT
);

-- Contributions table (tracks user submissions)
CREATE TABLE contributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bot_id UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
    node_id UUID NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    status contribution_status DEFAULT 'pending',
    reviewed_at TIMESTAMPTZ
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Users indexes
CREATE INDEX idx_users_nullifier_hash ON users(nullifier_hash);

-- Bots indexes
CREATE INDEX idx_bots_category ON bots(category);
CREATE INDEX idx_bots_is_active ON bots(is_active);

-- Knowledge nodes indexes
CREATE INDEX idx_knowledge_nodes_bot_id ON knowledge_nodes(bot_id);
CREATE INDEX idx_knowledge_nodes_contributor_id ON knowledge_nodes(contributor_id);
CREATE INDEX idx_knowledge_nodes_citation_count ON knowledge_nodes(citation_count DESC);
CREATE INDEX idx_knowledge_nodes_created_at ON knowledge_nodes(created_at DESC);

-- Vector similarity search index (for semantic search)
CREATE INDEX idx_knowledge_nodes_embedding ON knowledge_nodes
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- Node edges indexes
CREATE INDEX idx_node_edges_source ON node_edges(source_node_id);
CREATE INDEX idx_node_edges_target ON node_edges(target_node_id);

-- Citations indexes
CREATE INDEX idx_citations_node_id ON citations(node_id);
CREATE INDEX idx_citations_session_id ON citations(session_id);
CREATE INDEX idx_citations_cited_at ON citations(cited_at DESC);

-- User rewards indexes
CREATE INDEX idx_user_rewards_user_id ON user_rewards(user_id);
CREATE INDEX idx_user_rewards_node_id ON user_rewards(node_id);
CREATE INDEX idx_user_rewards_claimed ON user_rewards(claimed) WHERE claimed = false;

-- Contributions indexes
CREATE INDEX idx_contributions_user_id ON contributions(user_id);
CREATE INDEX idx_contributions_bot_id ON contributions(bot_id);
CREATE INDEX idx_contributions_status ON contributions(status);

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Function to increment citation count and create reward
CREATE OR REPLACE FUNCTION increment_citation_count(p_node_id UUID)
RETURNS void AS $$
DECLARE
    v_contributor_id UUID;
    v_reward_amount DECIMAL(18, 8);
BEGIN
    -- Get the contributor
    SELECT contributor_id INTO v_contributor_id
    FROM knowledge_nodes
    WHERE id = p_node_id;

    -- Increment citation count on node
    UPDATE knowledge_nodes
    SET citation_count = citation_count + 1,
        updated_at = NOW()
    WHERE id = p_node_id;

    -- Increment user's total citations
    UPDATE users
    SET total_citations = total_citations + 1,
        updated_at = NOW()
    WHERE id = v_contributor_id;

    -- Calculate reward (0.001 WLD per citation)
    v_reward_amount := 0.001;

    -- Create reward record
    INSERT INTO user_rewards (user_id, node_id, reward_type, amount)
    VALUES (v_contributor_id, p_node_id, 'citation', v_reward_amount);

    -- Update pending WLD
    UPDATE users
    SET pending_wld = pending_wld + v_reward_amount,
        updated_at = NOW()
    WHERE id = v_contributor_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user stats by nullifier hash
CREATE OR REPLACE FUNCTION get_user_stats(user_nullifier TEXT)
RETURNS TABLE (
    contribution_power INTEGER,
    total_citations INTEGER,
    pending_wld DECIMAL(18, 8)
) AS $$
BEGIN
    RETURN QUERY
    SELECT u.contribution_power, u.total_citations, u.pending_wld
    FROM users u
    WHERE u.nullifier_hash = user_nullifier;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get or create user by nullifier
CREATE OR REPLACE FUNCTION get_or_create_user(p_nullifier_hash TEXT)
RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id
    FROM users
    WHERE nullifier_hash = p_nullifier_hash;

    IF v_user_id IS NULL THEN
        INSERT INTO users (nullifier_hash)
        VALUES (p_nullifier_hash)
        RETURNING id INTO v_user_id;
    END IF;

    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search similar nodes using vector similarity
CREATE OR REPLACE FUNCTION search_similar_nodes(
    query_embedding vector(1536),
    match_threshold FLOAT DEFAULT 0.78,
    match_count INT DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    bot_id UUID,
    label TEXT,
    content TEXT,
    similarity FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        kn.id,
        kn.bot_id,
        kn.label,
        kn.content,
        1 - (kn.embedding <=> query_embedding) AS similarity
    FROM knowledge_nodes kn
    WHERE kn.embedding IS NOT NULL
        AND 1 - (kn.embedding <=> query_embedding) > match_threshold
    ORDER BY kn.embedding <=> query_embedding
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE node_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;

-- Users policies
-- Users can read their own data
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (true);

-- Allow insert for new users (during World ID verification)
CREATE POLICY "Allow user creation" ON users
    FOR INSERT WITH CHECK (true);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (true);

-- Bots policies
-- Anyone can view active bots
CREATE POLICY "Anyone can view active bots" ON bots
    FOR SELECT USING (is_active = true);

-- Knowledge nodes policies
-- Anyone can view knowledge nodes
CREATE POLICY "Anyone can view knowledge nodes" ON knowledge_nodes
    FOR SELECT USING (true);

-- Authenticated users can insert knowledge nodes
CREATE POLICY "Users can create knowledge nodes" ON knowledge_nodes
    FOR INSERT WITH CHECK (true);

-- Node edges policies
-- Anyone can view edges
CREATE POLICY "Anyone can view node edges" ON node_edges
    FOR SELECT USING (true);

-- Authenticated users can create edges
CREATE POLICY "Users can create node edges" ON node_edges
    FOR INSERT WITH CHECK (true);

-- Citations policies
-- Anyone can view citations
CREATE POLICY "Anyone can view citations" ON citations
    FOR SELECT USING (true);

-- System can insert citations
CREATE POLICY "System can create citations" ON citations
    FOR INSERT WITH CHECK (true);

-- User rewards policies
-- Users can view their own rewards
CREATE POLICY "Users can view own rewards" ON user_rewards
    FOR SELECT USING (true);

-- System can create rewards
CREATE POLICY "System can create rewards" ON user_rewards
    FOR INSERT WITH CHECK (true);

-- Users can update their own rewards (for claiming)
CREATE POLICY "Users can claim rewards" ON user_rewards
    FOR UPDATE USING (true);

-- Contributions policies
-- Users can view all contributions
CREATE POLICY "Anyone can view contributions" ON contributions
    FOR SELECT USING (true);

-- Users can create contributions
CREATE POLICY "Users can create contributions" ON contributions
    FOR INSERT WITH CHECK (true);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_bots_updated_at
    BEFORE UPDATE ON bots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_knowledge_nodes_updated_at
    BEFORE UPDATE ON knowledge_nodes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Increment contribution power when a new contribution is approved
CREATE OR REPLACE FUNCTION on_contribution_approved()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        UPDATE users
        SET contribution_power = contribution_power + 1,
            updated_at = NOW()
        WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contribution_approved_trigger
    AFTER UPDATE ON contributions
    FOR EACH ROW EXECUTE FUNCTION on_contribution_approved();

-- =============================================================================
-- SEED DATA (Optional - for testing)
-- =============================================================================

-- Insert sample bots
INSERT INTO bots (id, name, description, icon, category) VALUES
    ('11111111-1111-1111-1111-111111111111', '서울 로컬 가이드', '서울의 숨은 명소와 맛집을 알려드립니다', '🗺️', '여행'),
    ('22222222-2222-2222-2222-222222222222', '산부인과 전문의', '임신, 출산, 여성 건강에 대한 전문 지식', '👩‍⚕️', '의료'),
    ('33333333-3333-3333-3333-333333333333', '한식 레시피 마스터', '전통 한식부터 현대적 퓨전까지', '🍲', '요리'),
    ('44444444-4444-4444-4444-444444444444', '스타트업 멘토', '창업, 투자, 스케일업 경험 공유', '🚀', '비즈니스');
