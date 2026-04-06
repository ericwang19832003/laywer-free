-- Shared cache for AI-generated content
CREATE TABLE IF NOT EXISTS public.ai_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  cache_key text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}',
  generated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Unique per case+key, latest wins
CREATE UNIQUE INDEX idx_ai_cache_case_key ON public.ai_cache (case_id, cache_key);
CREATE INDEX idx_ai_cache_expiry ON public.ai_cache (expires_at) WHERE expires_at IS NOT NULL;

-- RLS
ALTER TABLE public.ai_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own case AI cache"
  ON public.ai_cache FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.cases WHERE cases.id = ai_cache.case_id AND cases.user_id = auth.uid())
  );

CREATE POLICY "Users can upsert own case AI cache"
  ON public.ai_cache FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.cases WHERE cases.id = ai_cache.case_id AND cases.user_id = auth.uid())
  );

CREATE POLICY "Users can update own case AI cache"
  ON public.ai_cache FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.cases WHERE cases.id = ai_cache.case_id AND cases.user_id = auth.uid())
  );
