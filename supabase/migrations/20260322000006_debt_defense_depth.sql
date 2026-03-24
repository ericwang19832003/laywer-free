-- Add new depth tasks to debt defense workflow:
--   fdcpa_check (after debt_defense_intake)
--   debt_sol_check (after fdcpa_check)
--   debt_answer_prep (after prepare_debt_defense_answer, before debt_file_with_court)
--
-- Also add new LT depth tasks:
--   lt_repair_request (after landlord_tenant_intake, before evidence_vault — for repair cases)
--   lt_eviction_response (after landlord_tenant_intake — for eviction cases)
--   lt_habitability_checklist (after lt_repair_request — for habitability cases)

-- ============================================================
-- Update seed_case_tasks() to insert new debt defense tasks
-- ============================================================
CREATE OR REPLACE FUNCTION public.seed_debt_depth_tasks()
RETURNS TRIGGER AS $$
BEGIN
  -- Only run for debt_collection defendant cases
  IF NEW.dispute_type = 'debt_collection' AND NEW.role = 'defendant' THEN
    -- Insert new depth tasks (locked, will be unlocked by trigger chain)
    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'fdcpa_check', 'Check for Collector Violations', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'debt_sol_check', 'Check Statute of Limitations', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'debt_answer_prep', 'Prepare Your Answer Strategy', 'locked');
  END IF;

  -- Landlord-tenant depth tasks
  IF NEW.dispute_type = 'landlord_tenant' THEN
    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'lt_repair_request', 'Request Repairs from Landlord', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'lt_eviction_response', 'Respond to Eviction Notice', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'lt_habitability_checklist', 'Document Habitability Issues', 'locked');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger (runs AFTER the existing seed_case_tasks trigger)
DROP TRIGGER IF EXISTS seed_depth_tasks_trigger ON public.cases;
CREATE TRIGGER seed_depth_tasks_trigger
  AFTER INSERT ON public.cases
  FOR EACH ROW
  EXECUTE FUNCTION public.seed_debt_depth_tasks();

-- ============================================================
-- Add unlock transitions for new debt defense tasks
-- ============================================================
CREATE OR REPLACE FUNCTION public.unlock_depth_tasks()
RETURNS TRIGGER AS $$
BEGIN
  -- Debt defense depth chain:
  -- debt_defense_intake → fdcpa_check → debt_sol_check
  -- prepare_debt_defense_answer → debt_answer_prep

  IF NEW.task_key = 'debt_defense_intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'fdcpa_check' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'fdcpa_check' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'debt_sol_check' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'prepare_debt_defense_answer' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'debt_answer_prep' AND status = 'locked';
  END IF;

  -- Landlord-tenant depth chain:
  -- landlord_tenant_intake → lt_repair_request, lt_eviction_response, lt_habitability_checklist
  -- (all three unlock after intake — user picks the relevant one)

  IF NEW.task_key = 'landlord_tenant_intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key IN ('lt_repair_request', 'lt_eviction_response', 'lt_habitability_checklist') AND status = 'locked';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS unlock_depth_tasks_trigger ON public.tasks;
CREATE TRIGGER unlock_depth_tasks_trigger
  AFTER UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.unlock_depth_tasks();
