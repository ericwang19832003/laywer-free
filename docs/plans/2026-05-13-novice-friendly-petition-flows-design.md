# Novice-Friendly Petition Flows — Design Doc
**Date:** 2026-05-13  
**Status:** Approved  
**Goal:** Make every petition flow usable by a self-represented litigant with no legal knowledge — covering evidence preservation emails, petition filing, discovery, and court preparation.

---

## Problem

The current flows assume baseline legal literacy. A first-time pro se litigant hits walls at every stage:
- They don't know what "venue," "claim," or "relief" means in the petition wizard
- They don't know they should send a preservation email before evidence disappears
- The discovery pack system exists in the DB but has no guided UI
- The hearing prep task is a thin placeholder with no coaching on what to actually say or do

## Approach

**Approach C — Infrastructure first, then all flows.**

1. Build shared infrastructure (AI chat + NoviceHelpOverlay + GuidedStepConfig enrichment) once
2. Apply to all 4 flows: preservation email → petition filing → discovery → hearing prep
3. Wire AI chat context per step so answers are grounded in what the user is doing right now

---

## Phase 1: Shared Infrastructure

### 1.1 Embedded AI Step Chat (`StepChatDrawer`)

A floating "Ask a question" button on every step page. Opens a slide-over drawer with a streaming chat interface powered by Claude.

**System prompt template:**
```
You are a plain-English legal guide helping a self-represented [dispute_type] litigant 
in [state]. They are currently on the "[step_name]" step of their case. 
Answer in under 150 words. Give legal information, not legal advice. 
Never use jargon without immediately defining it in parentheses.
Glossary for this jurisdiction: [glossary_terms from JurisdictionRuleConfig]
```

**Suggested question chips** (step-specific, rendered above input):
- Claims step: "What counts as a legal claim?", "What if I don't know the exact law?"
- Discovery step: "What is an interrogatory?", "What happens if they don't answer?"
- Hearing step: "How do I address the judge?", "What if I get nervous?"

**Storage:** Chat history stored in `task.metadata.chat_history` (existing jsonb — no migration needed).

**API route:** `POST /api/ai/step-chat` — streaming, accepts `{ taskKey, stepName, disputeType, state, glossaryTerms, message, history }`.

### 1.2 NoviceHelpOverlay

A collapsible "What's happening here?" panel at the top of every step.

**Contents:**
- **Why this matters** — one sentence grounded in dispute type (from `noviceExplanation.why`)
- **What happens after** — next 2–3 task titles from the chain (fetched from task list)
- **Glossary chips** — underlined legal terms inline in all step text, expand to plain-English definitions on hover/tap (sourced from existing `JurisdictionRuleConfig.glossary`, currently populated but never surfaced in UI)

**State:** Collapsed by default after first view (uses localStorage per task_key).

### 1.3 GuidedStepConfig Type Enrichment

Add optional fields to the existing shared type (`packages/shared/src/guided-steps/types.ts`):

```typescript
interface GuidedStepConfig {
  // existing fields unchanged...
  noviceExplanation?: {
    why: string           // "We're collecting this because..."
    whatNext: string      // "After this, you'll prepare your..."
    glossaryTerms: { term: string; plain: string }[]
  }
  suggestedChatQuestions?: string[]  // shown as chips in StepChatDrawer
}
```

Back-fill `noviceExplanation` for the ~40 most-used guided step configs (one pass, all dispute types). Lower-volume configs get a default pulled from the jurisdiction glossary at render time.

---

## Phase 2: Flow-Specific Enhancements

### 2.1 Evidence Preservation Email Flow

**File:** New `PreservationEmailWizard` component replacing the thin `preservation_letter` task step.

**5-screen wizard:**

| Screen | Content |
|--------|---------|
| 1. Why this matters | Plain-English explainer: sending this creates a legal record; destruction after receipt hurts their case |
| 2. Who gets it? | Opponent name + email. Tooltip: "This is the person or company on the other side." |
| 3. What to preserve | Checkbox list with plain labels mapped to legal categories. Pre-checked from Evidence Vault answers. |
| 4. Preview & edit | AI-generated letter (existing generation). Each section explained: "This legal language puts them on formal notice." |
| 5. Send or copy | Gmail → "Send now". No Gmail → "Copy to clipboard" + send-from-your-email instructions. Both paths create a `task_event` with timestamp. |

**Post-send guidance:** "What to do if they don't respond in 14 days" — motion to compel (plain English).

### 2.2 Petition Filing Wizard Enhancements

**File:** `apps/web/src/components/step/petition-wizard.tsx` (enriched, not replaced)

