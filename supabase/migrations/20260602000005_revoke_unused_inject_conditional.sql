-- inject_conditional_tasks has no callers in the application — it is never
-- invoked via PostgREST RPC. Revoke authenticated execute to remove it from
-- the API surface and clear the linter warning.

DO $$
BEGIN
  REVOKE EXECUTE ON FUNCTION public.inject_conditional_tasks(
    uuid, text[], text, text, text
  ) FROM authenticated;
EXCEPTION WHEN undefined_function THEN
  RAISE NOTICE 'inject_conditional_tasks not found, skipping';
END $$;
