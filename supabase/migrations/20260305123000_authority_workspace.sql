-- ============================================
-- Authority workspace: folders, tags, pinned
-- ============================================

CREATE TABLE public.authority_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (case_id, name)
);

ALTER TABLE public.authority_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own authority_folders"
  ON public.authority_folders FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = authority_folders.case_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own authority_folders"
  ON public.authority_folders FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = authority_folders.case_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own authority_folders"
  ON public.authority_folders FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = authority_folders.case_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own authority_folders"
  ON public.authority_folders FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = authority_folders.case_id
      AND cases.user_id = auth.uid()
  ));

ALTER TABLE public.case_authorities
  ADD COLUMN pinned boolean DEFAULT false,
  ADD COLUMN folder_id uuid REFERENCES public.authority_folders(id) ON DELETE SET NULL,
  ADD COLUMN tags text[] DEFAULT '{}';

CREATE INDEX idx_case_authorities_case_pinned
  ON public.case_authorities (case_id, pinned DESC);

CREATE INDEX idx_case_authorities_folder
  ON public.case_authorities (folder_id);
