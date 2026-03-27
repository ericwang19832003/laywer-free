# Dashboard Analytics, Audit Log & Activity Feed Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Add dashboard analytics to the cases list page, a unified activity/audit log page per case, and enhance the timeline card with load-more and complete event descriptions.

**Architecture:** No new tables. Analytics queries existing `tasks`, `deadlines`, `case_risk_scores`, `task_events` server-side. Activity page consumes the existing paginated `GET /api/cases/[id]/timeline` route. Timeline card gets client-side load-more. All ~20 unhandled event kinds get proper descriptions.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind, Supabase, shadcn/ui, lucide-react

---

## Task 1: Complete `describeEvent` for All Event Kinds

**Files:**
- Modify: `src/components/dashboard/timeline-card.tsx`

The current `describeEvent` function handles 17 event kinds but ~20 fall through to the raw `kind.replace(/_/g, ' ')` default. Add cases for every known event kind.

**Add these cases before the `default:` in the switch statement:**

```typescript
    case 'filing_draft_generated': {
      const docType = event.payload?.document_type as string | undefined
      return docType ? `${docType.replace(/_/g, ' ')} draft generated` : 'Filing draft generated'
    }
    case 'court_document_uploaded':
      return 'Court document uploaded'
    case 'extraction_completed':
      return 'Document data extracted'
    case 'deadlines_generated':
      return 'Case deadlines calculated'
    case 'evidence_uploaded': {
      const fileName = event.payload?.file_name as string | undefined
      return fileName ? `Evidence uploaded: ${fileName}` : 'Evidence uploaded'
    }
    case 'evidence_exported':
      return 'Evidence exported'
    case 'note_added':
      return 'Note added'
    case 'motion_created': {
      const motionType = event.payload?.motion_type as string | undefined
      return motionType ? `Motion created: ${motionType.replace(/_/g, ' ')}` : 'Motion created'
    }
    case 'meet_and_confer_sent': {
      const toEmail = event.payload?.to_email as string | undefined
      return toEmail ? `Meet-and-confer letter sent to ${toEmail}` : 'Meet-and-confer letter sent'
    }
    case 'health_alert_triggered':
      return 'Health alert triggered'
    case 'reminder_escalated':
      return 'Deadline reminder escalated'
    case 'strategy_generated':
      return 'Strategy recommendations generated'
    case 'discovery_pack_created':
      return 'Discovery pack created'
    case 'discovery_pack_status_changed': {
      const newStatus = event.payload?.status as string | undefined
      return newStatus ? `Discovery pack ${newStatus}` : 'Discovery pack updated'
    }
    case 'discovery_template_acknowledged':
      return 'Discovery template acknowledged'
    case 'discovery_item_added':
      return 'Discovery item added'
    case 'discovery_pack_served':
      return 'Discovery pack served'
    case 'discovery_packet_exported':
      return 'Discovery packet exported'
    case 'discovery_response_received':
      return 'Discovery response received'
    case 'discovery_response_deadline_set':
      return 'Discovery response deadline set'
    case 'trial_binder_generated':
      return 'Trial binder generated'
    case 'trial_binder_failed':
      return 'Trial binder generation failed'
    case 'trial_binder_downloaded':
      return 'Trial binder downloaded'
    case 'exhibit_set_created':
      return 'Exhibit set created'
    case 'exhibit_added':
      return 'Exhibit added'
    case 'exhibits_reordered':
      return 'Exhibits reordered'
    case 'exhibit_list_exported':
      return 'Exhibit list exported'
    case 'exhibit_removed':
      return 'Exhibit removed'
```

Also **export** the `describeEvent` and `relativeTime` functions (change `function` to `export function`) so the new activity page can reuse them.

---

## Task 2: Enhanced Timeline Card — Load More + Link to Activity

**Files:**
- Modify: `src/components/dashboard/timeline-card.tsx`

**Changes:**

1. Add props for `caseId` (needed for fetch + link):

```typescript
interface TimelineCardProps {
  caseId: string
  events: TimelineEvent[]
  summary?: { summary: string; key_milestones: string[] } | null
}
```

