-- ============================================
-- documents table: text-content drafts with versioning
-- ============================================
-- Stores generated text documents (preservation letters, etc.)
-- Separate from court_documents which stores uploaded file blobs.

CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  task_id uuid REFERENCES public.tasks(id) ON DELETE SET NULL,
  doc_type text NOT NULL,
  version int NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'draft',
  content_text text NOT NULL,
  sha256 text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Index for fast lookups by case + doc_type + version ordering
CREATE INDEX idx_documents_case_doctype ON public.documents (case_id, doc_type, version DESC);

-- RLS: case owner only
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents"
  ON public.documents FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = documents.case_id AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own documents"
  ON public.documents FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = documents.case_id AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own documents"
  ON public.documents FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = documents.case_id AND cases.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = documents.case_id AND cases.user_id = auth.uid()
  ));
