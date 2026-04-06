-- ============================================
-- Personal Injury Module — Database Migration
-- ============================================
--
-- Adds support for personal injury cases:
--   auto_accident, pedestrian_cyclist, rideshare, uninsured_motorist,
--   slip_and_fall, dog_bite, product_liability, other
--
-- Three changes:
--   1. New `personal_injury_details` table with RLS
--   2. `seed_case_tasks()` — early-return branch for personal_injury
--   3. `unlock_next_task()` — personal injury task chain entries
--
-- Personal injury task chain (12 tasks):
--   welcome -> pi_intake -> pi_medical_records -> evidence_vault
--   -> pi_insurance_communication -> prepare_pi_demand_letter
--   -> pi_settlement_negotiation -> prepare_pi_petition
--   -> pi_file_with_court -> pi_serve_defendant
--   -> pi_trial_prep -> pi_post_resolution
--
-- Uses distinct task_keys (pi_intake, pi_medical_records,
-- pi_insurance_communication, prepare_pi_demand_letter,
-- pi_settlement_negotiation, prepare_pi_petition,
-- pi_file_with_court, pi_serve_defendant, pi_trial_prep,
-- pi_post_resolution) to avoid conflicts with other chains.
-- ============================================


-- ============================================
-- 1) personal_injury_details table
-- ============================================

CREATE TABLE IF NOT EXISTS public.personal_injury_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  pi_sub_type text NOT NULL CHECK (pi_sub_type IN (
    'auto_accident', 'pedestrian_cyclist', 'rideshare', 'uninsured_motorist',
    'slip_and_fall', 'dog_bite', 'product_liability', 'other'
  )),
  incident_date date,
  incident_location text,
  incident_description text,
  police_report_number text,
  police_report_filed boolean DEFAULT false,
  other_driver_name text,
  other_driver_insurance text,
  other_driver_policy_number text,
  your_insurance_carrier text,
  your_policy_number text,
  injury_description text,
  injury_severity text CHECK (injury_severity IS NULL OR injury_severity IN ('minor', 'moderate', 'severe')),
  medical_providers jsonb DEFAULT '[]',
  medical_expenses numeric(10,2),
  lost_wages numeric(10,2),
  property_damage_amount numeric(10,2),
  pain_suffering_multiplier numeric(3,1),
  total_demand_amount numeric(10,2),
  demand_sent_date date,
  settlement_status text CHECK (settlement_status IS NULL OR settlement_status IN (
    'not_started', 'demand_sent', 'negotiating', 'settled', 'filing'
  )),
  premises_owner text,
  product_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(case_id)
);

ALTER TABLE public.personal_injury_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own personal injury details"
  ON public.personal_injury_details
  FOR ALL
  USING (
    case_id IN (SELECT id FROM public.cases WHERE user_id = auth.uid())
  );

CREATE INDEX idx_personal_injury_details_case_id ON public.personal_injury_details(case_id);


-- ============================================
-- 2) seed_case_tasks() — add personal_injury branch
-- ============================================
-- Replaces the function from migration 20260303000008.
-- Personal injury cases get their own task chain.
-- All other chains (debt_collection defendant, landlord-tenant,
-- small claims, family, civil) unchanged.
-- ============================================

CREATE OR REPLACE FUNCTION public.seed_case_tasks()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
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
  -- Landlord-tenant cases — early return
  -- ========================================
  IF NEW.dispute_type = 'landlord_tenant' THEN
    INSERT INTO public.tasks (case_id, task_key, title, status, unlocked_at)
    VALUES (NEW.id, 'welcome', 'Welcome — Get Started', 'todo', now());

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'landlord_tenant_intake', 'Tell Us About Your Situation', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'evidence_vault', 'Organize Your Evidence', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'prepare_lt_demand_letter', 'Draft a Demand Letter', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'prepare_landlord_tenant_filing', 'Prepare Your Court Filing', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'file_with_court', 'File With the Court', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'serve_other_party', 'Serve the Other Party', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'prepare_for_hearing', 'Prepare for Your Hearing', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'hearing_day', 'Hearing Day', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'post_judgment', 'After the Ruling', 'locked');

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
  -- Family law cases — early return
  -- ========================================
  IF NEW.dispute_type = 'family' THEN
    INSERT INTO public.tasks (case_id, task_key, title, status, unlocked_at)
    VALUES (NEW.id, 'welcome', 'Welcome — Get Started', 'todo', now());

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'family_intake', 'Tell Us About Your Family Matter', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'safety_screening', 'Safety Check', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'evidence_vault', 'Organize Your Evidence', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'prepare_family_filing', 'Prepare Your Family Court Filing', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'file_with_court', 'File With the Court', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'upload_return_of_service', 'Upload Return of Service', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'confirm_service_facts', 'Confirm Service Details', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'waiting_period', 'Mandatory Waiting Period', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'temporary_orders', 'Request Temporary Orders', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'mediation', 'Attend Mediation', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'final_orders', 'Final Orders', 'locked');

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
  -- Civil cases — existing chain (unchanged)
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


-- ============================================
-- 3) unlock_next_task() — add personal injury chain
-- ============================================
-- Replaces the function from migration 20260303000008.
-- Personal injury chain entries are added before the debt defense
-- chain entries. No conflicts because PI uses distinct task_keys
-- (pi_intake, pi_medical_records, pi_insurance_communication,
-- prepare_pi_demand_letter, pi_settlement_negotiation,
-- prepare_pi_petition, pi_file_with_court, pi_serve_defendant,
-- pi_trial_prep, pi_post_resolution).
-- ============================================

