-- Migration: Update PI task titles based on sub-type
-- The seed_case_tasks trigger fires before personal_injury_details is inserted,
-- so we add a trigger on personal_injury_details to fix titles post-creation.

CREATE OR REPLACE FUNCTION public.update_pi_task_titles()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only update for property damage sub-types
  IF NEW.pi_sub_type IN ('vehicle_damage', 'property_damage_negligence', 'vandalism', 'other_property_damage') THEN
    UPDATE public.tasks
    SET title = 'Tell Us About the Property Damage'
    WHERE case_id = NEW.case_id AND task_key = 'pi_intake';

    UPDATE public.tasks
    SET title = 'Document Your Property Damage'
    WHERE case_id = NEW.case_id AND task_key = 'pi_medical_records';
  END IF;

  RETURN NEW;
END;
$$;

-- Fire after personal_injury_details is inserted
CREATE TRIGGER update_pi_task_titles_trigger
  AFTER INSERT ON public.personal_injury_details
  FOR EACH ROW
  EXECUTE FUNCTION public.update_pi_task_titles();

-- Also update any EXISTING property damage cases that already have wrong titles
UPDATE public.tasks t
SET title = 'Document Your Property Damage'
FROM public.personal_injury_details pid
WHERE t.case_id = pid.case_id
  AND t.task_key = 'pi_medical_records'
  AND pid.pi_sub_type IN ('vehicle_damage', 'property_damage_negligence', 'vandalism', 'other_property_damage');

UPDATE public.tasks t
SET title = 'Tell Us About the Property Damage'
FROM public.personal_injury_details pid
WHERE t.case_id = pid.case_id
  AND t.task_key = 'pi_intake'
  AND pid.pi_sub_type IN ('vehicle_damage', 'property_damage_negligence', 'vandalism', 'other_property_damage');
