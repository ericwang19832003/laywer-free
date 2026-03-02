# Discovery Starter Pack — Design Document

## Goal

Wire the existing `discovery_starter_pack` task into a guided onboarding step that explains discovery tools, then add a persistent Dashboard card for navigating to the discovery hub.

## Architecture

Two new components (step + dashboard card) plus two file modifications (step page switch + dashboard layout). No new API routes, migrations, schemas, or AI integration — the discovery infrastructure already exists.

## Decisions

| Question | Decision |
|----------|----------|
| Step purpose | Guided onboarding — educational content, not auto-population |
| Court scope | All court types (JP with caveats, county/district TRCP, federal FRCP) |
| Dashboard navigation | Persistent card once discovery_starter_pack is unlocked |
| Completion model | User clicks "I'm done" (skipReview pattern) |
| Approach | Onboarding Step + Dashboard Card (minimal scope) |

---

## Section 1: Discovery Starter Pack Step Component

### Behavior

Uses `StepRunner` with `skipReview` (same pattern as `file-with-court`). Single screen with educational content, user reads and clicks confirm to complete.

### Content Structure

1. **Court-specific intro paragraph** — one sentence orienting the user
2. **"What is Discovery?"** — expandable section explaining the concept in plain language
3. **"Tools Available to You"** — expandable section with sub-items:
   - Requests for Production (RFP)
   - Requests for Interrogatories (ROG)
   - Requests for Admissions (RFA)
4. **"Key Deadlines & Rules"** — expandable section with court-type-specific guidance:
   - JP: Limited formal discovery, mainly subpoenas
   - County/District: Texas Rules of Civil Procedure (30-day response, 25 ROG limit)
   - Federal: FRCP Rules 26–37 (proportionality, mandatory disclosures)
5. **CTA link** — "Go to Discovery Hub →" linking to `/case/[id]/discovery`

### Expandable Sections

Simple `useState<string | null>` toggle — one section open at a time. Chevron rotation on open/close.

### Completion

`onConfirm` → `patchTask('in_progress')` then `patchTask('completed')`. Same two-call pattern used by other steps.

---

## Section 2: Dashboard Discovery Card

### Placement

After DeadlinesCard, before ProgressCard in the dashboard `space-y-6` stack.

### States

**Hidden** — `discovery_starter_pack` task is `locked`. Card not rendered.

**State B: Unlocked, step not completed** (`todo` or `in_progress`):
- Title: "Discovery"
- Body: "Learn about discovery tools available for your case and how to use them."
- CTA: "Get Started →" → `/case/[id]/step/[taskId]`

**State C: Completed, packs exist:**
- Title: "Discovery"
- Body: Summary stats (e.g., "2 packs · 1 served · 3 items")
- CTA: "View Discovery Hub →" → `/case/[id]/discovery`

**State D: Completed, no packs:**
- Title: "Discovery"
- Body: "Ready to start building your discovery requests."
- CTA: "Go to Discovery Hub →" → `/case/[id]/discovery`

### Data

- Task status from existing tasks query
- Pack/item counts (when completed) via lightweight aggregate query

---

## Section 3: Component Architecture

### New Files

| File | Purpose | ~Size |
|------|---------|-------|
| `src/components/step/discovery-starter-pack-step.tsx` | Onboarding step | ~120 lines |
| `src/components/dashboard/discovery-card.tsx` | Dashboard card | ~60 lines |

### Modified Files

| File | Change |
|------|--------|
| `src/app/case/[id]/step/[taskId]/page.tsx` | Add `discovery_starter_pack` case to switch |
| `src/app/case/[id]/page.tsx` | Add DiscoveryCard + data query |

### Step Component Structure

```
DiscoveryStarterPackStep
├── StepRunner (skipReview)
│   ├── Court-specific intro
│   ├── Expandable: "What is Discovery?"
│   ├── Expandable: "Tools Available to You"
│   │   ├── RFP explanation
│   │   ├── ROG explanation
│   │   └── RFA explanation
│   ├── Expandable: "Key Deadlines & Rules" (court-specific)
│   └── CTA link to discovery hub
└── onConfirm → patchTask('completed')
```

### What We're NOT Building

- No new API routes
- No new database tables or migrations
- No new Zod schemas
- No AI integration
- No modifications to existing discovery hub/pack/item/template components
