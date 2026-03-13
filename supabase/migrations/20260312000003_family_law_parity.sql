-- =============================================================
-- FAMILY LAW WORKFLOW PARITY
-- =============================================================
-- Splits the single "family" workflow branch into 7 sub-type-
-- specific branches:
--   divorce (12 tasks), custody (10), child_support (8),
--   visitation (9), spousal_support (8), protective_order (6),
--   modification (9)
--
-- Steps:
--   1. Rename existing generic task_keys per sub-type
--   2. Insert new sub-type-specific tasks
--   3. Delete tasks that don't apply per sub-type
--   4. CREATE OR REPLACE seed_case_tasks()
--   5. CREATE OR REPLACE unlock_next_task()
-- =============================================================


-- =============================================================
-- STEP 1: Rename existing family tasks based on sub-type
-- =============================================================

-- family_intake → {subtype}_intake
UPDATE public.tasks t
SET task_key = CASE fcd.family_sub_type
  WHEN 'divorce' THEN 'divorce_intake'
  WHEN 'custody' THEN 'custody_intake'
  WHEN 'child_support' THEN 'child_support_intake'
  WHEN 'visitation' THEN 'visitation_intake'
  WHEN 'spousal_support' THEN 'spousal_support_intake'
  WHEN 'protective_order' THEN 'po_intake'
  WHEN 'modification' THEN 'mod_intake'
END
FROM public.family_case_details fcd
WHERE t.case_id = fcd.case_id
  AND t.task_key = 'family_intake'
  AND fcd.family_sub_type IS NOT NULL;

-- safety_screening → {subtype}_safety_screening (divorce, custody, visitation, PO only)
UPDATE public.tasks t
SET task_key = CASE fcd.family_sub_type
  WHEN 'divorce' THEN 'divorce_safety_screening'
  WHEN 'custody' THEN 'custody_safety_screening'
  WHEN 'visitation' THEN 'visitation_safety_screening'
  WHEN 'protective_order' THEN 'po_safety_screening'
END
FROM public.family_case_details fcd
WHERE t.case_id = fcd.case_id
  AND t.task_key = 'safety_screening'
  AND fcd.family_sub_type IN ('divorce', 'custody', 'visitation', 'protective_order');

-- evidence_vault → {subtype}_evidence_vault (all except PO)
UPDATE public.tasks t
SET task_key = CASE fcd.family_sub_type
  WHEN 'divorce' THEN 'divorce_evidence_vault'
  WHEN 'custody' THEN 'custody_evidence_vault'
  WHEN 'child_support' THEN 'child_support_evidence_vault'
  WHEN 'visitation' THEN 'visitation_evidence_vault'
  WHEN 'spousal_support' THEN 'spousal_support_evidence_vault'
  WHEN 'modification' THEN 'mod_evidence_vault'
END
FROM public.family_case_details fcd
WHERE t.case_id = fcd.case_id
  AND t.task_key = 'evidence_vault'
  AND fcd.family_sub_type IN ('divorce', 'custody', 'child_support', 'visitation', 'spousal_support', 'modification');

-- prepare_family_filing → {subtype}_prepare_filing
UPDATE public.tasks t
SET task_key = CASE fcd.family_sub_type
  WHEN 'divorce' THEN 'divorce_prepare_filing'
  WHEN 'custody' THEN 'custody_prepare_filing'
  WHEN 'child_support' THEN 'child_support_prepare_filing'
  WHEN 'visitation' THEN 'visitation_prepare_filing'
  WHEN 'spousal_support' THEN 'spousal_support_prepare_filing'
  WHEN 'protective_order' THEN 'po_prepare_filing'
  WHEN 'modification' THEN 'mod_prepare_filing'
END
FROM public.family_case_details fcd
WHERE t.case_id = fcd.case_id
  AND t.task_key = 'prepare_family_filing'
  AND fcd.family_sub_type IS NOT NULL;

-- file_with_court → {subtype}_file_with_court
UPDATE public.tasks t
SET task_key = CASE fcd.family_sub_type
  WHEN 'divorce' THEN 'divorce_file_with_court'
  WHEN 'custody' THEN 'custody_file_with_court'
  WHEN 'child_support' THEN 'child_support_file_with_court'
  WHEN 'visitation' THEN 'visitation_file_with_court'
  WHEN 'spousal_support' THEN 'spousal_support_file_with_court'
  WHEN 'protective_order' THEN 'po_file_with_court'
  WHEN 'modification' THEN 'mod_file_with_court'
END
FROM public.family_case_details fcd
WHERE t.case_id = fcd.case_id
  AND t.task_key = 'file_with_court'
  AND fcd.family_sub_type IS NOT NULL
  AND fcd.case_id IN (SELECT id FROM public.cases WHERE dispute_type = 'family');

-- upload_return_of_service → {subtype}_serve_respondent (all except PO)
UPDATE public.tasks t
SET task_key = CASE fcd.family_sub_type
  WHEN 'divorce' THEN 'divorce_serve_respondent'
  WHEN 'custody' THEN 'custody_serve_respondent'
  WHEN 'child_support' THEN 'child_support_serve_respondent'
  WHEN 'visitation' THEN 'visitation_serve_respondent'
  WHEN 'spousal_support' THEN 'spousal_support_serve_respondent'
  WHEN 'modification' THEN 'mod_serve_respondent'
END
FROM public.family_case_details fcd
WHERE t.case_id = fcd.case_id
  AND t.task_key = 'upload_return_of_service'
  AND fcd.family_sub_type IN ('divorce', 'custody', 'child_support', 'visitation', 'spousal_support', 'modification');

-- waiting_period → divorce_waiting_period (divorce only)
UPDATE public.tasks t
SET task_key = 'divorce_waiting_period'
FROM public.family_case_details fcd
WHERE t.case_id = fcd.case_id
  AND t.task_key = 'waiting_period'
  AND fcd.family_sub_type = 'divorce';

-- temporary_orders → {subtype}_temporary_orders (divorce, custody, child_support, spousal_support)
UPDATE public.tasks t
SET task_key = CASE fcd.family_sub_type
  WHEN 'divorce' THEN 'divorce_temporary_orders'
  WHEN 'custody' THEN 'custody_temporary_orders'
  WHEN 'child_support' THEN 'child_support_temporary_orders'
  WHEN 'spousal_support' THEN 'spousal_support_temporary_orders'
END
FROM public.family_case_details fcd
WHERE t.case_id = fcd.case_id
  AND t.task_key = 'temporary_orders'
  AND fcd.family_sub_type IN ('divorce', 'custody', 'child_support', 'spousal_support');

-- mediation → {subtype}_mediation (divorce, custody, visitation, modification)
UPDATE public.tasks t
SET task_key = CASE fcd.family_sub_type
  WHEN 'divorce' THEN 'divorce_mediation'
  WHEN 'custody' THEN 'custody_mediation'
  WHEN 'visitation' THEN 'visitation_mediation'
  WHEN 'modification' THEN 'mod_mediation'
END
FROM public.family_case_details fcd
WHERE t.case_id = fcd.case_id
  AND t.task_key = 'mediation'
  AND fcd.family_sub_type IN ('divorce', 'custody', 'visitation', 'modification');

-- final_orders → {subtype}_final_orders (all except PO)
UPDATE public.tasks t
SET task_key = CASE fcd.family_sub_type
  WHEN 'divorce' THEN 'divorce_final_orders'
  WHEN 'custody' THEN 'custody_final_orders'
  WHEN 'child_support' THEN 'child_support_final_orders'
  WHEN 'visitation' THEN 'visitation_final_orders'
  WHEN 'spousal_support' THEN 'spousal_support_final_orders'
  WHEN 'modification' THEN 'mod_final_orders'
END
FROM public.family_case_details fcd
WHERE t.case_id = fcd.case_id
  AND t.task_key = 'final_orders'
  AND fcd.family_sub_type IN ('divorce', 'custody', 'child_support', 'visitation', 'spousal_support', 'modification');


-- =============================================================
-- STEP 2: Insert new sub-type-specific tasks for existing cases
-- =============================================================

-- divorce_property_division (divorce only)
INSERT INTO public.tasks (case_id, task_key, title, status)
SELECT c.id, 'divorce_property_division', 'Divide Community Property', 'locked'
FROM public.cases c
JOIN public.family_case_details fcd ON fcd.case_id = c.id
WHERE c.dispute_type = 'family'
  AND fcd.family_sub_type = 'divorce'
  AND NOT EXISTS (
    SELECT 1 FROM public.tasks t
    WHERE t.case_id = c.id AND t.task_key = 'divorce_property_division'
  );

