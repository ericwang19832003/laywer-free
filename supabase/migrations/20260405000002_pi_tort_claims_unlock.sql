CREATE OR REPLACE FUNCTION public.unlock_pi_tort_claims_tasks()
RETURNS TRIGGER AS $$
DECLARE
  v_dispute_type text;
BEGIN
  SELECT dispute_type INTO v_dispute_type FROM public.cases WHERE id = NEW.case_id;
  IF v_dispute_type != 'personal_injury' THEN RETURN NEW; END IF;

  -- After Tort Claims notice complete: unlock tracking (set to todo)
  IF NEW.task_key = 'pi_tort_claims_notice' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_tort_claims_tracking' AND status = 'locked';

    -- Create 90-day response window deadline
    INSERT INTO public.deadlines (case_id, key, due_at, source, rationale, label, consequence, auto_generated)
    VALUES (
      NEW.case_id,
      'tort_claims_response_window',
      now() + interval '90 days',
      'system',
      'Government entity has 90 days from receipt of notice to respond.',
      'Tort Claims Response Window',
      'After this date passes without response, you may proceed with filing your petition.',
      true
    )
    ON CONFLICT DO NOTHING;
  END IF;

  -- After Tort Claims tracking complete: ensure medical records is unlocked
  IF NEW.task_key = 'pi_tort_claims_tracking' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_medical_records' AND status = 'locked';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS unlock_pi_tort_claims_trigger ON public.tasks;
CREATE TRIGGER unlock_pi_tort_claims_trigger
  AFTER UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.unlock_pi_tort_claims_tasks();
