-- =============================================================
-- FAMILY LAW WORKFLOW IMPROVEMENTS
-- =============================================================
-- Adds new task_keys per family sub-type:
--   - standing_orders (divorce only)
--   - response_checkpoint (all except PO)
--   - post_decree (all except PO)
--   - uccjea_affidavit, paternity (custody)
--   - ag_option, paternity (child_support)
--   - eligibility (spousal_support)
--
-- Steps:
--   1. CREATE OR REPLACE seed_family_tasks() with new tasks
--   2. CREATE OR REPLACE unlock_next_task() with updated transitions
--   3. Backfill existing family cases with new tasks as 'locked'
-- =============================================================


-- =============================================================
-- STEP 1: CREATE OR REPLACE seed_family_tasks()
-- =============================================================

CREATE OR REPLACE FUNCTION public.seed_family_tasks()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_case RECORD;
BEGIN
  -- Get the parent case info
  SELECT id, role, county, court_type, dispute_type
  INTO v_case
  FROM public.cases
  WHERE id = NEW.case_id;

  IF v_case IS NULL OR v_case.dispute_type != 'family' THEN
    RETURN NEW;
  END IF;

  -- Idempotency: skip if sub-type tasks already exist
  IF EXISTS (
    SELECT 1 FROM public.tasks
    WHERE case_id = NEW.case_id AND task_key LIKE '%\_intake'
    LIMIT 1
  ) THEN
    RETURN NEW;
  END IF;

  -- ---- DIVORCE (14 tasks after welcome) ----
  IF NEW.family_sub_type = 'divorce' THEN
    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES
      (NEW.case_id, 'divorce_intake', 'Tell Us About Your Divorce', 'locked'),
      (NEW.case_id, 'divorce_safety_screening', 'Safety Check', 'locked'),
      (NEW.case_id, 'divorce_evidence_vault', 'Organize Your Evidence', 'locked'),
      (NEW.case_id, 'divorce_prepare_filing', 'Prepare Your Divorce Filing', 'locked'),
      (NEW.case_id, 'divorce_file_with_court', 'File With the Court', 'locked'),
      (NEW.case_id, 'divorce_standing_orders', 'County Standing Orders', 'locked'),
      (NEW.case_id, 'divorce_serve_respondent', 'Serve the Respondent', 'locked'),
      (NEW.case_id, 'divorce_response_checkpoint', 'What Happened After Service?', 'locked'),
      (NEW.case_id, 'divorce_waiting_period', 'Mandatory Waiting Period', 'locked'),
      (NEW.case_id, 'divorce_temporary_orders', 'Request Temporary Orders', 'locked'),
      (NEW.case_id, 'divorce_mediation', 'Attend Mediation', 'locked'),
      (NEW.case_id, 'divorce_property_division', 'Divide Community Property', 'locked'),
      (NEW.case_id, 'divorce_final_orders', 'Final Decree of Divorce', 'locked'),
      (NEW.case_id, 'divorce_post_decree', 'After Your Divorce Is Final', 'locked');

  -- ---- CUSTODY (13 tasks after welcome) ----
  ELSIF NEW.family_sub_type = 'custody' THEN
    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES
      (NEW.case_id, 'custody_intake', 'Tell Us About Your Custody Matter', 'locked'),
      (NEW.case_id, 'custody_uccjea_affidavit', 'UCCJEA Affidavit', 'locked'),
      (NEW.case_id, 'custody_paternity', 'Establishing Paternity', 'locked'),
      (NEW.case_id, 'custody_safety_screening', 'Safety Check', 'locked'),
      (NEW.case_id, 'custody_evidence_vault', 'Organize Your Evidence', 'locked'),
      (NEW.case_id, 'custody_prepare_filing', 'Prepare Your Custody Filing', 'locked'),
      (NEW.case_id, 'custody_file_with_court', 'File With the Court', 'locked'),
      (NEW.case_id, 'custody_serve_respondent', 'Serve the Respondent', 'locked'),
      (NEW.case_id, 'custody_response_checkpoint', 'What Happened After Service?', 'locked'),
      (NEW.case_id, 'custody_temporary_orders', 'Request Temporary Orders', 'locked'),
      (NEW.case_id, 'custody_mediation', 'Attend Mediation', 'locked'),
      (NEW.case_id, 'custody_final_orders', 'Final Custody Orders', 'locked'),
      (NEW.case_id, 'custody_post_decree', 'After Your Custody Order Is Final', 'locked');

  -- ---- CHILD SUPPORT (11 tasks after welcome) ----
  ELSIF NEW.family_sub_type = 'child_support' THEN
    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES
      (NEW.case_id, 'child_support_intake', 'Tell Us About Your Child Support Matter', 'locked'),
      (NEW.case_id, 'child_support_ag_option', 'Filing Options', 'locked'),
      (NEW.case_id, 'child_support_paternity', 'Establishing Paternity', 'locked'),
      (NEW.case_id, 'child_support_evidence_vault', 'Organize Your Evidence', 'locked'),
      (NEW.case_id, 'child_support_prepare_filing', 'Prepare Your Filing', 'locked'),
      (NEW.case_id, 'child_support_file_with_court', 'File With the Court', 'locked'),
      (NEW.case_id, 'child_support_serve_respondent', 'Serve the Respondent', 'locked'),
      (NEW.case_id, 'child_support_response_checkpoint', 'What Happened After Service?', 'locked'),
      (NEW.case_id, 'child_support_temporary_orders', 'Request Temporary Orders', 'locked'),
      (NEW.case_id, 'child_support_final_orders', 'Final Child Support Orders', 'locked'),
      (NEW.case_id, 'child_support_post_decree', 'After Your Child Support Order Is Final', 'locked');

  -- ---- VISITATION (10 tasks after welcome) ----
  ELSIF NEW.family_sub_type = 'visitation' THEN
    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES
      (NEW.case_id, 'visitation_intake', 'Tell Us About Your Visitation Matter', 'locked'),
      (NEW.case_id, 'visitation_safety_screening', 'Safety Check', 'locked'),
      (NEW.case_id, 'visitation_evidence_vault', 'Organize Your Evidence', 'locked'),
      (NEW.case_id, 'visitation_prepare_filing', 'Prepare Your Visitation Filing', 'locked'),
      (NEW.case_id, 'visitation_file_with_court', 'File With the Court', 'locked'),
      (NEW.case_id, 'visitation_serve_respondent', 'Serve the Respondent', 'locked'),
      (NEW.case_id, 'visitation_response_checkpoint', 'What Happened After Service?', 'locked'),
      (NEW.case_id, 'visitation_mediation', 'Attend Mediation', 'locked'),
      (NEW.case_id, 'visitation_final_orders', 'Final Visitation Orders', 'locked'),
      (NEW.case_id, 'visitation_post_decree', 'After Your Visitation Order Is Final', 'locked');

  -- ---- SPOUSAL SUPPORT (10 tasks after welcome) ----
  ELSIF NEW.family_sub_type = 'spousal_support' THEN
    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES
      (NEW.case_id, 'spousal_support_intake', 'Tell Us About Your Spousal Support Matter', 'locked'),
      (NEW.case_id, 'spousal_support_eligibility', 'Eligibility Check', 'locked'),
      (NEW.case_id, 'spousal_support_evidence_vault', 'Organize Your Evidence', 'locked'),
      (NEW.case_id, 'spousal_support_prepare_filing', 'Prepare Your Filing', 'locked'),
      (NEW.case_id, 'spousal_support_file_with_court', 'File With the Court', 'locked'),
      (NEW.case_id, 'spousal_support_serve_respondent', 'Serve the Respondent', 'locked'),
      (NEW.case_id, 'spousal_support_response_checkpoint', 'What Happened After Service?', 'locked'),
      (NEW.case_id, 'spousal_support_temporary_orders', 'Request Temporary Orders', 'locked'),
      (NEW.case_id, 'spousal_support_final_orders', 'Final Spousal Support Orders', 'locked'),
      (NEW.case_id, 'spousal_support_post_decree', 'After Your Spousal Support Order Is Final', 'locked');

  -- ---- PROTECTIVE ORDER (unchanged — 5 tasks after welcome) ----
  ELSIF NEW.family_sub_type = 'protective_order' THEN
    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES
      (NEW.case_id, 'po_intake', 'Tell Us About Your Situation', 'locked'),
      (NEW.case_id, 'po_safety_screening', 'Safety Check', 'locked'),
      (NEW.case_id, 'po_prepare_filing', 'Prepare Your Protective Order Filing', 'locked'),
      (NEW.case_id, 'po_file_with_court', 'File With the Court', 'locked'),
      (NEW.case_id, 'po_hearing', 'Protective Order Hearing', 'locked');

  -- ---- MODIFICATION (10 tasks after welcome) ----
  ELSIF NEW.family_sub_type = 'modification' THEN
    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES
      (NEW.case_id, 'mod_intake', 'Tell Us About Your Modification', 'locked'),
      (NEW.case_id, 'mod_evidence_vault', 'Organize Your Evidence', 'locked'),
      (NEW.case_id, 'mod_existing_order_review', 'Review Existing Court Order', 'locked'),
      (NEW.case_id, 'mod_prepare_filing', 'Prepare Your Modification Filing', 'locked'),
      (NEW.case_id, 'mod_file_with_court', 'File With the Court', 'locked'),
      (NEW.case_id, 'mod_serve_respondent', 'Serve the Respondent', 'locked'),
      (NEW.case_id, 'mod_response_checkpoint', 'What Happened After Service?', 'locked'),
      (NEW.case_id, 'mod_mediation', 'Attend Mediation', 'locked'),
      (NEW.case_id, 'mod_final_orders', 'Modified Court Orders', 'locked'),
      (NEW.case_id, 'mod_post_decree', 'After Your Modification Is Final', 'locked');

  END IF;

  -- Write case_created event with sub-type info
  INSERT INTO public.task_events (case_id, kind, payload)
  VALUES (NEW.case_id, 'case_created', jsonb_build_object(
    'role', v_case.role,
    'county', v_case.county,
    'court_type', v_case.court_type,
    'dispute_type', v_case.dispute_type,
    'family_sub_type', NEW.family_sub_type
  ));

  RETURN NEW;
