-- Fix personal_injury_details CHECK constraint to include all PI sub-types.
--
-- The original migration (20260304000001) only allowed 8 values:
--   auto_accident, pedestrian_cyclist, rideshare, uninsured_motorist,
--   slip_and_fall, dog_bite, product_liability, other
--
-- The UI added property-damage sub-types and renamed 'other' to 'other_injury'.
-- This migration:
--   1. Drops the old CHECK constraint
--   2. Adds a new one with all 12 sub-types
--   3. Migrates any existing 'other' rows to 'other_injury'

-- 1. Migrate existing 'other' values to 'other_injury'
--    (must happen before the new constraint is applied)
UPDATE public.personal_injury_details
SET pi_sub_type = 'other_injury'
WHERE pi_sub_type = 'other';

-- 2. Drop the old constraint and add the new one
ALTER TABLE public.personal_injury_details
  DROP CONSTRAINT IF EXISTS personal_injury_details_pi_sub_type_check;

ALTER TABLE public.personal_injury_details
  ADD CONSTRAINT personal_injury_details_pi_sub_type_check
  CHECK (pi_sub_type IN (
    'auto_accident',
    'pedestrian_cyclist',
    'rideshare',
    'uninsured_motorist',
    'slip_and_fall',
    'dog_bite',
    'product_liability',
    'other_injury',
    'vehicle_damage',
    'property_damage_negligence',
    'vandalism',
    'other_property_damage'
  ));
