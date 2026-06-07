import { config as loadDotenv } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load .env.local when running via tsx (vitest handles this via vite; tsx does not)
loadDotenv({ path: '.env.local', override: false })

import { buildAgentGraph } from '../graph'
import { createInitialState } from '../state'
import type { AgentEvent } from '../graph'
import { EVAL_DATASET, type EvalCase } from './dataset'
import { judgeResponse } from './judge'

// ---- Validate env vars ----
if (!process.env.OPENAI_API_KEY) {
  console.error('Missing required env var: OPENAI_API_KEY')
  process.exit(1)
}
if (!process.env.SUPABASE_TEST_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('Missing env var: set SUPABASE_TEST_URL or NEXT_PUBLIC_SUPABASE_URL')
  process.exit(1)
}
if (!process.env.SUPABASE_TEST_SERVICE_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing env var: set SUPABASE_TEST_SERVICE_KEY or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const PASS_THRESHOLD = 0.7
const FAKE_CASE_ID = 'eval-case-' + Date.now()

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

async function runSingleEval(evalCase: EvalCase, graph: ReturnType<typeof buildAgentGraph>): Promise<EvalResult> {
  const state = createInitialState(EVAL_STATE_INPUT)
  state.messages = [{ role: 'user', content: evalCase.question }]

  let agentResponse = ''

  try {
    for await (const event of graph.stream(state)) {
      const e = event as AgentEvent
      if (e.type === 'token') {
        agentResponse += e.content
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
    (process.env.SUPABASE_TEST_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL)!,
    (process.env.SUPABASE_TEST_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY)!
  )

  const saveDraft = async (_params: { caseId: string; documentType: string; content: string }) =>
    'eval-draft-id'
  const graph = buildAgentGraph({ supabaseClient: supabase, saveDraft })

  const results: EvalResult[] = []
  const categories = ['deadline_urgency', 'evidence_strength', 'legal_research', 'document_drafting'] as const

  for (const evalCase of EVAL_DATASET) {
    process.stdout.write(`  [${evalCase.id}] ${evalCase.question.slice(0, 50)}... `)
    const result = await runSingleEval(evalCase, graph)
    results.push(result)
    console.log(result.passed ? `✓ (${result.judgeScore}/2)` : `✗ (${result.judgeScore}/2) — ${result.judgeReason}`)
  }

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
