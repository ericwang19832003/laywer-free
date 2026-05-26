-- ============================================
-- PI Court Selection Step
-- ============================================
--
-- Adds 'pi_court_selection' task to the personal injury workflow,
-- positioned after 'pi_settlement_negotiation' and before 'prepare_pi_petition'.
-- Reuses the existing PiCourtSelectionStep component.
--
-- The task unlocks in parallel with 'prepare_pi_petition' when the user
-- decides to file suit after settlement negotiation. It appears earlier
-- in the sidebar so the dashboard surfaces it first.
--
-- Three changes:
--   1. seed_pi_court_selection_task() — insert task for new PI cases
--   2. unlock_pi_court_selection_task() — unlock when filing path chosen
--   3. Backfill existing PI cases
-- ============================================


-- ============================================
-- 1) seed_pi_court_selection_task()
-- ============================================

CREATE OR REPLACE FUNCTION public.seed_pi_court_selection_task()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.dispute_type = 'personal_injury' THEN
    -- Insert between pi_settlement_negotiation and prepare_pi_petition
    -- created_at offset ensures it appears before prepare_pi_petition in sidebar
    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'pi_court_selection', 'Choose the Right Court', 'locked');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS seed_pi_court_selection_trigger ON public.cases;
CREATE TRIGGER seed_pi_court_selection_trigger
  AFTER INSERT ON public.cases
  FOR EACH ROW
  EXECUTE FUNCTION public.seed_pi_court_selection_task();


-- ============================================
-- 2) unlock_pi_court_selection_task()
-- ============================================
-- Fires alongside the main unlock_next_task trigger.
-- When pi_settlement_negotiation completes on the filing path,
-- also unlocks pi_court_selection so it appears before prepare_pi_petition.
-- When pi_court_selection completes or is skipped, it is a no-op
-- (prepare_pi_petition is already unlocked by the main trigger).
-- ============================================

CREATE OR REPLACE FUNCTION public.unlock_pi_court_selection_task()
RETURNS TRIGGER AS $$
DECLARE
  v_dispute_type text;
  v_settlement_reached text;
  v_want_to_file_suit text;
  v_already_filed text;
BEGIN
  SELECT dispute_type INTO v_dispute_type FROM public.cases WHERE id = NEW.case_id;
  IF v_dispute_type != 'personal_injury' THEN RETURN NEW; END IF;

  -- When settlement negotiation completes on the filing path, unlock court selection
  IF NEW.task_key = 'pi_settlement_negotiation'
    AND NEW.status = 'completed'
    AND OLD.status != 'completed'
  THEN
    v_settlement_reached := COALESCE(NEW.metadata->'guided_answers'->>'settlement_reached', '');
    v_want_to_file_suit  := COALESCE(NEW.metadata->'guided_answers'->>'want_to_file_suit', '');

    IF v_settlement_reached = 'no' AND v_want_to_file_suit = 'yes' THEN
      v_already_filed := COALESCE(NEW.metadata->'guided_answers'->>'already_filed_petition', '');
      IF v_already_filed != 'yes' THEN
        -- Unlock court selection to appear alongside prepare_pi_petition
        UPDATE public.tasks SET status = 'todo', unlocked_at = now()
        WHERE case_id = NEW.case_id
          AND task_key = 'pi_court_selection'
          AND status = 'locked';
      END IF;
    END IF;
  END IF;

  -- When filing stage chosen at intake, also unlock court selection
  IF NEW.task_key = 'pi_intake'
    AND NEW.status = 'completed'
    AND OLD.status != 'completed'
  THEN
    IF COALESCE(NEW.metadata->'guided_answers'->>'case_stage', '') = 'filing' THEN
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id
        AND task_key = 'pi_court_selection'
        AND status = 'locked';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS unlock_pi_court_selection_trigger ON public.tasks;
CREATE TRIGGER unlock_pi_court_selection_trigger
  AFTER UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.unlock_pi_court_selection_task();


-- ============================================
-- 3) Backfill: insert pi_court_selection for existing PI cases
-- ============================================
-- Status logic:
--   - pi_settlement_negotiation locked/todo/in_progress → locked
--   - pi_settlement_negotiation completed, prepare_pi_petition todo → todo (ready to work)
--   - pi_settlement_negotiation completed, prepare_pi_petition completed/skipped → skipped (past this point)
--   - pi_settlement_negotiation skipped → skipped
-- ============================================

INSERT INTO public.tasks (case_id, task_key, title, status, unlocked_at, created_at)
SELECT
  c.id,
  'pi_court_selection',
  'Choose the Right Court',
  CASE
    WHEN sn.status = 'skipped' THEN 'skipped'
    WHEN sn.status = 'completed' AND pp.status = 'todo' THEN 'todo'
    WHEN sn.status = 'completed' AND pp.status IN ('completed', 'skipped') THEN 'skipped'
    ELSE 'locked'
  END,
  CASE
    WHEN sn.status = 'completed' AND pp.status = 'todo' THEN now()
    ELSE NULL
  END,
  -- Place between pi_settlement_negotiation and prepare_pi_petition in sort order
  sn.created_at + interval '500 milliseconds'
FROM public.cases c
JOIN public.tasks sn ON sn.case_id = c.id AND sn.task_key = 'pi_settlement_negotiation'
JOIN public.tasks pp ON pp.case_id = c.id AND pp.task_key = 'prepare_pi_petition'
WHERE c.dispute_type = 'personal_injury'
  AND NOT EXISTS (
    SELECT 1 FROM public.tasks t
    WHERE t.case_id = c.id AND t.task_key = 'pi_court_selection'
  );
