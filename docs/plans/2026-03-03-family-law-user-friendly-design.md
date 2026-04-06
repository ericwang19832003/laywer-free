# Family Law UX — Novice-Friendly Flow Enhancements

**Date:** 2026-03-03
**Goal:** Make all family-law sub-types (divorce, custody, child support, visitation, spousal support, protective order, modification) clearer and easier for users with zero legal knowledge, while reducing drop-offs and time-to-completion.

## Problem
The current family flow is functionally complete but still assumes baseline legal familiarity. Users without family-law knowledge struggle with terminology (grounds, conservatorship, possession), fear missing required info, and hesitate at free-form narrative steps.

## Design Principles
- **Plain-English first:** show legal terminology only as secondary context.
- **Progressive disclosure:** reveal detail only when needed.
- **Default guidance:** highlight common choices with safe defaults.
- **User confidence:** provide live summaries and validation of understanding.
- **Safety-aware:** ensure protective-order flows minimize risk and anxiety.

## Proposed User Flow
1. **Family Welcome (new):** “What this case type means / what the court decides / what you’ll get.”
2. **Step Preview (new):** list upcoming steps, time estimate, and reassurance about saving.
3. **Family Intake (existing):** keep early but reduce legal phrasing.
4. **Safety Screening (existing):** keep early with quick-exit and safety tips.
5. **Family Law Wizard (existing):** add novice-focused UX within each step.
6. **Review (existing):** reorganize into “People”, “Children & Support”, “What You’re Asking For.”
7. **Draft Generation (existing):** add “Confidence Check” acknowledgment and plain-English summary.

## Step-Level UX Enhancements
### Preflight
- Split into **Minimum required to start** vs **Nice to have**.
- “Get later” toggles create a follow-up checklist.
- One-line “why it matters” for each item.

### Parties
- Inline explanation: Petitioner = person filing; Respondent = other party.
- “I don’t know the address” option with guidance instead of blocking.

### Venue
- Ask in plain English: “Where do the children live most of the time?”
- Show the rule it triggers in plain language with a quick confirmation.

### Grounds / Facts
- Replace “grounds” with “What’s happening in your family?”
- For divorce, default to no-fault; show legal phrasing as read-only or editable note.
- Provide short, structured prompts and examples.

### Children
- Split into “Who are the children?” and “Where have they lived?”
- Provide example answers and “Most common answer” quick picks.

### Custody
- Show 2–3 arrangement cards with plain-English descriptions and “Common choice” labels.
- Ask for reasoning only when a non-standard option is selected.

### Support Calculator
- Pre-fill number of children.
- “How this is calculated” drawer.
- “I don’t have income info” option that saves the step as TBD.

### Protective Order
- “Safe to proceed?” check with quick-exit.
- Incident templates to reduce blank-page anxiety.

### Modification
- “What changed?” picker (income, schedule, relocation, safety) with a short detail field.

### Review
- Inline edit for each section without step-hopping.
- “We’ll include” checklist so users see exactly what appears in the petition.

## Cross-Cutting Support Features
- **Plain-English Glossary Drawer:** definitions for family-law terms.
- **Contextual Examples:** short, concrete examples per sub-type.
- **Next-Step Preview:** one-line preview at end of each step.
- **Live Plain-English Summary:** a running paragraph that updates as users answer.
- **Confidence Check:** “This matches my situation” acknowledgment before generation.

## Metrics for Success
- **Drop-off rate** per step.
- **Time-to-completion** for the family wizard.
- **Draft generation success** and revision rate.
- **Self-reported confidence** (1–5) at review.

## Risks & Mitigations
- **Overwhelming UI:** mitigate via collapsible help and microcopy.
- **Legal accuracy vs simplicity:** keep legal text in secondary tooltips or annotations.
- **Safety concerns:** quick-exit and minimal on-screen sensitive content.

## Open Questions
- Should the “Family Welcome” be a single global step or sub-type specific?
- Do we want a “Fast track” for returning users?
- What confidence signals are acceptable before generating a draft?

