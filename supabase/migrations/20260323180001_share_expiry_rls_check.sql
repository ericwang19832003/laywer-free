-- Fix: shared case functions check share_enabled but not share_expires_at.
-- Add expiry check to all three SECURITY DEFINER functions.

CREATE OR REPLACE FUNCTION public.get_shared_case(p_token uuid)
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'id', id,
    'county', county,
    'court_type', court_type,
    'role', role,
    'dispute_type', dispute_type,
    'status', status,
    'created_at', created_at
  )
  FROM public.cases
  WHERE share_token = p_token
    AND share_enabled = true
    AND (share_expires_at IS NULL OR share_expires_at > now());
$$;

CREATE OR REPLACE FUNCTION public.get_shared_case_deadlines(p_token uuid)
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(json_agg(row_to_json(d)), '[]'::json)
  FROM (
    SELECT key, due_at, source
    FROM public.deadlines
    WHERE case_id = (
      SELECT id FROM public.cases
      WHERE share_token = p_token
        AND share_enabled = true
        AND (share_expires_at IS NULL OR share_expires_at > now())
    )
    ORDER BY due_at ASC
    LIMIT 10
  ) d;
$$;

CREATE OR REPLACE FUNCTION public.get_shared_case_events(p_token uuid)
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(json_agg(row_to_json(e)), '[]'::json)
  FROM (
    SELECT kind, payload, created_at
    FROM public.task_events
    WHERE case_id = (
      SELECT id FROM public.cases
      WHERE share_token = p_token
        AND share_enabled = true
        AND (share_expires_at IS NULL OR share_expires_at > now())
    )
    ORDER BY created_at DESC
    LIMIT 10
  ) e;
$$;
