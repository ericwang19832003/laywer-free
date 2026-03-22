-- One-time purchases table for per-case Essentials access ($149)
CREATE TABLE IF NOT EXISTS public.one_time_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  stripe_payment_id text NOT NULL,
  amount_cents integer NOT NULL DEFAULT 14900,
  purchased_at timestamptz DEFAULT now(),
  UNIQUE(user_id, case_id)
);

-- No RLS needed — accessed via admin client from webhook only
-- But add index for lookups
CREATE INDEX IF NOT EXISTS idx_one_time_purchases_user_case
  ON public.one_time_purchases (user_id, case_id);

-- AI usage table (may already exist — use IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS public.ai_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month text NOT NULL,  -- e.g. '2026-03'
  generation_count integer NOT NULL DEFAULT 0,
  UNIQUE(user_id, month)
);

ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own AI usage"
  ON public.ai_usage FOR SELECT
  USING (user_id = auth.uid());

-- Increment AI usage RPC (may already exist)
CREATE OR REPLACE FUNCTION public.increment_ai_usage(p_month text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.ai_usage (user_id, month, generation_count)
  VALUES (auth.uid(), p_month, 1)
  ON CONFLICT (user_id, month)
  DO UPDATE SET generation_count = ai_usage.generation_count + 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_ai_usage TO authenticated;

-- User subscriptions table (may already exist — use IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier text NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'essentials', 'pro')),
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subscription"
  ON public.user_subscriptions FOR SELECT
  USING (user_id = auth.uid());

-- Referrals table (for future Sprint 4)
CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referee_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  referral_code text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'signed_up', 'converted', 'credited')),
  bonus_ai_generations integer DEFAULT 5,  -- extra AI gens for referee
  credit_amount_cents integer DEFAULT 1000,  -- $10 credit for referrer
  credited_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals (referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals (referrer_id);

-- Update existing tier values if they use old names
UPDATE public.user_subscriptions SET tier = 'essentials' WHERE tier = 'pro';
UPDATE public.user_subscriptions SET tier = 'pro' WHERE tier = 'premium';
