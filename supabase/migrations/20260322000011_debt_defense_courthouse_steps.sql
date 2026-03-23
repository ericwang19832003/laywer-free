-- Add courthouse-phase tasks to debt defense workflow
-- These fill the gap between "I have documents" and "I filed them correctly"
CREATE OR REPLACE FUNCTION public.seed_courthouse_tasks()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.dispute_type = 'debt_collection' AND NEW.role = 'defendant' THEN
    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES
      (NEW.id, 'debt_filing_guide', 'How to File Your Answer', 'locked'),
      (NEW.id, 'debt_service_guide', 'How to Serve the Plaintiff', 'locked'),
      (NEW.id, 'debt_courtroom_guide', 'What to Expect at Your Hearing', 'locked'),
      (NEW.id, 'debt_post_judgment_guide', 'After the Ruling — What to Do Next', 'locked');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS seed_courthouse_tasks_trigger ON public.cases;
CREATE TRIGGER seed_courthouse_tasks_trigger
  AFTER INSERT ON public.cases
  FOR EACH ROW
  EXECUTE FUNCTION public.seed_courthouse_tasks();

-- Unlock courthouse tasks at the right points in the workflow
CREATE OR REPLACE FUNCTION public.unlock_courthouse_tasks()
RETURNS TRIGGER AS $$
BEGIN
  -- Filing guide unlocks after answer is prepared
  IF NEW.task_key = 'prepare_debt_defense_answer' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'debt_filing_guide' AND status = 'locked';
  END IF;

  -- Service guide unlocks after filing guide
  IF NEW.task_key = 'debt_filing_guide' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'debt_service_guide' AND status = 'locked';
  END IF;

  -- Courtroom guide unlocks after hearing prep
  IF NEW.task_key = 'debt_hearing_prep' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'debt_courtroom_guide' AND status = 'locked';
  END IF;

  -- Post-judgment guide unlocks after hearing day
  IF NEW.task_key = 'debt_hearing_day' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'debt_post_judgment_guide' AND status = 'locked';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS unlock_courthouse_tasks_trigger ON public.tasks;
CREATE TRIGGER unlock_courthouse_tasks_trigger
  AFTER UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.unlock_courthouse_tasks();
