-- =============================================================
-- BUSINESS DISPUTE WORKFLOW
-- =============================================================
-- Adds business dispute type with 3 sub-workflows:
--   partnership (10 tasks), employment (10 tasks), b2b (10 tasks)
--
-- Steps:
--   1. Create business_details table with RLS
--   2. CREATE OR REPLACE seed_case_tasks() — add business branch
--   3. Create seed_business_tasks() function + trigger
--   4. CREATE OR REPLACE unlock_next_task() — add business chains
-- =============================================================


-- =============================================================
-- STEP 1: BUSINESS DETAILS TABLE
-- =============================================================

CREATE TABLE IF NOT EXISTS public.business_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  business_sub_type text NOT NULL CHECK (business_sub_type IN (
    'partnership', 'employment', 'b2b_commercial'
  )),
  -- Partnership fields
  business_name text,
  business_type text CHECK (business_type IS NULL OR business_type IN ('partnership', 'llc', 'corporation', 'other')),
  partner_names text,
  ownership_percentages text,
  formation_state text,
  has_operating_agreement boolean DEFAULT false,
  -- Employment fields
  employer_name text,
  employer_size text CHECK (employer_size IS NULL OR employer_size IN ('small_under_15', 'medium_15_to_100', 'large_over_100')),
  position_title text,
  employment_start_date date,
  employment_end_date date,
  hr_complaint_filed boolean DEFAULT false,
  has_employment_contract boolean DEFAULT false,
  has_employee_handbook boolean DEFAULT false,
  -- B2B fields
  other_business_name text,
  contract_type text CHECK (contract_type IS NULL OR contract_type IN ('service', 'vendor', 'licensing', 'distribution', 'other')),
  contract_date date,
  contract_amount numeric,
  has_written_contract boolean DEFAULT false,
  -- Shared fields
  specific_dispute_type text,
  dispute_description text,
  damages_sought numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(case_id)
);

