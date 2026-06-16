import { describe, expect, it, vi, beforeAll } from 'vitest'
import { buildAgentGraph } from '../graph'
import { createInitialState } from '../state'

beforeAll(() => {
  process.env.ANTHROPIC_API_KEY = 'test-key'
})

// Mock the Anthropic SDK so tests don't require a real API key
vi.mock('@anthropic-ai/sdk', () => {
  const mockStream = {
    async *[Symbol.asyncIterator]() {
      yield {
        type: 'content_block_start',
        index: 0,
        content_block: { type: 'text', text: '' },
      }
      yield {
        type: 'content_block_delta',
        index: 0,
        delta: { type: 'text_delta', text: 'I can help organize your next steps.' },
      }
      yield { type: 'content_block_stop', index: 0 }
      yield { type: 'message_stop' }
    },
    finalMessage: vi.fn().mockResolvedValue({
      id: 'msg_test',
      type: 'message',
      role: 'assistant',
      content: [{ type: 'text', text: 'I can help organize your next steps.' }],
      model: 'claude-sonnet-4-6',
      stop_reason: 'end_turn',
      stop_sequence: null,
      usage: { input_tokens: 10, output_tokens: 10 },
    }),
  }

  return {
    default: vi.fn().mockImplementation(function (this: { messages: unknown }) {
      this.messages = { stream: vi.fn().mockResolvedValue(mockStream) }
    }),
  }
})

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
      evidenceItems: [],
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
