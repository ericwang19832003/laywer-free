-- ============================================
-- Attorney Document Review
-- ============================================

CREATE TABLE public.attorney_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'completed', 'cancelled')),
  document_type text NOT NULL,
  notes text,
  review_comments text,
  stripe_payment_intent_id text,
  amount_cents int NOT NULL DEFAULT 4900,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_attorney_reviews_case
  ON public.attorney_reviews (case_id, created_at DESC);

CREATE INDEX idx_attorney_reviews_status
  ON public.attorney_reviews (status, created_at DESC);

ALTER TABLE public.attorney_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own reviews"
  ON public.attorney_reviews FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own reviews"
  ON public.attorney_reviews FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role can manage reviews"
  ON public.attorney_reviews FOR ALL
  USING (auth.role() = 'service_role');
