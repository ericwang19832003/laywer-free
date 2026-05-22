# LangGraph Agent Testing Design

**Date:** 2026-05-22  
**Status:** Approved  
**Scope:** Three-layer test suite for the LangGraph Case Strategy Agent — unit, integration, and LLM evals. Run on demand, not in CI.

---

## Problem

The agent has 18 mocked unit tests that catch logic regressions, but no tests that verify:
- The agent routes to the correct tools for a given question
- The live LLM + real Supabase DB wire together correctly
- Agent responses are legally relevant and high quality

---

## Solution

Three test layers run manually via npm scripts. No CI scheduling.

```
npm run test:unit          # 30s  — mocked, no API key needed
npm run test:integration   # 2min — hits real GPT-4o-mini + Supabase test DB
npm run eval               # 5min — LLM-as-judge scores 20 golden Q&A pairs
```

---

## Architecture

### Folder Structure

```
apps/web/src/lib/ai/agent/
  __tests__/                    ← existing unit tests (18 passing)
  integration/
    setup.ts                    ← seed/teardown test case in Supabase test DB
    agent-flow.test.ts          ← 5 golden scenario integration tests
    tool-routing.test.ts        ← tool selection assertions
  evals/
    dataset.ts                  ← 20 golden Q&A pairs with rubrics
    judge.ts                    ← GPT-4o LLM-as-judge scorer
    run-evals.ts                ← eval runner, prints score report
```

### New Config Files

```
apps/web/vitest.integration.config.ts   ← separate vitest config for live tests
```

### New package.json Scripts

```json
"test:unit":        "vitest run",
"test:integration": "vitest run --config vitest.integration.config.ts",
"eval":             "tsx src/lib/ai/agent/evals/run-evals.ts"
```

### Required Env Vars

```
OPENAI_API_KEY              # already exists in project
SUPABASE_TEST_URL           # new — separate test Supabase project URL
SUPABASE_TEST_SERVICE_KEY   # new — test project service role key
```

---

## Layer 1: Unit Tests (expand existing)

Already have 18 passing. Expand with edge cases per tool — no changes to architecture needed.

---

## Layer 2: Integration Tests

### Test DB Setup

Each test seeds a realistic case in a separate Supabase test project:
- `landlord_tenant` dispute, plaintiff, Travis County
- 2 overdue deadlines + 1 urgent (3 days)
- 3 evidence items
- 5 tasks (mix of todo/completed)

Torn down after each test via `afterEach`.

### 5 Golden Scenarios

| Test | User Question | Expected Tools | Pass Criteria |
|------|-------------|----------------|---------------|
| `deadline-urgency` | "What deadlines am I at risk of missing?" | `analyze_deadlines` | Response mentions overdue/urgent items |
| `evidence-gap` | "How strong is my case?" | `review_evidence` | Includes strength label + evidence gaps |
| `case-law-lookup` | "What does Texas law say about security deposits?" | `search_case_law` | Includes ≥1 citation |
| `document-draft` | "Draft a demand letter for my landlord" | `draft_document` | Contains letter content + saved draft ID |
| `multi-tool` | "What's my strongest argument and what should I do first?" | `search_case_law` + `analyze_deadlines` | Agent calls ≥2 tools before final answer |

### Tool Routing Assertion Pattern

```typescript
const toolsCalled: string[] = []
for await (const [msg] of stream) {
  if ((msg as any)?.tool_calls?.length) {
    toolsCalled.push(...(msg as any).tool_calls.map((c: any) => c.name))
  }
}
expect(toolsCalled).toContain('analyze_deadlines')
```

---

## Layer 3: Eval Framework

### Golden Dataset — 20 Q&A Pairs (4 categories × 5 cases)

| Category | # Cases | Example Question |
|----------|---------|-----------------|
| Deadline urgency | 5 | "Am I behind on anything?" |
| Evidence strength | 5 | "Do I have enough proof?" |
| Legal research | 5 | "What's the Texas rule on notice to vacate?" |
| Document drafting | 5 | "Write a motion to compel discovery" |

### LLM-as-Judge Scorer

Uses GPT-4o (more capable than the agent's gpt-4o-mini) as judge:

```typescript
const judgePrompt = `
  Question: ${question}
  Agent response: ${agentResponse}
  Rubric: ${rubric}
  Score 0-2. Respond with JSON: { score: number, reason: string }
`
```

### Scoring Rubrics Per Category

- **Deadline urgency:** Mentions correct overdue items (1pt) + prioritizes correctly (1pt)
- **Evidence strength:** Accurate strength label (1pt) + identifies specific gaps (1pt)  
- **Legal research:** Includes citation (1pt) + citation is relevant to question (1pt)
- **Document drafting:** Legally coherent (1pt) + correct format with headings/signatures (1pt)

### Score Report Output

```
=== Eval Results ===
deadline_urgency:   4/5 passed  (avg score: 1.8/2)
evidence_strength:  5/5 passed  (avg score: 1.9/2)
legal_research:     3/5 passed  (avg score: 1.4/2)
document_drafting:  4/5 passed  (avg score: 1.7/2)

Overall: 16/20 (80%)  — PASS threshold: 70%
```

**Pass threshold:** 70% overall (14/20). Below threshold = prompts or tools need tuning.

---

## Success Criteria

- `npm run test:unit` — 18+ tests passing, <30s
- `npm run test:integration` — 5/5 scenarios passing against real LLM + test DB
- `npm run eval` — ≥70% overall score (14/20), with per-category breakdown
- No prod data touched — all integration/eval tests use `SUPABASE_TEST_URL`
