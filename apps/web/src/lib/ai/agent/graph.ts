import Anthropic from '@anthropic-ai/sdk'
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

function toAnthropicTool(tool: AgentTool): Anthropic.Tool {
  const fn = tool.definition.function
  return {
    name: fn.name,
    description: fn.description,
    input_schema: fn.parameters as Anthropic.Tool['input_schema'],
  }
}

export function buildAgentGraph(config: BuildGraphConfig) {
  return {
    async *stream(state: AgentState): AsyncGenerator<AgentEvent> {
      const apiKey = process.env.ANTHROPIC_API_KEY
      if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set')

      const anthropic = new Anthropic({ apiKey })

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
      const anthropicTools = tools.map(toAnthropicTool)

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

      // Convert stored messages to Anthropic format
      type AnthropicMessage = Anthropic.MessageParam
      const msgs: AnthropicMessage[] = state.messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: typeof m.content === 'string' ? m.content : String(m.content ?? ''),
        }))

      let toolCallCount = 0

      while (toolCallCount < MAX_TOOL_CALLS) {
        // Use streaming for token-by-token output
        const stream = await anthropic.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 4096,
          temperature: 0.5,
          system: systemContent,
          messages: msgs,
          tools: anthropicTools,
        })

        let assistantContent = ''
        const pendingToolUses: Array<{ id: string; name: string; input: string }> = []

        for await (const event of stream) {
          if (event.type === 'content_block_start') {
            if (event.content_block.type === 'tool_use') {
              pendingToolUses.push({ id: event.content_block.id, name: event.content_block.name, input: '' })
              yield { type: 'tool_start', tool: event.content_block.name }
            }
          } else if (event.type === 'content_block_delta') {
            if (event.delta.type === 'text_delta') {
              assistantContent += event.delta.text
              yield { type: 'token', content: event.delta.text }
            } else if (event.delta.type === 'input_json_delta') {
              const last = pendingToolUses[pendingToolUses.length - 1]
              if (last) last.input += event.delta.partial_json
            }
          }
        }

        await stream.finalMessage()

        if (pendingToolUses.length === 0) break

        // Build assistant message with tool_use blocks
        const assistantBlocks: (Anthropic.TextBlockParam | Anthropic.ToolUseBlockParam)[] = []
        if (assistantContent) {
          assistantBlocks.push({ type: 'text', text: assistantContent })
        }
        for (const tu of pendingToolUses) {
          let parsedInput: Record<string, unknown> = {}
          try { parsedInput = JSON.parse(tu.input || '{}') } catch { /* empty */ }
          assistantBlocks.push({ type: 'tool_use', id: tu.id, name: tu.name, input: parsedInput })
        }
        msgs.push({ role: 'assistant', content: assistantBlocks })

        // Execute tools and collect results
        const toolResultBlocks: Anthropic.ToolResultBlockParam[] = []
        for (const tu of pendingToolUses) {
          const parsedInput: Record<string, unknown> = {}
          // Reuse parsed input from the block already in assistantBlocks
          const block = assistantBlocks.find((b) => b.type === 'tool_use' && b.id === tu.id)
          const inputToUse = (block && 'input' in block ? block.input : parsedInput) as Record<string, unknown>

          const handler = toolMap[tu.name]
          let result: string
          try {
            result = handler ? await handler.invoke(inputToUse) : `Unknown tool: ${tu.name}`
          } catch (err) {
            result = `Tool error: ${err instanceof Error ? err.message : String(err)}`
          }
          yield { type: 'tool_end' }
          toolResultBlocks.push({ type: 'tool_result', tool_use_id: tu.id, content: result })
        }
        msgs.push({ role: 'user', content: toolResultBlocks })

        toolCallCount++
      }

      // Expose accumulated messages for checkpoint saving (convert back to generic format)
      state.messages = msgs.map((m) => ({
        role: m.role,
        content: typeof m.content === 'string'
          ? m.content
          : Array.isArray(m.content)
            ? m.content.map((b) => ('text' in b ? b.text : '')).join('')
            : '',
      })) as typeof state.messages

      yield { type: 'done' }
    },
  }
}
