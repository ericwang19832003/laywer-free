# TurboTax-Style Guided Steps Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform all 30 guidance-only steps from static accordion content into interactive Q&A flows that ask users one question at a time, save answers, and generate personalized action plans.

**Architecture:** A shared `GuidedStep` component replaces `StepRunner` for guidance-only steps. Each step defines its questions in a config file under `src/lib/guided-steps/`. The component renders one question at a time with a progress bar, auto-saves answers to task metadata, supports conditional questions, and generates a personalized summary. 10 parallel workers each handle 3 step configs.

**Tech Stack:** React 19, Next.js 16, TypeScript, Tailwind CSS 4, Vitest, existing Supabase task metadata API

---

### Task 1: Build the `GuidedStep` component

**Files:**
- Create: `src/components/step/guided-step.tsx`
- Reference: `src/components/step/step-runner.tsx` (for navigation/API patterns)
- Reference: `src/components/ui/button.tsx` (for button styles)

**Step 1: Create the types file**

Create `src/lib/guided-steps/types.ts`:

```typescript
export interface QuestionOption {
  value: string
  label: string
}

export interface QuestionDef {
  id: string
  prompt: string
  helpText?: string
  type: 'yes_no' | 'single_choice' | 'info'
  options?: QuestionOption[]
  /** Return false to skip this question based on prior answers */
  showIf?: (answers: Record<string, string>) => boolean
}

export interface SummaryItem {
  status: 'done' | 'needed' | 'info'
  text: string
}

export interface GuidedStepConfig {
  title: string
  reassurance: string
  questions: QuestionDef[]
  generateSummary: (answers: Record<string, string>) => SummaryItem[]
}
```

**Step 2: Build the GuidedStep component**

Create `src/components/step/guided-step.tsx`:

