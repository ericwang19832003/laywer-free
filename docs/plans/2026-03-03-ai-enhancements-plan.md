# AI Enhancement Opportunities Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Add 5 AI-powered features: contextual task descriptions, evidence categorization suggestions, narrative timeline summaries, health score tips, and strategic case recommendations.

**Architecture:** Features 1-4 use GPT-4o-mini (JSON output, optional with static fallback). Feature 5 uses Claude (complex legal reasoning). Each feature follows the established pattern: prompt builder + safety check + static fallback in `src/lib/<feature>/`, API route in `src/app/api/`, UI integration in existing dashboard components. New `ai_cache` table for server-side caching of AI results.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind, Supabase, OpenAI GPT-4o-mini, Anthropic Claude, Zod, vitest

---

## Task 1: Migration — `ai_cache` table

**Files:**
- Create: `supabase/migrations/20260303000001_ai_cache_table.sql`

```sql
-- Shared cache for AI-generated content
CREATE TABLE IF NOT EXISTS public.ai_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  cache_key text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}',
  generated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Unique per case+key, latest wins
CREATE UNIQUE INDEX idx_ai_cache_case_key ON public.ai_cache (case_id, cache_key);
CREATE INDEX idx_ai_cache_expiry ON public.ai_cache (expires_at) WHERE expires_at IS NOT NULL;

-- RLS
ALTER TABLE public.ai_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own case AI cache"
  ON public.ai_cache FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.cases WHERE cases.id = ai_cache.case_id AND cases.user_id = auth.uid())
  );

CREATE POLICY "Users can upsert own case AI cache"
  ON public.ai_cache FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.cases WHERE cases.id = ai_cache.case_id AND cases.user_id = auth.uid())
  );

CREATE POLICY "Users can update own case AI cache"
  ON public.ai_cache FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.cases WHERE cases.id = ai_cache.case_id AND cases.user_id = auth.uid())
  );
```

**Cache keys used by features:**
- `timeline_summary` — Feature 3
- `health_tips` — Feature 4
- `strategy` — Feature 5

Features 1 and 2 store results directly on existing rows (`tasks.metadata`, `evidence_items` metadata).

---

## Task 2: AI Task Descriptions — Lib Module

**Pattern:** `src/lib/risk/explain.ts` — system prompt, prompt builder, safety check, static fallback.

**Files:**
- Create: `src/lib/ai/task-descriptions.ts`

```typescript
import { z } from 'zod'

// --- Schema ---
export const taskDescriptionSchema = z.object({
  description: z.string().min(10).max(500),
  importance: z.enum(['critical', 'important', 'helpful']),
})

export type TaskDescription = z.infer<typeof taskDescriptionSchema>

// --- Safety ---
const BLOCKED_PHRASES = Object.freeze([
  'you must', 'you should', 'file immediately', 'urgent',
  'sanctions', 'winning', 'losing', 'guaranteed',
  'i recommend', 'legal advice',
])

export function isTaskDescriptionSafe(text: string): boolean {
  const lower = text.toLowerCase()
  return !BLOCKED_PHRASES.some((phrase) => lower.includes(phrase))
}

// --- Static fallback ---
const STATIC_DESCRIPTIONS: Record<string, TaskDescription> = {
  welcome: {
    description: 'This introductory step walks you through what to expect in your case journey and how this tool helps you stay organized.',
    importance: 'helpful',
  },
  intake: {
    description: 'Gathering your case details helps us tailor every future step to your specific court, dispute type, and situation.',
    importance: 'critical',
  },
  prepare_filing: {
    description: 'Your initial court filing establishes your legal claims. Getting the format and content right is essential for the court to accept it.',
    importance: 'critical',
  },
  file_with_court: {
    description: 'Submitting your filing to the court officially starts your case. This step tracks what you need to do at the courthouse or online.',
    importance: 'critical',
  },
  preservation_letter: {
    description: 'A preservation letter puts the other side on notice to keep relevant evidence. Sending this early protects your ability to obtain proof later.',
    importance: 'important',
  },
  upload_return_of_service: {
    description: 'Proof of service shows the court that the other party was properly notified. Without it, your case cannot move forward.',
    importance: 'critical',
  },
  confirm_service_facts: {
    description: 'Confirming the dates and method of service lets us calculate your critical deadlines accurately.',
    importance: 'critical',
  },
  wait_for_answer: {
    description: 'After service, the other side has a set number of days to respond. This step tracks that window and prepares you for what comes next.',
    importance: 'helpful',
  },
  check_docket_for_answer: {
    description: 'Checking whether an answer was filed determines your next path — either requesting a default judgment or preparing for discovery.',
    importance: 'critical',
  },
  default_packet_prep: {
    description: 'If the other side did not respond in time, you may be able to win by default. This packet asks the court to enter judgment in your favor.',
    importance: 'critical',
  },
  upload_answer: {
    description: 'Uploading the defendant\'s answer lets us analyze their defenses and counterclaims so you can plan your response strategy.',
    importance: 'important',
  },
  evidence_vault: {
    description: 'Organizing your evidence now makes everything easier later — from discovery requests to trial preparation.',
    importance: 'important',
  },
  discovery_starter_pack: {
    description: 'Discovery is how you legally request information from the other side. This starter pack gives you the standard requests for your case type.',
    importance: 'important',
  },
  understand_removal: {
    description: 'Your case was moved to federal court. Understanding why this happened and what it means helps you decide your next move.',
    importance: 'critical',
  },
  choose_removal_strategy: {
    description: 'You need to decide whether to accept federal court, file to send the case back to state court, or do both. Each path has trade-offs.',
    importance: 'critical',
  },
  prepare_amended_complaint: {
    description: 'Amending your complaint can remove the basis for federal jurisdiction, which is key to getting your case sent back to state court.',
    importance: 'important',
  },
  file_amended_complaint: {
    description: 'Filing your amended complaint with the court puts your changes on record and supports your remand motion.',
    importance: 'important',
  },
  prepare_remand_motion: {
    description: 'A motion to remand asks the federal court to send your case back to state court. This is your formal argument for why removal was improper.',
    importance: 'critical',
  },
  file_remand_motion: {
    description: 'Filing your remand motion starts the clock on the court\'s decision about whether your case belongs in federal or state court.',
    importance: 'critical',
  },
  rule_26f_prep: {
    description: 'Rule 26(f) requires both sides to meet and plan for discovery before the court conference. Being prepared shows the judge you are organized.',
    importance: 'important',
  },
  mandatory_disclosures: {
    description: 'Federal rules require you to disclose key witnesses and documents early, even without being asked. Missing this deadline can limit your evidence at trial.',
    importance: 'critical',
  },
  motion_to_compel: {
    description: 'If the other side is not cooperating with discovery, a motion to compel asks the court to order them to respond.',
    importance: 'important',
  },
  trial_prep_checklist: {
    description: 'Trial preparation covers everything from witness lists to exhibit organization. This checklist ensures nothing is missed before your court date.',
    importance: 'critical',
  },
  appellate_brief: {
    description: 'An appellate brief explains to a higher court why the trial court\'s decision was wrong. Strong legal arguments are essential here.',
    importance: 'critical',
  },
}

export function getStaticTaskDescription(taskKey: string): TaskDescription {
  return STATIC_DESCRIPTIONS[taskKey] ?? {
    description: 'Complete this step to move your case forward. Each task builds on the previous ones to keep your case on track.',
    importance: 'helpful' as const,
  }
}

// --- Prompt builder ---
export const TASK_DESCRIPTION_SYSTEM_PROMPT = `You explain legal procedure steps to a pro se litigant (someone representing themselves in court).

