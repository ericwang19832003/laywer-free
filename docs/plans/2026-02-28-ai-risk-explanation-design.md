# AI Risk Explanation Generator

**Date:** 2026-02-28
**Status:** Approved

## Purpose

Generate a plain-language, AI-powered explanation of a case's risk score. The explanation helps self-represented litigants understand what their risk score means without giving legal advice.

## Route

`POST /api/cases/[id]/risk/explain`

## Flow

```
Auth → Load latest case_risk_scores → Build prompt → Call OpenAI
  ├─ Success → Zod validate + safety check → Update breakdown → Return
  └─ Failure → Static fallback → Update breakdown → Return
```

## AI Output Schema

```json
{
  "summary": "Short paragraph explaining risk posture",
  "focus_areas": ["area1", "area2"],
  "tone": "calm"
}
```

## System Prompt Constraints

- No legal advice or strategy
- No mention of winning or losing
- No directives ("file a motion", "you must", "you should")
- No scary language ("URGENT", "WARNING", "OVERDUE")
- Calm, supportive, informational tone only

## Safety Validation

1. Zod schema validates JSON structure
2. Extended safety check against forbidden phrases (BLOCKED_PHRASES + UX guide terms)
3. If safety fails, use static fallback instead

## Static Fallback

Pure function `buildStaticExplanation(riskScore)`:
- Maps risk level to canned summary
- Extracts focus areas from breakdown items sorted by points desc
- Always returns valid `{ summary, focus_areas, tone: "calm" }`

## Storage

Updates existing `case_risk_scores.breakdown` JSONB:
```json
{
  "ai_explanation": { "summary": "...", "focus_areas": [...], "tone": "calm" },
  "_meta": { "model": "gpt-4o-mini", "prompt_version": "1.0.0", "source": "ai|static" }
}
```

## Files

| File | Purpose |
|------|---------|
| `src/lib/schemas/ai-risk-explanation.ts` | Zod schemas for AI output |
| `src/lib/risk/explain.ts` | Safety check, static fallback, prompt builder |
| `src/app/api/cases/[id]/risk/explain/route.ts` | API route |
| `tests/unit/risk/explain.test.ts` | Unit tests for safety + fallback |
