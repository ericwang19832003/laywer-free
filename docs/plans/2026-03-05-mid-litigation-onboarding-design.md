# Mid-Litigation Onboarding Design

## Problem

Users with active lawsuits (e.g., petition already filed, preparing for 26(f) conference) cannot use the app because the only entry point is "New Case," which starts at step 1 (welcome). There is no way to join mid-litigation.

## Solution

An "Import Existing Case" wizard with a milestone picker that lets users select where they are in their litigation. Tasks before the selected milestone are auto-skipped; the milestone task is unlocked as the starting point. Users can backfill skipped task details anytime.

## User Flow

1. **Select State** — reuse existing StateStep
2. **Select Role** — reuse existing RoleStep
3. **Select Dispute Type** — reuse existing DisputeTypeStep + sub-type steps
4. **Select Current Stage** — NEW milestone timeline picker
   - Vertical timeline with radio-style nodes
   - Selected milestone shows "You are here"
   - Prior milestones greyed out with checkmarks
5. **Quick Catch-Up** — NEW compact form for key details:
   - Case/cause number (optional)
   - Opposing party name (optional)
   - County (required)
   - Key dates: filing date, service date, answer deadline
   - Known upcoming deadlines
6. **Court Recommendation + Create** — reuse existing RecommendationStep

## Milestone Definitions

### Federal Civil / Contract / Property / Other

| Milestone | Label | Tasks Skipped | First Unlocked |
|-----------|-------|--------------|----------------|
| start | Just getting started | none | welcome |
| filed | Filed petition with court | welcome, intake, prepare_filing, file_with_court | evidence_vault |
| served | Served the defendant | + evidence_vault, preservation_letter, upload_return_of_service, confirm_service_facts | wait_for_answer |
| answer | Waiting for / received answer | + wait_for_answer, check_docket_for_answer | upload_answer |
| conference_prep | Preparing for 26(f) conference | + upload_answer, discovery_starter_pack | rule_26f_prep |
| discovery | In active discovery | + rule_26f_prep, mandatory_disclosures | discovery_starter_pack |
| trial_prep | Preparing for trial | all pre-trial tasks | trial_prep_checklist |

### Personal Injury

| Milestone | Label | First Unlocked |
|-----------|-------|----------------|
| start | Just getting started | welcome |
| medical | Gathering medical records | pi_medical_records |
| insurance | Dealing with insurance | pi_insurance_communication |
| demand | Sending demand letter | prepare_pi_demand_letter |
| negotiation | In settlement negotiations | pi_settlement_negotiation |
| filing | Filing petition | prepare_pi_petition |
| litigation | Served defendant, in litigation | pi_trial_prep |

### Debt Defense (Defendant)

| Milestone | Label | First Unlocked |
|-----------|-------|----------------|
| start | Just got served | welcome |
| validation | Sent validation letter | prepare_debt_defense_answer |
| answered | Filed my answer | debt_file_with_court |
| hearing | Preparing for hearing | debt_hearing_prep |

### Small Claims

| Milestone | Label | First Unlocked |
|-----------|-------|----------------|
| start | Just getting started | welcome |
| demand_sent | Sent demand letter | prepare_small_claims_filing |
| filed | Filed with court | file_with_court |
| served | Served the other party | prepare_for_hearing |
| hearing | Preparing for hearing | hearing_day |

### Family Law

| Milestone | Label | First Unlocked |
|-----------|-------|----------------|
| start | Just getting started | welcome |
| filed | Filed petition | file_with_court |
| served | Served the other party | waiting_period |
| temporary | Seeking temporary orders | temporary_orders |
| mediation | In mediation | mediation |
| final | Working on final orders | final_orders |

### Landlord-Tenant

| Milestone | Label | First Unlocked |
|-----------|-------|----------------|
| start | Just getting started | welcome |
| demand_sent | Sent demand letter | prepare_landlord_tenant_filing |
| filed | Filed with court | file_with_court |
| served | Served the other party | prepare_for_hearing |
| hearing | Preparing for hearing | hearing_day |
| post | Post-judgment | post_judgment |

## Technical Architecture

### New Files

| File | Purpose |
|------|---------|
| `src/components/cases/import-case-dialog.tsx` | Import wizard dialog container |
| `src/components/cases/wizard/milestone-step.tsx` | Milestone timeline picker UI |
| `src/components/cases/wizard/catch-up-step.tsx` | Quick catch-up form |
| `src/lib/rules/milestones.ts` | Milestone definitions per dispute type |
| `src/app/api/cases/[id]/import/route.ts` | POST endpoint to bulk-skip tasks |
| `src/components/dashboard/backfill-banner.tsx` | Dashboard reminder for skipped tasks |

### Modified Files

| File | Change |
|------|--------|
| `src/app/(authenticated)/cases/page.tsx` | Add "Import Existing Case" button |
| `src/app/(authenticated)/case/[id]/page.tsx` | Show backfill banner |

### Database Changes

None. Uses existing `skipped` task status and task metadata.

### API: POST /api/cases/[id]/import

**Request:**
```json
{
  "milestone": "conference_prep",
  "catchUp": {
    "caseNumber": "2026-CV-12345",
    "opposingParty": "John Doe",
    "filingDate": "2026-01-15",
    "serviceDate": "2026-02-01",
    "answerDeadline": "2026-02-21",
    "upcomingDeadlines": [
      { "label": "26(f) Conference", "date": "2026-03-15" }
    ]
  }
}
```

**Behavior:**
1. Look up milestone definition → get task_keys to skip
2. Bulk-update tasks: `SET status = 'skipped'` for all tasks before milestone
3. Set milestone task: `SET status = 'todo', unlocked_at = now()`
4. Store catch-up data in case metadata
5. Create deadlines from upcomingDeadlines array
6. Write `task_events` entry: `kind = 'bulk_import_skip'`

### Milestone Step UI

- Vertical timeline with connected nodes (circles + vertical lines)
- Each node: circle icon + milestone label + brief description
- Selected node: primary color fill + "You are here" badge
- Nodes above selection: checkmark + muted text
- Nodes below selection: default/upcoming styling
- Responsive: works on mobile with compact spacing

### Backfill Banner

Shown on case dashboard when case has skipped tasks:
- Soft info banner: "You imported this case mid-way. Fill in earlier details anytime for better recommendations."
- "Review skipped steps" link → scrolls to task list showing skipped items
- Dismissable (stores dismissal in localStorage)