Given a task name and case context, write a 2-3 sentence description explaining WHY this step matters for their specific case. Be encouraging but honest. Use plain language.

RULES:
- Never give specific legal advice
- Never use directive language ("you must", "you should")
- Never predict outcomes ("winning", "losing", "guaranteed")
- Focus on WHY this step matters, not HOW to do it
- Tailor to their court type and dispute type when relevant

Respond with JSON only: { "description": "...", "importance": "critical" | "important" | "helpful" }`

export function buildTaskDescriptionPrompt(input: {
  task_key: string
  task_title: string
  court_type: string
  dispute_type: string | null
  role: string
  completed_tasks: string[]
}): string {
  const lines = [
    `Task: ${input.task_title} (${input.task_key})`,
    `Court: ${input.court_type}`,
    `Dispute: ${input.dispute_type ?? 'general'}`,
    `Role: ${input.role}`,
    `Completed steps: ${input.completed_tasks.length > 0 ? input.completed_tasks.join(', ') : 'none yet'}`,
  ]
  return lines.join('\n')
}
```

---

## Task 3: AI Task Descriptions — API Route

**Pattern:** `src/app/api/cases/[id]/risk/explain/route.ts` — OpenAI with static fallback.

**Files:**
- Create: `src/app/api/cases/[id]/task-description/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import {
  taskDescriptionSchema,
  isTaskDescriptionSafe,
  getStaticTaskDescription,
  buildTaskDescriptionPrompt,
  TASK_DESCRIPTION_SYSTEM_PROMPT,
} from '@/lib/ai/task-descriptions'

export const runtime = 'nodejs'
export const maxDuration = 30

const AI_MODEL = 'gpt-4o-mini'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    const taskKey = request.nextUrl.searchParams.get('task_key')
    if (!taskKey) {
      return NextResponse.json({ error: 'task_key is required' }, { status: 400 })
    }

    // Fetch case context
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('id, role, court_type, dispute_type')
      .eq('id', caseId)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    // Fetch task title
    const { data: task } = await supabase
      .from('tasks')
      .select('title, metadata')
      .eq('case_id', caseId)
      .eq('task_key', taskKey)
      .single()

    // Check if we already have a cached AI description in task metadata
    const existing = task?.metadata as Record<string, unknown> | null
    if (existing?.ai_description) {
      return NextResponse.json({
        ...(existing.ai_description as Record<string, unknown>),
        _meta: { source: 'cached' },
      })
    }

    // Build static fallback first
    let result = getStaticTaskDescription(taskKey)
    let source: 'ai' | 'static' = 'static'

    // Fetch completed tasks for context
    const { data: completedTasks } = await supabase
      .from('tasks')
      .select('task_key')
      .eq('case_id', caseId)
      .eq('status', 'completed')

    // Try AI
    if (process.env.OPENAI_API_KEY) {
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
        const userPrompt = buildTaskDescriptionPrompt({
          task_key: taskKey,
          task_title: task?.title ?? taskKey,
          court_type: caseData.court_type ?? 'unknown',
          dispute_type: caseData.dispute_type,
          role: caseData.role ?? 'plaintiff',
          completed_tasks: (completedTasks ?? []).map((t) => t.task_key),
        })

        const completion = await openai.chat.completions.create({
          model: AI_MODEL,
          temperature: 0.4,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: TASK_DESCRIPTION_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
        })

        const raw = completion.choices[0]?.message?.content
        if (raw) {
          const parsed = JSON.parse(raw)
          const validated = taskDescriptionSchema.safeParse(parsed)
          if (validated.success && isTaskDescriptionSafe(validated.data.description)) {
            result = validated.data
            source = 'ai'
          }
        }
      } catch (err) {
        console.error('[task-description] AI call failed, using static fallback:', err)
      }
    }

    // Cache in task metadata (fire-and-forget)
    if (task && source === 'ai') {
      supabase
        .from('tasks')
        .update({
          metadata: { ...(existing ?? {}), ai_description: result },
        })
        .eq('case_id', caseId)
        .eq('task_key', taskKey)
        .then(() => {})
    }

    return NextResponse.json({
      ...result,
      _meta: { source, model: source === 'ai' ? AI_MODEL : null },
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

---

## Task 4: AI Task Descriptions — Wire into UI

**Files:**
- Modify: `src/components/dashboard/next-step-card.tsx`
- Modify: `src/app/(authenticated)/case/[id]/page.tsx`

**Changes to `next-step-card.tsx`:**

Add `taskDescription` prop and importance badge:

```typescript
// Add to NextStepCardProps:
taskDescription?: { description: string; importance: 'critical' | 'important' | 'helpful' } | null

