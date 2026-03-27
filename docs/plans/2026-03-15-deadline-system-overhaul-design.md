# Deadline System Overhaul — Design Document

**Date:** 2026-03-15
**Approach:** Rules-Engine-First (Approach A)
**Phases:** 3 (Engine → UI → Notifications)

---

## Problem Statement

Pro se litigants using Lawyer Free currently see **zero deadlines** on active cases because deadline creation is entirely manual. Missing a litigation deadline can result in default judgment, case dismissal, or loss of rights. The system must auto-generate deadlines as users progress through workflow steps, surface them with clear urgency, and notify users through multiple channels.

---

## Phase 1: Deadline Rules Engine & Auto-Generation

### 1.1 Deadline Rules Config

New file: `src/lib/deadline-rules.ts`

```typescript
interface DeadlineRule {
  trigger_task: string              // Task key that triggers this deadline
  deadline_key: string              // Key for the created deadline
  deadline_label: string            // Human-readable name
  offset_days: number               // Days from reference date
  reference: 'task_completed_at' | 'metadata_field'
  metadata_field?: string           // If reference = 'metadata_field'
  apply_rule_4: boolean             // Texas Rule 4 weekend/holiday adjustment
  consequence: string               // What happens if missed
  escalation_levels: EscalationConfig[]
}

interface EscalationConfig {
  level: number
  offset_days: number               // Negative = before, positive = after
  condition_type: 'always' | 'no_event'
  condition_key?: string            // Event to check for
  message_template: string
}
```

### 1.2 Cross-Dispute Common Rules

These patterns repeat across nearly all dispute types:

| Pattern | Trigger | Offset | Rule 4 | Consequence |
|---|---|---|---|---|
| Service deadline | `*_file_with_court` | +90 days | Yes | Case dismissed for want of prosecution (TRCP 99) |
| Answer deadline | `*_serve_defendant` / `*_serve_respondent` | +20 days (first Monday after) | Yes | Can request default judgment |
| Discovery response | Discovery served | +30 days | Yes | Deemed admissions / compel motion (TRCP 196/197) |

### 1.3 Dispute-Specific Rules

| Dispute Type | Trigger | Deadline | Offset | Notes |
|---|---|---|---|---|
| Divorce | `divorce_file_with_court` | 60-day waiting period | +60 days | TX Family Code 6.702 |
| Protective Order | `po_file_with_court` | Full hearing | +14 days | TX Family Code 82.009 |
| Landlord-Tenant (eviction JP) | `lt_file_with_court` | Hearing | +10-21 days | JP court sets |
| Employment | `biz_employment_eeoc` | EEOC filing deadline | +180-300 days from incident | Federal/state dependent |
| Small Claims | `sc_file_with_court` | Hearing | Court-set | JP court schedules |
| Debt Defense | `debt_file_with_court` | Answer deadline | From citation date | Critical — default judgment risk |

### 1.4 Texas Rule 4 Implementation

```typescript
function applyTexasRule4(date: Date): Date {
  // Saturday → Monday
  // Sunday → Monday
  // Texas legal holidays → next business day
  // Holidays: New Year's, MLK, Presidents' Day, Memorial Day,
  //   Juneteenth, July 4, Labor Day, Veterans Day,
  //   Thanksgiving + Friday after, Christmas
}
```

### 1.5 Integration Point

Hook into existing task status update flow:

```
PATCH /api/tasks/[id] (status → completed)
  → Write task_event (existing)
  → NEW: Look up deadline rules for this task key + dispute type
  → For each matching rule:
    → Compute due_at = reference_date + offset_days
    → Apply Texas Rule 4 if configured
    → Insert into deadlines table
    → Auto-create reminders (user preferences or defaults: -7d, -3d, -1d)
    → Auto-seed escalation rules
    → Write task_event ('deadline_auto_generated')
    → Create notification for user
```

### 1.6 Deadline Rules Per Dispute Type

Complete task key → deadline mappings for all 17 dispute subtypes:

