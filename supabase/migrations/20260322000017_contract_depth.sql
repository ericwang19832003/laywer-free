-- Contract dispute depth: legal analysis + courthouse + enforcement
CREATE OR REPLACE FUNCTION public.seed_contract_depth_tasks()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.dispute_type = 'contract' THEN
    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES
      (NEW.id, 'contract_breach_analysis', 'Is This a Material Breach?', 'locked'),
      (NEW.id, 'contract_statute_of_frauds', 'Does Your Contract Need Writing?', 'locked'),
      (NEW.id, 'contract_damages_methods', 'Calculating Your Damages', 'locked'),
      (NEW.id, 'contract_provisions_check', 'Check Key Contract Clauses', 'locked'),
      (NEW.id, 'contract_defenses_guide', 'Anticipate Their Defenses', 'locked'),
      (NEW.id, 'contract_filing_guide', 'How to File Your Lawsuit', 'locked'),
      (NEW.id, 'contract_service_guide', 'How to Serve the Other Party', 'locked'),
      (NEW.id, 'contract_settlement_guide', 'Negotiating a Settlement', 'locked'),
      (NEW.id, 'contract_courtroom_guide', 'What to Expect at Trial', 'locked'),
      (NEW.id, 'contract_post_judgment_guide', 'After the Court''s Decision', 'locked');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS seed_contract_depth_tasks_trigger ON public.cases;
CREATE TRIGGER seed_contract_depth_tasks_trigger
  AFTER INSERT ON public.cases
  FOR EACH ROW
  EXECUTE FUNCTION public.seed_contract_depth_tasks();

CREATE OR REPLACE FUNCTION public.unlock_contract_depth_tasks()
RETURNS TRIGGER AS $$
DECLARE v_dt text;
BEGIN
  SELECT dispute_type INTO v_dt FROM public.cases WHERE id = NEW.case_id;
  IF v_dt != 'contract' THEN RETURN NEW; END IF;

  -- After intake: unlock legal analysis steps
  IF NEW.task_key = 'contract_intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id
      AND task_key IN ('contract_breach_analysis', 'contract_statute_of_frauds', 'contract_provisions_check')
      AND status = 'locked';
  END IF;

  -- After demand letter: unlock damages + defenses
  IF NEW.task_key = 'contract_demand_letter' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id
      AND task_key IN ('contract_damages_methods', 'contract_defenses_guide')
      AND status = 'locked';
  END IF;

  -- After filing prep: unlock filing + service + settlement
  IF NEW.task_key = 'contract_prepare_filing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id
      AND task_key IN ('contract_filing_guide', 'contract_service_guide', 'contract_settlement_guide')
      AND status = 'locked';
  END IF;

  -- After mediation: unlock courtroom guide
  IF NEW.task_key = 'contract_mediation' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'contract_courtroom_guide' AND status = 'locked';
  END IF;

  -- After post-resolution: unlock post-judgment guide
  IF NEW.task_key = 'contract_post_resolution' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'contract_post_judgment_guide' AND status = 'locked';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS unlock_contract_depth_tasks_trigger ON public.tasks;
CREATE TRIGGER unlock_contract_depth_tasks_trigger
  AFTER UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.unlock_contract_depth_tasks();