// Replace the hardcoded description paragraph with:
{props.taskDescription ? (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        props.taskDescription.importance === 'critical'
          ? 'bg-red-100 text-red-700'
          : props.taskDescription.importance === 'important'
          ? 'bg-amber-100 text-amber-700'
          : 'bg-blue-100 text-blue-700'
      }`}>
        {props.taskDescription.importance === 'critical' ? 'Critical' :
         props.taskDescription.importance === 'important' ? 'Important' : 'Helpful'}
      </span>
    </div>
    <p className="text-sm text-warm-muted">{props.taskDescription.description}</p>
  </div>
) : (
  <p className="text-sm text-warm-muted">This helps us organize your documents and timeline.</p>
)}
```

**Changes to `case/[id]/page.tsx`:**

After the existing `Promise.all`, add a fetch for the next task's AI description:

```typescript
// After getting dashboard result, if there's a next_task:
let taskDescription = null
if (dashboard?.next_task) {
  const { data: descData } = await supabase
    .from('tasks')
    .select('metadata')
    .eq('id', dashboard.next_task.id)
    .single()

  const meta = descData?.metadata as Record<string, unknown> | null
  if (meta?.ai_description) {
    taskDescription = meta.ai_description as { description: string; importance: string }
  }
}

// Pass to NextStepCard:
<NextStepCard caseId={id} nextTask={dashboard.next_task} taskDescription={taskDescription} />
```

---

## Task 5: AI Evidence Categorization — Lib Module

**Files:**
- Create: `src/lib/ai/evidence-categorization.ts`

```typescript
import { z } from 'zod'

const CATEGORIES = [
  'Contract', 'Photos', 'Emails', 'Text Messages',
  'Financial Records', 'Medical Records', 'Other',
] as const

export const evidenceCategorySchema = z.object({
  suggested_category: z.enum(CATEGORIES),
  relevance_note: z.string().max(200),
})

export type EvidenceCategorySuggestion = z.infer<typeof evidenceCategorySchema>

const BLOCKED_PHRASES = Object.freeze([
  'you must', 'you should', 'file immediately', 'urgent',
  'sanctions', 'legal advice', 'guaranteed',
])

export function isCategorySafe(text: string): boolean {
  const lower = text.toLowerCase()
  return !BLOCKED_PHRASES.some((phrase) => lower.includes(phrase))
}

// --- File name heuristics fallback ---
const HEURISTICS: [RegExp, typeof CATEGORIES[number]][] = [
  [/\b(contract|agreement|lease|deed|terms)\b/i, 'Contract'],
  [/\b(photo|img|image|screenshot|pic|jpg|jpeg|png|heic)\b/i, 'Photos'],
  [/\b(email|gmail|outlook|message|correspondence)\b/i, 'Emails'],
  [/\b(text|sms|imessage|chat|whatsapp)\b/i, 'Text Messages'],
  [/\b(invoice|receipt|bank|statement|financial|tax|w2|1099|pay\s?stub)\b/i, 'Financial Records'],
  [/\b(medical|doctor|hospital|diagnosis|treatment|health|prescription)\b/i, 'Medical Records'],
]

export function getHeuristicCategory(fileName: string): EvidenceCategorySuggestion | null {
  for (const [pattern, category] of HEURISTICS) {
    if (pattern.test(fileName)) {
      return { suggested_category: category, relevance_note: `Suggested based on file name "${fileName}".` }
    }
  }
  return null
}

export const EVIDENCE_CATEGORIZATION_SYSTEM_PROMPT = `You categorize evidence files for a pro se litigant organizing their legal case.

Given a file name, file type, and optionally a text snippet from the file, suggest the most appropriate category and a brief note about why this file might be relevant to a legal case.

Available categories: ${CATEGORIES.join(', ')}

RULES:
- Never give legal advice
- Never use directive language
- Keep the relevance note under 200 characters
- If uncertain, use "Other"

Respond with JSON only: { "suggested_category": "...", "relevance_note": "..." }`

export function buildCategorizationPrompt(input: {
  file_name: string
  mime_type: string | null
  text_snippet?: string
}): string {
  const lines = [
    `File: ${input.file_name}`,
    `Type: ${input.mime_type ?? 'unknown'}`,
  ]
  if (input.text_snippet) {
    lines.push(`First 500 characters:\n${input.text_snippet}`)
  }
  return lines.join('\n')
}
```

---

## Task 6: AI Evidence Categorization — API Route + UI Integration

**Files:**
- Create: `src/app/api/cases/[id]/evidence/categorize/route.ts`
- Modify: `src/components/evidence/evidence-vault.tsx`

**API route (`categorize/route.ts`):**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import {
  evidenceCategorySchema,
  isCategorySafe,
  getHeuristicCategory,
  buildCategorizationPrompt,
  EVIDENCE_CATEGORIZATION_SYSTEM_PROMPT,
} from '@/lib/ai/evidence-categorization'

export const runtime = 'nodejs'
export const maxDuration = 30

const AI_MODEL = 'gpt-4o-mini'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    // Verify case
    const { error: caseError } = await supabase
      .from('cases').select('id').eq('id', caseId).single()
    if (caseError) return NextResponse.json({ error: 'Case not found' }, { status: 404 })

    const body = await request.json()
    const { file_name, mime_type, text_snippet } = body

    if (!file_name) {
      return NextResponse.json({ error: 'file_name is required' }, { status: 400 })
    }

    // Try heuristic first
    let result = getHeuristicCategory(file_name)
    let source: 'ai' | 'heuristic' | 'none' = result ? 'heuristic' : 'none'

    // Try AI if available
    if (process.env.OPENAI_API_KEY) {
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
        const userPrompt = buildCategorizationPrompt({ file_name, mime_type, text_snippet })

        const completion = await openai.chat.completions.create({
          model: AI_MODEL,
          temperature: 0.3,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: EVIDENCE_CATEGORIZATION_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
        })

        const raw = completion.choices[0]?.message?.content
        if (raw) {
          const parsed = JSON.parse(raw)
          const validated = evidenceCategorySchema.safeParse(parsed)
          if (validated.success && isCategorySafe(validated.data.relevance_note)) {
            result = validated.data
            source = 'ai'
          }
        }
      } catch (err) {
        console.error('[evidence-categorize] AI call failed:', err)
      }
    }

    return NextResponse.json({
      suggestion: result,
      _meta: { source, model: source === 'ai' ? AI_MODEL : null },
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Changes to `evidence-vault.tsx`:**

Add state for AI suggestion and fetch after file selection:

```typescript
// New state
const [aiSuggestion, setAiSuggestion] = useState<{
  suggested_category: string; relevance_note: string
} | null>(null)
const [categorizing, setCategorizing] = useState(false)

// After file is selected (in handleDrop or onChange), trigger categorization:
async function suggestCategory(selectedFile: File) {
  setCategorizing(true)
  setAiSuggestion(null)
  try {
    const res = await fetch(`/api/cases/${caseId}/evidence/categorize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_name: selectedFile.name, mime_type: selectedFile.type }),
    })
    if (res.ok) {
      const data = await res.json()
      if (data.suggestion) {
        setAiSuggestion(data.suggestion)
        if (!category) {
          setCategory(data.suggestion.suggested_category)
        }
      }
    }
  } catch { /* silent */ }
  setCategorizing(false)
}
```

In the upload form, between the drop zone and category select, add a suggestion chip:

```tsx
{categorizing && (
  <p className="text-xs text-warm-muted animate-pulse">Analyzing file...</p>
)}
{aiSuggestion && !categorizing && (
  <div className="flex items-center gap-2 rounded-md bg-calm-indigo/10 px-3 py-2 text-sm">
    <Sparkles className="h-4 w-4 text-calm-indigo" />
    <span className="text-warm-muted">
      Suggested: <strong className="text-warm-text">{aiSuggestion.suggested_category}</strong>
      {' — '}{aiSuggestion.relevance_note}
    </span>
  </div>
)}
```

Import `Sparkles` from `lucide-react`.

---

## Task 7: AI Timeline Summary — Lib Module

**Files:**
- Create: `src/lib/ai/timeline-summary.ts`

```typescript
import { z } from 'zod'

