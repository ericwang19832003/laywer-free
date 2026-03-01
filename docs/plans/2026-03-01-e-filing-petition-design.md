# E-Filing Petition Guidance Module — Design Document

**Date**: 2026-03-01
**Status**: Approved

## Problem

The app guides users through case setup, evidence gathering, and deadline tracking — but stops short of helping them file anything with the court. Users complete intake and then face the most intimidating step: drafting a petition (plaintiff) or answer (defendant) and navigating the e-filing system. This is the #1 gap in the user journey.

## Solution

Two new steps in the task chain that provide an end-to-end filing experience:

1. **`prepare_filing`** — AI-assisted document builder that generates a draft petition (plaintiff) or answer (defendant) tailored to the court type
2. **`file_with_court`** — Court-specific step-by-step e-filing walkthrough with interactive checklist

## Task Flow & Placement

### Task Chain

```
PLAINTIFF:
welcome → intake → prepare_filing → file_with_court → preservation_letter → evidence_vault → ...

DEFENDANT:
welcome → intake → prepare_filing → file_with_court → evidence_vault → ...
```

### Gatekeeper Rules

| Task Key | Unlocks When | Condition |
|----------|-------------|-----------|
| `prepare_filing` | `intake` completed | Always |
| `file_with_court` | `prepare_filing` completed | Always |

### Task Titles (Role-Aware)

| Role | `prepare_filing` Title | `file_with_court` Title |
|------|----------------------|------------------------|
| Plaintiff | "Prepare Your Petition" | "File With the Court" |
| Defendant | "Prepare Your Answer" | "File With the Court" |

---

## Step 1: AI Document Builder (`prepare_filing`)

### Q&A Sections

Multi-section form (all visible, user can jump between sections). Adapts by `court_type`, `dispute_type`, and `role`.

**Section 1 — Parties** (all court types)
- Your full legal name, address, city, state, zip
- Opposing party's full legal name, address (if known)
- Additional parties (add/remove)

**Section 2 — Court Info** (pre-filled from case data, read-only)
- Court type, county, cause number (defendants)

**Section 3 — Facts** (all court types)
- "In plain language, describe what happened" — textarea
- "When did this happen?" — date picker
- "Where did this happen?" — text input

**Section 4 — Claims** (adapts by dispute type)
- `debt_collection`: amount owed, original agreement, breach
- `landlord_tenant`: lease terms, issue type, amount
- `personal_injury`: injury description, treatment, damages
- `contract`: contract description, breach, damages
- `property`: property description, ownership claim, relief
- `family`: relationship, children, relief sought
- `other`: general claim description, relief

**Section 5 — Relief Requested**
- Dollar amount (if monetary)
- Other relief: injunction, possession, specific performance
- Attorney's fees checkbox, court costs checkbox

**Section 6 — Defendant Only (Answer)**
- General denial checkbox (recommended for pro se)
- Specific defenses (optional textarea)
- Counterclaim yes/no (if yes, mirror plaintiff sections)

### AI Generation

API route: `POST /api/cases/[id]/generate-filing`

1. Builds system prompt with correct document format per court type:
   - **JP Court**: Small claims sworn affidavit
   - **County/District**: Original petition (formal Texas pleading, numbered paragraphs, cause of action, prayer)
   - **Federal**: Federal complaint (FRCP format, jurisdiction statement)
   - **Defendant (any)**: General denial answer with optional affirmative defenses
2. Calls Claude API to draft the document
3. Safety check — reject output containing specific legal advice, case outcome predictions, or attorney impersonation
4. Returns draft text with disclaimer header

### Draft Output

- Large editable textarea with disclaimer banner
- "DRAFT — NOT LEGAL ADVICE. This is a starting point only."
- Regenerate button, Download as PDF button
- Mandatory acknowledgment checkbox before download
- Line numbers for reference

### Data Storage

- Facts → `tasks.metadata` (same pattern as intake)
- Draft text → `tasks.metadata.draft_text`
- Final text → `tasks.metadata.final_text`
- PDF → Supabase storage `cases/{case_id}/court-docs/{uuid}`
- `court_documents` row with `doc_type: 'petition'` or `'answer'`

---

## Step 2: E-Filing Walkthrough (`file_with_court`)

### Content Structure

Checklist-based step with expandable instruction sections. All items must be checked before completion. Content adapts by `court_type`.

### JP Court Checklist

| # | Item | Key Details |
|---|------|-------------|
| 1 | Create eFileTexas account | efiletexas.gov → Register → Individual. Some JP courts accept paper. |
| 2 | Select your court | Search "[County] Justice of the Peace, Precinct [X]" |
| 3 | Choose filing type | New Case → Civil → Small Claims (plaintiff). Existing Case → cause number (defendant). |
| 4 | Upload petition/answer | Upload the PDF from previous step. Doc type: Petition or Answer. |
| 5 | Pay filing fee | $35–$75. Fee waiver: Affidavit of Inability to Pay (link). |
| 6 | Submit and save confirmation | Save confirmation number and filing receipt. |

