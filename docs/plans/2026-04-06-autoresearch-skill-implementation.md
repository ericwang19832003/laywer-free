# AutoResearch Skill Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Claude Code skill that runs a Karpathy-style autonomous improvement loop — proposing, implementing, evaluating, and keeping/discarding codebase changes on a feature branch.

**Architecture:** Single SKILL.md file that orchestrates the loop using the Agent tool to spawn Research, Implementation, and Review workers. The orchestrator maintains a memory file for cross-iteration learning. All approved changes accumulate on one feature branch.

**Tech Stack:** Claude Code skill (SKILL.md), Agent tool (subagents), Bash (git, tsc, turbo), WebSearch (legal research), existing GuidedStepConfig TypeScript pattern.

---

### Task 1: Create the skill directory and SKILL.md frontmatter

**Files:**
- Create: `/Users/minwang/.claude/skills/autoresearch/SKILL.md`

**Step 1: Create directory**

```bash
mkdir -p /Users/minwang/.claude/skills/autoresearch
```

**Step 2: Write the SKILL.md frontmatter and overview section**

```markdown
---
name: autoresearch
description: |
  Karpathy-style autonomous improvement loop. Proposes, implements, evaluates,
  and keeps/discards codebase changes on a feature branch. Use when asked to
  "run autoresearch", "auto research", "autonomous improvement", or
  "improve the codebase overnight".
---

# AutoResearch

## Overview

Autonomous codebase improvement loop inspired by Andrej Karpathy's AutoResearch.
Proposes changes, implements them, evaluates via build + review, keeps good ones,
discards bad ones. Accumulates approved changes on a single feature branch for
human review.

**Announce at start:** "Starting AutoResearch loop..."

## When to Use

- User says "run autoresearch", "/autoresearch", "auto research"
- User wants autonomous codebase improvement
- User wants to expand state coverage, fix edge cases, or verify legal accuracy

## Arguments

- Duration: `/autoresearch 30m`, `/autoresearch 1h`, `/autoresearch 2h` (default: 2h)
- Parse the argument to extract duration in minutes. Default to 120 if not provided.
```

**Step 3: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add /Users/minwang/.claude/skills/autoresearch/SKILL.md
git commit -m "feat: create autoresearch skill skeleton"
```

---

### Task 2: Write the Setup Phase (branch creation + memory loading)

**Files:**
- Modify: `/Users/minwang/.claude/skills/autoresearch/SKILL.md`

**Step 1: Add the Setup Phase section to SKILL.md**

Append after the Arguments section:

```markdown
## Phase 0: Setup

1. Parse the duration argument. Default to 120 minutes.
2. Record the start time:

\```bash
AUTORESEARCH_START=$(date +%s)
AUTORESEARCH_DURATION_MINUTES=120  # or parsed from argument
AUTORESEARCH_END=$((AUTORESEARCH_START + AUTORESEARCH_DURATION_MINUTES * 60))
echo "AutoResearch will run until $(date -r $AUTORESEARCH_END '+%H:%M:%S')"
\```

3. Create the feature branch:

\```bash
cd "/Users/minwang/lawyer free"
RUN_DATE=$(date +%Y-%m-%d)
# Find next run number
RUN_NUM=1
while git rev-parse --verify "autoresearch/${RUN_DATE}-run-${RUN_NUM}" >/dev/null 2>&1; do
  RUN_NUM=$((RUN_NUM + 1))
done
BRANCH_NAME="autoresearch/${RUN_DATE}-run-${RUN_NUM}"
git checkout -b "$BRANCH_NAME"
echo "Created branch: $BRANCH_NAME"
\```

4. Load or create memory file:

\```bash
MEMORY_FILE="/tmp/autoresearch-memory.md"
if [ -f "$MEMORY_FILE" ]; then
  echo "Loaded existing memory from previous run"
else
  cat > "$MEMORY_FILE" << 'MEMO'
# AutoResearch Memory

## Tried Ideas
(none yet)

## Successful Patterns
(none yet)

## Failed Approaches
(none yet)

## Candidate Queue
(not yet scanned)
MEMO
  echo "Created fresh memory file"
fi
\```

5. Verify the build passes on the current branch before starting:

\```bash
cd "/Users/minwang/lawyer free"
npx tsc --noEmit --project packages/shared/tsconfig.json 2>&1 | grep -c "error TS" || echo "0"
\```

If there are NEW errors (compared to main), stop and report the pre-existing issue.
Note: some pre-existing module resolution errors are expected — count them and use as baseline.
```

