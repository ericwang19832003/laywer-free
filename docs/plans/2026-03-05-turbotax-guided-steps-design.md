# TurboTax-Style Interactive Guided Steps Design

## Problem

The app's 30 guidance-only steps (trial prep, hearing day, evidence vault, etc.) display static bullet-point lists inside accordions. Users passively read content without engagement. This doesn't feel like TurboTax — it feels like a reference document.

## Solution

Transform all 30 guidance-only steps from passive accordion content into interactive Q&A flows that:
1. Ask users one question at a time about their specific situation
2. Show conditional follow-up questions based on answers
3. Save all answers to task metadata for future reference
4. Generate a personalized action plan at the end based on their answers

## User Flow

```
Question 1 of N          ━━━━━━━━━━━━━

  Do you have any injuries from this incident?

  [ Yes, I have injuries ]
  [ No, property damage only ]

                            ↓

Question 2 of N          ━━━━━━━━━━━━━━━

  Do you have your medical records organized?

  [ Yes, all organized ]
  [ I have some, but not all ]
  [ I haven't started yet ]

                            ↓

Your Action Plan         ━━━━━━━━━━━━━━━━━━━

  Based on your answers:

  ⚠ Request remaining medical records
  ⚠ Create a damages summary chart
  ✓ Police report is ready — bring 3 copies
  ✓ Photos are ready

  [ I'm ready → ]
```

## Architecture

### New Component: `GuidedStep`

Replaces `StepRunner` for all guidance-only steps. Renders one question at a time with a progress bar.

```typescript
interface GuidedStepProps {
  caseId: string
  taskId: string
  title: string
  reassurance: string
  questions: QuestionDef[]
  generateSummary: (answers: Record<string, string>) => SummaryItem[]
}

interface QuestionDef {
  id: string
  prompt: string
  helpText?: string          // Optional explanation below prompt
  type: 'yes_no' | 'single_choice' | 'info'
  options?: { value: string; label: string }[]
  showIf?: (answers: Record<string, string>) => boolean  // Conditional display
}

interface SummaryItem {
  status: 'done' | 'needed' | 'info'
  text: string
}
```

**Question types:**
- `yes_no` — Two buttons: Yes / No
- `single_choice` — 2-4 option cards (like the dispute type picker)
- `info` — Read-only tip screen with "Got it →" button (for critical legal info that must be shown)

**Conditional logic:** `showIf` function receives all prior answers. If it returns false, the question is skipped. This lets the flow adapt — e.g., skip medical record questions if user said "no injuries."

### Question Config Files

Each step defines its questions in a config file:

```
src/lib/guided-steps/
  pi-trial-prep.ts
  pi-medical-records.ts
  pi-insurance-communication.ts
  pi-settlement-negotiation.ts
  pi-post-resolution.ts
  pi-serve-defendant.ts
  pi-file-with-court.ts
  trial-prep-checklist.ts
  discovery-starter-pack.ts
  rule-26f-prep.ts
  understand-removal.ts
  evidence-vault.ts
  file-with-court.ts
  small-claims/serve-defendant.ts
  small-claims/prepare-for-hearing.ts
  small-claims/hearing-day.ts
  landlord-tenant/serve-other-party.ts
  landlord-tenant/lt-hearing-prep.ts
  landlord-tenant/lt-hearing-day.ts
  landlord-tenant/post-judgment.ts
  debt-defense/serve-plaintiff.ts
  debt-defense/debt-hearing-prep.ts
  debt-defense/debt-hearing-day.ts
  debt-defense/debt-post-judgment.ts
  debt-defense/debt-file-with-court.ts
  debt-defense/debt-preflight.ts
  family/mediation.ts
  family/waiting-period.ts
  family/temporary-orders.ts
  family/final-orders.ts
```

### Data Persistence

Answers saved to `task.metadata.guided_answers` via existing `PATCH /api/tasks/[id]`:

```json
{
  "guided_answers": {
    "has_injuries": "yes",
    "medical_records_status": "some_not_all",
    "has_photos": "yes",
    "has_police_report": "yes",
    "damages_summary_prepared": "no"
  }
}
```

### Resume Support

If user leaves mid-flow, answers are auto-saved. On return, the component reads existing `guided_answers` from metadata and resumes from the first unanswered question.

### Personalized Summary

Each config provides a `generateSummary(answers)` function that maps answers to action items:
- `done` items: things the user confirmed they have (shown with ✓)
- `needed` items: things still to do (shown with ⚠)
- `info` items: general tips relevant to their situation

## Steps to Transform (30 total)

### Personal Injury (7 steps)
1. pi-trial-prep — 4 sections → ~8 questions
2. pi-medical-records — 4 sections → ~8 questions
3. pi-insurance-communication — 5 sections → ~10 questions
4. pi-settlement-negotiation — 4 sections → ~8 questions
5. pi-post-resolution — 4 sections → ~6 questions
6. pi-serve-defendant — 4 sections → ~6 questions
7. pi-file-with-court — 4 sections → ~6 questions

### Civil / General (5 steps)
8. trial-prep-checklist — dynamic sections → ~10 questions
9. discovery-starter-pack — 4 sections → ~6 questions
10. rule-26f-prep — 3 sections → ~6 questions
11. understand-removal — 3 sections → ~5 questions
12. evidence-vault — 3 sections → ~6 questions
13. file-with-court — 5 FAQ items → ~5 questions

### Small Claims (3 steps)
14. serve-defendant — 3 sections → ~5 questions
15. prepare-for-hearing — 3 sections → ~6 questions
16. hearing-day — 3 sections → ~5 questions

### Landlord-Tenant (4 steps)
17. serve-other-party — 3 sections → ~5 questions
18. lt-hearing-prep — 3 sections → ~6 questions
19. lt-hearing-day — 3 sections → ~5 questions
20. post-judgment — 3 sections → ~5 questions

### Debt Defense (5 steps)
21. serve-plaintiff — 3 sections → ~5 questions
22. debt-hearing-prep — 4 sections → ~8 questions
23. debt-hearing-day — 4 sections → ~6 questions
24. debt-post-judgment — 4 sections → ~6 questions
25. debt-file-with-court — 4 sections → ~6 questions
26. debt-preflight — 3 sections → ~5 questions

### Family (4 steps)
27. mediation — 3 sections → ~5 questions
28. waiting-period — 1 section → ~3 questions
29. temporary-orders — 3 sections → ~5 questions
30. final-orders — 3 sections → ~5 questions

**Estimated total: ~185 questions across 30 steps**

## Technical Notes

- GuidedStep component handles all rendering, progress tracking, auto-save, and summary generation
- Each step file becomes thin: just imports GuidedStep + its question config
- Existing `StepRunner` remains unchanged for form-based steps (intake, filing, etc.)
- No database schema changes — uses existing task.metadata JSON field
- No new API endpoints — uses existing PATCH /api/tasks/[id]