2. Add state and load-more logic inside the component:

```typescript
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function TimelineCard({ caseId, events: initialEvents, summary }: TimelineCardProps) {
  const [events, setEvents] = useState(initialEvents)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialEvents.length >= 10)
  const [cursor, setCursor] = useState<string | null>(
    initialEvents.length > 0 ? initialEvents[initialEvents.length - 1].created_at : null
  )
```

3. Add the fetch function:

```typescript
  async function loadMore() {
    if (!cursor || loading) return
    setLoading(true)
    try {
      const res = await fetch(`/api/cases/${caseId}/timeline?cursor=${encodeURIComponent(cursor)}&limit=10`)
      if (res.ok) {
        const data = await res.json()
        const newEvents = data.events as TimelineEvent[]
        setEvents((prev) => [...prev, ...newEvents])
        setHasMore(data.has_more)
        setCursor(data.next_cursor)
      }
    } catch { /* silent */ }
    setLoading(false)
  }
```

4. Replace `events.slice(0, 10)` with just `events` in the render.

5. After the `</ul>`, add:

```tsx
<div className="mt-4 flex items-center justify-between">
  {hasMore && (
    <Button variant="ghost" size="sm" onClick={loadMore} disabled={loading} className="text-xs">
      {loading ? 'Loading...' : 'Load more'}
    </Button>
  )}
  <Button variant="ghost" size="sm" asChild className="text-xs ml-auto">
    <Link href={`/case/${caseId}/activity`}>View all activity</Link>
  </Button>
</div>
```

6. Update `src/app/(authenticated)/case/[id]/page.tsx` — pass `caseId={id}` to `TimelineCard`:

```tsx
<TimelineCard caseId={id} events={dashboard.recent_events} summary={timelineSummary} />
```

---

## Task 3: Unified Activity Page

**Files:**
- Create: `src/app/(authenticated)/case/[id]/activity/page.tsx`

This page consumes the existing paginated `GET /api/cases/[id]/timeline` route. It has category filters and infinite scroll.

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ActivityFeed } from '@/components/activity/activity-feed'

export default async function ActivityPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify case belongs to user
  const { error } = await supabase.from('cases').select('id').eq('id', id).single()
  if (error) redirect('/cases')

  // Fetch initial batch server-side
  const { data: events } = await supabase
    .from('task_events')
    .select('id, case_id, task_id, kind, payload, created_at, tasks(title)')
    .eq('case_id', id)
    .order('created_at', { ascending: false })
    .limit(21)

  const hasMore = (events?.length ?? 0) > 20
  const initialEvents = (events ?? []).slice(0, 20).map((e) => {
    const { tasks, ...rest } = e as Record<string, unknown>
    return {
      ...rest,
      task_title: (tasks as { title: string } | null)?.title ?? null,
    }
  })

  const nextCursor = hasMore
    ? initialEvents[initialEvents.length - 1]?.created_at as string
    : null

  return (
    <div className="min-h-screen bg-warm-bg">
      <main className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-warm-text">Case Activity</h1>
          <p className="text-sm text-warm-muted mt-1">Full history of all actions and events in this case.</p>
        </div>
        <ActivityFeed
          caseId={id}
          initialEvents={initialEvents as Array<{ id: string; kind: string; payload: Record<string, unknown>; created_at: string; task_title?: string }>}
          initialCursor={nextCursor}
          initialHasMore={hasMore}
        />
      </main>
    </div>
  )
}
```

---

## Task 4: ActivityFeed Client Component

**Files:**
- Create: `src/components/activity/activity-feed.tsx`

```typescript
'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { describeEvent, relativeTime } from '@/components/dashboard/timeline-card'

interface TimelineEvent {
  id: string
  kind: string
  payload: Record<string, unknown>
  created_at: string
  task_title?: string
}

interface ActivityFeedProps {
  caseId: string
  initialEvents: TimelineEvent[]
  initialCursor: string | null
  initialHasMore: boolean
}

