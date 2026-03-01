-- ============================================
-- E-Filing: Add prepare_filing and file_with_court tasks
-- ============================================

-- 1) Expand court_documents doc_type CHECK
ALTER TABLE public.court_documents
  DROP CONSTRAINT IF EXISTS court_documents_doc_type_check;

ALTER TABLE public.court_documents
  ADD CONSTRAINT court_documents_doc_type_check
  CHECK (doc_type IN ('return_of_service', 'petition', 'answer', 'general_denial'));

-- 2) Update seed_case_tasks to include new tasks
CREATE OR REPLACE FUNCTION public.seed_case_tasks()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Linear chain
  INSERT INTO public.tasks (case_id, task_key, title, status, unlocked_at)
  VALUES (NEW.id, 'welcome', 'Welcome — Get Started', 'todo', now());

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'intake', 'Tell Us About Your Case', 'locked');

  -- Filing tasks (after intake)
  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'prepare_filing',
    CASE WHEN NEW.role = 'defendant' THEN 'Prepare Your Answer'
         ELSE 'Prepare Your Petition' END,
    'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'file_with_court', 'File With the Court', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'evidence_vault', 'Organize Your Evidence', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'preservation_letter', 'Draft a Preservation Letter', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'upload_return_of_service', 'Upload Return of Service', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'confirm_service_facts', 'Confirm Service Details', 'locked');

  -- Gatekeeper-managed tasks
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

-- 3) Update unlock chain: intake → prepare_filing → file_with_court → evidence_vault
CREATE OR REPLACE FUNCTION public.unlock_next_task()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- welcome → intake
  IF NEW.task_key = 'welcome' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks
    SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'intake' AND status = 'locked';

    INSERT INTO public.task_events (case_id, task_id, kind, payload)
    VALUES (NEW.case_id, (
      SELECT id FROM public.tasks WHERE case_id = NEW.case_id AND task_key = 'intake'
    ), 'task_unlocked', jsonb_build_object('task_key', 'intake'));
  END IF;

  -- intake → prepare_filing
  IF NEW.task_key = 'intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks
    SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'prepare_filing' AND status = 'locked';
  END IF;

  -- prepare_filing → file_with_court
  IF NEW.task_key = 'prepare_filing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks
    SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'file_with_court' AND status = 'locked';
  END IF;

  -- file_with_court → evidence_vault
  IF NEW.task_key = 'file_with_court' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks
    SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'evidence_vault' AND status = 'locked';
  END IF;

  RETURN NEW;
END;
$$;

-- 4) Backfill existing cases
INSERT INTO public.tasks (case_id, task_key, title, status)
SELECT c.id, 'prepare_filing',
  CASE WHEN c.role = 'defendant' THEN 'Prepare Your Answer'
       ELSE 'Prepare Your Petition' END,
  'locked'
FROM public.cases c
WHERE NOT EXISTS (
  SELECT 1 FROM public.tasks t
  WHERE t.case_id = c.id AND t.task_key = 'prepare_filing'
);

INSERT INTO public.tasks (case_id, task_key, title, status)
SELECT c.id, 'file_with_court', 'File With the Court', 'locked'
FROM public.cases c
WHERE NOT EXISTS (
  SELECT 1 FROM public.tasks t
  WHERE t.case_id = c.id AND t.task_key = 'file_with_court'
);
