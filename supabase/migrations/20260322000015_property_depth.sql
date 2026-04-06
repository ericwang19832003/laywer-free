-- Property damage depth: courthouse-phase and strategy guided steps
CREATE OR REPLACE FUNCTION public.seed_property_depth_tasks()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.dispute_type = 'property' THEN
    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES
      (NEW.id, 'property_damage_assessment', 'Document Your Property Damage', 'locked'),
      (NEW.id, 'property_insurance_guide', 'File an Insurance Claim', 'locked'),
      (NEW.id, 'property_damages_guide', 'Calculate Your Total Damages', 'locked'),
      (NEW.id, 'property_filing_guide', 'How to File Your Lawsuit', 'locked'),
      (NEW.id, 'property_service_guide', 'How to Serve the Other Party', 'locked'),
      (NEW.id, 'property_pretrial_motions', 'Pretrial Motions', 'locked'),
      (NEW.id, 'property_mediation_guide', 'Preparing for Mediation', 'locked'),
      (NEW.id, 'property_courtroom_guide', 'What to Expect at Trial', 'locked'),
      (NEW.id, 'property_post_judgment_guide', 'After the Court''s Decision', 'locked');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS seed_property_depth_tasks_trigger ON public.cases;
CREATE TRIGGER seed_property_depth_tasks_trigger
  AFTER INSERT ON public.cases
  FOR EACH ROW
  EXECUTE FUNCTION public.seed_property_depth_tasks();

CREATE OR REPLACE FUNCTION public.unlock_property_depth_tasks()
RETURNS TRIGGER AS $$
DECLARE v_dt text;
BEGIN
  SELECT dispute_type INTO v_dt FROM public.cases WHERE id = NEW.case_id;
  IF v_dt != 'property' THEN RETURN NEW; END IF;

  -- After intake: unlock damage assessment + insurance
  IF NEW.task_key = 'property_intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key IN ('property_damage_assessment', 'property_insurance_guide') AND status = 'locked';
  END IF;

  -- After evidence vault: unlock damages calculation
  IF NEW.task_key = 'evidence_vault' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'property_damages_guide' AND status = 'locked';
  END IF;

  -- After filing prep: unlock filing + service guides
  IF NEW.task_key = 'property_prepare_filing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key IN ('property_filing_guide', 'property_service_guide') AND status = 'locked';
  END IF;

  -- After discovery: unlock pretrial motions + mediation
  IF NEW.task_key = 'property_discovery' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key IN ('property_pretrial_motions', 'property_mediation_guide') AND status = 'locked';
  END IF;

  -- After mediation: unlock courtroom guide
  IF NEW.task_key = 'property_mediation_guide' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'property_courtroom_guide' AND status = 'locked';
  END IF;

  -- After post-resolution: unlock post-judgment guide
  IF NEW.task_key = 'property_post_resolution' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'property_post_judgment_guide' AND status = 'locked';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS unlock_property_depth_tasks_trigger ON public.tasks;
CREATE TRIGGER unlock_property_depth_tasks_trigger
  AFTER UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.unlock_property_depth_tasks();
