CREATE TABLE public.draft_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE,
  version_number int NOT NULL DEFAULT 1,
  content text NOT NULL,
  source text NOT NULL DEFAULT 'generated', -- 'generated' or 'edited'
  created_at timestamptz DEFAULT now(),
  UNIQUE(case_id, task_id, version_number)
);

CREATE INDEX idx_draft_versions_case_task ON public.draft_versions (case_id, task_id, version_number DESC);

ALTER TABLE public.draft_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own draft versions"
  ON public.draft_versions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = draft_versions.case_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own draft versions"
  ON public.draft_versions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = draft_versions.case_id
      AND cases.user_id = auth.uid()
  ));
