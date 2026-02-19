-- ============================================
-- evidence_items table
-- ============================================

CREATE TABLE public.evidence_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  storage_path text NOT NULL,
  mime_type text,
  file_size bigint,
  sha256 text,
  label text,
  notes text,
  captured_at date,
  uploaded_by uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_evidence_items_case_label
  ON public.evidence_items (case_id, label);

CREATE INDEX idx_evidence_items_case_created
  ON public.evidence_items (case_id, created_at DESC);

-- RLS: only case owner can access
ALTER TABLE public.evidence_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own evidence items"
  ON public.evidence_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = evidence_items.case_id AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own evidence items"
  ON public.evidence_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = evidence_items.case_id AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own evidence items"
  ON public.evidence_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = evidence_items.case_id AND cases.user_id = auth.uid()
  ));
