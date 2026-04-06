# AI Enhancement Opportunities Design

**Date:** 2026-03-03
**Status:** Approved

## Goal

Add 5 AI-powered features that make the app smarter: contextual task descriptions, evidence categorization suggestions, narrative timeline summaries, health score tips, and strategic case recommendations.

## AI Provider Strategy

- **Claude (claude-sonnet-4-20250514):** Feature 5 (strategy recommendations) — complex legal reasoning requires a stronger model.
- **GPT-4o-mini:** Features 1-4 (task descriptions, categorization, timeline summary, health tips) — lighter tasks, cheaper per call, optional with static fallback.

## Feature 1: AI Task Descriptions

**Architecture:** When the gatekeeper unlocks a task (`locked` → `todo`), call GPT-4o-mini with case context to generate a 2-3 sentence description explaining WHY this task matters for this specific case. Store in `tasks.metadata.ai_description`. Display on NextStepCard and at the top of each step page.

**Prompt:** System: "You explain legal procedure steps to a pro se litigant." User: task_key, case type, court, dispute type, completed tasks. Output: JSON `{ description: string, importance: "critical" | "important" | "helpful" }`.

**Fallback:** Static descriptions map (one per task_key) when no OpenAI key.

## Feature 2: AI Evidence Categorization

**Architecture:** After evidence upload, fire async POST to `/api/cases/[id]/evidence/[evidenceId]/categorize`. GPT-4o-mini gets file name, MIME type, text snippet (first 500 chars if PDF). Returns suggested category + relevance note. Stored in `evidence_items` metadata column as `{ ai_category, ai_relevance_note, ai_categorized_at }`. Upload UI pre-selects the suggested category (user can change).

**Fallback:** Skip silently if no OpenAI key. File name heuristics as secondary fallback.

## Feature 3: AI Case Timeline Summary

**Architecture:** New `/api/cases/[id]/timeline/summary` route. Fetches task_events, sends to GPT-4o-mini, returns 3-5 sentence narrative summary. Cached in a new `ai_cache` table with staleness check (>24h or >5 new events). Displayed as collapsible summary atop TimelineCard.

**Fallback:** "X events over Y days" computed string.

## Feature 4: AI Case Health Tips

**Architecture:** New `/api/cases/[id]/risk/tips` route. Takes case_risk_scores breakdown + case context, sends to GPT-4o-mini, returns 2-4 actionable tips. Cached in `ai_cache` table. Displayed as bullet points below health score bars in CaseHealthCard.

**Fallback:** Static tips based on which sub-score is highest risk.

## Feature 5: AI Case Strategy Recommendations

**Architecture:** New `/api/cases/[id]/strategy` route using Claude. Gathers comprehensive case context: type, court, role, tasks, deadlines, evidence count, risk scores, motions, discovery status. Returns 3-5 prioritized recommendations. Cached in `ai_cache` table (stale after 7 days or significant events). New StrategyCard on dashboard below CaseHealthCard.

**Safety:** Must not give specific legal advice — only procedural guidance. Uses `isFilingOutputSafe()` check.

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| AI API unavailable | All features gracefully degrade to static fallbacks |
| Task description for unknown task_key | Generic "Complete this step to move your case forward" |
| Evidence file with no text content | Categorize based on file name and MIME type only |
| Timeline with < 3 events | Skip summary, show "Not enough activity yet" |
| Health score all green | Tips say "Your case looks healthy!" |
| Strategy for brand new case | "Complete initial tasks for personalized recommendations" |
| Rate limiting / API errors | Cache previous result, show stale data with "Last updated X ago" |
