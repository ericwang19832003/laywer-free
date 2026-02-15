-- ============================================
-- get_case_dashboard(p_case_id uuid)
-- Returns JSON with: next_task, tasks_summary, upcoming_deadlines, recent_events
-- ============================================

CREATE OR REPLACE FUNCTION public.get_case_dashboard(p_case_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_result jsonb;
  v_next_task jsonb;
  v_tasks_summary jsonb;
  v_upcoming_deadlines jsonb;
  v_recent_events jsonb;
BEGIN
  -- Verify ownership
  SELECT user_id INTO v_user_id
  FROM public.cases
  WHERE id = p_case_id;

  IF v_user_id IS NULL OR v_user_id != auth.uid() THEN
    RETURN NULL;
  END IF;

  -- Next task: earliest unlocked todo/in_progress/needs_review
  SELECT to_jsonb(t) INTO v_next_task
  FROM (
    SELECT id, task_key, title, status, due_at, unlocked_at, metadata
    FROM public.tasks
    WHERE case_id = p_case_id
      AND status IN ('todo', 'in_progress', 'needs_review')
    ORDER BY created_at ASC
    LIMIT 1
  ) t;

  -- Tasks summary: counts by status
  SELECT COALESCE(jsonb_object_agg(status, cnt), '{}'::jsonb) INTO v_tasks_summary
  FROM (
    SELECT status, count(*)::int AS cnt
    FROM public.tasks
    WHERE case_id = p_case_id
    GROUP BY status
  ) s;

  -- Upcoming deadlines: next 14 days
  SELECT COALESCE(jsonb_agg(to_jsonb(d) ORDER BY d.due_at), '[]'::jsonb) INTO v_upcoming_deadlines
  FROM (
    SELECT id, key, due_at, source, rationale
    FROM public.deadlines
    WHERE case_id = p_case_id
      AND due_at >= now()
      AND due_at <= now() + interval '14 days'
    ORDER BY due_at ASC
    LIMIT 5
  ) d;

  -- Recent events: last 15
  SELECT COALESCE(jsonb_agg(to_jsonb(e) ORDER BY e.created_at DESC), '[]'::jsonb) INTO v_recent_events
  FROM (
    SELECT te.id, te.task_id, te.kind, te.payload, te.created_at,
           t.title AS task_title
    FROM public.task_events te
    LEFT JOIN public.tasks t ON t.id = te.task_id
    WHERE te.case_id = p_case_id
    ORDER BY te.created_at DESC
    LIMIT 15
  ) e;

  v_result := jsonb_build_object(
    'next_task', COALESCE(v_next_task, 'null'::jsonb),
    'tasks_summary', COALESCE(v_tasks_summary, '{}'::jsonb),
    'upcoming_deadlines', v_upcoming_deadlines,
    'recent_events', v_recent_events
  );

  RETURN v_result;
END;
$$;