const EVENT_CATEGORIES: Record<string, string[]> = {
  all: [],
  tasks: ['task_status_changed', 'task_unlocked', 'gatekeeper_run', 'case_created'],
  deadlines: ['deadline_created', 'answer_deadline_confirmed', 'deadlines_generated', 'discovery_response_deadline_set'],
  documents: [
    'document_uploaded', 'court_document_uploaded', 'extraction_completed',
    'filing_draft_generated', 'preservation_letter_draft_generated',
    'preservation_letter_draft_saved', 'preservation_letter_sent',
    'disclaimer_acknowledged',
  ],
  discovery: [
    'discovery_pack_created', 'discovery_pack_status_changed', 'discovery_template_acknowledged',
    'discovery_item_added', 'discovery_pack_served', 'discovery_packet_exported',
    'discovery_response_received',
    'objection_review_created', 'objection_text_extracted', 'objection_classified',
    'objection_review_confirmed', 'meet_and_confer_generated', 'meet_and_confer_sent',
  ],
  evidence: ['evidence_uploaded', 'evidence_exported'],
  motions: ['motion_created'],
  exhibits: ['exhibit_set_created', 'exhibit_added', 'exhibits_reordered', 'exhibit_list_exported', 'exhibit_removed', 'trial_binder_generated', 'trial_binder_failed', 'trial_binder_downloaded'],
  system: ['health_alert_triggered', 'reminder_escalated', 'strategy_generated', 'note_added', 'service_facts_confirmed'],
}

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All Events',
  tasks: 'Tasks',
  deadlines: 'Deadlines',
  documents: 'Documents',
  discovery: 'Discovery',
  evidence: 'Evidence',
  motions: 'Motions',
  exhibits: 'Exhibits & Binders',
  system: 'System',
}

