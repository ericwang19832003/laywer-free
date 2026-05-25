# Agent Testing Suite — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a three-layer test suite (unit edge cases + live integration tests + LLM eval framework) for the LangGraph Case Strategy Agent.

**Architecture:** Unit tests expand existing mocked coverage; integration tests run `buildAgentGraph` against real GPT-4o-mini + a Supabase test DB seeded per-test; the eval framework runs 20 golden Q&A pairs through the agent and scores answers with a GPT-4o judge, printing a pass/fail report.

**Tech Stack:** Vitest, LangGraph.js, OpenAI SDK, Supabase JS client, tsx (for the eval CLI runner)

---

## Task 1: Add npm scripts and vitest integration config

**Files:**
- Modify: `apps/web/package.json`
- Create: `apps/web/vitest.integration.config.ts`

**Step 1: Add scripts to package.json**

In `apps/web/package.json`, inside the `"scripts"` block, add:

```json
"test:unit": "vitest run",
"test:integration": "vitest run --config vitest.integration.config.ts",
"eval": "tsx src/lib/ai/agent/evals/run-evals.ts"
```

**Step 2: Create vitest.integration.config.ts**

```typescript
// apps/web/vitest.integration.config.ts
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/lib/ai/agent/integration/**/*.test.ts'],
    testTimeout: 60_000,
    hookTimeout: 30_000,
    setupFiles: ['src/lib/ai/agent/integration/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**Step 3: Verify the config parses**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npx vitest --config vitest.integration.config.ts --version 2>&1 | head -5
```
Expected: prints vitest version with no error.

**Step 4: Commit**

```bash
cd "/Users/minwang/lawyer free" && git add apps/web/package.json apps/web/vitest.integration.config.ts && git commit -m "chore: add test:integration and eval npm scripts"
```

---

## Task 2: Expand unit tests — edge cases for analyze_deadlines

**Files:**
- Modify: `apps/web/src/lib/ai/agent/tools/__tests__/analyze-deadlines.test.ts`

**Step 1: Add edge case tests**

Append to the existing test file:

```typescript
  it('handles deadline exactly today (daysUntil = 0) as URGENT', async () => {
    const today = new Date()
    today.setHours(23, 59, 0, 0)
    const tool = createAnalyzeDeadlinesTool({
      deadlines: [{ key: 'file', due_at: today.toISOString(), label: 'File motion' }],
    })
    const result = await tool.invoke({})
    expect(result).toContain('URGENT')
    expect(result).toContain('File motion')
  })

  it('handles multiple deadlines with mixed statuses', async () => {
    const tool = createAnalyzeDeadlinesTool({
      deadlines: [
        { key: 'a', due_at: new Date(Date.now() - 86400000).toISOString(), label: 'Past deadline' },
        { key: 'b', due_at: new Date(Date.now() + 2 * 86400000).toISOString(), label: 'Urgent deadline' },
        { key: 'c', due_at: new Date(Date.now() + 20 * 86400000).toISOString(), label: 'Future deadline' },
      ],
    })
    const result = await tool.invoke({})
    expect(result).toContain('OVERDUE')
    expect(result).toContain('URGENT')
    expect(result).toContain('due in 20')
  })
```

