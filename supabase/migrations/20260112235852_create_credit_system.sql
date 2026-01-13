/*
  # Credit System for Usage-Based Pricing

  1. New Tables
    - `user_credits` - User credit balances
    - `credit_transactions` - Purchase and usage transactions
    - `pricing_tiers` - Pricing configuration per provider/operation
    - `usage_logs` - Detailed usage tracking
    - `credit_packages` - Purchasable credit packages

  2. Security
    - Users can only view/modify their own credit data
    - Pricing and packages are publicly readable
*/

-- User Credits
CREATE TABLE IF NOT EXISTS user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  total_purchased INTEGER NOT NULL DEFAULT 0,
  total_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Credit Transactions
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'refund', 'bonus')),
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pricing Tiers
CREATE TABLE IF NOT EXISTS pricing_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  provider TEXT NOT NULL,
  operation TEXT NOT NULL,
  credits_per_unit INTEGER NOT NULL,
  unit_name TEXT NOT NULL DEFAULT 'request',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage Logs
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  operation TEXT NOT NULL,
  credits_used INTEGER NOT NULL,
  request_metadata JSONB DEFAULT '{}',
  response_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credit Packages
CREATE TABLE IF NOT EXISTS credit_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  credits_amount INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created ON credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created ON usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_logs_provider ON usage_logs(provider);
CREATE INDEX IF NOT EXISTS idx_pricing_tiers_provider ON pricing_tiers(provider, operation);
CREATE INDEX IF NOT EXISTS idx_credit_packages_active ON credit_packages(is_active, sort_order);

-- Enable RLS
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_packages ENABLE ROW LEVEL SECURITY;

-- User Credits Policies
CREATE POLICY "Users can view their own credits"
  ON user_credits FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits"
  ON user_credits FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credits"
  ON user_credits FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Credit Transactions Policies
CREATE POLICY "Users can view their own transactions"
  ON credit_transactions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their transactions"
  ON credit_transactions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Usage Logs Policies
CREATE POLICY "Users can view their own usage"
  ON usage_logs FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can log their usage"
  ON usage_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Pricing Tiers (public read)
CREATE POLICY "Anyone can view active pricing"
  ON pricing_tiers FOR SELECT
  USING (is_active = true);

-- Credit Packages (public read)
CREATE POLICY "Anyone can view active packages"
  ON credit_packages FOR SELECT
  USING (is_active = true);

-- Insert default pricing tiers
INSERT INTO pricing_tiers (name, provider, operation, credits_per_unit, unit_name) VALUES
('OpenAI DALL-E 3', 'openai', 'image_generation', 10, 'request'),
('OpenAI DALL-E 2', 'openai', 'image_generation_basic', 5, 'request'),
('Gemini Pro Vision', 'gemini', 'image_generation', 8, 'request'),
('Stable Diffusion', 'stability', 'image_generation', 3, 'request'),
('Image Editing', 'openai', 'image_edit', 15, 'request'),
('Video Generation', 'runway', 'video_generation', 50, 'request'),
('Meme Generation', 'openai', 'meme_generation', 5, 'request'),
('Ghibli Style', 'openai', 'ghibli_generation', 8, 'request'),
('Cartoon Style', 'gemini', 'cartoon_generation', 6, 'request')
ON CONFLICT (name) DO NOTHING;

-- Insert credit packages
INSERT INTO credit_packages (name, description, credits_amount, price_cents, is_popular, sort_order) VALUES
('Starter Pack', 'Perfect for trying out AI image generation', 50, 499, false, 1),
('Popular Pack', 'Most popular choice for regular users', 200, 1799, true, 2),
('Pro Pack', 'For power users and small teams', 500, 3999, false, 3),
('Enterprise Pack', 'Bulk credits for heavy usage', 2000, 13999, false, 4)
ON CONFLICT DO NOTHING;