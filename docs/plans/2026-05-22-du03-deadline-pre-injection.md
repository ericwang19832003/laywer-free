# du-03 Fix: Deadline Pre-Injection (Approach B) — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix du-03 deterministically by pre-calling `analyze_deadlines` in the agent node whenever the user's message is deadline-adjacent, and injecting the result into the system message before the LLM reasons.

**Architecture:** In the agent node of `graph.ts`, between building `contextSummary` and calling `llm.invoke`, detect deadline-adjacent questions with a regex, call the pre-built `analyze_deadlines` tool directly, and append its output to the system message. The LLM sees actual case deadline status (e.g., "Serve defendant: OVERDUE by 3 days") before forming a response — it can no longer answer from Texas procedural prior knowledge alone. Silent-fail if the pre-call throws, so the agent is never blocked.

**Tech Stack:** LangGraph.js, LangChain tools, GPT-4o

---

## Task 1: Add deadline pre-injection to the agent node

**Files:**
- Modify: `apps/web/src/lib/ai/agent/graph.ts` (lines 109–114)

**Current code (lines 109–114):**

```typescript
    const contextSummary =
      `Case context: ${state.caseContext.disputeType} case, ${state.caseContext.role} in ${state.caseContext.county} County.\n` +
      `Task completion score: ${state.caseContext.healthScore}/100 (task-completion only — NOT case strength). Evidence items uploaded: ${state.caseContext.evidenceCount} (raw upload count — DO NOT use this to assess sufficiency or strength; call review_evidence).\n` +
      `Tasks: ${state.caseContext.tasks.map((t) => `${t.title} (${t.status})`).join(', ')}.`

    const response = await llm.invoke([
      new SystemMessage(`${SYSTEM_PROMPT}\n\n${contextSummary}`),
      ...state.messages,
    ])
```

**Step 1: Replace with pre-injection block**

```typescript
    const contextSummary =
      `Case context: ${state.caseContext.disputeType} case, ${state.caseContext.role} in ${state.caseContext.county} County.\n` +
      `Task completion score: ${state.caseContext.healthScore}/100 (task-completion only — NOT case strength). Evidence items uploaded: ${state.caseContext.evidenceCount} (raw upload count — DO NOT use this to assess sufficiency or strength; call review_evidence).\n` +
      `Tasks: ${state.caseContext.tasks.map((t) => `${t.title} (${t.status})`).join(', ')}.`

    const lastMsg = state.messages[state.messages.length - 1]
    const msgText = typeof lastMsg?.content === 'string' ? lastMsg.content : ''
    const isDeadlineQuestion =
      /deadline|days?\s+(left|remaining)|serve|service|overdue|by\s+when|how\s+long|how\s+many\s+days|am\s+i\s+behind|filing/i.test(
        msgText
      )

    let deadlineContext = ''
    if (isDeadlineQuestion && state.caseContext.deadlines.length > 0) {
      try {
        const deadlineTool = tools.find((t) => t.name === 'analyze_deadlines')!
        deadlineContext = `\n\nCurrent case deadline status:\n${String(await deadlineTool.invoke({}))}`
      } catch {
        // silent fail — agent proceeds without pre-injection
      }
    }

    const response = await llm.invoke([
      new SystemMessage(`${SYSTEM_PROMPT}\n\n${contextSummary}${deadlineContext}`),
      ...state.messages,
    ])
```

**Why this works:**
- `analyze_deadlines` takes `{}` and returns a formatted string like `• Serve defendant: OVERDUE by 3 days (2026-05-19)`
- The LLM sees `Current case deadline status: • Serve defendant: OVERDUE by 3 days` BEFORE it reasons, making prior-knowledge answers impossible
- The regex is broad enough to catch du-03 ("how many days do I have left to serve the defendant") and similar variants
- `tools` is already built on line 103 — no duplication

**Step 2: TypeScript check**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npx tsc --noEmit 2>&1 | grep "graph.ts" | head -5
```

Expected: no output (no errors).

**Step 3: Self-review checklist**
- Pre-injection only fires when `isDeadlineQuestion && deadlines.length > 0` — safe for cases with no deadlines
- Silent catch means any tool error is swallowed — agent is never blocked
- `deadlineContext` appended to system message, not inserted as a fake message — no message-array side effects
- `toolCallCount` is NOT incremented — this is a deterministic pre-fetch, not an agent tool call

---

## Task 2: Re-run evals to verify improvement

**Step 1: Run evals**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npm run eval 2>&1
```

Expected — du-03 now passes because the agent sees `Serve defendant: OVERDUE by 3 days` in context and cannot answer "you have 90 days left":

```
=== Eval Results ===
  ✓ deadline_urgency    : 5/5 passed
  ✓ evidence_strength   : 5/5 passed  (may vary — pre-injection only targets deadlines)
  ✓ legal_research      : 5/5 passed
  ✓ document_drafting   : 5/5 passed

Overall: ≥19/20 (≥95%)  — PASS
```

If du-03 still fails despite the pre-injection:
- Check that `deadlineContext` is non-empty: add a temporary `console.log(deadlineContext)` before `llm.invoke` and re-run one eval case manually
- Verify the regex matches "how many days do I have left to serve the defendant" — it should match on "days" + "serve"

If other deadline cases regress (du-01, du-02, du-04):
- The pre-injection adds redundant data for cases where the agent would already call the tool — this is harmless but double-check the judge isn't penalizing for it
