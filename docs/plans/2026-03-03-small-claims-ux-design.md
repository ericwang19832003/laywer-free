# Texas Small Claims UX — Novice-Friendly Enhancements

**Date:** 2026-03-03
**Goal:** Make the Texas Justice Court small-claims flow easier for users with zero legal knowledge by simplifying terminology, adding guided prompts, and providing confidence checks.

## Problem
The current small-claims flow uses legal jargon too early, relies on free-form answers without examples, and lacks clarity on venue and evidence. This causes hesitation, mistakes, and drop-offs.

## Design Principles
- **Plain-English first:** legal terms appear as secondary context.
- **Progressive disclosure:** reveal complexity only when needed.
- **Confidence building:** show live summaries, examples, and “what’s next.”
- **Texas-only clarity:** emphasize Justice Court limits and venue rules.

## Proposed Flow (Texas Only)
1. **Small Claims Welcome** — What small claims is, $20,000 limit, timeline, and what the user will get.
2. **Step Preview** — Short overview with time estimate and save-anytime reassurance.
3. **Role & Goal** — “You / Other party” labels with legal terms shown below.
4. **Defendant Details** — Person vs business, service address, “don’t know yet” toggle.
5. **What Happened** — Guided timeline prompts with examples.
6. **Amount Owed** — Breakdown with optional “TBD” flag.
7. **Evidence Checklist** — “Upload later” support.
8. **Venue & Court** — One-question venue input and plain confirmation of recommendation.
9. **Review & Generate** — “We will include” checklist + inline edits.

## Step-Level Enhancements
### Welcome / Preview
- Texas Justice Court limit reminder: “Claims up to $20,000.”
- Typical timeline summary with calm tone.

### Role & Goal
- Use “You / Other party” in UI; show “Plaintiff / Defendant” in small text only.
- Quick choices: “Money owed” vs “Return of property.”
- Examples: unpaid invoice, security deposit, damaged item.

### Defendant Details
- Toggle: “I don’t know their address yet.”
- Guidance: “Use last known or work address.”
- Business flow: business name + owner/registered agent (plain language).

### What Happened
- 2–3 guided prompts: agreement date, breach date, attempts to resolve.
- “Most common answer” quick inserts.

### Amount Owed
- Plain-English breakdown: principal, fees, damages.
- “I don’t know exact total yet” option that marks amount as TBD.

### Evidence Checklist
- Short list with toggles for receipts, texts, photos, contracts.
- “Upload later” toggle to reduce friction.

### Venue & Court
- Ask: “Where does the other party live or do business?”
- Show recommendation + “Does this look right?” confirmation.

### Review
- “We will include” checklist.
- Inline edits without step-hopping.

## Cross-Cutting Features
- **Plain-English glossary drawer** for terms like “jurisdiction,” “service,” “defendant.”
- **Live summary panel** that updates as the user answers.
- **Next-step preview** at the bottom of each step.

## Success Metrics
- Reduced step drop-off rate.
- Faster time-to-completion.
- Higher self-reported confidence at review.

## Open Questions
- Should we offer a fast-track mode for returning users?
- Which evidence types should be prioritized for small claims?

