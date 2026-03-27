# Case File Command Center — Unified Evidence-to-Trial Pipeline

**Date:** 2026-03-10
**Status:** Approved
**Scope:** Evidence Vault, Exhibits Manager, Discovery Management, Trial Binder Generation

## Problem

The current evidence-to-trial pipeline consists of four disconnected features (Evidence, Exhibits, Discovery, Binders) that feel like separate islands. Users — especially first-time pro se litigants — don't understand how they connect, face too many manual steps, and lack AI assistance to guide them through the process.

## Solution

A unified **Case File Command Center** with a hybrid hub + detail view architecture. One entry point (`/case/[id]/case-file`) presents the evidence-to-trial journey as a four-stage visual pipeline with heavy AI integration and cross-referencing throughout.

---

## Architecture

### Navigation

**Current sidebar (4 separate links):**
```
Evidence → Exhibits → Discovery → Binders
```

**New sidebar (1 unified link):**
```
Case File
  └ internal tabs: Collect · Organize · Discover · Prepare
```

Old routes (`/case/[id]/evidence`, `/exhibits`, `/discovery`, `/binders`) return 308 redirects to `/case/[id]/case-file?stage=collect|organize|discover|prepare`.

### Routes

| Route | Purpose |
|-------|---------|
| `/case/[id]/case-file` | Hub with pipeline overview + active stage detail |
| `/case/[id]/case-file/evidence` | Evidence detail (drill-down from Collect) |
| `/case/[id]/case-file/exhibits` | Exhibits detail (drill-down from Organize) |
| `/case/[id]/case-file/discovery` | Discovery detail (drill-down from Discover) |
| `/case/[id]/case-file/binders` | Binders detail (drill-down from Prepare) |

### Layout

```
┌───────────────────────────────────────────────┬──────────────┐
│  Case File                                     │ AI Assistant │
├───────────────────────────────────────────────┤              │
│  [Collect] ──▶ [Organize] ──▶ [Discover] ──▶ [Prepare]     │
│   12 items      8 of 12       1 pack          Ready ✓       │
│                                                │ Next steps  │
│  ┌─ AI Insight ─────────────────────────────┐ │ suggestions  │
│  │ Contextual recommendation banner         │ │ + stage      │
│  │                    [Action] [Dismiss]     │ │ guides       │
│  └──────────────────────────────────────────┘ │              │
│                                                │              │
│  ┌─ Active Stage Detail View ───────────────┐ │              │
│  │ (renders Collect/Organize/Discover/       │ │              │
│  │  Prepare content based on active tab)     │ │              │
│  └──────────────────────────────────────────┘ │              │
└───────────────────────────────────────────────┴──────────────┘
```

---

## Stage 1: Collect (Redesigned Evidence Vault)

### AI Evidence Checklist
- AI generates a case-type-specific evidence checklist on case creation
- Stored in `case_file_checklists` + `case_file_checklist_items` tables
- Auto-checks items as evidence is uploaded and categorized (matched by category)
- User can manually check/uncheck items
- Refreshable on demand (AI re-evaluates based on current case state)

### New Capabilities

| Feature | Description |
|---------|-------------|
| Multi-file upload | Drag multiple files; each gets AI-categorized in parallel |
| Search | Full-text search across file names, notes, categories |
| Filter by status | All / Not exhibited / Exhibited / Flagged |
| Inline edit | Modify notes, category, captured date after upload |
| Bulk select | Checkbox mode for bulk exhibit-add, export, delete |
| AI proactive suggestions | Per-item suggestions: "Exhibit this", "Matches checklist item X" |
| Cross-reference badges | Shows "Ex. 1" + "In Binder" + "Referenced in Discovery Pack #1" |
| Export button | Visible in toolbar + bulk export selected items |

---

## Stage 2: Organize (Redesigned Exhibits Manager)

### AI Exhibit Suggestions
- Triggered manually ("Suggest exhibits" button) or proactively when unexhibited count > 3
- AI receives: case type, state, existing exhibits, unexhibited evidence metadata
- Returns: ranked list of suggestions with draft title + relevance reasoning
- User can accept all, review one-by-one, or dismiss

### New Capabilities

| Feature | Description |
|---------|-------------|
| Renumber on delete | "Renumber" button resequences all exhibits. Auto-prompts after removal. New RPC: `renumber_exhibits()` |
| AI-generated titles | AI pre-fills exhibit titles based on file content, category, and case context |
| Unexhibited evidence inline | Shown below exhibit list — one-click add without navigating away |
| Alpha overflow warning | Warning at 20+ items: "Approaching A-Z limit. Switch to numeric?" |
| Bulk add | "Add All Suggested" from AI, or multi-select from unexhibited list |
| Drag + renumber | Reorder via drag + optional "Renumber to match new order" prompt |

