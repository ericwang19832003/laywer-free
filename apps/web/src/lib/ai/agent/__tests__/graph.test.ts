import { AIMessage, HumanMessage } from '@langchain/core/messages'
import { describe, expect, it, vi } from 'vitest'
import { buildAgentGraph } from '../graph'
import { createInitialState } from '../state'

vi.mock('@langchain/openai', () => ({
  ChatOpenAI: class {
    bindTools() {
      return {
        invoke: async () => new AIMessage('I can help organize your next steps.'),
      }
    }
  },
  OpenAIEmbeddings: class {},
}))

describe('buildAgentGraph', () => {
  it('compiles and routes a basic user message through the agent node', async () => {
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
    state.messages = [new HumanMessage('What should I organize first?')]

    const result = await graph.invoke(state)

    expect(result.messages.at(-1)?.content).toBe('I can help organize your next steps.')
    expect(result.toolCallCount).toBe(0)
  })
})
