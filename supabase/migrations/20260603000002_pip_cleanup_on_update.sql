-- Extend PIP cleanup to cover UPDATE on personal_injury_details.
-- The INSERT trigger in 20260603000001 fires at case creation time.
-- This trigger fires when pi_sub_type is changed to a property-damage
-- subtype after initial INSERT (e.g. user edits sub-type during intake).

CREATE OR REPLACE FUNCTION public.remove_pip_on_subtype_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Only act when pi_sub_type changed to a property-damage value
  IF NEW.pi_sub_type IS DISTINCT FROM OLD.pi_sub_type
     AND NEW.pi_sub_type IN (
       'vehicle_damage',
       'property_damage_negligence',
       'vandalism',
       'other_property_damage'
     ) THEN
    DELETE FROM public.tasks
    WHERE case_id = NEW.case_id
      AND task_key = 'pi_pip_claim';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS remove_pip_on_subtype_update_trigger ON public.personal_injury_details;
CREATE TRIGGER remove_pip_on_subtype_update_trigger
  AFTER UPDATE ON public.personal_injury_details
  FOR EACH ROW
  EXECUTE FUNCTION public.remove_pip_on_subtype_update();
