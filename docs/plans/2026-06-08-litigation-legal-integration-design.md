# Design: litigation-legal Integration

**Date:** 2026-06-08  
**Source:** anthropics/claude-for-legal — `litigation-legal` plugin  
**Status:** Approved, ready for implementation planning

---

## Problem

Lawyer Free's AI features are powered by OpenAI with hand-written prompts. The `litigation-legal` plugin from `anthropics/claude-for-legal` offers battle-tested, attorney-grade skill workflows for demand letters, chronology building, brief drafting, deposition prep, subpoena triage, and docket watching — all of which are high-value for pro se litigants. The goal is to port these skills as in-app AI features backed by Claude (Anthropic), adapted for the pro se context.

---

## Approach: Port Skills as Next.js API Routes

Each litigation-legal skill becomes:
- A `src/lib/ai/litigation-legal/<skill>.ts` module containing the adapted system prompt and workflow logic
- A `/api/ai/<skill>` route that assembles case context from Supabase and calls Claude

**Why not Managed Agents API:** The app already has a rich Supabase data model that maps directly to what the skills need. Managed Agents adds orchestration overhead that isn't justified for synchronous in-app requests. The pro se adaptation work is required regardless of deployment model.

**Key design principle:** Supabase replaces the practice profile. The `litigation-legal` plugin reads from `~/.claude/plugins/config/.../CLAUDE.md`. Our adaptation assembles an equivalent context object from the case record (cases, evidence_items, task_events, deadlines, tasks) and injects it as the system prompt's case context block.

---

## Part 1: AI Provider Migration (OpenAI → Claude)

### What changes

`src/lib/ai/client.ts` wraps the OpenAI SDK with a typed `AIClient` class. Replace the `openai` import with `@anthropic-ai/sdk`, keeping the exact same public interface:

- `AICompletionRequest` — unchanged
- `AICompletionResult` — unchanged  
- `AIError`, `AIRateLimitError`, `AIResponseError`, `AIConnectionError`, `AIConfigError` — unchanged

All 15+ existing call sites (document-generation, strategy-recommendations, merit-analysis, etc.) require zero changes.

### Model defaults

| Use case | Model |
|---|---|
| Default (existing features) | `claude-sonnet-4-6` |
| Heavy litigation-legal skills (brief drafter, chronology over large docs) | `claude-opus-4-7` |

### Env var

`OPENAI_API_KEY` → `ANTHROPIC_API_KEY`

---

## Part 2: Pro Se Adaptation Layer

All six skills share a `src/lib/ai/litigation-legal/pro-se-adapter.ts` module that translates attorney-facing skill prompts to pro se-safe output:

1. **Case context assembly** — builds the "practice profile" equivalent from Supabase case data
2. **Gate replacement** — removes privilege/FRE 408/attorney-client gates; replaces with plain-language clarity gate
3. **Jurisdiction injection** — loads TX/CA/NY/FL rules from existing `src/lib/filing-configs.ts` and state configs
4. **Blocked phrases** — applies existing `BLOCKED_PHRASES` from `document-generation.ts` (no "you must", "legal advice", etc.)
5. **Disclaimer** — appends mandatory "AI-generated draft — not legal advice" footer to all outputs
6. **England & Wales rules stripped** — PD 57AC and CPR 31.22 guards removed (not applicable)

### Case context object shape

```typescript
interface ProSeCaseContext {
  caseId: string
  disputeType: string
  state: string           // TX | CA | NY | FL
  role: 'plaintiff' | 'defendant'
  caseName: string
  opposingParty: string
  court: string | null
  caseNumber: string | null
  keyFacts: string[]      // derived from task_events (plaintiff-perspective)
  evidenceSummary: string // brief of evidence_items
  upcomingDeadlines: string[]
  completedSteps: string[]
}
```

---

## Part 3: Six Skills

### 1. Demand Letter Drafter

