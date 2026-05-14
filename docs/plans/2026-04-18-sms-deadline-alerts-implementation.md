# SMS Deadline Alerts — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Wire Twilio SMS into the existing reminder infrastructure so users get T-3/T-1/T-0 text alerts before court deadlines.

**Architecture:** The `reminders` table already supports `channel='sms'`. `insert-deadlines.ts` is the single place where reminder rows are created — we extend it to also insert SMS rows when the user has opted in. The existing `send-reminders` cron gets an SMS branch. Phone number + opt-in are stored in `user_preferences` and collected in onboarding + settings.

**Tech Stack:** Next.js 14 App Router, Supabase, Twilio Node SDK (`twilio` npm), Vitest

---

## Task 1: Migration — add phone_number and sms_opt_in to user_preferences

**Files:**
- Create: `supabase/migrations/20260418000001_sms_preferences.sql`

**Step 1: Create migration file**

```sql
-- supabase/migrations/20260418000001_sms_preferences.sql
ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS phone_number TEXT,
  ADD COLUMN IF NOT EXISTS sms_opt_in BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.user_preferences.phone_number IS 'E.164 format, e.g. +15551234567';
COMMENT ON COLUMN public.user_preferences.sms_opt_in IS 'User has opted in to SMS deadline alerts';
```

**Step 2: Apply migration locally**

```bash
cd "/Users/minwang/lawyer free"
npx supabase db reset
```

Expected: Migration applied, no errors.

**Step 3: Commit**

```bash
git add supabase/migrations/20260418000001_sms_preferences.sql
git commit -m "feat(sms): add phone_number and sms_opt_in to user_preferences"
```

---

## Task 2: SMS provider — sendSms()

**Files:**
- Create: `apps/web/src/lib/sms/provider.ts`
- Create: `apps/web/tests/unit/lib/sms-provider.test.ts`

**Step 1: Write the failing test**

```typescript
// apps/web/tests/unit/lib/sms-provider.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock twilio before importing provider
vi.mock('twilio', () => {
  const mockCreate = vi.fn()
  return {
    default: vi.fn(() => ({
      messages: { create: mockCreate },
    })),
    __mockCreate: mockCreate,
  }
})

describe('sendSms', () => {
  beforeEach(() => {
    vi.stubEnv('TWILIO_ACCOUNT_SID', 'ACtest123')
    vi.stubEnv('TWILIO_AUTH_TOKEN', 'authtest')
    vi.stubEnv('TWILIO_FROM_NUMBER', '+15550001111')
  })

  it('returns success when Twilio responds', async () => {
    const { __mockCreate } = await import('twilio') as any
    __mockCreate.mockResolvedValueOnce({ sid: 'SMxxx' })
    const { sendSms } = await import('@/lib/sms/provider')
    const result = await sendSms({ to: '+15559876543', body: 'Test message' })
    expect(result.success).toBe(true)
    expect(__mockCreate).toHaveBeenCalledWith({
      from: '+15550001111',
      to: '+15559876543',
      body: 'Test message',
    })
  })

  it('returns error when Twilio throws', async () => {
    const { __mockCreate } = await import('twilio') as any
    __mockCreate.mockRejectedValueOnce(new Error('Invalid number'))
    const { sendSms } = await import('@/lib/sms/provider')
    const result = await sendSms({ to: '+15559876543', body: 'Test' })
    expect(result.success).toBe(false)
    expect(result.error).toContain('Invalid number')
  })

  it('returns error when env vars missing', async () => {
    vi.stubEnv('TWILIO_ACCOUNT_SID', '')
    const { sendSms } = await import('@/lib/sms/provider')
    const result = await sendSms({ to: '+15559876543', body: 'Test' })
    expect(result.success).toBe(false)
    expect(result.error).toContain('not configured')
  })
})
```

**Step 2: Run test to verify it fails**

```bash
cd apps/web && npx vitest run tests/unit/lib/sms-provider.test.ts
```

Expected: FAIL — `@/lib/sms/provider` not found.

**Step 3: Install twilio package**

```bash
cd "/Users/minwang/lawyer free"
npm install twilio
```

**Step 4: Implement provider**

```typescript
// apps/web/src/lib/sms/provider.ts
import twilio from 'twilio'

export async function sendSms(params: {
  to: string
  body: string
}): Promise<{ success: boolean; error?: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_FROM_NUMBER

  if (!accountSid || !authToken || !fromNumber) {
    return { success: false, error: 'Twilio not configured — missing env vars' }
  }

  try {
    const client = twilio(accountSid, authToken)
    await client.messages.create({
      from: fromNumber,
      to: params.to,
      body: params.body,
    })
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown Twilio error'
    return { success: false, error: message }
  }
}
```

