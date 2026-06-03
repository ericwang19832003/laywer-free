-- The two-arg increment_ai_usage(uuid, text) was superseded by the single-arg
-- version in the billing migration. It had an explicit GRANT TO authenticated
-- from its original migration that survived the REVOKE FROM PUBLIC in 20260602000003.
-- Revoke the explicit authenticated grant to remove it from the PostgREST surface.

DO $$
BEGIN
  REVOKE EXECUTE ON FUNCTION public.increment_ai_usage(uuid, text) FROM authenticated;
EXCEPTION WHEN undefined_function THEN
  RAISE NOTICE 'increment_ai_usage(uuid, text) not found, skipping';
END $$;
