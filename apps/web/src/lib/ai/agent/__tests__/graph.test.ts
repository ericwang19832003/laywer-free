import { describe, expect, it, vi } from 'vitest'
import { buildAgentGraph } from '../graph'
import { createInitialState } from '../state'

vi.mock('openai', () => ({
  default: class {
    chat = {
      completions: {
        create: vi.fn().mockReturnValue({
          async *[Symbol.asyncIterator]() {
            yield { choices: [{ delta: { content: 'I can help organize your next steps.' } }] }
            yield { choices: [{ delta: {} }] }
          },
        }),
      },
    }
    embeddings = { create: vi.fn() }
  },
}))

describe('buildAgentGraph', () => {
  it('streams token events from a basic user message', async () => {
    const graph = buildAgentGraph({
      supabaseClient: {} as never,
      saveDraft: async () => 'draft-id',
    })

    const state = createInitialState({
      caseId: 'case-123',
      disputeType: 'small_claims',
      role: 'plaintiff',
      county: 'Travis',
      healthScore: 50,
      tasks: [],
      deadlines: [],
      evidenceCount: 0,
    })
    state.messages = [{ role: 'user', content: 'What should I organize first?' }]

    const events = []
    for await (const event of graph.stream(state)) {
      events.push(event)
    }

    const tokens = events.filter((e) => e.type === 'token')
    expect(tokens.length).toBeGreaterThan(0)
    expect(events.at(-1)?.type).toBe('done')
  })
})