**Step 2: Run tests**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npx vitest run src/lib/ai/agent/tools/__tests__/analyze-deadlines.test.ts 2>&1 | tail -10
```
Expected: 5/5 passing.

**Step 3: Commit**

```bash
cd "/Users/minwang/lawyer free" && git add apps/web/src/lib/ai/agent/tools/__tests__/analyze-deadlines.test.ts && git commit -m "test: add edge cases for analyze_deadlines tool"
```

---

## Task 3: Expand unit tests — edge cases for review_evidence

**Files:**
- Modify: `apps/web/src/lib/ai/agent/tools/__tests__/review-evidence.test.ts`

**Step 1: Add edge case tests**

Append to the existing test file:

```typescript
  it('shows action-needed message when evidence is thin', async () => {
    const tool = createReviewEvidenceTool({ evidenceCount: 1, disputeType: 'landlord_tenant' })
    const result = await tool.invoke({})
    expect(result).toContain('upload more')
  })

  it('uses fallback guidance for unknown dispute type', async () => {
    const tool = createReviewEvidenceTool({ evidenceCount: 2, disputeType: 'unknown_type' })
    const result = await tool.invoke({})
    expect(result).toContain('communications')
  })

  it('reports moderate strength for 3-4 items', async () => {
    const tool = createReviewEvidenceTool({ evidenceCount: 4, disputeType: 'debt_defense' })
    const result = await tool.invoke({})
    expect(result).toContain('moderate')
  })
```

**Step 2: Run tests**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npx vitest run src/lib/ai/agent/tools/__tests__/review-evidence.test.ts 2>&1 | tail -10
```
Expected: 6/6 passing.

**Step 3: Commit**

```bash
cd "/Users/minwang/lawyer free" && git add apps/web/src/lib/ai/agent/tools/__tests__/review-evidence.test.ts && git commit -m "test: add edge cases for review_evidence tool"
```

---

## Task 4: Expand unit tests — edge cases for search_case_law

**Files:**
- Modify: `apps/web/src/lib/ai/agent/tools/__tests__/search-case-law.test.ts`

**Step 1: Add edge case test for missing metadata**

Append to the existing test file (note: the mock is already defined at the top — add a new `it` block using `mockInvoke.mockResolvedValueOnce`):

```typescript
  it('handles docs with missing metadata gracefully', async () => {
    mockInvoke.mockResolvedValueOnce([
      { pageContent: 'Some relevant legal text', metadata: {} },
    ])
    const tool = createSearchCaseLawTool({ disputeType: 'landlord_tenant', supabaseClient: {} as any })
    const result = await tool.invoke({ query: 'eviction notice' })
    expect(result).toContain('Unknown case')
    expect(result).toContain('Some relevant legal text')
  })
```

**Step 2: Run tests**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npx vitest run src/lib/ai/agent/tools/__tests__/search-case-law.test.ts 2>&1 | tail -10
```
Expected: 5/5 passing.

**Step 3: Commit**

```bash
cd "/Users/minwang/lawyer free" && git add apps/web/src/lib/ai/agent/tools/__tests__/search-case-law.test.ts && git commit -m "test: add missing-metadata edge case for search_case_law"
```

---

## Task 5: Integration test setup (seed + teardown)

**Files:**
- Create: `apps/web/src/lib/ai/agent/integration/setup.ts`
- Create: `apps/web/src/lib/ai/agent/integration/test-helpers.ts`

**Step 1: Create setup.ts**

```typescript
// apps/web/src/lib/ai/agent/integration/setup.ts
// Global setup — validates required env vars before any integration test runs
if (!process.env.SUPABASE_TEST_URL) {
  throw new Error('SUPABASE_TEST_URL is required for integration tests. Set it in .env.test.local')
}
if (!process.env.SUPABASE_TEST_SERVICE_KEY) {
  throw new Error('SUPABASE_TEST_SERVICE_KEY is required for integration tests.')
}
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is required for integration tests.')
}
```

**Step 2: Create test-helpers.ts**

```typescript
// apps/web/src/lib/ai/agent/integration/test-helpers.ts
import { createClient } from '@supabase/supabase-js'

export function getTestSupabase() {
  return createClient(
    process.env.SUPABASE_TEST_URL!,
    process.env.SUPABASE_TEST_SERVICE_KEY!
  )
}

export interface SeededCase {
  caseId: string
  userId: string
  cleanup: () => Promise<void>
}

