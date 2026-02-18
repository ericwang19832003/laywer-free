-- ============================================
-- document_extractions table
-- ============================================

-- 1) document_extractions table
CREATE TABLE public.document_extractions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  court_document_id uuid REFERENCES public.court_documents(id) ON DELETE CASCADE NOT NULL,
  extractor text NOT NULL CHECK (extractor IN ('regex', 'ocr', 'openai', 'manual')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'needs_review', 'failed')),
  confidence numeric CHECK (confidence >= 0 AND confidence <= 1),
  fields jsonb DEFAULT '{}'::jsonb,
  confirmed_by_user boolean DEFAULT false,
  confirmed_fields jsonb,
  created_at timestamptz DEFAULT now()
);

-- 2) Indexes
CREATE INDEX idx_doc_extractions_doc_created
  ON public.document_extractions (court_document_id, created_at DESC);

CREATE INDEX idx_doc_extractions_case_status
  ON public.document_extractions (case_id, status);

-- One non-failed extraction per document per extractor type
CREATE UNIQUE INDEX idx_doc_extractions_unique_active
  ON public.document_extractions (court_document_id, extractor)
  WHERE status != 'failed';

-- 3) RLS (join through cases, same pattern as court_documents)
ALTER TABLE public.document_extractions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own document extractions"
  ON public.document_extractions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = document_extractions.case_id AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own document extractions"
  ON public.document_extractions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = document_extractions.case_id AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own document extractions"
  ON public.document_extractions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = document_extractions.case_id AND cases.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = document_extractions.case_id AND cases.user_id = auth.uid()
  ));
