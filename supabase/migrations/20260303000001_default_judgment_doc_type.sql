ALTER TABLE public.court_documents
  DROP CONSTRAINT IF EXISTS court_documents_doc_type_check;

ALTER TABLE public.court_documents
  ADD CONSTRAINT court_documents_doc_type_check
  CHECK (doc_type IN (
    'return_of_service', 'petition', 'answer', 'general_denial',
    'amended_complaint', 'motion_to_remand', 'default_judgment_packet'
  ));
