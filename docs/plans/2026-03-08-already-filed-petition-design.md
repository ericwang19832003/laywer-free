# Design: "Already Filed Petition" Branching

**Date:** 2026-03-08
**Problem:** When users choose to file a lawsuit in the settlement negotiation step, the app always guides them through petition preparation and filing. But some users may have already filed a petition outside the app and need to skip those steps.
**Approach:** Add conditional questions to the existing settlement negotiation config + extend the DB trigger branching.

## New Questions

Added to settlement negotiation config after `want_to_file_suit = yes`:

| ID | Type | Prompt | Show If |
|---|---|---|---|
| `already_filed_petition` | yes_no | "Have you already filed a petition (lawsuit) with the court?" | `want_to_file_suit = 'yes'` |
| `cause_number` | text | "What is your cause number (case number)?" | `already_filed_petition = 'yes'` |
| `petition_filing_date` | text | "When did you file your petition?" | `already_filed_petition = 'yes'` |
| `already_filed_info` | info | Confirmation that petition + filing steps will be skipped | `already_filed_petition = 'yes'` |

## Three-Branch Flow

```
settlement_reached?
├── YES → skip all litigation → pi_post_resolution
└── NO → want_to_file_suit?
    ├── NO → skip all litigation → pi_post_resolution
    └── YES → already_filed_petition?
        ├── YES → skip prepare_pi_petition + pi_file_with_court → unlock pi_serve_defendant
        └── NO  → unlock prepare_pi_petition (current behavior)
```

## DB Trigger

Extend `unlock_next_task()` at the `pi_settlement_negotiation` branch to check `already_filed_petition`. If `yes`, skip `prepare_pi_petition` and `pi_file_with_court`, unlock `pi_serve_defendant`. Cause number and filing date stored in the task's `metadata.guided_answers`.

## Files

1. Modify: `src/lib/guided-steps/personal-injury/pi-settlement-negotiation.ts`
2. Modify: `src/lib/guided-steps/personal-injury/pi-settlement-negotiation-property.ts`
3. Create: `supabase/migrations/20260308000003_already_filed_branching.sql`