END;
$$;


-- =============================================================
-- STEP 2: CREATE OR REPLACE unlock_next_task()
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
  v_response_status     TEXT;
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
  -- REAL ESTATE UNLOCK CHAIN (11 transitions)
  -- ========================================

  -- RE: welcome -> re_intake
  IF NEW.task_key = 'welcome' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 're_intake' AND status = 'locked';
  END IF;

  -- RE: re_intake -> CONDITIONAL BRANCHING based on case_stage
  IF NEW.task_key = 're_intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    v_case_stage := COALESCE(NEW.metadata->'guided_answers'->>'case_stage', 'start');

    IF v_case_stage = 'start' THEN
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 're_evidence_vault' AND status = 'locked';

    ELSIF v_case_stage = 'demand_sent' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('re_evidence_vault', 're_demand_letter', 're_negotiation')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 're_prepare_filing' AND status = 'locked';

    ELSIF v_case_stage = 'filed' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('re_evidence_vault', 're_demand_letter', 're_negotiation', 're_prepare_filing')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 're_file_with_court' AND status = 'locked';

    ELSIF v_case_stage = 'served' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('re_evidence_vault', 're_demand_letter', 're_negotiation', 're_prepare_filing', 're_file_with_court', 're_serve_defendant')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 're_wait_for_answer' AND status = 'locked';

    ELSIF v_case_stage = 'in_litigation' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('re_evidence_vault', 're_demand_letter', 're_negotiation', 're_prepare_filing', 're_file_with_court', 're_serve_defendant', 're_wait_for_answer', 're_review_answer')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 're_discovery' AND status = 'locked';

    ELSE
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 're_evidence_vault' AND status = 'locked';
    END IF;
  END IF;

  -- RE: re_evidence_vault -> re_demand_letter
  IF NEW.task_key = 're_evidence_vault' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 're_demand_letter' AND status = 'locked';
  END IF;

  -- RE: re_demand_letter -> re_negotiation (complete OR skip)
  IF NEW.task_key = 're_demand_letter' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 're_negotiation' AND status = 'locked';
  END IF;

  -- RE: re_negotiation -> re_prepare_filing (complete OR skip)
  IF NEW.task_key = 're_negotiation' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 're_prepare_filing' AND status = 'locked';
  END IF;

  -- RE: re_prepare_filing -> re_file_with_court
  IF NEW.task_key = 're_prepare_filing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 're_file_with_court' AND status = 'locked';
  END IF;

  -- RE: re_file_with_court -> re_serve_defendant
  IF NEW.task_key = 're_file_with_court' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 're_serve_defendant' AND status = 'locked';
  END IF;

  -- RE: re_serve_defendant -> re_wait_for_answer
  IF NEW.task_key = 're_serve_defendant' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 're_wait_for_answer' AND status = 'locked';
  END IF;

  -- RE: re_wait_for_answer -> re_review_answer
  IF NEW.task_key = 're_wait_for_answer' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 're_review_answer' AND status = 'locked';
  END IF;

  -- RE: re_review_answer -> re_discovery
  IF NEW.task_key = 're_review_answer' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 're_discovery' AND status = 'locked';
  END IF;

  -- RE: re_discovery -> re_post_resolution
  IF NEW.task_key = 're_discovery' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 're_post_resolution' AND status = 'locked';
  END IF;

  -- ========================================
  -- BUSINESS: WELCOME -> biz_*_intake
  -- ========================================

  IF NEW.task_key = 'welcome' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_partnership_intake' AND status = 'locked';

    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_employment_intake' AND status = 'locked';

    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_b2b_intake' AND status = 'locked';
  END IF;

  -- ========================================
  -- BUSINESS: PARTNERSHIP chain (9 transitions)
  -- ========================================

  IF NEW.task_key = 'biz_partnership_intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    v_case_stage := COALESCE(NEW.metadata->'guided_answers'->>'case_stage', 'start');

    IF v_case_stage = 'start' THEN
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'biz_partnership_evidence' AND status = 'locked';

    ELSIF v_case_stage = 'demand_sent' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('biz_partnership_evidence', 'biz_partnership_demand_letter', 'biz_partnership_adr')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'biz_partnership_prepare_filing' AND status = 'locked';

    ELSIF v_case_stage = 'filed' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('biz_partnership_evidence', 'biz_partnership_demand_letter', 'biz_partnership_adr', 'biz_partnership_prepare_filing')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'biz_partnership_file_with_court' AND status = 'locked';

    ELSIF v_case_stage = 'served' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('biz_partnership_evidence', 'biz_partnership_demand_letter', 'biz_partnership_adr', 'biz_partnership_prepare_filing', 'biz_partnership_file_with_court', 'biz_partnership_serve_defendant')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'biz_partnership_wait_for_answer' AND status = 'locked';

    ELSIF v_case_stage = 'in_litigation' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('biz_partnership_evidence', 'biz_partnership_demand_letter', 'biz_partnership_adr', 'biz_partnership_prepare_filing', 'biz_partnership_file_with_court', 'biz_partnership_serve_defendant', 'biz_partnership_wait_for_answer')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'biz_partnership_discovery' AND status = 'locked';

    ELSE
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'biz_partnership_evidence' AND status = 'locked';
    END IF;
  END IF;

  IF NEW.task_key = 'biz_partnership_evidence' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_partnership_demand_letter' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'biz_partnership_demand_letter' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_partnership_adr' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'biz_partnership_adr' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_partnership_prepare_filing' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'biz_partnership_prepare_filing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_partnership_file_with_court' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'biz_partnership_file_with_court' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_partnership_serve_defendant' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'biz_partnership_serve_defendant' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_partnership_wait_for_answer' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'biz_partnership_wait_for_answer' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_partnership_discovery' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'biz_partnership_discovery' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_partnership_post_resolution' AND status = 'locked';
  END IF;

  -- ========================================
  -- BUSINESS: EMPLOYMENT chain (9 transitions)
  -- ========================================

  IF NEW.task_key = 'biz_employment_intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    v_case_stage := COALESCE(NEW.metadata->'guided_answers'->>'case_stage', 'start');

    IF v_case_stage = 'start' THEN
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'biz_employment_evidence' AND status = 'locked';

    ELSIF v_case_stage = 'demand_sent' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('biz_employment_evidence', 'biz_employment_demand_letter', 'biz_employment_eeoc')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'biz_employment_prepare_filing' AND status = 'locked';

    ELSIF v_case_stage = 'filed' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('biz_employment_evidence', 'biz_employment_demand_letter', 'biz_employment_eeoc', 'biz_employment_prepare_filing')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'biz_employment_file_with_court' AND status = 'locked';

    ELSIF v_case_stage = 'served' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('biz_employment_evidence', 'biz_employment_demand_letter', 'biz_employment_eeoc', 'biz_employment_prepare_filing', 'biz_employment_file_with_court', 'biz_employment_serve_defendant')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'biz_employment_wait_for_answer' AND status = 'locked';

    ELSIF v_case_stage = 'in_litigation' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('biz_employment_evidence', 'biz_employment_demand_letter', 'biz_employment_eeoc', 'biz_employment_prepare_filing', 'biz_employment_file_with_court', 'biz_employment_serve_defendant', 'biz_employment_wait_for_answer')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'biz_employment_discovery' AND status = 'locked';

    ELSE
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'biz_employment_evidence' AND status = 'locked';
    END IF;
  END IF;

  IF NEW.task_key = 'biz_employment_evidence' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_employment_demand_letter' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'biz_employment_demand_letter' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_employment_eeoc' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'biz_employment_eeoc' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_employment_prepare_filing' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'biz_employment_prepare_filing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_employment_file_with_court' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'biz_employment_file_with_court' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_employment_serve_defendant' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'biz_employment_serve_defendant' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_employment_wait_for_answer' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'biz_employment_wait_for_answer' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_employment_discovery' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'biz_employment_discovery' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_employment_post_resolution' AND status = 'locked';
  END IF;

  -- ========================================
  -- BUSINESS: B2B chain (9 transitions)
  -- ========================================

  IF NEW.task_key = 'biz_b2b_intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    v_case_stage := COALESCE(NEW.metadata->'guided_answers'->>'case_stage', 'start');

    IF v_case_stage = 'start' THEN
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'biz_b2b_evidence' AND status = 'locked';

    ELSIF v_case_stage = 'demand_sent' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('biz_b2b_evidence', 'biz_b2b_demand_letter', 'biz_b2b_negotiation')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'biz_b2b_prepare_filing' AND status = 'locked';

    ELSIF v_case_stage = 'filed' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('biz_b2b_evidence', 'biz_b2b_demand_letter', 'biz_b2b_negotiation', 'biz_b2b_prepare_filing')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'biz_b2b_file_with_court' AND status = 'locked';

    ELSIF v_case_stage = 'served' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('biz_b2b_evidence', 'biz_b2b_demand_letter', 'biz_b2b_negotiation', 'biz_b2b_prepare_filing', 'biz_b2b_file_with_court', 'biz_b2b_serve_defendant')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'biz_b2b_wait_for_answer' AND status = 'locked';

    ELSIF v_case_stage = 'in_litigation' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('biz_b2b_evidence', 'biz_b2b_demand_letter', 'biz_b2b_negotiation', 'biz_b2b_prepare_filing', 'biz_b2b_file_with_court', 'biz_b2b_serve_defendant', 'biz_b2b_wait_for_answer')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'biz_b2b_discovery' AND status = 'locked';

    ELSE
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'biz_b2b_evidence' AND status = 'locked';
    END IF;
  END IF;

  IF NEW.task_key = 'biz_b2b_evidence' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_b2b_demand_letter' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'biz_b2b_demand_letter' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_b2b_negotiation' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'biz_b2b_negotiation' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_b2b_prepare_filing' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'biz_b2b_prepare_filing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_b2b_file_with_court' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'biz_b2b_file_with_court' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_b2b_serve_defendant' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'biz_b2b_serve_defendant' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_b2b_wait_for_answer' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'biz_b2b_wait_for_answer' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_b2b_discovery' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'biz_b2b_discovery' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_b2b_post_resolution' AND status = 'locked';
  END IF;

  -- ========================================
  -- PROPERTY UNLOCK CHAIN (10 transitions)
  -- ========================================

  IF NEW.task_key = 'welcome' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'property_intake' AND status = 'locked';
  END IF;

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

  IF NEW.task_key = 'welcome' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'landlord_tenant_intake' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'landlord_tenant_intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'evidence_vault' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'evidence_vault' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'prepare_lt_demand_letter' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'prepare_lt_demand_letter' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'lt_negotiation' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'lt_negotiation' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'prepare_landlord_tenant_filing' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'prepare_landlord_tenant_filing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'lt_file_with_court' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'lt_file_with_court' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'serve_other_party' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'serve_other_party' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'lt_wait_for_response' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'lt_wait_for_response' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'lt_review_response' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'lt_review_response' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'lt_discovery' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'lt_discovery' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'lt_prepare_for_hearing' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'lt_prepare_for_hearing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'lt_mediation' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'lt_mediation' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'lt_hearing_day' AND status = 'locked';
  END IF;

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
  -- FAMILY: DIVORCE chain (updated with new tasks)
  -- ========================================

  -- welcome -> divorce_intake
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
        AND task_key IN ('divorce_safety_screening', 'divorce_evidence_vault', 'divorce_prepare_filing', 'divorce_file_with_court', 'divorce_standing_orders', 'divorce_serve_respondent')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'divorce_response_checkpoint' AND status = 'locked';

    ELSIF v_case_stage = 'waiting_period' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('divorce_safety_screening', 'divorce_evidence_vault', 'divorce_prepare_filing', 'divorce_file_with_court', 'divorce_standing_orders', 'divorce_serve_respondent', 'divorce_response_checkpoint', 'divorce_waiting_period')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'divorce_temporary_orders' AND status = 'locked';

    ELSIF v_case_stage = 'temporary_orders' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('divorce_safety_screening', 'divorce_evidence_vault', 'divorce_prepare_filing', 'divorce_file_with_court', 'divorce_standing_orders', 'divorce_serve_respondent', 'divorce_response_checkpoint', 'divorce_waiting_period', 'divorce_temporary_orders')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'divorce_mediation' AND status = 'locked';

    ELSIF v_case_stage = 'mediation' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('divorce_safety_screening', 'divorce_evidence_vault', 'divorce_prepare_filing', 'divorce_file_with_court', 'divorce_standing_orders', 'divorce_serve_respondent', 'divorce_response_checkpoint', 'divorce_waiting_period', 'divorce_temporary_orders', 'divorce_mediation')
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

  -- divorce_file_with_court -> divorce_standing_orders (NEW: was divorce_serve_respondent)
  IF NEW.task_key = 'divorce_file_with_court' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'divorce_standing_orders' AND status = 'locked';
  END IF;

  -- divorce_standing_orders -> divorce_serve_respondent
  IF NEW.task_key = 'divorce_standing_orders' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'divorce_serve_respondent' AND status = 'locked';
  END IF;

  -- divorce_serve_respondent -> divorce_response_checkpoint (NEW: was divorce_waiting_period)
  IF NEW.task_key = 'divorce_serve_respondent' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'divorce_response_checkpoint' AND status = 'locked';
  END IF;

  -- divorce_response_checkpoint -> CONDITIONAL BRANCHING based on response_status
  IF NEW.task_key = 'divorce_response_checkpoint' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    v_response_status := COALESCE(NEW.metadata->'guided_answers'->>'response_status', 'answer_filed');

    IF v_response_status = 'agreed' THEN
      -- Skip temp orders and mediation, go to property division
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('divorce_waiting_period', 'divorce_temporary_orders', 'divorce_mediation')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'divorce_property_division' AND status = 'locked';

    ELSIF v_response_status = 'no_response' THEN
      -- Skip mediation, keep temp orders path via waiting period
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'divorce_waiting_period' AND status = 'locked';

    ELSIF v_response_status = 'waiting' THEN
      -- Do NOT unlock anything — user needs to come back
      NULL;

    ELSE
      -- 'answer_filed' or default: normal contested path
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'divorce_waiting_period' AND status = 'locked';
    END IF;
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

  -- divorce_final_orders -> divorce_post_decree (NEW)
  IF NEW.task_key = 'divorce_final_orders' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'divorce_post_decree' AND status = 'locked';
  END IF;

  -- ========================================
  -- FAMILY: CUSTODY chain (updated with new tasks)
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
      -- NEW: custody_intake -> custody_uccjea_affidavit (was custody_safety_screening)
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'custody_uccjea_affidavit' AND status = 'locked';

    ELSIF v_case_stage = 'filed' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('custody_uccjea_affidavit', 'custody_paternity', 'custody_safety_screening', 'custody_evidence_vault', 'custody_prepare_filing')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'custody_file_with_court' AND status = 'locked';

    ELSIF v_case_stage = 'served' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('custody_uccjea_affidavit', 'custody_paternity', 'custody_safety_screening', 'custody_evidence_vault', 'custody_prepare_filing', 'custody_file_with_court', 'custody_serve_respondent')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'custody_response_checkpoint' AND status = 'locked';

    ELSIF v_case_stage = 'temporary_orders' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('custody_uccjea_affidavit', 'custody_paternity', 'custody_safety_screening', 'custody_evidence_vault', 'custody_prepare_filing', 'custody_file_with_court', 'custody_serve_respondent', 'custody_response_checkpoint', 'custody_temporary_orders')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'custody_mediation' AND status = 'locked';

    ELSIF v_case_stage = 'mediation' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('custody_uccjea_affidavit', 'custody_paternity', 'custody_safety_screening', 'custody_evidence_vault', 'custody_prepare_filing', 'custody_file_with_court', 'custody_serve_respondent', 'custody_response_checkpoint', 'custody_temporary_orders', 'custody_mediation')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'custody_final_orders' AND status = 'locked';

    ELSE
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'custody_uccjea_affidavit' AND status = 'locked';
    END IF;
  END IF;

  -- custody_uccjea_affidavit -> custody_paternity (NEW)
  IF NEW.task_key = 'custody_uccjea_affidavit' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'custody_paternity' AND status = 'locked';
  END IF;

  -- custody_paternity -> custody_safety_screening (NEW)
  IF NEW.task_key = 'custody_paternity' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'custody_safety_screening' AND status = 'locked';
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

  -- custody_serve_respondent -> custody_response_checkpoint (NEW: was custody_temporary_orders)
  IF NEW.task_key = 'custody_serve_respondent' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'custody_response_checkpoint' AND status = 'locked';
  END IF;

  -- custody_response_checkpoint -> CONDITIONAL BRANCHING based on response_status
  IF NEW.task_key = 'custody_response_checkpoint' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    v_response_status := COALESCE(NEW.metadata->'guided_answers'->>'response_status', 'answer_filed');

    IF v_response_status = 'agreed' THEN
      -- Skip temp orders and mediation, go to final orders
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('custody_temporary_orders', 'custody_mediation')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'custody_final_orders' AND status = 'locked';

    ELSIF v_response_status = 'no_response' THEN
      -- Skip mediation, unlock temporary orders
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('custody_mediation')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'custody_temporary_orders' AND status = 'locked';

    ELSIF v_response_status = 'waiting' THEN
      NULL;

    ELSE
      -- 'answer_filed' or default: normal contested path
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'custody_temporary_orders' AND status = 'locked';
    END IF;
  END IF;

  -- custody_temporary_orders -> custody_mediation (completed OR skipped)
  IF NEW.task_key = 'custody_temporary_orders' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'custody_mediation' AND status = 'locked';
  END IF;

  -- custody_mediation -> custody_final_orders (completed OR skipped)
  IF NEW.task_key = 'custody_mediation' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'custody_final_orders' AND status = 'locked';
  END IF;

  -- custody_final_orders -> custody_post_decree (NEW)
  IF NEW.task_key = 'custody_final_orders' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'custody_post_decree' AND status = 'locked';
  END IF;

  -- ========================================
  -- FAMILY: CHILD SUPPORT chain (updated with new tasks)
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
      -- NEW: child_support_intake -> child_support_ag_option (was child_support_evidence_vault)
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'child_support_ag_option' AND status = 'locked';

    ELSIF v_case_stage = 'filed' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('child_support_ag_option', 'child_support_paternity', 'child_support_evidence_vault', 'child_support_prepare_filing')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'child_support_file_with_court' AND status = 'locked';

    ELSIF v_case_stage = 'served' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('child_support_ag_option', 'child_support_paternity', 'child_support_evidence_vault', 'child_support_prepare_filing', 'child_support_file_with_court', 'child_support_serve_respondent')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'child_support_response_checkpoint' AND status = 'locked';

    ELSE
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'child_support_ag_option' AND status = 'locked';
    END IF;
  END IF;

  -- child_support_ag_option -> child_support_paternity (NEW)
  IF NEW.task_key = 'child_support_ag_option' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'child_support_paternity' AND status = 'locked';
  END IF;

  -- child_support_paternity -> child_support_evidence_vault (NEW)
  IF NEW.task_key = 'child_support_paternity' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'child_support_evidence_vault' AND status = 'locked';
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

  -- child_support_serve_respondent -> child_support_response_checkpoint (NEW: was child_support_temporary_orders)
  IF NEW.task_key = 'child_support_serve_respondent' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'child_support_response_checkpoint' AND status = 'locked';
  END IF;

  -- child_support_response_checkpoint -> CONDITIONAL BRANCHING based on response_status
  IF NEW.task_key = 'child_support_response_checkpoint' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    v_response_status := COALESCE(NEW.metadata->'guided_answers'->>'response_status', 'answer_filed');

    IF v_response_status = 'agreed' THEN
      -- Skip temp orders, go to final orders
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('child_support_temporary_orders')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'child_support_final_orders' AND status = 'locked';

    ELSIF v_response_status = 'no_response' THEN
      -- No mediation to skip; unlock temp orders
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'child_support_temporary_orders' AND status = 'locked';

    ELSIF v_response_status = 'waiting' THEN
      NULL;

    ELSE
      -- 'answer_filed' or default: normal contested path
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'child_support_temporary_orders' AND status = 'locked';
    END IF;
  END IF;

  -- child_support_temporary_orders -> child_support_final_orders (completed OR skipped)
  IF NEW.task_key = 'child_support_temporary_orders' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'child_support_final_orders' AND status = 'locked';
  END IF;

  -- child_support_final_orders -> child_support_post_decree (NEW)
  IF NEW.task_key = 'child_support_final_orders' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'child_support_post_decree' AND status = 'locked';
  END IF;

  -- ========================================
  -- FAMILY: VISITATION chain (updated with new tasks)
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
      WHERE case_id = NEW.case_id AND task_key = 'visitation_response_checkpoint' AND status = 'locked';

    ELSIF v_case_stage = 'mediation' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('visitation_safety_screening', 'visitation_evidence_vault', 'visitation_prepare_filing', 'visitation_file_with_court', 'visitation_serve_respondent', 'visitation_response_checkpoint', 'visitation_mediation')
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

  -- visitation_serve_respondent -> visitation_response_checkpoint (NEW: was visitation_mediation)
  IF NEW.task_key = 'visitation_serve_respondent' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'visitation_response_checkpoint' AND status = 'locked';
  END IF;

  -- visitation_response_checkpoint -> CONDITIONAL BRANCHING based on response_status
  IF NEW.task_key = 'visitation_response_checkpoint' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    v_response_status := COALESCE(NEW.metadata->'guided_answers'->>'response_status', 'answer_filed');

    IF v_response_status = 'agreed' THEN
      -- Skip mediation, go to final orders
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('visitation_mediation')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'visitation_final_orders' AND status = 'locked';

    ELSIF v_response_status = 'no_response' THEN
      -- Skip mediation, go to final orders
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('visitation_mediation')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'visitation_final_orders' AND status = 'locked';

    ELSIF v_response_status = 'waiting' THEN
      NULL;

    ELSE
      -- 'answer_filed' or default: normal contested path -> mediation
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'visitation_mediation' AND status = 'locked';
    END IF;
  END IF;

  -- visitation_mediation -> visitation_final_orders (completed OR skipped)
  IF NEW.task_key = 'visitation_mediation' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'visitation_final_orders' AND status = 'locked';
  END IF;

  -- visitation_final_orders -> visitation_post_decree (NEW)
  IF NEW.task_key = 'visitation_final_orders' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'visitation_post_decree' AND status = 'locked';
  END IF;

  -- ========================================
  -- FAMILY: SPOUSAL SUPPORT chain (updated with new tasks)
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
      -- NEW: spousal_support_intake -> spousal_support_eligibility (was spousal_support_evidence_vault)
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'spousal_support_eligibility' AND status = 'locked';

    ELSIF v_case_stage = 'filed' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('spousal_support_eligibility', 'spousal_support_evidence_vault', 'spousal_support_prepare_filing')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'spousal_support_file_with_court' AND status = 'locked';

    ELSIF v_case_stage = 'served' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('spousal_support_eligibility', 'spousal_support_evidence_vault', 'spousal_support_prepare_filing', 'spousal_support_file_with_court', 'spousal_support_serve_respondent')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'spousal_support_response_checkpoint' AND status = 'locked';

    ELSE
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'spousal_support_eligibility' AND status = 'locked';
    END IF;
  END IF;

  -- spousal_support_eligibility -> spousal_support_evidence_vault (NEW)
  IF NEW.task_key = 'spousal_support_eligibility' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'spousal_support_evidence_vault' AND status = 'locked';
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

  -- spousal_support_serve_respondent -> spousal_support_response_checkpoint (NEW: was spousal_support_temporary_orders)
  IF NEW.task_key = 'spousal_support_serve_respondent' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'spousal_support_response_checkpoint' AND status = 'locked';
  END IF;

  -- spousal_support_response_checkpoint -> CONDITIONAL BRANCHING based on response_status
  IF NEW.task_key = 'spousal_support_response_checkpoint' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    v_response_status := COALESCE(NEW.metadata->'guided_answers'->>'response_status', 'answer_filed');

    IF v_response_status = 'agreed' THEN
      -- Skip temp orders, go to final orders
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('spousal_support_temporary_orders')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'spousal_support_final_orders' AND status = 'locked';

    ELSIF v_response_status = 'no_response' THEN
      -- No mediation to skip; unlock temp orders
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'spousal_support_temporary_orders' AND status = 'locked';

    ELSIF v_response_status = 'waiting' THEN
      NULL;

    ELSE
      -- 'answer_filed' or default: normal contested path
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'spousal_support_temporary_orders' AND status = 'locked';
    END IF;
  END IF;

  -- spousal_support_temporary_orders -> spousal_support_final_orders (completed OR skipped)
  IF NEW.task_key = 'spousal_support_temporary_orders' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'spousal_support_final_orders' AND status = 'locked';
  END IF;

  -- spousal_support_final_orders -> spousal_support_post_decree (NEW)
  IF NEW.task_key = 'spousal_support_final_orders' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'spousal_support_post_decree' AND status = 'locked';
  END IF;

  -- ========================================
  -- FAMILY: PROTECTIVE ORDER chain (5 transitions — unchanged)
  -- ========================================

  IF NEW.task_key = 'welcome' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'po_intake' AND status = 'locked';
  END IF;

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

  IF NEW.task_key = 'po_safety_screening' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'po_prepare_filing' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'po_prepare_filing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'po_file_with_court' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'po_file_with_court' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'po_hearing' AND status = 'locked';
  END IF;

  -- ========================================
  -- FAMILY: MODIFICATION chain (updated with new tasks)
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
      WHERE case_id = NEW.case_id AND task_key = 'mod_response_checkpoint' AND status = 'locked';

    ELSIF v_case_stage = 'mediation' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('mod_evidence_vault', 'mod_existing_order_review', 'mod_prepare_filing', 'mod_file_with_court', 'mod_serve_respondent', 'mod_response_checkpoint', 'mod_mediation')
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

  -- mod_serve_respondent -> mod_response_checkpoint (NEW: was mod_mediation)
  IF NEW.task_key = 'mod_serve_respondent' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'mod_response_checkpoint' AND status = 'locked';
  END IF;

  -- mod_response_checkpoint -> CONDITIONAL BRANCHING based on response_status
  IF NEW.task_key = 'mod_response_checkpoint' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    v_response_status := COALESCE(NEW.metadata->'guided_answers'->>'response_status', 'answer_filed');

    IF v_response_status = 'agreed' THEN
      -- Skip mediation, go to final orders
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('mod_mediation')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'mod_final_orders' AND status = 'locked';

    ELSIF v_response_status = 'no_response' THEN
      -- Skip mediation, go to final orders
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('mod_mediation')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'mod_final_orders' AND status = 'locked';

    ELSIF v_response_status = 'waiting' THEN
      NULL;

    ELSE
      -- 'answer_filed' or default: normal contested path -> mediation
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'mod_mediation' AND status = 'locked';
    END IF;
  END IF;

  -- mod_mediation -> mod_final_orders (completed OR skipped)
  IF NEW.task_key = 'mod_mediation' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'mod_final_orders' AND status = 'locked';
  END IF;

  -- mod_final_orders -> mod_post_decree (NEW)
  IF NEW.task_key = 'mod_final_orders' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'mod_post_decree' AND status = 'locked';
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