export const timelineSummarySchema = z.object({
  summary: z.string().min(20).max(1000),
  key_milestones: z.array(z.string()).max(5),
})

export type TimelineSummary = z.infer<typeof timelineSummarySchema>

const BLOCKED_PHRASES = Object.freeze([
  'you must', 'you should', 'file immediately', 'urgent',
  'sanctions', 'legal advice', 'guaranteed', 'winning', 'losing',
])

export function isTimelineSummarySafe(text: string): boolean {
  const lower = text.toLowerCase()
  return !BLOCKED_PHRASES.some((phrase) => lower.includes(phrase))
}

export function buildStaticTimelineSummary(eventCount: number, firstDate: string, lastDate: string): TimelineSummary {
  const days = Math.max(1, Math.round(
    (new Date(lastDate).getTime() - new Date(firstDate).getTime()) / (1000 * 60 * 60 * 24)
  ))
  return {
    summary: `Your case has ${eventCount} recorded events over ${days} day${days === 1 ? '' : 's'}. Review the timeline below for the full activity history.`,
    key_milestones: [],
  }
}

export const TIMELINE_SUMMARY_SYSTEM_PROMPT = `You summarize case activity timelines for a pro se litigant.

Given a list of case events (type and date), write a concise 3-5 sentence narrative summary of the case progress. Also identify up to 5 key milestones.

RULES:
- Use plain language a non-lawyer can understand
- Never give legal advice or predict outcomes
- Never use directive language ("you must", "you should")
- Focus on what has happened and what phase the case appears to be in
- Be encouraging but factual

Respond with JSON only: { "summary": "...", "key_milestones": ["...", "..."] }`

export function buildTimelineSummaryPrompt(events: { kind: string; created_at: string; task_title?: string }[]): string {
  const lines = events.map((e) => {
    const date = new Date(e.created_at).toLocaleDateString('en-US')
    const label = e.task_title ? `${e.kind} (${e.task_title})` : e.kind
    return `- ${date}: ${label}`
  })
  return `Case events (${events.length} total, chronological):\n${lines.join('\n')}`
}
```

---

## Task 8: AI Timeline Summary — API Route + UI Integration

**Files:**
- Create: `src/app/api/cases/[id]/timeline/summary/route.ts`
- Modify: `src/components/dashboard/timeline-card.tsx`
- Modify: `src/app/(authenticated)/case/[id]/page.tsx`

**API route (`timeline/summary/route.ts`):**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import {
  timelineSummarySchema,
  isTimelineSummarySafe,
  buildStaticTimelineSummary,
  buildTimelineSummaryPrompt,
  TIMELINE_SUMMARY_SYSTEM_PROMPT,
} from '@/lib/ai/timeline-summary'

export const runtime = 'nodejs'
export const maxDuration = 30

const AI_MODEL = 'gpt-4o-mini'
const CACHE_KEY = 'timeline_summary'
const STALE_HOURS = 24
const MIN_EVENTS = 3

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    // Verify case
    const { error: caseError } = await supabase
      .from('cases').select('id').eq('id', caseId).single()
    if (caseError) return NextResponse.json({ error: 'Case not found' }, { status: 404 })

    // Fetch events
    const { data: events } = await supabase
      .from('task_events')
      .select('kind, created_at, tasks(title)')
      .eq('case_id', caseId)
      .order('created_at', { ascending: true })

    const eventList = (events ?? []).map((e: Record<string, unknown>) => ({
      kind: e.kind as string,
      created_at: e.created_at as string,
      task_title: (e.tasks as Record<string, unknown> | null)?.title as string | undefined,
    }))

    if (eventList.length < MIN_EVENTS) {
      return NextResponse.json({
        summary: null,
        message: 'Not enough activity for a summary yet.',
        _meta: { source: 'none' },
      })
    }

    // Check cache
    const { data: cached } = await supabase
      .from('ai_cache')
      .select('content, generated_at')
      .eq('case_id', caseId)
      .eq('cache_key', CACHE_KEY)
      .single()

    if (cached) {
      const age = Date.now() - new Date(cached.generated_at).getTime()
      const staleMs = STALE_HOURS * 60 * 60 * 1000
      if (age < staleMs) {
        return NextResponse.json({
          ...cached.content,
          _meta: { source: 'cached', generated_at: cached.generated_at },
        })
      }
    }

    // Build static fallback
    let result = buildStaticTimelineSummary(
      eventList.length,
      eventList[0].created_at,
      eventList[eventList.length - 1].created_at
    )
    let source: 'ai' | 'static' = 'static'

    // Try AI
    if (process.env.OPENAI_API_KEY) {
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
        const userPrompt = buildTimelineSummaryPrompt(eventList)

        const completion = await openai.chat.completions.create({
          model: AI_MODEL,
          temperature: 0.4,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: TIMELINE_SUMMARY_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
        })

        const raw = completion.choices[0]?.message?.content
        if (raw) {
          const parsed = JSON.parse(raw)
          const validated = timelineSummarySchema.safeParse(parsed)
          if (validated.success && isTimelineSummarySafe(validated.data.summary)) {
            result = validated.data
            source = 'ai'
          }
        }
      } catch (err) {
        console.error('[timeline-summary] AI call failed:', err)
      }
    }

    // Cache result
    await supabase
      .from('ai_cache')
      .upsert({
        case_id: caseId,
        cache_key: CACHE_KEY,
        content: result,
        generated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + STALE_HOURS * 60 * 60 * 1000).toISOString(),
      }, { onConflict: 'case_id,cache_key' })

    return NextResponse.json({
      ...result,
      _meta: { source, model: source === 'ai' ? AI_MODEL : null },
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Changes to `timeline-card.tsx`:**

Add optional `summary` prop and render above the event list:

```typescript
// Update props interface:
interface TimelineCardProps {
  events: TimelineEvent[]
  summary?: { summary: string; key_milestones: string[] } | null
}

