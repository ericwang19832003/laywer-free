# AutoResearch Skill Design

**Date:** 2026-04-06
**Status:** Approved
**Inspired by:** [Andrej Karpathy's AutoResearch](https://github.com/karpathy/autoresearch) — autonomous propose-evaluate-keep/discard loops

## Overview

An autonomous Karpathy-style loop that proposes, implements, evaluates, and keeps/discards improvements to the Lawyer Free codebase — accumulating approved changes on a feature branch for morning review.

**Invocation:** `/autoresearch` (2 hours default) or `/autoresearch 30m` / `/autoresearch 1h`

## Architecture: Orchestrator + Worker Agents

```
┌─────────────────────────────────────────────────────┐
│                   ORCHESTRATOR                       │
│                                                      │
│  1. Create branch: autoresearch/YYYY-MM-DD-run-N     │
│  2. Scan repo → build improvement candidates list    │
│  3. While time remaining:                            │
│     a. Pick highest-impact candidate                 │
│     b. Spawn worker agent (research/implement)       │
│     c. Worker returns result                         │
│     d. Run evaluation gate:                          │
│        - tsc --noEmit (type check)                   │
│        - turbo build (build check)                   │
│        - Spawn review agent (score 1-10)             │
│     e. If score >= 7 AND build passes:               │
│        - git add + commit with descriptive message   │
│        - Log: ✓ kept (iteration N, score X)          │
│     f. Else:                                         │
│        - git checkout -- . (discard)                 │
│        - Log: ✗ discarded (reason)                   │
│     g. Update memory: what worked, what didn't       │
│  4. Push branch, print summary report                │
└─────────────────────────────────────────────────────┘
```

### Key parameters

- **Time box:** 2 hours default, configurable via argument
- **Iteration budget:** ~3-5 minutes per iteration, expect 25-40 iterations in 2 hours
- **Branch naming:** `autoresearch/YYYY-MM-DD-run-N`
- **Memory file:** `/tmp/autoresearch-memory.md` — persists across runs to avoid re-trying failed approaches

## Candidate Types & Priority

Ranked by impact (highest first):

### Priority 1 — State Expansion

Detect states referenced in `cases.state` that lack state-specific configs. Worker researches state laws online, generates config following existing patterns, builds, reviews.

### Priority 2 — Missing Edge Cases

Analyze existing configs for gaps: missing cross-references between steps, questions that don't capture data needed by later steps, incomplete showIf branching.

### Priority 3 — Legal Accuracy

Web search to verify statute citations in existing configs. Update stale or amended citations.

### Priority 4 — Code Quality

Pattern consistency, DRY improvements, summary generator robustness, showIf callback correctness.

### Candidate generation

- Orchestrator runs a scan agent at startup that reads the repo structure, lists all guided-step configs by state/dispute-type, and produces a ranked candidate list
- List written to memory file and updated each iteration
- Completed candidates marked done; failed ones marked with failure reason

## Worker Agent Types

### Research Worker

- **Input:** State + dispute type + topic (e.g. "New Jersey debt collection SOL")
- **Tools:** WebSearch, WebFetch
- **Output:** Structured findings in markdown (statutes, deadlines, court rules, citations)
- **Time budget:** ~5 minutes max
- **Web search cap:** 5 queries per worker

### Implementation Worker

- **Input:** Research findings (or refactoring instructions) + existing config to use as template
- **Tools:** Read, Write, Glob, Grep
- **Output:** New or modified config file(s)
- **Time budget:** ~3 minutes max

### Review Worker

- **Input:** Git diff of changes
- **Tools:** Read, Grep, Bash (build/type-check)
- **Scoring rubric (1-10):**
  - Legal accuracy (3 pts): Statute citations real? Deadlines correct?
  - Pattern consistency (3 pts): Matches existing configs? Same question types, summary format, export naming?
  - Completeness (2 pts): Key state-specific features covered?
  - Code quality (2 pts): Types correct? showIf logic sound?
- **Threshold:** >= 7 to keep, < 7 to discard
- **Output:** Score + 1-line rationale

### Typical iteration flows

| Category | Workers spawned | Time |
|----------|----------------|------|
| State expansion | Research → Implementation → Review | ~8-10 min |
| Code quality fix | Implementation → Review | ~4-5 min |
| Legal verification | Research → (maybe) Implementation → Review | ~5-8 min |

## Summary Report

When the timer expires, the orchestrator pushes the branch and prints:

```
═══════════════════════════════════════════════
  AutoResearch Run Complete
  Branch: autoresearch/2026-04-06-run-1
  Duration: 2h 00m | Iterations: 32
═══════════════════════════════════════════════

  Kept: 22 changes    Discarded: 10 changes

  By category:
    State expansion:    8 kept / 2 discarded
    Missing edge cases: 6 kept / 3 discarded
    Legal accuracy:     5 kept / 1 discarded
    Code quality:       3 kept / 4 discarded

  Notable additions:
    + New Jersey debt defense (5 configs)
    + Fixed stale CCP §339 citation in debt-sol-check-ca.ts
    + Added medical malpractice pre-suit to FL petition flow
    + Extracted shared damages-counter helper

  Failed attempts (top 3):
    ✗ Ohio PI intake — build failed (missing type export)
    ✗ CA discovery config refactor — review score 4/10
    ✗ NY med mal certificate — duplicate of existing question

  Next run suggestions:
    → Ohio PI needs type export fix first
    → Consider splitting CA discovery into sub-steps
═══════════════════════════════════════════════
```

- Summary printed to terminal AND saved to `docs/autoresearch/YYYY-MM-DD-run-N.md`
- Memory file persists between runs
- "Next run suggestions" feeds into the next session's candidate list

## Guardrails & Safety

### Cannot do

- Never push to `main` — only its own feature branch
- Never modify protected files: `package.json`, `package-lock.json`, `CLAUDE.md`, `supabase/config.toml`
- Never delete existing configs — only add new or edit existing
- Never modify already-applied database migrations — only create new ones
- Never modify step router imports without a corresponding config that type-checks
- Maximum 3 consecutive retries on the same candidate before moving on

### Circuit breakers

- 5 consecutive discards → pause, re-scan repo, regenerate candidates from scratch
- Build broken on unchanged files → stop immediately, report pre-existing issue
- Git operation failure (merge conflict, detached HEAD) → stop, preserve branch as-is

### Scope limits per iteration

- Maximum 3 files changed per iteration
- Maximum 1 new state per iteration
- Web search capped at 5 queries per research worker