export async function seedTestCase(): Promise<SeededCase> {
  const supabase = getTestSupabase()

  // Create a test user (service role bypasses auth)
  const userId = crypto.randomUUID()
  const caseId = crypto.randomUUID()
  const now = new Date()

  // Insert case
  await supabase.from('cases').insert({
    id: caseId,
    user_id: userId,
    dispute_type: 'landlord_tenant',
    role: 'plaintiff',
    county: 'Travis',
    status: 'active',
    title: 'Test Landlord-Tenant Case',
  })

  // Insert deadlines — 2 overdue + 1 urgent + 1 upcoming
  await supabase.from('deadlines').insert([
    {
      case_id: caseId,
      key: 'serve_defendant',
      label: 'Serve defendant',
      due_at: new Date(now.getTime() - 3 * 86400000).toISOString(), // 3 days ago
    },
    {
      case_id: caseId,
      key: 'file_answer',
      label: 'File answer with court',
      due_at: new Date(now.getTime() - 86400000).toISOString(), // yesterday
    },
    {
      case_id: caseId,
      key: 'discovery_request',
      label: 'Send discovery requests',
      due_at: new Date(now.getTime() + 3 * 86400000).toISOString(), // 3 days from now
    },
    {
      case_id: caseId,
      key: 'discovery_close',
      label: 'Close discovery',
      due_at: new Date(now.getTime() + 30 * 86400000).toISOString(), // 30 days out
    },
  ])

  // Insert evidence items
  await supabase.from('evidence_items').insert([
    { case_id: caseId, user_id: userId, name: 'Lease agreement.pdf', category: 'contract' },
    { case_id: caseId, user_id: userId, name: 'Move-in photos.zip', category: 'photos' },
    { case_id: caseId, user_id: userId, name: 'Text messages.pdf', category: 'communications' },
  ])

  // Insert tasks
  await supabase.from('tasks').insert([
    { case_id: caseId, task_key: 'pi_intake', title: 'Complete intake', status: 'completed' },
    { case_id: caseId, task_key: 'send_demand', title: 'Send demand letter', status: 'todo' },
    { case_id: caseId, task_key: 'file_complaint', title: 'File complaint', status: 'todo' },
    { case_id: caseId, task_key: 'discovery_starter_pack', title: 'Discovery starter pack', status: 'locked' },
    { case_id: caseId, task_key: 'hearing_prep', title: 'Prepare for hearing', status: 'locked' },
  ])

  const cleanup = async () => {
    // Delete in reverse FK order
    await supabase.from('tasks').delete().eq('case_id', caseId)
    await supabase.from('evidence_items').delete().eq('case_id', caseId)
    await supabase.from('deadlines').delete().eq('case_id', caseId)
    await supabase.from('cases').delete().eq('id', caseId)
  }

  return { caseId, userId, cleanup }
}
```

**Step 3: Verify TypeScript**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npx tsc --noEmit 2>&1 | grep "integration/" | head -10
```
Expected: no errors.

**Step 4: Commit**

```bash
cd "/Users/minwang/lawyer free" && git add apps/web/src/lib/ai/agent/integration/ && git commit -m "test: add integration test setup and seed helpers"
```

---

## Task 6: Integration tests — 5 golden scenarios

**Files:**
- Create: `apps/web/src/lib/ai/agent/integration/agent-flow.test.ts`

**Step 1: Create test file**

