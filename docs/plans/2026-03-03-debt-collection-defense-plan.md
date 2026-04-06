# Debt Collection Defense Module — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Add a defendant-side debt collection defense module so users being sued by creditors/debt buyers can generate a debt validation letter and a formal answer (general denial or specific answer) through a guided wizard flow, with a 10-step educational task chain.

**Architecture:** Follows the Landlord-Tenant module pattern — Supabase migration (table + trigger branches), case schema types, wizard sub-type selection in case creation, prompt builders with Zod schemas (TDD), wizard orchestrator component, StepRunner-based filing steps, educational task chain steps, and step router wiring.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Supabase (PostgreSQL + RLS), Anthropic Claude API, Zod, vitest

**Design doc:** `docs/plans/2026-03-03-debt-collection-defense-design.md`

---

## Task 1: Migration — `debt_defense_details` Table + Task Chain Triggers

**Files:**
- Create: `supabase/migrations/20260303000008_debt_defense_tables.sql`

**What this does:**
1. Creates `debt_defense_details` table with RLS
2. Adds `debt_collection` defendant branch to `seed_case_tasks()` — seeds 10-task defense chain
3. Adds 9 transitions to `unlock_next_task()` for the defense chain

**Migration SQL:**

```sql
-- ============================================
-- Debt Collection Defense Module — Database Migration
-- ============================================
--
-- Adds support for defendant-side debt collection defense:
--   credit_card, medical_bills, personal_loan, auto_loan,
--   payday_loan, debt_buyer, other
--
-- Three changes:
--   1. New `debt_defense_details` table with RLS
--   2. `seed_case_tasks()` — early-return branch for debt_collection defendant
--   3. `unlock_next_task()` — debt defense task chain entries
--
-- Debt defense task chain (10 tasks):
--   welcome -> debt_defense_intake -> evidence_vault
--   -> prepare_debt_validation_letter -> prepare_debt_defense_answer
--   -> debt_file_with_court -> serve_plaintiff
--   -> debt_hearing_prep -> debt_hearing_day -> debt_post_judgment
--
-- Uses distinct task_keys (debt_defense_intake, prepare_debt_validation_letter,
-- prepare_debt_defense_answer, debt_file_with_court, serve_plaintiff,
-- debt_hearing_prep, debt_hearing_day, debt_post_judgment) to avoid
-- conflicts with other chains.
-- ============================================


-- ============================================
-- 1) debt_defense_details table
-- ============================================

CREATE TABLE IF NOT EXISTS public.debt_defense_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  debt_sub_type text NOT NULL CHECK (debt_sub_type IN (
    'credit_card', 'medical_bills', 'personal_loan', 'auto_loan',
    'payday_loan', 'debt_buyer', 'other'
  )),
  creditor_name text,
  debt_buyer_name text,
  original_amount numeric(10,2),
  current_amount_claimed numeric(10,2),
  account_number_last4 text,
  last_payment_date date,
  account_open_date date,
  account_default_date date,
  selected_defenses text[] DEFAULT '{}',
  defense_details jsonb DEFAULT '{}'::jsonb,
  answer_type text CHECK (answer_type IN ('general_denial', 'specific_answer')),
  service_date date,
  answer_deadline date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(case_id)
);

ALTER TABLE public.debt_defense_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own debt defense details"
  ON public.debt_defense_details
  FOR ALL
  USING (
    case_id IN (SELECT id FROM public.cases WHERE user_id = auth.uid())
  );

CREATE INDEX idx_debt_defense_details_case_id ON public.debt_defense_details(case_id);


-- ============================================
-- 2) seed_case_tasks() — add debt_collection defendant branch
-- ============================================

CREATE OR REPLACE FUNCTION public.seed_case_tasks()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- ========================================
  -- Debt collection defendant cases — early return
  -- ========================================
  -- Only seeds defense chain when role = 'defendant'.
  -- Plaintiff debt_collection cases fall through to the civil chain.
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
-- 3) unlock_next_task() — add debt defense chain
-- ============================================

CREATE OR REPLACE FUNCTION public.unlock_next_task()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
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
```