**Step 5: Run tests to verify they pass**

```bash
cd apps/web && npx vitest run tests/unit/lib/sms-provider.test.ts
```

Expected: 3 tests PASS.

**Step 6: Commit**

```bash
git add apps/web/src/lib/sms/provider.ts apps/web/tests/unit/lib/sms-provider.test.ts package.json package-lock.json
git commit -m "feat(sms): add Twilio sendSms provider"
```

---

## Task 3: SMS reminder templates — buildReminderSms()

**Files:**
- Create: `apps/web/src/lib/sms/reminder-templates.ts`
- Create: `apps/web/tests/unit/lib/sms-templates.test.ts`

**Step 1: Write the failing test**

```typescript
// apps/web/tests/unit/lib/sms-templates.test.ts
import { describe, it, expect } from 'vitest'
import { buildReminderSms } from '@/lib/sms/reminder-templates'

describe('buildReminderSms', () => {
  const baseParams = {
    deadlineLabel: 'Answer Deadline',
    caseUrl: 'https://lawyer-free.vercel.app/case/abc123/deadlines',
  }

  it('mentions deadline label', () => {
    const msg = buildReminderSms({ ...baseParams, daysUntil: 3 })
    expect(msg).toContain('Answer Deadline')
  })

  it('says "3 days" for daysUntil=3', () => {
    const msg = buildReminderSms({ ...baseParams, daysUntil: 3 })
    expect(msg).toContain('3 days')
  })

  it('says "tomorrow" for daysUntil=1', () => {
    const msg = buildReminderSms({ ...baseParams, daysUntil: 1 })
    expect(msg.toLowerCase()).toContain('tomorrow')
  })

  it('says "TODAY" for daysUntil=0', () => {
    const msg = buildReminderSms({ ...baseParams, daysUntil: 0 })
    expect(msg.toUpperCase()).toContain('TODAY')
  })

  it('includes case URL', () => {
    const msg = buildReminderSms({ ...baseParams, daysUntil: 3 })
    expect(msg).toContain('https://lawyer-free.vercel.app/case/abc123/deadlines')
  })

  it('is under 160 characters for all timing variants', () => {
    for (const daysUntil of [0, 1, 3]) {
      const msg = buildReminderSms({ ...baseParams, daysUntil })
      expect(msg.length).toBeLessThanOrEqual(160)
    }
  })
})
```

**Step 2: Run test to verify it fails**

```bash
cd apps/web && npx vitest run tests/unit/lib/sms-templates.test.ts
```

Expected: FAIL — module not found.

**Step 3: Implement templates**

```typescript
// apps/web/src/lib/sms/reminder-templates.ts
export function buildReminderSms(params: {
  deadlineLabel: string
  daysUntil: number
  caseUrl: string
}): string {
  const { deadlineLabel, daysUntil, caseUrl } = params

  let timing: string
  if (daysUntil === 0) {
    timing = 'is DUE TODAY'
  } else if (daysUntil === 1) {
    timing = 'is due TOMORROW'
  } else {
    timing = `is due in ${daysUntil} days`
  }

  return `Lawyer Free: ${deadlineLabel} ${timing}. View case: ${caseUrl}`
}
```

**Step 4: Run tests to verify they pass**

```bash
cd apps/web && npx vitest run tests/unit/lib/sms-templates.test.ts
```

Expected: 6 tests PASS.

**Step 5: Commit**

```bash
git add apps/web/src/lib/sms/reminder-templates.ts apps/web/tests/unit/lib/sms-templates.test.ts
git commit -m "feat(sms): add buildReminderSms template"
```

---

## Task 4: Extend insert-deadlines.ts to create SMS rows

**Files:**
- Modify: `apps/web/src/lib/rules/insert-deadlines.ts`
- Create: `apps/web/tests/unit/lib/insert-deadlines-sms.test.ts`

**Step 1: Write the failing test**