```typescript
// apps/web/src/lib/ai/agent/integration/agent-flow.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { HumanMessage } from '@langchain/core/messages'
import { buildAgentGraph } from '../graph'
import { createInitialState } from '../state'
import { seedTestCase, getTestSupabase, type SeededCase } from './test-helpers'

let seeded: SeededCase

beforeEach(async () => {
  seeded = await seedTestCase()
})

afterEach(async () => {
  await seeded.cleanup()
})

async function runAgent(question: string): Promise<{
  toolsCalled: string[]
  finalContent: string
}> {
  const supabase = getTestSupabase()

  const saveDraft = async (p: { caseId: string; documentType: string; content: string }) => {
    const { data } = await supabase
      .from('draft_versions')
      .insert({ case_id: p.caseId, content: p.content, source: 'agent' })
      .select('id')
      .single()
    return data?.id ?? 'test-draft-id'
  }

  const graph = buildAgentGraph({ supabaseClient: supabase, saveDraft })

  const state = createInitialState({
    caseId: seeded.caseId,
    disputeType: 'landlord_tenant',
    role: 'plaintiff',
    county: 'Travis',
    healthScore: 60,
    tasks: [
      { task_key: 'send_demand', title: 'Send demand letter', status: 'todo' },
      { task_key: 'file_complaint', title: 'File complaint', status: 'todo' },
    ],
    deadlines: [
      { key: 'serve_defendant', due_at: new Date(Date.now() - 3 * 86400000).toISOString(), label: 'Serve defendant' },
      { key: 'file_answer', due_at: new Date(Date.now() - 86400000).toISOString(), label: 'File answer' },
      { key: 'discovery_request', due_at: new Date(Date.now() + 3 * 86400000).toISOString(), label: 'Send discovery' },
    ],
    evidenceCount: 3,
  })

  state.messages = [new HumanMessage(question)]

  const toolsCalled: string[] = []
  let finalContent = ''

  const stream = await graph.stream(state, { streamMode: 'messages' })
  for await (const [msg] of stream) {
    const m = msg as any
    if (m?.tool_calls?.length) {
      toolsCalled.push(...m.tool_calls.map((c: any) => c.name))
    }
    if (m?.content && typeof m.content === 'string' && !m?.tool_calls?.length) {
      finalContent = m.content
    }
  }

  return { toolsCalled, finalContent }
}

describe('Agent integration — golden scenarios', () => {
  it('deadline-urgency: routes to analyze_deadlines', async () => {
    const { toolsCalled, finalContent } = await runAgent(
      "What deadlines am I at risk of missing?"
    )
    expect(toolsCalled).toContain('analyze_deadlines')
    expect(finalContent.toLowerCase()).toMatch(/overdue|urgent|deadline|behind/)
  })

  it('evidence-gap: routes to review_evidence', async () => {
    const { toolsCalled, finalContent } = await runAgent(
      "How strong is my case?"
    )
    expect(toolsCalled).toContain('review_evidence')
    expect(finalContent.toLowerCase()).toMatch(/evidence|strong|moderate|thin/)
  })

  it('case-law-lookup: routes to search_case_law', async () => {
    const { toolsCalled, finalContent } = await runAgent(
      "What does Texas law say about security deposits?"
    )
    expect(toolsCalled).toContain('search_case_law')
    // Response should contain some legal content
    expect(finalContent.length).toBeGreaterThan(50)
  })

  it('document-draft: routes to draft_document', async () => {
    const { toolsCalled, finalContent } = await runAgent(
      "Draft a demand letter for my landlord to return my $800 deposit"
    )
    expect(toolsCalled).toContain('draft_document')
    expect(finalContent.toLowerCase()).toMatch(/demand|letter|draft|deposit/)
  })

  it('multi-tool: calls at least 2 tools for strategy question', async () => {
    const { toolsCalled, finalContent } = await runAgent(
      "What's my strongest argument and what should I do first?"
    )
    const uniqueTools = new Set(toolsCalled)
    expect(uniqueTools.size).toBeGreaterThanOrEqual(2)
    expect(finalContent.length).toBeGreaterThan(50)
  })
})
```

**Step 2: Verify TypeScript**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npx tsc --noEmit 2>&1 | grep "agent-flow" | head -10
```
Expected: no errors.

**Step 3: Commit (do NOT run the tests yet — requires live env vars)**

```bash
cd "/Users/minwang/lawyer free" && git add apps/web/src/lib/ai/agent/integration/agent-flow.test.ts && git commit -m "test: add 5-scenario live integration test suite"
```

---

## Task 7: Eval dataset

**Files:**
- Create: `apps/web/src/lib/ai/agent/evals/dataset.ts`

**Step 1: Create the golden dataset**

```typescript
// apps/web/src/lib/ai/agent/evals/dataset.ts

