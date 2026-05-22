import { Annotation, END, StateGraph } from '@langchain/langgraph'
import { ChatOpenAI } from '@langchain/openai'
import { BaseMessage, SystemMessage } from '@langchain/core/messages'
import type { CaseContext } from './state'
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
This is general legal information — not legal advice.

Tool grounding rules — follow strictly:
- For any question about deadlines, days remaining, filing status, or what is overdue: ALWAYS call analyze_deadlines. Never answer deadline questions from memory or context summary. This includes questions like "how many days do I have left to serve the defendant" — even if you think you know the general procedural answer, call the tool to get the actual case deadline.
- For any question about case strength, evidence quality, or what evidence to gather: ALWAYS call review_evidence. The health score shown in the context summary is a case management metric, NOT an evidence strength rating — it must not be used to answer strength questions. Call the tool.
- For any document drafting request (letter, motion, notice, interrogatories): call draft_document immediately using reasonable assumptions. Do not ask for more context before drafting — draft first, offer to refine after.`

// ---- State annotation (LangGraph v1.x Annotation API) ---- //

const AgentAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (a: BaseMessage[], b: BaseMessage | BaseMessage[]) => {
      if (Array.isArray(b)) return a.concat(b)
      return a.concat([b])
    },
    default: () => [],
  }),
  caseId: Annotation<string>({
    reducer: (_prev: string, next: string) => next,
    default: () => '',
  }),
  caseContext: Annotation<CaseContext>({
    reducer: (_prev: CaseContext, next: CaseContext) => next,
    default: () => ({
      disputeType: '',
      role: 'plaintiff' as const,
      county: '',
      healthScore: 0,
      tasks: [],
      deadlines: [],
      evidenceCount: 0,
    }),
  }),
  toolCallCount: Annotation<number>({
    reducer: (_prev: number, next: number) => next,
    default: () => 0,
  }),
})

type GraphState = typeof AgentAnnotation.State

// ---- Config types ---- //

export interface BuildGraphConfig {
  supabaseClient: SupabaseClient
  saveDraft: (params: { caseId: string; documentType: string; content: string }) => Promise<string>
}

// ---- Helper: build tool instances from current state ---- //

function buildTools(state: GraphState, config: BuildGraphConfig) {
  return [
    createSearchCaseLawTool({
      disputeType: state.caseContext.disputeType,
      supabaseClient: config.supabaseClient,
    }),
    createAnalyzeDeadlinesTool({ deadlines: state.caseContext.deadlines }),
    createReviewEvidenceTool({
      evidenceCount: state.caseContext.evidenceCount,
      disputeType: state.caseContext.disputeType,
    }),
    createDraftDocumentTool({
      caseId: state.caseId,
      disputeType: state.caseContext.disputeType,
      role: state.caseContext.role,
      saveDraft: config.saveDraft,
    }),
  ]
}

// ---- Graph factory ---- //

export function buildAgentGraph(config: BuildGraphConfig) {
  const graph = new StateGraph(AgentAnnotation)

  // ---- agent node ---- //
  graph.addNode('agent', async (state: GraphState) => {
    if (state.toolCallCount >= MAX_TOOL_CALLS) {
      return {
        messages: [
          new SystemMessage('I have reached the maximum number of tool calls for this turn.'),
        ],
        toolCallCount: state.toolCallCount,
      }
    }

    const tools = buildTools(state, config)
    const llm = new ChatOpenAI({ model: 'gpt-4o-mini', temperature: 0.5 }).bindTools(tools)

    const contextSummary =
      `Case context: ${state.caseContext.disputeType} case, ${state.caseContext.role} in ${state.caseContext.county} County.\n` +
      `Health score: ${state.caseContext.healthScore}/100. Evidence items: ${state.caseContext.evidenceCount}.\n` +
      `Tasks: ${state.caseContext.tasks.map((t) => `${t.title} (${t.status})`).join(', ')}.`

    const response = await llm.invoke([
      new SystemMessage(`${SYSTEM_PROMPT}\n\n${contextSummary}`),
      ...state.messages,
    ])

    const hasCalls = (response as any)?.tool_calls?.length > 0
    return {
      messages: [response],
      toolCallCount: hasCalls ? state.toolCallCount + 1 : state.toolCallCount,
    }
  })

  // ---- tools node ---- //
  graph.addNode('tools', async (state: GraphState) => {
    const lastMessage = state.messages[state.messages.length - 1] as BaseMessage & {
      tool_calls?: Array<{ id: string; name: string; args: Record<string, unknown> }>
    }
    const toolCalls = lastMessage?.tool_calls ?? []
    const results: Array<{ role: 'tool'; tool_call_id: string; content: string }> = []

    const tools = buildTools(state, config)
    const toolMap = Object.fromEntries(tools.map((t) => [t.name, t]))

    for (const call of toolCalls) {
      const t = toolMap[call.name]
      if (!t) {
        results.push({
          role: 'tool',
          tool_call_id: call.id,
          content: `Error: unknown tool "${call.name}"`,
        })
        continue
      }
      let content: string
      try {
        content = String(await t.invoke(call.args))
      } catch (err) {
        content = `Tool error: ${err instanceof Error ? err.message : String(err)}`
      }
      results.push({ role: 'tool', tool_call_id: call.id, content })
    }

    return { messages: results as unknown as BaseMessage[], toolCallCount: state.toolCallCount }
  })

  // ---- edges ---- //
  graph.setEntryPoint('agent')

  graph.addConditionalEdges('agent', (state: GraphState) => {
    const last = state.messages[state.messages.length - 1] as BaseMessage & {
      tool_calls?: unknown[]
    }
    const hasCalls = (last?.tool_calls?.length ?? 0) > 0
    if (hasCalls && state.toolCallCount < MAX_TOOL_CALLS) return 'tools'
    return END
  })

  graph.addEdge('tools', 'agent')

  return graph.compile()
}
