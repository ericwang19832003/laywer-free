-- Fix function execute grants: previous migration revoked from specific roles
-- but grants are on PUBLIC, which all roles inherit. This migration revokes
-- from PUBLIC and selectively re-grants to the correct roles.
--
-- After this migration, expected remaining intentional linter warnings:
--   anon_security_definer_function_executable:
--     get_shared_case, get_shared_case_deadlines, get_shared_case_events (shared-link feature)
--   authenticated_security_definer_function_executable:
--     create_case_atomic, get_case_dashboard, change_case_type,
--     upsert_user_learning_progress, inject_conditional_tasks,
--     increment_ai_usage(text), get_shared_case* (all intentional user-facing RPCs)


-- ── 1) Internal trigger/server-only functions ─────────────────────────────────
--
-- These are called exclusively by PostgreSQL triggers, never by users via RPC.
-- Revoking from PUBLIC removes them from the PostgREST API surface entirely.
-- Trigger invocation does not require explicit EXECUTE grants.

DO $$
DECLARE
  r RECORD;
  internal_names text[] := ARRAY[
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
        'REVOKE EXECUTE ON FUNCTION public.%I(%s) FROM PUBLIC',
        r.proname, r.args
      );
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'public revoke: skipped public.%(%): %', r.proname, r.args, SQLERRM;
    END;
  END LOOP;
END $$;


-- ── 2) User-facing RPCs (authenticated only) + shared case functions ──────────

DO $$
BEGIN
  -- create_case_atomic: browser RPC to create a new case
  REVOKE EXECUTE ON FUNCTION public.create_case_atomic(
    text, text, text, text, text, text, text, text, text, text, text, text, text, text, text
  ) FROM PUBLIC;
  GRANT EXECUTE ON FUNCTION public.create_case_atomic(
    text, text, text, text, text, text, text, text, text, text, text, text, text, text, text
  ) TO authenticated;

  -- get_case_dashboard: dashboard RPC
  REVOKE EXECUTE ON FUNCTION public.get_case_dashboard(uuid) FROM PUBLIC;
  GRANT EXECUTE ON FUNCTION public.get_case_dashboard(uuid) TO authenticated;

  -- change_case_type: change dispute type
  REVOKE EXECUTE ON FUNCTION public.change_case_type(uuid, text, text, text, text, text) FROM PUBLIC;
  GRANT EXECUTE ON FUNCTION public.change_case_type(uuid, text, text, text, text, text) TO authenticated;

  -- upsert_user_learning_progress: save learning progress
  REVOKE EXECUTE ON FUNCTION public.upsert_user_learning_progress(uuid, jsonb) FROM PUBLIC;
  GRANT EXECUTE ON FUNCTION public.upsert_user_learning_progress(uuid, jsonb) TO authenticated;

  -- inject_conditional_tasks: inject conditional PI tasks
  REVOKE EXECUTE ON FUNCTION public.inject_conditional_tasks(uuid, text[], text, text, text) FROM PUBLIC;
  GRANT EXECUTE ON FUNCTION public.inject_conditional_tasks(uuid, text[], text, text, text) TO authenticated;

  -- increment_ai_usage(text): current version, callable by authenticated users
  REVOKE EXECUTE ON FUNCTION public.increment_ai_usage(text) FROM PUBLIC;
  GRANT EXECUTE ON FUNCTION public.increment_ai_usage(text) TO authenticated;

  -- increment_ai_usage(uuid, text): old two-arg server-only version, no RPC access
  REVOKE EXECUTE ON FUNCTION public.increment_ai_usage(uuid, text) FROM PUBLIC;

  -- get_shared_case* functions: anon + authenticated (shared case link feature)
  REVOKE EXECUTE ON FUNCTION public.get_shared_case(text) FROM PUBLIC;
  GRANT EXECUTE ON FUNCTION public.get_shared_case(text) TO anon;
  GRANT EXECUTE ON FUNCTION public.get_shared_case(text) TO authenticated;

  REVOKE EXECUTE ON FUNCTION public.get_shared_case_deadlines(text) FROM PUBLIC;
  GRANT EXECUTE ON FUNCTION public.get_shared_case_deadlines(text) TO anon;
  GRANT EXECUTE ON FUNCTION public.get_shared_case_deadlines(text) TO authenticated;

  REVOKE EXECUTE ON FUNCTION public.get_shared_case_events(text) FROM PUBLIC;
  GRANT EXECUTE ON FUNCTION public.get_shared_case_events(text) TO anon;
  GRANT EXECUTE ON FUNCTION public.get_shared_case_events(text) TO authenticated;
END $$;
