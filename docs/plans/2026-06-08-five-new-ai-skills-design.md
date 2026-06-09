# Design: Five New AI Skills

**Date:** 2026-06-08
**Status:** Approved, ready for implementation

---

## Problem

The app has 14 AI skills but several high-value workflows remain unassisted: discovery drafting, exhibit selection, case health guidance, settlement estimation, and full motion assembly. Three of the five have fully written schemas in `src/lib/ai/` that have never been wired to routes.

---

## Architecture

All five skills follow the established litigation-legal pattern:
- `getAuthenticatedClient()` → `{ ok, supabase, user }`
- `checkDistributedRateLimit(supabase, user.id, 'ai', RATE_LIMITS.ai.maxRequests, RATE_LIMITS.ai.windowMs)`
- `rateLimitResponse(rl.retryAfterMs)` (single number arg)
- `incrementAiUsage(supabase).catch(() => {})` for quota tracking
- `applyProSeGuardrails()` on all AI output
- `ai_cache` table for GET routes (stale-while-revalidate)

---

## Skill 1 — Discovery Pack Generator

**Route:** `POST /api/cases/[id]/discovery/generate`
**Existing schema:** `src/lib/ai/discovery-suggestions.ts` — ready, no changes needed

### Input
- `caseId` from route params
- Reads: `cases.dispute_type`, `cases.state`, `cases.role`; `evidence_items.category` (up to 20)

### Processing
1. Build prompt with `buildDiscoverySuggestionPrompt({ dispute_type, state, role, evidence_categories })`
2. Call Claude (`claude-sonnet-4-6`, `temperature: 0.3`, `jsonMode: true`, `schema: discoverySuggestionSchema`)
3. Number items by type (`rfp` → RFP-1, RFP-2; `rog` → ROG-1; etc.)

### Output → DB
- Insert `discovery_packs` row: `{ case_id, title, status: 'draft', created_by: user.id }`
- Insert `discovery_items` rows: `{ pack_id, item_type, item_no, prompt_text }`
- Return: `{ packId, title, items }`

---

## Skill 2 — Health Tips Generator

**Route:** `GET /api/cases/[id]/health/tips`
**Existing schema:** `src/lib/ai/health-tips.ts` — ready, no changes needed

### Input
- Reads: latest `case_risk_scores` row for `case_id` (if none, uses static fallback)
- Also reads: `cases.court_type`, `cases.dispute_type`; task completion counts; `evidence_items` count

### Processing
1. If no risk scores: return `buildStaticHealthTips(zeroed scores)` immediately (no AI call)
2. Build prompt with `buildHealthTipsPrompt({ overall_score, deadline_risk, response_risk, evidence_risk, activity_risk, court_type, dispute_type, tasks_completed, tasks_total, evidence_count })`
3. Call Claude (`claude-haiku-4-5-20251001`, `temperature: 0.2`, `jsonMode: true`, `schema: healthTipsSchema`)
4. Validate each tip with `isHealthTipsSafe()`; drop unsafe tips
5. Cache in `ai_cache` (`cache_key: 'health_tips'`, stale after 24h)

### Output
- Return: `{ tips: [{ tip, area }] }`

---

## Skill 3 — Exhibit Relevance Ranker

**Route:** `GET /api/cases/[id]/exhibit-sets/suggest`
**Existing schema:** `src/lib/ai/exhibit-suggestions.ts` — ready, no changes needed

### Input
- Reads: `exhibit_sets` for case (one per case); `exhibits` (already designated, with `exhibit_no` and `title`); `evidence_items` not yet in `exhibits` for this set (up to 20)

### Processing
1. Build prompt with `buildExhibitSuggestionPrompt({ dispute_type, state, existing_exhibits, unexhibited_evidence })`
2. Call Claude (`claude-sonnet-4-6`, `temperature: 0.3`, `jsonMode: true`, `schema: exhibitSuggestionSchema`)
3. Validate with `isExhibitSuggestionSafe()`
4. No writes — return suggestions for user review

### Output
- Return: `{ suggestions: [{ evidence_id, suggested_title, reason }] }`
- If no exhibit set exists: return `{ suggestions: [], message: 'Create an exhibit set first' }`
- If no unexhibited evidence: return `{ suggestions: [] }`

---

## Skill 4 — Settlement Valuation Advisor

**Route:** `GET /api/cases/[id]/settlement-value`
**New module:** `src/lib/ai/settlement-valuation.ts`

### Schema
```typescript
export const settlementValuationSchema = z.object({
  low: z.number(),
  mid: z.number(),
  high: z.number(),
  currency: z.literal('USD'),
  factors: z.array(z.string()).min(1).max(6),
  batna: z.string(),
  watna: z.string(),
  disclaimer: z.string(),
})
```

### System prompt principles
- Plain English — no legal advice
- Outputs are illustrative ranges only, not legal guidance
- Always includes a disclaimer that ranges are for negotiation thinking only
- Never predicts court outcomes
- Blocked phrases: "you must", "I recommend", "guaranteed", "winning", "losing"

### Input
- Reads: `cases` (dispute_type, state, role, name, opposing_party); latest `case_risk_scores.overall_score`; `evidence_items` count; completed task count; upcoming `deadlines` count

### Processing
1. Build prompt from case context
2. Call Claude (`claude-haiku-4-5-20251001`, `temperature: 0.3`, `jsonMode: true`, `schema: settlementValuationSchema`)
3. Apply `applyProSeGuardrails()` on stringified output
4. Cache in `ai_cache` (`cache_key: 'settlement_value'`, stale after 48h)

### Output
- Return: `{ low, mid, high, currency, factors[], batna, watna, disclaimer }`

---

## Skill 5 — Full Motion Drafter

**Route:** `POST /api/cases/[id]/motions/[motionId]/draft`
**No new module** — orchestrates `buildBriefSectionPrompt` from existing `src/lib/ai/litigation-legal/brief-section.ts`

### Input body (Zod)
```typescript
z.object({ keyArgument: z.string().min(10).max(3000) })
```

### Processing
Reads: `motions.motion_type`, `motions.facts`, case context (cases, evidence_items, case_authorities)

Calls `buildBriefSectionPrompt` four times sequentially with `sectionType`:
1. `'introduction'`
2. `'statement_of_facts'`
3. `'argument'` (uses `keyArgument`)
4. `'conclusion'`

Each section uses Claude (`claude-opus-4-7`, `temperature: 0.3`, `maxTokens: 2000`). Output is assembled with section headings.

Applies `applyProSeGuardrails()` to the assembled draft.

### Output → DB
- Updates `motions.draft_text` with assembled draft
- Inserts into `documents` (`doc_type: 'full_motion'`, versioned)
- Returns: `{ draft, documentId, motionId }`

---

## Testing Plan

| Skill | Unit tests |
|---|---|
| Discovery Pack | prompt contains dispute_type/state/role; schema validation; numbered items by type; no blocked phrases |
| Health Tips | static fallback when no scores; AI path with valid scores; unsafe tip filtered; tip count 1-4 |
| Exhibit Ranker | prompt contains evidence IDs; empty evidence returns `[]`; no exhibit set handled; blocked phrases absent |
| Settlement | schema valid/invalid; `low < mid < high`; disclaimer present; blocked phrases absent |
| Full Motion | four sections assembled in order; each section in output; guardrails applied |