```typescript
// apps/web/tests/unit/lib/insert-deadlines-sms.test.ts
import { describe, it, expect, vi } from 'vitest'

// We test the reminder rows built, not the DB insert itself
// Extract the reminder-building logic for unit testing
import { buildReminderRows } from '@/lib/rules/insert-deadlines'

describe('buildReminderRows', () => {
  const deadlineId = 'dl-123'
  const caseId = 'case-456'
  const now = new Date('2026-04-18T12:00:00Z')

  it('creates email rows at T-7, T-3, T-1 for future deadline', () => {
    const dueAt = new Date('2026-04-30T12:00:00Z') // 12 days away
    const rows = buildReminderRows({ deadlineId, caseId, dueAt, now, smsPhone: undefined })
    const emailRows = rows.filter(r => r.channel === 'email')
    expect(emailRows).toHaveLength(3)
    const offsets = emailRows.map(r =>
      Math.round((dueAt.getTime() - new Date(r.send_at).getTime()) / 86400000)
    )
    expect(offsets.sort()).toEqual([1, 3, 7])
  })

  it('skips email rows whose send_at is in the past', () => {
    const dueAt = new Date('2026-04-20T12:00:00Z') // 2 days away — T-7 and T-3 in past
    const rows = buildReminderRows({ deadlineId, caseId, dueAt, now, smsPhone: undefined })
    const emailRows = rows.filter(r => r.channel === 'email')
    expect(emailRows).toHaveLength(1) // only T-1 is future
  })

  it('creates SMS rows at T-3, T-1, T-0 when smsPhone provided', () => {
    const dueAt = new Date('2026-04-30T12:00:00Z')
    const rows = buildReminderRows({ deadlineId, caseId, dueAt, now, smsPhone: '+15551234567' })
    const smsRows = rows.filter(r => r.channel === 'sms')
    expect(smsRows).toHaveLength(3)
    const offsets = smsRows.map(r =>
      Math.round((dueAt.getTime() - new Date(r.send_at).getTime()) / 86400000)
    )
    expect(offsets.sort()).toEqual([0, 1, 3])
  })

  it('creates no SMS rows when smsPhone is undefined', () => {
    const dueAt = new Date('2026-04-30T12:00:00Z')
    const rows = buildReminderRows({ deadlineId, caseId, dueAt, now, smsPhone: undefined })
    expect(rows.filter(r => r.channel === 'sms')).toHaveLength(0)
  })

  it('sets correct case_id and deadline_id on all rows', () => {
    const dueAt = new Date('2026-04-30T12:00:00Z')
    const rows = buildReminderRows({ deadlineId, caseId, dueAt, now, smsPhone: '+15551234567' })
    for (const row of rows) {
      expect(row.case_id).toBe(caseId)
      expect(row.deadline_id).toBe(deadlineId)
      expect(row.status).toBe('scheduled')
    }
  })
})
```

**Step 2: Run test to verify it fails**

```bash
cd apps/web && npx vitest run tests/unit/lib/insert-deadlines-sms.test.ts
```

Expected: FAIL — `buildReminderRows` not exported.

**Step 3: Extract and extend the reminder-building logic**

In `apps/web/src/lib/rules/insert-deadlines.ts`, extract the reminder row builder into an exported function and add SMS support:

```typescript
// Add this exported function BEFORE insertDeadlineWithReminders

export function buildReminderRows(params: {
  deadlineId: string
  caseId: string
  dueAt: Date
  now: Date
  smsPhone: string | undefined
}): Array<{
  case_id: string
  deadline_id: string
  channel: 'email' | 'sms'
  send_at: string
  status: 'scheduled'
}> {
  const { deadlineId, caseId, dueAt, now, smsPhone } = params
  const rows: ReturnType<typeof buildReminderRows> = []

  // Email: T-7, T-3, T-1
  for (const days of [7, 3, 1]) {
    const sendAt = new Date(dueAt.getTime() - days * 24 * 60 * 60 * 1000)
    if (sendAt > now) {
      rows.push({ case_id: caseId, deadline_id: deadlineId, channel: 'email', send_at: sendAt.toISOString(), status: 'scheduled' })
    }
  }

  // SMS: T-3, T-1, T-0 (only if phone provided)
  if (smsPhone) {
    for (const days of [3, 1, 0]) {
      const sendAt = new Date(dueAt.getTime() - days * 24 * 60 * 60 * 1000)
      if (sendAt > now) {
        rows.push({ case_id: caseId, deadline_id: deadlineId, channel: 'sms', send_at: sendAt.toISOString(), status: 'scheduled' })
      }
    }
  }

  return rows
}
```

Then replace the inline reminder building in `insertDeadlineWithReminders` (lines 58-76) with a call to `buildReminderRows`:

