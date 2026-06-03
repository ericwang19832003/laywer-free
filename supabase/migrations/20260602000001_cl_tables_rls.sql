-- Enable RLS on CourtListener cache tables
--
-- Shared reference tables (cl_case_clusters, cl_opinions, cl_opinion_chunks, cl_search_cache):
--   Authenticated users may SELECT; service role handles all writes (bypasses RLS).
--
-- Per-case tables (cl_query_cache, cl_authority_jobs):
--   Authenticated users may SELECT rows belonging to their own cases only.

-- ── Shared read-only cache tables ────────────────────────────────────────────

ALTER TABLE public.cl_case_clusters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read cl_case_clusters"
  ON public.cl_case_clusters FOR SELECT
  TO authenticated
  USING (true);

ALTER TABLE public.cl_opinions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read cl_opinions"
  ON public.cl_opinions FOR SELECT
  TO authenticated
  USING (true);

ALTER TABLE public.cl_opinion_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read cl_opinion_chunks"
  ON public.cl_opinion_chunks FOR SELECT
  TO authenticated
  USING (true);

ALTER TABLE public.cl_search_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read cl_search_cache"
  ON public.cl_search_cache FOR SELECT
  TO authenticated
  USING (true);

-- ── Per-case tables ───────────────────────────────────────────────────────────

ALTER TABLE public.cl_query_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own cl_query_cache"
  ON public.cl_query_cache FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = cl_query_cache.case_id
      AND cases.user_id = auth.uid()
  ));

ALTER TABLE public.cl_authority_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own cl_authority_jobs"
  ON public.cl_authority_jobs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = cl_authority_jobs.case_id
      AND cases.user_id = auth.uid()
  ));