---

## Task 2: Schema Updates + Tests

**Files:**
- Modify: `src/lib/schemas/case.ts`
- Modify: `tests/unit/schemas/case.test.ts`

**Schema changes in `src/lib/schemas/case.ts`:**

Add after `LANDLORD_TENANT_SUB_TYPES`:
```typescript
export const DEBT_SUB_TYPES = [
  'credit_card',
  'medical_bills',
  'personal_loan',
  'auto_loan',
  'payday_loan',
  'debt_buyer',
  'other',
] as const

export type DebtSubType = (typeof DEBT_SUB_TYPES)[number]
```

Add `debt_sub_type` to `createCaseSchema`:
```typescript
export const createCaseSchema = z.object({
  role: z.enum(['plaintiff', 'defendant']),
  county: z.string().optional(),
  court_type: z.enum(['jp', 'county', 'district', 'federal', 'unknown']).optional().default('unknown'),
  dispute_type: z.enum(DISPUTE_TYPES).optional(),
  family_sub_type: z.enum(FAMILY_SUB_TYPES).optional(),
  small_claims_sub_type: z.enum(SMALL_CLAIMS_SUB_TYPES).optional(),
  landlord_tenant_sub_type: z.enum(LANDLORD_TENANT_SUB_TYPES).optional(),
  debt_sub_type: z.enum(DEBT_SUB_TYPES).optional(),
})
```

**Test additions in `tests/unit/schemas/case.test.ts`:**

Add tests for debt_sub_type:
```typescript
it('accepts debt_sub_type for debt_collection cases', () => {
  const result = createCaseSchema.safeParse({
    role: 'defendant',
    dispute_type: 'debt_collection',
    debt_sub_type: 'credit_card',
  })
  expect(result.success).toBe(true)
})

it('rejects invalid debt_sub_type', () => {
  const result = createCaseSchema.safeParse({
    role: 'defendant',
    debt_sub_type: 'invalid_type',
  })
  expect(result.success).toBe(false)
})
```

---

## Task 3: Case Creation Wizard — Side Selection + Sub-Type Steps

**Files:**
- Create: `src/components/cases/wizard/debt-side-step.tsx`
- Create: `src/components/cases/wizard/debt-sub-type-step.tsx`
- Modify: `src/components/cases/wizard/dispute-type-step.tsx` — rename label
- Modify: `src/components/cases/new-case-dialog.tsx` — add debt flow

**`debt-side-step.tsx`** — Two-option step asking if user is plaintiff or defendant:
- "I'm being sued for a debt" → defendant path (debt defense module)
- "Someone owes me money" → plaintiff path (existing civil flow)
- Pattern: Same as `OptionCard` used in `dispute-type-step.tsx`
- Amber info box: "If you've received court papers about a debt, choose 'I'm being sued.' We'll help you respond."

**`debt-sub-type-step.tsx`** — 7 sub-type cards with icons:
- `credit_card` (CreditCard icon) — "Credit Card Debt"
- `medical_bills` (Stethoscope icon) — "Medical Bills"
- `personal_loan` (Wallet icon) — "Personal Loan"
- `auto_loan` (Car icon) — "Auto Loan / Deficiency"
- `payday_loan` (Banknote icon) — "Payday / Title Loan"
- `debt_buyer` (FileStack icon) — "Debt Buyer / Junk Debt"
- `other` (HelpCircle icon) — "Other Debt"
- Info box: "Debt buyers purchase old debts for pennies on the dollar, then sue to collect the full amount. They often lack proper documentation."
- Pattern: Same as `landlord-tenant-sub-type-step.tsx`

**`dispute-type-step.tsx` change:**
```typescript
// Change:
{ value: 'debt_collection', label: 'Money owed to me', description: 'Debt or unpaid contract' },
// To:
{ value: 'debt_collection', label: 'Debt dispute', description: 'Debt collection, credit card lawsuit, or money owed' },
```

**`new-case-dialog.tsx` changes:**

