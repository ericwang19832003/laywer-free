-- ==========================================================
-- Test: assign_next_exhibit_number
--
-- Run against a local Supabase Postgres instance:
--   psql postgresql://postgres:postgres@127.0.0.1:54322/postgres \
--        -f supabase/tests/test_assign_next_exhibit_number.sql
--
-- Requirements:
--   - Extension dblink (for concurrency test)
--   - All migrations applied
--
-- Tests run as superuser (bypasses RLS) to isolate RPC logic.
-- RLS policies are validated structurally, not behaviorally here.
-- ==========================================================

\set ON_ERROR_STOP on

CREATE EXTENSION IF NOT EXISTS dblink;

-- ── Fixtures (auto-committed so dblink sessions can see them) ──

INSERT INTO auth.users (id, email, raw_user_meta_data, role, aud, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000099',
  'exhibit-test@example.com',
  '{}',
  'authenticated',
  'authenticated',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.cases (id, user_id, jurisdiction, county, court_type, role, dispute_type, status)
VALUES (
  '00000000-0000-0000-0000-0000000000c1',
  '00000000-0000-0000-0000-000000000099',
  'TX', 'Travis', 'jp', 'plaintiff', 'landlord_tenant', 'active'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.evidence_items (id, case_id, file_name, storage_path, uploaded_by) VALUES
  ('00000000-0000-0000-0000-0000000000e1', '00000000-0000-0000-0000-0000000000c1', 'photo1.jpg', 'test/photo1.jpg', '00000000-0000-0000-0000-000000000099'),
  ('00000000-0000-0000-0000-0000000000e2', '00000000-0000-0000-0000-0000000000c1', 'photo2.jpg', 'test/photo2.jpg', '00000000-0000-0000-0000-000000000099'),
  ('00000000-0000-0000-0000-0000000000e3', '00000000-0000-0000-0000-0000000000c1', 'photo3.jpg', 'test/photo3.jpg', '00000000-0000-0000-0000-000000000099'),
  ('00000000-0000-0000-0000-0000000000e4', '00000000-0000-0000-0000-0000000000c1', 'photo4.jpg', 'test/photo4.jpg', '00000000-0000-0000-0000-000000000099')
ON CONFLICT (id) DO NOTHING;


-- ── Test 1: Numeric sequential numbering ───────

DO $$
DECLARE
  v_set_id uuid;
  v_row   public.exhibits;
BEGIN
  INSERT INTO public.exhibit_sets (case_id, numbering_style)
  VALUES ('00000000-0000-0000-0000-0000000000c1', 'numeric')
  RETURNING id INTO v_set_id;

  -- First call → exhibit_no = '1', sort_order = 1
  SELECT * INTO v_row FROM public.assign_next_exhibit_number(
    v_set_id,
    '00000000-0000-0000-0000-0000000000e1',
    'Lease agreement'
  );
  ASSERT v_row.exhibit_no   = '1',  format('Expected "1", got "%s"', v_row.exhibit_no);
  ASSERT v_row.sort_order   = 1,    format('Expected sort_order 1, got %s', v_row.sort_order);
  ASSERT v_row.title         = 'Lease agreement', 'Title mismatch';

  -- Second call → exhibit_no = '2', sort_order = 2
  SELECT * INTO v_row FROM public.assign_next_exhibit_number(
    v_set_id,
    '00000000-0000-0000-0000-0000000000e2'
  );
  ASSERT v_row.exhibit_no = '2', format('Expected "2", got "%s"', v_row.exhibit_no);
  ASSERT v_row.sort_order = 2,   format('Expected sort_order 2, got %s', v_row.sort_order);

  -- Verify next_number was bumped to 3
  ASSERT (SELECT next_number FROM public.exhibit_sets WHERE id = v_set_id) = 3,
    'next_number should be 3 after two inserts';

  DELETE FROM public.exhibit_sets WHERE id = v_set_id;

  RAISE NOTICE '✓ Test 1 passed: numeric sequential numbering';
END;
$$;

-- ── Test 2: Alpha numbering (A, B, ...) ───────

DO $$
DECLARE
  v_set_id uuid;
  v_row   public.exhibits;
BEGIN
  INSERT INTO public.exhibit_sets (case_id, numbering_style)
  VALUES ('00000000-0000-0000-0000-0000000000c1', 'alpha')
  RETURNING id INTO v_set_id;

  SELECT * INTO v_row FROM public.assign_next_exhibit_number(
    v_set_id, '00000000-0000-0000-0000-0000000000e1'
  );
  ASSERT v_row.exhibit_no = 'A', format('Expected "A", got "%s"', v_row.exhibit_no);

  SELECT * INTO v_row FROM public.assign_next_exhibit_number(
    v_set_id, '00000000-0000-0000-0000-0000000000e2'
  );
  ASSERT v_row.exhibit_no = 'B', format('Expected "B", got "%s"', v_row.exhibit_no);

  DELETE FROM public.exhibit_sets WHERE id = v_set_id;

  RAISE NOTICE '✓ Test 2 passed: alpha numbering';
END;
$$;

-- ── Test 3: Alpha >26 raises error ────────────

DO $$
DECLARE
  v_set_id uuid;
BEGIN
  INSERT INTO public.exhibit_sets (case_id, numbering_style, next_number)
  VALUES ('00000000-0000-0000-0000-0000000000c1', 'alpha', 27)
  RETURNING id INTO v_set_id;

  BEGIN
    PERFORM public.assign_next_exhibit_number(
      v_set_id, '00000000-0000-0000-0000-0000000000e1'
    );
    RAISE EXCEPTION 'Should have raised an error for alpha > 26';
  EXCEPTION WHEN check_violation THEN
    RAISE NOTICE '✓ Test 3 passed: alpha >26 raises check_violation';
  END;

  DELETE FROM public.exhibit_sets WHERE id = v_set_id;
END;
$$;

-- ── Test 4: Duplicate evidence item raises error

DO $$
DECLARE
  v_set_id uuid;
BEGIN
  INSERT INTO public.exhibit_sets (case_id, numbering_style)
  VALUES ('00000000-0000-0000-0000-0000000000c1', 'numeric')
  RETURNING id INTO v_set_id;

  PERFORM public.assign_next_exhibit_number(
    v_set_id, '00000000-0000-0000-0000-0000000000e1'
  );

  BEGIN
    PERFORM public.assign_next_exhibit_number(
      v_set_id, '00000000-0000-0000-0000-0000000000e1'
    );
    RAISE EXCEPTION 'Should have raised duplicate error';
  EXCEPTION WHEN unique_violation THEN
    RAISE NOTICE '✓ Test 4 passed: duplicate evidence item raises unique_violation';
  END;

  DELETE FROM public.exhibit_sets WHERE id = v_set_id;
END;
$$;

-- ── Test 5: Concurrent calls → no duplicate exhibit_no
--
-- Uses dblink to open two independent connections that call
-- the RPC simultaneously on the same exhibit set.
-- The FOR UPDATE lock in the function serialises them.
--
-- The exhibit set is created as a separate committed statement so
-- the dblink sessions (independent transactions) can see it.

INSERT INTO public.exhibit_sets (id, case_id, numbering_style)
VALUES ('00000000-0000-0000-0000-00000000ee55', '00000000-0000-0000-0000-0000000000c1', 'numeric');

DO $$
DECLARE
  v_set_id  uuid := '00000000-0000-0000-0000-00000000ee55';
  v_connstr text := format(
    'dbname=postgres host=%s port=%s user=postgres password=postgres',
    host(inet_server_addr()), inet_server_port()::text
  );
  v_sql_1   text;
  v_sql_2   text;
  v_conn_1  text := 'test_conn_1';
  v_conn_2  text := 'test_conn_2';
  v_dup_count int;
BEGIN
  -- Build SQL for each connection
  v_sql_1 := format(
    'SELECT * FROM public.assign_next_exhibit_number(%L::uuid, %L::uuid)',
    v_set_id, '00000000-0000-0000-0000-0000000000e1'
  );
  v_sql_2 := format(
    'SELECT * FROM public.assign_next_exhibit_number(%L::uuid, %L::uuid)',
    v_set_id, '00000000-0000-0000-0000-0000000000e2'
  );

  -- Open two independent connections
  PERFORM dblink_connect(v_conn_1, v_connstr);
  PERFORM dblink_connect(v_conn_2, v_connstr);

  -- Fire both asynchronously (they'll contend on FOR UPDATE)
  PERFORM dblink_send_query(v_conn_1, v_sql_1);
  PERFORM dblink_send_query(v_conn_2, v_sql_2);

  -- Collect results (blocks until each completes).
  -- dblink_get_result returns SETOF record, so we must provide a column list.
  PERFORM r FROM dblink_get_result(v_conn_1) AS r(
    id uuid, exhibit_set_id uuid, evidence_item_id uuid,
    exhibit_no text, sort_order int, title text, description text, created_at timestamptz
  );
  PERFORM r FROM dblink_get_result(v_conn_2) AS r(
    id uuid, exhibit_set_id uuid, evidence_item_id uuid,
    exhibit_no text, sort_order int, title text, description text, created_at timestamptz
  );

  -- Disconnect
  PERFORM dblink_disconnect(v_conn_1);
  PERFORM dblink_disconnect(v_conn_2);

  -- Verify: no duplicate exhibit_no values
  SELECT count(*) - count(DISTINCT exhibit_no)
    INTO v_dup_count
    FROM public.exhibits
   WHERE exhibit_set_id = v_set_id;

  ASSERT v_dup_count = 0,
    format('Found %s duplicate exhibit numbers after concurrent insert!', v_dup_count);

  -- Verify both rows were inserted with sequential numbers
  ASSERT (SELECT count(*) FROM public.exhibits WHERE exhibit_set_id = v_set_id) = 2,
    'Expected 2 exhibits after concurrent insert';

  -- Verify next_number is now 3
  ASSERT (SELECT next_number FROM public.exhibit_sets WHERE id = v_set_id) = 3,
    'next_number should be 3 after two concurrent inserts';

  DELETE FROM public.exhibit_sets WHERE id = v_set_id;

  RAISE NOTICE '✓ Test 5 passed: concurrent calls produce no duplicate exhibit_no';
END;
$$;

-- ── Test 6: Nonexistent exhibit set raises error

DO $$
BEGIN
  BEGIN
    PERFORM public.assign_next_exhibit_number(
      gen_random_uuid(),
      '00000000-0000-0000-0000-0000000000e1'
    );
    RAISE EXCEPTION 'Should have raised not-found error';
  EXCEPTION WHEN no_data_found THEN
    RAISE NOTICE '✓ Test 6 passed: nonexistent exhibit set raises no_data_found';
  END;
END;
$$;

-- ── Cleanup fixtures ───────────────────────────

DELETE FROM public.exhibit_sets WHERE case_id = '00000000-0000-0000-0000-0000000000c1';
DELETE FROM public.evidence_items WHERE id IN (
  '00000000-0000-0000-0000-0000000000e1',
  '00000000-0000-0000-0000-0000000000e2',
  '00000000-0000-0000-0000-0000000000e3',
  '00000000-0000-0000-0000-0000000000e4'
);
DELETE FROM public.cases WHERE id = '00000000-0000-0000-0000-0000000000c1';
DELETE FROM auth.users  WHERE id = '00000000-0000-0000-0000-000000000099';

\echo ''
\echo '══════════════════════════════════════════'
\echo '  All exhibit numbering tests passed'
\echo '══════════════════════════════════════════'