// Add before the <ul> in CardContent:
{props.summary && (
  <div className="mb-4 rounded-lg bg-calm-indigo/5 border border-calm-indigo/20 p-3 space-y-2">
    <div className="flex items-center gap-2">
      <Sparkles className="h-4 w-4 text-calm-indigo" />
      <span className="text-xs font-medium text-calm-indigo">AI Summary</span>
    </div>
    <p className="text-sm text-warm-muted">{props.summary.summary}</p>
    {props.summary.key_milestones.length > 0 && (
      <ul className="text-xs text-warm-muted space-y-1">
        {props.summary.key_milestones.map((m, i) => (
          <li key={i} className="flex items-start gap-1.5">
            <span className="text-calm-green mt-0.5">•</span> {m}
          </li>
        ))}
      </ul>
    )}
  </div>
)}
```

Import `Sparkles` from `lucide-react`.

**Changes to `case/[id]/page.tsx`:**

Fetch the timeline summary server-side and pass it:

```typescript
// Add to the data fetching section:
const { data: timelineSummaryCache } = await supabase
  .from('ai_cache')
  .select('content')
  .eq('case_id', id)
  .eq('cache_key', 'timeline_summary')
  .single()

const timelineSummary = timelineSummaryCache?.content as { summary: string; key_milestones: string[] } | null

// Pass to TimelineCard:
<TimelineCard events={dashboard.recent_events} summary={timelineSummary} />
```

---

## Task 9: AI Health Tips — Lib Module

**Files:**
- Create: `src/lib/ai/health-tips.ts`

```typescript
import { z } from 'zod'

export const healthTipsSchema = z.object({
  tips: z.array(z.object({
    tip: z.string().max(200),
    area: z.enum(['deadline', 'response', 'evidence', 'activity']),
  })).min(1).max(4),
})

export type HealthTips = z.infer<typeof healthTipsSchema>

const BLOCKED_PHRASES = Object.freeze([
  'you must', 'you should', 'file immediately', 'urgent',
  'sanctions', 'legal advice', 'guaranteed', 'winning', 'losing',
])

export function isHealthTipsSafe(text: string): boolean {
  const lower = text.toLowerCase()
  return !BLOCKED_PHRASES.some((phrase) => lower.includes(phrase))
}

export function buildStaticHealthTips(scores: {
  deadline_risk: number
  response_risk: number
  evidence_risk: number
  activity_risk: number
}): HealthTips {
  const tips: HealthTips['tips'] = []

  // Find the highest risk areas (lower score = more risk in 0-100 scale)
  if (scores.deadline_risk < 50) {
    tips.push({ tip: 'Review your upcoming deadlines — some may need attention soon.', area: 'deadline' })
  }
  if (scores.response_risk < 50) {
    tips.push({ tip: 'Check for any pending responses or filings that need follow-up.', area: 'response' })
  }
  if (scores.evidence_risk < 50) {
    tips.push({ tip: 'Consider uploading additional evidence to strengthen your case file.', area: 'evidence' })
  }
  if (scores.activity_risk < 50) {
    tips.push({ tip: 'Stay engaged with your case tasks to keep momentum going.', area: 'activity' })
  }

  if (tips.length === 0) {
    tips.push({ tip: 'Your case looks healthy! Keep an eye on upcoming deadlines.', area: 'activity' })
  }

  return { tips: tips.slice(0, 4) }
}

export const HEALTH_TIPS_SYSTEM_PROMPT = `You provide actionable health tips for a pro se litigant's case management.

Given case health scores (0-100, higher is better) across 4 areas, provide 2-4 short, specific tips to improve the case's health.

Areas: deadline (meeting court deadlines), response (filing responses on time), evidence (gathering and organizing proof), activity (regular engagement with case tasks).

RULES:
- Be encouraging and practical
- Never give specific legal advice
- Never use directive language ("you must", "you should")
- Focus on case management actions, not legal strategy
- Each tip should be under 200 characters
- Prioritize the weakest areas

Respond with JSON only: { "tips": [{ "tip": "...", "area": "deadline|response|evidence|activity" }] }`

export function buildHealthTipsPrompt(input: {
  overall_score: number
  deadline_risk: number
  response_risk: number
  evidence_risk: number
  activity_risk: number
  court_type: string
  dispute_type: string | null
  tasks_completed: number
  tasks_total: number
  evidence_count: number
}): string {
  return [
    `Overall health score: ${input.overall_score}/100`,
    `Deadline score: ${input.deadline_risk}/100`,
    `Response score: ${input.response_risk}/100`,
    `Evidence score: ${input.evidence_risk}/100`,
    `Activity score: ${input.activity_risk}/100`,
    `Court: ${input.court_type}`,
    `Dispute: ${input.dispute_type ?? 'general'}`,
    `Progress: ${input.tasks_completed}/${input.tasks_total} tasks completed`,
    `Evidence items uploaded: ${input.evidence_count}`,
  ].join('\n')
}
```

---

## Task 10: AI Health Tips — API Route + UI Integration

**Files:**
- Create: `src/app/api/cases/[id]/risk/tips/route.ts`
- Modify: `src/components/dashboard/case-health-card.tsx`
- Modify: `src/app/(authenticated)/case/[id]/page.tsx`

**API route (`risk/tips/route.ts`):**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import {
  healthTipsSchema,
  isHealthTipsSafe,
  buildStaticHealthTips,
  buildHealthTipsPrompt,
  HEALTH_TIPS_SYSTEM_PROMPT,
} from '@/lib/ai/health-tips'

export const runtime = 'nodejs'
export const maxDuration = 30

const AI_MODEL = 'gpt-4o-mini'
const CACHE_KEY = 'health_tips'
const STALE_HOURS = 24

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    // Fetch case + risk score
    const [caseResult, riskResult, tasksResult, evidenceResult] = await Promise.all([
      supabase.from('cases').select('id, court_type, dispute_type').eq('id', caseId).single(),
      supabase.from('case_risk_scores').select('*').eq('case_id', caseId)
        .order('computed_at', { ascending: false }).limit(1).single(),
      supabase.from('tasks').select('status').eq('case_id', caseId),
      supabase.from('evidence_items').select('id', { count: 'exact', head: true }).eq('case_id', caseId),
    ])

    if (caseResult.error) return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    if (riskResult.error || !riskResult.data) {
      return NextResponse.json({ tips: [], _meta: { source: 'none' } })
    }

    const risk = riskResult.data

    // Check cache
    const { data: cached } = await supabase
      .from('ai_cache')
      .select('content, generated_at')
      .eq('case_id', caseId)
      .eq('cache_key', CACHE_KEY)
      .single()

    if (cached) {
      const age = Date.now() - new Date(cached.generated_at).getTime()
      if (age < STALE_HOURS * 60 * 60 * 1000) {
        return NextResponse.json({
          ...cached.content,
          _meta: { source: 'cached', generated_at: cached.generated_at },
        })
      }
    }

    // Static fallback
    let result = buildStaticHealthTips({
      deadline_risk: risk.deadline_risk,
      response_risk: risk.response_risk,
      evidence_risk: risk.evidence_risk,
      activity_risk: risk.activity_risk,
    })
    let source: 'ai' | 'static' = 'static'

    const allTasks = tasksResult.data ?? []
    const completedCount = allTasks.filter((t) => t.status === 'completed').length

    // Try AI
    if (process.env.OPENAI_API_KEY) {
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
        const userPrompt = buildHealthTipsPrompt({
          overall_score: risk.overall_score,
          deadline_risk: risk.deadline_risk,
          response_risk: risk.response_risk,
          evidence_risk: risk.evidence_risk,
          activity_risk: risk.activity_risk,
          court_type: caseResult.data.court_type ?? 'unknown',
          dispute_type: caseResult.data.dispute_type,
          tasks_completed: completedCount,
          tasks_total: allTasks.length,
          evidence_count: evidenceResult.count ?? 0,
        })

        const completion = await openai.chat.completions.create({
          model: AI_MODEL,
          temperature: 0.4,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: HEALTH_TIPS_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
        })

        const raw = completion.choices[0]?.message?.content
        if (raw) {
          const parsed = JSON.parse(raw)
          const validated = healthTipsSchema.safeParse(parsed)
          if (validated.success) {
            const allText = validated.data.tips.map((t) => t.tip).join(' ')
            if (isHealthTipsSafe(allText)) {
              result = validated.data
              source = 'ai'
            }
          }
        }
      } catch (err) {
        console.error('[health-tips] AI call failed:', err)
      }
    }

    // Cache
    await supabase
      .from('ai_cache')
      .upsert({
        case_id: caseId,
        cache_key: CACHE_KEY,
        content: result,
        generated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + STALE_HOURS * 60 * 60 * 1000).toISOString(),
      }, { onConflict: 'case_id,cache_key' })

    return NextResponse.json({ ...result, _meta: { source } })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Changes to `case-health-card.tsx`:**

Add `aiTips` prop and render below the sub-bars:

```typescript
// Add to props:
aiTips?: { tip: string; area: string }[] | null