-- =============================================================
-- STEP 3: Backfill existing family cases with new tasks
-- =============================================================

-- DIVORCE: divorce_standing_orders
INSERT INTO public.tasks (case_id, task_key, title, status)
SELECT c.id, 'divorce_standing_orders', 'County Standing Orders', 'locked'
FROM public.cases c
JOIN public.family_case_details fcd ON fcd.case_id = c.id
WHERE c.dispute_type = 'family' AND fcd.family_sub_type = 'divorce'
AND NOT EXISTS (SELECT 1 FROM public.tasks WHERE case_id = c.id AND task_key = 'divorce_standing_orders');

-- DIVORCE: divorce_response_checkpoint
INSERT INTO public.tasks (case_id, task_key, title, status)
SELECT c.id, 'divorce_response_checkpoint', 'What Happened After Service?', 'locked'
FROM public.cases c
JOIN public.family_case_details fcd ON fcd.case_id = c.id
WHERE c.dispute_type = 'family' AND fcd.family_sub_type = 'divorce'
AND NOT EXISTS (SELECT 1 FROM public.tasks WHERE case_id = c.id AND task_key = 'divorce_response_checkpoint');

-- DIVORCE: divorce_post_decree
INSERT INTO public.tasks (case_id, task_key, title, status)
SELECT c.id, 'divorce_post_decree', 'After Your Divorce Is Final', 'locked'
FROM public.cases c
JOIN public.family_case_details fcd ON fcd.case_id = c.id
WHERE c.dispute_type = 'family' AND fcd.family_sub_type = 'divorce'
AND NOT EXISTS (SELECT 1 FROM public.tasks WHERE case_id = c.id AND task_key = 'divorce_post_decree');