### Renumber Mechanism
- New API endpoint: `POST /api/exhibit-sets/[setId]/renumber`
- Reassigns `exhibit_no` sequentially based on current `sort_order`
- Updates `next_number` on the set
- Atomic — wrapped in a Postgres transaction
- Logs `exhibits_renumbered` timeline event

---

## Stage 3: Discover (Redesigned Discovery Management)

### AI Discovery Starter Packs
- AI proposes a complete discovery pack based on case type + state + existing evidence
- One-click creation or customize-first flow
- Uses dispute-type-specific templates

### Evidence ↔ Discovery Linking
- New `discovery_item_evidence_links` table (many-to-many)
- AI suggests links when creating discovery items
- UI shows linked evidence inline under each discovery item
- Bidirectional: evidence vault shows "Referenced in Discovery Pack #1, RFP #2"

### New Capabilities

| Feature | Description |
|---------|-------------|
| Inline progress stepper | Visual pipeline within each pack card (Draft → Ready → Served → Responses → Done) |
| Status revert | Can revert "ready" → "draft" to add items (with warning about re-service). Or create supplemental pack. |
| Inline objection review | Collapsible within response card. Real-time processing status. |
| Auto-serve transition | Logging a service entry auto-transitions to "served". Removing all logs reverts to "ready". |
| Response deadline | Prominent countdown with color coding (green > 14d, amber 7-14d, red < 7d) |
| Inline meet & confer | Generate button right next to flagged objections |
| Duplicate response detection | SHA256 check on upload — warns if file already uploaded |

---

## Stage 4: Prepare (Redesigned Trial Binder)

### AI Readiness Assessment
- Scores trial readiness as a percentage
- Flags gaps: unexhibited evidence, unresolved objections, missing timeline summary
- Plain English recommendation on what to fix before generating
- "Fix Issues" button navigates to relevant stage

### New Binder Options (all exposed in UI)

| Option | Description |
|--------|-------------|
| Exhibits | Always included |
| Exhibit index with descriptions | Always included |
| Case timeline | Optional |
| Deadline summary | Optional |
| Discovery packs & responses | Optional (was hidden, now exposed) |
| All evidence (including non-exhibited) | Optional |
| AI case summary | NEW — 1-2 page overview of parties, claims, key facts, strengths/weaknesses |
| AI strategy notes | NEW — opening statement themes, key exhibits, anticipated objections, cross-exam points |

### Build Progress
- New `binder_build_steps` table tracking each step's status
- API endpoint: `GET /api/binders/[binderId]/progress`
- Frontend polls every 2s during build
- Steps: `summary_generation`, `exhibit_index`, `timeline_compilation`, `exhibit_download`, `discovery_packaging`, `strategy_generation`, `zip_creation`
- Visual progress bar with per-step status indicators

### New Capabilities

| Feature | Description |
|---------|-------------|
| Binder preview | Shows exact file structure with sizes before generating |
| Regenerate | "Regenerate" button on existing binders re-runs with same or updated options |
| PDF download | Option for single combined PDF OR ZIP with separate files |
| Skipped file retry | Per-file "Retry" button instead of text manifest |
| Versioning | Binders show version history via `version` + `parent_binder_id` columns |

### AI Case Summary
- Input: all case data, evidence metadata, exhibit titles, timeline events, discovery results, risk scores
- Output: structured PDF — Case Overview, Parties, Claims & Defenses, Key Facts, Evidence Summary, Timeline, Strengths, Weaknesses
- Uses Anthropic API (Claude)
- Cached in `ai_cache` table — regenerated only when case data changes

### AI Strategy Notes
- Input: same as case summary + health score + risk analysis
- Output: Opening Statement Themes, Key Exhibits to Emphasize, Anticipated Objections, Cross-Examination Points, Closing Argument Framework
- Strong disclaimer: "These are organizational suggestions, not legal advice."

---

## AI Case File Assistant

A persistent contextual recommendation panel (NOT a chatbot) on the right side of the Case File hub.

### Three Modes

| Mode | When | Content |
|------|------|---------|
| Next Steps | Default | Prioritized 3-5 recommended actions based on pipeline state, case type, deadlines |
| Stage Guide | Entering a stage | Plain English explanation of what this stage is and what to do |
| Action Result | After AI action | What changed and what to do next |

