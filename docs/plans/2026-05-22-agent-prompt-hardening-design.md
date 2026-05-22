# Agent Prompt Hardening — Design Doc

**Date:** 2026-05-22  
**Status:** Approved  
**Scope:** Fix 3 failing eval cases by hardening the system prompt and tool descriptions. No architecture changes.

---

## Problem

Three eval cases fail (17/20 → target 20/20):

| ID | Question | Failure |
|----|----------|---------|
| du-03 | "How many days do I have left to serve the defendant?" | Agent answered from general knowledge instead of calling `analyze_deadlines` |
| es-03 | "How strong is my case right now?" | Agent used health score from context summary instead of calling `review_evidence` |
| dd-03 | "Help me draft a motion to compel my landlord to respond to discovery." | Agent asked for more context instead of drafting immediately |

## Root Cause

- **du-03 / es-03**: Tool descriptions use soft "use when..." language. The agent treats context summary data (health score, general legal knowledge) as sufficient and skips tool calls.
- **dd-03**: `draft_document` requires `instructions` in its schema. Without specific instructions in the question, the agent asks for clarification rather than drafting with reasonable assumptions.

## Solution

Two layers of hardening — belt-and-suspenders:

### Layer 1: System prompt grounding rules (graph.ts)

Append to `SYSTEM_PROMPT`:

```
Tool grounding rules — follow strictly:
- For any question about deadlines, days remaining, filing status, or what is overdue: ALWAYS call analyze_deadlines. Never answer deadline questions from memory or context summary.
- For any question about case strength, evidence quality, or what evidence to gather: ALWAYS call review_evidence. The health score in context is not a substitute — call the tool.
- For any document drafting request (letter, motion, notice, interrogatories): call draft_document immediately using reasonable assumptions. Do not ask for more context before drafting — draft first, offer to refine after.
```

### Layer 2: Tool description updates

| Tool | Addition |
|------|----------|
| `analyze_deadlines` | Add: "Also call for any question naming a specific deadline (e.g., 'serve the defendant', 'file an answer') — do not answer from prior knowledge." |
| `review_evidence` | Add: "Call for any strength question — the context health score is not a substitute." |
| `draft_document` | Add: "Call immediately without asking for more context. Infer documentType and use the case context as instructions if the user does not specify." |

## Files Changed

- `apps/web/src/lib/ai/agent/graph.ts` — system prompt
- `apps/web/src/lib/ai/agent/tools/analyze-deadlines.ts` — tool description
- `apps/web/src/lib/ai/agent/tools/review-evidence.ts` — tool description
- `apps/web/src/lib/ai/agent/tools/draft-document.ts` — tool description

## Success Criteria

- `npm run eval` scores ≥ 19/20 (was 17/20)
- Existing 24 unit tests still pass
- No regression in other eval categories