-- CUSTODY: custody_uccjea_affidavit
INSERT INTO public.tasks (case_id, task_key, title, status)
SELECT c.id, 'custody_uccjea_affidavit', 'UCCJEA Affidavit', 'locked'
FROM public.cases c
JOIN public.family_case_details fcd ON fcd.case_id = c.id
WHERE c.dispute_type = 'family' AND fcd.family_sub_type = 'custody'
AND NOT EXISTS (SELECT 1 FROM public.tasks WHERE case_id = c.id AND task_key = 'custody_uccjea_affidavit');

-- CUSTODY: custody_paternity
INSERT INTO public.tasks (case_id, task_key, title, status)
SELECT c.id, 'custody_paternity', 'Establishing Paternity', 'locked'
FROM public.cases c
JOIN public.family_case_details fcd ON fcd.case_id = c.id
WHERE c.dispute_type = 'family' AND fcd.family_sub_type = 'custody'
AND NOT EXISTS (SELECT 1 FROM public.tasks WHERE case_id = c.id AND task_key = 'custody_paternity');

-- CUSTODY: custody_response_checkpoint
INSERT INTO public.tasks (case_id, task_key, title, status)
SELECT c.id, 'custody_response_checkpoint', 'What Happened After Service?', 'locked'
FROM public.cases c
JOIN public.family_case_details fcd ON fcd.case_id = c.id
WHERE c.dispute_type = 'family' AND fcd.family_sub_type = 'custody'
AND NOT EXISTS (SELECT 1 FROM public.tasks WHERE case_id = c.id AND task_key = 'custody_response_checkpoint');

