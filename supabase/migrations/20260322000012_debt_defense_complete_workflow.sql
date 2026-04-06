-- Complete the debt defense workflow with all remaining guided steps
-- These close the final 10-15% gap for true pro se litigants
CREATE OR REPLACE FUNCTION public.seed_complete_debt_tasks()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.dispute_type = 'debt_collection' AND NEW.role = 'defendant' THEN
    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES
      (NEW.id, 'fdcpa_counterclaim_guide', 'File a Counterclaim for Violations', 'locked'),
      (NEW.id, 'debt_motion_to_dismiss', 'File a Motion to Dismiss', 'locked'),
      (NEW.id, 'debt_default_recovery', 'Missed Your Deadline? Recovery Options', 'locked'),
      (NEW.id, 'debt_settlement_guide', 'Negotiating a Settlement', 'locked'),
      (NEW.id, 'debt_validation_response', 'Review Validation Letter Response', 'locked'),
      (NEW.id, 'debt_evidence_rules', 'Evidence Rules You Need to Know', 'locked'),
      (NEW.id, 'debt_continuance_request', 'Request More Time (Continuance)', 'locked'),
      (NEW.id, 'debt_witness_prep', 'Preparing Your Witnesses', 'locked'),
      (NEW.id, 'debt_credit_dispute', 'Cleaning Up Your Credit Report', 'locked');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS seed_complete_debt_tasks_trigger ON public.cases;
CREATE TRIGGER seed_complete_debt_tasks_trigger
  AFTER INSERT ON public.cases
  FOR EACH ROW
  EXECUTE FUNCTION public.seed_complete_debt_tasks();

-- Unlock logic for new tasks
CREATE OR REPLACE FUNCTION public.unlock_complete_debt_tasks()
RETURNS TRIGGER AS $$
BEGIN
  -- Counterclaim unlocks after FDCPA check (only useful if violations found)
  IF NEW.task_key = 'fdcpa_check' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'fdcpa_counterclaim_guide' AND status = 'locked';
  END IF;

  -- Validation response unlocks after validation letter is sent
  IF NEW.task_key = 'prepare_debt_validation_letter' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'debt_validation_response' AND status = 'locked';
  END IF;

  -- Motion to dismiss unlocks after answer is filed
  IF NEW.task_key = 'debt_file_with_court' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key IN ('debt_motion_to_dismiss', 'debt_settlement_guide') AND status = 'locked';
  END IF;

  -- Evidence rules + witness prep + continuance unlock with hearing prep
  IF NEW.task_key = 'debt_hearing_prep' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key IN ('debt_evidence_rules', 'debt_continuance_request', 'debt_witness_prep') AND status = 'locked';
  END IF;

  -- Credit dispute unlocks after hearing day
  IF NEW.task_key = 'debt_hearing_day' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'debt_credit_dispute' AND status = 'locked';
  END IF;

  -- Default recovery is ALWAYS unlocked (emergency path) - unlock immediately on case creation
  -- This is handled by setting it to 'todo' directly in seed function instead of 'locked'
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS unlock_complete_debt_tasks_trigger ON public.tasks;
CREATE TRIGGER unlock_complete_debt_tasks_trigger
  AFTER UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.unlock_complete_debt_tasks();

-- Default recovery should be immediately available (not locked) - emergency path
-- Update the seed function to make it 'todo' instead of 'locked'
CREATE OR REPLACE FUNCTION public.seed_complete_debt_tasks()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.dispute_type = 'debt_collection' AND NEW.role = 'defendant' THEN
    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES
      (NEW.id, 'fdcpa_counterclaim_guide', 'File a Counterclaim for Violations', 'locked'),
      (NEW.id, 'debt_motion_to_dismiss', 'File a Motion to Dismiss', 'locked'),
      (NEW.id, 'debt_default_recovery', 'Missed Your Deadline? Recovery Options', 'todo'),
      (NEW.id, 'debt_settlement_guide', 'Negotiating a Settlement', 'locked'),
      (NEW.id, 'debt_validation_response', 'Review Validation Letter Response', 'locked'),
      (NEW.id, 'debt_evidence_rules', 'Evidence Rules You Need to Know', 'locked'),
      (NEW.id, 'debt_continuance_request', 'Request More Time (Continuance)', 'locked'),
      (NEW.id, 'debt_witness_prep', 'Preparing Your Witnesses', 'locked'),
      (NEW.id, 'debt_credit_dispute', 'Cleaning Up Your Credit Report', 'locked');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