// Add after the sub-bars section and before the disclaimer:
{props.aiTips && props.aiTips.length > 0 && (
  <div className="mt-4 space-y-2">
    <div className="flex items-center gap-2">
      <Lightbulb className="h-4 w-4 text-calm-amber" />
      <span className="text-xs font-medium text-warm-muted">Tips</span>
    </div>
    <ul className="space-y-1.5">
      {props.aiTips.map((item, i) => (
        <li key={i} className="text-sm text-warm-muted flex items-start gap-2">
          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-calm-amber shrink-0" />
          {item.tip}
        </li>
      ))}
    </ul>
  </div>
)}
```

Import `Lightbulb` from `lucide-react`.

**Changes to `case/[id]/page.tsx`:**

Fetch tips from cache and pass to CaseHealthCard:

```typescript
// Add to data fetching:
const { data: healthTipsCache } = await supabase
  .from('ai_cache')
  .select('content')
  .eq('case_id', id)
  .eq('cache_key', 'health_tips')
  .single()

const aiTips = (healthTipsCache?.content as { tips: { tip: string; area: string }[] } | null)?.tips ?? null

// Pass to CaseHealthCard:
<CaseHealthCard
  caseId={id}
  riskScore={latestRisk}
  score7DaysAgo={score7d}
  score30DaysAgo={score30d}
  aiTips={aiTips}
/>
```

---

## Task 11: AI Strategy Recommendations — Lib Module

**Pattern:** Uses Claude (Anthropic) for complex legal reasoning. `src/lib/rules/filing-safety.ts` for safety checks.

**Files:**
- Create: `src/lib/ai/strategy-recommendations.ts`

```typescript
import { z } from 'zod'

export const strategyRecommendationSchema = z.object({
  recommendations: z.array(z.object({
    title: z.string().max(100),
    body: z.string().max(500),
    priority: z.enum(['high', 'medium', 'low']),
  })).min(1).max(5),
})

export type StrategyRecommendations = z.infer<typeof strategyRecommendationSchema>

const BLOCKED_PHRASES = Object.freeze([
  'you must', 'you should file', 'file immediately', 'urgent action',
  'sanctions', 'legal advice', 'guaranteed', 'winning', 'losing',
  'i recommend that you', 'you need to file', 'hire a lawyer',
  'as your attorney', 'in my legal opinion',
])

export function isStrategySafe(text: string): boolean {
  const lower = text.toLowerCase()
  return !BLOCKED_PHRASES.some((phrase) => lower.includes(phrase))
}

export function buildStaticStrategy(input: {
  tasks_completed: number
  tasks_total: number
  has_evidence: boolean
  has_deadlines: boolean
}): StrategyRecommendations {
  const recs: StrategyRecommendations['recommendations'] = []

  if (input.tasks_completed < input.tasks_total) {
    recs.push({
      title: 'Continue completing case tasks',
      body: `You have completed ${input.tasks_completed} of ${input.tasks_total} tasks. Each completed task builds your case foundation.`,
      priority: 'high',
    })
  }

  if (!input.has_evidence) {
    recs.push({
      title: 'Start gathering evidence',
      body: 'Uploading relevant documents, photos, and communications to the evidence vault helps build a strong case file.',
      priority: 'high',
    })
  }

  if (input.has_deadlines) {
    recs.push({
      title: 'Stay ahead of deadlines',
      body: 'Court deadlines are critical. Review your upcoming deadlines regularly to avoid missed filings.',
      priority: 'medium',
    })
  }

  if (recs.length === 0) {
    recs.push({
      title: 'Your case is progressing well',
      body: 'Continue monitoring your case dashboard for new tasks and deadlines as they become available.',
      priority: 'low',
    })
  }

  return { recommendations: recs }
}

export const STRATEGY_SYSTEM_PROMPT = `You provide case management strategy recommendations for a pro se litigant (someone representing themselves in court).

Given comprehensive case context, provide 3-5 prioritized strategic recommendations focusing on case management and procedural steps.

CRITICAL RULES:
- You are NOT a lawyer. Never provide specific legal advice.
- Never use directive language ("you must", "you should file")
- Never predict outcomes ("winning", "losing", "guaranteed")
- Never recommend hiring/not hiring a lawyer
- Focus on procedural and organizational strategy, not legal arguments
- Frame recommendations as things to "consider" or "explore"
- Each recommendation needs a short title and a 2-3 sentence body
- Prioritize as high/medium/low based on urgency and impact

Respond with JSON only:
{
  "recommendations": [
    { "title": "...", "body": "...", "priority": "high|medium|low" }
  ]
}`