-- CUSTODY: custody_post_decree
INSERT INTO public.tasks (case_id, task_key, title, status)
SELECT c.id, 'custody_post_decree', 'After Your Custody Order Is Final', 'locked'
FROM public.cases c
JOIN public.family_case_details fcd ON fcd.case_id = c.id
WHERE c.dispute_type = 'family' AND fcd.family_sub_type = 'custody'
AND NOT EXISTS (SELECT 1 FROM public.tasks WHERE case_id = c.id AND task_key = 'custody_post_decree');

-- CHILD SUPPORT: child_support_ag_option
INSERT INTO public.tasks (case_id, task_key, title, status)
SELECT c.id, 'child_support_ag_option', 'Filing Options', 'locked'
FROM public.cases c
JOIN public.family_case_details fcd ON fcd.case_id = c.id
WHERE c.dispute_type = 'family' AND fcd.family_sub_type = 'child_support'
AND NOT EXISTS (SELECT 1 FROM public.tasks WHERE case_id = c.id AND task_key = 'child_support_ag_option');

-- CHILD SUPPORT: child_support_paternity
INSERT INTO public.tasks (case_id, task_key, title, status)
SELECT c.id, 'child_support_paternity', 'Establishing Paternity', 'locked'
FROM public.cases c
JOIN public.family_case_details fcd ON fcd.case_id = c.id
WHERE c.dispute_type = 'family' AND fcd.family_sub_type = 'child_support'
AND NOT EXISTS (SELECT 1 FROM public.tasks WHERE case_id = c.id AND task_key = 'child_support_paternity');

