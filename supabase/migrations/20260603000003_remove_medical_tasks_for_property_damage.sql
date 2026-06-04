-- Remove medical-specific PI tasks for property-damage sub-types.
-- pi_medical_improvement ("When to Settle — Maximum Medical Improvement") and
-- pi_lien_resolution ("Resolving Medical Liens") are about medical recovery and
-- medical liens — neither applies to property-damage cases (vehicle_damage,
-- property_damage_negligence, vandalism, other_property_damage).

-- Update the existing INSERT trigger to also remove these tasks
CREATE OR REPLACE FUNCTION public.remove_pip_for_property_damage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.pi_sub_type IN (
    'vehicle_damage',
    'property_damage_negligence',
    'vandalism',
    'other_property_damage'
  ) THEN
    DELETE FROM public.tasks
    WHERE case_id = NEW.case_id
      AND task_key IN ('pi_pip_claim', 'pi_medical_improvement', 'pi_lien_resolution');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update the UPDATE trigger to also remove these tasks
CREATE OR REPLACE FUNCTION public.remove_pip_on_subtype_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.pi_sub_type IS DISTINCT FROM OLD.pi_sub_type
     AND NEW.pi_sub_type IN (
       'vehicle_damage',
       'property_damage_negligence',
       'vandalism',
       'other_property_damage'
     ) THEN
    DELETE FROM public.tasks
    WHERE case_id = NEW.case_id
      AND task_key IN ('pi_pip_claim', 'pi_medical_improvement', 'pi_lien_resolution');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Backfill: remove these tasks from existing property-damage cases
DELETE FROM public.tasks t
USING public.personal_injury_details pid
WHERE t.case_id = pid.case_id
  AND t.task_key IN ('pi_medical_improvement', 'pi_lien_resolution')
  AND pid.pi_sub_type IN (
    'vehicle_damage',
    'property_damage_negligence',
    'vandalism',
    'other_property_damage'
  );
