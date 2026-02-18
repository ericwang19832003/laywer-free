-- ============================================
-- Add Upload Return of Service task
-- Update seed_case_tasks + unlock_next_task
-- ============================================

-- 1) Update seed_case_tasks to include the new task
CREATE OR REPLACE FUNCTION public.seed_case_tasks()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Welcome task: unlocked immediately
  INSERT INTO public.tasks (case_id, task_key, title, status, unlocked_at)
  VALUES (NEW.id, 'welcome', 'Welcome — Get Started', 'todo', now());

  -- Intake task: locked until welcome is completed
  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'intake', 'Tell Us About Your Case', 'locked');

  -- Evidence vault: locked
  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'evidence_vault', 'Organize Your Evidence', 'locked');

  -- Preservation letter: locked
  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'preservation_letter', 'Draft a Preservation Letter', 'locked');

  -- Upload Return of Service: locked
  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'upload_return_of_service', 'Upload Return of Service', 'locked');

  -- Write a timeline event for case creation
  INSERT INTO public.task_events (case_id, kind, payload)
  VALUES (NEW.id, 'case_created', jsonb_build_object(
    'role', NEW.role,
    'county', NEW.county,
    'court_type', NEW.court_type
  ));

  RETURN NEW;
END;
$$;

-- 2) Update unlock_next_task to chain preservation_letter → upload_return_of_service
CREATE OR REPLACE FUNCTION public.unlock_next_task()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- When welcome is completed, unlock intake
  IF NEW.task_key = 'welcome' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks
    SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id
      AND task_key = 'intake'
      AND status = 'locked';

    -- Write timeline event
    INSERT INTO public.task_events (case_id, task_id, kind, payload)
    VALUES (NEW.case_id, (
      SELECT id FROM public.tasks WHERE case_id = NEW.case_id AND task_key = 'intake'
    ), 'task_unlocked', jsonb_build_object('task_key', 'intake'));
  END IF;

  -- When intake is completed, unlock evidence_vault
  IF NEW.task_key = 'intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks
    SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id
      AND task_key = 'evidence_vault'
      AND status = 'locked';

    INSERT INTO public.task_events (case_id, task_id, kind, payload)
    VALUES (NEW.case_id, (
      SELECT id FROM public.tasks WHERE case_id = NEW.case_id AND task_key = 'evidence_vault'
    ), 'task_unlocked', jsonb_build_object('task_key', 'evidence_vault'));
  END IF;

  -- When evidence_vault is completed, unlock preservation_letter
  IF NEW.task_key = 'evidence_vault' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks
    SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id
      AND task_key = 'preservation_letter'
      AND status = 'locked';

    INSERT INTO public.task_events (case_id, task_id, kind, payload)
    VALUES (NEW.case_id, (
      SELECT id FROM public.tasks WHERE case_id = NEW.case_id AND task_key = 'preservation_letter'
    ), 'task_unlocked', jsonb_build_object('task_key', 'preservation_letter'));
  END IF;

  -- When preservation_letter is completed, unlock upload_return_of_service
  IF NEW.task_key = 'preservation_letter' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks
    SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id
      AND task_key = 'upload_return_of_service'
      AND status = 'locked';

    INSERT INTO public.task_events (case_id, task_id, kind, payload)
    VALUES (NEW.case_id, (
      SELECT id FROM public.tasks WHERE case_id = NEW.case_id AND task_key = 'upload_return_of_service'
    ), 'task_unlocked', jsonb_build_object('task_key', 'upload_return_of_service'));
  END IF;

  RETURN NEW;
END;
$$;

-- 3) Backfill: add the new task to existing cases that don't have it yet
INSERT INTO public.tasks (case_id, task_key, title, status)
SELECT c.id, 'upload_return_of_service', 'Upload Return of Service', 'locked'
FROM public.cases c
WHERE NOT EXISTS (
  SELECT 1 FROM public.tasks t
  WHERE t.case_id = c.id AND t.task_key = 'upload_return_of_service'
);

-- For cases where preservation_letter is already completed, unlock the new task
UPDATE public.tasks AS t
SET status = 'todo', unlocked_at = now()
FROM public.tasks AS pl
WHERE t.task_key = 'upload_return_of_service'
  AND t.status = 'locked'
  AND pl.case_id = t.case_id
  AND pl.task_key = 'preservation_letter'
  AND pl.status = 'completed';