export function buildStrategyPrompt(input: {
  court_type: string
  dispute_type: string | null
  role: string
  completed_tasks: string[]
  pending_tasks: string[]
  locked_tasks: string[]
  upcoming_deadlines: { key: string; due_at: string }[]
  evidence_count: number
  risk_score: number | null
  risk_areas: { area: string; score: number }[]
  motions_filed: number
  discovery_served: boolean
  days_since_creation: number
}): { system: string; user: string } {
  const userLines = [
    '--- CASE CONTEXT ---',
    `Court: ${input.court_type}`,
    `Dispute: ${input.dispute_type ?? 'general'}`,
    `Role: ${input.role}`,
    `Case age: ${input.days_since_creation} days`,
    '',
    '--- PROGRESS ---',
    `Completed tasks: ${input.completed_tasks.join(', ') || 'none'}`,
    `Pending tasks: ${input.pending_tasks.join(', ') || 'none'}`,
    `Locked tasks: ${input.locked_tasks.join(', ') || 'none'}`,
    '',
    '--- DEADLINES ---',
    ...(input.upcoming_deadlines.length > 0
      ? input.upcoming_deadlines.map((d) => `- ${d.key}: ${new Date(d.due_at).toLocaleDateString('en-US')}`)
      : ['No upcoming deadlines']),
    '',
    '--- CASE HEALTH ---',
    `Overall score: ${input.risk_score ?? 'not calculated'}/100`,
    ...input.risk_areas.map((a) => `- ${a.area}: ${a.score}/100`),
    '',
    '--- RESOURCES ---',
    `Evidence items: ${input.evidence_count}`,
    `Motions filed: ${input.motions_filed}`,
    `Discovery served: ${input.discovery_served ? 'yes' : 'no'}`,
  ]

  return {
    system: STRATEGY_SYSTEM_PROMPT,
    user: userLines.join('\n'),
  }
}
```

---

## Task 12: AI Strategy Recommendations — API Route

**Pattern:** `src/app/api/cases/[id]/generate-filing/route.ts` — uses Anthropic Claude.

**Files:**
- Create: `src/app/api/cases/[id]/strategy/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import {
  strategyRecommendationSchema,
  isStrategySafe,
  buildStaticStrategy,
  buildStrategyPrompt,
} from '@/lib/ai/strategy-recommendations'

export const runtime = 'nodejs'
export const maxDuration = 60

const CACHE_KEY = 'strategy'
const STALE_DAYS = 7

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    // Fetch all case context in parallel
    const [caseResult, tasksResult, deadlinesResult, evidenceResult, riskResult, motionsResult, discoveryResult] =
      await Promise.all([
        supabase.from('cases').select('id, role, court_type, dispute_type, created_at').eq('id', caseId).single(),
        supabase.from('tasks').select('task_key, status').eq('case_id', caseId),
        supabase.from('deadlines').select('key, due_at').eq('case_id', caseId).gte('due_at', new Date().toISOString()).order('due_at', { ascending: true }).limit(5),
        supabase.from('evidence_items').select('id', { count: 'exact', head: true }).eq('case_id', caseId),
        supabase.from('case_risk_scores').select('overall_score, deadline_risk, response_risk, evidence_risk, activity_risk').eq('case_id', caseId).order('computed_at', { ascending: false }).limit(1).single(),
        supabase.from('motions').select('id', { count: 'exact', head: true }).eq('case_id', caseId).eq('status', 'filed'),
        supabase.from('discovery_packs').select('id').eq('case_id', caseId).eq('status', 'served').limit(1),
      ])

    if (caseResult.error) return NextResponse.json({ error: 'Case not found' }, { status: 404 })

    const caseData = caseResult.data
    const allTasks = tasksResult.data ?? []
    const completed = allTasks.filter((t) => t.status === 'completed')
    const pending = allTasks.filter((t) => ['todo', 'in_progress', 'needs_review'].includes(t.status))
    const locked = allTasks.filter((t) => t.status === 'locked')

    // Check cache
    const { data: cached } = await supabase
      .from('ai_cache')
      .select('content, generated_at')
      .eq('case_id', caseId)
      .eq('cache_key', CACHE_KEY)
      .single()

    if (cached) {
      const ageDays = (Date.now() - new Date(cached.generated_at).getTime()) / (1000 * 60 * 60 * 24)
      if (ageDays < STALE_DAYS) {
        return NextResponse.json({
          ...cached.content,
          _meta: { source: 'cached', generated_at: cached.generated_at },
        })
      }
    }

    // Static fallback
    const evidenceCount = evidenceResult.count ?? 0
    let result = buildStaticStrategy({
      tasks_completed: completed.length,
      tasks_total: allTasks.length,
      has_evidence: evidenceCount > 0,
      has_deadlines: (deadlinesResult.data ?? []).length > 0,
    })
    let source: 'ai' | 'static' = 'static'

    const daysSinceCreation = Math.round(
      (Date.now() - new Date(caseData.created_at).getTime()) / (1000 * 60 * 60 * 24)
    )

    const risk = riskResult.data

    // Try Claude
    try {
      const anthropic = new Anthropic()
      const prompt = buildStrategyPrompt({
        court_type: caseData.court_type ?? 'unknown',
        dispute_type: caseData.dispute_type,
        role: caseData.role ?? 'plaintiff',
        completed_tasks: completed.map((t) => t.task_key),
        pending_tasks: pending.map((t) => t.task_key),
        locked_tasks: locked.map((t) => t.task_key),
        upcoming_deadlines: (deadlinesResult.data ?? []).map((d) => ({ key: d.key, due_at: d.due_at })),
        evidence_count: evidenceCount,
        risk_score: risk?.overall_score ?? null,
        risk_areas: risk
          ? [
              { area: 'deadline', score: risk.deadline_risk },
              { area: 'response', score: risk.response_risk },
              { area: 'evidence', score: risk.evidence_risk },
              { area: 'activity', score: risk.activity_risk },
            ]
          : [],
        motions_filed: motionsResult.count ?? 0,
        discovery_served: (discoveryResult.data ?? []).length > 0,
        days_since_creation: daysSinceCreation,
      })

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: prompt.system,
        messages: [{ role: 'user', content: prompt.user }],
      })

      const text = message.content
        .filter((block) => block.type === 'text')
        .map((block) => block.text)
        .join('\n')

      // Extract JSON from response (may be wrapped in markdown code blocks)
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        const validated = strategyRecommendationSchema.safeParse(parsed)
        if (validated.success) {
          const allText = validated.data.recommendations.map((r) => `${r.title} ${r.body}`).join(' ')
          if (isStrategySafe(allText)) {
            result = validated.data
            source = 'ai'
          }
        }
      }
    } catch (err) {
      console.error('[strategy] Claude call failed:', err)
    }

    // Cache
    await supabase
      .from('ai_cache')
      .upsert({
        case_id: caseId,
        cache_key: CACHE_KEY,
        content: result,
        generated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + STALE_DAYS * 24 * 60 * 60 * 1000).toISOString(),
      }, { onConflict: 'case_id,cache_key' })

    // Audit
    await supabase.from('task_events').insert({
      case_id: caseId,
      kind: 'strategy_generated',
      payload: { source, recommendation_count: result.recommendations.length },
    })

    return NextResponse.json({ ...result, _meta: { source } })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

