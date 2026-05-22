# LangGraph Case Strategy Agent — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a stateful LangGraph.js ReAct agent to the case dashboard Tools tab that lets users ask open-ended strategy questions and get AI-grounded answers by reasoning across deadlines, evidence, case law, and task status.

**Architecture:** LangChain.js + LangGraph.js runs inside Next.js API routes (`/api/cases/[id]/agent`). A 4-tool ReAct agent streams SSE responses to the client. Agent threads are persisted per-case in a new `agent_threads` Supabase table. The existing CourtListener RAG pipeline is replaced with LangChain's `SupabaseVectorStore`.

**Tech Stack:** Next.js 16, LangGraph.js (`@langchain/langgraph`), LangChain.js (`@langchain/openai`, `@langchain/community`), Supabase, TypeScript, Vitest, Playwright

---

## Task 1: Install packages

**Files:**
- Modify: `apps/web/package.json`

**Step 1: Install LangChain packages**

```bash
cd apps/web
npm install @langchain/langgraph @langchain/openai @langchain/community langchain
```

**Step 2: Verify install**

```bash
node -e "require('@langchain/langgraph'); console.log('ok')"
```
Expected: `ok`

**Step 3: Commit**

```bash
git add apps/web/package.json apps/web/package-lock.json
git commit -m "chore: add langchain + langgraph dependencies"
```

---

## Task 2: Supabase migration — agent_threads table

**Files:**
- Create: `supabase/migrations/20260522000001_agent_threads.sql`

**Step 1: Write migration**

```sql
-- supabase/migrations/20260522000001_agent_threads.sql
create table agent_threads (
  id            uuid primary key default gen_random_uuid(),
  case_id       uuid not null references cases(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  thread_id     text not null,
  checkpoint    jsonb not null default '{}',
  updated_at    timestamptz not null default now(),
  unique (case_id, user_id)
);

alter table agent_threads enable row level security;

create policy "users can manage their own agent threads"
  on agent_threads
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index agent_threads_case_id_idx on agent_threads (case_id);
```

**Step 2: Apply migration locally**

```bash
supabase db reset
```
Expected: migration runs without error.

**Step 3: Commit**

```bash
git add supabase/migrations/20260522000001_agent_threads.sql
git commit -m "feat: add agent_threads table with RLS"
```

---

## Task 3: Agent state type

**Files:**
- Create: `apps/web/src/lib/ai/agent/state.ts`

**Step 1: Write failing test**

Create `apps/web/src/lib/ai/agent/__tests__/state.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { createInitialState } from '../state'

describe('createInitialState', () => {
  it('creates state with required fields', () => {
    const state = createInitialState({
      caseId: 'case-123',
      disputeType: 'landlord_tenant',
      role: 'plaintiff',
      county: 'Travis',
      healthScore: 72,
      tasks: [],
      deadlines: [],
      evidenceCount: 3,
    })

    expect(state.caseId).toBe('case-123')
    expect(state.messages).toEqual([])
    expect(state.toolCallCount).toBe(0)
    expect(state.caseContext.disputeType).toBe('landlord_tenant')
  })
})
```

**Step 2: Run test to verify it fails**

```bash
cd apps/web && npx vitest run src/lib/ai/agent/__tests__/state.test.ts
```
Expected: FAIL — `createInitialState` not defined.

**Step 3: Write implementation**

```typescript
// apps/web/src/lib/ai/agent/state.ts
import type { BaseMessage } from '@langchain/core/messages'

export interface CaseContext {
  disputeType: string
  role: 'plaintiff' | 'defendant'
  county: string
  healthScore: number
  tasks: Array<{ task_key: string; status: string; title: string }>
  deadlines: Array<{ key: string; due_at: string; label: string }>
  evidenceCount: number
}

export interface AgentState {
  messages: BaseMessage[]
  caseId: string
  caseContext: CaseContext
  toolCallCount: number
}

export interface InitialStateInput {
  caseId: string
  disputeType: string
  role: string
  county: string
  healthScore: number
  tasks: CaseContext['tasks']
  deadlines: CaseContext['deadlines']
  evidenceCount: number
}

export function createInitialState(input: InitialStateInput): AgentState {
  return {
    messages: [],
    caseId: input.caseId,
    toolCallCount: 0,
    caseContext: {
      disputeType: input.disputeType,
      role: input.role as 'plaintiff' | 'defendant',
      county: input.county,
      healthScore: input.healthScore,
      tasks: input.tasks,
      deadlines: input.deadlines,
      evidenceCount: input.evidenceCount,
    },
  }
}
```

