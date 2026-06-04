-- Fix Supabase linter security warnings for public schema functions
--
-- 1. function_search_path_mutable: add SET search_path = public to all functions
--    that don't already have it, preventing search_path hijacking attacks.
--
-- 2. anon_security_definer_function_executable: revoke EXECUTE from the anon role
--    on all SECURITY DEFINER functions except get_shared_case*, which are
--    intentionally callable by unauthenticated users (shared case link feature).
--
-- 3. authenticated_security_definer_function_executable: revoke EXECUTE from the
--    authenticated role for internal trigger/seed/unlock functions that should
--    never be called directly via PostgREST RPC by users.


-- ── 1) Fix mutable search_path on all public schema functions ─────────────────

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
  LOOP
    BEGIN
      EXECUTE format(
        'ALTER FUNCTION public.%I(%s) SET search_path = public',
        r.proname, r.args
      );
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'search_path: skipped public.%(%): %', r.proname, r.args, SQLERRM;
    END;
  END LOOP;
END $$;


-- ── 2) Revoke anon EXECUTE on all SECURITY DEFINER functions ─────────────────
--
-- Exceptions (kept callable by anon for shared case link feature):
--   get_shared_case(text)
--   get_shared_case_deadlines(text)
--   get_shared_case_events(text)

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
      AND p.prosecdef = TRUE
      AND p.proname NOT IN (
        'get_shared_case',
        'get_shared_case_deadlines',
        'get_shared_case_events'
      )
  LOOP
    BEGIN
      EXECUTE format(
        'REVOKE EXECUTE ON FUNCTION public.%I(%s) FROM anon',
        r.proname, r.args
      );
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'anon revoke: skipped public.%(%): %', r.proname, r.args, SQLERRM;
    END;
  END LOOP;
END $$;


-- ── 3) Revoke authenticated EXECUTE on internal trigger/server functions ──────
--
-- These functions are trigger callbacks or server-side-only operations.
-- They must NOT be callable by authenticated users via PostgREST RPC.
--
-- Kept callable by authenticated (user-facing RPCs):
--   create_case_atomic, get_case_dashboard, change_case_type,
--   upsert_user_learning_progress, increment_ai_usage,
--   get_shared_case*, match_opinion_chunks, match_opinion_chunks_keyword,
--   inject_conditional_tasks, assign_next_exhibit_number, renumber_exhibits

DO $$
DECLARE
  r RECORD;
  internal_names text[] := ARRAY[
    -- Task seeding triggers (fire on INSERT to cases)
    'seed_case_tasks',
    'seed_family_tasks',
    'seed_business_tasks',
    'seed_debt_depth_tasks',
    'seed_courthouse_tasks',
    'seed_complete_debt_tasks',
    'seed_family_depth_tasks',
    'seed_pi_depth_tasks',
    'seed_property_depth_tasks',
    'seed_lt_depth_tasks',
    'seed_contract_depth_tasks',
    'seed_sc_depth_tasks',
    'seed_business_depth_tasks',
    'seed_re_depth_tasks',
    'seed_pi_court_selection_task',
    'seed_ny_fl_debt_tasks',
    'seed_ca_pa_debt_tasks',
    'seed_pi_lifecycle_gap_tasks',
    -- Task unlocking triggers (fire on UPDATE to tasks)
    'unlock_next_task',
    'unlock_depth_tasks',
    'unlock_courthouse_tasks',
    'unlock_complete_debt_tasks',
    'unlock_family_depth_tasks',
    'unlock_pi_depth_tasks',
    'unlock_property_depth_tasks',
    'unlock_lt_depth_tasks',
    'unlock_contract_depth_tasks',
    'unlock_sc_depth_tasks',
    'unlock_business_depth_tasks',
    'unlock_re_depth_tasks',
    'unlock_pi_court_selection_task',
    'unlock_ca_debt_discovery',
    'unlock_ny_fl_debt_discovery',
    'unlock_pi_tort_claims_tasks',
    'unlock_ca_tort_claims_tasks',
    'unlock_pa_tort_claims_tasks',
    'unlock_ny_tort_claims_tasks',
    'unlock_fl_tort_claims_tasks',
    'unlock_pi_lifecycle_gap_tasks',
    -- Other internal triggers / server-only functions
    'auto_create_subscription',
    'update_pi_task_titles',
    'handle_updated_at',
    'update_updated_at_column',
    'cleanup_rate_limits',
    'increment_rate_limit'
  ];
BEGIN
  FOR r IN
    SELECT p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
      AND p.proname = ANY(internal_names)
  LOOP
    BEGIN
      EXECUTE format(
        'REVOKE EXECUTE ON FUNCTION public.%I(%s) FROM authenticated',
        r.proname, r.args
      );
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'authenticated revoke: skipped public.%(%): %', r.proname, r.args, SQLERRM;
    END;
  END LOOP;
END $$;