---

## Task 13: AI Strategy Recommendations — Dashboard Card

**Files:**
- Create: `src/components/dashboard/strategy-card.tsx`
- Modify: `src/app/(authenticated)/case/[id]/page.tsx`

**`strategy-card.tsx`:**

```typescript
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Compass, RefreshCw, Sparkles } from 'lucide-react'

interface StrategyCardProps {
  caseId: string
  recommendations: { title: string; body: string; priority: string }[] | null
  generatedAt?: string | null
}

const priorityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-blue-100 text-blue-700',
}

export function StrategyCard({ caseId, recommendations: initial, generatedAt }: StrategyCardProps) {
  const [recommendations, setRecommendations] = useState(initial)
  const [loading, setLoading] = useState(false)
  const [lastGenerated, setLastGenerated] = useState(generatedAt)

  async function generateStrategy() {
    setLoading(true)
    try {
      const res = await fetch(`/api/cases/${caseId}/strategy`)
      if (res.ok) {
        const data = await res.json()
        setRecommendations(data.recommendations)
        setLastGenerated(new Date().toISOString())
      }
    } catch { /* silent */ }
    setLoading(false)
  }

  return (
    <Card className="border-warm-border">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-calm-indigo" />
          <CardTitle className="text-lg">Strategy Insights</CardTitle>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={generateStrategy}
          disabled={loading}
          className="text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
          {recommendations ? 'Refresh' : 'Generate'}
        </Button>
      </CardHeader>
      <CardContent>
        {loading && !recommendations && (
          <div className="flex items-center gap-2 text-sm text-warm-muted animate-pulse">
            <Sparkles className="h-4 w-4" />
            Analyzing your case...
          </div>
        )}
        {!loading && !recommendations && (
          <p className="text-sm text-warm-muted">
            Get AI-powered strategy insights tailored to your case progress and situation.
          </p>
        )}
        {recommendations && recommendations.length > 0 && (
          <div className="space-y-3">
            {recommendations.map((rec, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={`text-xs ${priorityColors[rec.priority] ?? ''}`}>
                    {rec.priority}
                  </Badge>
                  <span className="text-sm font-medium text-warm-text">{rec.title}</span>
                </div>
                <p className="text-sm text-warm-muted pl-1">{rec.body}</p>
              </div>
            ))}
            {lastGenerated && (
              <p className="text-xs text-warm-muted/60 pt-1">
                Last updated {new Date(lastGenerated).toLocaleDateString()}
              </p>
            )}
          </div>
        )}
        <p className="text-xs text-warm-muted/60 mt-3 italic">
          These are case management suggestions, not legal advice.
        </p>
      </CardContent>
    </Card>
  )
}
```

**Changes to `case/[id]/page.tsx`:**

```typescript
// Import:
import { StrategyCard } from '@/components/dashboard/strategy-card'

// Add to data fetching:
const { data: strategyCache } = await supabase
  .from('ai_cache')
  .select('content, generated_at')
  .eq('case_id', id)
  .eq('cache_key', 'strategy')
  .single()

const strategyRecs = (strategyCache?.content as { recommendations: { title: string; body: string; priority: string }[] } | null)?.recommendations ?? null

// Add after CaseHealthCard:
<StrategyCard
  caseId={id}
  recommendations={strategyRecs}
  generatedAt={strategyCache?.generated_at ?? null}
/>
```

---

## Task 14: Build & Test Verification

1. Run all existing tests — expect all passing
2. `npx next build` — no type errors
3. Verify new routes appear in build output:
   - `/api/cases/[id]/task-description`
   - `/api/cases/[id]/evidence/categorize`
   - `/api/cases/[id]/timeline/summary`
   - `/api/cases/[id]/risk/tips`
   - `/api/cases/[id]/strategy`
4. Verify dashboard renders with new cards (StrategyCard visible)
5. Verify evidence vault shows AI suggestion chip area

---

## File Summary

| File | Action | Feature |
|------|--------|---------|
| `supabase/migrations/20260303000001_ai_cache_table.sql` | Create | Shared cache |
| `src/lib/ai/task-descriptions.ts` | Create | Task Descriptions |
| `src/app/api/cases/[id]/task-description/route.ts` | Create | Task Descriptions |
| `src/components/dashboard/next-step-card.tsx` | Modify | Task Descriptions |
| `src/lib/ai/evidence-categorization.ts` | Create | Evidence Categorization |
| `src/app/api/cases/[id]/evidence/categorize/route.ts` | Create | Evidence Categorization |
| `src/components/evidence/evidence-vault.tsx` | Modify | Evidence Categorization |
| `src/lib/ai/timeline-summary.ts` | Create | Timeline Summary |
| `src/app/api/cases/[id]/timeline/summary/route.ts` | Create | Timeline Summary |
| `src/components/dashboard/timeline-card.tsx` | Modify | Timeline Summary |
| `src/lib/ai/health-tips.ts` | Create | Health Tips |
| `src/app/api/cases/[id]/risk/tips/route.ts` | Create | Health Tips |
| `src/components/dashboard/case-health-card.tsx` | Modify | Health Tips |
| `src/lib/ai/strategy-recommendations.ts` | Create | Strategy |
| `src/app/api/cases/[id]/strategy/route.ts` | Create | Strategy |
| `src/components/dashboard/strategy-card.tsx` | Create | Strategy |
| `src/app/(authenticated)/case/[id]/page.tsx` | Modify | All features |

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| No OpenAI key | Features 1-4 use static fallbacks silently |
| No Anthropic key | Feature 5 static fallback (basic progress tips) |
| AI returns blocked phrases | Rejected by safety check, static fallback used |
| AI returns invalid JSON | Caught by try/catch, static fallback used |
| Cache miss | Generate fresh, cache for next request |
| Stale cache | Regenerate on next request |
| Brand new case (no events/scores) | "Not enough data" messages, minimal static tips |
| Evidence file with no name | Use mime type for heuristic, or "Other" |
| Rate limiting / timeout | Catch error, log, return static fallback |
