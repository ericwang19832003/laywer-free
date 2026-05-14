# Novice-Friendly Petition Flows Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make every petition flow usable end-to-end by a self-represented litigant with zero legal knowledge — covering evidence preservation, petition filing, discovery, and court prep.

**Architecture:** Three shared components (StepChatDrawer, NoviceHelpOverlay, GuidedStepConfig enrichment) built once and dropped into every flow. New routes for AI streaming chat. Existing step components enriched with plain-English context; new wizard components for discovery and hearing prep replace thin placeholders.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS 4, shadcn/ui, existing `aiClient` (OpenAI gpt-4o-mini) from `@/lib/ai/client`, Supabase task metadata jsonb

---

## Phase 1: Shared Infrastructure

### Task 1: Extend GuidedStepConfig Type

**Files:**
- Modify: `packages/shared/src/guided-steps/types.ts`

**Step 1: Add optional novice fields to GuidedStepConfig**

Replace the current export with:

```typescript
export interface QuestionOption {
  value: string
  label: string
}

export interface QuestionDef {
  id: string
  prompt: string
  helpText?: string
  type: 'yes_no' | 'single_choice' | 'info' | 'text'
  options?: QuestionOption[]
  placeholder?: string
  /** Return false to skip this question based on prior answers */
  showIf?: (answers: Record<string, string>) => boolean
}

export interface SummaryItem {
  status: 'done' | 'needed' | 'info'
  text: string
}

export interface NoviceExplanation {
  /** One sentence: why the user is doing this step */
  why: string
  /** One sentence: what happens after this step */
  whatNext: string
  /** Legal terms defined in plain English, shown as inline tooltips */
  glossaryTerms?: { term: string; plain: string }[]
}

export interface GuidedStepConfig {
  title: string
  reassurance: string
  questions: QuestionDef[]
  generateSummary: (answers: Record<string, string>) => SummaryItem[]
  /** Plain-English guidance shown in the NoviceHelpOverlay */
  noviceExplanation?: NoviceExplanation
  /** Question chips shown in the StepChatDrawer */
  suggestedChatQuestions?: string[]
}
```

**Step 2: Build and verify no type errors**

```bash
cd "/Users/minwang/lawyer free" && npm run typecheck 2>&1 | tail -20
```

Expected: 0 errors (fields are optional, no existing code breaks).

**Step 3: Commit**

```bash
cd "/Users/minwang/lawyer free" && git add packages/shared/src/guided-steps/types.ts && git commit -m "feat(types): add noviceExplanation and suggestedChatQuestions to GuidedStepConfig"
```

---

### Task 2: Create NoviceHelpOverlay Component

**Files:**
- Create: `apps/web/src/components/step/novice-help-overlay.tsx`

**Step 1: Write the component**