**Step 4: Run test to verify it passes**

```bash
cd apps/web && npx vitest run src/lib/ai/agent/__tests__/state.test.ts
```
Expected: PASS

**Step 5: Commit**

```bash
git add apps/web/src/lib/ai/agent/state.ts apps/web/src/lib/ai/agent/__tests__/state.test.ts
git commit -m "feat: add AgentState type and createInitialState"
```

---

## Task 4: Replace CourtListener RAG with SupabaseVectorStore

**Files:**
- Create: `apps/web/src/lib/ai/agent/tools/search-case-law.ts`
- The old `src/lib/courtlistener/` files are **not deleted yet** — existing features still depend on them. This new tool is a clean parallel implementation.

**Step 1: Write failing test**

Create `apps/web/src/lib/ai/agent/tools/__tests__/search-case-law.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { createSearchCaseLawTool } from '../search-case-law'

vi.mock('@langchain/community/vectorstores/supabase', () => ({
  SupabaseVectorStore: vi.fn().mockImplementation(() => ({
    asRetriever: vi.fn().mockReturnValue({
      invoke: vi.fn().mockResolvedValue([
        {
          pageContent: 'Martinez v. Williams, 2019 TX App — landlord must return deposit within 30 days',
          metadata: { case_name: 'Martinez v. Williams', year: 2019, citation: '2019 TX App 1234' },
        },
      ]),
    }),
  })),
}))

describe('createSearchCaseLawTool', () => {
  it('returns a tool named search_case_law', () => {
    const tool = createSearchCaseLawTool({ disputeType: 'landlord_tenant', supabaseClient: {} as any })
    expect(tool.name).toBe('search_case_law')
  })

  it('returns formatted citations on invoke', async () => {
    const tool = createSearchCaseLawTool({ disputeType: 'landlord_tenant', supabaseClient: {} as any })
    const result = await tool.invoke('security deposit return')
    expect(result).toContain('Martinez v. Williams')
  })
})
```

**Step 2: Run test to verify it fails**

```bash
cd apps/web && npx vitest run src/lib/ai/agent/tools/__tests__/search-case-law.test.ts
```
Expected: FAIL

**Step 3: Write implementation**

```typescript
// apps/web/src/lib/ai/agent/tools/search-case-law.ts
import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase'
import { OpenAIEmbeddings } from '@langchain/openai'
import type { SupabaseClient } from '@supabase/supabase-js'

interface SearchCaseLawConfig {
  disputeType: string
  supabaseClient: SupabaseClient
}

export function createSearchCaseLawTool({ disputeType, supabaseClient }: SearchCaseLawConfig) {
  return tool(
    async (input: { query: string }) => {
      const vectorStore = new SupabaseVectorStore(
        new OpenAIEmbeddings({ model: 'text-embedding-3-large', dimensions: 3072 }),
        {
          client: supabaseClient,
          tableName: 'case_law_embeddings',
          queryName: 'match_case_law',
        }
      )

      const retriever = vectorStore.asRetriever({
        k: 3,
        filter: { dispute_type: disputeType },
      })

      const docs = await retriever.invoke(input.query)

      if (docs.length === 0) {
        return 'No relevant case law found for this query.'
      }

      return docs
        .map((doc, i) => {
          const { case_name, citation, year } = doc.metadata ?? {}
          const header = [case_name, citation, year].filter(Boolean).join(', ')
          return `[${i + 1}] ${header}\n${doc.pageContent}`
        })
        .join('\n\n')
    },
    {
      name: 'search_case_law',
      description:
        'Search relevant Texas case law and statutes. Use when the user asks about legal standards, what courts have ruled, or needs citations to support their position.',
      schema: z.object({
        query: z.string().describe('The legal question or topic to search for'),
      }),
    }
  )
}
```

**Step 4: Run test to verify it passes**

```bash
cd apps/web && npx vitest run src/lib/ai/agent/tools/__tests__/search-case-law.test.ts
```
Expected: PASS

**Step 5: Commit**

```bash
git add apps/web/src/lib/ai/agent/tools/search-case-law.ts apps/web/src/lib/ai/agent/tools/__tests__/search-case-law.test.ts
git commit -m "feat: add search_case_law LangChain tool with SupabaseVectorStore"
```

---

## Task 5: analyze_deadlines tool

**Files:**
- Create: `apps/web/src/lib/ai/agent/tools/analyze-deadlines.ts`

**Step 1: Write failing test**