```tsx
'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import type { GuidedStepConfig, QuestionDef, SummaryItem } from '@/lib/guided-steps/types'

interface GuidedStepProps {
  caseId: string
  taskId: string
  config: GuidedStepConfig
  existingAnswers?: Record<string, string>
}

export function GuidedStep({ caseId, taskId, config, existingAnswers }: GuidedStepProps) {
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<string, string>>(existingAnswers ?? {})
  const [phase, setPhase] = useState<'questions' | 'summary'>('questions')
  const [loading, setLoading] = useState(false)

  // Filter questions based on showIf conditions
  const activeQuestions = config.questions.filter(
    (q) => !q.showIf || q.showIf(answers)
  )

  // Find the first unanswered question
  const currentQuestionIndex = activeQuestions.findIndex((q) => !(q.id in answers) || q.type === 'info' && !(q.id in answers))
  const currentQuestion = currentQuestionIndex >= 0 ? activeQuestions[currentQuestionIndex] : null
  const answeredCount = activeQuestions.filter((q) => q.id in answers).length
  const totalCount = activeQuestions.length

  // If all answered and still in questions phase, move to summary
  useEffect(() => {
    if (phase === 'questions' && currentQuestion === null && answeredCount > 0) {
      setPhase('summary')
    }
  }, [phase, currentQuestion, answeredCount])

  const patchTask = useCallback(async (status: string, metadata?: Record<string, unknown>) => {
    const body: Record<string, unknown> = { status }
    if (metadata) body.metadata = metadata
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to update task')
    }
  }, [taskId])

  async function handleAnswer(questionId: string, value: string) {
    const newAnswers = { ...answers, [questionId]: value }
    setAnswers(newAnswers)

    // Auto-save answers to task metadata
    try {
      await patchTask('in_progress', { guided_answers: newAnswers })
    } catch {
      // Non-fatal: continue even if save fails
    }
  }

  async function handleConfirm() {
    setLoading(true)
    try {
      await patchTask('completed', { guided_answers: answers })
      router.push(`/case/${caseId}`)
      router.refresh()
    } catch {
      setLoading(false)
    }
  }

  const summary = phase === 'summary' ? config.generateSummary(answers) : []

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href={`/case/${caseId}`}
        className="text-sm text-warm-muted hover:text-warm-text mb-6 inline-block"
      >
        &larr; Back to dashboard
      </Link>

      <h1 className="text-2xl font-semibold text-warm-text mb-1">{config.title}</h1>
      <p className="text-warm-muted mb-6">{config.reassurance}</p>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs text-warm-muted mb-2">
          <span>
            {phase === 'summary'
              ? 'Review your action plan'
              : `Question ${Math.min(answeredCount + 1, totalCount)} of ${totalCount}`}
          </span>
          <span>{Math.round((answeredCount / totalCount) * 100)}%</span>
        </div>
        <div className="h-2 rounded-full bg-warm-border overflow-hidden">
          <div
            className="h-full rounded-full bg-calm-indigo transition-all duration-500"
            style={{ width: `${(answeredCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {phase === 'questions' && currentQuestion && (
        <QuestionCard
          question={currentQuestion}
          onAnswer={(value) => handleAnswer(currentQuestion.id, value)}
        />
      )}

      {phase === 'summary' && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-medium text-warm-text mb-4">
              Your personalized action plan
            </h2>
            <div className="space-y-3 mb-6">
              {summary.map((item, i) => (
                <SummaryRow key={i} item={item} />
              ))}
            </div>
            <Button onClick={handleConfirm} disabled={loading} className="w-full">
              {loading ? 'Saving...' : "I'm ready \u2192"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function QuestionCard({
  question,
  onAnswer,
}: {
  question: QuestionDef
  onAnswer: (value: string) => void
}) {
  if (question.type === 'info') {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-4 mb-4">
            <p className="text-sm font-medium text-warm-text mb-2">{question.prompt}</p>
            {question.helpText && (
              <p className="text-sm text-warm-muted">{question.helpText}</p>
            )}
          </div>
          <Button onClick={() => onAnswer('acknowledged')} className="w-full">
            Got it &rarr;
          </Button>
        </CardContent>
      </Card>
    )
  }

  const options =
    question.type === 'yes_no'
      ? [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ]
      : question.options ?? []

  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-lg font-medium text-warm-text mb-2">{question.prompt}</p>
        {question.helpText && (
          <p className="text-sm text-warm-muted mb-4">{question.helpText}</p>
        )}
        <div className="space-y-3">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onAnswer(opt.value)}
              className="w-full rounded-lg border border-warm-border p-4 text-left text-sm font-medium text-warm-text hover:border-calm-indigo hover:bg-calm-indigo/5 transition-colors"
            >
              {opt.label}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function SummaryRow({ item }: { item: SummaryItem }) {
  const icon =
    item.status === 'done' ? '\u2713' : item.status === 'needed' ? '\u26A0' : '\u2139'
  const iconColor =
    item.status === 'done'
      ? 'text-green-600'
      : item.status === 'needed'
        ? 'text-amber-500'
        : 'text-calm-indigo'

  return (
    <div className="flex items-start gap-3 text-sm">
      <span className={`shrink-0 text-base ${iconColor}`}>{icon}</span>
      <span className="text-warm-text">{item.text}</span>
    </div>
  )
}
```

**Step 3: Run build to verify**

```bash
cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -5
```

**Step 4: Commit**

```bash
git add src/lib/guided-steps/types.ts src/components/step/guided-step.tsx
git commit -m "feat: add GuidedStep component for TurboTax-style Q&A flows"
```

---

### Task 2: Write tests for `GuidedStep` types and config validation

**Files:**
- Create: `tests/unit/guided-step-config.test.ts`

**Step 1: Write the config validation test**

```typescript
import { describe, it, expect } from 'vitest'
import type { GuidedStepConfig, QuestionDef } from '@/lib/guided-steps/types'

// Helper to validate a config
function validateConfig(config: GuidedStepConfig) {
  expect(config.title).toBeTruthy()
  expect(config.reassurance).toBeTruthy()
  expect(config.questions.length).toBeGreaterThan(0)
  expect(typeof config.generateSummary).toBe('function')

  // All question IDs must be unique
  const ids = config.questions.map((q) => q.id)
  expect(new Set(ids).size).toBe(ids.length)

  // All questions must have valid types
  for (const q of config.questions) {
    expect(['yes_no', 'single_choice', 'info']).toContain(q.type)
    if (q.type === 'single_choice') {
      expect(q.options).toBeDefined()
      expect(q.options!.length).toBeGreaterThanOrEqual(2)
    }
  }

  // generateSummary should return an array
  const emptyResult = config.generateSummary({})
  expect(Array.isArray(emptyResult)).toBe(true)
}

export { validateConfig }

describe('config validation helper', () => {
  it('validates a well-formed config', () => {
    const config: GuidedStepConfig = {
      title: 'Test Step',
      reassurance: 'This is a test.',
      questions: [
        { id: 'q1', prompt: 'Question 1?', type: 'yes_no' },
        {
          id: 'q2',
          prompt: 'Question 2?',
          type: 'single_choice',
          options: [
            { value: 'a', label: 'A' },
            { value: 'b', label: 'B' },
          ],
        },
      ],
      generateSummary: () => [{ status: 'done', text: 'All good' }],
    }
    expect(() => validateConfig(config)).not.toThrow()
  })
})
```

**Step 2: Run tests**

```bash
cd "/Users/minwang/lawyer free" && npx vitest run tests/unit/guided-step-config.test.ts
```

**Step 3: Commit**

```bash
git add tests/unit/guided-step-config.test.ts
git commit -m "test: add GuidedStep config validation helper and tests"
```

---

### Task 3: PI Trial Prep + PI Medical Records + PI Insurance Communication configs (Worker 1)

**Files:**
- Create: `src/lib/guided-steps/personal-injury/pi-trial-prep.ts`
- Create: `src/lib/guided-steps/personal-injury/pi-medical-records.ts`
- Create: `src/lib/guided-steps/personal-injury/pi-insurance-communication.ts`
- Modify: `src/components/step/personal-injury/pi-trial-prep-step.tsx`
- Modify: `src/components/step/personal-injury/pi-medical-records-step.tsx`
- Modify: `src/components/step/personal-injury/pi-insurance-communication-step.tsx`
- Create: `tests/unit/guided-steps/pi-trial-prep.test.ts`

**Step 1: Create PI Trial Prep config**

Create `src/lib/guided-steps/personal-injury/pi-trial-prep.ts`:

```typescript
import type { GuidedStepConfig } from '../types'

export const piTrialPrepConfig: GuidedStepConfig = {
  title: 'Prepare for Trial',
  reassurance: 'Being well-prepared gives you the best chance of presenting your case effectively.',
  questions: [
    {
      id: 'has_injuries',
      prompt: 'Do you have any physical injuries from this incident?',
      type: 'yes_no',
    },
    {
      id: 'medical_records_status',
      prompt: 'Do you have your medical records organized?',
      helpText: 'This includes ER visits, doctor notes, imaging results, and prescription records.',
      type: 'single_choice',
      showIf: (a) => a.has_injuries === 'yes',
      options: [
        { value: 'all_organized', label: 'Yes, all organized chronologically' },
        { value: 'some_not_all', label: 'I have some, but not all of them' },
        { value: 'not_started', label: "I haven't started collecting them" },
      ],
    },
    {
      id: 'medical_bills_totaled',
      prompt: 'Do you have a total for all your medical bills?',
      type: 'yes_no',
      showIf: (a) => a.has_injuries === 'yes',
    },
    {
      id: 'has_photos',
      prompt: 'Do you have photos of injuries, vehicle damage, or the accident scene?',
      type: 'yes_no',
    },
    {
      id: 'has_police_report',
      prompt: 'Do you have a copy of the police report?',
      type: 'yes_no',
    },
    {
      id: 'has_demand_letter_copies',
      prompt: 'Do you have copies of your demand letter and insurance correspondence?',
      type: 'yes_no',
    },
    {
      id: 'has_lost_wages_proof',
      prompt: 'Do you have proof of lost wages (pay stubs, employer letter)?',
      helpText: 'Skip if lost wages are not part of your claim.',
      type: 'single_choice',
      options: [
        { value: 'yes', label: 'Yes, I have documentation' },
        { value: 'not_applicable', label: 'Lost wages are not part of my claim' },
        { value: 'no', label: 'No, I need to get this' },
      ],
    },
    {
      id: 'damages_summary_prepared',
      prompt: 'Have you prepared a damages summary organized by category?',
      helpText: 'Categories: medical expenses, lost wages, property damage, pain and suffering.',
      type: 'yes_no',
    },
    {
      id: 'direct_exam_outline',
      prompt: 'Have you written an outline of your testimony (what happened, injuries, impact on your life)?',
      type: 'yes_no',
    },
    {
      id: 'cross_exam_info',
      prompt: 'Important: During cross-examination, answer only the question asked. Don\'t volunteer extra information. Stay calm and composed.',
      helpText: 'It\'s okay to say "I don\'t remember" if you genuinely don\'t. Never argue with the other side\'s attorney.',
      type: 'info',
    },
    {
      id: 'three_copies',
      prompt: 'Remember: Bring 3 copies of ALL documents — one for you, one for the judge, one for the defendant.',
      type: 'info',
    },
  ],
  generateSummary: (answers) => {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.has_injuries === 'yes') {
      if (answers.medical_records_status === 'all_organized') {
        items.push({ status: 'done', text: 'Medical records are organized' })
      } else if (answers.medical_records_status === 'some_not_all') {
        items.push({ status: 'needed', text: 'Collect remaining medical records — send HIPAA requests to all providers' })
      } else {
        items.push({ status: 'needed', text: 'Start collecting medical records immediately — send HIPAA authorization to each provider' })
      }

      if (answers.medical_bills_totaled === 'yes') {
        items.push({ status: 'done', text: 'Medical bills are totaled' })
      } else {
        items.push({ status: 'needed', text: 'Total all medical bills by category' })
      }
    }

    if (answers.has_photos === 'yes') {
      items.push({ status: 'done', text: 'Photos of injuries/damage are ready' })
    } else {
      items.push({ status: 'needed', text: 'Gather photos of injuries, vehicle damage, and accident scene' })
    }

    if (answers.has_police_report === 'yes') {
      items.push({ status: 'done', text: 'Police report is ready' })
    } else {
      items.push({ status: 'needed', text: 'Obtain a copy of the police report from the department' })
    }

    if (answers.has_demand_letter_copies === 'yes') {
      items.push({ status: 'done', text: 'Demand letter and insurance correspondence ready' })
    } else {
      items.push({ status: 'needed', text: 'Compile your demand letter and all insurance correspondence' })
    }

    if (answers.has_lost_wages_proof === 'yes') {
      items.push({ status: 'done', text: 'Lost wages documentation ready' })
    } else if (answers.has_lost_wages_proof === 'no') {
      items.push({ status: 'needed', text: 'Get proof of lost wages from employer (pay stubs, letter)' })
    }

    if (answers.damages_summary_prepared === 'yes') {
      items.push({ status: 'done', text: 'Damages summary chart is ready' })
    } else {
      items.push({ status: 'needed', text: 'Create a damages summary chart by category (medical, lost wages, property, pain & suffering)' })
    }

    if (answers.direct_exam_outline === 'yes') {
      items.push({ status: 'done', text: 'Testimony outline is prepared' })
    } else {
      items.push({ status: 'needed', text: 'Write an outline of your testimony in chronological order' })
    }

    items.push({ status: 'info', text: 'Bring 3 copies of ALL documents to court' })

    return items
  },
}
```

**Step 2: Create PI Medical Records config**

Create `src/lib/guided-steps/personal-injury/pi-medical-records.ts`:

```typescript
import type { GuidedStepConfig } from '../types'

export const piMedicalRecordsConfig: GuidedStepConfig = {
  title: 'Organize Your Medical Records',
  reassurance: 'Complete medical documentation strengthens your case and helps calculate your full damages.',
  questions: [
    {
      id: 'visited_er',
      prompt: 'Did you visit the emergency room after the incident?',
      type: 'yes_no',
    },
    {
      id: 'er_records_obtained',
      prompt: 'Have you obtained your ER records and discharge summary?',
      type: 'yes_no',
      showIf: (a) => a.visited_er === 'yes',
    },
    {
      id: 'seeing_specialists',
      prompt: 'Are you seeing any specialists (orthopedic, neurologist, etc.)?',
      type: 'yes_no',
    },
    {
      id: 'specialist_records_obtained',
      prompt: 'Have you collected records from all your specialists?',
      type: 'single_choice',
      showIf: (a) => a.seeing_specialists === 'yes',
      options: [
        { value: 'all', label: 'Yes, from all specialists' },
        { value: 'some', label: 'From some, but not all' },
        { value: 'none', label: 'Not yet' },
      ],
    },
    {
      id: 'has_imaging',
      prompt: 'Do you have any imaging results (X-rays, MRIs, CT scans)?',
      type: 'yes_no',
    },
    {
      id: 'taking_prescriptions',
      prompt: 'Are you taking any prescriptions related to the incident?',
      type: 'yes_no',
    },
    {
      id: 'prescription_receipts',
      prompt: 'Do you have pharmacy receipts for all prescriptions?',
      type: 'yes_no',
      showIf: (a) => a.taking_prescriptions === 'yes',
    },
    {
      id: 'doing_pt',
      prompt: 'Are you doing physical therapy or rehabilitation?',
      type: 'yes_no',
    },
    {
      id: 'mental_health_impact',
      prompt: 'Has the incident affected your mental health (anxiety, PTSD, depression)?',
      type: 'yes_no',
    },
    {
      id: 'hipaa_requests_sent',
      prompt: 'Have you sent written HIPAA authorization requests to your medical providers?',
      helpText: 'Providers must respond within 30 days. Keep copies of all requests you send.',
      type: 'single_choice',
      options: [
        { value: 'all_sent', label: 'Yes, to all providers' },
        { value: 'some_sent', label: 'To some providers' },
        { value: 'not_sent', label: 'Not yet' },
      ],
    },
    {
      id: 'timeline_created',
      prompt: 'Have you created a chronological timeline of all your medical visits?',
      helpText: 'For each visit: date, provider, treatment received, and cost.',
      type: 'yes_no',
    },
    {
      id: 'mmi_info',
      prompt: 'Important: Do NOT send your demand letter until you reach Maximum Medical Improvement (MMI) — the point where your condition has stabilized.',
      helpText: 'Sending too early means you may undervalue your claim. Ask your doctor when they expect you to reach MMI.',
      type: 'info',
    },
  ],
  generateSummary: (answers) => {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.visited_er === 'yes') {
      if (answers.er_records_obtained === 'yes') {
        items.push({ status: 'done', text: 'ER records obtained' })
      } else {
        items.push({ status: 'needed', text: 'Request ER records and discharge summary' })
      }
    }

    if (answers.seeing_specialists === 'yes') {
      if (answers.specialist_records_obtained === 'all') {
        items.push({ status: 'done', text: 'All specialist records collected' })
      } else {
        items.push({ status: 'needed', text: 'Collect records from remaining specialists' })
      }
    }

    if (answers.has_imaging === 'yes') {
      items.push({ status: 'done', text: 'Imaging results collected' })
    } else if (answers.has_imaging === 'no') {
      items.push({ status: 'info', text: 'No imaging results to collect' })
    }

    if (answers.taking_prescriptions === 'yes') {
      if (answers.prescription_receipts === 'yes') {
        items.push({ status: 'done', text: 'Pharmacy receipts collected' })
      } else {
        items.push({ status: 'needed', text: 'Collect pharmacy receipts for all prescriptions' })
      }
    }

    if (answers.doing_pt === 'yes') {
      items.push({ status: 'needed', text: 'Collect records from physical therapy/rehabilitation' })
    }

    if (answers.mental_health_impact === 'yes') {
      items.push({ status: 'needed', text: 'Document mental health treatment and obtain records' })
    }

    if (answers.hipaa_requests_sent === 'all_sent') {
      items.push({ status: 'done', text: 'HIPAA requests sent to all providers' })
    } else if (answers.hipaa_requests_sent === 'some_sent') {
      items.push({ status: 'needed', text: 'Send HIPAA requests to remaining providers' })
    } else {
      items.push({ status: 'needed', text: 'Send written HIPAA authorization to every provider' })
    }

    if (answers.timeline_created === 'yes') {
      items.push({ status: 'done', text: 'Medical timeline created' })
    } else {
      items.push({ status: 'needed', text: 'Create chronological timeline of all visits (date, provider, treatment, cost)' })
    }

    items.push({ status: 'info', text: 'Wait for MMI before sending demand letter' })

    return items
  },
}
```

**Step 3: Create PI Insurance Communication config**

Create `src/lib/guided-steps/personal-injury/pi-insurance-communication.ts`:

```typescript
import type { GuidedStepConfig } from '../types'

export const piInsuranceCommunicationConfig: GuidedStepConfig = {
  title: 'Communicate With Insurance',
  reassurance: 'Knowing how to handle insurance adjusters protects your claim.',
  questions: [
    {
      id: 'claim_filed',
      prompt: 'Have you filed an insurance claim with the at-fault party\'s insurer?',
      type: 'yes_no',
    },
    {
      id: 'adjuster_contacted_you',
      prompt: 'Has an insurance adjuster contacted you?',
      type: 'yes_no',
    },
    {
      id: 'recorded_statement_requested',
      prompt: 'Has the adjuster asked you to give a recorded statement?',
      type: 'yes_no',
      showIf: (a) => a.adjuster_contacted_you === 'yes',
    },
    {
      id: 'recorded_statement_warning',
      prompt: 'Important: You are NOT required to give a recorded statement to the other driver\'s insurance company. Anything you say can be used to minimize your claim.',
      helpText: 'If pressured, say: "I\'m not giving a recorded statement at this time."',
      type: 'info',
      showIf: (a) => a.recorded_statement_requested === 'yes',
    },
    {
      id: 'offered_quick_settlement',
      prompt: 'Has the insurance company offered you a quick settlement?',
      type: 'yes_no',
    },
    {
      id: 'quick_settlement_warning',
      prompt: 'Important: Early settlement offers are almost always too low. They are made before the full extent of your injuries is known. Do NOT accept until you\'ve reached Maximum Medical Improvement.',
      type: 'info',
      showIf: (a) => a.offered_quick_settlement === 'yes',
    },
    {
      id: 'documenting_communications',
      prompt: 'Are you keeping written records of all communications with the insurance company?',
      helpText: 'Log the date, time, who you spoke with, and what was discussed.',
      type: 'yes_no',
    },
    {
      id: 'know_policy_limits',
      prompt: 'Do you know the at-fault party\'s policy limits?',
      helpText: 'This determines the maximum the insurance company will pay.',
      type: 'single_choice',
      options: [
        { value: 'yes', label: 'Yes, I know the limits' },
        { value: 'no', label: 'No, I haven\'t found out' },
        { value: 'unsure', label: 'I\'m not sure what this means' },
      ],
    },
    {
      id: 'adjuster_tactics_info',
      prompt: 'Watch out for common adjuster tactics: They may seem friendly but are working to minimize your payout. They may delay responses, request unnecessary documents, or use your social media against you.',
      helpText: 'Limit what you post on social media during your claim.',
      type: 'info',
    },
  ],
  generateSummary: (answers) => {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.claim_filed === 'yes') {
      items.push({ status: 'done', text: 'Insurance claim filed' })
    } else {
      items.push({ status: 'needed', text: 'File an insurance claim with the at-fault party\'s insurer' })
    }

    if (answers.recorded_statement_requested === 'yes') {
      items.push({ status: 'info', text: 'Do NOT give a recorded statement — you are not required to' })
    }

    if (answers.offered_quick_settlement === 'yes') {
      items.push({ status: 'info', text: 'Do NOT accept the early settlement — wait until you reach MMI' })
    }

    if (answers.documenting_communications === 'yes') {
      items.push({ status: 'done', text: 'Keeping communication log' })
    } else {
      items.push({ status: 'needed', text: 'Start a log of all insurance communications (date, person, details)' })
    }

    if (answers.know_policy_limits === 'yes') {
      items.push({ status: 'done', text: 'Policy limits are known' })
    } else {
      items.push({ status: 'needed', text: 'Find out the at-fault party\'s policy limits' })
    }

    items.push({ status: 'info', text: 'Limit social media activity during your claim' })

    return items
  },
}
```

**Step 4: Rewrite the step components to use GuidedStep**

Rewrite `src/components/step/personal-injury/pi-trial-prep-step.tsx`:

```tsx
'use client'

