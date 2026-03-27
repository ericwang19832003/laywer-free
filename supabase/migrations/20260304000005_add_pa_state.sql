-- Add PA to the state CHECK constraint
ALTER TABLE public.cases
  DROP CONSTRAINT IF EXISTS cases_state_check;

ALTER TABLE public.cases
  ADD CONSTRAINT cases_state_check
  CHECK (state IN ('TX', 'CA', 'NY', 'FL', 'PA'));

-- Add PA court types to the court_type CHECK constraint
ALTER TABLE public.cases
  DROP CONSTRAINT IF EXISTS cases_court_type_check;

ALTER TABLE public.cases
  ADD CONSTRAINT cases_court_type_check
  CHECK (court_type IN (
    'jp', 'county', 'district', 'federal', 'unknown',
    'small_claims', 'limited_civil', 'unlimited_civil',
    'ny_small_claims', 'ny_civil', 'ny_supreme',
    'fl_small_claims', 'fl_county', 'fl_circuit',
    'pa_magisterial', 'pa_common_pleas'
  ));
