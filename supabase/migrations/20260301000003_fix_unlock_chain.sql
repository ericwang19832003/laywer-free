-- ============================================
-- Fix: Restore missing downstream unlock rules
-- The 20260301000002 migration's CREATE OR REPLACE dropped
-- evidence_vault→preservation_letter, preservation_letter→upload_return_of_service,
-- and upload_return_of_service→confirm_service_facts rules.
-- ============================================

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

  -- evidence_vault → preservation_letter
  IF NEW.task_key = 'evidence_vault' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks
    SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'preservation_letter' AND status = 'locked';
  END IF;

  -- preservation_letter → upload_return_of_service
  IF NEW.task_key = 'preservation_letter' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks
    SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'upload_return_of_service' AND status = 'locked';
  END IF;

  -- upload_return_of_service → confirm_service_facts
  IF NEW.task_key = 'upload_return_of_service' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks
    SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'confirm_service_facts' AND status = 'locked';
  END IF;

  RETURN NEW;
END;
$$;

-- Backfill: unlock prepare_filing for cases where intake is already completed
UPDATE public.tasks
SET status = 'todo', unlocked_at = now()
WHERE task_key = 'prepare_filing'
  AND status = 'locked'
  AND case_id IN (
    SELECT case_id FROM public.tasks
    WHERE task_key = 'intake' AND status = 'completed'
  );
