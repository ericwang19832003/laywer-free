-- ============================================
-- CourtListener Integration: pgvector + case law tables
-- ============================================

-- ── Extension ────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- ── 1) cl_case_clusters (shared, no RLS) ─────────────────────────

CREATE TABLE public.cl_case_clusters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cluster_id integer UNIQUE NOT NULL,
  case_name text NOT NULL,
  court_id text,
  court_name text,
  date_filed date,
  citations jsonb DEFAULT '[]',
  snippet text,
  last_used_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_cl_case_clusters_last_used
  ON public.cl_case_clusters (last_used_at DESC);

-- ── 2) cl_opinions (shared, no RLS) ─────────────────────────────

CREATE TABLE public.cl_opinions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cluster_id integer NOT NULL
    REFERENCES public.cl_case_clusters(cluster_id) ON DELETE CASCADE,
  opinion_id integer UNIQUE NOT NULL,
  opinion_type text DEFAULT 'majority',
  plain_text text NOT NULL,
  retrieved_at timestamptz DEFAULT now()
);

CREATE INDEX idx_cl_opinions_cluster
  ON public.cl_opinions (cluster_id);

-- ── 3) cl_opinion_chunks (shared, no RLS) ───────────────────────

CREATE TABLE public.cl_opinion_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opinion_id uuid NOT NULL
    REFERENCES public.cl_opinions(id) ON DELETE CASCADE,
  chunk_index integer NOT NULL,
  content text NOT NULL,
  char_start integer NOT NULL,
  char_end integer NOT NULL,
  embedding extensions.vector(3072),
  created_at timestamptz DEFAULT now(),
  UNIQUE(opinion_id, chunk_index)
);

CREATE INDEX idx_cl_opinion_chunks_opinion
  ON public.cl_opinion_chunks (opinion_id);

-- ── 4) case_authorities (WITH RLS) ──────────────────────────────

CREATE TABLE public.case_authorities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL
    REFERENCES public.cases(id) ON DELETE CASCADE,
  cluster_id integer NOT NULL
    REFERENCES public.cl_case_clusters(cluster_id) ON DELETE CASCADE,
  status text DEFAULT 'pending'
    CHECK (status IN ('pending', 'ready', 'failed')),
  added_at timestamptz DEFAULT now(),
  UNIQUE(case_id, cluster_id)
);

CREATE INDEX idx_case_authorities_case
  ON public.case_authorities (case_id);

-- RLS
ALTER TABLE public.case_authorities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own case_authorities"
  ON public.case_authorities FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = case_authorities.case_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own case_authorities"
  ON public.case_authorities FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = case_authorities.case_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own case_authorities"
  ON public.case_authorities FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = case_authorities.case_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own case_authorities"
  ON public.case_authorities FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = case_authorities.case_id
      AND cases.user_id = auth.uid()
  ));

-- ── 5) cl_search_cache (shared, no RLS) ─────────────────────────

CREATE TABLE public.cl_search_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query_hash text UNIQUE NOT NULL,
  query_text text NOT NULL,
  results jsonb DEFAULT '[]',
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_cl_search_cache_expires
  ON public.cl_search_cache (expires_at);

-- ── 6) match_opinion_chunks function (vector similarity search) ──

CREATE OR REPLACE FUNCTION public.match_opinion_chunks(
  query_embedding extensions.vector(3072),
  match_count integer DEFAULT 8,
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
  similarity double precision
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
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
    1 - (c.embedding <=> query_embedding) AS similarity
  FROM public.cl_opinion_chunks c
  JOIN public.cl_opinions o ON o.id = c.opinion_id
  JOIN public.cl_case_clusters cl ON cl.cluster_id = o.cluster_id
  WHERE c.embedding IS NOT NULL
    AND (
      filter_case_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.case_authorities ca
        WHERE ca.cluster_id = cl.cluster_id
          AND ca.case_id = filter_case_id
          AND ca.status = 'ready'
      )
    )
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
