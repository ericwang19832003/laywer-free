import OpenAI from 'openai'
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'
import type { AgentState, AgentTool, CaseContext } from './state'
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

export type AgentEvent =
  | { type: 'token'; content: string }
  | { type: 'tool_start'; tool: string }
  | { type: 'tool_end' }
  | { type: 'done' }

export interface BuildGraphConfig {
  supabaseClient: SupabaseClient
  saveDraft: (params: { caseId: string; documentType: string; content: string }) => Promise<string>
}

function buildTools(caseContext: CaseContext, config: BuildGraphConfig): AgentTool[] {
  return [
    createSearchCaseLawTool({
      disputeType: caseContext.disputeType,
      supabaseClient: config.supabaseClient,
    }),
    createAnalyzeDeadlinesTool({ deadlines: caseContext.deadlines }),
    createReviewEvidenceTool({
      evidenceCount: caseContext.evidenceCount,
      disputeType: caseContext.disputeType,
    }),
    createDraftDocumentTool({
      caseId: '',
      disputeType: caseContext.disputeType,
      role: caseContext.role,
      saveDraft: config.saveDraft,
    }),
  ]
}

export function buildAgentGraph(config: BuildGraphConfig) {
  return {
    async *stream(state: AgentState): AsyncGenerator<AgentEvent> {
      const client = new OpenAI({
        apiKey: process.env.DEEPSEEK_API_KEY,
        baseURL: 'https://api.deepseek.com',
      })

      const tools = buildTools(state.caseContext, config)
      // Patch caseId into draft tool (can't pass it at build time because state carries it)
      const draftTool = tools.find((t) => t.name === 'draft_document')
      if (draftTool) {
        const originalInvoke = draftTool.invoke.bind(draftTool)
        draftTool.invoke = (args) => {
          ;(config as unknown as { _caseId: string })._caseId = state.caseId
          return originalInvoke({ ...args, _caseId: state.caseId })
        }
      }

      const toolMap = Object.fromEntries(tools.map((t) => [t.name, t]))
      const toolDefs = tools.map((t) => t.definition)

      const contextSummary =
        `Case context: ${state.caseContext.disputeType} case, ${state.caseContext.role} in ${state.caseContext.county} County.\n` +
        `Task completion score: ${state.caseContext.healthScore}/100 (task-completion only — NOT case strength). Evidence items uploaded: ${state.caseContext.evidenceCount} (raw upload count — DO NOT use this to assess sufficiency or strength; call review_evidence).\n` +
        `Tasks: ${state.caseContext.tasks.map((t) => `${t.title} (${t.status})`).join(', ')}.`

      const lastUserMsg = [...state.messages].reverse().find((m) => m.role === 'user')
      const msgText = typeof lastUserMsg?.content === 'string' ? lastUserMsg.content : ''
      const isDeadlineQuestion = DEADLINE_QUESTION_RE.test(msgText)
      const isEvidenceQuestion = EVIDENCE_QUESTION_RE.test(msgText)

      let deadlineContext = ''
      if (isDeadlineQuestion && state.caseContext.deadlines.length > 0) {
        try {
          deadlineContext = `\n\nCurrent case deadline status:\n${await toolMap['analyze_deadlines'].invoke({})}`
        } catch { /* silent */ }
      }

      let evidenceContext = ''
      if (isEvidenceQuestion) {
        try {
          evidenceContext = `\n\nCurrent case evidence review:\n${await toolMap['review_evidence'].invoke({})}`
        } catch { /* silent */ }
      }

      const systemContent = `${SYSTEM_PROMPT}\n\n${contextSummary}${deadlineContext}${evidenceContext}`
      const msgs: ChatCompletionMessageParam[] = [
        { role: 'system', content: systemContent },
        ...state.messages,
      ]

      let toolCallCount = 0

      while (toolCallCount < MAX_TOOL_CALLS) {
        const stream = await client.chat.completions.create({
          model: 'deepseek-chat',
          temperature: 0.5,
          messages: msgs,
          tools: toolDefs,
          stream: true,
        })

        let assistantContent = ''
        const toolCalls: Array<{ id: string; name: string; arguments: string }> = []

        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta
          if (!delta) continue

          if (delta.content) {
            assistantContent += delta.content
            yield { type: 'token', content: delta.content }
          }

          if (delta.tool_calls) {
            for (const tc of delta.tool_calls) {
              const idx = tc.index ?? 0
              if (!toolCalls[idx]) {
                toolCalls[idx] = { id: tc.id ?? '', name: tc.function?.name ?? '', arguments: '' }
                if (tc.function?.name) yield { type: 'tool_start', tool: tc.function.name }
              }
              if (tc.id) toolCalls[idx].id = tc.id
              if (tc.function?.name) toolCalls[idx].name = tc.function.name
              if (tc.function?.arguments) toolCalls[idx].arguments += tc.function.arguments
            }
          }
        }

        const activeCalls = toolCalls.filter(Boolean)
        if (activeCalls.length === 0) break

        msgs.push({
          role: 'assistant',
          content: assistantContent || null,
          tool_calls: activeCalls.map((tc) => ({
            id: tc.id,
            type: 'function' as const,
            function: { name: tc.name, arguments: tc.arguments },
          })),
        })

        for (const tc of activeCalls) {
          const handler = toolMap[tc.name]
          let result: string
          try {
            const args = JSON.parse(tc.arguments || '{}') as Record<string, unknown>
            result = handler ? await handler.invoke(args) : `Unknown tool: ${tc.name}`
          } catch (err) {
            result = `Tool error: ${err instanceof Error ? err.message : String(err)}`
          }
          yield { type: 'tool_end' }
          msgs.push({ role: 'tool', tool_call_id: tc.id, content: result })
        }

        toolCallCount++
      }

      // Expose accumulated messages for checkpoint saving (strip system message)
      state.messages = msgs.slice(1) as ChatCompletionMessageParam[]
      yield { type: 'done' }
    },
  }
}
