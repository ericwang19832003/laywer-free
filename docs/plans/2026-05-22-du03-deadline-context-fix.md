# du-03 Deadline Context Fix — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix du-03 ("How many days do I have left to serve the defendant?") by adding tracked deadline labels to the context summary so the model has an information gap that motivates calling analyze_deadlines.

**Architecture:** One-line addition to `contextSummary` in `graph.ts`. Lists each deadline's human-readable label (not the due date) with an explicit pointer to the tool. The model sees a named record exists but doesn't know the date — forcing a tool call to answer correctly.

**Tech Stack:** LangGraph.js, GPT-4o, LangChain tool routing

---

## Task 1: Add deadline labels to context summary

**Files:**
- Modify: `apps/web/src/lib/ai/agent/graph.ts` (lines 106–109)

**Current code (lines 106–109):**

```typescript
const contextSummary =
  `Case context: ${state.caseContext.disputeType} case, ${state.caseContext.role} in ${state.caseContext.county} County.\n` +
  `Task completion score: ${state.caseContext.healthScore}/100 (task-completion only — NOT case strength). Evidence items uploaded: ${state.caseContext.evidenceCount} (raw upload count — DO NOT use this to assess sufficiency or strength; call review_evidence).\n` +
  `Tasks: ${state.caseContext.tasks.map((t) => `${t.title} (${t.status})`).join(', ')}.`
```

**Step 1: Apply the change**

Replace the block above with:

```typescript
const contextSummary =
  `Case context: ${state.caseContext.disputeType} case, ${state.caseContext.role} in ${state.caseContext.county} County.\n` +
  `Task completion score: ${state.caseContext.healthScore}/100 (task-completion only — NOT case strength). Evidence items uploaded: ${state.caseContext.evidenceCount} (raw upload count — DO NOT use this to assess sufficiency or strength; call review_evidence).\n` +
  `Deadlines on file: ${state.caseContext.deadlines.map((d) => d.label).join(', ')} (exact due dates and days remaining → call analyze_deadlines).\n` +
  `Tasks: ${state.caseContext.tasks.map((t) => `${t.title} (${t.status})`).join(', ')}.`
```

**Why `d.label` not `d.key`:** Labels ("Serve defendant") match natural language in user questions; keys ("serve_defendant") do not.

**Step 2: TypeScript check**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npx tsc --noEmit 2>&1 | grep "graph.ts" | head -5
```

Expected: no output (no errors).

**Step 3: Commit**

```bash
cd "/Users/minwang/lawyer free" && git add apps/web/src/lib/ai/agent/graph.ts && git commit -m "fix: add deadline labels to context summary to motivate analyze_deadlines calls"
```

---

## Task 2: Re-run evals to verify 20/20

**Step 1: Run evals**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npm run eval 2>&1
```

Expected output shape:
```
=== Eval Results ===
  ✓ deadline_urgency    : 5/5 passed  (avg score: ...)
  ✓ evidence_strength   : 5/5 passed  (avg score: ...)
  ✓ legal_research      : 5/5 passed  (avg score: ...)
  ✓ document_drafting   : 5/5 passed  (avg score: ...)

Overall: 20/20 (100%)  — PASS
```

If du-03 still fails (agent answers from Texas procedural knowledge instead of calling the tool):
- The information gap wasn't enough — fall back to Approach B: pre-call `analyze_deadlines` deterministically in the agent node for deadline-adjacent questions and inject the result as context before the LLM call. This is a more significant architecture change and should be planned separately.

**Step 2: Commit result**

```bash
cd "/Users/minwang/lawyer free" && git add . && git commit -m "test: verified 20/20 eval pass after deadline context fix"
```
