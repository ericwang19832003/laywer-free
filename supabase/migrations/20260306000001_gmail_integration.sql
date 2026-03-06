-- Gmail Integration: connected_accounts and case_email_filters tables

-- Table 1: connected_accounts
-- Stores encrypted OAuth tokens for Gmail connections.
CREATE TABLE public.connected_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider text NOT NULL CHECK (provider IN ('gmail')),
  email text NOT NULL,
  access_token_encrypted text NOT NULL,
  refresh_token_encrypted text NOT NULL,
  token_expires_at timestamptz NOT NULL,
  scopes text[] NOT NULL DEFAULT '{}',
  connected_at timestamptz DEFAULT now(),
  revoked_at timestamptz
);

CREATE UNIQUE INDEX idx_connected_accounts_active
  ON public.connected_accounts (user_id, provider)
  WHERE revoked_at IS NULL;

ALTER TABLE public.connected_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own connected accounts"
  ON public.connected_accounts FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own connected accounts"
  ON public.connected_accounts FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own connected accounts"
  ON public.connected_accounts FOR UPDATE
  USING (user_id = auth.uid());

-- Table 2: case_email_filters
-- Stores which email addresses to monitor per case.
CREATE TABLE public.case_email_filters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  email_address text NOT NULL,
  label text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_case_email_filters_case
  ON public.case_email_filters (case_id);

CREATE UNIQUE INDEX idx_case_email_filters_unique
  ON public.case_email_filters (case_id, email_address);

ALTER TABLE public.case_email_filters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own case email filters"
  ON public.case_email_filters FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.cases WHERE cases.id = case_email_filters.case_id AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own case email filters"
  ON public.case_email_filters FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.cases WHERE cases.id = case_email_filters.case_id AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own case email filters"
  ON public.case_email_filters FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.cases WHERE cases.id = case_email_filters.case_id AND cases.user_id = auth.uid()
  ));
