-- ============================================
-- Motion Builder: motions table + seed tasks
-- ============================================

-- 1) Utility: handle_updated_at trigger function
--    Reusable for any table with an updated_at column.
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2) Motions table for storing user-generated motions
CREATE TABLE public.motions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id     uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL DEFAULT auth.uid(),
  motion_type text NOT NULL,
  status      text NOT NULL DEFAULT 'draft'
                CHECK (status IN ('draft','finalized','filed')),
  facts       jsonb NOT NULL DEFAULT '{}',
  draft_text  text,
  final_text  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 3) RLS
ALTER TABLE public.motions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own motions"
  ON public.motions
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 4) Index for listing motions by case
CREATE INDEX idx_motions_case_id ON public.motions(case_id);

-- 5) Updated_at trigger
CREATE TRIGGER set_motions_updated_at
  BEFORE UPDATE ON public.motions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 6) Update seed_case_tasks to include motion-related tasks
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

  -- Filing tasks
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

  -- Federal removal response tasks (gatekeeper-managed)
  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'understand_removal', 'Understand the Removal', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'choose_removal_strategy', 'Choose Your Response Strategy', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'prepare_amended_complaint', 'Prepare First Amended Complaint', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'file_amended_complaint', 'File Your Amended Complaint', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'prepare_remand_motion', 'Prepare Motion to Remand', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'file_remand_motion', 'File Your Motion to Remand', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'rule_26f_prep', 'Prepare for Rule 26(f) Conference', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'mandatory_disclosures', 'Complete Mandatory Disclosures', 'locked');

  -- Motion builder tasks (gatekeeper-managed)
  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'motion_to_compel', 'Motion to Compel Discovery', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'trial_prep_checklist', 'Trial Preparation Checklist', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'appellate_brief', 'Appellate Brief', 'locked');

  INSERT INTO public.task_events (case_id, kind, payload)
  VALUES (NEW.id, 'case_created', jsonb_build_object(
    'role', NEW.role,
    'county', NEW.county,
    'court_type', NEW.court_type
  ));

  RETURN NEW;
END;
$$;

-- 7) Backfill existing cases with new motion tasks
DO $$
DECLARE
  task_keys text[] := ARRAY[
    'motion_to_compel',
    'trial_prep_checklist',
    'appellate_brief'
  ];
  task_titles text[] := ARRAY[
    'Motion to Compel Discovery',
    'Trial Preparation Checklist',
    'Appellate Brief'
  ];
  i int;
BEGIN
  FOR i IN 1..array_length(task_keys, 1) LOOP
    INSERT INTO public.tasks (case_id, task_key, title, status)
    SELECT c.id, task_keys[i], task_titles[i], 'locked'
    FROM public.cases c
    WHERE NOT EXISTS (
      SELECT 1 FROM public.tasks t
      WHERE t.case_id = c.id AND t.task_key = task_keys[i]
    );
  END LOOP;
END;
$$;