```typescript
// Replace the existing remindersToInsert block with:
const remindersToInsert = buildReminderRows({
  deadlineId: inserted.id,
  caseId: deadline.case_id,
  dueAt: new Date(deadline.due_at),
  now: new Date(),
  smsPhone: opts.smsPhone,
})

if (remindersToInsert.length > 0) {
  await supabase.from('reminders').insert(remindersToInsert)
}
```

Also add `smsPhone?: string` to the `opts` parameter type.

**Step 4: Run tests to verify they pass**

```bash
cd apps/web && npx vitest run tests/unit/lib/insert-deadlines-sms.test.ts
```

Expected: 5 tests PASS.

**Step 5: Commit**

```bash
git add apps/web/src/lib/rules/insert-deadlines.ts apps/web/tests/unit/lib/insert-deadlines-sms.test.ts
git commit -m "feat(sms): extend insert-deadlines to create SMS reminder rows at T-3/T-1/T-0"
```

---

## Task 5: Add SMS branch to send-reminders cron

**Files:**
- Modify: `apps/web/src/app/api/cron/send-reminders/route.ts`
- Create: `apps/web/tests/unit/lib/send-reminders-sms.test.ts`

**Step 1: Write the failing test**

```typescript
// apps/web/tests/unit/lib/send-reminders-sms.test.ts
import { describe, it, expect, vi } from 'vitest'
import { shouldSendSms } from '@/app/api/cron/send-reminders/sms-helpers'

describe('shouldSendSms', () => {
  it('returns true when opt-in and phone present', () => {
    expect(shouldSendSms({ smsOptIn: true, phone: '+15551234567' })).toBe(true)
  })

  it('returns false when opt-in false', () => {
    expect(shouldSendSms({ smsOptIn: false, phone: '+15551234567' })).toBe(false)
  })

  it('returns false when phone missing', () => {
    expect(shouldSendSms({ smsOptIn: true, phone: null })).toBe(false)
  })

  it('returns false when phone empty string', () => {
    expect(shouldSendSms({ smsOptIn: true, phone: '' })).toBe(false)
  })
})
```

**Step 2: Run test to verify it fails**

```bash
cd apps/web && npx vitest run tests/unit/lib/send-reminders-sms.test.ts
```

Expected: FAIL — module not found.

**Step 3: Create SMS helpers module**

```typescript
// apps/web/src/app/api/cron/send-reminders/sms-helpers.ts
export function shouldSendSms(params: {
  smsOptIn: boolean
  phone: string | null | undefined
}): boolean {
  return params.smsOptIn === true && Boolean(params.phone)
}
```

**Step 4: Run tests to verify they pass**

```bash
cd apps/web && npx vitest run tests/unit/lib/send-reminders-sms.test.ts
```

Expected: 4 tests PASS.

**Step 5: Integrate SMS into the cron route**

In `apps/web/src/app/api/cron/send-reminders/route.ts`:

1. Add import at top:
```typescript
import { sendSms } from '@/lib/sms/provider'
import { buildReminderSms } from '@/lib/sms/reminder-templates'
import { shouldSendSms } from './sms-helpers'
```

2. After building `userMap`, add a phone map query:
```typescript
// Fetch SMS preferences for all users in batch
const { data: smsPrefs } = await supabase
  .from('user_preferences')
  .select('user_id, phone_number, sms_opt_in')
  .in('user_id', userIds)

const phoneMap = new Map<string, { phone: string; smsOptIn: boolean }>()
for (const pref of smsPrefs ?? []) {
  phoneMap.set(pref.user_id, {
    phone: pref.phone_number ?? '',
    smsOptIn: pref.sms_opt_in ?? false,
  })
}
```

3. In the per-reminder loop, replace the current email-only send block with a channel branch:
```typescript
let sendResult: { success: boolean; error?: string }

if (reminder.channel === 'sms') {
  const smsPref = phoneMap.get(userId)
  if (!shouldSendSms({ smsOptIn: smsPref?.smsOptIn ?? false, phone: smsPref?.phone })) {
    skippedIds.push(reminder.id)
    skipped++
    continue
  }
  const caseUrl = `${appUrl}/case/${reminder.case_id}/deadlines`
  sendResult = await sendSms({
    to: smsPref!.phone,
    body: buildReminderSms({
      deadlineLabel: formatDeadlineKey(reminder.deadlines.key),
      daysUntil,
      caseUrl,
    }),
  })
} else {
  // existing email path (unchanged)
  const { subject, body } = buildReminderEmail({ ... })
  sendResult = await sendEmail({ to: user.email, subject, body })
}

if (sendResult.success) {
  sentIds.push(reminder.id)
  sent++
  notificationRows.push({ ... }) // same as before
} else {
  failedIds.push(reminder.id)
  failed++
  console.error(`[SEND-REMINDERS] Failed for reminder ${reminder.id}: ${sendResult.error}`)
}
```

