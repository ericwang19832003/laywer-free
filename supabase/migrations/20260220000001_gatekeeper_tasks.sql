-- ============================================
-- Gatekeeper tasks: non-linear unlock chain
-- ============================================
-- These 5 tasks are unlocked by the gatekeeper rules engine
-- (src/lib/rules/gatekeeper.ts) rather than the linear
-- unlock_next_task() trigger.

-- 1) Add new tasks to seed_case_tasks()
CREATE OR REPLACE FUNCTION public.seed_case_tasks()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Linear chain (unchanged)
  INSERT INTO public.tasks (case_id, task_key, title, status, unlocked_at)
  VALUES (NEW.id, 'welcome', 'Welcome — Get Started', 'todo', now());

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'intake', 'Tell Us About Your Case', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'evidence_vault', 'Organize Your Evidence', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'preservation_letter', 'Draft a Preservation Letter', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'upload_return_of_service', 'Upload Return of Service', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'confirm_service_facts', 'Confirm Service Details', 'locked');

  -- Gatekeeper-managed tasks (all start locked)
  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'wait_for_answer', 'Wait for Answer Deadline', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'check_docket_for_answer', 'Check Docket for Answer', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'default_packet_prep', 'Prepare Default Judgment Packet', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'upload_answer', 'Upload the Answer', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'discovery_starter_pack', 'Discovery Starter Pack', 'locked');

  INSERT INTO public.task_events (case_id, kind, payload)
  VALUES (NEW.id, 'case_created', jsonb_build_object(
    'role', NEW.role,
    'county', NEW.county,
    'court_type', NEW.court_type
  ));

  RETURN NEW;
END;
$$;

-- 2) Backfill: add gatekeeper tasks to existing cases
INSERT INTO public.tasks (case_id, task_key, title, status)
SELECT c.id, 'wait_for_answer', 'Wait for Answer Deadline', 'locked'
FROM public.cases c
WHERE NOT EXISTS (
  SELECT 1 FROM public.tasks t
  WHERE t.case_id = c.id AND t.task_key = 'wait_for_answer'
);

INSERT INTO public.tasks (case_id, task_key, title, status)
SELECT c.id, 'check_docket_for_answer', 'Check Docket for Answer', 'locked'
FROM public.cases c
WHERE NOT EXISTS (
  SELECT 1 FROM public.tasks t
  WHERE t.case_id = c.id AND t.task_key = 'check_docket_for_answer'
);

INSERT INTO public.tasks (case_id, task_key, title, status)
SELECT c.id, 'default_packet_prep', 'Prepare Default Judgment Packet', 'locked'
FROM public.cases c
WHERE NOT EXISTS (
  SELECT 1 FROM public.tasks t
  WHERE t.case_id = c.id AND t.task_key = 'default_packet_prep'
);

INSERT INTO public.tasks (case_id, task_key, title, status)
SELECT c.id, 'upload_answer', 'Upload the Answer', 'locked'
FROM public.cases c
WHERE NOT EXISTS (
  SELECT 1 FROM public.tasks t
  WHERE t.case_id = c.id AND t.task_key = 'upload_answer'
);

INSERT INTO public.tasks (case_id, task_key, title, status)
SELECT c.id, 'discovery_starter_pack', 'Discovery Starter Pack', 'locked'
FROM public.cases c
WHERE NOT EXISTS (
  SELECT 1 FROM public.tasks t
  WHERE t.case_id = c.id AND t.task_key = 'discovery_starter_pack'
);
