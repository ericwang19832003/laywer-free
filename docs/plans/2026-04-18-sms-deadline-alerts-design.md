# SMS Deadline Alerts — Design
*Date: 2026-04-18*

## Problem

Pro se litigants fear missing court deadlines above everything else. Lawyer Free tracks deadlines and sends email reminders, but email is low-intrusion — it gets missed. SMS is read within minutes. Wiring Twilio into the existing reminder infrastructure is the highest-ROI feature available because ~90% of the infrastructure already exists.

## Decisions

| Question | Decision |
|---|---|
| SMS provider | Twilio (account + credentials already available) |
| Phone collection | Onboarding (optional) + Settings (editable) |
| SMS timing | T-3, T-1, T-0 days before deadline (email keeps T-7, T-3, T-1) |
| Architecture | Extend existing `insert-deadlines.ts` + `send-reminders` cron |

## Architecture

### What already exists (no changes needed)
- `reminders` table with `channel IN ('email', 'push', 'sms')` — SMS channel already valid
- `insert-deadlines.ts` — single place where reminder rows are created
- `send-reminders` cron — already processes `scheduled` reminders and tracks sent/failed/skipped
- `user_preferences` table — exists, needs two new columns

### What needs to be built (5 components)

```
1. Migration          user_preferences: + phone_number, + sms_opt_in
2. SMS provider       src/lib/sms/provider.ts  (sendSms)
3. SMS templates      src/lib/sms/reminder-templates.ts  (buildReminderSms)
4. Reminder seeding   insert-deadlines.ts: add SMS rows at T-3, T-1, T-0
5. Cron SMS branch    send-reminders/route.ts: handle channel='sms'
6. UI                 Onboarding step 2 + Settings notifications section
```

---

## Section 1 — Data Model

**Migration:** Add to `user_preferences` table:

```sql
ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS phone_number TEXT,
  ADD COLUMN IF NOT EXISTS sms_opt_in BOOLEAN NOT NULL DEFAULT false;
```

- `phone_number`: E.164 format (`+15551234567`), nullable
- `sms_opt_in`: defaults to false; automatically reset to false when phone_number is removed

---

## Section 2 — Reminder Row Creation

**File:** `apps/web/src/lib/rules/insert-deadlines.ts`

`insertDeadlineWithReminders` currently creates email rows at T-7, T-3, T-1.

**Change:** Accept `smsPhone?: string` in `opts`. If provided:
- Create additional SMS reminder rows at T-3, T-1, T-0
- Filter past dates (same as email rows)
- Merge into the same `reminders.insert()` call — one DB round-trip

```
Email rows: T-7, T-3, T-1
SMS rows:   T-3, T-1, T-0  (T-0 = "today is your deadline")
```

The `smsPhone` value is fetched by callers from `user_preferences` before calling `insertDeadlineWithReminders`.

---

## Section 3 — Twilio Integration

### `apps/web/src/lib/sms/provider.ts`

```typescript
export async function sendSms(params: {
  to: string   // E.164
  body: string
}): Promise<{ success: boolean; error?: string }>
```

- Uses `twilio` npm package
- Reads env: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`
- Returns same shape as `sendEmail` for symmetric handling in the cron

### `apps/web/src/lib/sms/reminder-templates.ts`

```typescript
export function buildReminderSms(params: {
  deadlineLabel: string
  daysUntil: number
  caseUrl: string
}): string
```

- Target: under 160 chars (single SMS segment)
- Example T-1: `"Lawyer Free: Answer Deadline due TOMORROW. Don't miss it: https://..."`
- Example T-0: `"Lawyer Free: Answer Deadline is DUE TODAY. Act now: https://..."`
- Example T-3: `"Lawyer Free: Answer Deadline due in 3 days. View case: https://..."`

**Environment variables to add:**
```
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=
```

---

## Section 4 — Cron Update

**File:** `apps/web/src/app/api/cron/send-reminders/route.ts`

**Changes:**
1. After building `userMap`, also query `user_preferences` for all user IDs in batch — add `phoneMap: Map<string, { phone: string, smsOptIn: boolean }>`
2. In the per-reminder loop, branch on `reminder.channel`:
   - `'email'` → existing email path (unchanged)
   - `'sms'` → new SMS path:
     - Skip if `!phoneMap.get(userId)?.smsOptIn`
     - Skip if `!phoneMap.get(userId)?.phone`
     - Call `sendSms({ to: phone, body: buildReminderSms(...) })`
     - Track in same `sentIds`/`failedIds`/`skippedIds`
     - Queue in-app notification on success (same as email)

---

## Section 5 — UI

### Onboarding (step 2 — situation cards screen)

- Add optional phone number input below the situation cards grid
- Add "Get SMS deadline alerts" checkbox (disabled until phone entered)
- Label: *"Optional — we'll text you before deadlines. No spam, unsubscribe anytime."*
- On submit: `PATCH /api/user-preferences` with `{ phone_number, sms_opt_in }`
- Users can skip entirely — field is optional

### Settings Page (Notifications section)

- Phone number input with E.164 formatting on save, displayed as friendly format
- "Get SMS deadline alerts" toggle — disabled if no phone number
- If phone number removed: automatically unchecks SMS opt-in
- Save via `PATCH /api/user-preferences`

### API

Extend `PATCH /api/user-preferences` to accept and validate:
```typescript
{
  phone_number?: string | null  // validated to E.164 or null
  sms_opt_in?: boolean
}
```

---

## Error Handling

| Scenario | Behavior |
|---|---|
| Twilio send fails | Mark reminder as `failed`, log error, no retry (next cron run won't re-process `failed` rows) |
| Invalid phone number | Skip reminder, mark `skipped` |
| `sms_opt_in` false | Skip reminder, mark `skipped` |
| Missing env vars | `sendSms` returns `{ success: false, error: 'Twilio not configured' }` — fails gracefully |
| User removes phone after reminders created | SMS rows remain in DB; cron skips them via opt-in check |

---

## Testing Plan

| Layer | What to test |
|---|---|
| Unit: `buildReminderSms` | T-3/T-1/T-0 message content, under 160 chars |
| Unit: `sendSms` | Correct Twilio params, error handling |
| Unit: `insertDeadlineWithReminders` | SMS rows created when smsPhone provided; skipped when not |
| Unit: cron SMS branch | Skips if opt-in false, skips if no phone, sends if both present |
| Integration: preferences API | Phone validation, E.164 format enforcement |
| Manual: onboarding | Phone field optional, skippable, saves correctly |
| Manual: settings | Toggle disabled without phone, saves, removes phone clears opt-in |

---

## Files Changed

| File | Change |
|---|---|
| `supabase/migrations/YYYYMMDD_sms_preferences.sql` | Add `phone_number`, `sms_opt_in` to `user_preferences` |
| `apps/web/src/lib/sms/provider.ts` | New — Twilio `sendSms` |
| `apps/web/src/lib/sms/reminder-templates.ts` | New — `buildReminderSms` |
| `apps/web/src/lib/rules/insert-deadlines.ts` | Add SMS rows at T-3/T-1/T-0 |
| `apps/web/src/app/api/cron/send-reminders/route.ts` | Add SMS branch |
| `apps/web/src/app/api/user-preferences/route.ts` | Accept phone_number + sms_opt_in |
| `apps/web/src/components/onboarding/` | Phone field + SMS opt-in |
| `apps/web/src/app/settings/page.tsx` | Phone + SMS toggle in notifications |

**Total: 8 files. New dependency: `twilio` npm package.**