export interface EvalCase {
  id: string
  category: 'deadline_urgency' | 'evidence_strength' | 'legal_research' | 'document_drafting'
  question: string
  rubric: string
  passMark: number // minimum score out of 2 to pass
}

export const EVAL_DATASET: EvalCase[] = [
  // --- DEADLINE URGENCY (5 cases) ---
  {
    id: 'du-01',
    category: 'deadline_urgency',
    question: 'Am I behind on anything?',
    rubric: 'Score 2 if response identifies overdue items specifically. Score 1 if it mentions deadlines exist but is vague. Score 0 if it does not address timing at all.',
    passMark: 1,
  },
  {
    id: 'du-02',
    category: 'deadline_urgency',
    question: 'What should I do today to stay on track with my case?',
    rubric: 'Score 2 if response gives specific, prioritized actions tied to deadlines. Score 1 if it gives generic advice. Score 0 if it gives no actionable guidance.',
    passMark: 1,
  },
  {
    id: 'du-03',
    category: 'deadline_urgency',
    question: 'How many days do I have left to serve the defendant?',
    rubric: 'Score 2 if response checks deadlines and gives a specific answer about the serve deadline. Score 1 if it analyzes deadlines but is unclear. Score 0 if it does not use the analyze_deadlines tool.',
    passMark: 1,
  },
  {
    id: 'du-04',
    category: 'deadline_urgency',
    question: 'Are any of my deadlines coming up soon?',
    rubric: 'Score 2 if response identifies urgent deadlines (within 7 days) by name. Score 1 if it mentions urgency without specifics. Score 0 if it ignores deadlines.',
    passMark: 1,
  },
  {
    id: 'du-05',
    category: 'deadline_urgency',
    question: 'What happens if I miss a filing deadline?',
    rubric: 'Score 2 if response explains consequences AND checks current deadline status. Score 1 if it explains consequences but ignores current case state. Score 0 if completely off-topic.',
    passMark: 1,
  },

  // --- EVIDENCE STRENGTH (5 cases) ---
  {
    id: 'es-01',
    category: 'evidence_strength',
    question: 'Do I have enough evidence to win my case?',
    rubric: 'Score 2 if response gives a strength assessment (thin/moderate/strong) AND identifies specific gaps. Score 1 if it gives generic evidence advice without assessing the actual count. Score 0 if it does not use the review_evidence tool.',
    passMark: 1,
  },
  {
    id: 'es-02',
    category: 'evidence_strength',
    question: 'What documents should I gather for my landlord-tenant case?',
    rubric: 'Score 2 if response lists dispute-specific documents (lease, photos, receipts, etc.). Score 1 if it gives generic document advice. Score 0 if it gives no specific guidance.',
    passMark: 1,
  },
  {
    id: 'es-03',
    category: 'evidence_strength',
    question: 'How strong is my case right now?',
    rubric: 'Score 2 if response uses the evidence tool and gives a clear strength label with reasoning. Score 1 if it gives a vague answer. Score 0 if it makes up an answer without checking evidence.',
    passMark: 1,
  },
  {
    id: 'es-04',
    category: 'evidence_strength',
    question: 'What evidence am I missing?',
    rubric: 'Score 2 if response identifies specific missing evidence types for landlord-tenant cases. Score 1 if it gives general advice. Score 0 if it does not engage with the evidence question.',
    passMark: 1,
  },
  {
    id: 'es-05',
    category: 'evidence_strength',
    question: 'Should I take more photos before my hearing?',
    rubric: 'Score 2 if it reviews evidence, assesses current state, and gives specific photo advice. Score 1 if it gives generic photo advice. Score 0 if it ignores the evidence context.',
    passMark: 1,
  },

  // --- LEGAL RESEARCH (5 cases) ---
  {
    id: 'lr-01',
    category: 'legal_research',
    question: 'What does Texas law say about security deposit returns?',
    rubric: 'Score 2 if response includes a specific citation AND explains the rule (30-day return window, etc.). Score 1 if it explains the rule without a citation. Score 0 if it gives no legal information.',
    passMark: 1,
  },
  {
    id: 'lr-02',
    category: 'legal_research',
    question: 'What is the notice to vacate requirement in Texas?',
    rubric: 'Score 2 if response cites Texas Property Code or case law AND explains the notice requirement. Score 1 if it explains the rule without citation. Score 0 if it does not answer.',
    passMark: 1,
  },
  {
    id: 'lr-03',
    category: 'legal_research',
    question: 'Can my landlord keep my deposit for normal wear and tear?',
    rubric: 'Score 2 if response cites Texas law and clearly explains normal wear and tear standard. Score 1 if it explains the concept without legal grounding. Score 0 if incorrect or no answer.',
    passMark: 1,
  },
  {
    id: 'lr-04',
    category: 'legal_research',
    question: 'What are my rights if my landlord has not made repairs?',
    rubric: 'Score 2 if response cites Texas habitability law and explains repair-and-deduct or rent withholding rights. Score 1 if general advice only. Score 0 if no relevant legal information.',
    passMark: 1,
  },
  {
    id: 'lr-05',
    category: 'legal_research',
    question: 'Is there a case where a tenant won against a landlord for keeping the deposit?',
    rubric: 'Score 2 if response uses search_case_law and returns a relevant case with citation. Score 1 if it describes cases generally without citation. Score 0 if it makes up a citation.',
    passMark: 1,
  },

  // --- DOCUMENT DRAFTING (5 cases) ---
  {
    id: 'dd-01',
    category: 'document_drafting',
    question: 'Draft a demand letter asking my landlord to return my $800 security deposit.',
    rubric: 'Score 2 if the draft has a proper heading, states the legal basis, demands a specific amount, and has a signature line. Score 1 if it is a recognizable letter but missing key elements. Score 0 if not a letter.',
    passMark: 1,
  },
  {
    id: 'dd-02',
    category: 'document_drafting',
    question: 'Write a notice to my landlord about a leaking roof that has not been repaired.',
    rubric: 'Score 2 if it is a formal notice with date, specific repair description, deadline for repair, and legal reference. Score 1 if it is an informal request. Score 0 if it is not a written notice.',
    passMark: 1,
  },
  {
    id: 'dd-03',
    category: 'document_drafting',
    question: 'Help me draft a motion to compel my landlord to respond to discovery.',
    rubric: 'Score 2 if the draft has proper motion format (caption, introduction, legal standard, argument, relief requested). Score 1 if it is partially formatted. Score 0 if it is not a motion.',
    passMark: 1,
  },
  {
    id: 'dd-04',
    category: 'document_drafting',
    question: 'Can you write interrogatories for my landlord about the deposit deductions?',
    rubric: 'Score 2 if the draft contains numbered interrogatory questions specifically about deposit deductions. Score 1 if it provides generic interrogatory examples. Score 0 if no questions are provided.',
    passMark: 1,
  },
  {
    id: 'dd-05',
    category: 'document_drafting',
    question: 'Draft a response to the landlord\'s answer claiming I damaged the apartment.',
    rubric: 'Score 2 if the response is formatted as a legal document addressing specific claims with denials/admissions. Score 1 if it is a general rebuttal. Score 0 if not a legal document format.',
    passMark: 1,
  },
]
```

**Step 2: Commit**

```bash
cd "/Users/minwang/lawyer free" && git add apps/web/src/lib/ai/agent/evals/dataset.ts && git commit -m "test: add 20-case eval golden dataset"
```

---

## Task 8: Eval judge

**Files:**
- Create: `apps/web/src/lib/ai/agent/evals/judge.ts`

**Step 1: Create the LLM-as-judge**

```typescript
// apps/web/src/lib/ai/agent/evals/judge.ts
import OpenAI from 'openai'