-- CHILD SUPPORT: child_support_response_checkpoint
INSERT INTO public.tasks (case_id, task_key, title, status)
SELECT c.id, 'child_support_response_checkpoint', 'What Happened After Service?', 'locked'
FROM public.cases c
JOIN public.family_case_details fcd ON fcd.case_id = c.id
WHERE c.dispute_type = 'family' AND fcd.family_sub_type = 'child_support'
AND NOT EXISTS (SELECT 1 FROM public.tasks WHERE case_id = c.id AND task_key = 'child_support_response_checkpoint');

-- CHILD SUPPORT: child_support_post_decree
INSERT INTO public.tasks (case_id, task_key, title, status)
SELECT c.id, 'child_support_post_decree', 'After Your Child Support Order Is Final', 'locked'
FROM public.cases c
JOIN public.family_case_details fcd ON fcd.case_id = c.id
WHERE c.dispute_type = 'family' AND fcd.family_sub_type = 'child_support'
AND NOT EXISTS (SELECT 1 FROM public.tasks WHERE case_id = c.id AND task_key = 'child_support_post_decree');

-- VISITATION: visitation_response_checkpoint
INSERT INTO public.tasks (case_id, task_key, title, status)
SELECT c.id, 'visitation_response_checkpoint', 'What Happened After Service?', 'locked'
FROM public.cases c
JOIN public.family_case_details fcd ON fcd.case_id = c.id
WHERE c.dispute_type = 'family' AND fcd.family_sub_type = 'visitation'
AND NOT EXISTS (SELECT 1 FROM public.tasks WHERE case_id = c.id AND task_key = 'visitation_response_checkpoint');