Create `apps/web/src/lib/ai/agent/tools/__tests__/analyze-deadlines.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { createAnalyzeDeadlinesTool } from '../analyze-deadlines'

const mockDeadlines = [
  { key: 'serve_defendant', due_at: new Date(Date.now() - 86400000).toISOString(), label: 'Serve defendant' },
  { key: 'file_answer', due_at: new Date(Date.now() + 3 * 86400000).toISOString(), label: 'File answer' },
  { key: 'discovery_close', due_at: new Date(Date.now() + 30 * 86400000).toISOString(), label: 'Close discovery' },
]

describe('createAnalyzeDeadlinesTool', () => {
  it('flags overdue deadlines', async () => {
    const tool = createAnalyzeDeadlinesTool({ deadlines: mockDeadlines })
    const result = await tool.invoke({})
    expect(result).toContain('OVERDUE')
    expect(result).toContain('Serve defendant')
  })

  it('flags urgent deadlines within 7 days', async () => {
    const tool = createAnalyzeDeadlinesTool({ deadlines: mockDeadlines })
    const result = await tool.invoke({})
    expect(result).toContain('URGENT')
    expect(result).toContain('File answer')
  })
})
```

**Step 2: Run test to verify it fails**

```bash
cd apps/web && npx vitest run src/lib/ai/agent/tools/__tests__/analyze-deadlines.test.ts
```
Expected: FAIL

**Step 3: Write implementation**

```typescript
// apps/web/src/lib/ai/agent/tools/analyze-deadlines.ts
import { tool } from '@langchain/core/tools'
import { z } from 'zod'

interface Deadline {
  key: string
  due_at: string
  label: string
}

export function createAnalyzeDeadlinesTool({ deadlines }: { deadlines: Deadline[] }) {
  return tool(
    async (_input: Record<string, never>) => {
      if (deadlines.length === 0) return 'No deadlines found for this case.'

      const now = Date.now()
      const lines: string[] = []

      for (const d of deadlines) {
        const due = new Date(d.due_at).getTime()
        const daysUntil = Math.ceil((due - now) / 86400000)

        let status: string
        if (daysUntil < 0) status = `OVERDUE by ${Math.abs(daysUntil)} day(s)`
        else if (daysUntil <= 7) status = `URGENT — due in ${daysUntil} day(s)`
        else status = `due in ${daysUntil} day(s)`

        lines.push(`• ${d.label}: ${status} (${d.due_at.slice(0, 10)})`)
      }

      return lines.join('\n')
    },
    {
      name: 'analyze_deadlines',
      description:
        'Analyze the case deadlines to identify what is overdue or urgent. Use when the user asks about timing, what to do next, or whether they are behind.',
      schema: z.object({}),
    }
  )
}
```

**Step 4: Run test to verify it passes**

```bash
cd apps/web && npx vitest run src/lib/ai/agent/tools/__tests__/analyze-deadlines.test.ts
```
Expected: PASS

**Step 5: Commit**

```bash
git add apps/web/src/lib/ai/agent/tools/analyze-deadlines.ts apps/web/src/lib/ai/agent/tools/__tests__/analyze-deadlines.test.ts
git commit -m "feat: add analyze_deadlines LangChain tool"
```

---

## Task 6: review_evidence tool

**Files:**
- Create: `apps/web/src/lib/ai/agent/tools/review-evidence.ts`

**Step 1: Write failing test**

Create `apps/web/src/lib/ai/agent/tools/__tests__/review-evidence.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { createReviewEvidenceTool } from '../review-evidence'

describe('createReviewEvidenceTool', () => {
  it('reports strong case when evidence count is high', async () => {
    const tool = createReviewEvidenceTool({ evidenceCount: 8, disputeType: 'landlord_tenant' })
    const result = await tool.invoke({})
    expect(result).toContain('8 items')
    expect(result).toContain('strong')
  })

  it('flags weak evidence when count is low', async () => {
    const tool = createReviewEvidenceTool({ evidenceCount: 1, disputeType: 'landlord_tenant' })
    const result = await tool.invoke({})
    expect(result).toContain('thin')
  })
})
```

**Step 2: Run test to verify it fails**

```bash
cd apps/web && npx vitest run src/lib/ai/agent/tools/__tests__/review-evidence.test.ts
```
Expected: FAIL

**Step 3: Write implementation**

