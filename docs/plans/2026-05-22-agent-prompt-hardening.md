# Agent Prompt Hardening — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix 3 failing eval cases (du-03, es-03, dd-03) by hardening the system prompt and tool descriptions so the agent reliably calls the right tool instead of answering from context or asking for more input.

**Architecture:** Two layers of changes — belt-and-suspenders. Layer 1: append grounding rules to the system prompt in `graph.ts`. Layer 2: strengthen the `description` field in three tool files. No logic, schema, or infrastructure changes.

**Tech Stack:** LangGraph.js, LangChain tool descriptions, GPT-4o-mini (agent routing)

---

## Task 1: Harden the system prompt

**Files:**
- Modify: `apps/web/src/lib/ai/agent/graph.ts` (lines 13–17)

**Current `SYSTEM_PROMPT` (lines 13–17):**

```typescript
const SYSTEM_PROMPT = `You are a knowledgeable legal assistant helping a pro se litigant navigate Texas civil court.
You have access to tools to search case law, analyze deadlines, review evidence, and draft documents.
Always ground your advice in the user's specific case context. Be warm, clear, and encouraging.
Scope all advice to Texas civil procedure. For high-stakes decisions, recommend consulting a licensed attorney.
This is general legal information — not legal advice.`
```

**Step 1: Replace SYSTEM_PROMPT with hardened version**

Replace the block above with:

```typescript
const SYSTEM_PROMPT = `You are a knowledgeable legal assistant helping a pro se litigant navigate Texas civil court.
You have access to tools to search case law, analyze deadlines, review evidence, and draft documents.
Always ground your advice in the user's specific case context. Be warm, clear, and encouraging.
Scope all advice to Texas civil procedure. For high-stakes decisions, recommend consulting a licensed attorney.
This is general legal information — not legal advice.

Tool grounding rules — follow strictly:
- For any question about deadlines, days remaining, filing status, or what is overdue: ALWAYS call analyze_deadlines. Never answer deadline questions from memory or context summary.
- For any question about case strength, evidence quality, or what evidence to gather: ALWAYS call review_evidence. The health score in context is not a substitute — call the tool.
- For any document drafting request (letter, motion, notice, interrogatories): call draft_document immediately using reasonable assumptions. Do not ask for more context before drafting — draft first, offer to refine after.`
```

**Step 2: Verify TypeScript**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npx tsc --noEmit 2>&1 | grep "graph.ts" | head -5
```
Expected: no output (no errors).

**Step 3: Commit**

```bash
cd "/Users/minwang/lawyer free" && git add apps/web/src/lib/ai/agent/graph.ts && git commit -m "fix: add tool grounding rules to agent system prompt"
```

---

## Task 2: Harden the analyze_deadlines tool description

**Files:**
- Modify: `apps/web/src/lib/ai/agent/tools/analyze-deadlines.ts` (line 34–35)

**Current description (lines 34–35):**
```typescript
      description:
        'Analyze the case deadlines to identify what is overdue or urgent. Use when the user asks about timing, what to do next, or whether they are behind.',
```

**Step 1: Replace description**

```typescript
      description:
        'Analyze the case deadlines to identify what is overdue or urgent. Use when the user asks about timing, what to do next, or whether they are behind. Also call for any question naming a specific deadline (e.g., "serve the defendant", "file an answer", "how many days") — do not answer deadline questions from prior knowledge.',
```

**Step 2: Run existing unit tests to verify nothing broke**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npx vitest run src/lib/ai/agent/tools/__tests__/analyze-deadlines.test.ts 2>&1 | tail -8
```
Expected: 5/5 passing.

**Step 3: Commit**

```bash
cd "/Users/minwang/lawyer free" && git add apps/web/src/lib/ai/agent/tools/analyze-deadlines.ts && git commit -m "fix: strengthen analyze_deadlines tool description to force tool use for specific deadline questions"
```

---

## Task 3: Harden the review_evidence tool description

**Files:**
- Modify: `apps/web/src/lib/ai/agent/tools/review-evidence.ts` (line 36–37)

**Current description (lines 36–37):**
```typescript
      description:
        'Review the evidence vault to assess case strength and identify gaps. Use when the user asks how strong their case is or what evidence they should gather.',
```

**Step 1: Replace description**

```typescript
      description:
        'Review the evidence vault to assess case strength and identify gaps. Use when the user asks how strong their case is or what evidence they should gather. Call for any strength question — the health score in the context summary is not a substitute for this tool.',
```

**Step 2: Run existing unit tests to verify nothing broke**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npx vitest run src/lib/ai/agent/tools/__tests__/review-evidence.test.ts 2>&1 | tail -8
```
Expected: 6/6 passing.

**Step 3: Commit**

```bash
cd "/Users/minwang/lawyer free" && git add apps/web/src/lib/ai/agent/tools/review-evidence.ts && git commit -m "fix: strengthen review_evidence tool description to prevent health-score shortcut"
```

---

## Task 4: Harden the draft_document tool description

**Files:**
- Modify: `apps/web/src/lib/ai/agent/tools/draft-document.ts` (line 39–40)

**Current description (lines 39–40):**
```typescript
      description:
        'Draft a legal document such as a demand letter, motion, or discovery request. Saves to the case draft versions. Use when the user asks to generate or write a document.',
```

**Step 1: Replace description**

```typescript
      description:
        'Draft a legal document such as a demand letter, motion, or discovery request. Saves to the case draft versions. Use when the user asks to generate or write a document. Call immediately without asking for more context — infer the documentType from the request and use the case context as instructions if the user does not provide specifics. Draft first, offer to refine after.',
```

**Step 2: Run existing unit tests to verify nothing broke**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npx vitest run src/lib/ai/agent/tools/__tests__/draft-document.test.ts 2>&1 | tail -8
```
Expected: 2/2 passing.

**Step 3: Commit**

```bash
cd "/Users/minwang/lawyer free" && git add apps/web/src/lib/ai/agent/tools/draft-document.ts && git commit -m "fix: strengthen draft_document description to draft immediately without asking for context"
```

---

## Task 5: Re-run evals to verify improvement

**Step 1: Run evals**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npm run eval 2>&1
```

Expected output shape:
```
=== Eval Results ===
  deadline_urgency    : 5/5 passed  (avg score: ...)
  evidence_strength   : 5/5 passed  (avg score: ...)
  legal_research      : 5/5 passed  (avg score: ...)
  document_drafting   : 4/5 passed  (avg score: ...)

Overall: ≥19/20 (≥95%)  — PASS
```

If any of the three target cases (du-03, es-03, dd-03) still fail, re-read the eval output carefully:
- If the agent still skips the tool: the description isn't triggering — make the language even more forceful ("MUST call", "required for any question about...")
- If the agent calls the tool but the response is still poor: the tool output itself needs improvement (out of scope for this plan)

**Step 2: Commit final result**

```bash
cd "/Users/minwang/lawyer free" && git add . && git commit -m "test: verified eval improvement after prompt hardening"
```