-- VISITATION: visitation_post_decree
INSERT INTO public.tasks (case_id, task_key, title, status)
SELECT c.id, 'visitation_post_decree', 'After Your Visitation Order Is Final', 'locked'
FROM public.cases c
JOIN public.family_case_details fcd ON fcd.case_id = c.id
WHERE c.dispute_type = 'family' AND fcd.family_sub_type = 'visitation'
AND NOT EXISTS (SELECT 1 FROM public.tasks WHERE case_id = c.id AND task_key = 'visitation_post_decree');

-- SPOUSAL SUPPORT: spousal_support_eligibility
INSERT INTO public.tasks (case_id, task_key, title, status)
SELECT c.id, 'spousal_support_eligibility', 'Eligibility Check', 'locked'
FROM public.cases c
JOIN public.family_case_details fcd ON fcd.case_id = c.id
WHERE c.dispute_type = 'family' AND fcd.family_sub_type = 'spousal_support'
AND NOT EXISTS (SELECT 1 FROM public.tasks WHERE case_id = c.id AND task_key = 'spousal_support_eligibility');

-- SPOUSAL SUPPORT: spousal_support_response_checkpoint
INSERT INTO public.tasks (case_id, task_key, title, status)
SELECT c.id, 'spousal_support_response_checkpoint', 'What Happened After Service?', 'locked'
FROM public.cases c
JOIN public.family_case_details fcd ON fcd.case_id = c.id
WHERE c.dispute_type = 'family' AND fcd.family_sub_type = 'spousal_support'
AND NOT EXISTS (SELECT 1 FROM public.tasks WHERE case_id = c.id AND task_key = 'spousal_support_response_checkpoint');