**Step 6: Commit**

```bash
git add apps/web/src/app/api/cron/send-reminders/ apps/web/tests/unit/lib/send-reminders-sms.test.ts
git commit -m "feat(sms): add SMS branch to send-reminders cron"
```

---

## Task 6: Extend user-preferences API

**Files:**
- Modify: `apps/web/src/app/api/user-preferences/route.ts`

**Step 1: Update the route to accept PATCH with phone + sms_opt_in**

Replace the existing `POST` with a `PATCH` handler (keep POST for backward compat):

```typescript
// Add to route.ts

import { z } from 'zod'

const E164_REGEX = /^\+[1-9]\d{1,14}$/

const SmsPrefsSchema = z.object({
  phone_number: z.string().regex(E164_REGEX, 'Must be E.164 format e.g. +15551234567').nullable().optional(),
  sms_opt_in: z.boolean().optional(),
})

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = SmsPrefsSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (parsed.data.phone_number !== undefined) {
    update.phone_number = parsed.data.phone_number
    // If phone removed, force opt-out
    if (!parsed.data.phone_number) update.sms_opt_in = false
  }
  if (parsed.data.sms_opt_in !== undefined) update.sms_opt_in = parsed.data.sms_opt_in

  const { error } = await supabase
    .from('user_preferences')
    .upsert({ user_id: user.id, ...update }, { onConflict: 'user_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
```

**Step 2: Commit**

```bash
git add apps/web/src/app/api/user-preferences/route.ts
git commit -m "feat(sms): extend user-preferences API to accept phone_number and sms_opt_in"
```

---

## Task 7: SMS settings UI in NotificationPreferences component

**Files:**
- Modify: `apps/web/src/components/settings/notification-preferences.tsx`

**Step 1: Add SMS channel + phone number field**

1. Add `'sms'` to `ChannelKey` type:
```typescript
type ChannelKey = 'email' | 'in_app' | 'sms'
```

2. Add to `DEFAULT_PREFERENCES.channels`:
```typescript
channels: {
  email: true,
  in_app: true,
  sms: false,
}
```

3. Add to `CHANNEL_OPTIONS` array:
```typescript
{ key: 'sms', label: 'SMS text alerts', description: 'Get texts 3 days, 1 day, and day-of deadline' },
```

4. Add `phone` state and save function to the component:
```typescript
const [phone, setPhone] = useState(initialPhone ?? '')
const [phoneError, setPhoneError] = useState('')
```

5. In the component JSX, below the channel toggles add:
```tsx
{preferences.channels.sms && (
  <div className="mt-3 space-y-1">
    <Label htmlFor="sms-phone">Mobile number for SMS alerts</Label>
    <Input
      id="sms-phone"
      type="tel"
      placeholder="+1 555 000 0000"
      value={phone}
      onChange={(e) => { setPhone(e.target.value); setPhoneError('') }}
    />
    {phoneError && <p className="text-sm text-destructive">{phoneError}</p>}
    <p className="text-xs text-muted-foreground">Format: +1XXXXXXXXXX</p>
  </div>
)}
```

6. In the save handler, validate E.164 and call `PATCH /api/user-preferences`:
```typescript
// Before saving notification preferences, save phone + sms_opt_in
if (preferences.channels.sms) {
  const e164 = /^\+[1-9]\d{1,14}$/
  if (!e164.test(phone)) {
    setPhoneError('Enter a valid phone number in format +1XXXXXXXXXX')
    return
  }
  await fetch('/api/user-preferences', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone_number: phone, sms_opt_in: true }),
  })
} else {
  await fetch('/api/user-preferences', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sms_opt_in: false }),
  })
}
```

**Step 2: Update `NotificationPreferencesProps` to accept initial values**

```typescript
interface NotificationPreferencesProps {
  initialPreferences?: Partial<NotificationPreferencesData>
  initialPhone?: string
  initialSmsOptIn?: boolean
}
```

**Step 3: Commit**

```bash
git add apps/web/src/components/settings/notification-preferences.tsx
git commit -m "feat(sms): add SMS channel + phone field to notification preferences"
```

---