-- mod_existing_order_review (modification only)
INSERT INTO public.tasks (case_id, task_key, title, status)
SELECT c.id, 'mod_existing_order_review', 'Review Existing Court Order', 'locked'
FROM public.cases c
JOIN public.family_case_details fcd ON fcd.case_id = c.id
WHERE c.dispute_type = 'family'
  AND fcd.family_sub_type = 'modification'
  AND NOT EXISTS (
    SELECT 1 FROM public.tasks t
    WHERE t.case_id = c.id AND t.task_key = 'mod_existing_order_review'
  );

-- po_hearing (protective_order only)
INSERT INTO public.tasks (case_id, task_key, title, status)
SELECT c.id, 'po_hearing', 'Protective Order Hearing', 'locked'
FROM public.cases c
JOIN public.family_case_details fcd ON fcd.case_id = c.id
WHERE c.dispute_type = 'family'
  AND fcd.family_sub_type = 'protective_order'
  AND NOT EXISTS (
    SELECT 1 FROM public.tasks t
    WHERE t.case_id = c.id AND t.task_key = 'po_hearing'
  );


-- =============================================================
-- STEP 3: Delete tasks that don't apply per sub-type
-- =============================================================

-- PO: delete tasks that PO doesn't use
DELETE FROM public.tasks t
USING public.family_case_details fcd
WHERE t.case_id = fcd.case_id
  AND fcd.family_sub_type = 'protective_order'
  AND t.task_key IN (
    'evidence_vault', 'upload_return_of_service', 'confirm_service_facts',
    'waiting_period', 'temporary_orders', 'mediation', 'final_orders'
  );

