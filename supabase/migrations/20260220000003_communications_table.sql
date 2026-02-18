-- ============================================
-- communications table: email send audit log
-- ============================================

CREATE TABLE public.communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  channel text NOT NULL DEFAULT 'email',
  to_value text NOT NULL,
  subject text NOT NULL,
  body_preview text NOT NULL,
  body_sha256 text NOT NULL,
  provider_message_id text,
  status text NOT NULL DEFAULT 'queued',
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_communications_case ON public.communications (case_id, created_at DESC);

-- RLS: case owner only
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own communications"
  ON public.communications FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = communications.case_id AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own communications"
  ON public.communications FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = communications.case_id AND cases.user_id = auth.uid()
  ));
