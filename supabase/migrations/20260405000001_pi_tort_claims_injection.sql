-- ============================================
-- Tort Claims Task Injection RPC
-- Injects conditional tasks (e.g., tort claims notice/tracking)
-- into an existing case with deadline generation.
-- ============================================

CREATE OR REPLACE FUNCTION public.inject_conditional_tasks(
  p_case_id uuid,
  p_task_keys text[],
  p_insert_after text,
  p_incident_date text DEFAULT NULL,
  p_gov_entity_type text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_task_key text;
  v_title text;
  v_incident_ts timestamptz;
  v_notice_deadline timestamptz;
BEGIN
  -- Verify case ownership
  SELECT user_id INTO v_user_id FROM public.cases WHERE id = p_case_id;
  IF v_user_id IS NULL OR v_user_id != auth.uid() THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  FOREACH v_task_key IN ARRAY p_task_keys LOOP
    -- Skip if already exists
    IF EXISTS (SELECT 1 FROM public.tasks WHERE case_id = p_case_id AND task_key = v_task_key) THEN
      CONTINUE;
    END IF;

    -- Title lookup
    CASE v_task_key
      WHEN 'pi_tort_claims_notice' THEN v_title := 'Draft & Send Tort Claims Notice';
      WHEN 'pi_tort_claims_tracking' THEN v_title := 'Track Tort Claims Notice Response';
      ELSE v_title := v_task_key;
    END CASE;

    -- Insert as todo (immediately actionable)
    INSERT INTO public.tasks (case_id, task_key, title, status, unlocked_at)
    VALUES (p_case_id, v_task_key, v_title, 'todo', now());

    -- Log event
    INSERT INTO public.task_events (case_id, task_id, kind, payload)
    VALUES (
      p_case_id,
      (SELECT id FROM public.tasks WHERE case_id = p_case_id AND task_key = v_task_key),
      'task_injected',
      jsonb_build_object('task_key', v_task_key, 'insert_after', p_insert_after)
    );
  END LOOP;

  -- Create Tort Claims notice deadline (6 months from incident)
  IF p_incident_date IS NOT NULL AND 'pi_tort_claims_notice' = ANY(p_task_keys) THEN
    v_incident_ts := p_incident_date::timestamptz;
    v_notice_deadline := v_incident_ts + interval '6 months';

    IF v_notice_deadline > now() THEN
      INSERT INTO public.deadlines (case_id, key, due_at, source, rationale, label, consequence, auto_generated)
      VALUES (
        p_case_id,
        'tort_claims_notice_deadline',
        v_notice_deadline,
        'system',
        'Texas Tort Claims Act requires written notice to government entity within 6 months of injury. Some cities have shorter deadlines (Austin: 45 days, Houston/Dallas: 90 days).',
        'Tort Claims Notice Deadline',
        'Your claim against the government entity will be permanently barred if notice is not sent by this date.',
        true
      );
    END IF;
  END IF;
END;
$$;
