-- =====================================================
-- Add wallet fields to users table and tx_hash to contributions
-- Supports on-chain wallet linking and transaction tracking
-- =====================================================

-- 1. Add wallet_address to users (nullable, for linked World App wallet)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'wallet_address'
  ) THEN
    ALTER TABLE users ADD COLUMN wallet_address TEXT;
  END IF;
END $$;

-- 2. Add wallet_linked_at to users (nullable, timestamp of wallet linking)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'wallet_linked_at'
  ) THEN
    ALTER TABLE users ADD COLUMN wallet_linked_at TIMESTAMPTZ;
  END IF;
END $$;

-- 3. Add tx_hash to contributions (nullable, on-chain transaction hash)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contributions' AND column_name = 'tx_hash'
  ) THEN
    ALTER TABLE contributions ADD COLUMN tx_hash TEXT;
  END IF;
END $$;

-- 4. Index on wallet_address for lookups by wallet
CREATE INDEX IF NOT EXISTS idx_users_wallet_address
  ON users (wallet_address)
  WHERE wallet_address IS NOT NULL;

-- 5. Index on tx_hash for lookups by transaction hash
CREATE INDEX IF NOT EXISTS idx_contributions_tx_hash
  ON contributions (tx_hash)
  WHERE tx_hash IS NOT NULL;
