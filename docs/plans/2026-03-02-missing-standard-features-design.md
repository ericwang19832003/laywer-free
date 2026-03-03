# Missing Standard Features Design

**Date:** 2026-03-02
**Status:** Approved

## Goal

Add 5 standard features that users expect: in-app notification center, case notes/journal, read-only case sharing, account management enhancements, and welcome checklist onboarding.

## Feature 1: In-App Notification Center

**Architecture:** New `notifications` table + bell icon in TopNav + dropdown panel.

**Table:** `notifications` (id, user_id, case_id, type, title, body, read, created_at). Types: `deadline_approaching`, `task_unlocked`, `email_sent`, `email_failed`, `escalation_triggered`.

**Write path:** Existing escalation engine + task completion handlers insert notifications when events occur. No new cron job — piggyback on existing `escalation-engine.ts`.

**UI:** Bell icon with unread count badge in TopNav. Click opens dropdown with notification list, grouped by date. "Mark all read" button. Each notification links to the relevant case/task.

**Settings:** Notification preferences section in Settings page — toggle email notifications on/off per type.

## Feature 2: Case Notes / Journal

**Architecture:** New `case_notes` table + notes card on case dashboard.

**Table:** `case_notes` (id, case_id, user_id, content, pinned, created_at, updated_at). RLS: owner only.

**API:** CRUD routes at `/api/cases/[id]/notes` (GET list, POST create) and `/api/cases/[id]/notes/[noteId]` (PATCH update, DELETE).

**UI:** New "Notes" card on case dashboard with inline add/edit. Each note shows timestamp and content. Pin important notes to top. Simple textarea — no rich text editor.

**Timeline integration:** Note creation writes a `note_added` event to `task_events` so it appears in the case timeline.

## Feature 3: Read-Only Case Sharing

**Architecture:** Share token on cases table + public viewer page.

**Schema change:** Add `share_token` (uuid, nullable) and `share_enabled` (boolean, default false) columns to `cases` table.

**Share UI:** "Share" button on case dashboard. Toggle generates/reveals a share link (`/shared/[token]`). Toggle off disables the link.

**Public viewer:** `/shared/[token]` page — no auth required. Shows read-only case summary: case type, court, status, timeline, deadlines. Does NOT show documents, evidence, or drafts (privacy).

**RLS:** New policy on cases: `SELECT` where `share_token = :token AND share_enabled = true`. No user_id check for this policy.

## Feature 4: Account Management Enhancements

**Architecture:** Expand existing settings page with new sections.

**Profile section:** Add initials-based avatar (computed from display name). Add phone number field (stored in auth.user_metadata).

**Account deletion:** "Delete Account" button in settings. Confirmation dialog with case count warning. Cascading delete via Supabase.

**Data export:** "Export My Data" button. Generates JSON download of all user data (cases, tasks, deadlines, events, notes, documents metadata). No file attachments in export.

**Notification preferences:** Toggle email notifications per type.

## Feature 5: Welcome Checklist Onboarding

**Architecture:** Checklist state in user metadata + dashboard component.

**State:** Store checklist progress in `auth.user_metadata.onboarding` as `{ completed: string[], dismissed: boolean }`. No new table needed.

**Checklist items:** "Create your first case", "Upload a document", "Explore the evidence vault", "Review your deadlines", "Set up your profile". Each links to the relevant page.

**UI:** `OnboardingChecklist` card on dashboard, shown only when `!dismissed && completed.length < 5`. Green checkmarks for completed items, muted for pending. "Dismiss" button to hide permanently.

**Auto-detection:** Check completion on dashboard load — if case exists, mark "Create first case" as done. If documents exist, mark "Upload a document" as done.

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Notification for deleted case | Skip rendering, don't crash |
| Share link accessed after disabled | 404 page with "This link is no longer active" |
| Account deletion with active cases | Confirmation shows case count, requires typing "DELETE" |
| Data export with 100+ cases | Stream JSON, show progress toast |
| Onboarding checklist dismissed | Never shown again (stored in user metadata) |
| No notifications yet | Bell shows no badge, dropdown shows "No notifications yet" |