export interface JudgeResult {
  score: number  // 0, 1, or 2
  reason: string
}

const JUDGE_SYSTEM_PROMPT = `You are evaluating the quality of an AI legal assistant's response for a pro se litigant in Texas.
Score the response 0, 1, or 2 based on the rubric provided.
Respond with JSON only: { "score": <number>, "reason": "<one sentence>" }`

export async function judgeResponse(
  question: string,
  agentResponse: string,
  rubric: string
): Promise<JudgeResult> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY is required')

  const openai = new OpenAI({ apiKey })

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: JUDGE_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Question asked: ${question}\n\nAgent response: ${agentResponse}\n\nRubric: ${rubric}`,
      },
    ],
  })

  const raw = response.choices[0]?.message?.content ?? '{}'
  try {
    const parsed = JSON.parse(raw) as { score?: number; reason?: string }
    return {
      score: typeof parsed.score === 'number' ? Math.min(2, Math.max(0, parsed.score)) : 0,
      reason: parsed.reason ?? 'No reason provided',
    }
  } catch {
    return { score: 0, reason: 'Judge returned unparseable response' }
  }
}
```

**Step 2: Commit**

```bash
cd "/Users/minwang/lawyer free" && git add apps/web/src/lib/ai/agent/evals/judge.ts && git commit -m "test: add GPT-4o LLM-as-judge for eval scoring"
```

