-- PA-specific unlock: political subdivision tort claims
-- Only fires for PA PI cases. No statutory response window (unlike TX 90d / CA 45d).
CREATE OR REPLACE FUNCTION public.unlock_pa_tort_claims_tasks()
RETURNS TRIGGER AS $$
DECLARE
  v_dispute_type text;
  v_state text;
BEGIN
  SELECT dispute_type, state INTO v_dispute_type, v_state FROM public.cases WHERE id = NEW.case_id;
  IF v_dispute_type != 'personal_injury' OR v_state != 'Pennsylvania' THEN RETURN NEW; END IF;

  -- After tort claims notice complete: unlock tracking
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

DROP TRIGGER IF EXISTS unlock_pa_tort_claims_trigger ON public.tasks;
CREATE TRIGGER unlock_pa_tort_claims_trigger
  AFTER UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.unlock_pa_tort_claims_tasks();