```typescript
'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, Lightbulb } from 'lucide-react'
import type { NoviceExplanation } from '@lawyer-free/shared/guided-steps/types'

interface NoviceHelpOverlayProps {
  taskKey: string
  explanation: NoviceExplanation
  nextStepTitle?: string
}

export function NoviceHelpOverlay({ taskKey, explanation, nextStepTitle }: NoviceHelpOverlayProps) {
  const storageKey = `novice-overlay-collapsed-${taskKey}`
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(storageKey) === 'true'
  })

  function toggle() {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem(storageKey, String(next))
  }

  const whatNext = nextStepTitle
    ? `After this, you'll move on to: ${nextStepTitle}.`
    : explanation.whatNext

  return (
    <div className="mb-4 rounded-lg border border-calm-indigo/20 bg-calm-indigo/5">
      <button
        onClick={toggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
        aria-expanded={!collapsed}
      >
        <span className="flex items-center gap-2 text-sm font-medium text-calm-indigo">
          <Lightbulb className="h-4 w-4" />
          What's happening here?
        </span>
        {collapsed ? (
          <ChevronDown className="h-4 w-4 text-calm-indigo" />
        ) : (
          <ChevronUp className="h-4 w-4 text-calm-indigo" />
        )}
      </button>

      {!collapsed && (
        <div className="space-y-3 px-4 pb-4 text-sm">
          <div>
            <span className="font-medium text-warm-text">Why this step: </span>
            <span className="text-warm-muted">{explanation.why}</span>
          </div>
          <div>
            <span className="font-medium text-warm-text">What's next: </span>
            <span className="text-warm-muted">{whatNext}</span>
          </div>
          {explanation.glossaryTerms && explanation.glossaryTerms.length > 0 && (
            <div>
              <p className="mb-1 font-medium text-warm-text">Legal terms explained:</p>
              <ul className="space-y-1">
                {explanation.glossaryTerms.map(({ term, plain }) => (
                  <li key={term} className="text-warm-muted">
                    <span className="font-medium text-warm-text">{term}:</span> {plain}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

**Step 2: Verify TypeScript compiles**

```bash
cd "/Users/minwang/lawyer free" && npm run typecheck 2>&1 | grep "novice-help-overlay\|error" | head -10
```

Expected: no errors for this file.

**Step 3: Commit**

```bash
cd "/Users/minwang/lawyer free" && git add apps/web/src/components/step/novice-help-overlay.tsx && git commit -m "feat(ui): add NoviceHelpOverlay component"
```

---

### Task 3: Create Step Chat API Route

**Files:**
- Create: `apps/web/src/app/api/ai/step-chat/route.ts`

**Step 1: Write the streaming API route**

```typescript
import { NextRequest } from 'next/server'
import OpenAI from 'openai'
import { z } from 'zod'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { checkDistributedRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const RequestSchema = z.object({
  taskKey: z.string().max(100),
  stepName: z.string().max(200),
  disputeType: z.string().max(100).optional(),
  state: z.string().max(2).optional(),
  glossaryTerms: z.array(z.object({ term: z.string(), plain: z.string() })).optional(),
  suggestedContext: z.string().max(500).optional(),
  message: z.string().min(1).max(1000),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().max(2000),
  })).max(20).optional(),
})

function buildSystemPrompt(
  stepName: string,
  disputeType?: string,
  state?: string,
  glossaryTerms?: { term: string; plain: string }[],
): string {
  const caseContext = [disputeType, state].filter(Boolean).join(' case in ')
  const glossary = glossaryTerms?.length
    ? `\nKey terms for this case:\n${glossaryTerms.map(({ term, plain }) => `- ${term}: ${plain}`).join('\n')}`
    : ''

  return `You are a plain-English legal guide helping a self-represented litigant${caseContext ? ` with a ${caseContext}` : ''}. They are currently on the "${stepName}" step.

Answer in plain English, under 150 words. Use simple language. Give legal information only — never legal advice. Never use a legal term without immediately defining it in parentheses. Be encouraging and calm.${glossary}

If you don't know something specific to their jurisdiction, say so and suggest they search "[their question] + [their state] court" online or call their local courthouse self-help center.`
}

export async function POST(req: NextRequest) {
  const { supabase } = await getAuthenticatedClient(req)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const limited = await checkDistributedRateLimit(user.id, RATE_LIMITS.AI_GENERATION)
  if (limited) return rateLimitResponse()

  let body: z.infer<typeof RequestSchema>
  try {
    body = RequestSchema.parse(await req.json())
  } catch {
    return new Response('Invalid request', { status: 400 })
  }

  const { stepName, disputeType, state, glossaryTerms, message, history = [] } = body

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: buildSystemPrompt(stepName, disputeType, state, glossaryTerms) },
    ...history.map(({ role, content }) => ({ role, content }) as OpenAI.Chat.ChatCompletionMessageParam),
    { role: 'user', content: message },
  ]

  const stream = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    stream: true,
    max_tokens: 250,
    temperature: 0.3,
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? ''
        if (text) controller.enqueue(encoder.encode(text))
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Content-Type-Options': 'nosniff' },
  })
}
```

**Step 2: Verify it compiles**

```bash
cd "/Users/minwang/lawyer free" && npm run typecheck 2>&1 | grep "step-chat\|error" | head -10
```

**Step 3: Commit**

```bash
cd "/Users/minwang/lawyer free" && git add apps/web/src/app/api/ai/step-chat/route.ts && git commit -m "feat(api): add streaming step-chat AI route"
```

---

### Task 4: Create StepChatDrawer Component

**Files:**
- Create: `apps/web/src/components/step/step-chat-drawer.tsx`

**Step 1: Write the component**

```typescript
'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface StepChatDrawerProps {
  taskKey: string
  stepName: string
  disputeType?: string
  state?: string
  glossaryTerms?: { term: string; plain: string }[]
  suggestedQuestions?: string[]
}

export function StepChatDrawer({
  taskKey,
  stepName,
  disputeType,
  state,
  glossaryTerms,
  suggestedQuestions = [],
}: StepChatDrawerProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return
    const userMsg: Message = { role: 'user', content: text.trim() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai/step-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskKey,
          stepName,
          disputeType,
          state,
          glossaryTerms,
          message: userMsg.content,
          history: messages.slice(-10),
        }),
      })

      if (!res.ok || !res.body) throw new Error('Chat failed')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let assistantText = ''
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        assistantText += decoder.decode(value, { stream: true })
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: assistantText }
          return updated
        })
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "I'm having trouble connecting right now. Please try again in a moment." },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-calm-indigo px-4 py-3 text-sm font-medium text-white shadow-lg transition-colors hover:bg-calm-indigo/90"
        aria-label="Ask a question about this step"
      >
        <MessageCircle className="h-4 w-4" />
        Ask a question
      </button>

      {/* Drawer overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-end sm:items-stretch">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setOpen(false)}
          />

          {/* Drawer panel */}
          <div className="relative flex h-full w-full flex-col bg-white shadow-xl sm:w-96">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-warm-border px-4 py-3">
              <div>
                <p className="font-semibold text-warm-text">Legal Guide</p>
                <p className="text-xs text-warm-muted">Plain-English answers · Not legal advice</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-warm-muted hover:text-warm-text"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-warm-muted">
                    Ask anything about this step — I'll answer in plain English.
                  </p>
                  {suggestedQuestions.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-warm-muted">Try asking:</p>
                      {suggestedQuestions.map((q) => (
                        <button
                          key={q}
                          onClick={() => sendMessage(q)}
                          className="block w-full rounded-md border border-warm-border px-3 py-2 text-left text-sm text-warm-text hover:bg-warm-bg"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                      msg.role === 'user'
                        ? 'bg-calm-indigo text-white'
                        : 'bg-warm-bg text-warm-text border border-warm-border'
                    }`}
                  >
                    {msg.content || <Loader2 className="h-3 w-3 animate-spin" />}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t border-warm-border px-4 py-3">
              <form
                onSubmit={(e) => { e.preventDefault(); sendMessage(input) }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  disabled={loading}
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={loading || !input.trim()}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
```

**Step 2: Verify TypeScript**

```bash
cd "/Users/minwang/lawyer free" && npm run typecheck 2>&1 | grep "step-chat-drawer\|error" | head -10
```

**Step 3: Commit**

```bash
cd "/Users/minwang/lawyer free" && git add apps/web/src/components/step/step-chat-drawer.tsx && git commit -m "feat(ui): add StepChatDrawer with streaming AI responses"
```

---

### Task 5: Mount Shared Components on the Step Page

The step router page (`apps/web/src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx`) is a Server Component. Add `StepChatDrawer` and `NoviceHelpOverlay` mounting.

**Files:**
- Modify: `apps/web/src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx`

**Step 1: Find the return/render section**

Search for where the page returns its JSX (near the bottom of the file). The page fetches `task`, `case_`, and renders a step component. You need to wrap the step render with a fragment that also includes the two new components.

**Step 2: Add imports at the top of the file** (after the existing imports)

```typescript
import { StepChatDrawer } from '@/components/step/step-chat-drawer'
import { NoviceHelpOverlay } from '@/components/step/novice-help-overlay'
```

**Step 3: In the return JSX, wrap the existing step component**

Find the section that returns the step component (it will look like `return <SomeStepComponent .../>` or a wrapper div). Wrap it like this:

```typescript
return (
  <>
    {/* NoviceHelpOverlay: only render if the step config provides noviceExplanation */}
    {stepConfig?.noviceExplanation && (
      <NoviceHelpOverlay
        taskKey={task.task_key}
        explanation={stepConfig.noviceExplanation}
      />
    )}

    {/* Existing step component renders here */}
    {stepComponent}

    {/* StepChatDrawer: always present on every step */}
    <StepChatDrawer
      taskKey={task.task_key}
      stepName={task.title}
      disputeType={case_?.dispute_type ?? undefined}
      state={case_?.state ?? undefined}
      suggestedQuestions={stepConfig?.suggestedChatQuestions}
    />
  </>
)
```

Note: `stepConfig` is the `GuidedStepConfig` object if the step uses one, otherwise `undefined`. The `StepChatDrawer` renders regardless (it always helps). The `NoviceHelpOverlay` only renders when a config provides `noviceExplanation`.

**Step 4: Verify TypeScript**

```bash
cd "/Users/minwang/lawyer free" && npm run typecheck 2>&1 | tail -20
```

**Step 5: Commit**

```bash
cd "/Users/minwang/lawyer free" && git add apps/web/src/app/(authenticated)/case/\[id\]/step/\[taskId\]/page.tsx && git commit -m "feat(steps): mount StepChatDrawer and NoviceHelpOverlay on every step"
```

---

## Phase 2: Flow-Specific Enhancements

### Task 6: Enrich Core Guided Step Configs with noviceExplanation

Back-fill `noviceExplanation` and `suggestedChatQuestions` on the most-used configs. Do these files:

1. `packages/shared/src/guided-steps/evidence-vault.ts`
2. `packages/shared/src/guided-steps/small-claims/prepare-for-hearing.ts`
3. `packages/shared/src/guided-steps/small-claims/hearing-day.ts`
4. `packages/shared/src/guided-steps/landlord-tenant/lt-hearing-prep.ts`
5. `packages/shared/src/guided-steps/landlord-tenant/lt-hearing-day.ts`
6. `packages/shared/src/guided-steps/debt-defense/debt-hearing-prep-deep.ts`
7. `packages/shared/src/guided-steps/debt-defense/debt-courtroom-guide.ts`
8. `packages/shared/src/guided-steps/debt-defense/fdcpa-check.ts`
9. `packages/shared/src/guided-steps/debt-defense/debt-sol-check.ts`
10. `packages/shared/src/guided-steps/small-claims/sc-evidence-vault.ts` (if exists)

**Pattern for each file — add before the closing `}` of the config export:**

```typescript
// evidence-vault.ts example:
noviceExplanation: {
  why: 'Courts require evidence — collecting and organizing it now means you won\'t be scrambling later.',
  whatNext: 'Next, you\'ll send a letter to the other side requiring them to preserve their evidence too.',
  glossaryTerms: [
    { term: 'Evidence', plain: 'Anything that proves your side of the story — documents, photos, messages, receipts.' },
    { term: 'Organized evidence', plain: 'Evidence sorted into labeled folders so you can find anything quickly in court.' },
  ],
},
suggestedChatQuestions: [
  'What counts as evidence?',
  'What if I deleted some messages — is that a problem?',
  'How should I organize my documents?',
],
```

```typescript
// prepare-for-hearing.ts example:
noviceExplanation: {
  why: 'A small claims hearing is your chance to tell the judge your story — preparation makes you credible and confident.',
  whatNext: 'After you\'re prepared, you\'ll attend the hearing and present your case.',
  glossaryTerms: [
    { term: 'Plaintiff', plain: 'The person who filed the case (that\'s you if you started the lawsuit).' },
    { term: 'Defendant', plain: 'The person you filed against (the other side).' },
    { term: 'Evidence', plain: 'Documents, photos, or messages you show the judge to support your story.' },
  ],
},
suggestedChatQuestions: [
  'What do I say when the judge asks me to speak?',
  'What if I get nervous?',
  'Can I bring a friend for support?',
],
```

```typescript
// hearing-day.ts example:
noviceExplanation: {
  why: 'Knowing what to expect in the courtroom removes surprises and lets you focus on presenting your case.',
  whatNext: 'After the hearing, the judge will either rule immediately or mail you a decision.',
  glossaryTerms: [
    { term: 'Your Honor', plain: 'How you address the judge — always use this title.' },
    { term: 'Sworn in', plain: 'You promise to tell the truth by raising your right hand. Lying after this is perjury.' },
    { term: 'Ruling', plain: 'The judge\'s decision on your case.' },
  ],
},
suggestedChatQuestions: [
  'How do I address the judge?',
  'When do I get to speak?',
  'What if the other side says something wrong — can I interrupt?',
],
```

**Step 1: Edit each file, adding the two fields inside the config object**

For each file, open it, find the closing `}` of the exported config object (before the final `;` or `)`) and insert the `noviceExplanation` and `suggestedChatQuestions` fields.

**Step 2: Verify TypeScript**

```bash
cd "/Users/minwang/lawyer free" && npm run typecheck 2>&1 | tail -20
```

Expected: 0 errors.

**Step 3: Commit**

```bash
cd "/Users/minwang/lawyer free" && git add packages/shared/src/guided-steps/ && git commit -m "feat(guided-steps): add noviceExplanation to core guided step configs"
```

---

### Task 7: Enrich Evidence Preservation Letter Step

The `PreservationLetterStep` already handles email sending. Enrich it with novice-friendly framing.

**Files:**
- Modify: `apps/web/src/components/step/preservation-letter-step.tsx`

**Step 1: Add a "Why this matters" banner at the top of the component JSX**

Find the return statement. Before the first form field (opponent name), add:

```tsx
{/* Novice explainer */}
<div className="mb-6 rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-4">
  <p className="text-sm font-medium text-calm-indigo mb-1">Why send this letter?</p>
  <p className="text-sm text-warm-muted">
    This letter puts {opponentName || 'the other side'} on legal notice to preserve all evidence related to your case.
    If they destroy evidence after receiving this, it can hurt their case and help yours —
    courts call this <strong>spoliation</strong> (destroying evidence you were told to keep).
  </p>
  <p className="text-sm text-warm-muted mt-2">
    Send it as early as possible. It takes 2 minutes and creates a legal timestamp.
  </p>
</div>
```

**Step 2: Add a tooltip label to the opponent email field**

Find the `<Label>` for opponent email input. Add a help text below it:

```tsx
<Label htmlFor="opponentEmail">
  Their email address
  <span className="ml-1 text-xs text-warm-muted">(the person or company you're filing against)</span>
</Label>
```

**Step 3: Add "What to do if they don't respond" after the send success state**

Find the send success state render (where `sendResult === 'sent'` is shown). After the success message, add:

```tsx
{sendResult === 'sent' && (
  <div className="mt-4 rounded-lg border border-calm-amber/20 bg-calm-amber/5 p-4">
    <p className="text-sm font-medium text-calm-amber mb-1">What if they don't respond?</p>
    <p className="text-sm text-warm-muted">
      They don't need to reply — this letter is a legal notice, not a request for a conversation.
      If they destroy evidence after receiving it, you can ask the court to penalize them.
      Save the email you sent (check your Sent folder) as proof.
    </p>
  </div>
)}
```

**Step 4: Verify TypeScript**

```bash
cd "/Users/minwang/lawyer free" && npm run typecheck 2>&1 | tail -20
```

**Step 5: Commit**

```bash
cd "/Users/minwang/lawyer free" && git add apps/web/src/components/step/preservation-letter-step.tsx && git commit -m "feat(preservation): add novice-friendly explainer, field tooltips, and post-send guidance"
```

---

### Task 8: Enrich Petition Wizard — Claims Step (Plain-English Selector)

The Claims step currently has a free-text legal basis textarea. Replace it with a "What happened to you?" selector that maps to legal claim types.

**Files:**
- Modify: `apps/web/src/components/step/petition-wizard.tsx` (or the claims step file if split)

**Step 1: Find where the claims step renders**

Search for `claims` step in `petition-wizard.tsx`. Find the `ClaimsStep` or equivalent render.

**Step 2: Add a CLAIM_TYPES mapping above the component**

```typescript
const PLAIN_CLAIM_TYPES = [
  {
    label: 'Someone didn\'t pay me money they owe',
    legalClaim: 'Breach of contract — failure to pay agreed amount',
    examples: 'Unpaid invoices, bounced checks, loan not repaid',
  },
  {
    label: 'Someone broke an agreement with me',
    legalClaim: 'Breach of contract — failure to perform agreed obligations',
    examples: 'Work not completed, services not delivered, terms not honored',
  },
  {
    label: 'Someone damaged or took my property',
    legalClaim: 'Property damage / conversion',
    examples: 'Damaged goods, stolen property, vehicle damage',
  },
  {
    label: 'Someone caused me injury or harm',
    legalClaim: 'Negligence / personal injury',
    examples: 'Slip and fall, car accident, medical harm',
  },
  {
    label: 'A landlord wrongfully kept my security deposit',
    legalClaim: 'Wrongful retention of security deposit',
    examples: 'Deposit not returned after move-out, unlawful deductions',
  },
  {
    label: 'A debt collector violated my rights',
    legalClaim: 'FDCPA violation — improper debt collection practices',
    examples: 'Harassment calls, false threats, contacting employer',
  },
  {
    label: 'Something else',
    legalClaim: '',
    examples: '',
  },
] as const
```

**Step 3: Replace the free-text claims textarea with the selector UI**

In the claims step render, replace the raw textarea with:

```tsx
<div className="space-y-3">
  <Label>What happened to you?</Label>
  <p className="text-sm text-warm-muted">
    Select the option that best describes your situation. We'll translate it into the legal language your petition needs.
  </p>
  <div className="space-y-2">
    {PLAIN_CLAIM_TYPES.map((claim) => {
      const isSelected = selectedClaim === claim.label
      return (
        <button
          key={claim.label}
          type="button"
          onClick={() => {
            setSelectedClaim(claim.label)
            // Auto-populate the legal claim field with the mapped text
            if (claim.legalClaim) setClaimDetails(claim.legalClaim)
          }}
          className={`w-full rounded-lg border p-3 text-left transition-colors ${
            isSelected
              ? 'border-calm-indigo bg-calm-indigo/5'
              : 'border-warm-border hover:border-calm-indigo/40'
          }`}
        >
          <p className="text-sm font-medium text-warm-text">{claim.label}</p>
          {claim.examples && (
            <p className="mt-0.5 text-xs text-warm-muted">{claim.examples}</p>
          )}
        </button>
      )
    })}
  </div>

  {/* Show free-text only for "Something else" */}
  {selectedClaim === 'Something else' && (
    <div>
      <Label htmlFor="claimDetails">Describe what happened</Label>
      <Textarea
        id="claimDetails"
        value={claimDetails}
        onChange={(e) => setClaimDetails(e.target.value)}
        placeholder="In your own words, describe what happened and why you're filing this case..."
        rows={4}
      />
    </div>
  )}

  {/* Always show the mapped legal text (editable) when a standard claim is selected */}
  {selectedClaim && selectedClaim !== 'Something else' && (
    <div className="rounded-md border border-warm-border bg-warm-bg p-3">
      <p className="text-xs font-medium text-warm-muted mb-1">Legal language (editable):</p>
      <Textarea
        value={claimDetails}
        onChange={(e) => setClaimDetails(e.target.value)}
        rows={2}
        className="text-sm"
      />
      <p className="mt-1 text-xs text-warm-muted">
        This is what will appear in your petition. You can edit it if needed.
      </p>
    </div>
  )}
</div>
```

You'll need to add `selectedClaim` and `setSelectedClaim` to the wizard state.

**Step 4: Enrich the Facts step with a guided template**

Find the Facts step textarea. Add a structured prompt above it:

```tsx
<div className="mb-3 rounded-md border border-warm-border bg-warm-bg p-3">
  <p className="text-xs font-medium text-warm-muted mb-2">What to include:</p>
  <ul className="space-y-1 text-xs text-warm-muted">
    <li>• <strong>When</strong> it happened (date or date range)</li>
    <li>• <strong>Where</strong> it happened (address or location)</li>
    <li>• <strong>What</strong> the other side did (specific actions)</li>
    <li>• <strong>How</strong> it harmed you (money lost, damage, impact)</li>
  </ul>
  <p className="mt-2 text-xs text-warm-muted">Write in plain English — you don't need legal language here.</p>
</div>
```

**Step 5: Add tooltip to Venue step**

Find the Venue step label. Change "Venue" to include a plain-English tooltip:

```tsx
<Label>
  Which court?{' '}
  <span className="font-normal text-warm-muted text-xs">
    (Usually the court closest to where the dispute happened or where the other party lives)
  </span>
</Label>
```

**Step 6: Verify TypeScript**

```bash
cd "/Users/minwang/lawyer free" && npm run typecheck 2>&1 | tail -20
```

**Step 7: Commit**

```bash
cd "/Users/minwang/lawyer free" && git add apps/web/src/components/step/petition-wizard.tsx && git commit -m "feat(petition-wizard): add plain-English claims selector, facts template, venue tooltip"
```

---

### Task 9: Create NoviceDiscoveryWizard Component

**Files:**
- Create: `apps/web/src/components/step/novice-discovery-wizard.tsx`

**Step 1: Write the 6-phase wizard**

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, ChevronLeft, CheckCircle2, Circle, FileText, Mail, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

type Phase = 'explainer' | 'interrogatories' | 'rfp' | 'admissions' | 'service' | 'tracker'

interface NoviceDiscoveryWizardProps {
  caseId: string
  taskId: string
  disputeType?: string
  state?: string
}

// Default interrogatory templates — dispute-type-specific sets can be added later
const DEFAULT_INTERROGATORIES = [
  { id: 'identify_witnesses', text: 'Identify all persons with knowledge of facts related to this lawsuit.', plain: 'Ask them to name everyone who knows something about what happened.' },
  { id: 'identify_documents', text: 'Identify all documents you may use to support your claims or defenses.', plain: 'Ask them to list every document they plan to use.' },
  { id: 'describe_damages', text: 'Describe in detail each item of damage you claim, and the calculation thereof.', plain: 'Ask them to explain exactly what damages they say they\'re owed.' },
  { id: 'prior_communications', text: 'Describe all communications between you and the plaintiff/defendant regarding the subject matter of this lawsuit.', plain: 'Ask them to describe every conversation or message about this dispute.' },
]

const DEFAULT_RFPS = [
  { id: 'all_documents', text: 'Produce all documents identified in your interrogatory responses.', plain: 'Ask them to hand over every document they mentioned.' },
  { id: 'communications', text: 'Produce all communications (emails, texts, letters) related to this dispute.', plain: 'Ask for all their messages about this case.' },
  { id: 'financial_records', text: 'Produce all financial records related to the claims in this lawsuit.', plain: 'Ask for bank statements, invoices, receipts related to this dispute.' },
]

const DEFAULT_ADMISSIONS = [
  { id: 'admit_parties', text: 'Admit that you are the [plaintiff/defendant] named in this lawsuit.', plain: 'Ask them to confirm they\'re the right person you\'re suing.' },
  { id: 'admit_transaction', text: 'Admit that the transaction described in the complaint occurred on [date].', plain: 'Ask them to admit the event you\'re suing over actually happened.' },
]

const SERVICE_METHODS = [
  { value: 'certified_mail', label: 'Certified mail', desc: 'Most common. Mail to their address, keep the tracking receipt.' },
  { value: 'process_server', label: 'Process server', desc: 'Required in some courts. A professional delivers the documents in person.' },
  { value: 'email', label: 'Email (only if agreed)', desc: 'Only use this if opposing counsel has agreed in writing.' },
]

export function NoviceDiscoveryWizard({ caseId, taskId, disputeType, state }: NoviceDiscoveryWizardProps) {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('explainer')
  const [explainerScreen, setExplainerScreen] = useState(0)
  const [selectedInterrogatories, setSelectedInterrogatories] = useState<string[]>(DEFAULT_INTERROGATORIES.map(i => i.id))
  const [selectedRfps, setSelectedRfps] = useState<string[]>(DEFAULT_RFPS.map(r => r.id))
  const [selectedAdmissions, setSelectedAdmissions] = useState<string[]>(DEFAULT_ADMISSIONS.map(a => a.id))
  const [serviceMethod, setServiceMethod] = useState('certified_mail')
  const [serviceDate, setServiceDate] = useState('')
  const [recipientAddress, setRecipientAddress] = useState('')
  const [saving, setSaving] = useState(false)

  const EXPLAINER_SCREENS = [
    {
      title: 'What is discovery?',
      body: 'Discovery is the process where both sides exchange information before trial. You can ask the other side questions they must answer under oath, request documents, and ask them to admit or deny facts.',
      icon: '📋',
    },
    {
      title: 'You have three tools',
      body: 'Interrogatories: written questions they must answer in writing. Requests for Production: ask them to hand over documents. Requests for Admissions: ask them to admit or deny specific facts — anything they admit saves you from proving it in court.',
      icon: '🔧',
    },
    {
      title: 'They must respond',
      body: `In ${state ?? 'your state'}, they typically have 30–45 days to respond. If they don't respond, you can file a Motion to Compel and the court may penalize them. We'll track this deadline for you.`,
      icon: '⏰',
    },
  ]

  function toggleItem(id: string, selected: string[], setSelected: (v: string[]) => void) {
    setSelected(selected.includes(id) ? selected.filter(i => i !== id) : [...selected, id])
  }

  async function handleComplete() {
    setSaving(true)
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed',
          metadata: {
            discovery_interrogatories: selectedInterrogatories,
            discovery_rfps: selectedRfps,
            discovery_admissions: selectedAdmissions,
            discovery_service_method: serviceMethod,
            discovery_service_date: serviceDate,
            discovery_recipient_address: recipientAddress,
          },
        }),
      })
      if (!res.ok) throw new Error('Save failed')
      router.push(`/case/${caseId}`)
      router.refresh()
    } catch {
      toast.error('Something went wrong. Please try again.')
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4">
      {/* Phase: Explainer */}
      {phase === 'explainer' && (
        <Card>
          <CardHeader>
            <p className="text-3xl">{EXPLAINER_SCREENS[explainerScreen].icon}</p>
            <h2 className="text-lg font-semibold text-warm-text">{EXPLAINER_SCREENS[explainerScreen].title}</h2>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-warm-muted">{EXPLAINER_SCREENS[explainerScreen].body}</p>
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setExplainerScreen(s => s - 1)}
                disabled={explainerScreen === 0}
              >
                <ChevronLeft className="mr-1 h-4 w-4" /> Back
              </Button>
              {explainerScreen < EXPLAINER_SCREENS.length - 1 ? (
                <Button onClick={() => setExplainerScreen(s => s + 1)}>
                  Next <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={() => setPhase('interrogatories')}>
                  Build my discovery requests <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Phase: Interrogatories */}
      {phase === 'interrogatories' && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-warm-text">Interrogatories</h2>
            <p className="text-sm text-warm-muted">Written questions the other side must answer under oath. Select the ones you want to send.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {DEFAULT_INTERROGATORIES.map(item => (
              <div key={item.id} className="flex items-start gap-3 rounded-lg border border-warm-border p-3">
                <Checkbox
                  id={item.id}
                  checked={selectedInterrogatories.includes(item.id)}
                  onCheckedChange={() => toggleItem(item.id, selectedInterrogatories, setSelectedInterrogatories)}
                />
                <div>
                  <Label htmlFor={item.id} className="font-medium cursor-pointer">{item.plain}</Label>
                  <p className="text-xs text-warm-muted mt-0.5 italic">Legal text: "{item.text}"</p>
                </div>
              </div>
            ))}
            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setPhase('explainer')}><ChevronLeft className="mr-1 h-4 w-4" /> Back</Button>
              <Button onClick={() => setPhase('rfp')}>Document Requests <ChevronRight className="ml-1 h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Phase: Requests for Production */}
      {phase === 'rfp' && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-warm-text">Requests for Production</h2>
            <p className="text-sm text-warm-muted">Ask the other side to hand over documents. Select the ones that apply.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {DEFAULT_RFPS.map(item => (
              <div key={item.id} className="flex items-start gap-3 rounded-lg border border-warm-border p-3">
                <Checkbox
                  id={item.id}
                  checked={selectedRfps.includes(item.id)}
                  onCheckedChange={() => toggleItem(item.id, selectedRfps, setSelectedRfps)}
                />
                <div>
                  <Label htmlFor={item.id} className="font-medium cursor-pointer">{item.plain}</Label>
                  <p className="text-xs text-warm-muted mt-0.5 italic">Legal text: "{item.text}"</p>
                </div>
              </div>
            ))}
            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setPhase('interrogatories')}><ChevronLeft className="mr-1 h-4 w-4" /> Back</Button>
              <Button onClick={() => setPhase('admissions')}>Admissions <ChevronRight className="ml-1 h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Phase: Requests for Admissions */}
      {phase === 'admissions' && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-warm-text">Requests for Admissions</h2>
            <p className="text-sm text-warm-muted">
              Ask the other side to admit or deny specific facts. Anything they admit saves you from proving it in court.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {DEFAULT_ADMISSIONS.map(item => (
              <div key={item.id} className="flex items-start gap-3 rounded-lg border border-warm-border p-3">
                <Checkbox
                  id={item.id}
                  checked={selectedAdmissions.includes(item.id)}
                  onCheckedChange={() => toggleItem(item.id, selectedAdmissions, setSelectedAdmissions)}
                />
                <div>
                  <Label htmlFor={item.id} className="font-medium cursor-pointer">{item.plain}</Label>
                  <p className="text-xs text-warm-muted mt-0.5 italic">Legal text: "{item.text}"</p>
                </div>
              </div>
            ))}
            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setPhase('rfp')}><ChevronLeft className="mr-1 h-4 w-4" /> Back</Button>
              <Button onClick={() => setPhase('service')}>How to Send These <ChevronRight className="ml-1 h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Phase: Service Wizard */}
      {phase === 'service' && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-warm-text">Send Your Discovery Requests</h2>
            <p className="text-sm text-warm-muted">Choose how to deliver these to the other side. Keep proof of delivery.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {SERVICE_METHODS.map(method => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => setServiceMethod(method.value)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${
                    serviceMethod === method.value ? 'border-calm-indigo bg-calm-indigo/5' : 'border-warm-border'
                  }`}
                >
                  <p className="text-sm font-medium">{method.label}</p>
                  <p className="text-xs text-warm-muted">{method.desc}</p>
                </button>
              ))}
            </div>
            <div>
              <Label htmlFor="serviceDate">Date you sent / will send</Label>
              <Input id="serviceDate" type="date" value={serviceDate} onChange={e => setServiceDate(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="recipientAddress">Their address <span className="text-xs text-warm-muted">(for certified mail)</span></Label>
              <Input id="recipientAddress" value={recipientAddress} onChange={e => setRecipientAddress(e.target.value)} placeholder="123 Main St, City, State, ZIP" className="mt-1" />
            </div>
            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setPhase('admissions')}><ChevronLeft className="mr-1 h-4 w-4" /> Back</Button>
              <Button onClick={() => setPhase('tracker')}>Track Response Deadline <ChevronRight className="ml-1 h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Phase: Response Tracker */}
      {phase === 'tracker' && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-warm-text">Track Their Response</h2>
            <p className="text-sm text-warm-muted">The other side must respond to your discovery requests within the deadline set by your state's rules.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-calm-amber/20 bg-calm-amber/5 p-4 space-y-2">
              <p className="text-sm font-medium text-warm-text flex items-center gap-2">
                <Clock className="h-4 w-4 text-calm-amber" />
                Typical deadline: 30–45 days from the date you served them
              </p>
              <p className="text-sm text-warm-muted">
                Your exact deadline depends on {state ?? 'your state'}'s rules. Check your state's civil procedure rules or ask the courthouse self-help center.
              </p>
            </div>
            <div className="rounded-lg border border-warm-border p-4 space-y-2">
              <p className="text-sm font-medium text-warm-text">What to do if they don't respond:</p>
              <ol className="text-sm text-warm-muted space-y-1 list-decimal list-inside">
                <li>Wait until after the deadline passes</li>
                <li>Send a follow-up letter giving them 7 more days</li>
                <li>File a Motion to Compel Discovery with the court</li>
                <li>The court can sanction them for not responding</li>
              </ol>
            </div>
            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setPhase('service')}><ChevronLeft className="mr-1 h-4 w-4" /> Back</Button>
              <Button onClick={handleComplete} disabled={saving}>
                {saving ? 'Saving...' : 'Complete Discovery Setup'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

**Step 2: Wire into the step router**

In `apps/web/src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx`, find where `DiscoveryStarterPackStep` is rendered (look for `'discovery_starter_pack'` task key). Add `NoviceDiscoveryWizard` as an alternative for the `prepare_discovery` or `discovery_starter_pack` task key:

```typescript
import { NoviceDiscoveryWizard } from '@/components/step/novice-discovery-wizard'

// In the task-key switch:
case 'discovery_starter_pack':
  return (
    <NoviceDiscoveryWizard
      caseId={caseId}
      taskId={task.id}
      disputeType={case_?.dispute_type}
      state={case_?.state}
    />
  )
```

**Step 3: Verify TypeScript**

```bash
cd "/Users/minwang/lawyer free" && npm run typecheck 2>&1 | tail -20
```

**Step 4: Commit**

```bash
cd "/Users/minwang/lawyer free" && git add apps/web/src/components/step/novice-discovery-wizard.tsx apps/web/src/app/(authenticated)/case/\[id\]/step/\[taskId\]/page.tsx && git commit -m "feat(discovery): add NoviceDiscoveryWizard with 6-phase guided flow"
```

---

### Task 10: Create HearingPrepWizard Component

**Files:**
- Create: `apps/web/src/components/step/hearing-prep-wizard.tsx`

**Step 1: Write the component**

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, ChevronLeft, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

type Section = 'bring' | 'opening' | 'arguments' | 'etiquette' | 'dayof'

interface HearingPrepWizardProps {
  caseId: string
  taskId: string
  disputeType?: string
  yourName?: string
  opponentName?: string
  claimSummary?: string
  amountSought?: string
  courtName?: string
}

const BRING_CHECKLIST = [
  { id: 'evidence_binder', label: 'Evidence binder (organized by category)' },
  { id: 'copies_judge', label: '3 copies of every document (you, judge, other side)' },
  { id: 'preservation_email', label: 'Proof you sent the evidence preservation email' },
  { id: 'discovery_responses', label: 'Any discovery responses you received' },
  { id: 'witness_list', label: 'Written witness list (if you have witnesses)' },
  { id: 'photo_id', label: 'Photo ID' },
  { id: 'case_filing', label: 'Copy of your filed petition/complaint' },
]

const ETIQUETTE_RULES = [
  { rule: 'Address the judge as "Your Honor"', example: '"Your Honor, I would like to submit Exhibit A."' },
  { rule: 'Stand when the judge enters the room', example: 'The bailiff will say "All rise" — stand immediately.' },
  { rule: 'Don\'t interrupt', example: 'Wait until the judge or other party finishes before speaking.' },
  { rule: 'Speak to the judge, not the other side', example: 'Even if they say something wrong, address your response to the judge.' },
  { rule: 'Stick to facts, not emotions', example: '"The contract stated X. They did Y." — not "They were terrible and ruined my life."' },
]

type CommonArguments = {
  [key: string]: { theyWillSay: string; youCanSay: string }[]
}

const COMMON_ARGUMENTS: CommonArguments = {
  debt_collection: [
    { theyWillSay: 'You owe this debt.', youCanSay: 'Your Honor, they have not proven they legally own this debt — they must produce the original signed agreement.' },
    { theyWillSay: 'We have records showing you owe this amount.', youCanSay: 'Your Honor, the statute of limitations for this debt has expired under [state] law.' },
  ],
  landlord_tenant: [
    { theyWillSay: 'The unit was in acceptable condition.', youCanSay: 'Your Honor, I have photos and written repair requests dated before move-out showing otherwise.' },
    { theyWillSay: 'The deductions from the deposit were valid.', youCanSay: 'Your Honor, [state] law requires itemized deductions within [X] days — I never received them.' },
  ],
  small_claims: [
    { theyWillSay: 'They performed the work / delivered what was agreed.', youCanSay: 'Your Honor, I have [evidence] showing the work was not completed as specified in the contract.' },
    { theyWillSay: 'The plaintiff agreed to accept less.', youCanSay: 'Your Honor, that agreement was never in writing — our original contract controls.' },
  ],
}

export function HearingPrepWizard({
  caseId,
  taskId,
  disputeType,
  yourName = 'the plaintiff',
  opponentName = 'the defendant',
  claimSummary = 'the dispute described in my complaint',
  amountSought = 'the amount requested',
  courtName = 'this court',
}: HearingPrepWizardProps) {
  const router = useRouter()
  const [section, setSection] = useState<Section>('bring')
  const [checkedItems, setCheckedItems] = useState<string[]>([])
  const [openingStatement, setOpeningStatement] = useState(
    `Your Honor, my name is ${yourName}. I am appearing today as a self-represented litigant. I am here because ${opponentName} ${claimSummary}. I am asking the court to award me ${amountSought}. I will support my request with [your evidence].`
  )
  const [saving, setSaving] = useState(false)

  const disputeArgs = COMMON_ARGUMENTS[disputeType ?? ''] ?? COMMON_ARGUMENTS.small_claims

  function toggleCheck(id: string) {
    setCheckedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  async function handleComplete() {
    setSaving(true)
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed',
          metadata: {
            hearing_prep_checklist: checkedItems,
            hearing_opening_statement: openingStatement,
          },
        }),
      })
      if (!res.ok) throw new Error('Save failed')
      router.push(`/case/${caseId}`)
      router.refresh()
    } catch {
      toast.error('Something went wrong. Please try again.')
      setSaving(false)
    }
  }

  const SECTIONS: { key: Section; label: string }[] = [
    { key: 'bring', label: 'What to bring' },
    { key: 'opening', label: 'Opening statement' },
    { key: 'arguments', label: "What they'll argue" },
    { key: 'etiquette', label: 'Courtroom etiquette' },
    { key: 'dayof', label: 'Day-of checklist' },
  ]

  const currentIndex = SECTIONS.findIndex(s => s.key === section)

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4">
      {/* Progress */}
      <div className="flex gap-1">
        {SECTIONS.map((s, i) => (
          <div key={s.key} className={`h-1.5 flex-1 rounded-full ${i <= currentIndex ? 'bg-calm-indigo' : 'bg-warm-border'}`} />
        ))}
      </div>
      <p className="text-sm text-warm-muted">{currentIndex + 1} of {SECTIONS.length}: {SECTIONS[currentIndex].label}</p>

      {/* Section: What to bring */}
      {section === 'bring' && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-warm-text">What to bring to court</h2>
            <p className="text-sm text-warm-muted">Check off each item as you prepare it.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {BRING_CHECKLIST.map(item => (
              <div key={item.id} className="flex items-center gap-3">
                <Checkbox id={item.id} checked={checkedItems.includes(item.id)} onCheckedChange={() => toggleCheck(item.id)} />
                <Label htmlFor={item.id} className="cursor-pointer text-sm">{item.label}</Label>
              </div>
            ))}
            <div className="flex justify-end pt-2">
              <Button onClick={() => setSection('opening')}>Opening Statement <ChevronRight className="ml-1 h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section: Opening statement */}
      {section === 'opening' && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-warm-text">Your opening statement</h2>
            <p className="text-sm text-warm-muted">We've drafted a starting point based on your case. Edit it to fit your situation, then print or memorize it.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={openingStatement}
              onChange={e => setOpeningStatement(e.target.value)}
              rows={6}
              className="text-sm"
            />
            <p className="text-xs text-warm-muted">Keep it under 2 minutes. Practice it out loud at least 3 times.</p>
            <div className="flex items-center justify-between pt-2">
              <Button variant="outline" onClick={() => setSection('bring')}><ChevronLeft className="mr-1 h-4 w-4" /> Back</Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => window.print()}>
                  <Printer className="mr-1 h-4 w-4" /> Print
                </Button>
                <Button onClick={() => setSection('arguments')}>What They'll Argue <ChevronRight className="ml-1 h-4 w-4" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section: What they'll argue */}
      {section === 'arguments' && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-warm-text">What they'll probably argue</h2>
            <p className="text-sm text-warm-muted">Here are common arguments for {disputeType?.replace(/_/g, ' ') ?? 'this type of case'} and how to respond.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {disputeArgs.map((arg, i) => (
              <div key={i} className="rounded-lg border border-warm-border p-3 space-y-2">
                <p className="text-sm text-warm-muted"><span className="font-medium text-warm-text">They'll say:</span> "{arg.theyWillSay}"</p>
                <p className="text-sm text-calm-indigo"><span className="font-medium">You can say:</span> "{arg.youCanSay}"</p>
              </div>
            ))}
            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setSection('opening')}><ChevronLeft className="mr-1 h-4 w-4" /> Back</Button>
              <Button onClick={() => setSection('etiquette')}>Courtroom Etiquette <ChevronRight className="ml-1 h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section: Courtroom etiquette */}
      {section === 'etiquette' && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-warm-text">Courtroom etiquette</h2>
            <p className="text-sm text-warm-muted">Judges notice how you carry yourself. These rules help you appear credible.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {ETIQUETTE_RULES.map((rule, i) => (
              <div key={i} className="space-y-1">
                <p className="text-sm font-medium text-warm-text">{rule.rule}</p>
                <p className="text-xs text-warm-muted italic">Example: {rule.example}</p>
              </div>
            ))}
            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setSection('arguments')}><ChevronLeft className="mr-1 h-4 w-4" /> Back</Button>
              <Button onClick={() => setSection('dayof')}>Day-of Checklist <ChevronRight className="ml-1 h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section: Day-of */}
      {section === 'dayof' && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-warm-text">Day-of checklist</h2>
            <p className="text-sm text-warm-muted">The morning of your hearing.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              'Arrive 30 minutes early — security lines take time',
              'Phone on silent (not just vibrate) before entering the courtroom',
              'Bring a bottle of water and a snack (hearings can run long)',
              'Dress professionally — business casual at minimum',
              'Check in with the clerk when you arrive and confirm your case is on the docket',
              'If the other side offers a settlement in the hallway, you can negotiate — you don\'t have to accept',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-warm-muted">
                <span className="mt-0.5 h-4 w-4 rounded-full bg-calm-indigo/20 text-calm-indigo text-xs flex items-center justify-center flex-shrink-0">{i + 1}</span>
                {item}
              </div>
            ))}
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setSection('etiquette')}><ChevronLeft className="mr-1 h-4 w-4" /> Back</Button>
              <Button onClick={handleComplete} disabled={saving}>
                {saving ? 'Saving...' : "I'm ready for my hearing"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

**Step 2: Wire into the step router**

In the step router page, find `PrepareForHearingStep` and `HearingDayStep` for relevant dispute types. Add `HearingPrepWizard` as a richer alternative. Specifically, for `'prepare_for_hearing'` task keys:

```typescript
import { HearingPrepWizard } from '@/components/step/hearing-prep-wizard'

// Find PrepareForHearingStep case. Add before/alongside it:
case 'prepare_for_hearing':
  return (
    <HearingPrepWizard
      caseId={caseId}
      taskId={task.id}
      disputeType={case_?.dispute_type ?? undefined}
      yourName={intakeMetadata?.your_name ?? undefined}
      opponentName={intakeMetadata?.opposing_party_name ?? undefined}
      amountSought={intakeMetadata?.amount_sought ?? undefined}
    />
  )
```

**Step 3: Verify TypeScript**

```bash
cd "/Users/minwang/lawyer free" && npm run typecheck 2>&1 | tail -20
```

**Step 4: Commit**

```bash
cd "/Users/minwang/lawyer free" && git add apps/web/src/components/step/hearing-prep-wizard.tsx apps/web/src/app/(authenticated)/case/\[id\]/step/\[taskId\]/page.tsx && git commit -m "feat(hearing): add HearingPrepWizard with checklist, opening script, and courtroom guide"
```

---

## Phase 3: Verification

### Task 11: Run All Tests

```bash
cd "/Users/minwang/lawyer free" && npm run test:unit 2>&1 | tail -30
```

Expected: all existing tests pass (we added optional fields, no breaking changes).

```bash
cd "/Users/minwang/lawyer free" && npm run typecheck 2>&1 | tail -10
```

Expected: 0 errors.

### Task 12: Smoke Test in Browser

```bash
cd "/Users/minwang/lawyer free" && npm run dev
```

Visit `http://localhost:3000`. Log in and navigate to any case step. Verify:
- [ ] "Ask a question" floating button appears on every step
- [ ] Clicking it opens the chat drawer
- [ ] Typing a question and submitting streams a response
- [ ] "What's happening here?" overlay appears on steps that have `noviceExplanation`
- [ ] Toggling the overlay collapses/expands and persists in localStorage
- [ ] Preservation letter step shows the "Why send this letter?" banner
- [ ] Discovery task renders the 6-phase `NoviceDiscoveryWizard`
- [ ] Hearing prep task renders the 5-section `HearingPrepWizard`
- [ ] Petition wizard claims step shows the plain-English selector

### Task 13: Final Commit

```bash
cd "/Users/minwang/lawyer free" && git log --oneline -10
```

Verify all feature commits are present, then push.

---

## Summary of All New/Modified Files

| Action | File | Purpose |
|--------|------|---------|
| Modify | `packages/shared/src/guided-steps/types.ts` | Add `noviceExplanation`, `suggestedChatQuestions` |
| Modify | `packages/shared/src/guided-steps/evidence-vault.ts` + ~9 others | Back-fill `noviceExplanation` |
| Create | `apps/web/src/components/step/novice-help-overlay.tsx` | Why/what-next/glossary panel |
| Create | `apps/web/src/components/step/step-chat-drawer.tsx` | Floating AI chat |
| Create | `apps/web/src/app/api/ai/step-chat/route.ts` | Streaming chat API |
| Create | `apps/web/src/components/step/novice-discovery-wizard.tsx` | 6-phase discovery wizard |
| Create | `apps/web/src/components/step/hearing-prep-wizard.tsx` | 5-section hearing prep |
| Modify | `apps/web/src/components/step/preservation-letter-step.tsx` | Novice explainer + field tooltips |
| Modify | `apps/web/src/components/step/petition-wizard.tsx` | Claims selector, facts template, venue tooltip |
| Modify | `apps/web/src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx` | Mount chat + overlay, wire new wizards |