Add to imports:
```typescript
import { DebtSideStep, type DebtSide } from './wizard/debt-side-step'
import { DebtSubTypeStep, type DebtSubType } from './wizard/debt-sub-type-step'
```

Add to `WizardState`:
```typescript
debtSide: DebtSide | ''
debtSubType: DebtSubType | ''
```

Add to `initialState`:
```typescript
debtSide: '',
debtSubType: '',
```

Add `WizardAction` variants:
```typescript
| { type: 'SET_DEBT_SIDE'; debtSide: DebtSide }
| { type: 'SET_DEBT_SUB_TYPE'; debtSubType: DebtSubType }
```

Add reducer cases:
```typescript
case 'SET_DEBT_SIDE':
  return { ...state, debtSide: action.debtSide, step: state.step + 1 }
case 'SET_DEBT_SUB_TYPE':
  return { ...state, debtSubType: action.debtSubType, step: state.step + 1 }
```

Update `getTotalSteps`:
```typescript
if (disputeType === 'debt_collection') {
  if (debtSide === 'plaintiff') return 5 // same as civil
  return 6 // defendant: role, dispute, side, subtype, amount, recommendation
}
```

Add step rendering in JSX:
- Step 3 for `isDebtCollection`: `<DebtSideStep>`
- Step 4 for `isDebtDefendant`: `<DebtSubTypeStep>`
- Step 4 for `isDebtPlaintiff`: `<AmountStep>` (existing civil flow)
- Step 5 for `isDebtDefendant`: `<AmountStep>`
- Step 5 for `isDebtPlaintiff`: `<CircumstancesStep>`
- Step 6 for `isDebtDefendant`: `<RecommendationStep>`
- Step 5/6 for `isDebtPlaintiff`: standard civil recommendation

Update `handleAccept` to pass `debt_sub_type` in request body.

---

## Task 4: API Route — Insert Debt Defense Details

**Files:**
- Modify: `src/app/api/cases/route.ts`

Add after the landlord-tenant details block (line ~93):

```typescript
// Insert debt defense details if this is a debt collection defendant case
if (debt_sub_type) {
  const { error: debtError } = await supabase!
    .from('debt_defense_details')
    .insert({
      case_id: newCase.id,
      debt_sub_type,
    })

  if (debtError) {
    return NextResponse.json(
      { error: 'Case created but failed to save debt defense details', details: debtError.message },
      { status: 500 }
    )
  }
}
```

Also destructure `debt_sub_type` from `parsed.data` on line 20.

---

## Task 5: Debt Validation Letter Prompts (TDD)

**Files:**
- Create: `src/lib/rules/debt-validation-letter-prompts.ts`
- Create: `tests/unit/rules/debt-validation-letter-prompts.test.ts`

**Pattern:** `src/lib/rules/landlord-tenant-demand-letter-prompts.ts`

**Schema:**
```typescript
import { z } from 'zod'
import { partySchema } from '../schemas/filing'

export const debtValidationLetterFactsSchema = z.object({
  your_info: partySchema,
  creditor_name: z.string().min(1),
  debt_buyer_name: z.string().optional(),
  account_last4: z.string().optional(),
  original_amount: z.number().positive(),
  current_amount_claimed: z.number().positive(),
  service_date: z.string().optional(),
  county: z.string().optional(),
})
```

**Prompt builder:** `buildDebtValidationLetterPrompt(facts)` returns `{ system, user }`
- System: "You are a legal document formatting assistant. Generate a debt validation letter under the Fair Debt Collection Practices Act (FDCPA) 15 U.S.C. § 1692g..."
- Demands: proof of debt ownership (chain of title), original signed agreement, complete payment history, license to collect in Texas, verification within SOL
- 30-day validation period notice
- DRAFT disclaimer
- `---ANNOTATIONS---` section

**Tests (~8):**
1. Schema accepts valid facts
2. Schema rejects missing creditor_name
3. Schema rejects zero amount
4. `buildDebtValidationLetterPrompt` returns system and user strings
5. System prompt includes "FDCPA"
6. System prompt includes "15 U.S.C. § 1692g"
7. System prompt includes "DRAFT"
8. User prompt includes creditor name and amounts