**Route:** `/api/ai/demand-draft`  
**Replaces:** existing `document-generation.ts` demand letter path  
**Output → Supabase:** `documents` table, type `demand_letter_v2`

**Workflow (adapted from litigation-legal `demand-draft` skill):**
1. 4-question intake form: parties, relief sought, key facts, tone (measured/assertive)
2. Pre-draft gate: clarity check (not privilege/FRE 408) — confirms role, relief type, deadline being set
3. Draft in-chat for review
4. Save draft to `documents` table
5. Offer to push a response deadline to `deadlines` table

**Adaptations from attorney skill:**
- Remove FRE 408 / privilege / waiver / admission risk gates
- Remove "signer" field (user is always the signer)
- Reframe "marking" as plain "settlement offer?" toggle
- Keep "candor about weak arguments" — flag weak points for the user

**UX:** Replace existing demand letter option in document generation flow. Short intake wizard before drafting.

---

### 2. Chronology Builder

**Route:** `/api/ai/chronology`  
**New capability**  
**Output → Supabase:** new `chronologies` table

**Schema — `chronologies` table:**
```sql
create table chronologies (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references cases(id) on delete cascade not null,
  entry_date date not null,
  description text not null,
  source text,              -- 'task_event' | 'evidence' | 'document' | 'manual'
  source_id uuid,           -- FK to originating record
  significance text check (significance in ('high', 'medium', 'background')),
  perspective text check (perspective in ('plaintiff', 'defendant')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
-- RLS: same as cases (user sees own only)
```

**Workflow (adapted from litigation-legal `chronology` skill):**
1. Read `task_events`, `evidence_items`, uploaded documents for this case
2. Extract dated events, de-duplicate
3. Tag significance (🔴 high / 🟡 medium / ⚪ background) from user's perspective (plaintiff or defendant)
4. Save one row per event to `chronologies`
5. Present as interactive timeline — user can edit significance, add manual entries

**Adaptations:**
- Remove disclosure/discovery use restriction warnings (pro se sees their own docs)
- Remove `--documents` mode (production/Bates-number mode — not relevant for pro se)
- Keep `--matter` mode as the only mode
- Significance tags explained in plain English, not by element-of-claim framework

**UX:** New Chronology tab in case dashboard (`/case/[id]/chronology/`). "Build chronology" button triggers AI run. Results render as editable timeline.

---

### 3. Brief / Motion Section Drafter

**Route:** `/api/ai/brief-section`  
**Fits into:** existing `/case/[id]/motions/` route  
**Output → Supabase:** `documents` table, type `brief_section`

**Workflow (adapted from litigation-legal `brief-section-drafter` skill):**
1. User selects motion and section (Statement of Facts, Argument, Introduction, Conclusion)
2. Claude reads `case_authorities`, `evidence_items`, case theory (from dispute type + tasks)
3. Drafts section in plain English appropriate to the court
4. Flags weak arguments with `[WEAK — consider whether to include]` rather than silently drafting them
5. Saves draft to `documents`

**Adaptations:**
- Remove PD 57AC guard (England & Wales — not applicable)
- Enable "plain language" mode by default (not "house style")
- Remove "oral vs written" distinction — always written for pro se
- Keep "record fidelity" rule: no fabricated quotes, bracketed placeholders for unverified cites
- Keep "candor about weak arguments" — surfaces strategic choices for the user

**UX:** "Draft section" button per motion in the motions view. Wizard: select section → confirm facts → generate → review + edit → save.

---

### 4. Deposition Prep

**Route:** `/api/ai/deposition-prep`  
**New capability**  
**Output → Supabase:** `documents` table, type `deposition_prep`

**Workflow (adapted from litigation-legal `deposition-prep` skill):**
1. Short intake: witness name, witness role (opposing party / their expert / fact witness), deposition date
2. Claude reads case facts, `evidence_items`, `case_authorities`, identifies doc refs per topic
3. Generates question bank organized by topic, tied to case theory
4. Saves to `documents`

