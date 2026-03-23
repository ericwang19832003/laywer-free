-- Business dispute depth: shared courthouse guides + sub-type-specific legal analysis
CREATE OR REPLACE FUNCTION public.seed_business_depth_tasks()
RETURNS TRIGGER AS $$
DECLARE
  v_sub_type text;
BEGIN
  IF NEW.dispute_type = 'business' THEN
    -- Get business sub-type
    SELECT business_sub_type INTO v_sub_type
    FROM public.business_details WHERE case_id = NEW.id;

    -- Shared tasks for ALL business sub-types
    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES
      (NEW.id, 'biz_service_guide', 'How to Serve a Business Entity', 'locked'),
      (NEW.id, 'biz_discovery_guide', 'Discovery in Business Disputes', 'locked'),
      (NEW.id, 'biz_courtroom_guide', 'What to Expect at Trial', 'locked');

    -- Sub-type-specific tasks
    IF v_sub_type = 'employment' THEN
      INSERT INTO public.tasks (case_id, task_key, title, status)
      VALUES
        (NEW.id, 'biz_wrongful_termination', 'Was Your Termination Illegal?', 'locked'),
        (NEW.id, 'biz_wage_theft', 'Recovering Unpaid Wages', 'locked'),
        (NEW.id, 'biz_non_compete', 'Non-Compete Agreement Analysis', 'locked');
    ELSIF v_sub_type = 'b2b_commercial' THEN
      INSERT INTO public.tasks (case_id, task_key, title, status)
      VALUES
        (NEW.id, 'biz_b2b_contract_breach', 'B2B Contract Breach Options', 'locked'),
        (NEW.id, 'biz_b2b_trade_secrets', 'Protecting Your Trade Secrets', 'locked');
    ELSIF v_sub_type = 'partnership' THEN
      INSERT INTO public.tasks (case_id, task_key, title, status)
      VALUES
        (NEW.id, 'biz_partnership_fiduciary', 'Partnership Fiduciary Duty Claims', 'locked'),
        (NEW.id, 'biz_partnership_accounting', 'Accounting & Profit Disputes', 'locked');
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS seed_business_depth_tasks_trigger ON public.cases;
CREATE TRIGGER seed_business_depth_tasks_trigger
  AFTER INSERT ON public.cases
  FOR EACH ROW
  EXECUTE FUNCTION public.seed_business_depth_tasks();

CREATE OR REPLACE FUNCTION public.unlock_business_depth_tasks()
RETURNS TRIGGER AS $$
DECLARE v_dt text;
BEGIN
  SELECT dispute_type INTO v_dt FROM public.cases WHERE id = NEW.case_id;
  IF v_dt != 'business' THEN RETURN NEW; END IF;

  -- After intake: unlock sub-type-specific analysis steps
  IF NEW.task_key LIKE 'biz_%_intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id
      AND task_key IN ('biz_wrongful_termination', 'biz_wage_theft', 'biz_non_compete',
                       'biz_b2b_contract_breach', 'biz_b2b_trade_secrets',
                       'biz_partnership_fiduciary', 'biz_partnership_accounting')
      AND status = 'locked';
  END IF;

  -- After filing prep: unlock service guide
  IF NEW.task_key LIKE 'biz_%_prepare_filing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_service_guide' AND status = 'locked';
  END IF;

  -- After discovery starts: unlock discovery guide
  IF NEW.task_key LIKE 'biz_%_discovery' AND NEW.status = 'todo' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_discovery_guide' AND status = 'locked';
  END IF;

  -- After ADR/mediation: unlock courtroom guide
  IF NEW.task_key LIKE 'biz_%_adr' OR NEW.task_key LIKE 'biz_%_negotiation' THEN
    IF NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'biz_courtroom_guide' AND status = 'locked';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS unlock_business_depth_tasks_trigger ON public.tasks;
CREATE TRIGGER unlock_business_depth_tasks_trigger
  AFTER UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.unlock_business_depth_tasks();