**Property (user's active case):**
- `property_file_with_court` → Service deadline (+90d, Rule 4)
- `property_serve_defendant` → Answer deadline (+20d first Monday, Rule 4)

**Contract:**
- `contract_file_with_court` → Service deadline (+90d, Rule 4)
- `contract_serve_defendant` → Answer deadline (+20d first Monday, Rule 4)

**Small Claims:**
- `sc_file_with_court` → Service deadline (+90d, Rule 4)
- `sc_serve_defendant` → Answer deadline (+20d first Monday, Rule 4)

**Landlord-Tenant:**
- `lt_file_with_court` → Service deadline (+90d, Rule 4)
- `serve_other_party` → Response deadline (+20d first Monday, Rule 4)

**Debt Defense:**
- `debt_file_with_court` → Service deadline (+90d, Rule 4)
- `serve_plaintiff` → Plaintiff response window (informational)

**Personal Injury:**
- `pi_file_with_court` → Service deadline (+90d, Rule 4)
- `pi_serve_defendant` → Answer deadline (+20d first Monday, Rule 4)

**Real Estate:**
- `re_file_with_court` → Service deadline (+90d, Rule 4)
- `re_serve_defendant` → Answer deadline (+20d first Monday, Rule 4)

**Business (Partnership/B2B/Employment):**
- `biz_*_file_with_court` → Service deadline (+90d, Rule 4)
- `biz_*_serve_defendant` → Answer deadline (+20d first Monday, Rule 4)
- `biz_employment_eeoc` → EEOC filing deadline (metadata-driven)

**Family Law (Divorce):**
- `divorce_file_with_court` → Service deadline (+90d, Rule 4) + 60-day waiting period
- `divorce_serve_respondent` → Answer deadline (+20d first Monday, Rule 4)

**Family Law (Custody/Child Support/Spousal Support/Visitation):**
- `*_file_with_court` → Service deadline (+90d, Rule 4)
- `*_serve_respondent` → Answer deadline (+20d first Monday, Rule 4)

**Family Law (Protective Order):**
- `po_file_with_court` → Full hearing deadline (+14d, Rule 4)

**Family Law (Modification):**
- `mod_file_with_court` → Service deadline (+90d, Rule 4)
- `mod_serve_respondent` → Answer deadline (+20d first Monday, Rule 4)

### 1.7 Default Escalation Config Per Auto-Generated Deadline

| Level | Offset | Condition | Message Template |
|---|---|---|---|
| 1 | -7d | always | "Your {deadline_label} is in {due_date}. Make sure you're prepared." |
| 2 | -3d | no_event({condition_key}) | "3 days until {deadline_label} and no {action} recorded yet." |
| 3 | -1d | no_event({condition_key}) | "Tomorrow is your {deadline_label}. Take action today." |
| 4 | 0d | no_event({condition_key}) | "Today is your {deadline_label}." |
| 5 | +1d | no_event({condition_key}) | "Your {deadline_label} was yesterday. Here's what you can do next." |

---

## Phase 2: UI Overhaul

### 2.1 Deadlines Page — Three Views

Segmented control at top: **Timeline** | **Calendar** | **List**

**Timeline View (default):**
- Vertical timeline with "Today" marker line
- Past deadlines: greyed (completed) or red (missed)
- Future deadlines: cards along timeline with countdown badges
- Color coding: red (overdue/today), amber (1-7d), green (8+d)
- Each card: deadline label, date, source badge, consequence preview
- Tap card → expand: reminders, rationale, "What if I miss this?"

**Calendar View:**
- Month grid with colored dots on deadline dates
- Tap date → popover with deadlines for that day
- Swipe left/right between months
- Today highlighted

**List View (improved current):**
- Sortable by date, urgency, type
- Filter by status (upcoming, overdue, completed)
- Bulk actions (snooze, reschedule)

### 2.2 Dashboard Deadlines Card

```
┌─────────────────────────────────────────┐
│  Deadlines                    View all →│
│                                         │
│  ┌──────┐  Answer Deadline              │
│  │  12  │  April 4, 2026               │
│  │ days │  "If missed, default judgment"│
│  └──────┘                               │
│                                         │
│  ── Service Deadline ·· Jun 14 ── 83d   │
│  ── Hearing Date ····· Jul 20 ── 119d  │
│                                         │
│  + Add deadline                         │
└─────────────────────────────────────────┘
```

- Countdown box for most urgent deadline (red/amber/green border)
- Consequence snippet below urgent deadline
- Secondary deadlines as compact rows
- Inline "Add deadline" button

### 2.3 Cases List Page Updates

"Next Deadline" column:
- `12d — Answer Due` (amber text)
- `83d — Service` (green text)
- `Overdue! — Answer` (red text)
- `—` (no deadlines, grey)

"Deadlines (7d)" stat card: subtle pulse when count > 0.

### 2.4 Empty State

```
┌─────────────────────────────────────────┐
│  No deadlines yet                       │
│                                         │
│  Deadlines will appear automatically    │
│  as you progress through your case      │
│  steps. You can also add one manually.  │
│                                         │
│  [ + Add a Deadline ]                   │
└─────────────────────────────────────────┘
```

### 2.5 "What If I Miss This?" Drawer

Every auto-generated deadline includes a one-tap expandable:

> **What happens if I miss this?**
> [consequence text from deadline rule config]

---

## Phase 3: Multi-Channel Notifications & Smart Reminders

### 3.1 Notification Channels

| Channel | Timing | Implementation |
|---|---|---|
| Email (existing) | -7d, -3d, -1d | Resend |
| Push (new) | -3d, -1d, day-of, overdue | Web Push API (PWA) |
| SMS (new, opt-in) | -1d, day-of | Twilio |
| Calendar export (new) | On creation | .ics download + Google/Apple Calendar deep links |
| In-app (new) | All escalations | Notification bell in TopNav |

### 3.2 User Notification Preferences (Settings Page)

```
Reminder Preferences
────────────────────
Default reminders for new deadlines:
  ☑ 7 days before
  ☑ 3 days before
  ☑ 1 day before
  ☐ Day of (morning)

Channels:
  ☑ Email
  ☐ SMS  [ +1 __________ ] Verify
  ☑ In-app notifications

Quiet hours: 9pm — 7am
```

Storage: `notification_preferences` JSONB column on user profile or new `user_preferences` table.

### 3.3 Snooze

When a reminder fires (in-app or email):
- **Snooze 1 hour**
- **Snooze until tomorrow**
- **Dismiss** (marks acknowledged)

Implementation: `snoozed_until` column on `reminders` table. Cron skips where `snoozed_until > now`.

### 3.4 Escalation Engine Expansion

Extend from 2 seeded rules to auto-seeded rules for ALL deadline types, with 5 levels:

| Level | Offset | Condition | Tone |
|---|---|---|---|
| 1 | -7d | always | Informational |
| 2 | -3d | no_event | Urgent |
| 3 | -1d | no_event | Critical |
| 4 | 0d (day-of) | no_event | Same-day alert |
| 5 | +1d (overdue) | no_event | Overdue with next-steps guidance |

### 3.5 Calendar Export

On deadline creation (auto or manual):
- **Download .ics** file
- **Add to Google Calendar** deep link
- **Add to Apple Calendar** webcal:// link

Calendar event contents:
- Title: "Lawyer Free: [Deadline Label]"
- Description: consequence text + link back to case
- Reminders: mirrors user's app preferences
- No sensitive case details exposed (security)

### 3.6 Notification Center (TopNav Bell)

```
┌─────────────────────────────────────┐
│  Notifications              Mark all│
│                                     │
│  🔴 TODAY                           │
│  Answer deadline is tomorrow        │
│  Property Damage · 2h ago    [View] │
│                                     │
│  EARLIER                            │
│  Service deadline added             │
│  Property Damage · 3d ago    [View] │
└─────────────────────────────────────┘
```

Unread count badge on bell icon. "View" navigates to relevant page.

---

## Database Changes Summary

### New Tables
- `deadline_rules` — Config table for auto-generation rules (or keep as code config)
- `user_preferences` — Notification channel preferences, quiet hours, reminder timing

### Modified Tables
- `reminders` — Add `snoozed_until timestamptz`, add `channel` value `'push'` and `'sms'`
- `escalation_rules` — Expand from 2 seeded rules to auto-seeded per deadline type, add levels 4 and 5
- `notifications` — Already exists, enhance with structured action URLs

### New Columns
- `deadlines.label` — Human-readable label (populated by rules engine)
- `deadlines.consequence` — What happens if missed (populated by rules engine)
- `deadlines.auto_generated` — Boolean flag distinguishing auto vs manual

---

## Security Considerations

- Calendar export links: time-limited tokens, not permanent URLs
- SMS: phone numbers encrypted at rest, user can delete anytime
- Push notification tokens: secure storage with rotation
- Deadline computation rules: server-side only, never exposed to client
- No sensitive case details in calendar events or SMS messages

---

## Testing Strategy

- **Unit tests**: Texas Rule 4 computation, deadline rules config parsing, offset calculations, escalation engine with 5 levels
- **Integration tests**: Task completion → deadline auto-generation flow, reminder creation, escalation triggering
- **RLS tests**: Deadline isolation between users
- **E2E tests**: Complete flow — complete step → see deadline appear → receive notification
- **Edge cases**: Weekends, Texas holidays, timezone differences, concurrent deadline creation, deadline rescheduling, case dismissal deactivation

---

## 10-Person Team Sign-Off

| Role | Verdict |
|---|---|
| Researcher | Rules-based deadline computation follows legal tech industry standard (Clio, MyCase) |
| Architect | Config-driven engine integrates cleanly with existing task_events and escalation systems |
| Product Manager | Solves highest-stakes gap — users will never see 0 deadlines on active cases again |
| Developer | Hooks into existing PATCH /api/tasks/[id] flow, pure functions for Rule 4, testable |
| UI Designer | Three-view deadlines page with countdown rings and urgency coloring |
| Tester | Comprehensive coverage: Rule 4 edge cases, dedup, timezone, concurrency |
| Apple UI/UX Engineer | Timeline view mirrors Health app pattern, segment control for view switching |
| Apple Product Manager | Zero learning curve — deadlines just appear, one-tap calendar export |
| Google Algorithm Engineer | Precomputed at task completion, indexed queries, no runtime recomputation |
| Google Cybersecurity Engineer | RLS enforced, time-limited export tokens, encrypted PII, server-side rules |
