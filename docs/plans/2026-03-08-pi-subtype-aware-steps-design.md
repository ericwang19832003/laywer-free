# Design: Sub-type-aware Personal Injury Steps

**Date:** 2026-03-08
**Problem:** Property damage PI cases show injury-specific steps like "Organize Your Medical Records"
**Approach:** Make PI step components sub-type-aware (same pattern as `pi_intake`)

## Changes

### Layer 1 — DB Migration
Update `seed_case_tasks()` to look up `pi_sub_type` and set appropriate task titles for property damage sub-types.

### Layer 2 — Step Router
Pass `piSubType` to `PIMedicalRecordsStep`, `PIInsuranceCommunicationStep`, and `PIDemandLetterStep`.

### Layer 3 — Step Configs
Create property-damage content variants for:
- `pi_medical_records` → repair estimates, contractor quotes, photos, appraisals, damage timeline
- `pi_insurance_communication` → remove injury-specific warnings (MMI, "extent of injuries")
- `prepare_pi_demand_letter` → repair costs, diminished value, loss of use

### Layer 4 — Milestones
Update property-damage-appropriate milestone labels.

## Files
1. New SQL migration (conditional task titles)
2. `src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx`
3. `src/lib/guided-steps/personal-injury/pi-medical-records.ts` + new `pi-damage-documentation.ts`
4. `src/components/step/personal-injury/pi-medical-records-step.tsx`
5. `src/lib/guided-steps/personal-injury/pi-insurance-communication.ts`
6. `src/components/step/personal-injury/pi-insurance-communication-step.tsx`
7. `src/lib/rules/milestones.ts`