---

## Task 9: Eval runner CLI

**Files:**
- Create: `apps/web/src/lib/ai/agent/evals/run-evals.ts`

**Step 1: Create the CLI runner**

```typescript
// apps/web/src/lib/ai/agent/evals/run-evals.ts
import { createClient } from '@supabase/supabase-js'
import { HumanMessage } from '@langchain/core/messages'
import { buildAgentGraph } from '../graph'
import { createInitialState } from '../state'
import { EVAL_DATASET, type EvalCase } from './dataset'
import { judgeResponse } from './judge'

// ---- Validate env vars ----
const requiredEnv = ['OPENAI_API_KEY', 'SUPABASE_TEST_URL', 'SUPABASE_TEST_SERVICE_KEY']
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`Missing required env var: ${key}`)
    process.exit(1)
  }
}

const PASS_THRESHOLD = 0.7  // 70% overall pass rate required
const FAKE_CASE_ID = 'eval-case-' + Date.now()

// Minimal fake seeded state for evals (no real DB inserts needed for most evals)
const EVAL_STATE_INPUT = {
  caseId: FAKE_CASE_ID,
  disputeType: 'landlord_tenant',
  role: 'plaintiff' as const,
  county: 'Travis',
  healthScore: 55,
  tasks: [
    { task_key: 'send_demand', title: 'Send demand letter', status: 'todo' },
    { task_key: 'file_complaint', title: 'File complaint', status: 'todo' },
  ],
  deadlines: [
    { key: 'serve_defendant', label: 'Serve defendant', due_at: new Date(Date.now() - 3 * 86400000).toISOString() },
    { key: 'discovery_request', label: 'Send discovery', due_at: new Date(Date.now() + 3 * 86400000).toISOString() },
  ],
  evidenceCount: 3,
}

interface EvalResult extends EvalCase {
  agentResponse: string
  judgeScore: number
  judgeReason: string
  passed: boolean
}

async function runSingleEval(evalCase: EvalCase, graph: any): Promise<EvalResult> {
  const state = createInitialState(EVAL_STATE_INPUT)
  state.messages = [new HumanMessage(evalCase.question)]

  let agentResponse = ''

  try {
    const stream = await graph.stream(state, { streamMode: 'messages' })
    for await (const [msg] of stream) {
      const m = msg as any
      if (m?.content && typeof m.content === 'string' && !m?.tool_calls?.length) {
        agentResponse = m.content
      }
    }
  } catch (err) {
    agentResponse = `[Agent error: ${err instanceof Error ? err.message : String(err)}]`
  }

  const { score, reason } = await judgeResponse(evalCase.question, agentResponse, evalCase.rubric)

  return {
    ...evalCase,
    agentResponse,
    judgeScore: score,
    judgeReason: reason,
    passed: score >= evalCase.passMark,
  }
}

async function main() {
  console.log('\n=== Running Agent Evals ===\n')

  const supabase = createClient(
    process.env.SUPABASE_TEST_URL!,
    process.env.SUPABASE_TEST_SERVICE_KEY!
  )

  const saveDraft = async () => 'eval-draft-id'
  const graph = buildAgentGraph({ supabaseClient: supabase, saveDraft })

  const results: EvalResult[] = []
  const categories = ['deadline_urgency', 'evidence_strength', 'legal_research', 'document_drafting'] as const

  for (const evalCase of EVAL_DATASET) {
    process.stdout.write(`  [${evalCase.id}] ${evalCase.question.slice(0, 50)}... `)
    const result = await runSingleEval(evalCase, graph)
    results.push(result)
    console.log(result.passed ? `✓ (${result.judgeScore}/2)` : `✗ (${result.judgeScore}/2) — ${result.judgeReason}`)
  }

  // ---- Print report ----
  console.log('\n=== Eval Results ===')

  let totalPassed = 0
  for (const category of categories) {
    const catResults = results.filter((r) => r.category === category)
    const catPassed = catResults.filter((r) => r.passed).length
    const avgScore = catResults.reduce((sum, r) => sum + r.judgeScore, 0) / catResults.length
    totalPassed += catPassed
    const label = catPassed === catResults.length ? '✓' : '✗'
    console.log(`  ${label} ${category.padEnd(20)}: ${catPassed}/${catResults.length} passed  (avg score: ${avgScore.toFixed(1)}/2)`)
  }

  const overallPct = totalPassed / results.length
  console.log(`\nOverall: ${totalPassed}/${results.length} (${Math.round(overallPct * 100)}%)`)

  if (overallPct >= PASS_THRESHOLD) {
    console.log(`✓ PASS — above ${PASS_THRESHOLD * 100}% threshold\n`)
    process.exit(0)
  } else {
    console.log(`✗ FAIL — below ${PASS_THRESHOLD * 100}% threshold\n`)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('Eval runner failed:', err)
  process.exit(1)
})
```