CREATE OR REPLACE FUNCTION public.unlock_next_task()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- ========================================
  -- Personal injury chain (11 transitions)
  -- ========================================

  -- PI: welcome -> pi_intake
  IF NEW.task_key = 'welcome' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_intake' AND status = 'locked';
  END IF;

  -- PI: pi_intake -> pi_medical_records
  IF NEW.task_key = 'pi_intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_medical_records' AND status = 'locked';
  END IF;

  -- PI: pi_medical_records -> evidence_vault
  IF NEW.task_key = 'pi_medical_records' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'evidence_vault' AND status = 'locked';
  END IF;

  -- PI: evidence_vault -> pi_insurance_communication
  IF NEW.task_key = 'evidence_vault' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_insurance_communication' AND status = 'locked';
  END IF;

  -- PI: pi_insurance_communication -> prepare_pi_demand_letter
  IF NEW.task_key = 'pi_insurance_communication' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'prepare_pi_demand_letter' AND status = 'locked';
  END IF;

  -- PI: prepare_pi_demand_letter -> pi_settlement_negotiation
  IF NEW.task_key = 'prepare_pi_demand_letter' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_settlement_negotiation' AND status = 'locked';
  END IF;

  -- PI: pi_settlement_negotiation -> prepare_pi_petition
  IF NEW.task_key = 'pi_settlement_negotiation' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'prepare_pi_petition' AND status = 'locked';
  END IF;

  -- PI: prepare_pi_petition -> pi_file_with_court
  IF NEW.task_key = 'prepare_pi_petition' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_file_with_court' AND status = 'locked';
  END IF;

  -- PI: pi_file_with_court -> pi_serve_defendant
  IF NEW.task_key = 'pi_file_with_court' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_serve_defendant' AND status = 'locked';
  END IF;

  -- PI: pi_serve_defendant -> pi_trial_prep
  IF NEW.task_key = 'pi_serve_defendant' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_trial_prep' AND status = 'locked';
  END IF;

  -- PI: pi_trial_prep -> pi_post_resolution
  IF NEW.task_key = 'pi_trial_prep' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_post_resolution' AND status = 'locked';
  END IF;

  -- ========================================
  -- Debt defense chain (9 transitions)
  -- ========================================

  -- Debt: welcome -> debt_defense_intake
  IF NEW.task_key = 'welcome' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'debt_defense_intake' AND status = 'locked';
  END IF;

  -- Debt: debt_defense_intake -> evidence_vault
  IF NEW.task_key = 'debt_defense_intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'evidence_vault' AND status = 'locked';
  END IF;

  -- Debt: evidence_vault -> prepare_debt_validation_letter
  IF NEW.task_key = 'evidence_vault' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'prepare_debt_validation_letter' AND status = 'locked';
  END IF;

  -- Debt: prepare_debt_validation_letter -> prepare_debt_defense_answer
  IF NEW.task_key = 'prepare_debt_validation_letter' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'prepare_debt_defense_answer' AND status = 'locked';
  END IF;

  -- Debt: prepare_debt_defense_answer -> debt_file_with_court
  IF NEW.task_key = 'prepare_debt_defense_answer' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'debt_file_with_court' AND status = 'locked';
  END IF;

  -- Debt: debt_file_with_court -> serve_plaintiff
  IF NEW.task_key = 'debt_file_with_court' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'serve_plaintiff' AND status = 'locked';
  END IF;

  -- Debt: serve_plaintiff -> debt_hearing_prep
  IF NEW.task_key = 'serve_plaintiff' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'debt_hearing_prep' AND status = 'locked';
  END IF;

  -- Debt: debt_hearing_prep -> debt_hearing_day
  IF NEW.task_key = 'debt_hearing_prep' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'debt_hearing_day' AND status = 'locked';
  END IF;

  -- Debt: debt_hearing_day -> debt_post_judgment
  IF NEW.task_key = 'debt_hearing_day' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'debt_post_judgment' AND status = 'locked';
  END IF;

  -- ========================================
  -- Landlord-tenant chain (9 transitions)
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

  IF NEW.task_key = 'prepare_lt_demand_letter' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'prepare_landlord_tenant_filing' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'prepare_landlord_tenant_filing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'file_with_court' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'file_with_court' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'serve_other_party' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'serve_other_party' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'prepare_for_hearing' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'prepare_for_hearing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'hearing_day' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'hearing_day' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'post_judgment' AND status = 'locked';
  END IF;

  -- ========================================
  -- Small claims chain
  -- ========================================

  IF NEW.task_key = 'welcome' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'small_claims_intake' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'small_claims_intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'evidence_vault' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'evidence_vault' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'prepare_demand_letter' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'prepare_demand_letter' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
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
  -- Family chain
  -- ========================================

  IF NEW.task_key = 'welcome' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'family_intake' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'family_intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'safety_screening' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'safety_screening' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'evidence_vault' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'evidence_vault' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'prepare_family_filing' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'prepare_family_filing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'file_with_court' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'confirm_service_facts' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'waiting_period' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'waiting_period' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'temporary_orders' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'temporary_orders' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'mediation' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'mediation' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'final_orders' AND status = 'locked';
  END IF;

  -- ========================================
  -- Civil chain (unchanged)
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

  IF NEW.task_key = 'preservation_letter' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
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
