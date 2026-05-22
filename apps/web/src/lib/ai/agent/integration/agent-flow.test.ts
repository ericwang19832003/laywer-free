import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { HumanMessage } from '@langchain/core/messages'
import type { BaseMessage } from '@langchain/core/messages'
import { buildAgentGraph } from '../graph'
import { createInitialState } from '../state'
import { seedTestCase, getTestSupabase } from './test-helpers'
import type { SeededCase } from './test-helpers'

// ---------------------------------------------------------------------------
// Shared fixture
// ---------------------------------------------------------------------------

let seeded: SeededCase

beforeEach(async () => {
  seeded = await seedTestCase()
})

afterEach(async () => {
  await seeded.cleanup()
})

// ---------------------------------------------------------------------------
// saveDraft stub — records last draft, returns a stable doc ID
// ---------------------------------------------------------------------------

let lastDraft: { caseId: string; documentType: string; content: string } | null = null

const saveDraft = async (params: {
  caseId: string
  documentType: string
  content: string
}): Promise<string> => {
  lastDraft = params
  return 'draft-id-stub'
}

// ---------------------------------------------------------------------------
// runAgent helper
// ---------------------------------------------------------------------------

async function runAgent(question: string): Promise<{
  toolsCalled: string[]
  finalContent: string
}> {
  const graph = buildAgentGraph({
    supabaseClient: getTestSupabase(),
    saveDraft,
  })

  const state = createInitialState({
    caseId: seeded.caseId,
    disputeType: 'landlord_tenant',
    role: 'plaintiff',
    county: 'Travis',
    healthScore: 55,
    tasks: [
      { task_key: 'pi_intake', title: 'Complete intake', status: 'completed' },
      { task_key: 'send_demand', title: 'Send demand letter', status: 'todo' },
      { task_key: 'file_complaint', title: 'File complaint', status: 'todo' },
    ],
    deadlines: [
      {
        key: 'serve_defendant',
        label: 'Serve defendant',
        due_at: new Date(Date.now() - 3 * 86_400_000).toISOString(),
      },
      {
        key: 'file_answer',
        label: 'File answer with court',
        due_at: new Date(Date.now() - 86_400_000).toISOString(),
      },
      {
        key: 'discovery_request',
        label: 'Send discovery requests',
        due_at: new Date(Date.now() + 3 * 86_400_000).toISOString(),
      },
    ],
    evidenceCount: 3,
  })

  // Attach the user question
  state.messages = [new HumanMessage(question)]

  const toolsCalled: string[] = []
  let finalContent = ''

  // stream() returns a Promise — must be awaited
  const stream = await graph.stream(state, { streamMode: 'messages' })

  for await (const chunk of stream) {
    // With streamMode: 'messages', each chunk is [BaseMessage, metadata]
    const [message] = chunk as [BaseMessage & { tool_calls?: Array<{ name: string }> }, Record<string, unknown>]

    if (message.tool_calls && message.tool_calls.length > 0) {
      for (const tc of message.tool_calls) {
        toolsCalled.push(tc.name)
      }
    } else if (typeof message.content === 'string' && message.content.length > 0) {
      finalContent = message.content
    }
  }

  return { toolsCalled, finalContent }
}

// ---------------------------------------------------------------------------
// 5 golden scenarios
// ---------------------------------------------------------------------------

describe('agent integration — golden scenarios', () => {
  it('deadline-urgency: flags overdue and urgent deadlines', async () => {
    const { toolsCalled, finalContent } = await runAgent(
      'What deadlines am I at risk of missing?'
    )

    expect(toolsCalled).toContain('analyze_deadlines')
    expect(finalContent).toMatch(/overdue|urgent|deadline|behind/i)
  }, 60_000)

  it('evidence-gap: assesses case strength from evidence', async () => {
    const { toolsCalled, finalContent } = await runAgent('How strong is my case?')

    expect(toolsCalled).toContain('review_evidence')
    expect(finalContent).toMatch(/evidence|strong|moderate|thin/i)
  }, 60_000)

  it('case-law-lookup: retrieves Texas security deposit law', async () => {
    const { toolsCalled, finalContent } = await runAgent(
      'What does Texas law say about security deposits?'
    )

    expect(toolsCalled).toContain('search_case_law')
    expect(finalContent.length).toBeGreaterThan(50)
  }, 60_000)

  it('document-draft: drafts a demand letter for deposit return', async () => {
    const { toolsCalled, finalContent } = await runAgent(
      'Draft a demand letter for my landlord to return my $800 deposit'
    )

    expect(toolsCalled).toContain('draft_document')
    expect(finalContent).toMatch(/demand|letter|draft|deposit/i)
  }, 60_000)

  it('multi-tool: invokes at least 2 tools for a compound question', async () => {
    const { toolsCalled, finalContent } = await runAgent(
      "What's my strongest argument and what should I do first?"
    )

    expect(new Set(toolsCalled).size).toBeGreaterThanOrEqual(2)
    expect(finalContent.length).toBeGreaterThan(50)
  }, 60_000)
})
