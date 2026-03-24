-- Fix: referrals table missing RLS (security review finding #3)
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own referrals"
  ON public.referrals FOR SELECT
  USING (referrer_id = auth.uid() OR referee_id = auth.uid());

CREATE POLICY "Users can insert own referrals"
  ON public.referrals FOR INSERT
  WITH CHECK (referrer_id = auth.uid());

-- Fix: processed_events table missing RLS (security review finding #4)
-- Only service_role should access this table (Stripe webhook handler)
ALTER TABLE public.processed_events ENABLE ROW LEVEL SECURITY;

-- No user-facing policies — only service_role (admin client) can read/write
-- This prevents authenticated users from pre-poisoning event IDs

-- Fix: one_time_purchases table missing RLS (security review finding #5)
ALTER TABLE public.one_time_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own purchases"
  ON public.one_time_purchases FOR SELECT
  USING (user_id = auth.uid());

-- INSERT/UPDATE only via service_role (Stripe webhook handler)
