# TurboTax-Style Case Dashboard — Design Document

**Date:** 2026-02-15
**Status:** Approved

## Overview

A TurboTax-style "Case Dashboard" skeleton for a Texas pro se litigation assistant. The app provides procedural guidance, organization, and deadline tracking — not legal advice.

**Primary goal:** Ship the TurboTax backbone (Dashboard + Tasks + Timeline + Deadlines).

**Tone:** Warm, calming, confidence-building. Users are anxious. Every screen should feel supportive and simple.

## Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 15 (App Router, TypeScript) |
| Database | Supabase (Postgres + Auth + Storage) |
| Auth | Supabase Auth (email/password) |
| API | Next.js Route Handlers with `@supabase/ssr` |
| Styling | Tailwind CSS + shadcn/ui |
| Validation | Zod |
| Unit tests | Vitest |
| E2E tests | Playwright |
| Dev environment | Supabase CLI (local Docker) |

## Database Schema

### Tables

1. **cases** — User's litigation cases
   - `id` uuid PK, `user_id` references auth.users, `jurisdiction` (default TX), `county`, `court_type` (jp/county/district/unknown), `role` (plaintiff/defendant), `dispute_type`, `status` (active/archived), `created_at`

2. **tasks** — Step-by-step checklist items per case
   - `id` uuid PK, `case_id` FK, `task_key`, `title`, `status` (locked/todo/in_progress/needs_review/completed/skipped), `due_at`, `unlocked_at`, `completed_at`, `metadata` jsonb, `created_at`

3. **task_events** — Immutable audit log / timeline
   - `id` uuid PK, `case_id` FK, `task_id` FK (nullable), `kind`, `payload` jsonb, `created_at`

4. **deadlines** — Date-based deadlines
   - `id` uuid PK, `case_id` FK, `key`, `due_at`, `source` (system/user_confirmed/court_notice), `rationale`, `created_at`

5. **reminders** — Scheduled reminder records (no sending in MVP)
   - `id` uuid PK, `case_id` FK, `deadline_id` FK, `channel` (email/push), `send_at`, `status` (scheduled/sent/skipped/failed), `created_at`

### RLS Strategy

All tables have RLS enabled. Policies join back to `cases.user_id = auth.uid()`.

### Indexes

- `cases(user_id, created_at desc)`
- `tasks(case_id, status, due_at)`
- `task_events(case_id, created_at desc)`
- `deadlines(case_id, due_at)`
- `reminders(status, send_at)`

### Functions

- `get_case_dashboard(p_case_id uuid)` — Returns JSON: next_task, tasks_summary, upcoming_deadlines, recent_events

### Triggers

- On case INSERT: auto-create 4 backbone tasks (welcome=todo, intake/evidence_vault/preservation_letter=locked)
- On welcome task completion: unlock intake task

## API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/cases` | Create case |
| GET | `/api/cases` | List user cases |
| GET | `/api/cases/[id]/dashboard` | Dashboard data |
| PATCH | `/api/tasks/[id]` | Update task status |
| POST | `/api/cases/[id]/events` | Add timeline event |
| POST | `/api/cases/[id]/deadlines` | Create deadline + auto-reminders |
| GET | `/api/cases/[id]/timeline` | Paginated timeline |
| GET | `/api/cases/[id]/deadlines` | List deadlines |
| GET | `/api/cases/[id]/timeline/export` | Export timeline JSON |

All mutations write a `task_event` for audit. Zod validation on all inputs. Proper HTTP error codes (401/403/404/422).

## UI Pages

### `/cases` — Case List
Cards showing case county + role + created date. Single CTA: "Continue".

### `/case/[id]` — Dashboard
- Supportive header: "One step at a time."
- Card A: Today's Next Step (single primary CTA: "Review & Continue")
- Card B: Upcoming Deadlines (next 14 days, max 5)
- Card C: Progress (counts by status, progress bar)
- Card D: Recent Activity (last 10 events)
- Legal disclaimer footer

### `/case/[id]/step/[taskId]` — Step Runner
Two-phase flow: Input → Review & Confirm.
- Welcome: "I'm ready" button only
- Intake: county, court_type, narrative fields
- "Save and come back later" option

### `/case/[id]/deadlines` — Deadlines List
Sorted by due date, shows scheduled reminders.

## Visual Direction

- Primary: warm indigo
- Success: calming green
- Warning: warm amber (not red)
- Background: soft warm white (#FAFAF8)
- No red anywhere
- Mobile-first, generous whitespace, rounded corners

## Testing Strategy

1. **RLS isolation** — SQL script proving cross-user data isolation
2. **Vitest unit tests** — Zod schemas, API route handlers, business logic
3. **Playwright e2e** — Full flow: signup → create case → complete steps → add deadline → verify dashboard

## UX Rules

- One primary CTA per screen
- "Review → Confirm → Next" pattern
- Warm, calming microcopy
- Friendly empty states
- No legal advice — procedural guidance only
- Legal disclaimer footer on every page
