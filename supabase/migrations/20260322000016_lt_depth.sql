-- Landlord-tenant depth: security deposit, repair-and-deduct, lockout, courthouse guides
CREATE OR REPLACE FUNCTION public.seed_lt_depth_tasks()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.dispute_type = 'landlord_tenant' THEN
    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES
      (NEW.id, 'lt_security_deposit_demand', 'Getting Your Security Deposit Back', 'locked'),
      (NEW.id, 'lt_repair_and_deduct', 'Repair-and-Deduct from Rent', 'locked'),
      (NEW.id, 'lt_illegal_lockout', 'Illegal Lockout Defense', 'locked'),
      (NEW.id, 'lt_eviction_notice_analysis', 'Analyze Your Eviction Notice', 'locked'),
      (NEW.id, 'lt_jp_court_procedures', 'JP Court Procedures', 'locked'),
      (NEW.id, 'lt_lease_termination', 'Ending Your Lease Early', 'locked'),
      (NEW.id, 'lt_courtroom_guide', 'What to Expect at Your Hearing', 'locked'),
      (NEW.id, 'lt_appeal_guide', 'Appealing an Eviction Judgment', 'locked'),
      (NEW.id, 'lt_writ_of_possession', 'Writ of Possession — If You Lose', 'locked');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS seed_lt_depth_tasks_trigger ON public.cases;
CREATE TRIGGER seed_lt_depth_tasks_trigger
  AFTER INSERT ON public.cases
  FOR EACH ROW
  EXECUTE FUNCTION public.seed_lt_depth_tasks();

CREATE OR REPLACE FUNCTION public.unlock_lt_depth_tasks()
RETURNS TRIGGER AS $$
DECLARE v_dt text;
BEGIN
  SELECT dispute_type INTO v_dt FROM public.cases WHERE id = NEW.case_id;
  IF v_dt != 'landlord_tenant' THEN RETURN NEW; END IF;

  -- After intake: unlock based on sub-type
  IF NEW.task_key = 'landlord_tenant_intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id
      AND task_key IN ('lt_security_deposit_demand', 'lt_illegal_lockout', 'lt_eviction_notice_analysis', 'lt_lease_termination')
      AND status = 'locked';
  END IF;

  -- After repair request: unlock repair-and-deduct
  IF NEW.task_key = 'lt_repair_request' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'lt_repair_and_deduct' AND status = 'locked';
  END IF;

  -- After filing: unlock JP court procedures
  IF NEW.task_key = 'lt_file_with_court' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'lt_jp_court_procedures' AND status = 'locked';
  END IF;

  -- After hearing prep: unlock courtroom guide
  IF NEW.task_key = 'lt_prepare_for_hearing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'lt_courtroom_guide' AND status = 'locked';
  END IF;

  -- After hearing day: unlock appeal + writ guides
  IF NEW.task_key = 'lt_hearing_day' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key IN ('lt_appeal_guide', 'lt_writ_of_possession') AND status = 'locked';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS unlock_lt_depth_tasks_trigger ON public.tasks;
CREATE TRIGGER unlock_lt_depth_tasks_trigger
  AFTER UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.unlock_lt_depth_tasks();