**Step 2: Check TypeScript**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npx tsc --noEmit 2>&1 | grep "run-evals\|judge\|dataset" | head -10
```
Expected: no errors.

**Step 3: Commit**

```bash
cd "/Users/minwang/lawyer free" && git add apps/web/src/lib/ai/agent/evals/run-evals.ts && git commit -m "test: add eval CLI runner with LLM-as-judge scoring"
```

---

## Task 10: Run the full test suite

This task validates everything works end-to-end. You need:

```
OPENAI_API_KEY=<your key>
SUPABASE_TEST_URL=<test project URL>
SUPABASE_TEST_SERVICE_KEY=<service role key>
```

Put these in `apps/web/.env.test.local` (already gitignored).

**Step 1: Run unit tests (no env vars needed)**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npm run test:unit 2>&1 | tail -15
```
Expected: 20+ tests passing.

**Step 2: Run integration tests (requires env vars)**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npm run test:integration 2>&1 | tail -20
```
Expected: 5/5 passing. Each test takes 10–30s (LLM latency).

**Step 3: Run evals (requires env vars)**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npm run eval 2>&1
```
Expected: score report printed. Pass if ≥70% (14/20).

**Step 4: Commit final result**

```bash
cd "/Users/minwang/lawyer free" && git add . && git commit -m "test: complete three-layer agent test suite"
```
