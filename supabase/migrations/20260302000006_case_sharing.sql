ALTER TABLE public.cases
  ADD COLUMN share_token uuid DEFAULT NULL,
  ADD COLUMN share_enabled boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX idx_cases_share_token
  ON public.cases (share_token) WHERE share_token IS NOT NULL;

CREATE POLICY "Anyone can read shared cases by token"
  ON public.cases FOR SELECT
  USING (share_enabled = true AND share_token IS NOT NULL);