export function ActivityFeed({ caseId, initialEvents, initialCursor, initialHasMore }: ActivityFeedProps) {
  const [allEvents, setAllEvents] = useState(initialEvents)
  const [cursor, setCursor] = useState(initialCursor)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')

  const filteredEvents = filter === 'all'
    ? allEvents
    : allEvents.filter((e) => EVENT_CATEGORIES[filter]?.includes(e.kind))

  const loadMore = useCallback(async () => {
    if (!cursor || loading) return
    setLoading(true)
    try {
      const res = await fetch(`/api/cases/${caseId}/timeline?cursor=${encodeURIComponent(cursor)}&limit=20`)
      if (res.ok) {
        const data = await res.json()
        const newEvents = data.events as TimelineEvent[]
        setAllEvents((prev) => [...prev, ...newEvents])
        setHasMore(data.has_more)
        setCursor(data.next_cursor)
      }
    } catch { /* silent */ }
    setLoading(false)
  }, [caseId, cursor, loading])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-warm-muted">{filteredEvents.length} events</p>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="pt-6">
          {filteredEvents.length === 0 ? (
            <p className="text-sm text-warm-muted text-center py-8">
              {filter === 'all' ? 'No activity recorded yet.' : 'No events match this filter.'}
            </p>
          ) : (
            <ul className="space-y-4">
              {filteredEvents.map((event) => (
                <li key={event.id} className="flex items-start gap-3">
                  <span
                    className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-calm-indigo"
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-warm-text">{describeEvent(event)}</p>
                    <p className="text-xs text-warm-muted">{relativeTime(event.created_at)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {hasMore && (
            <div className="mt-4 text-center">
              <Button variant="ghost" size="sm" onClick={loadMore} disabled={loading}>
                {loading ? 'Loading...' : 'Load more events'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## Task 5: Enhanced CaseCard with Analytics

**Files:**
- Modify: `src/components/cases/case-card.tsx`

Replace the entire component with a richer version that shows health score, task progress, next deadline, and last activity:

```typescript
'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface CaseCardProps {
  id: string
  county: string | null
  role: string
  courtType: string | null
  disputeType: string | null
  createdAt: string
  healthScore: number | null
  tasksCompleted: number
  tasksTotal: number
  nextDeadline: string | null
  lastActivity: string | null
}

function healthColor(score: number | null): string {
  if (score === null) return 'bg-gray-100 text-gray-600'
  if (score >= 70) return 'bg-green-100 text-green-700'
  if (score >= 40) return 'bg-amber-100 text-amber-700'
  return 'bg-red-100 text-red-700'
}

function relativeDate(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffDays = Math.round((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'tomorrow'
  if (diffDays > 1 && diffDays <= 7) return `in ${diffDays} days`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)
  if (diffHours < 1) return 'just now'
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return '1d ago'
  if (diffDays < 30) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const DISPUTE_LABELS: Record<string, string> = {
  debt_collection: 'Debt',
  landlord_tenant: 'Landlord/Tenant',
  personal_injury: 'Personal Injury',
  contract: 'Contract',
  property: 'Property',
  family: 'Family',
  other: 'Other',
}

export function CaseCard({
  id, county, role, courtType, disputeType, createdAt,
  healthScore, tasksCompleted, tasksTotal, nextDeadline, lastActivity,
}: CaseCardProps) {
  const displayCounty = county || 'County not set'
  const roleLabel = role === 'plaintiff' ? 'Plaintiff' : 'Defendant'
  const courtLabel = courtType === 'jp' ? 'JP' : courtType === 'county' ? 'County' : courtType === 'district' ? 'District' : courtType === 'federal' ? 'Federal' : null
  const disputeLabel = disputeType ? DISPUTE_LABELS[disputeType] ?? disputeType : null
  const percentage = tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="py-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-medium text-warm-text">{displayCounty}</span>
              <Badge variant="secondary" className="text-xs">{roleLabel}</Badge>
              {courtLabel && <Badge variant="outline" className="text-xs">{courtLabel}</Badge>}
              {disputeLabel && <Badge variant="outline" className="text-xs">{disputeLabel}</Badge>}
            </div>
            <p className="text-xs text-warm-muted">
              Started {new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              {lastActivity && <> &middot; Active {timeAgo(lastActivity)}</>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`text-xs ${healthColor(healthScore)}`}>
              {healthScore !== null ? `${healthScore}%` : '—'}
            </Badge>
            <Button asChild size="sm">
              <Link href={`/case/${id}`}>Continue</Link>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-warm-muted">{tasksCompleted}/{tasksTotal} tasks</span>
              {nextDeadline && (
                <span className="text-xs text-calm-amber font-medium">
                  Due {relativeDate(nextDeadline)}
                </span>
              )}
            </div>
            <Progress value={percentage} className="h-1.5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## Task 6: Dashboard Analytics — Stats Cards + Enhanced Cases Page

**Files:**
- Create: `src/components/cases/stats-cards.tsx`
- Modify: `src/app/(authenticated)/cases/page.tsx`

**`stats-cards.tsx`:**

```typescript
import { Card, CardContent } from '@/components/ui/card'
import { Briefcase, CheckCircle2, Clock, Heart } from 'lucide-react'

interface StatsCardsProps {
  activeCases: number
  tasksCompleted: number
  tasksTotal: number
  upcomingDeadlines: number
  averageHealth: number | null
}

export function StatsCards({ activeCases, tasksCompleted, tasksTotal, upcomingDeadlines, averageHealth }: StatsCardsProps) {
  const stats = [
    { label: 'Active Cases', value: activeCases, icon: Briefcase, color: 'text-calm-indigo' },
    { label: 'Tasks Done', value: `${tasksCompleted}/${tasksTotal}`, icon: CheckCircle2, color: 'text-calm-green' },
    { label: 'Deadlines (7d)', value: upcomingDeadlines, icon: Clock, color: 'text-calm-amber' },
    { label: 'Avg Health', value: averageHealth !== null ? `${averageHealth}%` : '—', icon: Heart, color: averageHealth !== null && averageHealth >= 70 ? 'text-calm-green' : averageHealth !== null && averageHealth >= 40 ? 'text-calm-amber' : 'text-red-500' },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="py-4 px-4 flex items-center gap-3">
            <stat.icon className={`h-5 w-5 ${stat.color} shrink-0`} />
            <div>
              <p className="text-lg font-semibold text-warm-text">{stat.value}</p>
              <p className="text-xs text-warm-muted">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

**Modify `cases/page.tsx`:**

Replace the entire page to fetch analytics data and pass richer props to CaseCard:

```typescript
import { createClient } from '@/lib/supabase/server'
import { SupportiveHeader } from '@/components/layout/supportive-header'
import { LegalDisclaimer } from '@/components/layout/legal-disclaimer'
import { CaseCard } from '@/components/cases/case-card'
import { NewCaseDialog } from '@/components/cases/new-case-dialog'
import { OnboardingChecklist } from '@/components/dashboard/onboarding-checklist'
import { StatsCards } from '@/components/cases/stats-cards'

export default async function CasesPage() {
  const supabase = await createClient()

  const { data: cases } = await supabase
    .from('cases')
    .select('id, county, role, court_type, dispute_type, created_at')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  const hasCases = cases && cases.length > 0
  const caseIds = (cases ?? []).map((c) => c.id)

  // Fetch analytics data in parallel
  const [tasksResult, deadlinesResult, healthResult, activityResult, userResult, docResult] = await Promise.all([
    // Task counts across all cases
    hasCases
      ? supabase.from('tasks').select('case_id, status').in('case_id', caseIds)
      : Promise.resolve({ data: [] }),
    // Upcoming deadlines (next 7 days)
    hasCases
      ? supabase.from('deadlines').select('case_id, due_at').in('case_id', caseIds)
          .gte('due_at', new Date().toISOString())
          .lte('due_at', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
      : Promise.resolve({ data: [] }),
    // Latest health scores per case
    hasCases
      ? supabase.from('case_risk_scores').select('case_id, overall_score, computed_at')
          .in('case_id', caseIds).order('computed_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    // Last activity per case (most recent event)
    hasCases
      ? supabase.from('task_events').select('case_id, created_at')
          .in('case_id', caseIds).order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    // User for onboarding
    supabase.auth.getUser(),
    // Document count for onboarding
    hasCases
      ? supabase.from('court_documents').select('id', { count: 'exact', head: true }).in('case_id', caseIds)
      : Promise.resolve({ count: 0 }),
  ])

  const allTasks = (tasksResult.data ?? []) as { case_id: string; status: string }[]
  const allDeadlines = (deadlinesResult.data ?? []) as { case_id: string; due_at: string }[]
  const allHealth = (healthResult.data ?? []) as { case_id: string; overall_score: number; computed_at: string }[]
  const allActivity = (activityResult.data ?? []) as { case_id: string; created_at: string }[]

  // Aggregate stats
  const totalCompleted = allTasks.filter((t) => t.status === 'completed' || t.status === 'done').length
  const totalTasks = allTasks.length

  // Get latest health per case (deduplicate — first per case_id since ordered desc)
  const healthByCase = new Map<string, number>()
  for (const h of allHealth) {
    if (!healthByCase.has(h.case_id)) healthByCase.set(h.case_id, h.overall_score)
  }
  const healthScores = Array.from(healthByCase.values())
  const avgHealth = healthScores.length > 0 ? Math.round(healthScores.reduce((a, b) => a + b, 0) / healthScores.length) : null

  // Per-case task counts
  const tasksByCase = new Map<string, { completed: number; total: number }>()
  for (const t of allTasks) {
    const entry = tasksByCase.get(t.case_id) ?? { completed: 0, total: 0 }
    entry.total++
    if (t.status === 'completed' || t.status === 'done') entry.completed++
    tasksByCase.set(t.case_id, entry)
  }

  // Per-case next deadline
  const deadlineByCase = new Map<string, string>()
  for (const d of allDeadlines) {
    if (!deadlineByCase.has(d.case_id) || d.due_at < deadlineByCase.get(d.case_id)!) {
      deadlineByCase.set(d.case_id, d.due_at)
    }
  }

  // Per-case last activity
  const activityByCase = new Map<string, string>()
  for (const a of allActivity) {
    if (!activityByCase.has(a.case_id)) activityByCase.set(a.case_id, a.created_at)
  }

  // Onboarding
  const user = userResult.data?.user
  const onboarding = (user?.user_metadata?.onboarding as { dismissed?: boolean } | undefined) ?? {}
  const isDismissed = onboarding.dismissed === true
  const hasCase = Boolean(hasCases)
  const hasDocument = ((docResult as { count?: number | null }).count ?? 0) > 0
  const hasProfile = Boolean(user?.user_metadata?.display_name)

  const checklistItems = [
    { key: 'create_case', label: 'Create your first case', href: '#new-case', completed: hasCase },
    { key: 'upload_document', label: 'Upload a document', href: hasCases ? `/case/${cases![0].id}` : '/cases', completed: hasDocument },
    { key: 'explore_evidence', label: 'Explore the evidence vault', href: hasCases ? `/case/${cases![0].id}/evidence` : '/cases', completed: false },
    { key: 'review_deadlines', label: 'Review your deadlines', href: hasCases ? `/case/${cases![0].id}/deadlines` : '/cases', completed: false },
    { key: 'setup_profile', label: 'Set up your profile', href: '/settings', completed: hasProfile },
  ]

  return (
    <div className="min-h-screen bg-warm-bg">
      <main className="mx-auto max-w-2xl px-4 py-10">
        <SupportiveHeader
          title="Your Cases"
          subtitle="Welcome back. Let's keep moving."
        />

        <OnboardingChecklist items={checklistItems} dismissed={isDismissed} />

        {hasCases && (
          <StatsCards
            activeCases={cases.length}
            tasksCompleted={totalCompleted}
            tasksTotal={totalTasks}
            upcomingDeadlines={allDeadlines.length}
            averageHealth={avgHealth}
          />
        )}

        {hasCases ? (
          <div className="space-y-3">
            {cases.map((c) => {
              const taskData = tasksByCase.get(c.id) ?? { completed: 0, total: 0 }
              return (
                <CaseCard
                  key={c.id}
                  id={c.id}
                  county={c.county}
                  role={c.role}
                  courtType={c.court_type}
                  disputeType={c.dispute_type}
                  createdAt={c.created_at}
                  healthScore={healthByCase.get(c.id) ?? null}
                  tasksCompleted={taskData.completed}
                  tasksTotal={taskData.total}
                  nextDeadline={deadlineByCase.get(c.id) ?? null}
                  lastActivity={activityByCase.get(c.id) ?? null}
                />
              )
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-warm-border bg-white py-16 text-center">
            <p className="text-warm-muted">
              No cases yet. Let&apos;s get started — one step at a time.
            </p>
          </div>
        )}

        <div className="mt-8">
          <NewCaseDialog />
        </div>

        <LegalDisclaimer />
      </main>
    </div>
  )
}
```

---

## Task 7: Build & Test Verification

1. Run all existing tests — expect all passing
2. `npx next build` — no type errors
3. Verify new routes appear in build output:
   - `/case/[id]/activity`
4. Verify dashboard shows StatsCards above case list
5. Verify CaseCard shows health score, progress, deadline, last activity
6. Verify TimelineCard has "Load more" and "View all activity" buttons
7. Verify Activity page has filter dropdown and infinite scroll

---

## File Summary

| File | Action | Feature |
|------|--------|---------|
| `src/components/dashboard/timeline-card.tsx` | Modify | Complete describeEvent + load more + link |
| `src/app/(authenticated)/case/[id]/activity/page.tsx` | Create | Activity page |
| `src/components/activity/activity-feed.tsx` | Create | Activity feed client component |
| `src/components/cases/case-card.tsx` | Modify | Enhanced card with analytics |
| `src/components/cases/stats-cards.tsx` | Create | Stats grid component |
| `src/app/(authenticated)/cases/page.tsx` | Modify | Analytics data fetching |
| `src/app/(authenticated)/case/[id]/page.tsx` | Modify | Pass caseId to TimelineCard |

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| No cases | Stats hidden, empty state shown |
| No events for case | Activity page shows "No activity recorded yet" |
| No health score | Badge shows "—" |
| Filter returns nothing | "No events match this filter" |
| 100+ events | Infinite scroll, 20 per page |
| New case with no tasks | Progress shows 0/0, no bar |
| Task status is 'done' vs 'completed' | Both counted as completed |