import { GuidedStep } from '../guided-step'
import { piTrialPrepConfig } from '@/lib/guided-steps/personal-injury/pi-trial-prep'

interface PITrialPrepStepProps {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
}

export function PITrialPrepStep({ caseId, taskId, existingAnswers }: PITrialPrepStepProps) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={piTrialPrepConfig}
      existingAnswers={existingAnswers}
    />
  )
}
```

Apply the same pattern for `pi-medical-records-step.tsx` and `pi-insurance-communication-step.tsx`.

**Step 5: Update the step page router to pass existingAnswers**

In `src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx`, where `pi_trial_prep`, `pi_medical_records`, and `pi_insurance_communication` are routed, pass `existingAnswers={task.metadata?.guided_answers}` to each component.

**Step 6: Write tests**

Create `tests/unit/guided-steps/pi-trial-prep.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { piTrialPrepConfig } from '@/lib/guided-steps/personal-injury/pi-trial-prep'
import { piMedicalRecordsConfig } from '@/lib/guided-steps/personal-injury/pi-medical-records'
import { piInsuranceCommunicationConfig } from '@/lib/guided-steps/personal-injury/pi-insurance-communication'

function validateConfig(config: { title: string; questions: { id: string; type: string; options?: { value: string }[] }[]; generateSummary: (a: Record<string, string>) => unknown[] }) {
  const ids = config.questions.map((q) => q.id)
  expect(new Set(ids).size).toBe(ids.length)
  for (const q of config.questions) {
    expect(['yes_no', 'single_choice', 'info']).toContain(q.type)
    if (q.type === 'single_choice') {
      expect(q.options!.length).toBeGreaterThanOrEqual(2)
    }
  }
  expect(Array.isArray(config.generateSummary({}))).toBe(true)
}

