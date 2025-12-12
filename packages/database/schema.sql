-- Nano Banana Ecosystem - Production Database Schema
-- Supabase Production Instance Configuration
-- Created: 2025-12-12
-- Security: RLS enabled on all tables

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Custom function to get current user ID safely
CREATE OR REPLACE FUNCTION auth.user_id() RETURNS uuid
LANGUAGE sql STABLE
AS $$
  SELECT COALESCE(auth.uid(), uuid_nil());
$$;

-- User Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text NOT NULL,
    display_name text,
    avatar_url text,
    subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'enterprise')),
    credits_remaining integer DEFAULT 100,
    total_credits_used integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User Subscriptions
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    tier text NOT NULL CHECK (tier IN ('free', 'premium', 'enterprise')),
    status text DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
    stripe_subscription_id text UNIQUE,
    stripe_customer_id text,
    current_period_start timestamp with time zone,
    current_period_end timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, status) -- Only one active subscription per user
);

-- Billing Events for audit trail
CREATE TABLE IF NOT EXISTS public.billing_events (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    type text NOT NULL CHECK (type IN ('credit_purchase', 'subscription_change', 'usage', 'refund')),
    amount decimal(10,2),
    credits_delta integer DEFAULT 0,
    description text NOT NULL,
    stripe_payment_intent_id text,
    metadata jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Gemini Generations (Platform app)
CREATE TABLE IF NOT EXISTS public.gemini_generations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    prompt text NOT NULL,
    image_url text,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
    error_message text,
    generation_time_ms integer,
    model_version text DEFAULT 'gemini-pro-vision',
    credits_used integer DEFAULT 1,
    metadata jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at timestamp with time zone
);

-- Seedream Generations (Seedream app)
CREATE TABLE IF NOT EXISTS public.seedream_generations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    prompt text NOT NULL,
    style_preset text,
    image_url text,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
    error_message text,
    generation_time_ms integer,
    model_version text DEFAULT 'stable-diffusion-xl',
    credits_used integer DEFAULT 2,
    metadata jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at timestamp with time zone
);

-- WAN Video Generations (future expansion)
CREATE TABLE IF NOT EXISTS public.wan_video_generations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    prompt text NOT NULL,
    video_url text,
    thumbnail_url text,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
    error_message text,
    generation_time_ms integer,
    model_version text DEFAULT 'wan-video-v1',
    credits_used integer DEFAULT 10,
    metadata jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at timestamp with time zone
);

-- Performance Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_subscription_tier ON public.user_profiles(subscription_tier);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_credits ON public.user_profiles(credits_remaining) WHERE credits_remaining > 0;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_subscriptions_stripe_id ON public.user_subscriptions(stripe_subscription_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_billing_events_user_id ON public.billing_events(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_billing_events_created_at ON public.billing_events(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_billing_events_type ON public.billing_events(type);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_gemini_generations_user_id ON public.gemini_generations(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_gemini_generations_status ON public.gemini_generations(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_gemini_generations_created_at ON public.gemini_generations(created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_seedream_generations_user_id ON public.seedream_generations(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_seedream_generations_status ON public.seedream_generations(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_seedream_generations_created_at ON public.seedream_generations(created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wan_video_generations_user_id ON public.wan_video_generations(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wan_video_generations_status ON public.wan_video_generations(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wan_video_generations_created_at ON public.wan_video_generations(created_at DESC);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gemini_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seedream_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wan_video_generations ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (id = auth.uid());

-- User Subscriptions Policies
CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Service role can manage subscriptions" ON public.user_subscriptions
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Billing Events Policies (read-only for users)
CREATE POLICY "Users can view own billing events" ON public.billing_events
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Service role can manage billing events" ON public.billing_events
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Generation Tables Policies (users can CRUD their own generations)
CREATE POLICY "Users can manage own gemini generations" ON public.gemini_generations
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage own seedream generations" ON public.seedream_generations
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage own video generations" ON public.wan_video_generations
    FOR ALL USING (user_id = auth.uid());

-- Functions for automated tasks

-- Function to update user credits
CREATE OR REPLACE FUNCTION public.update_user_credits(
    p_user_id uuid,
    p_credits_delta integer,
    p_description text DEFAULT 'Credits update'
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_credits integer;
BEGIN
    -- Get current credits
    SELECT credits_remaining INTO current_credits
    FROM public.user_profiles
    WHERE id = p_user_id;
    
    -- Check if user exists
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Check if enough credits for deduction
    IF p_credits_delta < 0 AND current_credits < ABS(p_credits_delta) THEN
        RETURN false;
    END IF;
    
    -- Update credits
    UPDATE public.user_profiles
    SET 
        credits_remaining = credits_remaining + p_credits_delta,
        total_credits_used = CASE 
            WHEN p_credits_delta < 0 THEN total_credits_used + ABS(p_credits_delta)
            ELSE total_credits_used
        END,
        updated_at = timezone('utc'::text, now())
    WHERE id = p_user_id;
    
    -- Log billing event
    INSERT INTO public.billing_events (user_id, type, credits_delta, description)
    VALUES (
        p_user_id,
        CASE WHEN p_credits_delta > 0 THEN 'credit_purchase' ELSE 'usage' END,
        p_credits_delta,
        p_description
    );
    
    RETURN true;
END;
$$;

-- Function to handle user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, display_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email)
    );
    
    -- Create initial free subscription
    INSERT INTO public.user_subscriptions (user_id, tier, status)
    VALUES (NEW.id, 'free', 'active');
    
    -- Log initial billing event
    INSERT INTO public.billing_events (user_id, type, credits_delta, description)
    VALUES (NEW.id, 'credit_purchase', 100, 'Welcome bonus credits');
    
    RETURN NEW;
END;
$$;

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated timestamp triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Grant appropriate permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Service role permissions (for server-side operations)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;