---

## Task 6: Debt Defense Answer Prompts (TDD)

**Files:**
- Create: `src/lib/rules/debt-defense-prompts.ts`
- Create: `tests/unit/rules/debt-defense-prompts.test.ts`

**Schema:**
```typescript
import { z } from 'zod'
import { partySchema } from '../schemas/filing'

export const DEFENSE_KEYS = [
  'statute_of_limitations',
  'lack_of_standing',
  'insufficient_evidence',
  'wrong_amount',
  'identity_theft',
  'fdcpa_violations',
  'improper_service',
  'general_denial',
] as const

export const debtDefenseFactsSchema = z.object({
  your_info: partySchema,
  opposing_parties: z.array(partySchema).min(1),
  court_type: z.enum(['jp', 'county', 'district']),
  county: z.string().min(1),
  cause_number: z.string().optional(),
  debt_sub_type: z.enum([
    'credit_card', 'medical_bills', 'personal_loan', 'auto_loan',
    'payday_loan', 'debt_buyer', 'other',
  ]),
  answer_type: z.enum(['general_denial', 'specific_answer']),
  selected_defenses: z.array(z.enum(DEFENSE_KEYS)).min(1),
  defense_details: z.record(z.unknown()).optional(),
  original_amount: z.number().positive(),
  current_amount_claimed: z.number().positive(),
  description: z.string().min(10),
})
```

**Prompt builder:** `buildDebtDefensePrompt(facts)` returns `{ system, user }`
- For `general_denial`: Standard general denial format with affirmative defenses
- For `specific_answer`: Paragraph-by-paragraph with counterclaim if FDCPA violations
- Legal citations: TRCP 92, 93, 94; FDCPA; Texas SOL § 16.004
- Court label: JP → "Justice Court", county → "County Court", district → "District Court"

**Tests (~14):**
1. Schema accepts valid general denial facts
2. Schema accepts valid specific answer facts
3. Schema rejects missing defenses
4. Schema rejects empty selected_defenses
5. Schema rejects federal court_type
6. `buildDebtDefensePrompt` returns system/user for general denial
7. `buildDebtDefensePrompt` returns system/user for specific answer
8. System includes "DRAFT" for general denial
9. System includes "TRCP" for general denial
10. System includes affirmative defenses section
11. System includes counterclaim instructions when fdcpa_violations selected (specific answer)
12. System omits counterclaim when fdcpa_violations not selected
13. Court label correct for JP
14. Court label correct for district

---

## Task 7: Wire Generate-Filing Route

**Files:**
- Modify: `src/app/api/cases/[id]/generate-filing/route.ts`

Add imports at top:
```typescript
import {
  debtValidationLetterFactsSchema,
  buildDebtValidationLetterPrompt,
} from '@/lib/rules/debt-validation-letter-prompts'
import {
  debtDefenseFactsSchema,
  buildDebtDefensePrompt,
} from '@/lib/rules/debt-defense-prompts'
```

Add to `MOTION_REGISTRY`:
```typescript
// Debt defense
debt_validation_letter: {
  schema: debtValidationLetterFactsSchema,
  buildPrompt: buildDebtValidationLetterPrompt as unknown as RegistryEntry['buildPrompt'],
},
debt_defense_general_denial: {
  schema: debtDefenseFactsSchema,
  buildPrompt: buildDebtDefensePrompt as unknown as RegistryEntry['buildPrompt'],
},
debt_defense_specific_answer: {
  schema: debtDefenseFactsSchema,
  buildPrompt: buildDebtDefensePrompt as unknown as RegistryEntry['buildPrompt'],
},
```

---

## Task 8: DebtDefenseWizard Step Components (8 sub-steps)

