-- Allows a user to change their case's dispute type.
-- Creates a new case with the new type (firing seed_case_tasks trigger),
-- inserts sub-type detail rows when needed (family/business fire secondary triggers),
-- archives the old case, and returns the new case_id.
CREATE OR REPLACE FUNCTION public.change_case_type(
  p_case_id         uuid,
  p_new_type        text,
  p_family_sub_type text DEFAULT NULL,
  p_business_sub_type text DEFAULT NULL,
  p_lt_sub_type     text DEFAULT NULL,
  p_pi_sub_type     text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id   uuid := auth.uid();
  v_case      record;
  v_new_id    uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_case FROM cases WHERE id = p_case_id AND user_id = v_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Case not found';
  END IF;

  -- Business requires a sub-type for task seeding
  IF p_new_type = 'business' AND p_business_sub_type IS NULL THEN
    RAISE EXCEPTION 'business_sub_type is required when changing to a business case';
  END IF;

  -- Family requires a sub-type for task seeding
  IF p_new_type = 'family' AND p_family_sub_type IS NULL THEN
    RAISE EXCEPTION 'family_sub_type is required when changing to a family case';
  END IF;

  -- Create new case — this fires seed_case_tasks AFTER INSERT
  INSERT INTO cases (user_id, role, county, court_type, dispute_type, state, jurisdiction)
  VALUES (
    v_user_id,
    v_case.role,
    v_case.county,
    v_case.court_type,
    p_new_type,
    v_case.state,
    v_case.jurisdiction
  )
  RETURNING id INTO v_new_id;

  -- Family: insert detail row to fire seed_family_tasks trigger
  IF p_new_type = 'family' THEN
    INSERT INTO family_case_details (case_id, family_sub_type, domestic_violence_flag)
    VALUES (v_new_id, p_family_sub_type, p_family_sub_type = 'protective_order');
  END IF;

  -- Business: insert detail row to fire seed_business_tasks trigger
  IF p_new_type = 'business' THEN
    INSERT INTO business_details (case_id, business_sub_type)
    VALUES (v_new_id, p_business_sub_type);
  END IF;

  -- Landlord-tenant: insert detail row for sub-type metadata (tasks already seeded above)
  IF p_new_type = 'landlord_tenant' AND p_lt_sub_type IS NOT NULL THEN
    INSERT INTO landlord_tenant_details (case_id, landlord_tenant_sub_type, party_role)
    VALUES (v_new_id, p_lt_sub_type,
            CASE WHEN v_case.role = 'plaintiff' THEN 'landlord' ELSE 'tenant' END);
  END IF;

  -- Personal injury: store sub-type if provided
  IF p_new_type = 'personal_injury' AND p_pi_sub_type IS NOT NULL THEN
    INSERT INTO personal_injury_details (case_id, pi_sub_type)
    VALUES (v_new_id, p_pi_sub_type);
  END IF;

  -- Archive the old case
  UPDATE cases SET status = 'archived' WHERE id = p_case_id;

  RETURN v_new_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.change_case_type(uuid, text, text, text, text, text) TO authenticated;