describe('PI Trial Prep config', () => {
  it('is valid', () => validateConfig(piTrialPrepConfig))
  it('generates summary with needed items for empty answers', () => {
    const summary = piTrialPrepConfig.generateSummary({})
    expect(summary.length).toBeGreaterThan(0)
    expect(summary.some((s) => s.status === 'needed')).toBe(true)
  })
  it('generates done items when all answered yes', () => {
    const summary = piTrialPrepConfig.generateSummary({
      has_injuries: 'yes',
      medical_records_status: 'all_organized',
      medical_bills_totaled: 'yes',
      has_photos: 'yes',
      has_police_report: 'yes',
      has_demand_letter_copies: 'yes',
      has_lost_wages_proof: 'yes',
      damages_summary_prepared: 'yes',
      direct_exam_outline: 'yes',
    })
    const doneCount = summary.filter((s) => s.status === 'done').length
    expect(doneCount).toBeGreaterThanOrEqual(7)
  })
})

describe('PI Medical Records config', () => {
  it('is valid', () => validateConfig(piMedicalRecordsConfig))
  it('skips ER question when no ER visit', () => {
    const erQ = piMedicalRecordsConfig.questions.find((q) => q.id === 'er_records_obtained')
    expect(erQ?.showIf?.({ visited_er: 'no' })).toBe(false)
  })
})

