-- ============================================
-- Phase 1 Foundation: Confidence Scores, Analytics, Subscriptions
-- ============================================

-- ── Confidence Scores ─────────────────────────────────────────────

CREATE TABLE public.case_confidence_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  score int NOT NULL CHECK (score >= 0 AND score <= 100),
  breakdown jsonb NOT NULL DEFAULT '{}'::jsonb,
  computed_at timestamptz DEFAULT now()
);

CREATE INDEX idx_case_confidence_case_computed
  ON public.case_confidence_scores (case_id, computed_at DESC);

ALTER TABLE public.case_confidence_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own confidence scores"
  ON public.case_confidence_scores FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = case_confidence_scores.case_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own confidence scores"
  ON public.case_confidence_scores FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = case_confidence_scores.case_id
      AND cases.user_id = auth.uid()
  ));

-- ── Case Analytics ────────────────────────────────────────────────

CREATE TABLE public.case_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL,
  payload jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_case_analytics_case_type
  ON public.case_analytics (case_id, event_type, created_at DESC);

CREATE INDEX idx_case_analytics_type_created
  ON public.case_analytics (event_type, created_at DESC);

ALTER TABLE public.case_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own analytics"
  ON public.case_analytics FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = case_analytics.case_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own analytics"
  ON public.case_analytics FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = case_analytics.case_id
      AND cases.user_id = auth.uid()
  ));

-- Service role can insert analytics (for cron jobs)
CREATE POLICY "Service role can insert analytics"
  ON public.case_analytics FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- ── Analytics Benchmarks ──────────────────────────────────────────

CREATE TABLE public.analytics_benchmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_type text NOT NULL,
  court_type text,
  metric text NOT NULL,
  value numeric NOT NULL,
  sample_size int NOT NULL DEFAULT 0,
  computed_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX idx_benchmarks_unique
  ON public.analytics_benchmarks (dispute_type, COALESCE(court_type, ''), metric);

-- Benchmarks are public read (anonymized aggregate data)
ALTER TABLE public.analytics_benchmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read benchmarks"
  ON public.analytics_benchmarks FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage benchmarks"
  ON public.analytics_benchmarks FOR ALL
  USING (auth.role() = 'service_role');

-- ── User Subscriptions ────────────────────────────────────────────

CREATE TABLE public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  tier text NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'premium')),
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_user_subscriptions_user
  ON public.user_subscriptions (user_id);

CREATE INDEX idx_user_subscriptions_stripe
  ON public.user_subscriptions (stripe_customer_id);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own subscription"
  ON public.user_subscriptions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own subscription"
  ON public.user_subscriptions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role can manage subscriptions"
  ON public.user_subscriptions FOR ALL
  USING (auth.role() = 'service_role');

-- ── AI Usage Tracking ─────────────────────────────────────────────

CREATE TABLE public.ai_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month text NOT NULL,  -- '2026-03' format
  generation_count int NOT NULL DEFAULT 0,
  UNIQUE (user_id, month)
);

ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own usage"
  ON public.ai_usage FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can upsert own usage"
  ON public.ai_usage FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own usage"
  ON public.ai_usage FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage usage"
  ON public.ai_usage FOR ALL
  USING (auth.role() = 'service_role');

-- ── Auto-create subscription on signup ────────────────────────────

CREATE OR REPLACE FUNCTION public.auto_create_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_subscriptions (user_id, tier)
  VALUES (NEW.id, 'free')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_create_subscription();

-- Backfill existing users
INSERT INTO public.user_subscriptions (user_id, tier)
SELECT id, 'free' FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- ── Atomic AI usage increment ─────────────────────────────────────

CREATE OR REPLACE FUNCTION public.increment_ai_usage(p_user_id uuid, p_month text)
RETURNS void AS $$
BEGIN
  INSERT INTO public.ai_usage (user_id, month, generation_count)
  VALUES (p_user_id, p_month, 1)
  ON CONFLICT (user_id, month)
  DO UPDATE SET generation_count = ai_usage.generation_count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