## Task 8: Phone + SMS opt-in in onboarding

**Files:**
- Modify: `apps/web/src/components/onboarding/onboarding-flow.tsx`

**Step 1: Add phone step (step 4 — after situation card selection, before completion)**

1. Add state:
```typescript
const [phone, setPhone] = useState('')
const [smsOptIn, setSmsOptIn] = useState(false)
```

2. Change `handleSelect` to go to step 4 (phone step) instead of step 4 (complete):
```typescript
function handleSelect(disputeType: string) {
  setSelectedType(disputeType || undefined)
  setStep(4) // phone/SMS step (was direct to complete)
}
```

3. Add step 4 JSX (phone collection screen):
```tsx
{step === 4 && (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-semibold">Get deadline alerts by text?</h2>
      <p className="text-muted-foreground text-sm mt-1">
        Optional — we'll text you 3 days, 1 day, and the day of each deadline. No spam.
      </p>
    </div>
    <div className="space-y-2">
      <Label htmlFor="onboarding-phone">Mobile number</Label>
      <Input
        id="onboarding-phone"
        type="tel"
        placeholder="+1 555 000 0000"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <p className="text-xs text-muted-foreground">Format: +1XXXXXXXXXX</p>
    </div>
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={smsOptIn}
        disabled={!phone}
        onChange={(e) => setSmsOptIn(e.target.checked)}
      />
      <span className="text-sm">Send me SMS deadline alerts</span>
    </label>
    <div className="flex gap-3">
      <Button variant="outline" onClick={() => handleComplete()}>Skip for now</Button>
      <Button onClick={() => handleComplete()} disabled={smsOptIn && !phone}>
        {smsOptIn ? 'Save and continue' : 'Continue'}
      </Button>
    </div>
  </div>
)}
```

4. Update `handleComplete` to save phone if provided:
```typescript
async function handleComplete() {
  const e164 = /^\+[1-9]\d{1,14}$/
  if (phone && smsOptIn && e164.test(phone)) {
    await fetch('/api/user-preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone_number: phone, sms_opt_in: true }),
    })
  }
  onComplete(selectedType)
}
```

**Step 2: Commit**

```bash
git add apps/web/src/components/onboarding/onboarding-flow.tsx
git commit -m "feat(sms): add optional phone/SMS opt-in step to onboarding"
```

---

## Task 9: Add env vars and build verification

**Step 1: Add env vars to .env.local.example**

```bash
# In /Users/minwang/lawyer free/.env.local.example, add:
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=
```

**Step 2: Add to Vercel environment**

```bash
cd "/Users/minwang/lawyer free"
vercel env add TWILIO_ACCOUNT_SID production
vercel env add TWILIO_AUTH_TOKEN production
vercel env add TWILIO_FROM_NUMBER production
```

Enter the values from your Twilio console when prompted.

**Step 3: Build to verify no TypeScript errors**

```bash
cd "/Users/minwang/lawyer free"
cd apps/web && npx tsc --noEmit
```

Expected: No errors.

**Step 4: Run full unit test suite**

```bash
cd apps/web && npx vitest run tests/unit
```

Expected: All tests pass.

**Step 5: Final commit**

```bash
cd "/Users/minwang/lawyer free"
git add .env.local.example
git commit -m "feat(sms): add Twilio env vars to .env.local.example"
```

---

## Task 10: Push and deploy

**Step 1: Push branch**

```bash
cd "/Users/minwang/lawyer free"
git push origin petition-quality-system
```

**Step 2: Run Codex review**

```bash
codex review --base main
```

Fix any P1 issues flagged before deploying.

**Step 3: Deploy to production**

```bash
vercel --prod
```

---

## Summary

| Task | Files | Tests |
|------|-------|-------|
| 1. Migration | 1 SQL file | Manual (supabase reset) |
| 2. SMS provider | provider.ts | 3 unit tests |
| 3. SMS templates | reminder-templates.ts | 6 unit tests |
| 4. insert-deadlines | insert-deadlines.ts | 5 unit tests |
| 5. Cron SMS branch | route.ts + sms-helpers.ts | 4 unit tests |
| 6. Preferences API | route.ts | Manual curl test |
| 7. Settings UI | notification-preferences.tsx | Manual |
| 8. Onboarding UI | onboarding-flow.tsx | Manual |
| 9. Env + build | .env.local.example | tsc + vitest |
| 10. Deploy | — | — |

**Total new tests: 18**
**New dependency: `twilio`**
**Env vars to add: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`**
