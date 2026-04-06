-- ============================================
-- Federal Removal Response: Add removal tasks & doc types
-- ============================================

-- 1) Expand court_documents doc_type CHECK
ALTER TABLE public.court_documents
  DROP CONSTRAINT IF EXISTS court_documents_doc_type_check;

ALTER TABLE public.court_documents
  ADD CONSTRAINT court_documents_doc_type_check
  CHECK (doc_type IN (
    'return_of_service', 'petition', 'answer', 'general_denial',
    'amended_complaint', 'motion_to_remand'
  ));

-- 2) Update seed_case_tasks to include removal tasks
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

  INSERT INTO public.task_events (case_id, kind, payload)
  VALUES (NEW.id, 'case_created', jsonb_build_object(
    'role', NEW.role,
    'county', NEW.county,
    'court_type', NEW.court_type
  ));

  RETURN NEW;
END;
$$;

-- 3) Backfill existing cases with new removal tasks
DO $$
DECLARE
  task_keys text[] := ARRAY[
    'understand_removal',
    'choose_removal_strategy',
    'prepare_amended_complaint',
    'file_amended_complaint',
    'prepare_remand_motion',
    'file_remand_motion',
    'rule_26f_prep',
    'mandatory_disclosures'
  ];
  task_titles text[] := ARRAY[
    'Understand the Removal',
    'Choose Your Response Strategy',
    'Prepare First Amended Complaint',
    'File Your Amended Complaint',
    'Prepare Motion to Remand',
    'File Your Motion to Remand',
    'Prepare for Rule 26(f) Conference',
    'Complete Mandatory Disclosures'
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
