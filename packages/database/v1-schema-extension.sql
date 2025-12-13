-- V1 Schema Extension - Phase 1 Subscription Fields
-- Execute this in Supabase SQL Editor to extend V1 users table
-- Date: 2025-12-12
-- Purpose: Add minimal subscription functionality to existing V1 schema

-- Add subscription fields to existing users table
-- These fields enable Phase 1 subscription system while preserving V1 structure

-- 1. Add subscription level (free/premium/enterprise)
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_level text DEFAULT 'free';

-- 2. Add subscription expiration timestamp
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_expires_at timestamp;

-- 3. Add credits remaining for usage tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS credits_remaining integer DEFAULT 100;

-- 4. Create index for subscription queries (performance optimization)
CREATE INDEX IF NOT EXISTS idx_users_subscription_level ON users(subscription_level);
CREATE INDEX IF NOT EXISTS idx_users_credits ON users(credits_remaining) WHERE credits_remaining > 0;

-- 5. Verify the extension worked
SELECT 
  id, 
  username, 
  subscription_level, 
  subscription_expires_at,
  credits_remaining,
  created_at
FROM users 
LIMIT 3;

-- 6. Update existing users with default subscription data
UPDATE users 
SET 
  subscription_level = 'free',
  credits_remaining = 100
WHERE subscription_level IS NULL 
   OR credits_remaining IS NULL;

-- Success message
SELECT 'V1 schema extension completed successfully!' as status;