ALTER TABLE public.business_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own business details"
  ON public.business_details
  FOR ALL
  USING (
    case_id IN (SELECT id FROM public.cases WHERE user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_business_details_case ON public.business_details(case_id);


-- =============================================================
-- STEP 2: CREATE OR REPLACE seed_case_tasks()
-- =============================================================
-- Full replacement with business branch added before family.

CREATE OR REPLACE FUNCTION public.seed_case_tasks()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  -- v_family_sub_type removed: family tasks are seeded by seed_family_tasks() trigger
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
  -- Real estate cases — early return
  -- ========================================
  IF NEW.dispute_type = 'real_estate' THEN
    INSERT INTO public.tasks (case_id, task_key, title, status, unlocked_at)
    VALUES (NEW.id, 'welcome', 'Welcome — Get Started', 'todo', now());

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES
      (NEW.id, 're_intake', 'Tell Us About Your Real Estate Dispute', 'locked'),
      (NEW.id, 're_evidence_vault', 'Organize Your Evidence', 'locked'),
      (NEW.id, 're_demand_letter', 'Draft Your Demand Letter', 'locked'),
      (NEW.id, 're_negotiation', 'Settlement Negotiation', 'locked'),
      (NEW.id, 're_prepare_filing', 'Prepare Your Court Filing', 'locked'),
      (NEW.id, 're_file_with_court', 'File With the Court', 'locked'),
      (NEW.id, 're_serve_defendant', 'Serve the Other Party', 'locked'),
      (NEW.id, 're_wait_for_answer', 'Wait for the Answer', 'locked'),
      (NEW.id, 're_review_answer', 'Review the Opposing Answer', 'locked'),
      (NEW.id, 're_discovery', 'Prepare Your Discovery', 'locked'),
      (NEW.id, 're_post_resolution', 'Post-Resolution Steps', 'locked');

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
  -- Business cases — seed welcome only
  -- Sub-type tasks are seeded by seed_business_tasks()
  -- trigger on business_details INSERT
  -- ========================================
  IF NEW.dispute_type = 'business' THEN
    INSERT INTO public.tasks (case_id, task_key, title, status, unlocked_at)
    VALUES (NEW.id, 'welcome', 'Welcome — Get Started', 'todo', now());

    INSERT INTO public.task_events (case_id, kind, payload)
    VALUES (NEW.id, 'case_created', jsonb_build_object(
      'role', NEW.role,
      'county', NEW.county,
      'court_type', NEW.court_type,
      'dispute_type', NEW.dispute_type,
      'tasks_seeded', 1
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
  -- Small claims cases — 9 tasks (sc_* namespaced)
  -- ========================================
  IF NEW.dispute_type = 'small_claims' THEN
    INSERT INTO public.tasks (case_id, task_key, title, status, unlocked_at)
    VALUES (NEW.id, 'welcome', 'Welcome — Get Started', 'todo', now());

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES
      (NEW.id, 'small_claims_intake', 'Tell Us About Your Claim', 'locked'),
      (NEW.id, 'sc_evidence_vault', 'Organize Your Evidence', 'locked'),
      (NEW.id, 'sc_demand_letter', 'Draft a Demand Letter', 'locked'),
      (NEW.id, 'prepare_small_claims_filing', 'Prepare Your Small Claims Petition', 'locked'),
      (NEW.id, 'sc_file_with_court', 'File With the Court', 'locked'),
      (NEW.id, 'sc_serve_defendant', 'Serve the Defendant', 'locked'),
      (NEW.id, 'sc_prepare_for_hearing', 'Prepare for Your Hearing', 'locked'),
      (NEW.id, 'sc_hearing_day', 'Hearing Day', 'locked');

    INSERT INTO public.task_events (case_id, kind, payload)
    VALUES (NEW.id, 'case_created', jsonb_build_object(
      'role', NEW.role,
      'county', NEW.county,
      'court_type', NEW.court_type,
      'dispute_type', NEW.dispute_type,
      'tasks_seeded', 9
    ));

    RETURN NEW;
  END IF;

  -- ========================================
  -- Family law cases — seed welcome only
  -- Sub-type tasks are seeded by seed_family_tasks()
  -- trigger on family_case_details INSERT
  -- ========================================
  IF NEW.dispute_type = 'family' THEN
    INSERT INTO public.tasks (case_id, task_key, title, status, unlocked_at)
    VALUES (NEW.id, 'welcome', 'Welcome — Get Started', 'todo', now());

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
-- STEP 3: seed_business_tasks() FUNCTION + TRIGGER
-- =============================================================
-- Seeds sub-type-specific tasks when business_details row is inserted.

CREATE OR REPLACE FUNCTION public.seed_business_tasks()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_case RECORD;
BEGIN
  SELECT id, role, county, court_type, dispute_type
  INTO v_case
  FROM public.cases
  WHERE id = NEW.case_id;

  IF v_case IS NULL OR v_case.dispute_type != 'business' THEN
    RETURN NEW;
  END IF;

  -- PARTNERSHIP (10 tasks after welcome)
  IF NEW.business_sub_type = 'partnership' THEN
    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES
      (NEW.case_id, 'biz_partnership_intake', 'Tell Us About Your Partnership Dispute', 'locked'),
      (NEW.case_id, 'biz_partnership_evidence', 'Organize Your Evidence', 'locked'),
      (NEW.case_id, 'biz_partnership_demand_letter', 'Draft Your Demand Letter', 'locked'),
      (NEW.case_id, 'biz_partnership_adr', 'Mediation or Arbitration', 'locked'),
      (NEW.case_id, 'biz_partnership_prepare_filing', 'Prepare Your Court Filing', 'locked'),
      (NEW.case_id, 'biz_partnership_file_with_court', 'File With the Court', 'locked'),
      (NEW.case_id, 'biz_partnership_serve_defendant', 'Serve the Other Party', 'locked'),
      (NEW.case_id, 'biz_partnership_wait_for_answer', 'Wait for the Answer', 'locked'),
      (NEW.case_id, 'biz_partnership_discovery', 'Prepare Your Discovery', 'locked'),
      (NEW.case_id, 'biz_partnership_post_resolution', 'Post-Resolution Steps', 'locked');

  -- EMPLOYMENT (10 tasks after welcome)
  ELSIF NEW.business_sub_type = 'employment' THEN
    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES
      (NEW.case_id, 'biz_employment_intake', 'Tell Us About Your Employment Dispute', 'locked'),
      (NEW.case_id, 'biz_employment_evidence', 'Organize Your Evidence', 'locked'),
      (NEW.case_id, 'biz_employment_demand_letter', 'Draft Your Demand Letter', 'locked'),
      (NEW.case_id, 'biz_employment_eeoc', 'File EEOC/TWC Complaint', 'locked'),
      (NEW.case_id, 'biz_employment_prepare_filing', 'Prepare Your Court Filing', 'locked'),
      (NEW.case_id, 'biz_employment_file_with_court', 'File With the Court', 'locked'),
      (NEW.case_id, 'biz_employment_serve_defendant', 'Serve the Employer', 'locked'),
      (NEW.case_id, 'biz_employment_wait_for_answer', 'Wait for the Answer', 'locked'),
      (NEW.case_id, 'biz_employment_discovery', 'Prepare Your Discovery', 'locked'),
      (NEW.case_id, 'biz_employment_post_resolution', 'Post-Resolution Steps', 'locked');

  -- B2B COMMERCIAL (10 tasks after welcome)
  ELSIF NEW.business_sub_type = 'b2b_commercial' THEN
    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES
      (NEW.case_id, 'biz_b2b_intake', 'Tell Us About Your Commercial Dispute', 'locked'),
      (NEW.case_id, 'biz_b2b_evidence', 'Organize Your Evidence', 'locked'),
      (NEW.case_id, 'biz_b2b_demand_letter', 'Draft Your Demand Letter', 'locked'),
      (NEW.case_id, 'biz_b2b_negotiation', 'Settlement Negotiation', 'locked'),
      (NEW.case_id, 'biz_b2b_prepare_filing', 'Prepare Your Court Filing', 'locked'),
      (NEW.case_id, 'biz_b2b_file_with_court', 'File With the Court', 'locked'),
      (NEW.case_id, 'biz_b2b_serve_defendant', 'Serve the Other Business', 'locked'),
      (NEW.case_id, 'biz_b2b_wait_for_answer', 'Wait for the Answer', 'locked'),
      (NEW.case_id, 'biz_b2b_discovery', 'Prepare Your Discovery', 'locked'),
      (NEW.case_id, 'biz_b2b_post_resolution', 'Post-Resolution Steps', 'locked');
  END IF;

  INSERT INTO public.task_events (case_id, kind, payload)
  VALUES (NEW.case_id, 'business_tasks_seeded', jsonb_build_object(
    'business_sub_type', NEW.business_sub_type,
    'tasks_seeded', 10
  ));

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_seed_business_tasks ON public.business_details;
CREATE TRIGGER trg_seed_business_tasks
  AFTER INSERT ON public.business_details
  FOR EACH ROW
  EXECUTE FUNCTION public.seed_business_tasks();


-- =============================================================
-- STEP 4: CREATE OR REPLACE unlock_next_task()
-- =============================================================
-- Full replacement with business chains added after real estate,
-- before family chains.

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
  -- These only match when the corresponding biz_*_intake task exists (i.e., business cases)

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

  -- Partnership: biz_partnership_intake -> CONDITIONAL BRANCHING based on case_stage
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

  -- Partnership: biz_partnership_evidence -> biz_partnership_demand_letter
  IF NEW.task_key = 'biz_partnership_evidence' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_partnership_demand_letter' AND status = 'locked';
  END IF;

  -- Partnership: biz_partnership_demand_letter -> biz_partnership_adr (complete OR skip)
  IF NEW.task_key = 'biz_partnership_demand_letter' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_partnership_adr' AND status = 'locked';
  END IF;

  -- Partnership: biz_partnership_adr -> biz_partnership_prepare_filing (complete OR skip)
  IF NEW.task_key = 'biz_partnership_adr' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_partnership_prepare_filing' AND status = 'locked';
  END IF;

  -- Partnership: biz_partnership_prepare_filing -> biz_partnership_file_with_court
  IF NEW.task_key = 'biz_partnership_prepare_filing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_partnership_file_with_court' AND status = 'locked';
  END IF;

  -- Partnership: biz_partnership_file_with_court -> biz_partnership_serve_defendant
  IF NEW.task_key = 'biz_partnership_file_with_court' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_partnership_serve_defendant' AND status = 'locked';
  END IF;

  -- Partnership: biz_partnership_serve_defendant -> biz_partnership_wait_for_answer
  IF NEW.task_key = 'biz_partnership_serve_defendant' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_partnership_wait_for_answer' AND status = 'locked';
  END IF;

  -- Partnership: biz_partnership_wait_for_answer -> biz_partnership_discovery
  IF NEW.task_key = 'biz_partnership_wait_for_answer' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_partnership_discovery' AND status = 'locked';
  END IF;

  -- Partnership: biz_partnership_discovery -> biz_partnership_post_resolution
  IF NEW.task_key = 'biz_partnership_discovery' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_partnership_post_resolution' AND status = 'locked';
  END IF;

  -- ========================================
  -- BUSINESS: EMPLOYMENT chain (9 transitions)
  -- ========================================

  -- Employment: biz_employment_intake -> CONDITIONAL BRANCHING based on case_stage
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

  -- Employment: biz_employment_evidence -> biz_employment_demand_letter
  IF NEW.task_key = 'biz_employment_evidence' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_employment_demand_letter' AND status = 'locked';
  END IF;

  -- Employment: biz_employment_demand_letter -> biz_employment_eeoc (complete OR skip)
  IF NEW.task_key = 'biz_employment_demand_letter' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_employment_eeoc' AND status = 'locked';
  END IF;

  -- Employment: biz_employment_eeoc -> biz_employment_prepare_filing (complete OR skip)
  IF NEW.task_key = 'biz_employment_eeoc' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_employment_prepare_filing' AND status = 'locked';
  END IF;

  -- Employment: biz_employment_prepare_filing -> biz_employment_file_with_court
  IF NEW.task_key = 'biz_employment_prepare_filing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_employment_file_with_court' AND status = 'locked';
  END IF;

  -- Employment: biz_employment_file_with_court -> biz_employment_serve_defendant
  IF NEW.task_key = 'biz_employment_file_with_court' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_employment_serve_defendant' AND status = 'locked';
  END IF;

  -- Employment: biz_employment_serve_defendant -> biz_employment_wait_for_answer
  IF NEW.task_key = 'biz_employment_serve_defendant' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_employment_wait_for_answer' AND status = 'locked';
  END IF;

  -- Employment: biz_employment_wait_for_answer -> biz_employment_discovery
  IF NEW.task_key = 'biz_employment_wait_for_answer' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_employment_discovery' AND status = 'locked';
  END IF;

  -- Employment: biz_employment_discovery -> biz_employment_post_resolution
  IF NEW.task_key = 'biz_employment_discovery' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_employment_post_resolution' AND status = 'locked';
  END IF;

  -- ========================================
  -- BUSINESS: B2B COMMERCIAL chain (9 transitions)
  -- ========================================

  -- B2B: biz_b2b_intake -> CONDITIONAL BRANCHING based on case_stage
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

  -- B2B: biz_b2b_evidence -> biz_b2b_demand_letter
  IF NEW.task_key = 'biz_b2b_evidence' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_b2b_demand_letter' AND status = 'locked';
  END IF;

  -- B2B: biz_b2b_demand_letter -> biz_b2b_negotiation (complete OR skip)
  IF NEW.task_key = 'biz_b2b_demand_letter' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_b2b_negotiation' AND status = 'locked';
  END IF;

  -- B2B: biz_b2b_negotiation -> biz_b2b_prepare_filing (complete OR skip)
  IF NEW.task_key = 'biz_b2b_negotiation' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_b2b_prepare_filing' AND status = 'locked';
  END IF;

  -- B2B: biz_b2b_prepare_filing -> biz_b2b_file_with_court
  IF NEW.task_key = 'biz_b2b_prepare_filing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_b2b_file_with_court' AND status = 'locked';
  END IF;

  -- B2B: biz_b2b_file_with_court -> biz_b2b_serve_defendant
  IF NEW.task_key = 'biz_b2b_file_with_court' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_b2b_serve_defendant' AND status = 'locked';
  END IF;

  -- B2B: biz_b2b_serve_defendant -> biz_b2b_wait_for_answer
  IF NEW.task_key = 'biz_b2b_serve_defendant' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_b2b_wait_for_answer' AND status = 'locked';
  END IF;

  -- B2B: biz_b2b_wait_for_answer -> biz_b2b_discovery
  IF NEW.task_key = 'biz_b2b_wait_for_answer' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_b2b_discovery' AND status = 'locked';
  END IF;

  -- B2B: biz_b2b_discovery -> biz_b2b_post_resolution
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
  -- SMALL CLAIMS chain (sc_* namespaced)
  -- ========================================

  -- SC: welcome -> small_claims_intake
  IF NEW.task_key = 'welcome' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'small_claims_intake' AND status = 'locked';
  END IF;

  -- SC: small_claims_intake -> CONDITIONAL BRANCHING based on case_stage
  IF NEW.task_key = 'small_claims_intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    v_case_stage := COALESCE(NEW.metadata->'guided_answers'->>'case_stage', 'start');

    IF v_case_stage = 'start' THEN
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'sc_evidence_vault' AND status = 'locked';

    ELSIF v_case_stage = 'demand_sent' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('sc_evidence_vault', 'sc_demand_letter')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'prepare_small_claims_filing' AND status = 'locked';

    ELSIF v_case_stage = 'filed' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('sc_evidence_vault', 'sc_demand_letter', 'prepare_small_claims_filing')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'sc_file_with_court' AND status = 'locked';

    ELSIF v_case_stage = 'served' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('sc_evidence_vault', 'sc_demand_letter', 'prepare_small_claims_filing', 'sc_file_with_court', 'sc_serve_defendant')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'sc_prepare_for_hearing' AND status = 'locked';

    ELSIF v_case_stage = 'hearing' THEN
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('sc_evidence_vault', 'sc_demand_letter', 'prepare_small_claims_filing', 'sc_file_with_court', 'sc_serve_defendant', 'sc_prepare_for_hearing')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'sc_hearing_day' AND status = 'locked';

    ELSE
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'sc_evidence_vault' AND status = 'locked';
    END IF;
  END IF;

  -- SC: sc_evidence_vault -> sc_demand_letter
  IF NEW.task_key = 'sc_evidence_vault' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'sc_demand_letter' AND status = 'locked';
  END IF;

  -- SC: sc_demand_letter -> prepare_small_claims_filing (complete OR skip)
  IF NEW.task_key = 'sc_demand_letter' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'prepare_small_claims_filing' AND status = 'locked';
  END IF;

  -- SC: prepare_small_claims_filing -> sc_file_with_court
  IF NEW.task_key = 'prepare_small_claims_filing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'sc_file_with_court' AND status = 'locked';
  END IF;

  -- SC: sc_file_with_court -> sc_serve_defendant
  IF NEW.task_key = 'sc_file_with_court' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'sc_serve_defendant' AND status = 'locked';
  END IF;

  -- SC: sc_serve_defendant -> sc_prepare_for_hearing
  IF NEW.task_key = 'sc_serve_defendant' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'sc_prepare_for_hearing' AND status = 'locked';
  END IF;

  -- SC: sc_prepare_for_hearing -> sc_hearing_day
  IF NEW.task_key = 'sc_prepare_for_hearing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'sc_hearing_day' AND status = 'locked';
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

  IF NEW.task_key = 'divorce_safety_screening' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'divorce_evidence_vault' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'divorce_evidence_vault' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'divorce_prepare_filing' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'divorce_prepare_filing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'divorce_file_with_court' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'divorce_file_with_court' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'divorce_serve_respondent' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'divorce_serve_respondent' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'divorce_waiting_period' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'divorce_waiting_period' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'divorce_temporary_orders' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'divorce_temporary_orders' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'divorce_mediation' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'divorce_mediation' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'divorce_property_division' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'divorce_property_division' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'divorce_final_orders' AND status = 'locked';
  END IF;

  -- ========================================
  -- FAMILY: CUSTODY chain (9 transitions)
  -- ========================================

  IF NEW.task_key = 'welcome' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'custody_intake' AND status = 'locked';
  END IF;

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

  IF NEW.task_key = 'custody_safety_screening' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'custody_evidence_vault' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'custody_evidence_vault' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'custody_prepare_filing' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'custody_prepare_filing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'custody_file_with_court' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'custody_file_with_court' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'custody_serve_respondent' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'custody_serve_respondent' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'custody_temporary_orders' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'custody_temporary_orders' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'custody_mediation' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'custody_mediation' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'custody_final_orders' AND status = 'locked';
  END IF;

  -- ========================================
  -- FAMILY: CHILD SUPPORT chain (7 transitions)
  -- ========================================

  IF NEW.task_key = 'welcome' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'child_support_intake' AND status = 'locked';
  END IF;

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

  IF NEW.task_key = 'child_support_evidence_vault' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'child_support_prepare_filing' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'child_support_prepare_filing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'child_support_file_with_court' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'child_support_file_with_court' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'child_support_serve_respondent' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'child_support_serve_respondent' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'child_support_temporary_orders' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'child_support_temporary_orders' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'child_support_final_orders' AND status = 'locked';
  END IF;

  -- ========================================
  -- FAMILY: VISITATION chain (8 transitions)
  -- ========================================

  IF NEW.task_key = 'welcome' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'visitation_intake' AND status = 'locked';
  END IF;

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

  IF NEW.task_key = 'visitation_safety_screening' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'visitation_evidence_vault' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'visitation_evidence_vault' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'visitation_prepare_filing' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'visitation_prepare_filing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'visitation_file_with_court' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'visitation_file_with_court' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'visitation_serve_respondent' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'visitation_serve_respondent' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'visitation_mediation' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'visitation_mediation' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'visitation_final_orders' AND status = 'locked';
  END IF;

  -- ========================================
  -- FAMILY: SPOUSAL SUPPORT chain (7 transitions)
  -- ========================================

  IF NEW.task_key = 'welcome' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'spousal_support_intake' AND status = 'locked';
  END IF;

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

  IF NEW.task_key = 'spousal_support_evidence_vault' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'spousal_support_prepare_filing' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'spousal_support_prepare_filing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'spousal_support_file_with_court' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'spousal_support_file_with_court' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'spousal_support_serve_respondent' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'spousal_support_serve_respondent' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'spousal_support_temporary_orders' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'spousal_support_temporary_orders' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'spousal_support_final_orders' AND status = 'locked';
  END IF;

  -- ========================================
  -- FAMILY: PROTECTIVE ORDER chain (5 transitions)
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
  -- FAMILY: MODIFICATION chain (8 transitions)
  -- ========================================

  IF NEW.task_key = 'welcome' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'mod_intake' AND status = 'locked';
  END IF;

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

  IF NEW.task_key = 'mod_evidence_vault' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'mod_existing_order_review' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'mod_existing_order_review' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'mod_prepare_filing' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'mod_prepare_filing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'mod_file_with_court' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'mod_file_with_court' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'mod_serve_respondent' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'mod_serve_respondent' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'mod_mediation' AND status = 'locked';
  END IF;

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
