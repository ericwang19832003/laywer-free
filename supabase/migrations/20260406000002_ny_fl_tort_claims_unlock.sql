-- NY-specific unlock: government tort claims (Notice of Claim + 50-h hearing tracking)
CREATE OR REPLACE FUNCTION public.unlock_ny_tort_claims_tasks()
RETURNS TRIGGER AS $$
DECLARE
  v_dispute_type text;
  v_state text;
BEGIN
  SELECT dispute_type, state INTO v_dispute_type, v_state FROM public.cases WHERE id = NEW.case_id;
  IF v_dispute_type != 'personal_injury' OR v_state != 'New York' THEN RETURN NEW; END IF;

  -- After tort claims notice complete: unlock tracking (50-h hearing tracking)
  IF NEW.task_key = 'pi_tort_claims_notice' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_tort_claims_tracking' AND status = 'locked';
  END IF;

  -- After tort claims tracking complete: unlock medical records
  IF NEW.task_key = 'pi_tort_claims_tracking' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_medical_records' AND status = 'locked';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS unlock_ny_tort_claims_trigger ON public.tasks;
CREATE TRIGGER unlock_ny_tort_claims_trigger
  AFTER UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.unlock_ny_tort_claims_tasks();

-- FL-specific unlock: government tort claims (pre-suit notice + 180-day tracking)
CREATE OR REPLACE FUNCTION public.unlock_fl_tort_claims_tasks()
RETURNS TRIGGER AS $$
DECLARE
  v_dispute_type text;
  v_state text;
BEGIN
  SELECT dispute_type, state INTO v_dispute_type, v_state FROM public.cases WHERE id = NEW.case_id;
  IF v_dispute_type != 'personal_injury' OR v_state != 'Florida' THEN RETURN NEW; END IF;

  -- After tort claims notice complete: unlock tracking (180-day waiting period)
  IF NEW.task_key = 'pi_tort_claims_notice' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_tort_claims_tracking' AND status = 'locked';

    -- Insert deadline: 180-day waiting period before filing suit
    INSERT INTO public.deadlines (case_id, key, due_at, source, rationale, label, consequence, auto_generated)
    VALUES (
      NEW.case_id,
      'fl_presuit_waiting_period',
      now() + interval '180 days',
      'task:pi_tort_claims_notice',
      'Florida §768.28(6) requires 180-day waiting period after pre-suit notice before filing suit',
      'Pre-Suit Waiting Period Ends',
      'You cannot file your lawsuit until 180 days after the pre-suit notice is received. Filing early will result in dismissal.',
      true
    );
  END IF;

  -- After tort claims tracking complete: unlock medical records
  IF NEW.task_key = 'pi_tort_claims_tracking' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_medical_records' AND status = 'locked';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS unlock_fl_tort_claims_trigger ON public.tasks;
CREATE TRIGGER unlock_fl_tort_claims_trigger
  AFTER UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.unlock_fl_tort_claims_tasks();