### Next Steps Generation

Input signals:
- Pipeline stage completion percentages
- Evidence count vs. expected for case type
- Unexhibited evidence count
- Discovery pack statuses + deadlines
- Flagged objections not yet addressed
- Binder recency (stale if evidence changed since last build)
- Approaching case deadlines
- Risk score + health score

Output: Ranked action items with:
- Plain English description
- One-sentence rationale
- One-click action button (navigates + pre-fills)
- Priority: urgent (red) / recommended (amber) / nice-to-have (gray)

### Beginner Walkthrough
First-time users see a one-time overlay explaining the four stages in plain English with a "Let's start" CTA. Dismissible with "Don't show again" checkbox.

### Collapsible
- Collapses to floating 💡 button
- State persisted in localStorage
- Mobile: bottom sheet (swipe up)

---

## Database Changes

### New Tables

```sql
-- AI-generated evidence checklists
case_file_checklists (
  id uuid PK,
  case_id uuid FK UNIQUE,
  generated_at timestamptz,
  model text,
  created_at timestamptz
)

case_file_checklist_items (
  id uuid PK,
  checklist_id uuid FK,
  label text,
  category text,
  matched_evidence_id uuid FK NULLABLE,
  checked boolean DEFAULT false,
  sort_order int,
  created_at timestamptz
)

-- Discovery ↔ Evidence linking
discovery_item_evidence_links (
  id uuid PK,
  discovery_item_id uuid FK,
  evidence_item_id uuid FK,
  created_at timestamptz,
  UNIQUE(discovery_item_id, evidence_item_id)
)

-- Binder build progress
binder_build_steps (
  id uuid PK,
  binder_id uuid FK,
  step_key text,        -- summary_generation, exhibit_index, etc.
  status text,          -- pending, running, done, failed
  error text NULLABLE,
  started_at timestamptz,
  completed_at timestamptz
)

-- AI assistant suggestions
case_file_suggestions (
  id uuid PK,
  case_id uuid FK,
  suggestion_type text,  -- next_step, stage_guide, action_result
  priority text,         -- urgent, recommended, nice_to_have
  title text,
  description text,
  action_type text,      -- navigate, ai_trigger, info
  action_payload jsonb,
  dismissed boolean DEFAULT false,
  created_at timestamptz,
  expires_at timestamptz
)
```

### Modified Tables

| Table | Change |
|-------|--------|
| `evidence_items` | Add `edited_at timestamptz` |
| `trial_binders` | Add `version int DEFAULT 1`, `parent_binder_id uuid FK NULLABLE`, `build_progress jsonb` |
| `discovery_packs` | Allow status revert: `ready → draft` |

### New RPCs

| RPC | Purpose |
|-----|---------|
| `renumber_exhibits(p_exhibit_set_id)` | Resequence exhibit numbers by sort_order, update next_number |

### RLS

All new tables get standard user-isolation RLS policies via JOIN through `cases.user_id`.

---

## Cross-Reference Badge System

Every item shows where it's referenced (clickable badges):

| Item | Badges |
|------|--------|
| Evidence item | `[Ex. 3]` `[Discovery #1, RFP #2]` `[In Binder v2]` |
| Exhibit | `[From: Contract.pdf]` `[In Binder v2]` |
| Discovery item | `[Linked: Contract.pdf (Ex. 3)]` |
| Binder | `[6 exhibits]` `[1 discovery pack]` `[Generated Mar 10]` |

Computed server-side in the dashboard API call.

---

## Mobile

- Pipeline stages stack vertically
- AI Assistant becomes bottom sheet (swipe up)
- Detail views use full width
- Drag-and-drop exhibits → move-up/move-down buttons on touch

---

## Performance

- AI suggestions cached in DB — invalidated via triggers on state changes
- Binder build progress: lightweight polling (every 2s)
- Evidence checklist: generated once at case creation, refreshable on demand
- Cross-reference badges: computed server-side in aggregated dashboard query
- Max 5 active suggestions at a time

---

## Error Handling

- AI failures degrade gracefully: "Couldn't generate suggestions — try refreshing"
- Binder build failures show per-step error with Retry/Skip options
- Discovery revert (ready → draft) requires confirmation dialog
- All AI-generated content includes standard disclaimer footer

---

## Disclaimer

Every AI-generated content includes:
> "This is general legal information, not legal advice. Consult an attorney for advice specific to your situation."
