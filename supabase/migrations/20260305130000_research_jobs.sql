-- ============================================
-- Research precompute job queue
-- ============================================

CREATE TABLE public.cl_authority_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  cluster_id integer NOT NULL REFERENCES public.cl_case_clusters(cluster_id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  attempts integer NOT NULL DEFAULT 0,
  last_error text,
  next_run_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (case_id, cluster_id)
);

CREATE INDEX idx_cl_authority_jobs_status
  ON public.cl_authority_jobs (status, next_run_at);
