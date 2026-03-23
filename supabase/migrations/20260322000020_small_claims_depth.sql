-- Small claims depth: JP court guides, evidence, settlement, post-judgment
CREATE OR REPLACE FUNCTION public.seed_sc_depth_tasks()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.dispute_type = 'small_claims' THEN
    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES
      (NEW.id, 'sc_jp_court_guide', 'Texas JP Court — What You Need to Know', 'locked'),
      (NEW.id, 'sc_damages_by_type', 'Calculating Your Damages', 'locked'),
      (NEW.id, 'sc_evidence_rules', 'Evidence Rules in Small Claims', 'locked'),
      (NEW.id, 'sc_filing_guide', 'How to File Your Case', 'locked'),
      (NEW.id, 'sc_service_guide', 'How to Serve the Other Party', 'locked'),
      (NEW.id, 'sc_settlement_guide', 'Settling Before Trial', 'locked'),
      (NEW.id, 'sc_default_judgment', 'Default Judgment Procedures', 'locked'),
      (NEW.id, 'sc_counterclaim_defense', 'Responding to a Counterclaim', 'locked'),
      (NEW.id, 'sc_courtroom_guide', 'What to Expect at Your Hearing', 'locked'),
      (NEW.id, 'sc_post_judgment_guide', 'After the Judge''s Decision', 'locked'),
      (NEW.id, 'sc_appeal_guide', 'Appealing a Decision', 'locked');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS seed_sc_depth_tasks_trigger ON public.cases;
CREATE TRIGGER seed_sc_depth_tasks_trigger
  AFTER INSERT ON public.cases
  FOR EACH ROW
  EXECUTE FUNCTION public.seed_sc_depth_tasks();

CREATE OR REPLACE FUNCTION public.unlock_sc_depth_tasks()
RETURNS TRIGGER AS $$
DECLARE v_dt text;
BEGIN
  SELECT dispute_type INTO v_dt FROM public.cases WHERE id = NEW.case_id;
  IF v_dt != 'small_claims' THEN RETURN NEW; END IF;

  -- After intake: unlock JP court guide + damages + default judgment
  IF NEW.task_key = 'small_claims_intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id
      AND task_key IN ('sc_jp_court_guide', 'sc_damages_by_type', 'sc_default_judgment')
      AND status = 'locked';
  END IF;

  -- After demand letter: unlock settlement + evidence rules
  IF NEW.task_key = 'sc_demand_letter' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id
      AND task_key IN ('sc_settlement_guide', 'sc_evidence_rules')
      AND status = 'locked';
  END IF;

  -- After filing: unlock filing guide + service guide
  IF NEW.task_key = 'prepare_small_claims_filing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id
      AND task_key IN ('sc_filing_guide', 'sc_service_guide')
      AND status = 'locked';
  END IF;

  -- After service: unlock counterclaim defense
  IF NEW.task_key = 'sc_serve_defendant' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'sc_counterclaim_defense' AND status = 'locked';
  END IF;

  -- After hearing prep: unlock courtroom guide
  IF NEW.task_key = 'sc_prepare_for_hearing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'sc_courtroom_guide' AND status = 'locked';
  END IF;

  -- After hearing day: unlock post-judgment + appeal
  IF NEW.task_key = 'sc_hearing_day' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id
      AND task_key IN ('sc_post_judgment_guide', 'sc_appeal_guide')
      AND status = 'locked';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS unlock_sc_depth_tasks_trigger ON public.tasks;
CREATE TRIGGER unlock_sc_depth_tasks_trigger
  AFTER UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.unlock_sc_depth_tasks();
