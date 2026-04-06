-- ============================================
-- CourtListener RAG Phase 1 enhancements
-- ============================================

-- cl_opinion_chunks metadata + FTS
ALTER TABLE public.cl_opinion_chunks
  ADD COLUMN section_title text,
  ADD COLUMN paragraph_start integer,
  ADD COLUMN paragraph_end integer,
  ADD COLUMN citation_count integer DEFAULT 0,
  ADD COLUMN contains_holding boolean DEFAULT false,
  ADD COLUMN tsv tsvector GENERATED ALWAYS AS (to_tsvector('english', content)) STORED;

CREATE INDEX IF NOT EXISTS idx_cl_opinion_chunks_tsv
  ON public.cl_opinion_chunks USING GIN (tsv);

-- cl_opinions optional summary + issue tags
ALTER TABLE public.cl_opinions
  ADD COLUMN summary_text text,
  ADD COLUMN issue_tags text[];

-- cache for ask responses
CREATE TABLE IF NOT EXISTS public.cl_query_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query_hash text NOT NULL,
  question text NOT NULL,
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  authorities_hash text NOT NULL,
  response jsonb NOT NULL,
  chunks_used jsonb DEFAULT '[]',
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (query_hash, case_id, authorities_hash)
);

CREATE INDEX IF NOT EXISTS idx_cl_query_cache_expires
  ON public.cl_query_cache (expires_at);

-- keyword search helper for hybrid retrieval
CREATE OR REPLACE FUNCTION public.match_opinion_chunks_keyword(
  query_text text,
  match_count integer DEFAULT 20,
  filter_case_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  opinion_id uuid,
  chunk_index integer,
  content text,
  char_start integer,
  char_end integer,
  opinion_db_id uuid,
  opinion_type text,
  cluster_id integer,
  case_name text,
  court_name text,
  date_filed date,
  citations jsonb,
  rank double precision
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    c.id,
    c.opinion_id,
    c.chunk_index,
    c.content,
    c.char_start,
    c.char_end,
    o.id AS opinion_db_id,
    o.opinion_type,
    cl.cluster_id,
    cl.case_name,
    cl.court_name,
    cl.date_filed,
    cl.citations,
    ts_rank(c.tsv, plainto_tsquery('english', query_text)) AS rank
  FROM public.cl_opinion_chunks c
  JOIN public.cl_opinions o ON o.id = c.opinion_id
  JOIN public.cl_case_clusters cl ON cl.cluster_id = o.cluster_id
  WHERE c.tsv @@ plainto_tsquery('english', query_text)
    AND (
      filter_case_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.case_authorities ca
        WHERE ca.cluster_id = cl.cluster_id
          AND ca.case_id = filter_case_id
          AND ca.status = 'ready'
      )
    )
  ORDER BY rank DESC
  LIMIT match_count;
$$;