-- child_support, spousal_support: delete safety_screening (they don't have it)
DELETE FROM public.tasks t
USING public.family_case_details fcd
WHERE t.case_id = fcd.case_id
  AND fcd.family_sub_type IN ('child_support', 'spousal_support')
  AND t.task_key = 'safety_screening';

-- child_support, spousal_support, modification: delete waiting_period
DELETE FROM public.tasks t
USING public.family_case_details fcd
WHERE t.case_id = fcd.case_id
  AND fcd.family_sub_type IN ('child_support', 'spousal_support', 'modification')
  AND t.task_key = 'waiting_period';

-- All family sub-types: delete confirm_service_facts (absorbed into serve_respondent)
DELETE FROM public.tasks t
USING public.family_case_details fcd
WHERE t.case_id = fcd.case_id
  AND t.task_key = 'confirm_service_facts'
  AND fcd.case_id IN (SELECT id FROM public.cases WHERE dispute_type = 'family');

-- visitation: delete temporary_orders (visitation doesn't have it)
DELETE FROM public.tasks t
USING public.family_case_details fcd
WHERE t.case_id = fcd.case_id
  AND fcd.family_sub_type = 'visitation'
  AND t.task_key = 'temporary_orders';

-- child_support, spousal_support: delete mediation (they don't have it)
DELETE FROM public.tasks t
USING public.family_case_details fcd
WHERE t.case_id = fcd.case_id
  AND fcd.family_sub_type IN ('child_support', 'spousal_support')
  AND t.task_key = 'mediation';

-- modification: delete temporary_orders (modification doesn't have it)
DELETE FROM public.tasks t
USING public.family_case_details fcd
WHERE t.case_id = fcd.case_id
  AND fcd.family_sub_type = 'modification'
  AND t.task_key = 'temporary_orders';


-- =============================================================
-- STEP 4: CREATE OR REPLACE seed_case_tasks()
-- =============================================================

CREATE OR REPLACE FUNCTION public.seed_case_tasks()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_family_sub_type TEXT;
BEGIN
  -- ========================================
  -- Contract cases — early return
  -- ========================================
  IF NEW.dispute_type = 'contract' THEN
    INSERT INTO public.tasks (case_id, task_key, title, status, unlocked_at)
    VALUES (NEW.id, 'welcome', 'Welcome — Get Started', 'todo', now());

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES
      (NEW.id, 'contract_intake', 'Tell Us About Your Contract Dispute', 'locked'),
      (NEW.id, 'evidence_vault', 'Organize Your Evidence', 'locked'),
      (NEW.id, 'contract_demand_letter', 'Draft Your Demand Letter', 'locked'),
      (NEW.id, 'contract_negotiation', 'Settlement Negotiation', 'locked'),
      (NEW.id, 'contract_prepare_filing', 'Prepare Your Court Filing', 'locked'),
      (NEW.id, 'contract_file_with_court', 'File With the Court', 'locked'),
      (NEW.id, 'contract_serve_defendant', 'Serve the Defendant', 'locked'),
      (NEW.id, 'contract_wait_for_answer', 'Wait for the Answer', 'locked'),
      (NEW.id, 'contract_review_answer', 'Review the Opposing Answer', 'locked'),
      (NEW.id, 'contract_discovery', 'Prepare Your Discovery', 'locked'),
      (NEW.id, 'contract_mediation', 'Mediation', 'locked'),
      (NEW.id, 'contract_post_resolution', 'Post-Resolution Steps', 'locked');

    INSERT INTO public.task_events (case_id, kind, payload)
    VALUES (NEW.id, 'case_created', jsonb_build_object(
      'role', NEW.role,
      'county', NEW.county,
      'court_type', NEW.court_type,
      'dispute_type', NEW.dispute_type,
      'tasks_seeded', 13
    ));

    RETURN NEW;
  END IF;

  -- ========================================
  -- Property cases — early return
  -- ========================================
  IF NEW.dispute_type = 'property' THEN
    INSERT INTO public.tasks (case_id, task_key, title, status, unlocked_at)
    VALUES (NEW.id, 'welcome', 'Welcome — Get Started', 'todo', now());

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES
      (NEW.id, 'property_intake', 'Tell Us About Your Property Dispute', 'locked'),
      (NEW.id, 'evidence_vault', 'Organize Your Evidence', 'locked'),
      (NEW.id, 'property_demand_letter', 'Draft Your Demand Letter', 'locked'),
      (NEW.id, 'property_negotiation', 'Attempt Resolution', 'locked'),
      (NEW.id, 'property_prepare_filing', 'Prepare Your Court Filing', 'locked'),
      (NEW.id, 'property_file_with_court', 'File With the Court', 'locked'),
      (NEW.id, 'property_serve_defendant', 'Serve the Other Party', 'locked'),
      (NEW.id, 'property_wait_for_answer', 'Wait for the Answer', 'locked'),
      (NEW.id, 'property_review_answer', 'Review the Opposing Answer', 'locked'),
      (NEW.id, 'property_discovery', 'Prepare Your Discovery', 'locked'),
      (NEW.id, 'property_post_resolution', 'Post-Resolution Steps', 'locked');

    INSERT INTO public.task_events (case_id, kind, payload)
    VALUES (NEW.id, 'case_created', jsonb_build_object(
      'role', NEW.role,
      'county', NEW.county,
      'court_type', NEW.court_type,
      'dispute_type', NEW.dispute_type,
      'tasks_seeded', 12
    ));

    RETURN NEW;
  END IF;

  -- ========================================
  -- Other cases — early return
  -- ========================================
  IF NEW.dispute_type = 'other' THEN
    INSERT INTO public.tasks (case_id, task_key, title, status, unlocked_at)
    VALUES (NEW.id, 'welcome', 'Welcome — Get Started', 'todo', now());

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES
      (NEW.id, 'other_intake', 'Tell Us About Your Situation', 'locked'),
      (NEW.id, 'evidence_vault', 'Organize Your Evidence', 'locked'),
      (NEW.id, 'other_demand_letter', 'Draft Your Demand Letter', 'locked'),
      (NEW.id, 'other_prepare_filing', 'Prepare Your Court Filing', 'locked'),
      (NEW.id, 'other_file_with_court', 'File With the Court', 'locked'),
      (NEW.id, 'other_serve_defendant', 'Serve the Other Party', 'locked'),
      (NEW.id, 'other_wait_for_answer', 'Wait for the Answer', 'locked'),
      (NEW.id, 'other_review_answer', 'Review the Opposing Answer', 'locked'),
      (NEW.id, 'other_discovery', 'Prepare Your Discovery', 'locked'),
      (NEW.id, 'other_post_resolution', 'Post-Resolution Steps', 'locked');

    INSERT INTO public.task_events (case_id, kind, payload)
    VALUES (NEW.id, 'case_created', jsonb_build_object(
      'role', NEW.role,
      'county', NEW.county,
      'court_type', NEW.court_type,
      'dispute_type', NEW.dispute_type,
      'tasks_seeded', 11
    ));

    RETURN NEW;
  END IF;

  -- ========================================
  -- Personal injury cases — early return
  -- ========================================
  IF NEW.dispute_type = 'personal_injury' THEN
    INSERT INTO public.tasks (case_id, task_key, title, status, unlocked_at)
    VALUES (NEW.id, 'welcome', 'Welcome — Get Started', 'todo', now());

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'pi_intake', 'Tell Us About Your Injury', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'pi_medical_records', 'Organize Your Medical Records', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'evidence_vault', 'Collect Your Evidence', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'preservation_letter', 'Send a Preservation Letter', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'pi_insurance_communication', 'Communicate With Insurance', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'prepare_pi_demand_letter', 'Draft Your Demand Letter', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'pi_settlement_negotiation', 'Negotiate Your Settlement', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'prepare_pi_petition', 'Prepare Your Court Petition', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'pi_file_with_court', 'File With the Court', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'pi_serve_defendant', 'Serve the Defendant', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'pi_wait_for_answer', 'Wait for the Answer', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'pi_review_answer', 'Review the Opposing Answer', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'pi_discovery_prep', 'Prepare Your Discovery Requests', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'pi_discovery_responses', 'Respond to Opposing Discovery', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'pi_scheduling_conference', 'Scheduling Conference & Court Dates', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'pi_pretrial_motions', 'Pre-Trial Motions', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'pi_mediation', 'Mediation & Settlement Conference', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'pi_trial_prep', 'Prepare for Trial', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'pi_post_resolution', 'After Resolution', 'locked');

    INSERT INTO public.task_events (case_id, kind, payload)
    VALUES (NEW.id, 'case_created', jsonb_build_object(
      'role', NEW.role,
      'county', NEW.county,
      'court_type', NEW.court_type,
      'dispute_type', NEW.dispute_type
    ));

    RETURN NEW;
  END IF;

  -- ========================================
  -- Debt collection defendant cases — early return
  -- ========================================
  IF NEW.dispute_type = 'debt_collection' AND NEW.role = 'defendant' THEN
    INSERT INTO public.tasks (case_id, task_key, title, status, unlocked_at)
    VALUES (NEW.id, 'welcome', 'Welcome — Get Started', 'todo', now());

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'debt_defense_intake', 'Tell Us About the Debt', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'evidence_vault', 'Organize Your Evidence', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'prepare_debt_validation_letter', 'Draft a Debt Validation Letter', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'prepare_debt_defense_answer', 'Prepare Your Answer', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'debt_file_with_court', 'File With the Court', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'serve_plaintiff', 'Serve the Plaintiff', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'debt_hearing_prep', 'Prepare for Your Hearing', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'debt_hearing_day', 'Hearing Day', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'debt_post_judgment', 'After the Ruling', 'locked');

    INSERT INTO public.task_events (case_id, kind, payload)
    VALUES (NEW.id, 'case_created', jsonb_build_object(
      'role', NEW.role,
      'county', NEW.county,
      'court_type', NEW.court_type,
      'dispute_type', NEW.dispute_type
    ));

    RETURN NEW;
  END IF;

  -- ========================================
  -- Landlord-tenant cases — 16 tasks
  -- ========================================
  IF NEW.dispute_type = 'landlord_tenant' THEN
    INSERT INTO public.tasks (case_id, task_key, title, status, unlocked_at)
    VALUES (NEW.id, 'welcome', 'Welcome — Get Started', 'todo', now());

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES
      (NEW.id, 'landlord_tenant_intake', 'Tell Us About Your Situation', 'locked'),
      (NEW.id, 'evidence_vault', 'Organize Your Evidence', 'locked'),
      (NEW.id, 'prepare_lt_demand_letter', 'Draft a Demand Letter', 'locked'),
      (NEW.id, 'lt_negotiation', 'Settlement Negotiation', 'locked'),
      (NEW.id, 'prepare_landlord_tenant_filing', 'Prepare Your Court Filing', 'locked'),
      (NEW.id, 'lt_file_with_court', 'File With the Court', 'locked'),
      (NEW.id, 'serve_other_party', 'Serve the Other Party', 'locked'),
      (NEW.id, 'lt_wait_for_response', 'Wait for the Response', 'locked'),
      (NEW.id, 'lt_review_response', 'Review the Response', 'locked'),
      (NEW.id, 'lt_discovery', 'Discovery', 'locked'),
      (NEW.id, 'lt_prepare_for_hearing', 'Prepare for Your Hearing', 'locked'),
      (NEW.id, 'lt_mediation', 'Mediation', 'locked'),
      (NEW.id, 'lt_hearing_day', 'Hearing Day', 'locked'),
      (NEW.id, 'lt_post_judgment', 'After the Ruling', 'locked');

    INSERT INTO public.task_events (case_id, kind, payload)
    VALUES (NEW.id, 'case_created', jsonb_build_object(
      'role', NEW.role,
      'county', NEW.county,
      'court_type', NEW.court_type,
      'dispute_type', NEW.dispute_type,
      'tasks_seeded', 16
    ));

    RETURN NEW;
  END IF;

  -- ========================================
  -- Small claims cases — early return
  -- ========================================
  IF NEW.dispute_type = 'small_claims' THEN
    INSERT INTO public.tasks (case_id, task_key, title, status, unlocked_at)
    VALUES (NEW.id, 'welcome', 'Welcome — Get Started', 'todo', now());

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'small_claims_intake', 'Tell Us About Your Claim', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'evidence_vault', 'Organize Your Evidence', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'prepare_demand_letter', 'Draft a Demand Letter', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'prepare_small_claims_filing', 'Prepare Your Small Claims Petition', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'file_with_court', 'File With the Court', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'serve_defendant', 'Serve the Defendant', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'prepare_for_hearing', 'Prepare for Your Hearing', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'hearing_day', 'Hearing Day', 'locked');

    INSERT INTO public.task_events (case_id, kind, payload)
    VALUES (NEW.id, 'case_created', jsonb_build_object(
      'role', NEW.role,
      'county', NEW.county,
      'court_type', NEW.court_type,
      'dispute_type', NEW.dispute_type
    ));

    RETURN NEW;
  END IF;

  -- ========================================
  -- Family law cases — 7 sub-type branches
  -- ========================================
  IF NEW.dispute_type = 'family' THEN
    -- Look up family_sub_type from the details table
    SELECT family_sub_type INTO v_family_sub_type
    FROM public.family_case_details
    WHERE case_id = NEW.id;

    -- Fallback: if details not yet created, seed divorce as default
    IF v_family_sub_type IS NULL THEN
      v_family_sub_type := 'divorce';
    END IF;

    -- Welcome task (all sub-types)
    INSERT INTO public.tasks (case_id, task_key, title, status, unlocked_at)
    VALUES (NEW.id, 'welcome', 'Welcome — Get Started', 'todo', now());

    -- ---- DIVORCE (12 tasks) ----
    IF v_family_sub_type = 'divorce' THEN
      INSERT INTO public.tasks (case_id, task_key, title, status)
      VALUES
        (NEW.id, 'divorce_intake', 'Tell Us About Your Divorce', 'locked'),
        (NEW.id, 'divorce_safety_screening', 'Safety Check', 'locked'),
        (NEW.id, 'divorce_evidence_vault', 'Organize Your Evidence', 'locked'),
        (NEW.id, 'divorce_prepare_filing', 'Prepare Your Divorce Filing', 'locked'),
        (NEW.id, 'divorce_file_with_court', 'File With the Court', 'locked'),
        (NEW.id, 'divorce_serve_respondent', 'Serve the Respondent', 'locked'),
        (NEW.id, 'divorce_waiting_period', 'Mandatory Waiting Period', 'locked'),
        (NEW.id, 'divorce_temporary_orders', 'Request Temporary Orders', 'locked'),
        (NEW.id, 'divorce_mediation', 'Attend Mediation', 'locked'),
        (NEW.id, 'divorce_property_division', 'Divide Community Property', 'locked'),
        (NEW.id, 'divorce_final_orders', 'Final Decree of Divorce', 'locked');

      INSERT INTO public.task_events (case_id, kind, payload)
      VALUES (NEW.id, 'case_created', jsonb_build_object(
        'role', NEW.role,
        'county', NEW.county,
        'court_type', NEW.court_type,
        'dispute_type', NEW.dispute_type,
        'family_sub_type', v_family_sub_type,
        'tasks_seeded', 12
      ));

    -- ---- CUSTODY (10 tasks) ----
    ELSIF v_family_sub_type = 'custody' THEN
      INSERT INTO public.tasks (case_id, task_key, title, status)
      VALUES
        (NEW.id, 'custody_intake', 'Tell Us About Your Custody Matter', 'locked'),
        (NEW.id, 'custody_safety_screening', 'Safety Check', 'locked'),
        (NEW.id, 'custody_evidence_vault', 'Organize Your Evidence', 'locked'),
        (NEW.id, 'custody_prepare_filing', 'Prepare Your Custody Filing', 'locked'),
        (NEW.id, 'custody_file_with_court', 'File With the Court', 'locked'),
        (NEW.id, 'custody_serve_respondent', 'Serve the Respondent', 'locked'),
        (NEW.id, 'custody_temporary_orders', 'Request Temporary Orders', 'locked'),
        (NEW.id, 'custody_mediation', 'Attend Mediation', 'locked'),
        (NEW.id, 'custody_final_orders', 'Final Custody Orders', 'locked');

      INSERT INTO public.task_events (case_id, kind, payload)
      VALUES (NEW.id, 'case_created', jsonb_build_object(
        'role', NEW.role,
        'county', NEW.county,
        'court_type', NEW.court_type,
        'dispute_type', NEW.dispute_type,
        'family_sub_type', v_family_sub_type,
        'tasks_seeded', 10
      ));

    -- ---- CHILD SUPPORT (8 tasks) ----
    ELSIF v_family_sub_type = 'child_support' THEN
      INSERT INTO public.tasks (case_id, task_key, title, status)
      VALUES
        (NEW.id, 'child_support_intake', 'Tell Us About Your Child Support Matter', 'locked'),
        (NEW.id, 'child_support_evidence_vault', 'Organize Your Evidence', 'locked'),
        (NEW.id, 'child_support_prepare_filing', 'Prepare Your Filing', 'locked'),
        (NEW.id, 'child_support_file_with_court', 'File With the Court', 'locked'),
        (NEW.id, 'child_support_serve_respondent', 'Serve the Respondent', 'locked'),
        (NEW.id, 'child_support_temporary_orders', 'Request Temporary Orders', 'locked'),
        (NEW.id, 'child_support_final_orders', 'Final Child Support Orders', 'locked');

      INSERT INTO public.task_events (case_id, kind, payload)
      VALUES (NEW.id, 'case_created', jsonb_build_object(
        'role', NEW.role,
        'county', NEW.county,
        'court_type', NEW.court_type,
        'dispute_type', NEW.dispute_type,
        'family_sub_type', v_family_sub_type,
        'tasks_seeded', 8
      ));

    -- ---- VISITATION (9 tasks) ----
    ELSIF v_family_sub_type = 'visitation' THEN
      INSERT INTO public.tasks (case_id, task_key, title, status)
      VALUES
        (NEW.id, 'visitation_intake', 'Tell Us About Your Visitation Matter', 'locked'),
        (NEW.id, 'visitation_safety_screening', 'Safety Check', 'locked'),
        (NEW.id, 'visitation_evidence_vault', 'Organize Your Evidence', 'locked'),
        (NEW.id, 'visitation_prepare_filing', 'Prepare Your Visitation Filing', 'locked'),
        (NEW.id, 'visitation_file_with_court', 'File With the Court', 'locked'),
        (NEW.id, 'visitation_serve_respondent', 'Serve the Respondent', 'locked'),
        (NEW.id, 'visitation_mediation', 'Attend Mediation', 'locked'),
        (NEW.id, 'visitation_final_orders', 'Final Visitation Orders', 'locked');

      INSERT INTO public.task_events (case_id, kind, payload)
      VALUES (NEW.id, 'case_created', jsonb_build_object(
        'role', NEW.role,
        'county', NEW.county,
        'court_type', NEW.court_type,
        'dispute_type', NEW.dispute_type,
        'family_sub_type', v_family_sub_type,
        'tasks_seeded', 9
      ));

    -- ---- SPOUSAL SUPPORT (8 tasks) ----
    ELSIF v_family_sub_type = 'spousal_support' THEN
      INSERT INTO public.tasks (case_id, task_key, title, status)
      VALUES
        (NEW.id, 'spousal_support_intake', 'Tell Us About Your Spousal Support Matter', 'locked'),
        (NEW.id, 'spousal_support_evidence_vault', 'Organize Your Evidence', 'locked'),
        (NEW.id, 'spousal_support_prepare_filing', 'Prepare Your Filing', 'locked'),
        (NEW.id, 'spousal_support_file_with_court', 'File With the Court', 'locked'),
        (NEW.id, 'spousal_support_serve_respondent', 'Serve the Respondent', 'locked'),
        (NEW.id, 'spousal_support_temporary_orders', 'Request Temporary Orders', 'locked'),
        (NEW.id, 'spousal_support_final_orders', 'Final Spousal Support Orders', 'locked');

      INSERT INTO public.task_events (case_id, kind, payload)
      VALUES (NEW.id, 'case_created', jsonb_build_object(
        'role', NEW.role,
        'county', NEW.county,
        'court_type', NEW.court_type,
        'dispute_type', NEW.dispute_type,
        'family_sub_type', v_family_sub_type,
        'tasks_seeded', 8
      ));

    -- ---- PROTECTIVE ORDER (6 tasks) ----
    ELSIF v_family_sub_type = 'protective_order' THEN
      INSERT INTO public.tasks (case_id, task_key, title, status)
      VALUES
        (NEW.id, 'po_intake', 'Tell Us About Your Situation', 'locked'),
        (NEW.id, 'po_safety_screening', 'Safety Check', 'locked'),
        (NEW.id, 'po_prepare_filing', 'Prepare Your Protective Order Filing', 'locked'),
        (NEW.id, 'po_file_with_court', 'File With the Court', 'locked'),
        (NEW.id, 'po_hearing', 'Protective Order Hearing', 'locked');

      INSERT INTO public.task_events (case_id, kind, payload)
      VALUES (NEW.id, 'case_created', jsonb_build_object(
        'role', NEW.role,
        'county', NEW.county,
        'court_type', NEW.court_type,
        'dispute_type', NEW.dispute_type,
        'family_sub_type', v_family_sub_type,
        'tasks_seeded', 6
      ));

    -- ---- MODIFICATION (9 tasks) ----
    ELSIF v_family_sub_type = 'modification' THEN
      INSERT INTO public.tasks (case_id, task_key, title, status)
      VALUES
        (NEW.id, 'mod_intake', 'Tell Us About Your Modification', 'locked'),
        (NEW.id, 'mod_evidence_vault', 'Organize Your Evidence', 'locked'),
        (NEW.id, 'mod_existing_order_review', 'Review Existing Court Order', 'locked'),
        (NEW.id, 'mod_prepare_filing', 'Prepare Your Modification Filing', 'locked'),
        (NEW.id, 'mod_file_with_court', 'File With the Court', 'locked'),
        (NEW.id, 'mod_serve_respondent', 'Serve the Respondent', 'locked'),
        (NEW.id, 'mod_mediation', 'Attend Mediation', 'locked'),
        (NEW.id, 'mod_final_orders', 'Modified Court Orders', 'locked');

      INSERT INTO public.task_events (case_id, kind, payload)
      VALUES (NEW.id, 'case_created', jsonb_build_object(
        'role', NEW.role,
        'county', NEW.county,
        'court_type', NEW.court_type,
        'dispute_type', NEW.dispute_type,
        'family_sub_type', v_family_sub_type,
        'tasks_seeded', 9
      ));

    END IF;

    RETURN NEW;
  END IF;

  -- ========================================
  -- Civil cases — existing chain (fallback)
  -- ========================================

  INSERT INTO public.tasks (case_id, task_key, title, status, unlocked_at)
  VALUES (NEW.id, 'welcome', 'Welcome — Get Started', 'todo', now());

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'intake', 'Tell Us About Your Case', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'evidence_vault', 'Organize Your Evidence', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'preservation_letter', 'Draft a Preservation Letter', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'prepare_filing',
    CASE WHEN NEW.role = 'defendant' THEN 'Prepare Your Answer'
         ELSE 'Prepare Your Petition' END,
    'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'file_with_court', 'File With the Court', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'upload_return_of_service', 'Upload Return of Service', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'confirm_service_facts', 'Confirm Service Details', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'wait_for_answer', 'Wait for Answer Deadline', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'check_docket_for_answer', 'Check Docket for Answer', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'default_packet_prep', 'Prepare Default Judgment Packet', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'upload_answer', 'Upload the Answer', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'discovery_starter_pack', 'Discovery Starter Pack', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'understand_removal', 'Understand the Removal', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'choose_removal_strategy', 'Choose Your Response Strategy', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'prepare_amended_complaint', 'Prepare First Amended Complaint', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'file_amended_complaint', 'File Your Amended Complaint', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'prepare_remand_motion', 'Prepare Motion to Remand', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'file_remand_motion', 'File Your Motion to Remand', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'rule_26f_prep', 'Prepare for Rule 26(f) Conference', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'mandatory_disclosures', 'Complete Mandatory Disclosures', 'locked');

  INSERT INTO public.task_events (case_id, kind, payload)
  VALUES (NEW.id, 'case_created', jsonb_build_object(
    'role', NEW.role,
    'county', NEW.county,
    'court_type', NEW.court_type
  ));

  RETURN NEW;
END;
$$;


-- =============================================================
-- STEP 5: CREATE OR REPLACE unlock_next_task()
-- =============================================================

CREATE OR REPLACE FUNCTION public.unlock_next_task()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_settlement_reached  TEXT;
  v_want_to_file_suit   TEXT;
  v_already_filed       TEXT;
  v_case_stage          TEXT;
BEGIN

  -- ========================================
  -- CONTRACT UNLOCK CHAIN (12 transitions)
  -- ========================================

  -- Contract: welcome -> contract_intake
  IF NEW.task_key = 'welcome' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'contract_intake' AND status = 'locked';
  END IF;

  -- Contract: contract_intake -> CONDITIONAL BRANCHING based on case_stage
  IF NEW.task_key = 'contract_intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    v_case_stage := COALESCE(NEW.metadata->'guided_answers'->>'case_stage', 'start');

    IF v_case_stage = 'start' THEN
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'evidence_vault' AND status = 'locked';

    ELSIF v_case_stage = 'demand_sent' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('evidence_vault', 'contract_demand_letter', 'contract_negotiation')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'contract_prepare_filing' AND status = 'locked';

    ELSIF v_case_stage = 'filed' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('evidence_vault', 'contract_demand_letter', 'contract_negotiation', 'contract_prepare_filing')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'contract_file_with_court' AND status = 'locked';

    ELSIF v_case_stage = 'served' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('evidence_vault', 'contract_demand_letter', 'contract_negotiation', 'contract_prepare_filing', 'contract_file_with_court', 'contract_serve_defendant')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'contract_wait_for_answer' AND status = 'locked';

    ELSE
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'evidence_vault' AND status = 'locked';
    END IF;
  END IF;

  -- Contract: evidence_vault -> contract_demand_letter
  IF NEW.task_key = 'evidence_vault' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'contract_demand_letter' AND status = 'locked';
  END IF;

  -- Contract: contract_demand_letter -> contract_negotiation (complete OR skip)
  IF NEW.task_key = 'contract_demand_letter' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'contract_negotiation' AND status = 'locked';
  END IF;

  -- Contract: contract_negotiation -> contract_prepare_filing (complete OR skip)
  IF NEW.task_key = 'contract_negotiation' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'contract_prepare_filing' AND status = 'locked';
  END IF;

  -- Contract: contract_prepare_filing -> contract_file_with_court
  IF NEW.task_key = 'contract_prepare_filing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'contract_file_with_court' AND status = 'locked';
  END IF;

  -- Contract: contract_file_with_court -> contract_serve_defendant
  IF NEW.task_key = 'contract_file_with_court' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'contract_serve_defendant' AND status = 'locked';
  END IF;

  -- Contract: contract_serve_defendant -> contract_wait_for_answer
  IF NEW.task_key = 'contract_serve_defendant' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'contract_wait_for_answer' AND status = 'locked';
  END IF;

  -- Contract: contract_wait_for_answer -> contract_review_answer
  IF NEW.task_key = 'contract_wait_for_answer' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'contract_review_answer' AND status = 'locked';
  END IF;

  -- Contract: contract_review_answer -> contract_discovery
  IF NEW.task_key = 'contract_review_answer' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'contract_discovery' AND status = 'locked';
  END IF;

  -- Contract: contract_discovery -> contract_mediation
  IF NEW.task_key = 'contract_discovery' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'contract_mediation' AND status = 'locked';
  END IF;

  -- Contract: contract_mediation -> contract_post_resolution (complete OR skip)
  IF NEW.task_key = 'contract_mediation' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'contract_post_resolution' AND status = 'locked';
  END IF;

  -- ========================================
  -- PROPERTY UNLOCK CHAIN (10 transitions)
  -- ========================================

  IF NEW.task_key = 'welcome' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'property_intake' AND status = 'locked';
  END IF;

  -- Property: property_intake -> CONDITIONAL BRANCHING based on case_stage
  IF NEW.task_key = 'property_intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    v_case_stage := COALESCE(NEW.metadata->'guided_answers'->>'case_stage', 'start');

    IF v_case_stage = 'start' THEN
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'evidence_vault' AND status = 'locked';

    ELSIF v_case_stage = 'demand_sent' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('evidence_vault', 'property_demand_letter', 'property_negotiation')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'property_prepare_filing' AND status = 'locked';

    ELSIF v_case_stage = 'filed' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('evidence_vault', 'property_demand_letter', 'property_negotiation', 'property_prepare_filing')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'property_file_with_court' AND status = 'locked';

    ELSIF v_case_stage = 'served' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('evidence_vault', 'property_demand_letter', 'property_negotiation', 'property_prepare_filing', 'property_file_with_court', 'property_serve_defendant')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'property_wait_for_answer' AND status = 'locked';

    ELSE
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'evidence_vault' AND status = 'locked';
    END IF;
  END IF;

  IF NEW.task_key = 'evidence_vault' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'property_demand_letter' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'property_demand_letter' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'property_negotiation' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'property_negotiation' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'property_prepare_filing' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'property_prepare_filing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'property_file_with_court' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'property_file_with_court' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'property_serve_defendant' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'property_serve_defendant' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'property_wait_for_answer' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'property_wait_for_answer' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'property_review_answer' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'property_review_answer' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'property_discovery' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'property_discovery' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'property_post_resolution' AND status = 'locked';
  END IF;

  -- ========================================
  -- OTHER UNLOCK CHAIN (9 transitions)
  -- ========================================

  IF NEW.task_key = 'welcome' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'other_intake' AND status = 'locked';
  END IF;

  -- Other: other_intake -> CONDITIONAL BRANCHING based on case_stage
  IF NEW.task_key = 'other_intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    v_case_stage := COALESCE(NEW.metadata->'guided_answers'->>'case_stage', 'start');

    IF v_case_stage = 'start' THEN
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'evidence_vault' AND status = 'locked';

    ELSIF v_case_stage = 'demand_sent' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('evidence_vault', 'other_demand_letter')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'other_prepare_filing' AND status = 'locked';

    ELSIF v_case_stage = 'filed' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('evidence_vault', 'other_demand_letter', 'other_prepare_filing')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'other_file_with_court' AND status = 'locked';

    ELSIF v_case_stage = 'served' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('evidence_vault', 'other_demand_letter', 'other_prepare_filing', 'other_file_with_court', 'other_serve_defendant')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'other_wait_for_answer' AND status = 'locked';

    ELSE
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'evidence_vault' AND status = 'locked';
    END IF;
  END IF;

  IF NEW.task_key = 'evidence_vault' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'other_demand_letter' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'other_demand_letter' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'other_prepare_filing' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'other_prepare_filing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'other_file_with_court' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'other_file_with_court' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'other_serve_defendant' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'other_serve_defendant' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'other_wait_for_answer' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'other_wait_for_answer' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'other_review_answer' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'other_review_answer' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'other_discovery' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'other_discovery' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'other_post_resolution' AND status = 'locked';
  END IF;

  -- ========================================
  -- Personal injury chain (19 transitions)
  -- ========================================

  IF NEW.task_key = 'welcome' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_intake' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'pi_intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    v_case_stage := COALESCE(NEW.metadata->'guided_answers'->>'case_stage', 'start');

    IF v_case_stage = 'start' THEN
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'pi_medical_records' AND status = 'locked';

    ELSIF v_case_stage = 'medical' THEN
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'pi_medical_records' AND status = 'locked';

    ELSIF v_case_stage = 'insurance' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('pi_medical_records', 'evidence_vault', 'preservation_letter')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'pi_insurance_communication' AND status = 'locked';

    ELSIF v_case_stage = 'demand' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('pi_medical_records', 'evidence_vault', 'preservation_letter', 'pi_insurance_communication')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'prepare_pi_demand_letter' AND status = 'locked';

    ELSIF v_case_stage = 'negotiation' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('pi_medical_records', 'evidence_vault', 'preservation_letter', 'pi_insurance_communication', 'prepare_pi_demand_letter')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'pi_settlement_negotiation' AND status = 'locked';

    ELSIF v_case_stage = 'filing' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('pi_medical_records', 'evidence_vault', 'preservation_letter', 'pi_insurance_communication', 'prepare_pi_demand_letter', 'pi_settlement_negotiation')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'prepare_pi_petition' AND status = 'locked';

    ELSE
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'pi_medical_records' AND status = 'locked';
    END IF;
  END IF;

  IF NEW.task_key = 'pi_medical_records' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'evidence_vault' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'evidence_vault' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'preservation_letter' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'preservation_letter' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_insurance_communication' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'pi_insurance_communication' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'prepare_pi_demand_letter' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'prepare_pi_demand_letter' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_settlement_negotiation' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'pi_settlement_negotiation' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    v_settlement_reached := COALESCE(NEW.metadata->'guided_answers'->>'settlement_reached', '');
    v_want_to_file_suit  := COALESCE(NEW.metadata->'guided_answers'->>'want_to_file_suit', '');

    IF v_settlement_reached = 'no' AND v_want_to_file_suit = 'yes' THEN
      v_already_filed := COALESCE(NEW.metadata->'guided_answers'->>'already_filed_petition', '');

      IF v_already_filed = 'yes' THEN
        UPDATE public.tasks SET status = 'skipped'
        WHERE case_id = NEW.case_id
          AND task_key IN ('prepare_pi_petition', 'pi_file_with_court')
          AND status = 'locked';

        UPDATE public.tasks SET status = 'todo', unlocked_at = now()
        WHERE case_id = NEW.case_id AND task_key = 'pi_serve_defendant' AND status = 'locked';
      ELSE
        UPDATE public.tasks SET status = 'todo', unlocked_at = now()
        WHERE case_id = NEW.case_id AND task_key = 'prepare_pi_petition' AND status = 'locked';
      END IF;
    ELSE
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN (
          'prepare_pi_petition', 'pi_file_with_court', 'pi_serve_defendant',
          'pi_wait_for_answer', 'pi_review_answer', 'pi_discovery_prep',
          'pi_discovery_responses', 'pi_scheduling_conference',
          'pi_pretrial_motions', 'pi_mediation', 'pi_trial_prep'
        )
        AND status = 'locked';

      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'pi_post_resolution' AND status = 'locked';
    END IF;
  END IF;

  IF NEW.task_key = 'pi_settlement_negotiation' AND NEW.status = 'skipped' AND OLD.status != 'skipped' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'prepare_pi_petition' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'prepare_pi_petition' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_file_with_court' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'pi_file_with_court' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_serve_defendant' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'pi_serve_defendant' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_wait_for_answer' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'pi_wait_for_answer' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    IF COALESCE(NEW.metadata->'guided_answers'->>'case_removed', '') != 'yes' THEN
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'pi_review_answer' AND status = 'locked';
    END IF;
  END IF;

  IF NEW.task_key = 'pi_review_answer' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_discovery_prep' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'pi_discovery_prep' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_discovery_responses' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'pi_discovery_responses' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_scheduling_conference' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'pi_scheduling_conference' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_pretrial_motions' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'pi_pretrial_motions' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_mediation' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'pi_mediation' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_trial_prep' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'pi_trial_prep' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_post_resolution' AND status = 'locked';
  END IF;

  -- ========================================
  -- Debt defense chain (9 transitions)
  -- ========================================

  IF NEW.task_key = 'welcome' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'debt_defense_intake' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'debt_defense_intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'evidence_vault' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'evidence_vault' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'prepare_debt_validation_letter' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'prepare_debt_validation_letter' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'prepare_debt_defense_answer' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'prepare_debt_defense_answer' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'debt_file_with_court' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'debt_file_with_court' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'serve_plaintiff' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'serve_plaintiff' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'debt_hearing_prep' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'debt_hearing_prep' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'debt_hearing_day' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'debt_hearing_day' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'debt_post_judgment' AND status = 'locked';
  END IF;

  -- ========================================
  -- Landlord-tenant chain (15 transitions)
  -- ========================================

  -- LT: welcome -> landlord_tenant_intake
  IF NEW.task_key = 'welcome' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'landlord_tenant_intake' AND status = 'locked';
  END IF;

  -- LT: landlord_tenant_intake -> evidence_vault
  IF NEW.task_key = 'landlord_tenant_intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'evidence_vault' AND status = 'locked';
  END IF;

  -- LT: evidence_vault -> prepare_lt_demand_letter
  IF NEW.task_key = 'evidence_vault' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'prepare_lt_demand_letter' AND status = 'locked';
  END IF;

  -- LT: prepare_lt_demand_letter -> lt_negotiation (complete OR skip)
  IF NEW.task_key = 'prepare_lt_demand_letter' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'lt_negotiation' AND status = 'locked';
  END IF;

  -- LT: lt_negotiation -> prepare_landlord_tenant_filing (complete OR skip)
  IF NEW.task_key = 'lt_negotiation' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'prepare_landlord_tenant_filing' AND status = 'locked';
  END IF;

  -- LT: prepare_landlord_tenant_filing -> lt_file_with_court
  IF NEW.task_key = 'prepare_landlord_tenant_filing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'lt_file_with_court' AND status = 'locked';
  END IF;

  -- LT: lt_file_with_court -> serve_other_party
  IF NEW.task_key = 'lt_file_with_court' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'serve_other_party' AND status = 'locked';
  END IF;

  -- LT: serve_other_party -> lt_wait_for_response
  IF NEW.task_key = 'serve_other_party' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'lt_wait_for_response' AND status = 'locked';
  END IF;

  -- LT: lt_wait_for_response -> lt_review_response
  IF NEW.task_key = 'lt_wait_for_response' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'lt_review_response' AND status = 'locked';
  END IF;

  -- LT: lt_review_response -> lt_discovery
  IF NEW.task_key = 'lt_review_response' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'lt_discovery' AND status = 'locked';
  END IF;

  -- LT: lt_discovery -> lt_prepare_for_hearing
  IF NEW.task_key = 'lt_discovery' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'lt_prepare_for_hearing' AND status = 'locked';
  END IF;

  -- LT: lt_prepare_for_hearing -> lt_mediation
  IF NEW.task_key = 'lt_prepare_for_hearing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'lt_mediation' AND status = 'locked';
  END IF;

  -- LT: lt_mediation -> lt_hearing_day (complete OR skip)
  IF NEW.task_key = 'lt_mediation' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'lt_hearing_day' AND status = 'locked';
  END IF;

  -- LT: lt_hearing_day -> lt_post_judgment
  IF NEW.task_key = 'lt_hearing_day' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'lt_post_judgment' AND status = 'locked';
  END IF;

  -- ========================================
  -- Small claims chain
  -- ========================================

  IF NEW.task_key = 'welcome' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'small_claims_intake' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'small_claims_intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    v_case_stage := COALESCE(NEW.metadata->'guided_answers'->>'case_stage', 'start');

    IF v_case_stage = 'start' THEN
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'evidence_vault' AND status = 'locked';

    ELSIF v_case_stage = 'demand_sent' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('evidence_vault', 'prepare_demand_letter')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'prepare_small_claims_filing' AND status = 'locked';

    ELSIF v_case_stage = 'filed' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('evidence_vault', 'prepare_demand_letter', 'prepare_small_claims_filing')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'file_with_court' AND status = 'locked';

    ELSIF v_case_stage = 'served' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('evidence_vault', 'prepare_demand_letter', 'prepare_small_claims_filing', 'file_with_court', 'serve_defendant')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'prepare_for_hearing' AND status = 'locked';

    ELSIF v_case_stage = 'hearing' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('evidence_vault', 'prepare_demand_letter', 'prepare_small_claims_filing', 'file_with_court', 'serve_defendant', 'prepare_for_hearing')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'hearing_day' AND status = 'locked';

    ELSE
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'evidence_vault' AND status = 'locked';
    END IF;
  END IF;

  IF NEW.task_key = 'evidence_vault' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'prepare_demand_letter' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'prepare_demand_letter' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'prepare_small_claims_filing' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'prepare_small_claims_filing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'file_with_court' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'file_with_court' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'serve_defendant' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'serve_defendant' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'prepare_for_hearing' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'prepare_for_hearing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'hearing_day' AND status = 'locked';
  END IF;

  -- ========================================
  -- FAMILY: DIVORCE chain (11 transitions)
  -- ========================================

  -- welcome -> divorce_intake (generic welcome handler)
  IF NEW.task_key = 'welcome' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'divorce_intake' AND status = 'locked';
  END IF;

  -- divorce_intake -> CONDITIONAL BRANCHING based on case_stage
  IF NEW.task_key = 'divorce_intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    v_case_stage := COALESCE(NEW.metadata->'guided_answers'->>'case_stage', 'start');

    IF v_case_stage = 'start' THEN
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'divorce_safety_screening' AND status = 'locked';

    ELSIF v_case_stage = 'filed' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('divorce_safety_screening', 'divorce_evidence_vault', 'divorce_prepare_filing')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'divorce_file_with_court' AND status = 'locked';

    ELSIF v_case_stage = 'served' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('divorce_safety_screening', 'divorce_evidence_vault', 'divorce_prepare_filing', 'divorce_file_with_court', 'divorce_serve_respondent')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'divorce_waiting_period' AND status = 'locked';

    ELSIF v_case_stage = 'waiting_period' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('divorce_safety_screening', 'divorce_evidence_vault', 'divorce_prepare_filing', 'divorce_file_with_court', 'divorce_serve_respondent', 'divorce_waiting_period')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'divorce_temporary_orders' AND status = 'locked';

    ELSIF v_case_stage = 'temporary_orders' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('divorce_safety_screening', 'divorce_evidence_vault', 'divorce_prepare_filing', 'divorce_file_with_court', 'divorce_serve_respondent', 'divorce_waiting_period', 'divorce_temporary_orders')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'divorce_mediation' AND status = 'locked';

    ELSIF v_case_stage = 'mediation' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('divorce_safety_screening', 'divorce_evidence_vault', 'divorce_prepare_filing', 'divorce_file_with_court', 'divorce_serve_respondent', 'divorce_waiting_period', 'divorce_temporary_orders', 'divorce_mediation')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'divorce_property_division' AND status = 'locked';

    ELSE
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'divorce_safety_screening' AND status = 'locked';
    END IF;
  END IF;

  -- divorce_safety_screening -> divorce_evidence_vault
  IF NEW.task_key = 'divorce_safety_screening' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'divorce_evidence_vault' AND status = 'locked';
  END IF;

  -- divorce_evidence_vault -> divorce_prepare_filing
  IF NEW.task_key = 'divorce_evidence_vault' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'divorce_prepare_filing' AND status = 'locked';
  END IF;

  -- divorce_prepare_filing -> divorce_file_with_court
  IF NEW.task_key = 'divorce_prepare_filing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'divorce_file_with_court' AND status = 'locked';
  END IF;

  -- divorce_file_with_court -> divorce_serve_respondent
  IF NEW.task_key = 'divorce_file_with_court' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'divorce_serve_respondent' AND status = 'locked';
  END IF;

  -- divorce_serve_respondent -> divorce_waiting_period
  IF NEW.task_key = 'divorce_serve_respondent' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'divorce_waiting_period' AND status = 'locked';
  END IF;

  -- divorce_waiting_period -> divorce_temporary_orders
  IF NEW.task_key = 'divorce_waiting_period' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'divorce_temporary_orders' AND status = 'locked';
  END IF;

  -- divorce_temporary_orders -> divorce_mediation (completed OR skipped)
  IF NEW.task_key = 'divorce_temporary_orders' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'divorce_mediation' AND status = 'locked';
  END IF;

  -- divorce_mediation -> divorce_property_division (completed OR skipped)
  IF NEW.task_key = 'divorce_mediation' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'divorce_property_division' AND status = 'locked';
  END IF;

  -- divorce_property_division -> divorce_final_orders
  IF NEW.task_key = 'divorce_property_division' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'divorce_final_orders' AND status = 'locked';
  END IF;

  -- ========================================
  -- FAMILY: CUSTODY chain (9 transitions)
  -- ========================================

  -- welcome -> custody_intake
  IF NEW.task_key = 'welcome' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'custody_intake' AND status = 'locked';
  END IF;

  -- custody_intake -> CONDITIONAL BRANCHING based on case_stage
  IF NEW.task_key = 'custody_intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    v_case_stage := COALESCE(NEW.metadata->'guided_answers'->>'case_stage', 'start');

    IF v_case_stage = 'start' THEN
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'custody_safety_screening' AND status = 'locked';

    ELSIF v_case_stage = 'filed' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('custody_safety_screening', 'custody_evidence_vault', 'custody_prepare_filing')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'custody_file_with_court' AND status = 'locked';

    ELSIF v_case_stage = 'served' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('custody_safety_screening', 'custody_evidence_vault', 'custody_prepare_filing', 'custody_file_with_court', 'custody_serve_respondent')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'custody_temporary_orders' AND status = 'locked';

    ELSIF v_case_stage = 'temporary_orders' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('custody_safety_screening', 'custody_evidence_vault', 'custody_prepare_filing', 'custody_file_with_court', 'custody_serve_respondent', 'custody_temporary_orders')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'custody_mediation' AND status = 'locked';

    ELSIF v_case_stage = 'mediation' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('custody_safety_screening', 'custody_evidence_vault', 'custody_prepare_filing', 'custody_file_with_court', 'custody_serve_respondent', 'custody_temporary_orders', 'custody_mediation')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'custody_final_orders' AND status = 'locked';

    ELSE
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'custody_safety_screening' AND status = 'locked';
    END IF;
  END IF;

  -- custody_safety_screening -> custody_evidence_vault
  IF NEW.task_key = 'custody_safety_screening' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'custody_evidence_vault' AND status = 'locked';
  END IF;

  -- custody_evidence_vault -> custody_prepare_filing
  IF NEW.task_key = 'custody_evidence_vault' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'custody_prepare_filing' AND status = 'locked';
  END IF;

  -- custody_prepare_filing -> custody_file_with_court
  IF NEW.task_key = 'custody_prepare_filing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'custody_file_with_court' AND status = 'locked';
  END IF;

  -- custody_file_with_court -> custody_serve_respondent
  IF NEW.task_key = 'custody_file_with_court' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'custody_serve_respondent' AND status = 'locked';
  END IF;

  -- custody_serve_respondent -> custody_temporary_orders
  IF NEW.task_key = 'custody_serve_respondent' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'custody_temporary_orders' AND status = 'locked';
  END IF;

  -- custody_temporary_orders -> custody_mediation (completed OR skipped)
  IF NEW.task_key = 'custody_temporary_orders' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'custody_mediation' AND status = 'locked';
  END IF;

  -- custody_mediation -> custody_final_orders
  IF NEW.task_key = 'custody_mediation' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'custody_final_orders' AND status = 'locked';
  END IF;

  -- ========================================
  -- FAMILY: CHILD SUPPORT chain (7 transitions)
  -- ========================================

  -- welcome -> child_support_intake
  IF NEW.task_key = 'welcome' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'child_support_intake' AND status = 'locked';
  END IF;

  -- child_support_intake -> CONDITIONAL BRANCHING based on case_stage
  IF NEW.task_key = 'child_support_intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    v_case_stage := COALESCE(NEW.metadata->'guided_answers'->>'case_stage', 'start');

    IF v_case_stage = 'start' THEN
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'child_support_evidence_vault' AND status = 'locked';

    ELSIF v_case_stage = 'filed' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('child_support_evidence_vault', 'child_support_prepare_filing')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'child_support_file_with_court' AND status = 'locked';

    ELSIF v_case_stage = 'served' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('child_support_evidence_vault', 'child_support_prepare_filing', 'child_support_file_with_court', 'child_support_serve_respondent')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'child_support_temporary_orders' AND status = 'locked';

    ELSE
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'child_support_evidence_vault' AND status = 'locked';
    END IF;
  END IF;

  -- child_support_evidence_vault -> child_support_prepare_filing
  IF NEW.task_key = 'child_support_evidence_vault' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'child_support_prepare_filing' AND status = 'locked';
  END IF;

  -- child_support_prepare_filing -> child_support_file_with_court
  IF NEW.task_key = 'child_support_prepare_filing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'child_support_file_with_court' AND status = 'locked';
  END IF;

  -- child_support_file_with_court -> child_support_serve_respondent
  IF NEW.task_key = 'child_support_file_with_court' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'child_support_serve_respondent' AND status = 'locked';
  END IF;

  -- child_support_serve_respondent -> child_support_temporary_orders
  IF NEW.task_key = 'child_support_serve_respondent' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'child_support_temporary_orders' AND status = 'locked';
  END IF;

  -- child_support_temporary_orders -> child_support_final_orders (completed OR skipped)
  IF NEW.task_key = 'child_support_temporary_orders' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'child_support_final_orders' AND status = 'locked';
  END IF;

  -- ========================================
  -- FAMILY: VISITATION chain (8 transitions)
  -- ========================================

  -- welcome -> visitation_intake
  IF NEW.task_key = 'welcome' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'visitation_intake' AND status = 'locked';
  END IF;

  -- visitation_intake -> CONDITIONAL BRANCHING based on case_stage
  IF NEW.task_key = 'visitation_intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    v_case_stage := COALESCE(NEW.metadata->'guided_answers'->>'case_stage', 'start');

    IF v_case_stage = 'start' THEN
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'visitation_safety_screening' AND status = 'locked';

    ELSIF v_case_stage = 'filed' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('visitation_safety_screening', 'visitation_evidence_vault', 'visitation_prepare_filing')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'visitation_file_with_court' AND status = 'locked';

    ELSIF v_case_stage = 'served' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('visitation_safety_screening', 'visitation_evidence_vault', 'visitation_prepare_filing', 'visitation_file_with_court', 'visitation_serve_respondent')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'visitation_mediation' AND status = 'locked';

    ELSIF v_case_stage = 'mediation' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('visitation_safety_screening', 'visitation_evidence_vault', 'visitation_prepare_filing', 'visitation_file_with_court', 'visitation_serve_respondent', 'visitation_mediation')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'visitation_final_orders' AND status = 'locked';

    ELSE
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'visitation_safety_screening' AND status = 'locked';
    END IF;
  END IF;

  -- visitation_safety_screening -> visitation_evidence_vault
  IF NEW.task_key = 'visitation_safety_screening' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'visitation_evidence_vault' AND status = 'locked';
  END IF;

  -- visitation_evidence_vault -> visitation_prepare_filing
  IF NEW.task_key = 'visitation_evidence_vault' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'visitation_prepare_filing' AND status = 'locked';
  END IF;

  -- visitation_prepare_filing -> visitation_file_with_court
  IF NEW.task_key = 'visitation_prepare_filing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'visitation_file_with_court' AND status = 'locked';
  END IF;

  -- visitation_file_with_court -> visitation_serve_respondent
  IF NEW.task_key = 'visitation_file_with_court' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'visitation_serve_respondent' AND status = 'locked';
  END IF;

  -- visitation_serve_respondent -> visitation_mediation
  IF NEW.task_key = 'visitation_serve_respondent' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'visitation_mediation' AND status = 'locked';
  END IF;

  -- visitation_mediation -> visitation_final_orders
  IF NEW.task_key = 'visitation_mediation' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'visitation_final_orders' AND status = 'locked';
  END IF;

  -- ========================================
  -- FAMILY: SPOUSAL SUPPORT chain (7 transitions)
  -- ========================================

  -- welcome -> spousal_support_intake
  IF NEW.task_key = 'welcome' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'spousal_support_intake' AND status = 'locked';
  END IF;

  -- spousal_support_intake -> CONDITIONAL BRANCHING based on case_stage
  IF NEW.task_key = 'spousal_support_intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    v_case_stage := COALESCE(NEW.metadata->'guided_answers'->>'case_stage', 'start');

    IF v_case_stage = 'start' THEN
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'spousal_support_evidence_vault' AND status = 'locked';

    ELSIF v_case_stage = 'filed' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('spousal_support_evidence_vault', 'spousal_support_prepare_filing')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'spousal_support_file_with_court' AND status = 'locked';

    ELSIF v_case_stage = 'served' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('spousal_support_evidence_vault', 'spousal_support_prepare_filing', 'spousal_support_file_with_court', 'spousal_support_serve_respondent')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'spousal_support_temporary_orders' AND status = 'locked';

    ELSE
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'spousal_support_evidence_vault' AND status = 'locked';
    END IF;
  END IF;

  -- spousal_support_evidence_vault -> spousal_support_prepare_filing
  IF NEW.task_key = 'spousal_support_evidence_vault' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'spousal_support_prepare_filing' AND status = 'locked';
  END IF;

  -- spousal_support_prepare_filing -> spousal_support_file_with_court
  IF NEW.task_key = 'spousal_support_prepare_filing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'spousal_support_file_with_court' AND status = 'locked';
  END IF;

  -- spousal_support_file_with_court -> spousal_support_serve_respondent
  IF NEW.task_key = 'spousal_support_file_with_court' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'spousal_support_serve_respondent' AND status = 'locked';
  END IF;

  -- spousal_support_serve_respondent -> spousal_support_temporary_orders
  IF NEW.task_key = 'spousal_support_serve_respondent' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'spousal_support_temporary_orders' AND status = 'locked';
  END IF;

  -- spousal_support_temporary_orders -> spousal_support_final_orders (completed OR skipped)
  IF NEW.task_key = 'spousal_support_temporary_orders' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'spousal_support_final_orders' AND status = 'locked';
  END IF;

  -- ========================================
  -- FAMILY: PROTECTIVE ORDER chain (5 transitions)
  -- ========================================

  -- welcome -> po_intake
  IF NEW.task_key = 'welcome' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'po_intake' AND status = 'locked';
  END IF;

  -- po_intake -> CONDITIONAL BRANCHING based on case_stage
  IF NEW.task_key = 'po_intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    v_case_stage := COALESCE(NEW.metadata->'guided_answers'->>'case_stage', 'start');

    IF v_case_stage = 'start' THEN
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'po_safety_screening' AND status = 'locked';

    ELSIF v_case_stage = 'filed' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('po_safety_screening', 'po_prepare_filing')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'po_file_with_court' AND status = 'locked';

    ELSE
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'po_safety_screening' AND status = 'locked';
    END IF;
  END IF;

  -- po_safety_screening -> po_prepare_filing
  IF NEW.task_key = 'po_safety_screening' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'po_prepare_filing' AND status = 'locked';
  END IF;

  -- po_prepare_filing -> po_file_with_court
  IF NEW.task_key = 'po_prepare_filing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'po_file_with_court' AND status = 'locked';
  END IF;

  -- po_file_with_court -> po_hearing
  IF NEW.task_key = 'po_file_with_court' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'po_hearing' AND status = 'locked';
  END IF;

  -- ========================================
  -- FAMILY: MODIFICATION chain (8 transitions)
  -- ========================================

  -- welcome -> mod_intake
  IF NEW.task_key = 'welcome' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'mod_intake' AND status = 'locked';
  END IF;

  -- mod_intake -> CONDITIONAL BRANCHING based on case_stage
  IF NEW.task_key = 'mod_intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    v_case_stage := COALESCE(NEW.metadata->'guided_answers'->>'case_stage', 'start');

    IF v_case_stage = 'start' THEN
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'mod_evidence_vault' AND status = 'locked';

    ELSIF v_case_stage = 'filed' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('mod_evidence_vault', 'mod_existing_order_review', 'mod_prepare_filing')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'mod_file_with_court' AND status = 'locked';

    ELSIF v_case_stage = 'served' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('mod_evidence_vault', 'mod_existing_order_review', 'mod_prepare_filing', 'mod_file_with_court', 'mod_serve_respondent')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'mod_mediation' AND status = 'locked';

    ELSIF v_case_stage = 'mediation' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('mod_evidence_vault', 'mod_existing_order_review', 'mod_prepare_filing', 'mod_file_with_court', 'mod_serve_respondent', 'mod_mediation')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'mod_final_orders' AND status = 'locked';

    ELSE
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'mod_evidence_vault' AND status = 'locked';
    END IF;
  END IF;

  -- mod_evidence_vault -> mod_existing_order_review
  IF NEW.task_key = 'mod_evidence_vault' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'mod_existing_order_review' AND status = 'locked';
  END IF;

  -- mod_existing_order_review -> mod_prepare_filing
  IF NEW.task_key = 'mod_existing_order_review' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'mod_prepare_filing' AND status = 'locked';
  END IF;

  -- mod_prepare_filing -> mod_file_with_court
  IF NEW.task_key = 'mod_prepare_filing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'mod_file_with_court' AND status = 'locked';
  END IF;

  -- mod_file_with_court -> mod_serve_respondent
  IF NEW.task_key = 'mod_file_with_court' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'mod_serve_respondent' AND status = 'locked';
  END IF;

  -- mod_serve_respondent -> mod_mediation
  IF NEW.task_key = 'mod_serve_respondent' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'mod_mediation' AND status = 'locked';
  END IF;

  -- mod_mediation -> mod_final_orders (completed OR skipped)
  IF NEW.task_key = 'mod_mediation' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'mod_final_orders' AND status = 'locked';
  END IF;

  -- ========================================
  -- Civil chain
  -- ========================================

  IF NEW.task_key = 'welcome' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks
    SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'intake' AND status = 'locked';

    INSERT INTO public.task_events (case_id, task_id, kind, payload)
    VALUES (NEW.case_id, (
      SELECT id FROM public.tasks WHERE case_id = NEW.case_id AND task_key = 'intake'
    ), 'task_unlocked', jsonb_build_object('task_key', 'intake'));
  END IF;

  IF NEW.task_key = 'intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks
    SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'evidence_vault' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'evidence_vault' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks
    SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'preservation_letter' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'preservation_letter' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks
    SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'prepare_filing' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'prepare_filing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks
    SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'file_with_court' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'file_with_court' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks
    SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'upload_return_of_service' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'upload_return_of_service' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks
    SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'confirm_service_facts' AND status = 'locked';
  END IF;

  RETURN NEW;
END;
$$;
