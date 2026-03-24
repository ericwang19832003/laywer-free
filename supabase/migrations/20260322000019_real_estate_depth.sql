-- Real estate depth: title, disclosure, construction, courthouse guides
CREATE OR REPLACE FUNCTION public.seed_re_depth_tasks()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.dispute_type = 'real_estate' THEN
    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES
      (NEW.id, 're_title_defect_analysis', 'Understanding Your Title Defect', 'locked'),
      (NEW.id, 're_seller_disclosure', 'Seller Disclosure Violations', 'locked'),
      (NEW.id, 're_earnest_money', 'Earnest Money Disputes', 'locked'),
      (NEW.id, 're_construction_defect', 'Construction Defect Claims (RCLA)', 'locked'),
      (NEW.id, 're_failed_closing', 'Failed Closing Remedies', 'locked'),
      (NEW.id, 're_adverse_possession', 'Adverse Possession & Boundary Disputes', 'locked'),
      (NEW.id, 're_filing_guide', 'How to File Your RE Lawsuit', 'locked'),
      (NEW.id, 're_service_guide', 'How to Serve in RE Cases', 'locked'),
      (NEW.id, 're_discovery_guide', 'Discovery for Real Estate', 'locked'),
      (NEW.id, 're_courtroom_guide', 'What to Expect at Trial', 'locked'),
      (NEW.id, 're_post_judgment_guide', 'After the Court''s Decision', 'locked');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS seed_re_depth_tasks_trigger ON public.cases;
CREATE TRIGGER seed_re_depth_tasks_trigger
  AFTER INSERT ON public.cases
  FOR EACH ROW
  EXECUTE FUNCTION public.seed_re_depth_tasks();

CREATE OR REPLACE FUNCTION public.unlock_re_depth_tasks()
RETURNS TRIGGER AS $$
DECLARE v_dt text;
BEGIN
  SELECT dispute_type INTO v_dt FROM public.cases WHERE id = NEW.case_id;
  IF v_dt != 'real_estate' THEN RETURN NEW; END IF;

  -- After intake: unlock sub-type analysis steps
  IF NEW.task_key = 're_intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id
      AND task_key IN ('re_title_defect_analysis', 're_seller_disclosure', 're_earnest_money',
                       're_construction_defect', 're_failed_closing', 're_adverse_possession')
      AND status = 'locked';
  END IF;

  -- After filing prep: unlock filing + service
  IF NEW.task_key = 're_prepare_filing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key IN ('re_filing_guide', 're_service_guide') AND status = 'locked';
  END IF;

  -- After discovery step starts: unlock discovery guide
  IF NEW.task_key = 're_discovery' AND NEW.status = 'todo' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 're_discovery_guide' AND status = 'locked';
  END IF;

  -- After negotiation: unlock courtroom guide
  IF NEW.task_key = 're_negotiation' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 're_courtroom_guide' AND status = 'locked';
  END IF;

  -- After post-resolution: unlock post-judgment guide
  IF NEW.task_key = 're_post_resolution' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 're_post_judgment_guide' AND status = 'locked';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS unlock_re_depth_tasks_trigger ON public.tasks;
CREATE TRIGGER unlock_re_depth_tasks_trigger
  AFTER UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.unlock_re_depth_tasks();