**Files:**
- Create: `src/components/step/debt-defense-wizard-steps/debt-preflight.tsx`
- Create: `src/components/step/debt-defense-wizard-steps/debt-info-step.tsx`
- Create: `src/components/step/debt-defense-wizard-steps/debt-dates-step.tsx`
- Create: `src/components/step/debt-defense-wizard-steps/defense-selection-step.tsx`
- Create: `src/components/step/debt-defense-wizard-steps/answer-type-step.tsx`
- Create: `src/components/step/debt-defense-wizard-steps/debt-parties-step.tsx`
- Create: `src/components/step/debt-defense-wizard-steps/debt-venue-step.tsx`
- Create: `src/components/step/debt-defense-wizard-steps/debt-review-step.tsx`

**Pattern:** `src/components/step/landlord-tenant-wizard-steps/` — pure form components, no StepRunner. State managed by parent wizard.

### `debt-preflight.tsx`
- Educational intro: "You've been sued for a debt. Here's what we'll help you do."
- 3 ExpandableSections: "Your rights under the FDCPA", "What is a debt validation letter?", "General Denial vs. Specific Answer"
- Checklist of items to gather: court papers, any correspondence from creditor, payment records, account statements
- Pattern: `lt-preflight.tsx`

### `debt-info-step.tsx`
- Props: creditor_name, debt_buyer_name, original_amount, current_amount_claimed, account_last4, debt_sub_type
- Fields: Input for creditor name, optional Input for debt buyer name (shown when "Is the plaintiff different from the original creditor?" checkbox is checked), two currency Inputs for amounts, Input for last 4 of account number
- Pattern: `lt-parties-step.tsx` for form layout

### `debt-dates-step.tsx`
- Props: account_open_date, account_default_date, last_payment_date, service_date, answer_deadline
- 5 date Inputs
- **SOL Calculator**: Uses `last_payment_date` to compute days since. If > 1460 days (4 years): green callout "Statute of limitations has likely expired." If < 1460: amber "Statute of limitations is likely still active." If no date: neutral "Enter your last payment date to check."
- Pattern: Date inputs with `<Label>` and `<HelpTooltip>`

### `defense-selection-step.tsx`
- Props: selected_defenses (string[]), defense_details (Record<string, unknown>), onDefensesChange, onDefenseDetailsChange
- 8 defense cards, each expandable on selection:
  - `statute_of_limitations` — Auto-checks SOL from dates step data
  - `lack_of_standing` — "Is the plaintiff the original creditor?" radio, "Do they have chain of title docs?" radio
  - `insufficient_evidence` — "Has plaintiff provided original signed agreement?" radio
  - `wrong_amount` — "What amount do you believe is correct?" number input, "Have you made any payments?" radio
  - `identity_theft` — "Filed police report?" checkbox, "Filed FTC identity theft report?" checkbox
  - `fdcpa_violations` — Checklist: called before 8am/after 9pm, threats, contacted at work after told not to, failed to send validation notice, continued collecting during dispute
  - `improper_service` — "How were you served?" select, "Were you personally handed documents?" radio
  - `general_denial` — No follow-up, always available as baseline
- Each card: icon, title, 1-line description, indigo highlight when selected
- Pattern: Similar to checkboxes with expandable detail sections

### `answer-type-step.tsx`
- Props: answer_type, onAnswerTypeChange
- Two side-by-side cards:
  - "General Denial with Affirmative Defenses" — "(Recommended for most cases)" tag. "Denies all allegations. Lists your defenses separately. Simpler to prepare."
  - "Specific Answer" — "Responds to each allegation individually. More detailed. Can include counterclaims."
- Pattern: Two `OptionCard`-style buttons

### `debt-parties-step.tsx`
- Props: your_info, plaintiff_info, attorney_info, onChange callbacks
- 3 sections: Your info (name, address), Plaintiff info (name from summons), Attorney info (name, address, bar number)
- Pattern: `lt-parties-step.tsx`

### `debt-venue-step.tsx`
- Props: county, court_type, cause_number, onFieldChange
- County input (auto-populated from case), Court type display (read-only), Cause number input (optional)
- Pattern: `lt-venue-step.tsx`

