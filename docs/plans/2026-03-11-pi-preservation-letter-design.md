# PI Litigation Hold / Evidence Preservation Letter

## Problem

The personal injury workflow has no step for sending a litigation hold / evidence preservation letter. This letter tells the opposing party (insurance company, at-fault party) to preserve relevant evidence (dashcam footage, surveillance video, medical records, vehicle damage photos, etc.). The civil case chain already has this feature, but PI cases skip it entirely.

## Solution

Add a `preservation_letter` task to the PI workflow, positioned after Evidence Vault and before Insurance Communication. Reuse the existing `PreservationLetterStep` component which already handles AI generation, draft editing, email sending, and compliance tracking.

## Changes

### 1. Migration: Seed task + update unlock trigger

**Seed the task:**
- Insert `preservation_letter` task for PI cases, created after `evidence_vault` (so `created_at` ordering is correct)
- Backfill existing PI cases: insert the task for cases where `evidence_vault` exists

**Update unlock trigger (`unlock_next_task`):**
- `evidence_vault` completed → unlock `preservation_letter` (instead of `pi_insurance_communication`)
- `preservation_letter` completed OR skipped → unlock `pi_insurance_communication`

**Intake branching adjustments:**
- `case_stage = 'insurance'`: skip `preservation_letter` along with `pi_medical_records` and `evidence_vault`
- `case_stage = 'demand'`: skip `preservation_letter` along with the others
- Same for `negotiation` and `filing` stages

### 2. Step page routing

The step page switch already has `case 'preservation_letter'` for civil cases — PI cases use the same task_key, so no change needed.

### 3. Sidebar phase config

Update `src/lib/workflow-phases.ts`:
- PI "Building Your Case" phase: `['pi_medical_records', 'evidence_vault', 'preservation_letter', 'pi_insurance_communication']`

### 4. Skip option on dashboard

Update `src/components/dashboard/next-step-card.tsx`:
- Rename `SKIPPABLE_DEMAND_TASKS` to `SKIPPABLE_TASKS`
- Add `'preservation_letter'` to the set
- Update skip link text to be generic: "Already done this? Skip this step"

### 5. No new components

Reuses:
- `PreservationLetterStep` component
- `/api/ai/preservation-letter` endpoint
- `/api/cases/[id]/preservation-letter/send` endpoint
