-- 1. New table for user document chunks
CREATE TABLE public.case_document_chunks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id     uuid REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  source_type text NOT NULL CHECK (source_type IN (
                 'court_document',
                 'evidence_item',
                 'generated_document'
               )),
  source_id   uuid NOT NULL,
  chunk_index int NOT NULL,
  content     text NOT NULL,
  embedding   extensions.vector(1536) NOT NULL,
  token_count int NOT NULL,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX ON public.case_document_chunks
  USING ivfflat (embedding extensions.vector_cosine_ops) WITH (lists = 50);

CREATE INDEX ON public.case_document_chunks (source_type, source_id);
CREATE INDEX ON public.case_document_chunks (case_id);

ALTER TABLE public.case_document_chunks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "case_document_chunks_owner" ON public.case_document_chunks
  FOR ALL USING (
    case_id IN (SELECT id FROM public.cases WHERE user_id = auth.uid())
  );

-- 2. embedding_status tracking on upload tables
ALTER TABLE public.court_documents
  ADD COLUMN embedding_status text NOT NULL DEFAULT 'pending'
  CHECK (embedding_status IN ('pending', 'processing', 'done', 'failed'));

ALTER TABLE public.evidence_items
  ADD COLUMN embedding_status text NOT NULL DEFAULT 'pending'
  CHECK (embedding_status IN ('pending', 'processing', 'done', 'failed'));

-- 3. RPC for vector similarity search scoped to a single case
CREATE OR REPLACE FUNCTION public.match_case_documents(
  p_case_id       uuid,
  query_embedding extensions.vector(1536),
  match_count     int DEFAULT 5,
  source_types    text[] DEFAULT NULL
)
RETURNS TABLE (
  id          uuid,
  source_type text,
  source_id   uuid,
  chunk_index int,
  content     text,
  similarity  float
)
LANGUAGE plpgsql STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cdc.id,
    cdc.source_type,
    cdc.source_id,
    cdc.chunk_index,
    cdc.content,
    1 - (cdc.embedding <=> query_embedding) AS similarity
  FROM public.case_document_chunks cdc
  WHERE
    cdc.case_id = p_case_id
    AND (source_types IS NULL OR cdc.source_type = ANY(source_types))
  ORDER BY cdc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.match_case_documents TO authenticated;