### County/District Court Checklist

Same structure with court-specific details:
- Filing fees: ~$200–$400
- Citation/service: request issuance of citation after filing
- E-service options for defendant responses

### Federal Court Checklist

| # | Item | Key Details |
|---|------|-------------|
| 1 | Create PACER account | pacer.uscourts.gov |
| 2 | Register for CM/ECF | Contact clerk's office. Pro se may need in-person filing. |
| 3 | Prepare civil cover sheet | JS-44 form from uscourts.gov |
| 4 | Upload complaint + cover sheet | CM/ECF or clerk's office |
| 5 | Pay filing fee | $405. Fee waiver: IFP motion with financial affidavit. |
| 6 | Service of process | 90 days (FRCP Rule 4). Marshal, process server, or waiver. |

### Component Structure

```
FileWithCourtStep
├── CourtTypeHeader
├── FilingChecklist
│   ├── ChecklistItem (expandable, checkbox)
│   └── ...
├── FilingFeeCard
└── ImportantReminders
```

Uses `skipReview: true` on StepRunner. "I'm done" button active when all items checked.

### Data Storage

```typescript
{
  checklist: {
    account_created: boolean
    court_selected: boolean
    filing_type_chosen: boolean
    document_uploaded: boolean
    fee_paid: boolean
    submitted: boolean
  },
  confirmation_number?: string
}
```

---

## Schema Changes

### Migration: `court_documents.doc_type`

Add `'petition'`, `'answer'`, `'general_denial'` to the CHECK constraint.

### Migration: New tasks in `seed_case_tasks`

Add `prepare_filing` and `file_with_court` to the seed trigger with `status: 'locked'`.

### Migration: Gatekeeper unlock rules

Add rules:
- `intake` completed → unlock `prepare_filing`
- `prepare_filing` completed → unlock `file_with_court`

Adjust existing rules: `file_with_court` completed → unlock `preservation_letter` (plaintiff) or `evidence_vault` (defendant).

---

## File Layout

| File | Action |
|------|--------|
| `supabase/migrations/..._filing_tasks.sql` | Create — new tasks, gatekeeper rules, doc_type expansion |
| `src/lib/rules/filing-prompts.ts` | Create — System prompt builder per court type + role |
| `src/lib/rules/filing-safety.ts` | Create — Safety check for AI output |
| `src/app/api/cases/[id]/generate-filing/route.ts` | Create — AI generation endpoint |
| `src/components/step/prepare-filing-step.tsx` | Create — Document builder step |
| `src/components/step/file-with-court-step.tsx` | Create — E-filing walkthrough step |
| `src/components/step/filing/parties-section.tsx` | Create — Parties form section |
| `src/components/step/filing/facts-section.tsx` | Create — Facts form section |
| `src/components/step/filing/claims-section.tsx` | Create — Claims form section (adapts by dispute type) |
| `src/components/step/filing/relief-section.tsx` | Create — Relief requested section |
| `src/components/step/filing/defendant-section.tsx` | Create — Defendant answer section |
| `src/components/step/filing/draft-viewer.tsx` | Create — Draft output with editor + disclaimer |
| `src/components/step/filing/filing-checklist.tsx` | Create — Expandable checklist component |
| `src/components/step/filing/checklist-item.tsx` | Create — Single expandable checklist item |
| `src/components/step/filing/filing-fee-card.tsx` | Create — Fee info card with waiver link |
| `src/lib/schemas/filing.ts` | Create — Zod schemas for filing form data |
| `src/app/case/[id]/step/[taskId]/page.tsx` | Modify — Add cases for `prepare_filing` and `file_with_court` |
| `src/lib/rules/gatekeeper.ts` | Modify — Add unlock rules for new tasks |

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Court type is `unknown` | Show a message: "Complete the court selection wizard first" with link back to intake |
| Court type is `federal` | Show PACER/CM-ECF instructions instead of eFileTexas |
| User changes court type after filing prep | Draft is preserved but flagged: "Your court type changed — you may need to regenerate" |
| AI generation fails | Show error with retry button. Facts are preserved in metadata. |
| User skips filing step | Allowed — user can mark as skipped. Does not block downstream tasks. |
| Very long fact narrative | Textarea with character guidance (not hard limit). AI handles summarization. |

## Dream Team Quality Gate

- **Researcher**: eFileTexas is the correct platform for TX state courts. PACER/CM-ECF for federal. Filing fees verified against current schedules.
- **Architect**: Fits existing step-runner + gatekeeper pattern. AI route is isolated. No new tables beyond migration changes.
- **PM**: Solves the #1 user journey gap. Both plaintiffs and defendants covered. End-to-end from document prep to filing.
- **Developer**: Clean separation: form sections, AI route, checklist component. All independently testable.
- **UI Designer**: Multi-section form follows existing intake pattern. Checklist with expandable items keeps content scannable. Strong disclaimer treatment.
- **Tester**: Test AI generation per court type, safety checks, checklist completion, role-based content switching.
