-- CA/PA-specific debt defense tasks
-- Injects state-specific depth tasks for California and Pennsylvania debt cases

-- CA: Inject discovery guide task after debt_answer_prep completion
-- PA: Inject confession of judgment task for PA cases (always available)

CREATE OR REPLACE FUNCTION public.seed_ca_pa_debt_tasks()
RETURNS TRIGGER AS $$
DECLARE
  v_dispute_type text;
  v_state text;
  v_role text;
BEGIN
  SELECT dispute_type, state, role INTO v_dispute_type, v_state, v_role
  FROM public.cases WHERE id = NEW.id;

  -- Only for debt collection defendants
  IF v_dispute_type != 'debt_collection' OR v_role != 'defendant' THEN RETURN NEW; END IF;

  -- CA: Inject discovery guide (locked until after answer prep)
  IF v_state = 'California' THEN
    INSERT INTO public.tasks (case_id, task_key, title, status, sort_order)
    VALUES (NEW.id, 'debt_discovery', 'Use Discovery to Fight Back', 'locked', 550)
    ON CONFLICT (case_id, task_key) DO NOTHING;
  END IF;

  -- PA: Inject confession of judgment guide (always available — emergency path)
  IF v_state = 'Pennsylvania' THEN
    INSERT INTO public.tasks (case_id, task_key, title, status, sort_order)
    VALUES (NEW.id, 'debt_confession_judgment', 'Challenge a Confession of Judgment', 'todo', 555)
    ON CONFLICT (case_id, task_key) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS seed_ca_pa_debt_tasks_trigger ON public.cases;
CREATE TRIGGER seed_ca_pa_debt_tasks_trigger
  AFTER INSERT ON public.cases
  FOR EACH ROW
  EXECUTE FUNCTION public.seed_ca_pa_debt_tasks();

-- Unlock CA discovery guide after answer prep is completed
CREATE OR REPLACE FUNCTION public.unlock_ca_debt_discovery()
RETURNS TRIGGER AS $$
DECLARE
  v_dispute_type text;
  v_state text;
BEGIN
  SELECT dispute_type, state INTO v_dispute_type, v_state
  FROM public.cases WHERE id = NEW.case_id;

  IF v_dispute_type != 'debt_collection' OR v_state != 'California' THEN RETURN NEW; END IF;

  -- After answer prep complete: unlock discovery guide
  IF NEW.task_key = 'prepare_debt_defense_answer' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'debt_discovery' AND status = 'locked';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS unlock_ca_debt_discovery_trigger ON public.tasks;
CREATE TRIGGER unlock_ca_debt_discovery_trigger
  AFTER UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.unlock_ca_debt_discovery();