### `debt-review-step.tsx`
- Props: all wizard state
- Read-only summary of everything entered: debt info, dates, SOL status, selected defenses, answer type, parties, venue
- Organized in labeled sections with warm-bg cards
- Pattern: `lt-review-step.tsx`

---

## Task 9: DebtDefenseWizard Orchestrator

**Files:**
- Create: `src/components/step/debt-defense-wizard.tsx`

**Pattern:** `src/components/step/landlord-tenant-wizard.tsx` (942 lines)

**Props:**
```typescript
interface DebtDefenseWizardProps {
  caseId: string
  taskId: string
  existingMetadata?: Record<string, unknown> | null
  debtDefenseDetails: {
    debt_sub_type: string
    creditor_name?: string
    debt_buyer_name?: string
    original_amount?: number
    current_amount_claimed?: number
    account_number_last4?: string
    last_payment_date?: string
    account_open_date?: string
    account_default_date?: string
    selected_defenses?: string[]
    defense_details?: Record<string, unknown>
    answer_type?: string
    service_date?: string
    answer_deadline?: string
  } | null
  caseData: {
    county: string | null
    court_type: string
  }
}
```

**Key behaviors:**
- 8 wizard steps matching the sub-step components from Task 8
- `buildFacts()` — assembles `debtDefenseFactsSchema`-compatible object
- `generateDraft()` — POST to `/api/cases/${caseId}/generate-filing` with `document_type: answer_type === 'general_denial' ? 'debt_defense_general_denial' : 'debt_defense_specific_answer'`
- `buildMetadata()` — all wizard state for persistence
- Draft phase: `<AnnotatedDraftViewer>` with generated answer
- `handleSave` — PATCH task in_progress with metadata
- `handleComplete` — generate draft, enter draft phase
- `handleFinalConfirm` — PATCH task completed
- State hydration from `existingMetadata`
- `canAdvance` validation per step via `useMemo`
- Uses `WizardShell` component

---

## Task 10: Task Chain Steps — Intake + Filing Steps (StepRunner-based)

**Files:**
- Create: `src/components/step/debt-defense/debt-defense-intake-step.tsx`
- Create: `src/components/step/debt-defense/debt-validation-letter-step.tsx`

### `debt-defense-intake-step.tsx`
**Pattern:** `src/components/step/landlord-tenant/lt-intake-step.tsx`
- `<StepRunner>` wrapper
- Form fields: creditor name, debt buyer name (optional), original amount, current amount claimed, account last 4, last payment date, account open date, account default date, service date, answer deadline, description textarea
- SOL calculator display
- Review phase: formatted summary of entered data
- `onConfirm`: PATCH task metadata → PATCH task completed → Supabase update `debt_defense_details` row with form data

### `debt-validation-letter-step.tsx`
**Pattern:** `src/components/step/landlord-tenant/lt-demand-letter-step.tsx`
- `<StepRunner>` wrapper with `onBeforeReview`
- Form fields pre-populated from `debt_defense_details`: your info, creditor name, amounts, account last 4
- `onBeforeReview`: POST `/api/cases/${caseId}/generate-filing` with `document_type: 'debt_validation_letter'`
- Review phase: `<AnnotatedDraftViewer>` showing generated validation letter
- `onConfirm`: save metadata + complete task

---

## Task 11: Educational Task Chain Steps (5 components)

**Files:**
- Create: `src/components/step/debt-defense/debt-file-with-court-step.tsx`
- Create: `src/components/step/debt-defense/serve-plaintiff-step.tsx`
- Create: `src/components/step/debt-defense/debt-hearing-prep-step.tsx`
- Create: `src/components/step/debt-defense/debt-hearing-day-step.tsx`
- Create: `src/components/step/debt-defense/debt-post-judgment-step.tsx`

**Pattern:** `src/components/step/landlord-tenant/serve-other-party-step.tsx` — educational steps with `<StepRunner skipReview>` and `<ExpandableSection>` content.

