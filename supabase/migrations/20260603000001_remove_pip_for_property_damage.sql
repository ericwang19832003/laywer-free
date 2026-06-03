-- Remove pi_pip_claim task for property-damage PI sub-types.
-- PIP (Personal Injury Protection) covers medical bills / lost wages only —
-- it does not apply to property-damage cases (vehicle_damage,
-- property_damage_negligence, vandalism, other_property_damage).

-- Trigger: fires on personal_injury_details INSERT and deletes the
-- pi_pip_claim task that was seeded earlier by seed_pi_depth_tasks.
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
      AND task_key = 'pi_pip_claim';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS remove_pip_for_property_damage_trigger ON public.personal_injury_details;
CREATE TRIGGER remove_pip_for_property_damage_trigger
  AFTER INSERT ON public.personal_injury_details
  FOR EACH ROW
  EXECUTE FUNCTION public.remove_pip_for_property_damage();

-- Backfill: remove pi_pip_claim from existing property-damage cases.
DELETE FROM public.tasks t
USING public.personal_injury_details pid
WHERE t.case_id = pid.case_id
  AND t.task_key = 'pi_pip_claim'
  AND pid.pi_sub_type IN (
    'vehicle_damage',
    'property_damage_negligence',
    'vandalism',
    'other_property_damage'
  );
