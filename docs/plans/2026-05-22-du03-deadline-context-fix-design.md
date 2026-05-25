# du-03 Fix: Deadline Labels in Context — Design Doc

**Date:** 2026-05-22
**Status:** Approved
**Scope:** Fix du-03 eval failure by exposing deadline labels (not dates) in the agent context summary. One-line change in graph.ts.

---

## Problem

du-03 — "How many days do I have left to serve the defendant?" — fails consistently. GPT-4o answers from Texas procedural prior knowledge ("you typically have 90 days under TRCP Rule 99") instead of calling `analyze_deadlines`. The actual case deadline is 3 days **overdue**, so the generic answer is actively misleading.

The root cause is a context gap: the context summary contains zero case-specific deadline information. The model has no reason to believe a specific deadline record exists — so it defaults to general legal knowledge.

Prompt grounding rules ("FORBIDDEN", "No exceptions") have not resolved this because the model's confidence in Texas service rules is high enough to override instruction-following.

## Solution

Add one line to the `contextSummary` in `graph.ts` that lists the *labels* of tracked deadlines — without dates. The model sees that "Serve defendant" is a real named record in this case, creating an information gap that motivates a tool call:

```
Deadlines on file: Serve defendant, Send discovery
(exact due dates and days remaining → call analyze_deadlines)
```

Uses `d.label` (human-readable) rather than `d.key` so it matches natural language in user questions ("serve the defendant" ≈ "Serve defendant").

## Files Changed

- `apps/web/src/lib/ai/agent/graph.ts` — context summary only

## Success Criteria

- du-03 passes: model calls `analyze_deadlines` and surfaces the overdue status
- No regression in the other 19 eval cases
- `deadline_urgency` reaches 5/5

## Fallback

If this still fails under eval variance, fall back to Approach B: pre-call `analyze_deadlines` deterministically in the agent node for deadline-adjacent questions and inject the result as context before the LLM call.