**Step 2: Commit**

```bash
git add /Users/minwang/.claude/skills/autoresearch/SKILL.md
git commit -m "feat: add autoresearch setup phase"
```

---

### Task 3: Write the Scan Phase (candidate generation)

**Files:**
- Modify: `/Users/minwang/.claude/skills/autoresearch/SKILL.md`

**Step 1: Add the Scan Phase section**

```markdown
## Phase 1: Scan & Generate Candidates

Spawn a **Scan Agent** (subagent_type: Explore) to analyze the repo and produce a ranked candidate list.

**Scan Agent prompt template:**

> Analyze the Lawyer Free project at "/Users/minwang/lawyer free" and produce a ranked list of improvement candidates.
>
> Scan these directories:
> - `packages/shared/src/guided-steps/` — all guided step configs by dispute type and state
> - `packages/shared/src/rules/deadline-rules.ts` — deadline rules by state
> - `apps/web/src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx` — step router
>
> For each dispute type (personal_injury, debt_collection, landlord_tenant, etc.):
> 1. List which states have state-specific configs
> 2. List which states are missing configs
> 3. Note any configs with potential issues (missing showIf handlers, incomplete summaries)
>
> Produce output as a markdown list ranked by priority:
> - P1 (state expansion): "[dispute_type] [state] — missing [config_type]"
> - P2 (edge cases): "[file] — [description of gap]"
> - P3 (legal accuracy): "[file] — [statute to verify]"
> - P4 (code quality): "[file] — [description of improvement]"

After the scan agent returns, write the candidate list to the memory file.

**Reading the memory file:**

Before each iteration, read the memory file to check:
- Which candidates have been completed (skip them)
- Which candidates failed (skip unless failure was transient)
- What patterns have been successful (prefer similar approaches)
```

**Step 2: Commit**

```bash
git add /Users/minwang/.claude/skills/autoresearch/SKILL.md
git commit -m "feat: add autoresearch scan phase"
```

---

### Task 4: Write the Main Loop (iterate, spawn workers, evaluate)

**Files:**
- Modify: `/Users/minwang/.claude/skills/autoresearch/SKILL.md`

**Step 1: Add the Main Loop section**

