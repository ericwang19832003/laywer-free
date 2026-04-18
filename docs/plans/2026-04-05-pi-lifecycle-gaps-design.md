# PI Lifecycle Gaps — 4 New Tasks Design

**Date:** 2026-04-05
**Scope:** Fill 4 gaps identified by TX Litigation Lifecycle Guard audit
**Approach:** 1 core task (court selection) + 3 depth tasks (disclosures, pretrial, judgment)

---

## Context

The TX Litigation Lifecycle Guard audit found 4 stages with no corresponding PI task:
- Stage 3: Court Selection (no guidance on Justice vs County vs District vs Federal)
- Stage 9: Disclosures (no task for federal initial disclosures, state/federal confusion risk)
- Stage 13: Pretrial (no exhibit list, witness list, or motions in limine preparation)
- Stage 15: Judgment (no explanation of judgment, appeal deadlines, enforcement)

---

## Task A: `pi_court_selection` (CORE)

**Position:** After `pi_settlement_negotiation`, before `prepare_pi_petition`
**Unlock:** When `pi_settlement_negotiation` completes or is skipped

**Questions:**
- Estimated total damages (drives court selection threshold)
- Whether defendant is out of state or federal entity (federal jurisdiction check)
- Whether case involves equity relief (forces District Court)

**Auto-recommendation:**
- <$20K, no equity → Justice Court
- $20K-$250K, no equity, no federal → County Court at Law
- >$250K or equity → District Court
- Federal question or diversity >$75K → Federal Court (with warning about different rules)

**Federal path warning:** Prominent warning that federal courts follow FRCP not TRCP, different discovery, disclosure, and complaint rules.

**Metadata:**
```typescript
{
  estimated_damages: string | null
  federal_jurisdiction: boolean
  equity_relief: boolean
  recommended_court: 'justice' | 'county' | 'district' | 'federal' | null
  recommendation_confidence: 'high' | 'medium' | 'low'
}
```

---

## Task B: `pi_disclosures_guide` (DEPTH)

**Unlock:** When `pi_scheduling_conference` completes

**Questions:**
- State or federal court? (single_choice)
- **Federal path:** FRCP 26(a)(1) initial disclosures (witnesses, documents, damages computation, insurance), 14-day deadline after Rule 26(f) conference, expert disclosure (90 days before trial), supplementation
- **State path:** Texas has NO automatic initial disclosures. Discovery starts with requests for disclosure (TRCP 194). Warn against confusing federal/state requirements.

---

## Task C: `pi_pretrial_preparation` (DEPTH)

**Unlock:** When `pi_pretrial_motions` completes

**Questions:**
- Pretrial order received? (yes_no + explanation)
- Exhibit list prepared? (yes_no + numbering/organization guidance)
- Witness list prepared? (yes_no + subpoena guidance)
- Motions in limine to file? (yes_no + common PI examples)
- Trial brief needed? (yes_no + purpose explanation)
- Pretrial conference date (text)

---

## Task D: `pi_judgment_guide` (DEPTH)

**Unlock:** When `pi_post_resolution` becomes todo

**Questions:**
- Judgment entered? (yes_no)
- Who prevailed? (plaintiff_won / defendant_won / mixed)
- **If won:** Amount, costs/fees, voluntary payment check, enforcement options (abstract of judgment, writ of execution, garnishment, turnover)
- **If lost/mixed:** Motion for new trial (TRCP 329b — 30 days), appeal path (TRAP 26.1 — 30/90 days), jurisdictional deadline warning
- Satisfaction of judgment filing guidance

---

## Database Changes

**Core task:** Modify seed to insert `pi_court_selection` between `pi_settlement_negotiation` and `prepare_pi_petition`

**Depth tasks:** Add `pi_disclosures_guide`, `pi_pretrial_preparation`, `pi_judgment_guide` to `seed_pi_depth_tasks()`

**Unlock triggers:** Add to `unlock_pi_depth_tasks()`:
- `pi_disclosures_guide` unlocked after `pi_scheduling_conference`
- `pi_pretrial_preparation` unlocked after `pi_pretrial_motions`
- `pi_judgment_guide` unlocked when `pi_post_resolution` becomes todo

**No new tables.** All metadata in task JSONB.

## Files

| Action | File |
|--------|------|
| Create | `packages/shared/src/guided-steps/personal-injury/pi-court-selection.ts` |
| Create | `packages/shared/src/guided-steps/personal-injury/pi-disclosures-guide.ts` |
| Create | `packages/shared/src/guided-steps/personal-injury/pi-pretrial-preparation.ts` |
| Create | `packages/shared/src/guided-steps/personal-injury/pi-judgment-guide.ts` |
| Create | `supabase/migrations/20260405000004_pi_lifecycle_gaps.sql` |
| Modify | `apps/web/src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx` |