describe('PI Insurance Communication config', () => {
  it('is valid', () => validateConfig(piInsuranceCommunicationConfig))
  it('shows recorded statement warning only when requested', () => {
    const warningQ = piInsuranceCommunicationConfig.questions.find((q) => q.id === 'recorded_statement_warning')
    expect(warningQ?.showIf?.({ recorded_statement_requested: 'no' })).toBe(false)
    expect(warningQ?.showIf?.({ recorded_statement_requested: 'yes' })).toBe(true)
  })
})
```

**Step 7: Run tests, build, commit**

```bash
cd "/Users/minwang/lawyer free" && npx vitest run tests/unit/guided-steps/
cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -5
git add src/lib/guided-steps/personal-injury/ src/components/step/personal-injury/pi-trial-prep-step.tsx src/components/step/personal-injury/pi-medical-records-step.tsx src/components/step/personal-injury/pi-insurance-communication-step.tsx tests/unit/guided-steps/
git commit -m "feat: convert PI trial prep, medical records, insurance steps to guided Q&A"
```

---

### Task 4: PI Settlement + PI Post-Resolution + PI Serve Defendant configs (Worker 2)

**Files:**
- Create: `src/lib/guided-steps/personal-injury/pi-settlement-negotiation.ts`
- Create: `src/lib/guided-steps/personal-injury/pi-post-resolution.ts`
- Create: `src/lib/guided-steps/personal-injury/pi-serve-defendant.ts`
- Modify: corresponding step components to use GuidedStep
- Create: `tests/unit/guided-steps/pi-settlement.test.ts`

**Pattern:** Same as Task 3. Read the existing step component for content, transform bullet points into questions with conditional logic, write generateSummary, rewrite the step component, test, build, commit.

**Content to transform:**

**pi-settlement-negotiation:** 4 sections → questions about:
- Have you received a settlement offer? (yes_no)
- Is the offer reasonable compared to your damages total? (single_choice: too_low/fair/unsure)
- Info: How to write a counter-offer
- Are you open to mediation? (yes_no)
- Info: When to file suit vs. accept (statute of limitations warning)

**pi-post-resolution:** 4 sections → questions about:
- What was the outcome? (single_choice: settled/won_trial/lost/pending)
- If settled: Have you reviewed the settlement for liens? (yes_no, showIf settled)
- If won: Has the defendant paid? (yes_no, showIf won)
- If lost: Are you considering an appeal? (yes_no, showIf lost)
- Info: Tax implications of settlements

**pi-serve-defendant:** 4 sections → questions about:
- Do you know the defendant's address? (yes_no)
- Which service method will you use? (single_choice: constable/process_server/certified_mail)
- Have you filed proof of service? (yes_no)
- Info: Timeline — service must be completed within 120 days of filing

---

### Task 5: PI File With Court + Civil Trial Prep Checklist + Discovery Starter Pack configs (Worker 3)

**Files:**
- Create: `src/lib/guided-steps/personal-injury/pi-file-with-court.ts`
- Create: `src/lib/guided-steps/trial-prep-checklist.ts`
- Create: `src/lib/guided-steps/discovery-starter-pack.ts`
- Modify: corresponding step components
- Create: `tests/unit/guided-steps/civil-steps.test.ts`

**Content to transform:**

**pi-file-with-court:** 4 sections → questions about:
- Do you know which court to file in? (single_choice: yes/not_sure)
- Info: How to e-file in Texas via eFileTexas.gov
- Are you aware of your filing fee? (yes_no)
- Do you know your statute of limitations deadline? (yes_no)
- Info: Critical SOL warning

**trial-prep-checklist:** 5 dynamic sections → questions about:
- Have you filed all pre-trial motions? (yes_no)
- Are your exhibits organized and labeled? (yes_no)
- Have you prepared witness lists? (yes_no)
- Have you visited the courtroom? (yes_no)
- Have you reviewed relevant case law? (yes_no)

**discovery-starter-pack:** 4 sections → questions about:
- Is this your first time going through discovery? (yes_no)
- Do you understand the discovery tools available? (single_choice)
- Info: Key deadlines and rules for your court type
- Have you served initial discovery requests? (yes_no)

---

### Task 6: Rule 26(f) Prep + Evidence Vault + File With Court (general) + Understand Removal configs (Worker 4)

**Files:**
- Create: `src/lib/guided-steps/rule-26f-prep.ts`
- Create: `src/lib/guided-steps/evidence-vault.ts`
- Create: `src/lib/guided-steps/file-with-court.ts`
- Create: `src/lib/guided-steps/understand-removal.ts`
- Modify: corresponding step components
- Create: `tests/unit/guided-steps/civil-general.test.ts`

**Note:** rule-26f-prep-step has a form field (conferenceDate). The GuidedStep component handles Q&A; the date input should be preserved as a regular form field below the GuidedStep. Use GuidedStep for the educational content only, keep the date input separate. Alternatively, add the date as a question with type `single_choice` indicating readiness.

**Content to transform:**

**rule-26f-prep:** 3 sections → questions about:
- Have you received a scheduling order from the court? (yes_no)
- Have you gathered your initial disclosure documents? (yes_no)
- Do you know what topics to discuss at the conference? (yes_no)
- Info: Discovery plan topics to prepare

**evidence-vault:** 3 sections → questions about:
- Do you have contracts or written agreements related to your dispute? (yes_no)
- Do you have photos or videos as evidence? (yes_no)
- Do you have text messages, emails, or letters? (yes_no)
- Do you have financial records (invoices, receipts, bank statements)? (yes_no)
- Do you have witnesses who can support your case? (yes_no)
- Info: How to organize and name your evidence files

**file-with-court:** 5 FAQs → questions about:
- Is this your first time filing with a court? (yes_no)
- Do you know the filing fee for your court? (yes_no)
- Info: You don't need a lawyer to file
- Info: Common mistakes and how to fix them

**understand-removal:** 3 sections → questions about:
- Has your case been removed to federal court? (yes_no)
- Do you understand why it was removed? (single_choice)
- Info: Your options (remand motion vs. continue in federal court)

---

### Task 7: Small Claims — Serve Defendant + Prepare for Hearing + Hearing Day configs (Worker 5)

**Files:**
- Create: `src/lib/guided-steps/small-claims/serve-defendant.ts`
- Create: `src/lib/guided-steps/small-claims/prepare-for-hearing.ts`
- Create: `src/lib/guided-steps/small-claims/hearing-day.ts`
- Modify: corresponding step components
- Create: `tests/unit/guided-steps/small-claims.test.ts`

**Content to transform:**

**serve-defendant:** 3 sections → questions about:
- Do you know the defendant's address? (yes_no)
- Which service method are you using? (single_choice: certified_mail/constable/process_server)
- Have you completed service? (yes_no)
- Info: What if they can't be found — alternative service options

**prepare-for-hearing:** 3 sections → questions about:
- Do you have all your evidence organized? (yes_no)
- Have you made copies for the judge and defendant? (yes_no)
- Have you practiced explaining your case briefly? (yes_no)
- Info: What the judge expects — be concise, stick to facts

**hearing-day:** 3 sections → questions about:
- Do you know where and when your hearing is? (yes_no)
- Have you arrived early to find the courtroom? (single_choice or info)
- Info: What happens during the hearing — procedure overview
- Info: After the hearing — judgment, appeal options, enforcement

---

### Task 8: Landlord-Tenant — Serve + Hearing Prep + Hearing Day + Post-Judgment configs (Worker 6)

**Files:**
- Create: `src/lib/guided-steps/landlord-tenant/serve-other-party.ts`
- Create: `src/lib/guided-steps/landlord-tenant/lt-hearing-prep.ts`
- Create: `src/lib/guided-steps/landlord-tenant/lt-hearing-day.ts`
- Create: `src/lib/guided-steps/landlord-tenant/post-judgment.ts`
- Modify: corresponding step components
- Create: `tests/unit/guided-steps/landlord-tenant.test.ts`

**Content to transform:**

**serve-other-party:** 3 sections → questions about:
- Do you know the other party's address? (yes_no)
- Is this an eviction case? (yes_no)
- Info (showIf eviction): Special door-posting rules for eviction service
- Which service method? (single_choice)
- Have you completed service? (yes_no)

**lt-hearing-prep:** 3 sections → questions about:
- Do you have your lease agreement? (yes_no)
- Do you have photos of the property condition? (yes_no)
- Do you have records of rent payments? (yes_no)
- Have you made copies for the judge? (yes_no)
- Info: Organize evidence chronologically

**lt-hearing-day:** 3 sections → same pattern as small claims hearing day

**post-judgment:** 3 sections → questions about:
- What was the outcome? (single_choice: won/lost/settled)
- If won: Has the other party complied? (yes_no, showIf won)
- If lost: Are you considering appeal? (yes_no, showIf lost)
- Info: Enforcement options (writ of possession, garnishment, liens)

---

### Task 9: Debt Defense — Serve Plaintiff + File With Court + Hearing Prep configs (Worker 7)

**Files:**
- Create: `src/lib/guided-steps/debt-defense/serve-plaintiff.ts`
- Create: `src/lib/guided-steps/debt-defense/debt-file-with-court.ts`
- Create: `src/lib/guided-steps/debt-defense/debt-hearing-prep.ts`
- Modify: corresponding step components
- Create: `tests/unit/guided-steps/debt-defense-1.test.ts`

**Content to transform:**

**serve-plaintiff:** 3 sections → questions about:
- Have you prepared your certificate of service? (yes_no)
- Which service method? (single_choice: certified_mail/e_service/hand_delivery)
- Have you completed service? (yes_no)
- Info: What happens after service — timeline

**debt-file-with-court:** 4 sections → questions about:
- Do you know your answer filing deadline? (yes_no)
- Info: Critical — missing the deadline can result in default judgment
- Do you know where to file? (yes_no)
- Are you using e-filing? (yes_no)
- Do you know the filing fee? (yes_no)

**debt-hearing-prep:** 4 sections → questions about:
- Do you have your evidence organized? (yes_no)
- Which defenses are you planning to raise? (single_choice: sol/lack_standing/fdcpa/general_denial)
- Has the plaintiff's attorney contacted you about settlement? (yes_no)
- Are you open to settling? (single_choice: yes/no/depends_on_terms)
- Info: Common creditor attorney tactics to watch for

---

### Task 10: Debt Defense — Hearing Day + Post-Judgment + Preflight configs (Worker 8)

**Files:**
- Create: `src/lib/guided-steps/debt-defense/debt-hearing-day.ts`
- Create: `src/lib/guided-steps/debt-defense/debt-post-judgment.ts`
- Create: `src/lib/guided-steps/debt-defense/debt-preflight.ts`
- Modify: corresponding step components
- Create: `tests/unit/guided-steps/debt-defense-2.test.ts`

**Content to transform:**

**debt-hearing-day:** 4 sections → questions about:
- Do you know where and when your hearing is? (yes_no)
- Have you brought all your evidence? (yes_no)
- Info: Courtroom etiquette
- Info: Common creditor attorney tactics (late documents, continuances)
- Info: Possible outcomes overview

**debt-post-judgment:** 4 sections → questions about:
- What was the outcome? (single_choice: dismissed/judgment_for_plaintiff/judgment_for_me)
- If judgment for plaintiff: Do you know your state's exemptions? (yes_no, showIf)
- Info (showIf Texas): Texas wage garnishment prohibition and homestead exemption
- Are you considering appeal? (yes_no)
- Info: Asset protection basics

**debt-preflight:** 3 sections → questions about:
- Are you aware of your rights under the FDCPA? (yes_no)
- Info: FDCPA rights summary
- Do you understand what a debt validation letter does? (yes_no)
- Info: Validation letter purpose
- Which answer strategy? (single_choice: general_denial/specific_defenses)

---

### Task 11: Family — Mediation + Waiting Period + Temporary Orders + Final Orders configs (Worker 9)

**Files:**
- Create: `src/lib/guided-steps/family/mediation.ts`
- Create: `src/lib/guided-steps/family/waiting-period.ts`
- Create: `src/lib/guided-steps/family/temporary-orders.ts`
- Create: `src/lib/guided-steps/family/final-orders.ts`
- Modify: corresponding step components
- Create: `tests/unit/guided-steps/family.test.ts`

**Content to transform:**

**mediation:** 3 sections → questions about:
- Has the court ordered mediation? (yes_no)
- Have you chosen a mediator? (yes_no)
- Have you prepared a list of issues to resolve? (yes_no)
- Info: What mediation is and how it works
- Info: What happens if mediation fails — trial alternative

**waiting-period:** 1 section → questions about:
- Do you know when your 60-day waiting period ends? (yes_no)
- Info: Texas Family Code requires 60-day waiting period
- Are you using this time to prepare your case? (yes_no)
- Info: Things to work on during the waiting period

**temporary-orders:** 3 sections → questions about:
- Are there immediate safety concerns? (yes_no)
- Do you need temporary custody arrangements? (yes_no)
- Do you need temporary child support? (yes_no)
- Do you need property restraining orders? (yes_no)
- Info: Types of temporary orders and when they apply

**final-orders:** 3 sections → questions about:
- Is your final hearing scheduled? (yes_no)
- Have you prepared your proposed final order? (yes_no)
- Do you have all required financial documents? (yes_no)
- Info: What happens at the final hearing
- Info: After the order — compliance and modification options

---

### Task 12: Update step page router to pass existingAnswers to all converted steps (Worker 10)

**Files:**
- Modify: `src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx`

**Step 1: Add existingAnswers prop**

In the step page router, for every step that now uses `GuidedStep`, pass `existingAnswers={task.metadata?.guided_answers}` as a prop. This enables resume support.

The steps to update (all 30):
- `pi_trial_prep`, `pi_medical_records`, `pi_insurance_communication`
- `pi_settlement_negotiation`, `pi_post_resolution`, `pi_serve_defendant`
- `pi_file_with_court`, `trial_prep_checklist`, `discovery_starter_pack`
- `rule_26f_prep`, `evidence_vault`, `file_with_court`, `understand_removal`
- `serve_defendant` (small claims), `prepare_for_hearing` (small claims), `hearing_day` (small claims)
- `serve_other_party`, `prepare_for_hearing` (LT), `hearing_day` (LT), `post_judgment`
- `serve_plaintiff`, `debt_file_with_court`, `debt_hearing_prep`
- `debt_hearing_day`, `debt_post_judgment`, `debt_preflight`
- `mediation`, `waiting_period`, `temporary_orders`, `final_orders`

**Step 2: Build, test, commit**

```bash
cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -5
git add src/app/\(authenticated\)/case/\[id\]/step/\[taskId\]/page.tsx
git commit -m "feat: wire all 30 guided steps with existingAnswers prop for resume support"
```

---

## Execution Notes

- **Tasks 1-2** are sequential (build component, then tests)
- **Tasks 3-11** are parallelizable (each worker handles 3-4 step configs independently)
- **Task 12** depends on all configs being done (wires everything together)
- Each config file follows the exact same pattern: define questions, define generateSummary, export config
- Each step component rewrite is identical: import GuidedStep + config, render with caseId/taskId/existingAnswers
- All existing form-based steps (intake, filing, etc.) are untouched — only guidance-only steps change
