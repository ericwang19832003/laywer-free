-- Gmail Integration: case_email_filters table
-- (connected_accounts removed — authentication handled by MCP server externally)

-- Table: case_email_filters
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
