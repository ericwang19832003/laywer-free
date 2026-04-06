-- Funnel Analytics indexes for efficient completion funnel queries
-- Supports: /api/analytics/funnel and /api/analytics/ai-accept-rate

-- 1) Composite index on tasks for funnel aggregation by case + task_key + status
CREATE INDEX IF NOT EXISTS idx_tasks_case_key_status
  ON public.tasks (case_id, task_key, status);

-- 2) Index on task_events for event-based analytics queries
CREATE INDEX IF NOT EXISTS idx_task_events_case_kind
  ON public.task_events (case_id, kind);

-- 3) Index on cases.dispute_type for filtering cases by type
CREATE INDEX IF NOT EXISTS idx_cases_dispute_type
  ON public.cases (dispute_type);