### `debt-file-with-court-step.tsx`
- ExpandableSections: "Where to file your answer", "Filing fees", "E-filing options", "Filing deadline" (emphasize: typically 14 days from service for JP, 20 days for county/district under TRCP)
- Context card with deadline warning

### `serve-plaintiff-step.tsx`
- ExpandableSections: "How to serve your answer", "Serving the plaintiff's attorney" (usually by mail or e-service since they have counsel), "Certificate of service" (already included in generated answer)
- Different from LT's `serve-other-party-step.tsx` — debt cases typically serve on attorney, not individual

### `debt-hearing-prep-step.tsx`
- ExpandableSections: "What to bring to court" (validation letter + any response, payment records, creditor correspondence, account statements), "How to present your defenses" (SOL, standing, evidence), "What to expect from plaintiff's attorney"
- Pattern: `lt-hearing-prep-step.tsx`

### `debt-hearing-day-step.tsx`
- ExpandableSections: "Day-of checklist", "Courtroom etiquette", "Common creditor attorney tactics" (request for continuance, settlement offers, producing documents at hearing), "How to respond"
- Pattern: `lt-hearing-day-step.tsx`

### `debt-post-judgment-step.tsx`
- ExpandableSections: "If the case is dismissed" (judgment for defendant), "If you lose" (judgment for plaintiff — payment plan options, appeal rights within 30 days, exemptions from garnishment under Tex. Prop. Code § 42.001), "Your appeal rights" (30 days to appeal, bond requirements), "Wage garnishment exemptions" (Texas generally prohibits wage garnishment for consumer debts)
- Pattern: `post-judgment-step.tsx`

All educational steps: `onConfirm` patches task `in_progress` then `completed`. No form data.

---

## Task 12: Wire Step Router

**Files:**
- Modify: `src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx`

Add imports:
```typescript
import { DebtDefenseIntakeStep } from '@/components/step/debt-defense/debt-defense-intake-step'
import { DebtValidationLetterStep } from '@/components/step/debt-defense/debt-validation-letter-step'
import { DebtDefenseWizard } from '@/components/step/debt-defense-wizard'
import { DebtFileWithCourtStep } from '@/components/step/debt-defense/debt-file-with-court-step'
import { ServePlaintiffStep } from '@/components/step/debt-defense/serve-plaintiff-step'
import { DebtHearingPrepStep } from '@/components/step/debt-defense/debt-hearing-prep-step'
import { DebtHearingDayStep } from '@/components/step/debt-defense/debt-hearing-day-step'
import { DebtPostJudgmentStep } from '@/components/step/debt-defense/debt-post-judgment-step'
```

Add switch cases before the `default`:
```typescript
// Debt defense task chain steps
case 'debt_defense_intake':
  return (
    <DebtDefenseIntakeStep
      caseId={id}
      taskId={taskId}
      existingMetadata={task.metadata}
    />
  )
case 'prepare_debt_validation_letter': {
  const { data: caseRow } = await supabase
    .from('cases').select('county').eq('id', id).single()
  const { data: debtDetails } = await supabase
    .from('debt_defense_details').select('*').eq('case_id', id).maybeSingle()
  return (
    <DebtValidationLetterStep
      caseId={id}
      taskId={taskId}
      existingMetadata={task.metadata}
      debtDefenseDetails={debtDetails}
      caseData={{ county: caseRow?.county ?? null }}
    />
  )
}
case 'prepare_debt_defense_answer': {
  const { data: caseRow } = await supabase
    .from('cases').select('county, court_type').eq('id', id).single()
  const { data: debtDetails } = await supabase
    .from('debt_defense_details').select('*').eq('case_id', id).maybeSingle()
  return (
    <DebtDefenseWizard
      caseId={id}
      taskId={taskId}
      existingMetadata={task.metadata}
      debtDefenseDetails={debtDetails}
      caseData={{ county: caseRow?.county ?? null, court_type: caseRow?.court_type ?? 'jp' }}
    />
  )
}
case 'debt_file_with_court':
  return <DebtFileWithCourtStep caseId={id} taskId={taskId} />
case 'serve_plaintiff':
  return <ServePlaintiffStep caseId={id} taskId={taskId} />
case 'debt_hearing_prep':
  return <DebtHearingPrepStep caseId={id} taskId={taskId} />
case 'debt_hearing_day':
  return <DebtHearingDayStep caseId={id} taskId={taskId} />
case 'debt_post_judgment':
  return <DebtPostJudgmentStep caseId={id} taskId={taskId} />
```