```typescript
// apps/web/src/lib/ai/agent/tools/review-evidence.ts
import { tool } from '@langchain/core/tools'
import { z } from 'zod'

interface ReviewEvidenceConfig {
  evidenceCount: number
  disputeType: string
}

const EVIDENCE_GUIDANCE: Record<string, string[]> = {
  landlord_tenant: ['Move-in/out photos', 'Written lease agreement', 'Payment receipts', 'Communication records', 'Repair request logs'],
  debt_defense: ['Original debt agreement', 'Payment history', 'Dispute letters', 'Creditor communications', 'Credit reports'],
  personal_injury: ['Medical records', 'Photos of injuries/scene', 'Witness statements', 'Police report', 'Medical bills'],
}

export function createReviewEvidenceTool({ evidenceCount, disputeType }: ReviewEvidenceConfig) {
  return tool(
    async (_input: Record<string, never>) => {
      const strength = evidenceCount >= 5 ? 'strong' : evidenceCount >= 3 ? 'moderate' : 'thin'
      const guidance = EVIDENCE_GUIDANCE[disputeType] ?? ['Document all relevant communications', 'Preserve all records']

      const lines = [
        `Evidence vault: ${evidenceCount} items uploaded — ${strength} foundation.`,
        '',
        'Recommended evidence for this dispute type:',
        ...guidance.map((g) => `• ${g}`),
      ]

      if (evidenceCount < 3) {
        lines.push('', 'Action needed: upload more supporting documents before your hearing.')
      }

      return lines.join('\n')
    },
    {
      name: 'review_evidence',
      description:
        'Review the evidence vault to assess case strength and identify gaps. Use when the user asks how strong their case is or what evidence they should gather.',
      schema: z.object({}),
    }
  )
}
```

**Step 4: Run test to verify it passes**

```bash
cd apps/web && npx vitest run src/lib/ai/agent/tools/__tests__/review-evidence.test.ts
```
Expected: PASS

**Step 5: Commit**

```bash
git add apps/web/src/lib/ai/agent/tools/review-evidence.ts apps/web/src/lib/ai/agent/tools/__tests__/review-evidence.test.ts
git commit -m "feat: add review_evidence LangChain tool"
```

---

## Task 7: draft_document tool

**Files:**
- Create: `apps/web/src/lib/ai/agent/tools/draft-document.ts`

**Step 1: Write failing test**

Create `apps/web/src/lib/ai/agent/tools/__tests__/draft-document.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { createDraftDocumentTool } from '../draft-document'

vi.mock('@langchain/openai', () => ({
  ChatOpenAI: vi.fn().mockImplementation(() => ({
    invoke: vi.fn().mockResolvedValue({ content: 'Dear [Defendant], I am writing to demand...' }),
  })),
}))

describe('createDraftDocumentTool', () => {
  it('returns draft content', async () => {
    const mockSave = vi.fn().mockResolvedValue('draft-uuid-123')
    const tool = createDraftDocumentTool({
      caseId: 'case-abc',
      disputeType: 'landlord_tenant',
      role: 'plaintiff',
      saveDraft: mockSave,
    })
    const result = await tool.invoke({ documentType: 'demand_letter', instructions: 'Request return of $800 deposit' })
    expect(result).toContain('demand_letter')
    expect(mockSave).toHaveBeenCalledOnce()
  })
})
```

**Step 2: Run test to verify it fails**

```bash
cd apps/web && npx vitest run src/lib/ai/agent/tools/__tests__/draft-document.test.ts
```
Expected: FAIL

**Step 3: Write implementation**

```typescript
// apps/web/src/lib/ai/agent/tools/draft-document.ts
import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import { ChatOpenAI } from '@langchain/openai'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'

interface DraftDocumentConfig {
  caseId: string
  disputeType: string
  role: string
  saveDraft: (params: { caseId: string; documentType: string; content: string }) => Promise<string>
}

const SYSTEM_PROMPT = `You are a Texas civil litigation expert drafting legal documents for pro se litigants.
Write clearly, professionally, and in plain English. Follow Texas procedural rules.
This is general legal information to help self-represented litigants — not a substitute for legal advice.`

export function createDraftDocumentTool({ caseId, disputeType, role, saveDraft }: DraftDocumentConfig) {
  return tool(
    async (input: { documentType: string; instructions: string }) => {
      const llm = new ChatOpenAI({ model: 'gpt-4o', temperature: 0.3 })

      const userPrompt = `Draft a ${input.documentType} for a ${role} in a ${disputeType} case in Texas.
Additional instructions: ${input.instructions}

