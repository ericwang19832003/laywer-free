-- Add ny_family_court to court_type CHECK constraint
ALTER TABLE public.cases
  DROP CONSTRAINT IF EXISTS cases_court_type_check;

ALTER TABLE public.cases
  ADD CONSTRAINT cases_court_type_check
  CHECK (court_type IN (
    'jp', 'county', 'district', 'federal', 'unknown',
    'small_claims', 'limited_civil', 'unlimited_civil',
    'ny_small_claims', 'ny_civil', 'ny_supreme', 'ny_family_court',
    'fl_small_claims', 'fl_county', 'fl_circuit',
    'pa_magisterial', 'pa_common_pleas'
  ));

-- Store secondary dispute types selected during case creation
ALTER TABLE public.cases
  ADD COLUMN IF NOT EXISTS secondary_dispute_types text[] DEFAULT '{}';
