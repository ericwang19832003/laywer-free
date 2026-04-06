CREATE OR REPLACE FUNCTION public.unlock_ca_tort_claims_tasks()
RETURNS TRIGGER AS $$
DECLARE
  v_dispute_type text;
  v_state text;
BEGIN
  SELECT dispute_type, state INTO v_dispute_type, v_state FROM public.cases WHERE id = NEW.case_id;
  IF v_dispute_type != 'personal_injury' OR v_state != 'California' THEN RETURN NEW; END IF;

  IF NEW.task_key = 'pi_tort_claims_notice' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_tort_claims_tracking' AND status = 'locked';

    INSERT INTO public.deadlines (case_id, key, due_at, source, rationale, label, consequence, auto_generated)
    VALUES (
      NEW.case_id,
      'ca_govt_response_window',
      now() + interval '45 days',
      'system',
      'Government entity has 45 days from receipt of claim to respond (Government Code §912.4).',
      'Government Claim Response Window',
      'After 45 days without response, the claim is deemed rejected. You have 2 years from injury to file suit.',
      true
    )
    ON CONFLICT DO NOTHING;
  END IF;

  IF NEW.task_key = 'pi_tort_claims_tracking' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_medical_records' AND status = 'locked';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS unlock_ca_tort_claims_trigger ON public.tasks;
CREATE TRIGGER unlock_ca_tort_claims_trigger
  AFTER UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.unlock_ca_tort_claims_tasks();
