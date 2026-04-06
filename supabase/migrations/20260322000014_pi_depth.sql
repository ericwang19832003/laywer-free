-- Personal injury depth: courthouse-phase and strategy guided steps
CREATE OR REPLACE FUNCTION public.seed_pi_depth_tasks()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.dispute_type = 'personal_injury' THEN
    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES
      (NEW.id, 'pi_pip_claim', 'File Your PIP Insurance Claim', 'locked'),
      (NEW.id, 'pi_medical_improvement', 'When to Settle — Medical Improvement', 'locked'),
      (NEW.id, 'pi_damages_calculation', 'Calculating Your Damages', 'locked'),
      (NEW.id, 'pi_comparative_fault', 'Understanding Comparative Fault', 'locked'),
      (NEW.id, 'pi_filing_guide', 'How to File Your Lawsuit', 'locked'),
      (NEW.id, 'pi_service_guide', 'How to Serve the Defendant', 'locked'),
      (NEW.id, 'pi_expert_witness_guide', 'Do You Need Expert Witnesses?', 'locked'),
      (NEW.id, 'pi_courtroom_guide', 'What to Expect at Trial', 'locked'),
      (NEW.id, 'pi_lien_resolution', 'Resolving Medical Liens', 'locked');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS seed_pi_depth_tasks_trigger ON public.cases;
CREATE TRIGGER seed_pi_depth_tasks_trigger
  AFTER INSERT ON public.cases
  FOR EACH ROW
  EXECUTE FUNCTION public.seed_pi_depth_tasks();

CREATE OR REPLACE FUNCTION public.unlock_pi_depth_tasks()
RETURNS TRIGGER AS $$
DECLARE
  v_dispute_type text;
BEGIN
  SELECT dispute_type INTO v_dispute_type FROM public.cases WHERE id = NEW.case_id;
  IF v_dispute_type != 'personal_injury' THEN RETURN NEW; END IF;

  -- After intake: unlock PIP claim + comparative fault
  IF NEW.task_key = 'pi_intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key IN ('pi_pip_claim', 'pi_comparative_fault') AND status = 'locked';
  END IF;

  -- After medical records: unlock MMI timing
  IF NEW.task_key = 'pi_medical_records' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_medical_improvement' AND status = 'locked';
  END IF;

  -- After insurance communication: unlock damages calculation
  IF NEW.task_key = 'pi_insurance_communication' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_damages_calculation' AND status = 'locked';
  END IF;

  -- After petition prep: unlock filing + service guides
  IF NEW.task_key = 'prepare_pi_petition' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key IN ('pi_filing_guide', 'pi_service_guide', 'pi_expert_witness_guide') AND status = 'locked';
  END IF;

  -- After trial prep: unlock courtroom guide
  IF NEW.task_key = 'pi_trial_prep' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_courtroom_guide' AND status = 'locked';
  END IF;

  -- After post-resolution starts: unlock lien resolution
  IF NEW.task_key = 'pi_post_resolution' AND NEW.status = 'todo' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_lien_resolution' AND status = 'locked';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS unlock_pi_depth_tasks_trigger ON public.tasks;
CREATE TRIGGER unlock_pi_depth_tasks_trigger
  AFTER UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.unlock_pi_depth_tasks();