| Step | Change |
|------|--------|
| Preflight | Add "Don't have this? Here's how to get it" links per document |
| Parties | Tooltip on Plaintiff/Defendant: "Plaintiff = you (the filer). Defendant = the other side." |
| Venue | Relabel "Which court?" + explanation of how to choose |
| Facts | Replace blank textarea with guided template: when / where / what they did / how it harmed you |
| Claims | Replace free-text with "What happened to you?" multiple-choice selector → maps to legal claim types automatically |
| Relief | Plain-English damage categories (money lost, money spent fixing it, other costs) that sum into damages figure |
| How to File | Step-by-step instructions per method: online (which site, what to upload, fee) vs. in-person (what to bring, copies, what to say at clerk's window) |
| Review | Plain-English pre-generation summary: "Your petition says [Opponent] owes you $X because [claim]. You're filing in [court]. Ready?" |

### 2.3 Discovery Wizard

**File:** New `NoviceDiscoveryWizard` component wrapping existing discovery pack system.

**6 phases:**

| Phase | Content |
|-------|---------|
| 1. What is discovery? | 3-screen explainer: ask questions → receive answers → use at trial |
| 2. Interrogatory Builder | Each template shows: Plain English label + legal text (collapsible) + include/exclude toggle + free-text customization |
| 3. Request for Production | Same pattern. Pre-populated with dispute-type-specific templates (debt → account statements; LT → lease + repair records) |
| 4. Request for Admissions | Plain English: "Ask them to admit or deny facts — admissions skip proof at trial" |
| 5. Service Wizard | How to send: certified mail (step-by-step) / process server (when required) / email (only if agreed). Creates `discovery_service_log` automatically. |
| 6. Response Tracker | Auto-calculated deadline by state rules. "What to do if they don't respond" → motion to compel link. |

### 2.4 Hearing Prep Wizard

**File:** New `HearingPrepWizard` component replacing thin `prepare_for_hearing` + `hearing_day` tasks.

**5 sections:**

| Section | Content |
|---------|---------|
| What to bring | Auto-generated checklist from case data: exhibit binder, N copies (for judge + opposing party), preservation email proof, discovery responses |
| Opening statement | Dispute-type template pre-filled with case details. Editable and printable. |
| What they'll argue | Dispute-type-specific common defenses + plain-English responses (debt: SOL / standing; LT: habitability / notice) |
| Courtroom etiquette | "Your Honor," stand when judge enters, don't interrupt, when/how to object |
| Day-of checklist | Arrive 30 min early, phone silent, courthouse address, parking, bring water |

---

## What Stays Unchanged

| Component | Reason |
|-----------|--------|
| DB schema (all tables) | All new state fits in existing `metadata jsonb` |
| Task status state machine | No changes to transitions or triggers |
| Document generation API | Existing generation used as-is |
| Discovery pack API | NoviceDiscoveryWizard wraps it, doesn't replace it |
| Jurisdiction rule configs | Existing `glossary` fields surfaced for the first time (not changed) |
| All existing API routes | Only addition: `POST /api/ai/step-chat` |

---

## New Files

| File | Purpose |
|------|---------|
| `apps/web/src/components/step/step-chat-drawer.tsx` | AI chat slide-over |
| `apps/web/src/components/step/novice-help-overlay.tsx` | Why/what-next/glossary panel |
| `apps/web/src/components/step/preservation-email-wizard.tsx` | 5-screen email wizard |
| `apps/web/src/components/step/novice-discovery-wizard.tsx` | 6-phase discovery wizard |
| `apps/web/src/components/step/hearing-prep-wizard.tsx` | 5-section hearing prep |
| `apps/web/src/app/api/ai/step-chat/route.ts` | Streaming chat API |

## Modified Files

| File | Change |
|------|--------|
| `packages/shared/src/guided-steps/types.ts` | Add `noviceExplanation` + `suggestedChatQuestions` fields |
| `packages/shared/src/guided-steps/*.ts` (~40 files) | Back-fill `noviceExplanation` |
| `apps/web/src/components/step/petition-wizard.tsx` | Add tooltips, structured prompts, claims selector, plain-English damage calculator |
| `apps/web/src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx` | Mount `StepChatDrawer` + `NoviceHelpOverlay` on every step |

---

## Success Criteria

- A user who has never been to court can complete evidence preservation → petition filing → discovery → hearing prep without consulting external resources
- Every legal term in every step has an accessible plain-English definition
- The AI chat answers questions correctly within the context of the user's current step
- All existing tests pass; new components have unit tests for key interactions
