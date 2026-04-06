-- PI lifecycle gap tasks: court selection, disclosures, pretrial prep, judgment guide
CREATE OR REPLACE FUNCTION public.seed_pi_lifecycle_gap_tasks()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.dispute_type = 'personal_injury' THEN
    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES
      (NEW.id, 'pi_court_selection', 'Choose the Right Court', 'locked'),
      (NEW.id, 'pi_disclosures_guide', 'Understanding Disclosure Obligations', 'locked'),
      (NEW.id, 'pi_pretrial_preparation', 'Pretrial Preparation Checklist', 'locked'),
      (NEW.id, 'pi_judgment_guide', 'Understanding Your Judgment', 'locked');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS seed_pi_lifecycle_gap_tasks_trigger ON public.cases;
CREATE TRIGGER seed_pi_lifecycle_gap_tasks_trigger
  AFTER INSERT ON public.cases
  FOR EACH ROW
  EXECUTE FUNCTION public.seed_pi_lifecycle_gap_tasks();

CREATE OR REPLACE FUNCTION public.unlock_pi_lifecycle_gap_tasks()
RETURNS TRIGGER AS $$
DECLARE
  v_dispute_type text;
BEGIN
  SELECT dispute_type INTO v_dispute_type FROM public.cases WHERE id = NEW.case_id;
  IF v_dispute_type != 'personal_injury' THEN RETURN NEW; END IF;

  -- pi_court_selection: unlock after settlement negotiation completes or is skipped
  IF NEW.task_key = 'pi_settlement_negotiation' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_court_selection' AND status = 'locked';
  END IF;

  -- pi_disclosures_guide: unlock after scheduling conference completes
  IF NEW.task_key = 'pi_scheduling_conference' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_disclosures_guide' AND status = 'locked';
  END IF;

  -- pi_pretrial_preparation: unlock after pretrial motions completes
  IF NEW.task_key = 'pi_pretrial_motions' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_pretrial_preparation' AND status = 'locked';
  END IF;

  -- pi_judgment_guide: unlock when post_resolution becomes todo
  IF NEW.task_key = 'pi_post_resolution' AND NEW.status = 'todo' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_judgment_guide' AND status = 'locked';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS unlock_pi_lifecycle_gap_trigger ON public.tasks;
CREATE TRIGGER unlock_pi_lifecycle_gap_trigger
  AFTER UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.unlock_pi_lifecycle_gap_tasks();