Format the document professionally with proper headings and signature lines.`

      const response = await llm.invoke([
        new SystemMessage(SYSTEM_PROMPT),
        new HumanMessage(userPrompt),
      ])

      const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content)

      const draftId = await saveDraft({ caseId, documentType: input.documentType, content })

      return `Draft ${input.documentType} created and saved (id: ${draftId}).\n\n${content}`
    },
    {
      name: 'draft_document',
      description:
        'Draft a legal document such as a demand letter, motion, or discovery request. Saves to the case draft versions. Use when the user asks to generate or write a document.',
      schema: z.object({
        documentType: z
          .enum(['demand_letter', 'motion_to_compel', 'answer', 'discovery_request', 'notice'])
          .describe('The type of document to draft'),
        instructions: z.string().describe('Specific instructions, facts, or context for the document'),
      }),
    }
  )
}
```

**Step 4: Run test to verify it passes**

```bash
cd apps/web && npx vitest run src/lib/ai/agent/tools/__tests__/draft-document.test.ts
```
Expected: PASS

**Step 5: Commit**

```bash
git add apps/web/src/lib/ai/agent/tools/draft-document.ts apps/web/src/lib/ai/agent/tools/__tests__/draft-document.test.ts
git commit -m "feat: add draft_document LangChain tool with GPT-4o LCEL chain"
```

---

## Task 8: LangGraph state machine (graph.ts)

**Files:**
- Create: `apps/web/src/lib/ai/agent/graph.ts`

**Step 1: Write the graph**

```typescript
// apps/web/src/lib/ai/agent/graph.ts
import { StateGraph, END } from '@langchain/langgraph'
import { ChatOpenAI } from '@langchain/openai'
import { SystemMessage, HumanMessage } from '@langchain/core/messages'
import type { AgentState } from './state'
import { createSearchCaseLawTool } from './tools/search-case-law'
import { createAnalyzeDeadlinesTool } from './tools/analyze-deadlines'
import { createReviewEvidenceTool } from './tools/review-evidence'
import { createDraftDocumentTool } from './tools/draft-document'
import type { SupabaseClient } from '@supabase/supabase-js'

const MAX_TOOL_CALLS = 10

const SYSTEM_PROMPT = `You are a knowledgeable legal assistant helping a pro se litigant navigate Texas civil court.
You have access to tools to search case law, analyze deadlines, review evidence, and draft documents.
Always ground your advice in the user's specific case context. Be warm, clear, and encouraging.
Scope all advice to Texas civil procedure. For high-stakes decisions, recommend consulting a licensed attorney.
This is general legal information — not legal advice.`

interface BuildGraphConfig {
  supabaseClient: SupabaseClient
  saveDraft: (params: { caseId: string; documentType: string; content: string }) => Promise<string>
}

export function buildAgentGraph(config: BuildGraphConfig) {
  const graph = new StateGraph<AgentState>({
    channels: {
      messages: { reducer: (a, b) => [...a, ...b] },
      caseId: { reducer: (_, b) => b },
      caseContext: { reducer: (_, b) => b },
      toolCallCount: { reducer: (_, b) => b },
    },
  })

  graph.addNode('agent', async (state: AgentState) => {
    if (state.toolCallCount >= MAX_TOOL_CALLS) {
      return {
        messages: [{ role: 'assistant', content: 'I have reached the maximum number of tool calls for this turn.' }],
        toolCallCount: state.toolCallCount,
      }
    }

    const tools = [
      createSearchCaseLawTool({ disputeType: state.caseContext.disputeType, supabaseClient: config.supabaseClient }),
      createAnalyzeDeadlinesTool({ deadlines: state.caseContext.deadlines }),
      createReviewEvidenceTool({ evidenceCount: state.caseContext.evidenceCount, disputeType: state.caseContext.disputeType }),
      createDraftDocumentTool({ caseId: state.caseId, disputeType: state.caseContext.disputeType, role: state.caseContext.role, saveDraft: config.saveDraft }),
    ]

    const llm = new ChatOpenAI({ model: 'gpt-4o-mini', temperature: 0.5 }).bindTools(tools)

    const contextSummary = `Case context: ${state.caseContext.disputeType} case, ${state.caseContext.role} in ${state.caseContext.county} County.