**Adaptations:**
- Framed as "prepare to depose the other side" OR "prepare for your own deposition" — user selects
- Plain-English question framing (not technical examination language)
- Add "what to bring" section listing relevant evidence items

**UX:** New "Depo Prep" card in the Discovery section (`/case/[id]/discovery/`). Output saved and accessible from Documents.

---

### 5. Subpoena Triage

**Route:** `/api/ai/subpoena-triage`  
**New capability, reactive**  
**Output → Supabase:** `documents` table, type `subpoena_triage`; deadline pushed to `deadlines`

**Workflow (adapted from litigation-legal `subpoena-triage` skill):**
1. User uploads subpoena document (PDF/image)
2. Claude classifies: document subpoena, deposition subpoena, or third-party subpoena
3. Scopes response burden
4. Identifies potential objection grounds (overbreadth, undue burden, privilege)
5. Produces plain-language response checklist + jurisdiction-specific deadline (TX/CA/NY/FL rules vary)
6. Deadline auto-pushed to `deadlines` table

**Adaptations:**
- Plain-language explanation of what the subpoena requires and why
- Jurisdiction-specific deadlines from `filing-configs.ts`
- No privilege log guidance (out of scope for pro se)
- Clear "this is a draft checklist, not legal advice" framing

**UX:** Reactive card in Focus tab when a subpoena-related task is active. Also accessible from Case File section via "Triage a subpoena" button.

---

### 6. Docket Watcher

**Delivery:** Supabase Edge Function on a daily cron schedule  
**Output → Supabase:** `deadlines` table, `source = 'docket_watcher'`

**Workflow (adapted from litigation-legal `docket-watcher` agent):**
1. Edge Function runs daily for all active cases with a `court_case_number`
2. Queries CourtListener (existing `src/lib/courtlistener/` integration) for new docket entries since last check
3. Each new entry passed through Claude: classify (motion/order/notice/etc.), extract response deadline if any, write one-sentence plain-English summary
4. New deadlines inserted into `deadlines` with:
   - `source = 'docket_watcher'`
   - `is_confirmed = true` (from court record)
   - `label = 'From court docket'`
5. Notification sent to user if a response deadline was found

**Adaptations:**
- Claude output is structured JSON (not a report) — feeding the `deadlines` table
- Plain-English summary for each docket entry (attorneys get legalese; pro se users get clarity)
- Conservative: only push a deadline when Claude is confident one exists — flag ambiguous entries for user review

**UX:** Transparent to users. Deadlines appear in the Deadlines view with a "From court docket" badge. First-time setup: user links their case number to a docket during case creation or via case settings.

---

## Data Model Changes

| Change | Reason |
|---|---|
| New `chronologies` table | Chronology builder output needs a queryable, editable structure |
| Extend `documents` with `litigation_legal_skill` column | Track which skill generated each doc for analytics and filtering |
| `deadlines` table already handles docket watcher | Uses existing `source` column |
| `cases` needs `court_case_number` column if not present | Required for docket watcher |

---

## Testing Plan

| Layer | What to test |
|---|---|
| Unit | Pro se adapter: blocked phrases, disclaimer presence, jurisdiction injection |
| Unit | Each skill module: context assembly from mock Supabase data |
| Unit | Output validation: length, structure, no fabricated cites |
| Integration | `/api/ai/*` routes with a real Claude call (staged, not in CI) |
| RLS | Chronologies table: users cannot see other users' entries |
| E2E | Demand letter wizard → generate → save → visible in Documents |
| E2E | Docket watcher Edge Function: inserts deadline, sends notification |

---

## Phasing

**Phase 1 (core):** AI provider migration + pro se adapter + demand letter (replaces existing)  
**Phase 2:** Chronology builder + brief section drafter  
**Phase 3:** Deposition prep + subpoena triage  
**Phase 4:** Docket watcher (Edge Function + cron)
