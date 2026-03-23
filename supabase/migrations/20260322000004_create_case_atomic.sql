-- Atomic case creation RPC: creates case + sub-type detail in a single transaction.
-- Replaces the sequential insert pattern in the API route that could leave orphaned cases.
-- Note: GRANT is handled via supabase's default permissions for authenticated users calling RPC.
CREATE OR REPLACE FUNCTION public.create_case_atomic(
  p_role text,
  p_county text DEFAULT NULL,
  p_court_type text DEFAULT NULL,
  p_dispute_type text DEFAULT NULL,
  p_state text DEFAULT 'Texas',
  p_family_sub_type text DEFAULT NULL,
  p_small_claims_sub_type text DEFAULT NULL,
  p_landlord_tenant_sub_type text DEFAULT NULL,
  p_debt_sub_type text DEFAULT NULL,
  p_pi_sub_type text DEFAULT NULL,
  p_business_sub_type text DEFAULT NULL,
  p_contract_sub_type text DEFAULT NULL,
  p_property_sub_type text DEFAULT NULL,
  p_other_sub_type text DEFAULT NULL,
  p_re_sub_type text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_case_id uuid;
  v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_dispute_type = 'business' AND p_business_sub_type IS NULL THEN
    RAISE EXCEPTION 'business_sub_type is required for business cases';
  END IF;

  INSERT INTO public.cases (user_id, role, county, court_type, dispute_type, state)
  VALUES (v_user_id, p_role, p_county, p_court_type, p_dispute_type, p_state)
  RETURNING id INTO v_case_id;

  IF p_family_sub_type IS NOT NULL THEN
    INSERT INTO public.family_case_details (case_id, family_sub_type, domestic_violence_flag)
    VALUES (v_case_id, p_family_sub_type, p_family_sub_type = 'protective_order');
  ELSIF p_small_claims_sub_type IS NOT NULL THEN
    INSERT INTO public.small_claims_details (case_id, claim_sub_type)
    VALUES (v_case_id, p_small_claims_sub_type);
  ELSIF p_landlord_tenant_sub_type IS NOT NULL THEN
    INSERT INTO public.landlord_tenant_details (case_id, landlord_tenant_sub_type, party_role)
    VALUES (v_case_id, p_landlord_tenant_sub_type,
            CASE WHEN p_role = 'plaintiff' THEN 'landlord' ELSE 'tenant' END);
  ELSIF p_debt_sub_type IS NOT NULL AND p_role = 'defendant' THEN
    INSERT INTO public.debt_defense_details (case_id, debt_sub_type)
    VALUES (v_case_id, p_debt_sub_type);
  ELSIF p_pi_sub_type IS NOT NULL THEN
    INSERT INTO public.personal_injury_details (case_id, pi_sub_type)
    VALUES (v_case_id, p_pi_sub_type);
  ELSIF p_business_sub_type IS NOT NULL THEN
    INSERT INTO public.business_details (case_id, business_sub_type)
    VALUES (v_case_id, p_business_sub_type);
  ELSIF p_contract_sub_type IS NOT NULL THEN
    INSERT INTO public.contract_details (case_id, contract_sub_type)
    VALUES (v_case_id, p_contract_sub_type);
  ELSIF p_property_sub_type IS NOT NULL THEN
    INSERT INTO public.property_dispute_details (case_id, property_sub_type)
    VALUES (v_case_id, p_property_sub_type);
  ELSIF p_other_sub_type IS NOT NULL THEN
    INSERT INTO public.other_case_details (case_id, other_sub_type)
    VALUES (v_case_id, p_other_sub_type);
  ELSIF p_re_sub_type IS NOT NULL THEN
    INSERT INTO public.real_estate_details (case_id, re_sub_type)
    VALUES (v_case_id, p_re_sub_type);
  END IF;

  RETURN v_case_id;
END;
$fn$;