Health score: ${state.caseContext.healthScore}/100. Evidence items: ${state.caseContext.evidenceCount}.
Tasks: ${state.caseContext.tasks.map((t) => `${t.title} (${t.status})`).join(', ')}.`

    const response = await llm.invoke([
      new SystemMessage(`${SYSTEM_PROMPT}\n\n${contextSummary}`),
      ...state.messages,
    ])

    return {
      messages: [response],
      toolCallCount: state.toolCallCount + 1,
    }
  })

  graph.addNode('tools', async (state: AgentState) => {
    const lastMessage = state.messages[state.messages.length - 1]
    // @ts-expect-error tool_calls is on AIMessage
    const toolCalls = lastMessage?.tool_calls ?? []
    const results = []

    const tools = [
      createSearchCaseLawTool({ disputeType: state.caseContext.disputeType, supabaseClient: config.supabaseClient }),
      createAnalyzeDeadlinesTool({ deadlines: state.caseContext.deadlines }),
      createReviewEvidenceTool({ evidenceCount: state.caseContext.evidenceCount, disputeType: state.caseContext.disputeType }),
      createDraftDocumentTool({ caseId: state.caseId, disputeType: state.caseContext.disputeType, role: state.caseContext.role, saveDraft: config.saveDraft }),
    ]

    const toolMap = Object.fromEntries(tools.map((t) => [t.name, t]))

    for (const call of toolCalls) {
      const t = toolMap[call.name]
      if (!t) continue
      const result = await t.invoke(call.args)
      results.push({ role: 'tool', tool_call_id: call.id, content: result })
    }

    return { messages: results, toolCallCount: state.toolCallCount }
  })

  graph.setEntryPoint('agent')

  graph.addConditionalEdges('agent', (state: AgentState) => {
    const last = state.messages[state.messages.length - 1]
    // @ts-expect-error tool_calls is on AIMessage
    const hasCalls = (last?.tool_calls?.length ?? 0) > 0
    if (hasCalls && state.toolCallCount < MAX_TOOL_CALLS) return 'tools'
    return END
  })

  graph.addEdge('tools', 'agent')

  return graph.compile()
}
```

**Step 2: Commit**

```bash
git add apps/web/src/lib/ai/agent/graph.ts
git commit -m "feat: add LangGraph ReAct agent state machine"
```

---

## Task 9: Supabase checkpointer

**Files:**
- Create: `apps/web/src/lib/ai/agent/checkpointer.ts`

**Step 1: Write implementation**

```typescript
// apps/web/src/lib/ai/agent/checkpointer.ts
import type { SupabaseClient } from '@supabase/supabase-js'

export interface CheckpointData {
  messages: unknown[]
  toolCallCount: number
}

export async function loadCheckpoint(
  supabase: SupabaseClient,
  caseId: string,
  userId: string
): Promise<CheckpointData | null> {
  const { data } = await supabase
    .from('agent_threads')
    .select('checkpoint')
    .eq('case_id', caseId)
    .eq('user_id', userId)
    .maybeSingle()

  return (data?.checkpoint as CheckpointData) ?? null
}

export async function saveCheckpoint(
  supabase: SupabaseClient,
  caseId: string,
  userId: string,
  checkpoint: CheckpointData
): Promise<void> {
  await supabase.from('agent_threads').upsert(
    {
      case_id: caseId,
      user_id: userId,
      thread_id: `${caseId}:${userId}`,
      checkpoint,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'case_id,user_id' }
  )
}
```

**Step 2: Commit**

```bash
git add apps/web/src/lib/ai/agent/checkpointer.ts
git commit -m "feat: add Supabase-backed LangGraph checkpointer"
```

---

## Task 10: Streaming API route

**Files:**
- Create: `apps/web/src/app/api/cases/[id]/agent/route.ts`

**Step 1: Write implementation**