---

## Task 13: Build & Test Verification

1. Run `npx vitest run` — all existing tests pass + new tests pass
2. Run `npx next build` — no type errors
3. Verify all 8 debt defense switch cases render (not "Coming soon")

---

## File Summary

| File | Action | Task |
|------|--------|------|
| `supabase/migrations/20260303000008_debt_defense_tables.sql` | Create | T1 |
| `src/lib/schemas/case.ts` | Modify | T2 |
| `tests/unit/schemas/case.test.ts` | Modify | T2 |
| `src/components/cases/wizard/debt-side-step.tsx` | Create | T3 |
| `src/components/cases/wizard/debt-sub-type-step.tsx` | Create | T3 |
| `src/components/cases/wizard/dispute-type-step.tsx` | Modify | T3 |
| `src/components/cases/new-case-dialog.tsx` | Modify | T3 |
| `src/app/api/cases/route.ts` | Modify | T4 |
| `src/lib/rules/debt-validation-letter-prompts.ts` | Create | T5 |
| `tests/unit/rules/debt-validation-letter-prompts.test.ts` | Create | T5 |
| `src/lib/rules/debt-defense-prompts.ts` | Create | T6 |
| `tests/unit/rules/debt-defense-prompts.test.ts` | Create | T6 |
| `src/app/api/cases/[id]/generate-filing/route.ts` | Modify | T7 |
| `src/components/step/debt-defense-wizard-steps/*.tsx` (8 files) | Create | T8 |
| `src/components/step/debt-defense-wizard.tsx` | Create | T9 |
| `src/components/step/debt-defense/debt-defense-intake-step.tsx` | Create | T10 |
| `src/components/step/debt-defense/debt-validation-letter-step.tsx` | Create | T10 |
| `src/components/step/debt-defense/debt-file-with-court-step.tsx` | Create | T11 |
| `src/components/step/debt-defense/serve-plaintiff-step.tsx` | Create | T11 |
| `src/components/step/debt-defense/debt-hearing-prep-step.tsx` | Create | T11 |
| `src/components/step/debt-defense/debt-hearing-day-step.tsx` | Create | T11 |
| `src/components/step/debt-defense/debt-post-judgment-step.tsx` | Create | T11 |
| `src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx` | Modify | T12 |

## Task Dependencies

```
T1 (migration) ─────────────────────────────────────────────┐
T2 (schema) ──────┬── T3 (wizard UI) ── T4 (API route) ────┤
                  │                                         │
T5 (validation prompts, TDD) ──┬── T7 (wire route) ────────┤
T6 (defense prompts, TDD) ─────┘                           │
                                                            │
T8 (wizard sub-steps) ── T9 (wizard orchestrator) ──────────┤
                                                            │
T10 (intake + filing steps) ────────────────────────────────┤
T11 (educational steps) ────────────────────────────────────┤
                                                            │
T12 (wire step router) ← depends on T9, T10, T11 ──────────┤
                                                            │
T13 (build & test) ← depends on all ───────────────────────┘
```

**Parallelizable groups:**
- T1, T2 can run together
- T5, T6 can run in parallel (both TDD, independent schemas)
- T8, T10, T11 can run in parallel (independent component sets)

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Plaintiff selects debt_collection | Existing civil flow, no new components |
| SOL unclear (no last payment date) | Amber callout "Enter your last payment date to check" |
| No defenses selected | Validation prevents advancing past defense step |
| FDCPA violations selected + specific_answer | Counterclaim section auto-included |
| User resumes partially completed wizard | State hydrates from `existingMetadata` |
| Debt buyer vs original creditor | Both names captured; prompts reference chain of title |
