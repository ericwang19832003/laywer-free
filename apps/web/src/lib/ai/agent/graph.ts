import { Annotation, END, START, StateGraph } from '@langchain/langgraph'
import { ChatOpenAI } from '@langchain/openai'
import { BaseMessage, SystemMessage } from '@langchain/core/messages'
import type { CaseContext } from './state'
import { createSearchCaseLawTool } from './tools/search-case-law'
import { createAnalyzeDeadlinesTool } from './tools/analyze-deadlines'
import { createReviewEvidenceTool } from './tools/review-evidence'
import { createDraftDocumentTool } from './tools/draft-document'
import type { SupabaseClient } from '@supabase/supabase-js'

const MAX_TOOL_CALLS = 10

const DEADLINE_QUESTION_RE =
  /deadline|days?\s+(left|remaining)|serve|service|overdue|by\s+when|how\s+long|how\s+many\s+days|am\s+i\s+behind|filing/i

const EVIDENCE_QUESTION_RE =
  /evidence|how\s+strong|case\s+strength|enough\s+to\s+win|win\s+my\s+case|my\s+case\s+right\s+now|photos?|documents?\s+should|proof|support/i

const SYSTEM_PROMPT = `You are a knowledgeable legal assistant helping a pro se litigant navigate Texas civil court.
You have access to tools to search case law, analyze deadlines, review evidence, and draft documents.
Always ground your advice in the user's specific case context. Be warm, clear, and encouraging.
Scope all advice to Texas civil procedure. For high-stakes decisions, recommend consulting a licensed attorney.
This is general legal information — not legal advice.

Tool grounding rules — follow strictly:
- For any question about deadlines, days remaining, filing status, or what is overdue: use the "Current case deadline status" section injected into this prompt — it contains the actual case deadlines already fetched from the database. NEVER answer deadline questions from general Texas procedural knowledge or memory. Always cite the specific deadline data provided (e.g., "Your serve defendant deadline is OVERDUE by X days"). If no deadline status is provided in context, call analyze_deadlines.
- For any question about evidence organization, evidence quality, or whether the user has documents for a court presentation: use the "Current case evidence review" section injected into this prompt. Do not predict outcomes, evaluate whether the user will win, or give a legal sufficiency opinion. If no evidence review is provided in context, call review_evidence.
- For any document drafting request (letter, motion, notice, interrogatories): call draft_document immediately using reasonable assumptions. Do not ask for more context before drafting — draft first, offer to refine after. After draft_document returns, present the COMPLETE document text to the user — do not summarize or describe it.`

type InvokableTool = {
  invoke: (input: Record<string, unknown>) => Promise<unknown>
}

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
  const graphWithAgent = graph.addNode('agent', async (state: GraphState) => {
    if (state.toolCallCount >= MAX_TOOL_CALLS) {
      return {
        messages: [
          new SystemMessage('I have reached the maximum number of tool calls for this turn.'),
        ],
        toolCallCount: state.toolCallCount,
      }
    }

    const tools = buildTools(state, config)
    const llm = new ChatOpenAI({ model: 'gpt-4o', temperature: 0.5 }).bindTools(tools)

    const contextSummary =
      `Case context: ${state.caseContext.disputeType} case, ${state.caseContext.role} in ${state.caseContext.county} County.\n` +
      `Task completion score: ${state.caseContext.healthScore}/100 (task-completion only — NOT case strength). Evidence items uploaded: ${state.caseContext.evidenceCount} (raw upload count — DO NOT use this to assess sufficiency or strength; call review_evidence).\n` +
      `Tasks: ${state.caseContext.tasks.map((t) => `${t.title} (${t.status})`).join(', ')}.`

    const lastMsg = state.messages[state.messages.length - 1]
    const msgText = typeof lastMsg?.content === 'string' ? lastMsg.content : ''
    const isDeadlineQuestion = DEADLINE_QUESTION_RE.test(msgText)

    const isEvidenceQuestion = EVIDENCE_QUESTION_RE.test(msgText)

    let deadlineContext = ''
    if (isDeadlineQuestion && state.caseContext.deadlines.length > 0) {
      try {
        const deadlineTool = tools.find((t) => t.name === 'analyze_deadlines')
        if (!deadlineTool) throw new Error('analyze_deadlines tool not found in tools array')
        deadlineContext = `\n\nCurrent case deadline status:\n${String(await deadlineTool.invoke({}))}`
      } catch {
        // silent fail — agent proceeds without pre-injection
      }
    }

    let evidenceContext = ''
    if (isEvidenceQuestion) {
      try {
        const evidenceTool = tools.find((t) => t.name === 'review_evidence')
        if (!evidenceTool) throw new Error('review_evidence tool not found in tools array')
        evidenceContext = `\n\nCurrent case evidence review:\n${String(await evidenceTool.invoke({}))}`
      } catch {
        // silent fail — agent proceeds without pre-injection
      }
    }

    const response = await llm.invoke([
      new SystemMessage(`${SYSTEM_PROMPT}\n\n${contextSummary}${deadlineContext}${evidenceContext}`),
      ...state.messages,
    ])

    const hasCalls = (response as any)?.tool_calls?.length > 0
    return {
      messages: [response],
      toolCallCount: hasCalls ? state.toolCallCount + 1 : state.toolCallCount,
    }
  })

  // ---- tools node ---- //
  const graphWithTools = graphWithAgent.addNode('tools', async (state: GraphState) => {
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
        content = String(await (t as InvokableTool).invoke(call.args))
      } catch (err) {
        content = `Tool error: ${err instanceof Error ? err.message : String(err)}`
      }
      results.push({ role: 'tool', tool_call_id: call.id, content })
    }

    return { messages: results as unknown as BaseMessage[], toolCallCount: state.toolCallCount }
  })

  // ---- edges ---- //
  graphWithTools.addEdge(START, 'agent')

  graphWithTools.addConditionalEdges('agent', (state: GraphState) => {
    const last = state.messages[state.messages.length - 1] as BaseMessage & {
      tool_calls?: unknown[]
    }
    const hasCalls = (last?.tool_calls?.length ?? 0) > 0
    if (hasCalls && state.toolCallCount < MAX_TOOL_CALLS) return 'tools'
    return END
  })

  graphWithTools.addEdge('tools', 'agent')

  return graphWithTools.compile()
}
