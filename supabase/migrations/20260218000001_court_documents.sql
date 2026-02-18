-- ============================================
-- court_documents table + Storage RLS
-- ============================================

-- 1) court_documents table
CREATE TABLE public.court_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  doc_type text NOT NULL,
  storage_path text NOT NULL,
  file_name text NOT NULL,
  mime_type text NOT NULL,
  sha256 text NOT NULL,
  uploaded_by uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_court_docs_case_type_created
  ON public.court_documents (case_id, doc_type, created_at DESC);

-- 2) RLS for court_documents (join through cases, same pattern as tasks)
ALTER TABLE public.court_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own court documents"
  ON public.court_documents FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = court_documents.case_id AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own court documents"
  ON public.court_documents FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = court_documents.case_id AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own court documents"
  ON public.court_documents FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = court_documents.case_id AND cases.user_id = auth.uid()
  ));

-- 3) Storage RLS for case-documents bucket
-- Path convention: cases/{case_id}/court-docs/{uuid}
-- Parse case_id from path: (storage.foldername(name))[1] = 'cases', [2] = case_id

CREATE POLICY "Users can upload to own case folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'case-documents'
    AND EXISTS (
      SELECT 1 FROM public.cases
      WHERE cases.id = (string_to_array(name, '/'))[2]::uuid
        AND cases.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read own case files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'case-documents'
    AND EXISTS (
      SELECT 1 FROM public.cases
      WHERE cases.id = (string_to_array(name, '/'))[2]::uuid
        AND cases.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own case files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'case-documents'
    AND EXISTS (
      SELECT 1 FROM public.cases
      WHERE cases.id = (string_to_array(name, '/'))[2]::uuid
        AND cases.user_id = auth.uid()
    )
  );