-- SPOUSAL SUPPORT: spousal_support_post_decree
INSERT INTO public.tasks (case_id, task_key, title, status)
SELECT c.id, 'spousal_support_post_decree', 'After Your Spousal Support Order Is Final', 'locked'
FROM public.cases c
JOIN public.family_case_details fcd ON fcd.case_id = c.id
WHERE c.dispute_type = 'family' AND fcd.family_sub_type = 'spousal_support'
AND NOT EXISTS (SELECT 1 FROM public.tasks WHERE case_id = c.id AND task_key = 'spousal_support_post_decree');

-- MODIFICATION: mod_response_checkpoint
INSERT INTO public.tasks (case_id, task_key, title, status)
SELECT c.id, 'mod_response_checkpoint', 'What Happened After Service?', 'locked'
FROM public.cases c
JOIN public.family_case_details fcd ON fcd.case_id = c.id
WHERE c.dispute_type = 'family' AND fcd.family_sub_type = 'modification'
AND NOT EXISTS (SELECT 1 FROM public.tasks WHERE case_id = c.id AND task_key = 'mod_response_checkpoint');

-- MODIFICATION: mod_post_decree
INSERT INTO public.tasks (case_id, task_key, title, status)
SELECT c.id, 'mod_post_decree', 'After Your Modification Is Final', 'locked'
FROM public.cases c
JOIN public.family_case_details fcd ON fcd.case_id = c.id
WHERE c.dispute_type = 'family' AND fcd.family_sub_type = 'modification'
AND NOT EXISTS (SELECT 1 FROM public.tasks WHERE case_id = c.id AND task_key = 'mod_post_decree');