```markdown
## Phase 2: Main Loop

Repeat until time expires:

### Step A: Check Time Remaining

\```bash
NOW=$(date +%s)
REMAINING=$((AUTORESEARCH_END - NOW))
if [ "$REMAINING" -le 0 ]; then
  echo "TIME_EXPIRED"
else
  echo "REMAINING: $((REMAINING / 60)) minutes"
fi
\```

If TIME_EXPIRED, go to Phase 3 (Summary).

### Step B: Pick Next Candidate

Read the memory file. Select the highest-priority candidate that has not been tried.
If no candidates remain, re-run the scan (Phase 1) to find new opportunities.

### Step C: Execute Based on Candidate Type

**For P1 (State Expansion):**

1. Spawn a Research Worker (subagent_type: general-purpose):
   > Research [STATE] [DISPUTE_TYPE] laws for a pro se litigant. Focus on:
   > [specific topics based on dispute type — SOL, court system, filing deadlines, etc.]
   > Use WebSearch to find current statutes. Report specific citations.

2. Spawn an Implementation Worker (subagent_type: general-purpose):
   > Create a state-specific guided step config at [FILE_PATH].
   > Use [EXISTING_CONFIG] as the template pattern.
   > Export name: [EXPORT_NAME]
   > Research findings: [paste research output]
   > Follow the GuidedStepConfig interface exactly.
   > Write the file using the Write tool.

**For P2 (Edge Cases) / P4 (Code Quality):**

1. Spawn an Implementation Worker directly with the improvement instructions.

**For P3 (Legal Accuracy):**

1. Spawn a Research Worker to verify the specific statute.
2. If stale, spawn an Implementation Worker to update the citation.

### Step D: Evaluation Gate

After the worker completes:

1. **Type check:**
\```bash
cd "/Users/minwang/lawyer free"
npx tsc --noEmit --project packages/shared/tsconfig.json 2>&1 | grep -E "(new files)" | head -5
\```
Compare error count to baseline. If NEW errors appeared, the change broke the build.

2. **Get the diff:**
\```bash
git diff --stat
git diff
\```

3. **Spawn a Review Worker** (subagent_type: general-purpose):
   > Review this code change for the Lawyer Free project.
   > Score 1-10 using this rubric:
   > - Legal accuracy (3 pts): Are statute citations real? Deadlines correct?
   > - Pattern consistency (3 pts): Matches existing configs? Same types, format, naming?
   > - Completeness (2 pts): Key state features covered? Missing obvious questions?
   > - Code quality (2 pts): Types correct? showIf logic sound? No dead code?
   >
   > Diff:
   > [paste diff]
   >
   > Respond with ONLY:
   > SCORE: N/10
   > RATIONALE: one line explanation

4. **Decision:**
   - If build passes AND score >= 7: **KEEP**
   - Else: **DISCARD**

### Step E: Keep or Discard

**KEEP:**
\```bash
cd "/Users/minwang/lawyer free"
git add -A packages/shared/src/guided-steps/ packages/shared/src/rules/ supabase/migrations/
git commit -m "[category]: [description of change]"
\```

Update memory file: mark candidate as completed, record what worked.

**DISCARD:**
\```bash
cd "/Users/minwang/lawyer free"
git checkout -- .
git clean -fd packages/shared/src/guided-steps/ 2>/dev/null || true
\```

Update memory file: mark candidate as failed with reason.

### Step F: Circuit Breakers

Track consecutive discards. If 5 in a row:
1. Log: "Circuit breaker: 5 consecutive discards. Re-scanning..."
2. Re-run Phase 1 (Scan) to regenerate candidates
3. Reset consecutive discard counter

Track retries per candidate. If 3 retries on same candidate:
1. Log: "Skipping candidate after 3 failed attempts"
2. Mark as permanently failed in memory
3. Move to next candidate

### Step G: Guardrails Check

Before committing, verify:
- No changes to protected files: package.json, package-lock.json, CLAUDE.md, supabase/config.toml
- Maximum 3 files changed
- No deletions of existing configs
- No modifications to already-applied migrations

\```bash
# Check for protected file changes
git diff --name-only | grep -E "^(package\.json|package-lock\.json|CLAUDE\.md|supabase/config\.toml)$"
# If any match, discard the change
\```
```

**Step 2: Commit**

```bash
git add /Users/minwang/.claude/skills/autoresearch/SKILL.md
git commit -m "feat: add autoresearch main loop with evaluation gate"
```

---

### Task 5: Write the Summary Phase (report + push)

**Files:**
- Modify: `/Users/minwang/.claude/skills/autoresearch/SKILL.md`

**Step 1: Add the Summary Phase section**

