-- Family law depth: add courthouse-phase and strategy guided steps
CREATE OR REPLACE FUNCTION public.seed_family_depth_tasks()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.dispute_type = 'family' THEN
    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES
      (NEW.id, 'family_uncontested_path', 'Uncontested Divorce — Fast Track', 'locked'),
      (NEW.id, 'family_custody_factors', 'Understanding Custody Decisions', 'locked'),
      (NEW.id, 'family_property_division_guide', 'Dividing Property and Debts', 'locked'),
      (NEW.id, 'family_discovery_guide', 'Discovery — Getting Information', 'locked'),
      (NEW.id, 'family_temp_orders_prep', 'Preparing for Temporary Orders', 'locked'),
      (NEW.id, 'family_filing_guide', 'How to File Your Papers', 'locked'),
      (NEW.id, 'family_service_guide', 'How to Serve the Other Party', 'locked'),
      (NEW.id, 'family_mediation_prep', 'Preparing for Mediation', 'locked'),
      (NEW.id, 'family_courtroom_guide', 'What to Expect in Court', 'locked'),
      (NEW.id, 'family_post_judgment_guide', 'After the Court''s Decision', 'locked');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS seed_family_depth_tasks_trigger ON public.cases;
CREATE TRIGGER seed_family_depth_tasks_trigger
  AFTER INSERT ON public.cases
  FOR EACH ROW
  EXECUTE FUNCTION public.seed_family_depth_tasks();

-- Unlock family depth tasks at appropriate workflow points
CREATE OR REPLACE FUNCTION public.unlock_family_depth_tasks()
RETURNS TRIGGER AS $$
DECLARE
  v_dispute_type text;
BEGIN
  SELECT dispute_type INTO v_dispute_type FROM public.cases WHERE id = NEW.case_id;
  IF v_dispute_type != 'family' THEN RETURN NEW; END IF;

  -- After intake: unlock uncontested path, custody factors, property division
  IF NEW.task_key LIKE '%_intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id
      AND task_key IN ('family_uncontested_path', 'family_custody_factors', 'family_property_division_guide')
      AND status = 'locked';
  END IF;

  -- After evidence vault: unlock discovery and temp orders prep
  IF NEW.task_key = 'evidence_vault' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id
      AND task_key IN ('family_discovery_guide', 'family_temp_orders_prep')
      AND status = 'locked';
  END IF;

  -- After filing prep: unlock filing guide and service guide
  IF NEW.task_key LIKE '%prepare_filing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id
      AND task_key IN ('family_filing_guide', 'family_service_guide')
      AND status = 'locked';
  END IF;

  -- After mediation step starts: unlock mediation prep
  IF NEW.task_key LIKE '%mediation' AND NEW.status = 'todo' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'family_mediation_prep' AND status = 'locked';
  END IF;

  -- After mediation: unlock courtroom guide
  IF NEW.task_key LIKE '%mediation' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'family_courtroom_guide' AND status = 'locked';
  END IF;

  -- After final orders: unlock post-judgment
  IF NEW.task_key LIKE '%final_orders' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'family_post_judgment_guide' AND status = 'locked';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS unlock_family_depth_tasks_trigger ON public.tasks;
CREATE TRIGGER unlock_family_depth_tasks_trigger
  AFTER UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.unlock_family_depth_tasks();
