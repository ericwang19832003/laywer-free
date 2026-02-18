-- ============================================
-- service_facts table + confirm_service_facts task
-- ============================================

-- 1) service_facts table
CREATE TABLE public.service_facts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid UNIQUE REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  served_at date,
  return_filed_at date,
  service_method text,
  served_to text,
  server_name text,
  source_extraction_id uuid REFERENCES public.document_extractions(id),
  user_confirmed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 2) RLS (join through cases, same pattern)
ALTER TABLE public.service_facts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own service facts"
  ON public.service_facts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = service_facts.case_id AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own service facts"
  ON public.service_facts FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = service_facts.case_id AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own service facts"
  ON public.service_facts FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = service_facts.case_id AND cases.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = service_facts.case_id AND cases.user_id = auth.uid()
  ));

-- 3) Add confirm_service_facts task to seed + unlock chain

CREATE OR REPLACE FUNCTION public.seed_case_tasks()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
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

  INSERT INTO public.task_events (case_id, kind, payload)
  VALUES (NEW.id, 'case_created', jsonb_build_object(
    'role', NEW.role,
    'county', NEW.county,
    'court_type', NEW.court_type
  ));

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.unlock_next_task()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.task_key = 'welcome' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks
    SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'intake' AND status = 'locked';

    INSERT INTO public.task_events (case_id, task_id, kind, payload)
    VALUES (NEW.case_id, (
      SELECT id FROM public.tasks WHERE case_id = NEW.case_id AND task_key = 'intake'
    ), 'task_unlocked', jsonb_build_object('task_key', 'intake'));
  END IF;

  IF NEW.task_key = 'intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks
    SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'evidence_vault' AND status = 'locked';

    INSERT INTO public.task_events (case_id, task_id, kind, payload)
    VALUES (NEW.case_id, (
      SELECT id FROM public.tasks WHERE case_id = NEW.case_id AND task_key = 'evidence_vault'
    ), 'task_unlocked', jsonb_build_object('task_key', 'evidence_vault'));
  END IF;

  IF NEW.task_key = 'evidence_vault' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks
    SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'preservation_letter' AND status = 'locked';

    INSERT INTO public.task_events (case_id, task_id, kind, payload)
    VALUES (NEW.case_id, (
      SELECT id FROM public.tasks WHERE case_id = NEW.case_id AND task_key = 'preservation_letter'
    ), 'task_unlocked', jsonb_build_object('task_key', 'preservation_letter'));
  END IF;

  IF NEW.task_key = 'preservation_letter' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks
    SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'upload_return_of_service' AND status = 'locked';

    INSERT INTO public.task_events (case_id, task_id, kind, payload)
    VALUES (NEW.case_id, (
      SELECT id FROM public.tasks WHERE case_id = NEW.case_id AND task_key = 'upload_return_of_service'
    ), 'task_unlocked', jsonb_build_object('task_key', 'upload_return_of_service'));
  END IF;

  -- When upload_return_of_service is completed, unlock confirm_service_facts
  IF NEW.task_key = 'upload_return_of_service' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks
    SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'confirm_service_facts' AND status = 'locked';

    INSERT INTO public.task_events (case_id, task_id, kind, payload)
    VALUES (NEW.case_id, (
      SELECT id FROM public.tasks WHERE case_id = NEW.case_id AND task_key = 'confirm_service_facts'
    ), 'task_unlocked', jsonb_build_object('task_key', 'confirm_service_facts'));
  END IF;

  RETURN NEW;
END;
$$;

-- 4) Backfill: add confirm_service_facts task to existing cases
INSERT INTO public.tasks (case_id, task_key, title, status)
SELECT c.id, 'confirm_service_facts', 'Confirm Service Details', 'locked'
FROM public.cases c
WHERE NOT EXISTS (
  SELECT 1 FROM public.tasks t
  WHERE t.case_id = c.id AND t.task_key = 'confirm_service_facts'
);

-- Unlock for cases where upload_return_of_service is already completed
UPDATE public.tasks AS t
SET status = 'todo', unlocked_at = now()
FROM public.tasks AS prev
WHERE t.task_key = 'confirm_service_facts'
  AND t.status = 'locked'
  AND prev.case_id = t.case_id
  AND prev.task_key = 'upload_return_of_service'
  AND prev.status = 'completed';
