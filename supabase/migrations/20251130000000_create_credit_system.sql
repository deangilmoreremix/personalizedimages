-- Credit system tables for usage-based pricing
-- Migration: 20251130000000_create_credit_system.sql

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User credits table
CREATE TABLE user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  total_purchased INTEGER NOT NULL DEFAULT 0,
  total_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one record per user
  UNIQUE(user_id)
);

-- Credit transactions (purchases and usage)
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'refund', 'bonus')),
  amount INTEGER NOT NULL, -- positive for credits added, negative for used
  balance_after INTEGER NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pricing configuration
CREATE TABLE pricing_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  provider TEXT NOT NULL, -- 'openai', 'gemini', 'stability', etc.
  operation TEXT NOT NULL, -- 'image_generation', 'image_edit', 'video_generation', etc.
  credits_per_unit INTEGER NOT NULL,
  unit_name TEXT NOT NULL DEFAULT 'request', -- 'request', 'second', 'token', etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage tracking
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  operation TEXT NOT NULL,
  credits_used INTEGER NOT NULL,
  request_metadata JSONB DEFAULT '{}',
  response_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credit packages for purchase
CREATE TABLE credit_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  credits_amount INTEGER NOT NULL,
  price_cents INTEGER NOT NULL, -- in cents (e.g., 499 for $4.99)
  currency TEXT NOT NULL DEFAULT 'usd',
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
CREATE INDEX idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX idx_usage_logs_created_at ON usage_logs(created_at DESC);
CREATE INDEX idx_usage_logs_provider ON usage_logs(provider);
CREATE INDEX idx_usage_logs_operation ON usage_logs(operation);
CREATE INDEX idx_pricing_tiers_provider_operation ON pricing_tiers(provider, operation);
CREATE INDEX idx_credit_packages_active ON credit_packages(is_active, sort_order);

-- Row Level Security (RLS) policies
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_packages ENABLE ROW LEVEL SECURITY;

-- User credits policies
CREATE POLICY "Users can view their own credits" ON user_credits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits" ON user_credits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credits" ON user_credits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Credit transactions policies
CREATE POLICY "Users can view their own transactions" ON credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert transactions" ON credit_transactions
  FOR INSERT WITH CHECK (true);

-- Usage logs policies
CREATE POLICY "Users can view their own usage" ON usage_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage logs" ON usage_logs
  FOR INSERT WITH CHECK (true);

-- Pricing tiers policies (public read)
CREATE POLICY "Anyone can view active pricing" ON pricing_tiers
  FOR SELECT USING (is_active = true);

-- Credit packages policies (public read)
CREATE POLICY "Anyone can view active packages" ON credit_packages
  FOR SELECT USING (is_active = true);

-- Insert default pricing tiers
INSERT INTO pricing_tiers (name, provider, operation, credits_per_unit, unit_name) VALUES
('OpenAI DALL-E 3', 'openai', 'image_generation', 10, 'request'),
('OpenAI DALL-E 2', 'openai', 'image_generation', 5, 'request'),
('Gemini Pro Vision', 'gemini', 'image_generation', 8, 'request'),
('Stable Diffusion', 'stability', 'image_generation', 3, 'request'),
('Image Editing', 'openai', 'image_edit', 15, 'request'),
('Video Generation', 'runway', 'video_generation', 50, 'request'),
('Meme Generation', 'openai', 'meme_generation', 5, 'request'),
('Ghibli Style', 'openai', 'ghibli_generation', 8, 'request'),
('Cartoon Style', 'gemini', 'cartoon_generation', 6, 'request');

-- Insert credit packages
INSERT INTO credit_packages (name, description, credits_amount, price_cents, is_popular, sort_order) VALUES
('Starter Pack', 'Perfect for trying out AI image generation', 50, 499, false, 1),
('Popular Pack', 'Most popular choice for regular users', 200, 1799, true, 2),
('Pro Pack', 'For power users and small teams', 500, 3999, false, 3),
('Enterprise Pack', 'Bulk credits for heavy usage', 2000, 13999, false, 4);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for user_credits
CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON user_credits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();