```typescript
// apps/web/src/app/api/cases/[id]/agent/route.ts
import { NextRequest } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { buildAgentGraph } from '@/lib/ai/agent/graph'
import { createInitialState } from '@/lib/ai/agent/state'
import { loadCheckpoint, saveCheckpoint } from '@/lib/ai/agent/checkpointer'
import { HumanMessage } from '@langchain/core/messages'

const TIMEOUT_MS = 60_000

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: caseId } = await params
  const auth = await getAuthenticatedClient()
  if (!auth.ok) return auth.error
  const { supabase, user } = auth

  const { message } = await request.json()
  if (!message || typeof message !== 'string') {
    return new Response(JSON.stringify({ error: 'message is required' }), { status: 400 })
  }

  // Load case context
  const [caseResult, tasksResult, deadlinesResult, evidenceResult] = await Promise.all([
    supabase.from('cases').select('dispute_type, role, county, id').eq('id', caseId).single(),
    supabase.from('tasks').select('task_key, title, status').eq('case_id', caseId).limit(20),
    supabase.from('deadlines').select('key, due_at, label').eq('case_id', caseId).order('due_at'),
    supabase.from('evidence_items').select('id', { count: 'exact', head: true }).eq('case_id', caseId),
  ])

  if (caseResult.error || !caseResult.data) {
    return new Response(JSON.stringify({ error: 'Case not found' }), { status: 404 })
  }

  const { dispute_type, role, county } = caseResult.data

  const existingCheckpoint = await loadCheckpoint(supabase, caseId, user.id)

  const saveDraft = async (p: { caseId: string; documentType: string; content: string }) => {
    const { data } = await supabase
      .from('draft_versions')
      .insert({ case_id: p.caseId, document_type: p.documentType, content: p.content, source: 'agent' })
      .select('id')
      .single()
    return data?.id ?? 'unknown'
  }

  const graph = buildAgentGraph({ supabaseClient: supabase, saveDraft })

  const state = createInitialState({
    caseId,
    disputeType: dispute_type ?? 'general',
    role: role ?? 'plaintiff',
    county: county ?? 'Unknown',
    healthScore: 0,
    tasks: tasksResult.data ?? [],
    deadlines: deadlinesResult.data ?? [],
    evidenceCount: evidenceResult.count ?? 0,
  })

  if (existingCheckpoint?.messages) {
    state.messages = existingCheckpoint.messages as typeof state.messages
  }

  state.messages.push(new HumanMessage(message))

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const timeout = setTimeout(() => {
        controller.enqueue(encoder.encode('data: {"type":"error","content":"Request timed out"}\n\n'))
        controller.close()
      }, TIMEOUT_MS)

      try {
        const eventStream = await graph.stream(state, { streamMode: 'updates' })

        for await (const update of eventStream) {
          if (update.agent) {
            const lastMsg = update.agent.messages?.[update.agent.messages.length - 1]
            // @ts-expect-error tool_calls on AIMessage
            if (lastMsg?.tool_calls?.length) {
              for (const call of lastMsg.tool_calls) {
                const evt = JSON.stringify({ type: 'tool_start', tool: call.name })
                controller.enqueue(encoder.encode(`data: ${evt}\n\n`))
              }
            } else if (lastMsg?.content) {
              const evt = JSON.stringify({ type: 'token', content: lastMsg.content })
              controller.enqueue(encoder.encode(`data: ${evt}\n\n`))
            }
          }
          if (update.tools) {
            const evt = JSON.stringify({ type: 'tool_end' })
            controller.enqueue(encoder.encode(`data: ${evt}\n\n`))
          }
        }

        // Persist thread
        const finalState = await graph.getState({ configurable: { thread_id: `${caseId}:${user.id}` } })
        await saveCheckpoint(supabase, caseId, user.id, {
          messages: finalState.values.messages ?? [],
          toolCallCount: 0,
        })

        controller.enqueue(encoder.encode('data: {"type":"done"}\n\n'))
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', content: msg })}\n\n`))
      } finally {
        clearTimeout(timeout)
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
```

**Step 2: Commit**

```bash
git add apps/web/src/app/api/cases/[id]/agent/route.ts
git commit -m "feat: add streaming SSE agent API route"
```

---

## Task 11: AI Strategy Advisor UI card

**Files:**
- Create: `apps/web/src/components/dashboard/agent-advisor-card.tsx`
- Modify: `apps/web/src/app/(authenticated)/case/[id]/tools-tab.tsx`

**Step 1: Write the card component**

```typescript
// apps/web/src/components/dashboard/agent-advisor-card.tsx
'use client'

import { useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface AgentAdvisorCardProps {
  caseId: string
  isPro: boolean
}

const SUGGESTIONS = [
  "What's my strongest argument?",
  "What deadlines am I at risk of missing?",
  "How strong is my evidence?",
  "Draft a demand letter",
]

export function AgentAdvisorCard({ caseId, isPro }: AgentAdvisorCardProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [toolStatus, setToolStatus] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const TOOL_LABELS: Record<string, string> = {
    search_case_law: 'Searching case law...',
    analyze_deadlines: 'Reviewing your deadlines...',
    review_evidence: 'Reviewing your evidence...',
    draft_document: 'Drafting document...',
  }

  async function send(text: string) {
    if (!text.trim() || loading) return
    setInput('')
    setMessages((m) => [...m, { role: 'user', content: text }])
    setLoading(true)
    setToolStatus(null)

    let assistantContent = ''
    setMessages((m) => [...m, { role: 'assistant', content: '' }])

    try {
      const res = await fetch(`/api/cases/${caseId}/agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const lines = decoder.decode(value).split('\n')
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const evt = JSON.parse(line.slice(6))

          if (evt.type === 'tool_start') setToolStatus(TOOL_LABELS[evt.tool] ?? 'Thinking...')
          if (evt.type === 'tool_end') setToolStatus(null)
          if (evt.type === 'token') {
            assistantContent += evt.content
            setMessages((m) => [
              ...m.slice(0, -1),
              { role: 'assistant', content: assistantContent },
            ])
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
          }
          if (evt.type === 'done') setToolStatus(null)
        }
      }
    } catch {
      setMessages((m) => [
        ...m.slice(0, -1),
        { role: 'assistant', content: 'Something went wrong. Please try again.' },
      ])
    } finally {
      setLoading(false)
      setToolStatus(null)
    }
  }

  if (!isPro) {
    return (
      <Card>
        <CardContent className="pt-5 pb-4 px-5">
          <h3 className="text-sm font-semibold text-warm-text mb-1">AI Strategy Advisor</h3>
          <p className="text-xs text-warm-text/60 mb-3">Ask open-ended strategy questions about your case.</p>
          <Button size="sm" variant="outline">Upgrade to Pro</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-5 pb-4 px-5">
        <h3 className="text-sm font-semibold text-warm-text mb-1">AI Strategy Advisor</h3>
        <p className="text-xs text-warm-text/60 mb-3">
          This provides general legal information — not legal advice.
        </p>

        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-xs px-3 py-1.5 rounded-full border border-calm-green/40 text-calm-green hover:bg-calm-green/10 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.length > 0 && (
          <div className="space-y-3 max-h-80 overflow-y-auto mb-3 text-sm">
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'text-warm-text font-medium' : 'text-warm-text/80'}>
                {m.role === 'user' ? <span className="text-xs text-warm-text/40 mr-1">You</span> : null}
                <span className="whitespace-pre-wrap">{m.content}</span>
              </div>
            ))}
            {toolStatus && (
              <p className="text-xs text-calm-indigo animate-pulse">{toolStatus}</p>
            )}
            <div ref={bottomRef} />
          </div>
        )}

        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send(input)}
            placeholder="Ask a strategy question..."
            className="flex-1 text-sm border border-warm-text/20 rounded-md px-3 py-1.5 bg-warm-bg outline-none focus:ring-1 focus:ring-calm-green/40"
            disabled={loading}
          />
          <Button size="sm" onClick={() => send(input)} disabled={loading || !input.trim()}>
            {loading ? '...' : 'Ask'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

**Step 2: Add card to tools-tab.tsx**

In `apps/web/src/app/(authenticated)/case/[id]/tools-tab.tsx`, add after the imports:

```typescript
import { AgentAdvisorCard } from '@/components/dashboard/agent-advisor-card'
```

And add the card at the top of the returned `<div className="space-y-6">`:

```typescript
<AgentAdvisorCard caseId={caseId} isPro={isPro} />
```

You'll need to pass `isPro` into `ToolsTab` — add it to the `ToolsTabProps` interface and pass it from the parent `page.tsx` via `StoreKitManager`-equivalent subscription check.

**Step 3: Commit**

```bash
git add apps/web/src/components/dashboard/agent-advisor-card.tsx
git add apps/web/src/app/(authenticated)/case/[id]/tools-tab.tsx
git commit -m "feat: add AI Strategy Advisor card to Tools tab"
```

---

## Task 12: End-to-end smoke test

**Files:**
- Create: `apps/web/e2e/agent-advisor.spec.ts`

**Step 1: Write E2E test**

```typescript
// apps/web/e2e/agent-advisor.spec.ts
import { test, expect } from '@playwright/test'
import { loginAsTestUser, createTestCase } from './helpers'

test('AI Strategy Advisor sends a message and streams a response', async ({ page }) => {
  await loginAsTestUser(page)
  const caseId = await createTestCase(page, 'landlord_tenant')

  await page.goto(`/case/${caseId}`)
  await page.click('[data-tab="tools"]')

  await expect(page.getByText('AI Strategy Advisor')).toBeVisible()

  await page.click('button:has-text("What\'s my strongest argument?")')

  await expect(page.getByText(/Searching case law|Reviewing/i)).toBeVisible({ timeout: 5000 })
  await expect(page.locator('.whitespace-pre-wrap').last()).not.toBeEmpty({ timeout: 30000 })
})
```

**Step 2: Run test**

```bash
cd apps/web && npx playwright test e2e/agent-advisor.spec.ts
```

**Step 3: Commit**

```bash
git add apps/web/e2e/agent-advisor.spec.ts
git commit -m "test: add E2E smoke test for AI Strategy Advisor"
```

---

## Done

All tasks complete. The LangGraph Case Strategy Agent is live in the Tools tab with:
- 4 tools (case law search, deadlines, evidence review, document drafting)
- Streaming SSE with inline tool progress
- Multi-turn persistence via Supabase `agent_threads`
- Pro gating with upgrade prompt
- Circuit breaker at 10 tool calls/turn