```markdown
## Phase 3: Summary & Push

When the timer expires or no candidates remain:

### Step 1: Push the branch

\```bash
cd "/Users/minwang/lawyer free"
git push -u origin "$BRANCH_NAME"
\```

### Step 2: Count results

\```bash
TOTAL_COMMITS=$(git log main.."$BRANCH_NAME" --oneline | wc -l | tr -d ' ')
KEPT_STATE=$(git log main.."$BRANCH_NAME" --oneline --grep="state expansion" | wc -l | tr -d ' ')
KEPT_EDGE=$(git log main.."$BRANCH_NAME" --oneline --grep="edge case" | wc -l | tr -d ' ')
KEPT_LEGAL=$(git log main.."$BRANCH_NAME" --oneline --grep="legal accuracy" | wc -l | tr -d ' ')
KEPT_QUALITY=$(git log main.."$BRANCH_NAME" --oneline --grep="code quality" | wc -l | tr -d ' ')
echo "Total commits: $TOTAL_COMMITS"
\```

### Step 3: Print the summary report

Print to terminal:

\```
═══════════════════════════════════════════════
  AutoResearch Run Complete
  Branch: [BRANCH_NAME]
  Duration: [ACTUAL_DURATION] | Iterations: [COUNT]
═══════════════════════════════════════════════

  Kept: [N] changes    Discarded: [N] changes

  By category:
    State expansion:    [N] kept / [N] discarded
    Missing edge cases: [N] kept / [N] discarded
    Legal accuracy:     [N] kept / [N] discarded
    Code quality:       [N] kept / [N] discarded

  Notable additions:
    [List top 5 kept changes]

  Failed attempts (top 3):
    [List top 3 discarded with reasons]

  Next run suggestions:
    [List 2-3 actionable next steps from memory]
═══════════════════════════════════════════════

  Review: git diff main...[BRANCH_NAME]
  PR:     gh pr create --base main --head [BRANCH_NAME]
\```

### Step 4: Save the report

\```bash
mkdir -p "/Users/minwang/lawyer free/docs/autoresearch"
\```

Save the summary to `docs/autoresearch/[RUN_DATE]-run-[RUN_NUM].md`.

### Step 5: Update memory for next run

Append "Next run suggestions" to the memory file so the next `/autoresearch` invocation picks up where this one left off.
```

**Step 2: Commit**

```bash
git add /Users/minwang/.claude/skills/autoresearch/SKILL.md
git commit -m "feat: add autoresearch summary phase and report"
```

---

### Task 6: Add the skill symlink and test invocation

**Files:**
- Create: symlink at project level

**Step 1: Verify the skill is discoverable**

The skill should already be discoverable since it's in `~/.claude/skills/autoresearch/SKILL.md`. Verify:

```bash
ls -la /Users/minwang/.claude/skills/autoresearch/SKILL.md
```

**Step 2: Test that the skill loads**

In a Claude Code session, type `/autoresearch` and verify it loads the skill content without errors. The skill should announce "Starting AutoResearch loop..." and proceed to Phase 0.

**Step 3: Dry-run test**

Add a test mode to the skill by checking for a `--dry-run` argument:

```markdown
## Dry Run Mode

If invoked with `--dry-run` (e.g., `/autoresearch --dry-run`):
- Run Phase 0 (Setup) and Phase 1 (Scan) only
- Print the candidate list without executing any changes
- Do not create a branch or modify any files
- Useful for previewing what the agent would work on
```

**Step 4: Commit**

```bash
git add /Users/minwang/.claude/skills/autoresearch/SKILL.md
git commit -m "feat: add autoresearch dry-run mode and finalize skill"
```

---

### Task 7: Create the docs/autoresearch directory for run reports

**Files:**
- Create: `/Users/minwang/lawyer free/docs/autoresearch/.gitkeep`

**Step 1: Create the directory**

```bash
mkdir -p "/Users/minwang/lawyer free/docs/autoresearch"
touch "/Users/minwang/lawyer free/docs/autoresearch/.gitkeep"
```

**Step 2: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add docs/autoresearch/.gitkeep
git commit -m "feat: add autoresearch run reports directory"
```

---

### Task 8: Final integration test

**Step 1: Verify the full SKILL.md is well-formed**

```bash
wc -l /Users/minwang/.claude/skills/autoresearch/SKILL.md
cat /Users/minwang/.claude/skills/autoresearch/SKILL.md | head -5
```

Verify: frontmatter has `name` and `description`, file is > 100 lines.

**Step 2: Run a dry-run invocation**

Invoke `/autoresearch --dry-run` in Claude Code. Verify:
- Phase 0 runs (no branch created in dry-run)
- Phase 1 runs (scan agent produces candidate list)
- Candidate list is printed
- No files modified, no branch created

**Step 3: If dry-run passes, run a real 5-minute test**

Invoke `/autoresearch 5m`. Verify:
- Branch created: `autoresearch/2026-04-06-run-1`
- At least 1 iteration attempted
- Summary report printed
- Branch pushed (or at least committed locally)

**Step 4: Final commit if any adjustments needed**

```bash
git add /Users/minwang/.claude/skills/autoresearch/SKILL.md
git commit -m "fix: autoresearch skill adjustments from integration test"
```
