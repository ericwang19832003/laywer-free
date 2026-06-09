# litigation-legal Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Port six litigation-legal skills (demand letter, chronology, brief drafter, deposition prep, subpoena triage, docket watcher) as in-app AI features backed by Claude (Anthropic), replacing the current DeepSeek/OpenAI layer.

**Architecture:** `@anthropic-ai/sdk` is already installed. Rewrite `client.ts` to call Claude instead of DeepSeek. Add a `src/lib/ai/litigation-legal/` directory with a shared pro-se adapter and one module per skill. Each skill has a Next.js API route and Supabase output. See `docs/plans/2026-06-08-litigation-legal-integration-design.md` for full rationale.

**Tech Stack:** `@anthropic-ai/sdk` (already in package.json), Next.js App Router API routes, Supabase (Postgres + RLS), Vitest (unit), existing `src/lib/ai/client.ts` interface preserved.

---

## Phase 1: AI Provider Migration (DeepSeek → Claude)

### Task 1: Rewrite `client.ts` to use Anthropic SDK

**Files:**
- Modify: `apps/web/src/lib/ai/client.ts`

**Step 1: Write the failing test (update existing test file)**

Open `apps/web/tests/unit/lib/ai-client.test.ts`. Replace the `vi.mock('openai', ...)` block and `makeCompletion` helper with Anthropic equivalents:

```typescript
// Replace the openai mock block with this:
const mockCreate = vi.fn()

vi.mock('@anthropic-ai/sdk', () => {
  class RateLimitError extends Error {
    status = 429
    headers: Map<string, string> = new Map()
    constructor(msg: string) { super(msg); this.name = 'RateLimitError' }
  }
  class APIConnectionError extends Error {
    constructor(msg: string) { super(msg); this.name = 'APIConnectionError' }
  }
  class APIConnectionTimeoutError extends Error {
    constructor(msg: string) { super(msg); this.name = 'APIConnectionTimeoutError' }
  }
  class InternalServerError extends Error {
    status = 500
    constructor(msg: string) { super(msg); this.name = 'InternalServerError' }
  }
  class AuthenticationError extends Error {
    status = 401
    constructor(msg: string) { super(msg); this.name = 'AuthenticationError' }
  }
  class MockAnthropic {
    messages = { create: mockCreate }
  }
  return {
    default: MockAnthropic,
    RateLimitError, APIConnectionError, APIConnectionTimeoutError,
    InternalServerError, AuthenticationError,
  }
})

// Replace makeCompletion helper with:
function makeCompletion(content: string, model = 'claude-sonnet-4-6') {
  return {
    content: [{ type: 'text', text: content }],
    model,
    usage: { input_tokens: 10, output_tokens: 20 },
  }
}
```

Also update these test assertions:
- Change `vi.stubEnv('DEEPSEEK_API_KEY', 'test-key-123')` → `vi.stubEnv('ANTHROPIC_API_KEY', 'test-key-123')`
- Change error imports like `const { RateLimitError } = await import('openai')` → `const { RateLimitError } = await import('@anthropic-ai/sdk')`
- Change `provider: 'openai'` in the logging assertion → `provider: 'anthropic'`
- Change `makeCompletion` calls that check `response_format` — Anthropic has no `response_format`, so remove that assertion, instead check the system prompt contains `"JSON"` when `jsonMode: true`

**Step 2: Run tests to confirm they fail**

```bash
cd "apps/web" && npx vitest run tests/unit/lib/ai-client.test.ts
```
Expected: Multiple test failures referencing OpenAI mock / DEEPSEEK_API_KEY.

**Step 3: Rewrite `client.ts`**

Replace the entire file content with:

```typescript
import Anthropic from '@anthropic-ai/sdk'
import type { ZodType } from 'zod'
import { logger } from '@/lib/observability/logger'

// ---------------------------------------------------------------------------
// Error types (unchanged public interface)
// ---------------------------------------------------------------------------

export class AIError extends Error {
  constructor(message: string, public readonly code: string, public readonly cause?: unknown) {
    super(message)
    this.name = 'AIError'
  }
}

export class AIRateLimitError extends AIError {
  public readonly retryAfterMs: number | undefined
  constructor(message: string, opts?: { retryAfterMs?: number; cause?: unknown }) {
    super(message, 'RATE_LIMIT', opts?.cause)
    this.name = 'AIRateLimitError'
    this.retryAfterMs = opts?.retryAfterMs
  }
}

export class AIResponseError extends AIError {
  constructor(message: string, cause?: unknown) {
    super(message, 'RESPONSE_ERROR', cause)
    this.name = 'AIResponseError'
  }
}

export class AIConnectionError extends AIError {
  constructor(message: string, cause?: unknown) {
    super(message, 'CONNECTION_ERROR', cause)
    this.name = 'AIConnectionError'
  }
}

export class AIConfigError extends AIError {
  constructor(message: string) {
    super(message, 'CONFIG_ERROR')
    this.name = 'AIConfigError'
  }
}

// ---------------------------------------------------------------------------
// Types (unchanged public interface)
// ---------------------------------------------------------------------------

export interface AIClientConfig {
  provider?: 'anthropic'
  model?: string
  maxRetries?: number
  timeoutMs?: number
}

export interface AICompletionRequest {
  systemPrompt: string
  userPrompt: string
  temperature?: number
  maxTokens?: number
  jsonMode?: boolean
  schema?: ZodType
  caller?: string
}

export interface AICompletionResponse<T = string> {
  content: T
  raw: string
  model: string
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number }
  durationMs: number
}

// ---------------------------------------------------------------------------
// AIClient
// ---------------------------------------------------------------------------

export class AIClient {
  private readonly provider: 'anthropic'
  private readonly model: string
  private readonly maxRetries: number
  private readonly timeoutMs: number

  constructor(config: AIClientConfig = {}) {
    this.provider = 'anthropic'
    this.model = config.model ?? 'claude-sonnet-4-6'
    this.maxRetries = config.maxRetries ?? 2
    this.timeoutMs = config.timeoutMs ?? 30_000
  }

  async complete<T = string>(request: AICompletionRequest): Promise<AICompletionResponse<T>> {
    const totalAttempts = this.maxRetries + 1
    let lastError: AIError | undefined

    for (let attempt = 1; attempt <= totalAttempts; attempt++) {
      if (attempt > 1) {
        await sleep(1000 * Math.pow(2, attempt - 2))
      }

      const start = Date.now()
      try {
        const result = await this.executeAnthropic(request)
        const durationMs = Date.now() - start

        let content: T
        if (request.schema) {
          const parsed = this.parseJSON(result.raw)
          const validation = request.schema.safeParse(parsed)
          if (!validation.success) {
            throw new AIResponseError(
              `Response failed schema validation: ${validation.error.message}`,
              validation.error
            )
          }
          content = validation.data as T
        } else {
          content = result.raw as unknown as T
        }

        this.logCompletion({ caller: request.caller, attempt, durationMs, status: 'success', model: result.model, usage: result.usage })
        return { content, raw: result.raw, model: result.model, usage: result.usage, durationMs }
      } catch (error) {
        const durationMs = Date.now() - start
        lastError = this.wrapError(error)
        this.logCompletion({ caller: request.caller, attempt, durationMs, status: 'failure', model: this.model, errorCode: lastError.code, errorMessage: lastError.message })

        if (lastError instanceof AIRateLimitError || lastError instanceof AIConfigError) break
        if (lastError instanceof AIResponseError) break
      }
    }

    throw lastError ?? new AIError('All attempts failed', 'UNKNOWN')
  }

  /** @deprecated Use complete() instead. */
  async chat(request: AICompletionRequest): Promise<AICompletionResponse<string>> {
    return this.complete<string>(request)
  }

  private async executeAnthropic(request: AICompletionRequest): Promise<{
    raw: string; model: string
    usage?: { promptTokens: number; completionTokens: number; totalTokens: number }
  }> {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) throw new AIConfigError('ANTHROPIC_API_KEY is not set')

    const anthropic = new Anthropic({ apiKey })

    // For jsonMode, instruct the model via system prompt suffix
    const systemPrompt = request.jsonMode
      ? `${request.systemPrompt}\n\nRespond with valid JSON only. Do not include any other text, explanation, or markdown.`
      : request.systemPrompt

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs)

    try {
      const response = await anthropic.messages.create({
        model: this.model,
        max_tokens: request.maxTokens ?? 4000,
        temperature: request.temperature ?? 0.7,
        system: systemPrompt,
        messages: [{ role: 'user', content: request.userPrompt }],
      }, { signal: controller.signal })

      const block = response.content[0]
      const raw = block.type === 'text' ? block.text : ''
      if (!raw) throw new AIResponseError('AI returned an empty response')

      return {
        raw,
        model: response.model,
        usage: {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        },
      }
    } finally {
      clearTimeout(timeout)
    }
  }

  private wrapError(error: unknown): AIError {
    if (error instanceof AIError) return error

    if (error instanceof Anthropic.RateLimitError) {
      const retryAfter = error.headers?.['retry-after']
      return new AIRateLimitError(error.message, {
        retryAfterMs: retryAfter ? Number(retryAfter) * 1000 : undefined,
        cause: error,
      })
    }
    if (error instanceof Anthropic.APIConnectionError || error instanceof Anthropic.APIConnectionTimeoutError) {
      return new AIConnectionError(error.message, error)
    }
    if (error instanceof Anthropic.InternalServerError) {
      return new AIError(`Provider server error: ${error.message}`, 'PROVIDER_ERROR', error)
    }
    if (error instanceof Anthropic.AuthenticationError) {
      return new AIConfigError(`Authentication failed: ${error.message}`)
    }
    if (error instanceof Error && error.name === 'AbortError') {
      return new AIConnectionError(`Request timed out after ${this.timeoutMs}ms`, error)
    }
    const message = error instanceof Error ? error.message : String(error)
    return new AIError(message, 'UNKNOWN', error)
  }

  private parseJSON(raw: string): unknown {
    try {
      return JSON.parse(raw)
    } catch (err) {
      throw new AIResponseError(`Failed to parse AI response as JSON: ${raw.slice(0, 200)}`, err)
    }
  }

  private logCompletion(info: {
    caller?: string; attempt: number; durationMs: number; status: 'success' | 'failure'
    model: string; usage?: { promptTokens: number; completionTokens: number; totalTokens: number }
    errorCode?: string; errorMessage?: string
  }) {
    const context: Record<string, unknown> = {
      provider: this.provider, model: info.model, attempt: info.attempt,
      maxRetries: this.maxRetries, durationMs: info.durationMs, status: info.status,
    }
    if (info.caller) context.caller = info.caller
    if (info.usage) {
      context.promptTokens = info.usage.promptTokens
      context.completionTokens = info.usage.completionTokens
      context.totalTokens = info.usage.totalTokens
    }
    if (info.errorCode) context.errorCode = info.errorCode
    if (info.errorMessage) context.errorMessage = info.errorMessage
    info.status === 'success' ? logger.info('ai.completion', context) : logger.warn('ai.completion', context)
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const aiClient = new AIClient()
export type { ZodType as AISchema }
```

**Step 4: Run tests**

```bash
cd "apps/web" && npx vitest run tests/unit/lib/ai-client.test.ts
```
Expected: All tests pass.

**Step 5: Run full unit suite to catch regressions**

```bash
cd "apps/web" && npx vitest run tests/unit/
```
Expected: No new failures. (Some existing tests mock `openai` for their own AI modules — those are separate from `client.ts` and use their own mocks.)

**Step 6: Update env example**

In `apps/web/.env.local.example`, replace or add:
```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```
Remove the `DEEPSEEK_API_KEY` line if present.

Also update `apps/web/.env.local` (your real env) with your Anthropic API key.

**Step 7: Commit**

```bash
cd "apps/web" && git add src/lib/ai/client.ts tests/unit/lib/ai-client.test.ts .env.local.example
git commit -m "feat: migrate AI client from DeepSeek to Claude (Anthropic SDK)"
```

---

### Task 2: Update env var references across the codebase

**Files:**
- Search and fix: any file referencing `DEEPSEEK_API_KEY` or `AI_MODEL = 'deepseek-chat'`

**Step 1: Find all references**

```bash
cd "apps/web" && grep -r "DEEPSEEK_API_KEY\|deepseek-chat\|deepseek" src/ --include="*.ts" -l
```

**Step 2: Fix each file**

For each file found:
- Replace `process.env.DEEPSEEK_API_KEY` → `process.env.ANTHROPIC_API_KEY`
- Replace `const AI_MODEL = 'deepseek-chat'` → `const AI_MODEL = 'claude-sonnet-4-6'`
- Replace `baseURL: 'https://api.deepseek.com'` → remove (not needed for Anthropic)

**Step 3: Verify no remaining references**

```bash
cd "apps/web" && grep -r "DEEPSEEK\|deepseek" src/ --include="*.ts"
```
Expected: no output.

**Step 4: Commit**

```bash
git add -p  # stage only the env var changes
git commit -m "chore: replace DEEPSEEK_API_KEY references with ANTHROPIC_API_KEY"
```

---

## Phase 2: Pro Se Adapter

### Task 3: Create the shared pro se adapter

**Files:**
- Create: `apps/web/src/lib/ai/litigation-legal/pro-se-adapter.ts`
- Create: `apps/web/tests/unit/ai/litigation-legal/pro-se-adapter.test.ts`

**Step 1: Write the failing test**

Create `apps/web/tests/unit/ai/litigation-legal/pro-se-adapter.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import {
  buildCaseContext,
  applyProSeGuardrails,
  PRO_SE_DISCLAIMER,
  type CaseContextInput,
} from '@/lib/ai/litigation-legal/pro-se-adapter'

const BASE_CASE: CaseContextInput = {
  caseId: 'case-1',
  disputeType: 'contract',
  state: 'TX',
  role: 'plaintiff',
  caseName: 'Smith v. Jones',
  opposingParty: 'Jones Corp',
  court: 'Travis County District Court',
  caseNumber: '2024-CI-12345',
  keyFacts: ['Contract signed 2024-01-15', 'Payment not received by due date'],
  evidenceSummary: '3 documents: contract, invoice, payment demand',
  upcomingDeadlines: ['Answer due 2024-03-01'],
  completedSteps: ['Filed petition', 'Served defendant'],
}

describe('buildCaseContext', () => {
  it('returns a string containing all case fields', () => {
    const ctx = buildCaseContext(BASE_CASE)
    expect(ctx).toContain('Smith v. Jones')
    expect(ctx).toContain('TX')
    expect(ctx).toContain('plaintiff')
    expect(ctx).toContain('Travis County District Court')
    expect(ctx).toContain('Contract signed 2024-01-15')
    expect(ctx).toContain('3 documents')
  })

  it('handles null court and caseNumber gracefully', () => {
    const ctx = buildCaseContext({ ...BASE_CASE, court: null, caseNumber: null })
    expect(ctx).toContain('Not yet filed')
  })
})

describe('applyProSeGuardrails', () => {
  it('blocks directive legal-advice phrases', () => {
    const unsafe = 'You must file this motion immediately. I recommend doing so.'
    const result = applyProSeGuardrails(unsafe)
    expect(result).not.toContain('you must')
    expect(result).not.toContain('I recommend')
  })

  it('appends disclaimer to output', () => {
    const result = applyProSeGuardrails('Some legal document text.')
    expect(result).toContain(PRO_SE_DISCLAIMER)
  })

  it('preserves safe content', () => {
    const safe = 'This is a template for your review. Consider the following options.'
    const result = applyProSeGuardrails(safe)
    expect(result).toContain('Consider the following options')
  })
})
```

**Step 2: Run test to confirm it fails**

```bash
cd "apps/web" && npx vitest run tests/unit/ai/litigation-legal/pro-se-adapter.test.ts
```
Expected: FAIL — module not found.

**Step 3: Create the adapter module**

Create `apps/web/src/lib/ai/litigation-legal/pro-se-adapter.ts`:

```typescript
// Blocked phrases from existing document-generation.ts — extended for litigation context
const BLOCKED_PHRASES = [
  'you must', 'you should', 'you need to', 'i recommend',
  'file immediately', 'as your attorney', 'in my legal opinion',
  'i believe', 'i think', 'guaranteed', 'winning', 'losing',
  'you will win', 'legal advice', 'attorney-client',
  'i advise', 'you are required to', 'you are obligated to',
]

export const PRO_SE_DISCLAIMER =
  '\n\n---\n**NOTICE:** This document was generated with AI assistance and has not been reviewed by a licensed attorney. Review carefully before using, and consider consulting an attorney before filing or sending.'

export interface CaseContextInput {
  caseId: string
  disputeType: string
  state: string
  role: 'plaintiff' | 'defendant'
  caseName: string
  opposingParty: string
  court: string | null
  caseNumber: string | null
  keyFacts: string[]
  evidenceSummary: string
  upcomingDeadlines: string[]
  completedSteps: string[]
}

// Jurisdiction-specific notes for TX/CA/NY/FL
const JURISDICTION_NOTES: Record<string, string> = {
  TX: 'Texas courts follow the Texas Rules of Civil Procedure. Deadlines are strict. Pro se litigants must follow the same rules as attorneys.',
  CA: 'California courts follow the California Rules of Court. Many courts have self-help centers. Filing fees may be waived with a fee waiver application.',
  NY: 'New York courts vary by county. The Unified Court System has self-help resources at nycourts.gov.',
  FL: 'Florida courts follow the Florida Rules of Civil Procedure. Many circuits have self-help programs.',
}

/** Builds a case context string to substitute for the litigation-legal practice profile. */
export function buildCaseContext(input: CaseContextInput): string {
  const jurisdictionNote = JURISDICTION_NOTES[input.state] ?? ''
  return `## Case Context
Case: ${input.caseName}
Case Number: ${input.caseNumber ?? 'Not yet filed'}
Court: ${input.court ?? 'Not yet filed'}
Dispute Type: ${input.disputeType}
State: ${input.state}
Role: ${input.role} (self-represented)
Opposing Party: ${input.opposingParty}

## Key Facts
${input.keyFacts.map((f) => `- ${f}`).join('\n')}

## Evidence Summary
${input.evidenceSummary}

## Case Progress
Completed steps: ${input.completedSteps.join(', ') || 'None yet'}
Upcoming deadlines: ${input.upcomingDeadlines.join(', ') || 'None recorded'}

## Jurisdiction Notes
${jurisdictionNote}

## Role Reminder
The user is a self-represented (pro se) litigant — not an attorney. Use plain English. Never use directive language. Never predict outcomes. Always recommend consulting an attorney for final review.`
}

/** Sanitize AI output: strip blocked phrases, append disclaimer. */
export function applyProSeGuardrails(text: string): string {
  let sanitized = text
  for (const phrase of BLOCKED_PHRASES) {
    sanitized = sanitized.replace(new RegExp(phrase, 'gi'), '[consult an attorney]')
  }
  return sanitized + PRO_SE_DISCLAIMER
}
```

**Step 4: Run tests**

```bash
cd "apps/web" && npx vitest run tests/unit/ai/litigation-legal/pro-se-adapter.test.ts
```
Expected: All 5 tests pass.

**Step 5: Commit**

```bash
git add src/lib/ai/litigation-legal/pro-se-adapter.ts tests/unit/ai/litigation-legal/pro-se-adapter.test.ts
git commit -m "feat: add pro se adapter for litigation-legal skill integration"
```

---

## Phase 3: Demand Letter Upgrade

### Task 4: Create demand-draft skill module

**Files:**
- Create: `apps/web/src/lib/ai/litigation-legal/demand-draft.ts`
- Create: `apps/web/tests/unit/ai/litigation-legal/demand-draft.test.ts`

**Step 1: Write the failing test**

Create `apps/web/tests/unit/ai/litigation-legal/demand-draft.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { buildDemandDraftPrompt, validateDemandIntake, type DemandIntake } from '@/lib/ai/litigation-legal/demand-draft'

const BASE_INTAKE: DemandIntake = {
  role: 'plaintiff',
  opposingParty: 'Jones Corp',
  reliefSought: '$5,000 unpaid invoice',
  keyFacts: 'Contract signed Jan 15. Invoice sent Feb 1. Payment due Feb 28. Not received.',
  tone: 'measured',
  responseDeadlineDays: 14,
  caseContext: '## Case Context\nCase: Smith v. Jones\nState: TX',
}

describe('validateDemandIntake', () => {
  it('passes with valid intake', () => {
    const result = validateDemandIntake(BASE_INTAKE)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('fails when keyFacts is empty', () => {
    const result = validateDemandIntake({ ...BASE_INTAKE, keyFacts: '' })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Key facts are required')
  })

  it('fails when reliefSought is empty', () => {
    const result = validateDemandIntake({ ...BASE_INTAKE, reliefSought: '' })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Relief sought is required')
  })
})

describe('buildDemandDraftPrompt', () => {
  it('includes case context, facts, and tone in the prompt', () => {
    const { systemPrompt, userPrompt } = buildDemandDraftPrompt(BASE_INTAKE)
    expect(systemPrompt).toContain('self-represented')
    expect(userPrompt).toContain('Jones Corp')
    expect(userPrompt).toContain('$5,000 unpaid invoice')
    expect(userPrompt).toContain('measured')
    expect(userPrompt).toContain('14 days')
  })

  it('never includes attorney-advice language in system prompt', () => {
    const { systemPrompt } = buildDemandDraftPrompt(BASE_INTAKE)
    expect(systemPrompt.toLowerCase()).not.toContain('as your attorney')
    expect(systemPrompt.toLowerCase()).not.toContain('legal advice')
  })
})
```

**Step 2: Run test to confirm it fails**

```bash
cd "apps/web" && npx vitest run tests/unit/ai/litigation-legal/demand-draft.test.ts
```
Expected: FAIL — module not found.

**Step 3: Create the module**

Create `apps/web/src/lib/ai/litigation-legal/demand-draft.ts`:

```typescript
export type DemandTone = 'measured' | 'assertive'

export interface DemandIntake {
  role: 'plaintiff' | 'defendant'
  opposingParty: string
  reliefSought: string
  keyFacts: string
  tone: DemandTone
  responseDeadlineDays: number
  caseContext: string  // from buildCaseContext()
}

export interface IntakeValidation {
  valid: boolean
  errors: string[]
}

export function validateDemandIntake(intake: DemandIntake): IntakeValidation {
  const errors: string[] = []
  if (!intake.keyFacts.trim()) errors.push('Key facts are required')
  if (!intake.reliefSought.trim()) errors.push('Relief sought is required')
  if (!intake.opposingParty.trim()) errors.push('Opposing party name is required')
  return { valid: errors.length === 0, errors }
}

export function buildDemandDraftPrompt(intake: DemandIntake): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = `You are a legal document drafting assistant helping a self-represented (pro se) ${intake.role} draft a demand letter.

${intake.caseContext}

Rules:
- Write in plain English appropriate for a self-represented litigant.
- Never use directive language ("you must", "you should", "I recommend").
- Never predict outcomes or guarantee results.
- Never fabricate case law, statutes, or citations.
- Use bracketed placeholders for any missing information: [DATE], [AMOUNT], etc.
- Flag any legally weak argument with: [WEAK POINT — consider whether to include].
- The letter must include today's date, sender's name (use [YOUR NAME] as placeholder), and a response deadline.
- Append: "NOTICE: This letter was drafted with AI assistance and should be reviewed by an attorney before sending."`

  const toneInstruction = intake.tone === 'assertive'
    ? 'Use a firm, assertive tone that makes clear the consequences of non-response.'
    : 'Use a professional, measured tone that leaves room for resolution without litigation.'

  const userPrompt = `Draft a demand letter to ${intake.opposingParty} on behalf of a ${intake.role}.

${toneInstruction}

Key facts:
${intake.keyFacts}

Relief sought: ${intake.reliefSought}

Give the recipient ${intake.responseDeadlineDays} days to respond before further action is taken.

Format the letter as a complete, sendable document with proper header, body paragraphs, and closing.`

  return { systemPrompt, userPrompt }
}
```

**Step 4: Run tests**

```bash
cd "apps/web" && npx vitest run tests/unit/ai/litigation-legal/demand-draft.test.ts
```
Expected: All tests pass.

**Step 5: Create the API route**

Create `apps/web/src/app/api/ai/demand-draft/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { aiClient, AIError } from '@/lib/ai/client'
import { AIClient } from '@/lib/ai/client'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { checkDistributedRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'
import { getSubscription, incrementAiUsage } from '@/lib/subscription/check'
import { buildCaseContext } from '@/lib/ai/litigation-legal/pro-se-adapter'
import { validateDemandIntake, buildDemandDraftPrompt, applyProSeGuardrails } from '@/lib/ai/litigation-legal/demand-draft'
// Note: applyProSeGuardrails is imported from pro-se-adapter, not demand-draft
import { applyProSeGuardrails as applyGuardrails } from '@/lib/ai/litigation-legal/pro-se-adapter'

const IntakeSchema = z.object({
  caseId: z.string().uuid(),
  role: z.enum(['plaintiff', 'defendant']),
  opposingParty: z.string().min(1).max(200),
  reliefSought: z.string().min(1).max(1000),
  keyFacts: z.string().min(10).max(5000),
  tone: z.enum(['measured', 'assertive']),
  responseDeadlineDays: z.number().int().min(7).max(60).default(14),
})

export async function POST(request: NextRequest) {
  const supabase = await getAuthenticatedClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rateLimitResult = await checkDistributedRateLimit(user.id, RATE_LIMITS.documentGeneration)
  if (!rateLimitResult.allowed) return rateLimitResponse(rateLimitResult)

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const parsed = IntakeSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const intake = parsed.data

  // Load case context from Supabase
  const [{ data: caseRow }, { data: tasks }, { data: evidence }, { data: deadlines }] =
    await Promise.all([
      supabase.from('cases').select('dispute_type, state, role, name, opposing_party, court_type, county').eq('id', intake.caseId).single(),
      supabase.from('tasks').select('title, status').eq('case_id', intake.caseId).eq('status', 'completed').limit(10),
      supabase.from('evidence_items').select('title, description').eq('case_id', intake.caseId).limit(10),
      supabase.from('deadlines').select('title, due_date').eq('case_id', intake.caseId).gte('due_date', new Date().toISOString()).limit(5),
    ])

  if (!caseRow) return NextResponse.json({ error: 'Case not found' }, { status: 404 })

  const caseContext = buildCaseContext({
    caseId: intake.caseId,
    disputeType: caseRow.dispute_type,
    state: caseRow.state ?? 'TX',
    role: (caseRow.role ?? intake.role) as 'plaintiff' | 'defendant',
    caseName: caseRow.name ?? 'Your Case',
    opposingParty: intake.opposingParty,
    court: caseRow.court_type ?? null,
    caseNumber: null,
    keyFacts: intake.keyFacts.split('\n').filter(Boolean),
    evidenceSummary: evidence?.map((e) => e.title).join(', ') ?? 'No evidence recorded',
    upcomingDeadlines: deadlines?.map((d) => `${d.title} (${d.due_date})`) ?? [],
    completedSteps: tasks?.map((t) => t.title) ?? [],
  })

  const demandIntake = {
    role: intake.role,
    opposingParty: intake.opposingParty,
    reliefSought: intake.reliefSought,
    keyFacts: intake.keyFacts,
    tone: intake.tone,
    responseDeadlineDays: intake.responseDeadlineDays,
    caseContext,
  }

  const validation = validateDemandIntake(demandIntake)
  if (!validation.valid) return NextResponse.json({ error: validation.errors }, { status: 422 })

  const { systemPrompt, userPrompt } = buildDemandDraftPrompt(demandIntake)

  // Use opus for heavy drafting
  const client = new AIClient({ model: 'claude-opus-4-7', maxRetries: 1 })
  const result = await client.complete({ systemPrompt, userPrompt, temperature: 0.4, maxTokens: 3000, caller: 'demand-draft' })

  const safeDraft = applyGuardrails(result.content)

  // Save to documents table
  const { data: doc, error: saveError } = await supabase
    .from('documents')
    .insert({
      case_id: intake.caseId,
      title: `Demand Letter — ${intake.opposingParty}`,
      content: safeDraft,
      document_type: 'demand_letter_v2',
      status: 'draft',
    })
    .select('id')
    .single()

  if (saveError) console.error('Failed to save demand draft:', saveError)

  await incrementAiUsage(supabase, user.id).catch(() => {})

  return NextResponse.json({ draft: safeDraft, documentId: doc?.id ?? null })
}
```

**Step 6: Commit**

```bash
git add src/lib/ai/litigation-legal/demand-draft.ts \
        src/app/api/ai/demand-draft/route.ts \
        tests/unit/ai/litigation-legal/demand-draft.test.ts
git commit -m "feat: add litigation-legal demand letter drafter (Claude-backed)"
```

---

## Phase 4: Chronology Builder

### Task 5: Add `chronologies` database table

**Files:**
- Create: `supabase/migrations/20260608000001_chronologies_table.sql`

**Step 1: Write the migration**

```sql
-- Migration: 20260608000001_chronologies_table.sql

create table public.chronologies (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  entry_date date not null,
  description text not null,
  source text check (source in ('task_event', 'evidence', 'document', 'manual')),
  source_id uuid,
  significance text check (significance in ('high', 'medium', 'background')) default 'background',
  perspective text check (perspective in ('plaintiff', 'defendant')) not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.chronologies enable row level security;

create policy "Users can view their own chronology entries"
  on public.chronologies for select
  using (
    exists (
      select 1 from public.cases
      where cases.id = chronologies.case_id
      and cases.user_id = auth.uid()
    )
  );

create policy "Users can insert their own chronology entries"
  on public.chronologies for insert
  with check (
    exists (
      select 1 from public.cases
      where cases.id = chronologies.case_id
      and cases.user_id = auth.uid()
    )
  );

create policy "Users can update their own chronology entries"
  on public.chronologies for update
  using (
    exists (
      select 1 from public.cases
      where cases.id = chronologies.case_id
      and cases.user_id = auth.uid()
    )
  );

create policy "Users can delete their own chronology entries"
  on public.chronologies for delete
  using (
    exists (
      select 1 from public.cases
      where cases.id = chronologies.case_id
      and cases.user_id = auth.uid()
    )
  );

create index chronologies_case_id_idx on public.chronologies(case_id);
create index chronologies_entry_date_idx on public.chronologies(case_id, entry_date);
```

**Step 2: Apply the migration**

```bash
cd "../../"  # project root (lawyer free/)
npx supabase db reset
```
Expected: Migration applied successfully. (Requires local Supabase running.)

**Step 3: Commit**

```bash
git add supabase/migrations/20260608000001_chronologies_table.sql
git commit -m "feat: add chronologies table with RLS"
```

---

### Task 6: Create chronology skill module and API route

**Files:**
- Create: `apps/web/src/lib/ai/litigation-legal/chronology.ts`
- Create: `apps/web/src/app/api/ai/chronology/route.ts`
- Create: `apps/web/tests/unit/ai/litigation-legal/chronology.test.ts`

**Step 1: Write the failing test**

Create `apps/web/tests/unit/ai/litigation-legal/chronology.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import {
  buildChronologyPrompt,
  parseChronologyResponse,
  type ChronologyEntry,
} from '@/lib/ai/litigation-legal/chronology'

describe('buildChronologyPrompt', () => {
  it('includes case facts and perspective in prompt', () => {
    const { systemPrompt, userPrompt } = buildChronologyPrompt({
      caseName: 'Smith v. Jones',
      perspective: 'plaintiff',
      caseContext: '## Case Context\nState: TX',
      rawFacts: ['2024-01-15: Signed contract', '2024-02-01: Sent invoice'],
    })
    expect(systemPrompt).toContain('plaintiff')
    expect(userPrompt).toContain('Signed contract')
    expect(userPrompt).toContain('Sent invoice')
  })
})

describe('parseChronologyResponse', () => {
  it('parses valid JSON chronology response', () => {
    const raw = JSON.stringify([
      { date: '2024-01-15', description: 'Contract signed', significance: 'high', source: 'manual' },
      { date: '2024-02-01', description: 'Invoice sent', significance: 'medium', source: 'manual' },
    ])
    const entries = parseChronologyResponse(raw, 'plaintiff')
    expect(entries).toHaveLength(2)
    expect(entries[0].entry_date).toBe('2024-01-15')
    expect(entries[0].significance).toBe('high')
    expect(entries[0].perspective).toBe('plaintiff')
  })

  it('returns empty array on malformed JSON', () => {
    const entries = parseChronologyResponse('not json', 'plaintiff')
    expect(entries).toEqual([])
  })

  it('filters entries missing required date or description', () => {
    const raw = JSON.stringify([
      { description: 'No date entry', significance: 'high' },
      { date: '2024-01-01', description: 'Valid entry', significance: 'background' },
    ])
    const entries = parseChronologyResponse(raw, 'defendant')
    expect(entries).toHaveLength(1)
    expect(entries[0].entry_date).toBe('2024-01-01')
  })
})
```

**Step 2: Run test to confirm it fails**

```bash
cd "apps/web" && npx vitest run tests/unit/ai/litigation-legal/chronology.test.ts
```
Expected: FAIL — module not found.

**Step 3: Create the module**

Create `apps/web/src/lib/ai/litigation-legal/chronology.ts`:

```typescript
export interface ChronologyEntry {
  entry_date: string  // YYYY-MM-DD
  description: string
  source: 'task_event' | 'evidence' | 'document' | 'manual'
  source_id?: string
  significance: 'high' | 'medium' | 'background'
  perspective: 'plaintiff' | 'defendant'
}

interface ChronologyInput {
  caseName: string
  perspective: 'plaintiff' | 'defendant'
  caseContext: string
  rawFacts: string[]  // date: description pairs from task_events / evidence
}

export function buildChronologyPrompt(input: ChronologyInput): { systemPrompt: string; userPrompt: string } {
  const significanceGuide = input.perspective === 'plaintiff'
    ? '- "high": events that establish elements of the claim, close gaps the defense will open, or start limitation clocks in your favor\n- "medium": events that support the claim but may be subject to challenge\n- "background": context only'
    : '- "high": events that break elements of the claim, support affirmative defenses, or undermine plaintiff\'s timeline\n- "medium": events that weaken plaintiff\'s narrative\n- "background": context only'

  const systemPrompt = `You are helping a self-represented (${input.perspective}) litigant build a case chronology.

${input.caseContext}

Your job: extract dated events from the provided facts, de-duplicate them, and return a JSON array.

Significance tagging (from ${input.perspective} perspective):
${significanceGuide}

Return ONLY valid JSON. No explanation, no markdown. Format:
[{"date":"YYYY-MM-DD","description":"plain English description","significance":"high|medium|background","source":"manual"}]`

  const userPrompt = `Build a chronology from these case facts. Extract every event with a date. De-duplicate overlapping events. Tag each with significance from the ${input.perspective}'s perspective.

Facts:
${input.rawFacts.join('\n')}`

  return { systemPrompt, userPrompt }
}

export function parseChronologyResponse(
  raw: string,
  perspective: 'plaintiff' | 'defendant'
): ChronologyEntry[] {
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((e) => e.date && e.description)
      .map((e) => ({
        entry_date: String(e.date).slice(0, 10),
        description: String(e.description),
        source: (['task_event', 'evidence', 'document', 'manual'].includes(e.source) ? e.source : 'manual') as ChronologyEntry['source'],
        source_id: e.source_id ?? undefined,
        significance: (['high', 'medium', 'background'].includes(e.significance) ? e.significance : 'background') as ChronologyEntry['significance'],
        perspective,
      }))
  } catch {
    return []
  }
}
```

**Step 4: Run tests**

```bash
cd "apps/web" && npx vitest run tests/unit/ai/litigation-legal/chronology.test.ts
```
Expected: All tests pass.

**Step 5: Create the API route**

Create `apps/web/src/app/api/ai/chronology/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { AIClient } from '@/lib/ai/client'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { checkDistributedRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'
import { buildCaseContext } from '@/lib/ai/litigation-legal/pro-se-adapter'
import { buildChronologyPrompt, parseChronologyResponse } from '@/lib/ai/litigation-legal/chronology'

const RequestSchema = z.object({
  caseId: z.string().uuid(),
  perspective: z.enum(['plaintiff', 'defendant']),
})

export async function POST(request: NextRequest) {
  const supabase = await getAuthenticatedClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rateLimitResult = await checkDistributedRateLimit(user.id, RATE_LIMITS.documentGeneration)
  if (!rateLimitResult.allowed) return rateLimitResponse(rateLimitResult)

  const body = await request.json().catch(() => null)
  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const { caseId, perspective } = parsed.data

  const [{ data: caseRow }, { data: events }, { data: evidence }] = await Promise.all([
    supabase.from('cases').select('name, dispute_type, state, role, court_type, opposing_party').eq('id', caseId).single(),
    supabase.from('task_events').select('description, created_at').eq('case_id', caseId).order('created_at').limit(50),
    supabase.from('evidence_items').select('title, description, date_of_evidence').eq('case_id', caseId).limit(30),
  ])

  if (!caseRow) return NextResponse.json({ error: 'Case not found' }, { status: 404 })

  const rawFacts: string[] = [
    ...(events ?? []).map((e) => `${e.created_at?.slice(0, 10)}: ${e.description}`),
    ...(evidence ?? []).filter((e) => e.date_of_evidence).map((e) => `${e.date_of_evidence}: ${e.title} — ${e.description ?? ''}`),
  ]

  const caseContext = buildCaseContext({
    caseId, disputeType: caseRow.dispute_type, state: caseRow.state ?? 'TX',
    role: (caseRow.role ?? perspective) as 'plaintiff' | 'defendant',
    caseName: caseRow.name ?? 'Your Case', opposingParty: caseRow.opposing_party ?? 'Opposing Party',
    court: caseRow.court_type ?? null, caseNumber: null,
    keyFacts: [], evidenceSummary: '', upcomingDeadlines: [], completedSteps: [],
  })

  const { systemPrompt, userPrompt } = buildChronologyPrompt({
    caseName: caseRow.name ?? 'Your Case', perspective, caseContext, rawFacts,
  })

  const client = new AIClient({ model: 'claude-opus-4-7', maxRetries: 1 })
  const result = await client.complete({ systemPrompt, userPrompt, temperature: 0.2, maxTokens: 4000, jsonMode: true, caller: 'chronology' })

  const entries = parseChronologyResponse(result.content, perspective)
  if (entries.length === 0) return NextResponse.json({ error: 'No chronology entries could be extracted' }, { status: 422 })

  // Delete existing chronology for this case + perspective, then insert fresh
  await supabase.from('chronologies').delete().eq('case_id', caseId).eq('perspective', perspective)
  const { error: insertError } = await supabase.from('chronologies').insert(
    entries.map((e) => ({ ...e, case_id: caseId }))
  )
  if (insertError) return NextResponse.json({ error: 'Failed to save chronology' }, { status: 500 })

  return NextResponse.json({ entries, count: entries.length })
}
```

**Step 6: Commit**

```bash
git add src/lib/ai/litigation-legal/chronology.ts \
        src/app/api/ai/chronology/route.ts \
        tests/unit/ai/litigation-legal/chronology.test.ts
git commit -m "feat: add AI chronology builder with Supabase persistence"
```

---

### Task 7: Add Chronology UI page

**Files:**
- Create: `apps/web/src/app/(authenticated)/case/[id]/chronology/page.tsx`
- Create: `apps/web/src/components/chronology/chronology-timeline.tsx`

**Step 1: Create timeline component**

Create `apps/web/src/components/chronology/chronology-timeline.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface TimelineEntry {
  id: string
  entry_date: string
  description: string
  significance: 'high' | 'medium' | 'background'
  source: string
}

interface ChronologyTimelineProps {
  caseId: string
  initialEntries: TimelineEntry[]
  perspective: 'plaintiff' | 'defendant'
}

const SIGNIFICANCE_CONFIG = {
  high: { label: '🔴 Key fact', className: 'bg-red-50 border-red-200' },
  medium: { label: '🟡 Supporting', className: 'bg-amber-50 border-amber-200' },
  background: { label: '⚪ Background', className: 'bg-gray-50 border-gray-200' },
}

export function ChronologyTimeline({ caseId, initialEntries, perspective }: ChronologyTimelineProps) {
  const [entries, setEntries] = useState(initialEntries)
  const [isBuilding, setIsBuilding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function buildChronology() {
    setIsBuilding(true)
    setError(null)
    try {
      const res = await fetch('/api/ai/chronology', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId, perspective }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to build chronology')
      setEntries(data.entries)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred')
    } finally {
      setIsBuilding(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-warm-muted">
          {entries.length > 0 ? `${entries.length} events` : 'No chronology built yet'}
        </p>
        <Button onClick={buildChronology} disabled={isBuilding} size="sm">
          {isBuilding ? 'Building...' : entries.length > 0 ? 'Rebuild chronology' : 'Build chronology'}
        </Button>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">{error}</div>
      )}

      {entries.length === 0 && !isBuilding && (
        <Card>
          <CardContent className="py-12 text-center text-sm text-warm-muted">
            Click &ldquo;Build chronology&rdquo; to extract a timeline from your case facts and evidence.
          </CardContent>
        </Card>
      )}

      <div className="relative">
        {entries
          .sort((a, b) => a.entry_date.localeCompare(b.entry_date))
          .map((entry) => {
            const config = SIGNIFICANCE_CONFIG[entry.significance]
            return (
              <div key={entry.id} className={`mb-3 p-4 rounded-lg border ${config.className}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-warm-muted font-mono mb-1">{entry.entry_date}</p>
                    <p className="text-sm text-warm-text">{entry.description}</p>
                  </div>
                  <Badge variant="outline" className="shrink-0 text-xs">{config.label}</Badge>
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}
```

**Step 2: Create the page**

Create `apps/web/src/app/(authenticated)/case/[id]/chronology/page.tsx`:

```tsx
import { createClient } from '@/lib/supabase/server'
import { ChronologyTimeline } from '@/components/chronology/chronology-timeline'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default async function ChronologyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: caseRow }, { data: entries }] = await Promise.all([
    supabase.from('cases').select('name, role').eq('id', id).single(),
    supabase.from('chronologies').select('*').eq('case_id', id).order('entry_date'),
  ])

  const perspective = (caseRow?.role ?? 'plaintiff') as 'plaintiff' | 'defendant'

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-warm-text">Case Chronology</h1>
        <p className="text-sm text-warm-muted mt-1">
          AI-extracted timeline of key events from your case facts and evidence.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Timeline</CardTitle>
          <CardDescription>Events are tagged by significance from your perspective as the {perspective}.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChronologyTimeline
            caseId={id}
            initialEntries={entries ?? []}
            perspective={perspective}
          />
        </CardContent>
      </Card>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add src/components/chronology/chronology-timeline.tsx \
        src/app/\(authenticated\)/case/\[id\]/chronology/page.tsx
git commit -m "feat: add chronology timeline page"
```

---

## Phase 5: Brief / Motion Section Drafter

### Task 8: Create brief-section skill module and API route

**Files:**
- Create: `apps/web/src/lib/ai/litigation-legal/brief-section.ts`
- Create: `apps/web/src/app/api/ai/brief-section/route.ts`
- Create: `apps/web/tests/unit/ai/litigation-legal/brief-section.test.ts`

**Step 1: Write the failing test**

Create `apps/web/tests/unit/ai/litigation-legal/brief-section.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { buildBriefSectionPrompt, type BriefSectionInput } from '@/lib/ai/litigation-legal/brief-section'

const BASE_INPUT: BriefSectionInput = {
  motionTitle: 'Motion to Compel Discovery',
  sectionType: 'argument',
  keyArgument: 'Defendant has failed to respond to Requests for Production served 45 days ago.',
  caseContext: '## Case Context\nState: TX\nRole: plaintiff',
  evidenceSummary: 'RFP served Jan 1. No response received.',
  authorities: [],
}

describe('buildBriefSectionPrompt', () => {
  it('includes motion title and section type', () => {
    const { systemPrompt, userPrompt } = buildBriefSectionPrompt(BASE_INPUT)
    expect(userPrompt).toContain('Motion to Compel Discovery')
    expect(userPrompt).toContain('argument')
  })

  it('flags when no authorities are provided', () => {
    const { userPrompt } = buildBriefSectionPrompt({ ...BASE_INPUT, authorities: [] })
    expect(userPrompt).toContain('no case authorities')
  })

  it('includes authorities when provided', () => {
    const { userPrompt } = buildBriefSectionPrompt({
      ...BASE_INPUT,
      authorities: [{ citation: 'TRCP Rule 196', summary: 'Governs requests for production' }],
    })
    expect(userPrompt).toContain('TRCP Rule 196')
  })

  it('system prompt never contains legal-advice language', () => {
    const { systemPrompt } = buildBriefSectionPrompt(BASE_INPUT)
    expect(systemPrompt.toLowerCase()).not.toContain('as your attorney')
    expect(systemPrompt.toLowerCase()).not.toContain('i recommend')
  })
})
```

**Step 2: Run test to confirm it fails**

```bash
cd "apps/web" && npx vitest run tests/unit/ai/litigation-legal/brief-section.test.ts
```
Expected: FAIL — module not found.

**Step 3: Create the module**

Create `apps/web/src/lib/ai/litigation-legal/brief-section.ts`:

```typescript
export type SectionType = 'statement_of_facts' | 'argument' | 'introduction' | 'conclusion'

export interface Authority {
  citation: string
  summary: string
}

export interface BriefSectionInput {
  motionTitle: string
  sectionType: SectionType
  keyArgument: string
  caseContext: string
  evidenceSummary: string
  authorities: Authority[]
}

const SECTION_LABELS: Record<SectionType, string> = {
  statement_of_facts: 'Statement of Facts',
  argument: 'Argument',
  introduction: 'Introduction',
  conclusion: 'Conclusion / Prayer for Relief',
}

export function buildBriefSectionPrompt(input: BriefSectionInput): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = `You are helping a self-represented (pro se) litigant draft a section of a court filing.

${input.caseContext}

Rules:
- Write in plain English. Use proper legal formatting (headings in ALL CAPS, numbered arguments).
- Never use directive language ("you must", "I recommend").
- Never fabricate case law, statutes, or citations. Use only the authorities provided.
- If a factual assertion cannot be supported by the evidence summary, add [VERIFY — source needed].
- If an argument is legally weak, flag it: [WEAK POINT — consider whether to include this].
- Include a bracketed placeholder for any specific fact you do not have: [DATE], [EXHIBIT NUMBER], etc.
- This is a DRAFT for the user's review before filing. Append: "DRAFT — Review carefully before filing."`

  const authoritiesSection = input.authorities.length > 0
    ? `\nAuthorities to cite:\n${input.authorities.map((a) => `- ${a.citation}: ${a.summary}`).join('\n')}`
    : '\n(no case authorities provided — use general procedural language only)'

  const userPrompt = `Draft the ${SECTION_LABELS[input.sectionType]} section for: ${input.motionTitle}

Key argument / point to make:
${input.keyArgument}

Evidence available:
${input.evidenceSummary}
${authoritiesSection}

Write the ${SECTION_LABELS[input.sectionType]} section only. Use proper court filing format.`

  return { systemPrompt, userPrompt }
}
```

**Step 4: Run tests**

```bash
cd "apps/web" && npx vitest run tests/unit/ai/litigation-legal/brief-section.test.ts
```
Expected: All tests pass.

**Step 5: Create the API route**

Create `apps/web/src/app/api/ai/brief-section/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { AIClient } from '@/lib/ai/client'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { checkDistributedRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'
import { buildCaseContext, applyProSeGuardrails } from '@/lib/ai/litigation-legal/pro-se-adapter'
import { buildBriefSectionPrompt } from '@/lib/ai/litigation-legal/brief-section'

const RequestSchema = z.object({
  caseId: z.string().uuid(),
  motionId: z.string().uuid().optional(),
  motionTitle: z.string().min(1).max(200),
  sectionType: z.enum(['statement_of_facts', 'argument', 'introduction', 'conclusion']),
  keyArgument: z.string().min(10).max(3000),
})

export async function POST(request: NextRequest) {
  const supabase = await getAuthenticatedClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rateLimitResult = await checkDistributedRateLimit(user.id, RATE_LIMITS.documentGeneration)
  if (!rateLimitResult.allowed) return rateLimitResponse(rateLimitResult)

  const body = await request.json().catch(() => null)
  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const { caseId, motionTitle, sectionType, keyArgument } = parsed.data

  const [{ data: caseRow }, { data: evidence }, { data: authorities }] = await Promise.all([
    supabase.from('cases').select('name, dispute_type, state, role, court_type, opposing_party').eq('id', caseId).single(),
    supabase.from('evidence_items').select('title, description').eq('case_id', caseId).limit(15),
    supabase.from('case_authorities').select('citation, summary').eq('case_id', caseId).limit(10),
  ])

  if (!caseRow) return NextResponse.json({ error: 'Case not found' }, { status: 404 })

  const caseContext = buildCaseContext({
    caseId, disputeType: caseRow.dispute_type, state: caseRow.state ?? 'TX',
    role: (caseRow.role ?? 'plaintiff') as 'plaintiff' | 'defendant',
    caseName: caseRow.name ?? 'Your Case', opposingParty: caseRow.opposing_party ?? 'Opposing Party',
    court: caseRow.court_type ?? null, caseNumber: null,
    keyFacts: [], evidenceSummary: '', upcomingDeadlines: [], completedSteps: [],
  })

  const { systemPrompt, userPrompt } = buildBriefSectionPrompt({
    motionTitle, sectionType, keyArgument, caseContext,
    evidenceSummary: evidence?.map((e) => `${e.title}: ${e.description ?? ''}`).join('\n') ?? 'No evidence recorded',
    authorities: authorities ?? [],
  })

  const client = new AIClient({ model: 'claude-opus-4-7', maxRetries: 1 })
  const result = await client.complete({ systemPrompt, userPrompt, temperature: 0.3, maxTokens: 3000, caller: 'brief-section' })

  const safeDraft = applyProSeGuardrails(result.content)

  const { data: doc } = await supabase.from('documents').insert({
    case_id: caseId,
    title: `${motionTitle} — ${sectionType.replace(/_/g, ' ')}`,
    content: safeDraft,
    document_type: 'brief_section',
    status: 'draft',
  }).select('id').single()

  return NextResponse.json({ draft: safeDraft, documentId: doc?.id ?? null })
}
```

**Step 6: Commit**

```bash
git add src/lib/ai/litigation-legal/brief-section.ts \
        src/app/api/ai/brief-section/route.ts \
        tests/unit/ai/litigation-legal/brief-section.test.ts
git commit -m "feat: add brief/motion section drafter (Claude-backed)"
```

---

## Phase 6: Deposition Prep

### Task 9: Create deposition prep skill module and API route

**Files:**
- Create: `apps/web/src/lib/ai/litigation-legal/deposition-prep.ts`
- Create: `apps/web/src/app/api/ai/deposition-prep/route.ts`
- Create: `apps/web/tests/unit/ai/litigation-legal/deposition-prep.test.ts`

**Step 1: Write the failing test**

Create `apps/web/tests/unit/ai/litigation-legal/deposition-prep.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { buildDepoPrompt, type DepoInput } from '@/lib/ai/litigation-legal/deposition-prep'

const BASE_INPUT: DepoInput = {
  witnessName: 'Robert Jones',
  witnessRole: 'opposing_party',
  depositionPerspective: 'deposing',
  caseContext: '## Case Context\nState: TX\nRole: plaintiff',
  keyFacts: 'Contract signed Jan 15. Payment withheld without cause.',
  evidenceSummary: 'Contract (Exhibit A), Invoice (Exhibit B)',
}

describe('buildDepoPrompt', () => {
  it('includes witness name and role', () => {
    const { userPrompt } = buildDepoPrompt(BASE_INPUT)
    expect(userPrompt).toContain('Robert Jones')
    expect(userPrompt).toContain('opposing party')
  })

  it('frames as "your own deposition" when perspective is defending', () => {
    const { systemPrompt } = buildDepoPrompt({ ...BASE_INPUT, depositionPerspective: 'defending' })
    expect(systemPrompt).toContain('defending')
  })

  it('system prompt never contains legal advice language', () => {
    const { systemPrompt } = buildDepoPrompt(BASE_INPUT)
    expect(systemPrompt.toLowerCase()).not.toContain('legal advice')
    expect(systemPrompt.toLowerCase()).not.toContain('i recommend')
  })
})
```

**Step 2: Run test to confirm it fails**

```bash
cd "apps/web" && npx vitest run tests/unit/ai/litigation-legal/deposition-prep.test.ts
```
Expected: FAIL.

**Step 3: Create the module**

Create `apps/web/src/lib/ai/litigation-legal/deposition-prep.ts`:

```typescript
export type WitnessRole = 'opposing_party' | 'expert_witness' | 'fact_witness'
export type DepoPerspective = 'deposing' | 'defending'

export interface DepoInput {
  witnessName: string
  witnessRole: WitnessRole
  depositionPerspective: DepoPerspective
  caseContext: string
  keyFacts: string
  evidenceSummary: string
}

const WITNESS_ROLE_LABELS: Record<WitnessRole, string> = {
  opposing_party: 'opposing party',
  expert_witness: 'expert witness',
  fact_witness: 'fact witness',
}

export function buildDepoPrompt(input: DepoInput): { systemPrompt: string; userPrompt: string } {
  const isDeposing = input.depositionPerspective === 'deposing'

  const systemPrompt = `You are helping a self-represented litigant prepare for a deposition.

${input.caseContext}

Perspective: ${isDeposing ? 'The user is deposing (questioning) the witness.' : 'The user is defending their own deposition (being questioned).'}

Rules:
- Use plain English. No legal jargon without explanation.
- Never predict outcomes or guarantee results.
- Never use directive language ("you must", "I recommend").
- Flag any question that is likely to draw an objection with: [May draw objection — consider rephrasing].
- Organize questions by topic with clear headers.
- Include a "what to bring" section listing relevant evidence items.`

  const userPrompt = `${isDeposing ? `Prepare deposition questions to ask ${input.witnessName} (${WITNESS_ROLE_LABELS[input.witnessRole]}).` : `Help me prepare for my own deposition. The opposing party may question me as a ${WITNESS_ROLE_LABELS[input.witnessRole]}.`}

Key facts:
${input.keyFacts}

Available evidence:
${input.evidenceSummary}

Generate:
1. Key topics to cover (in order of importance)
2. ${isDeposing ? '5-8 questions per topic' : 'How to answer questions about each topic'}
3. What to bring / have ready for the deposition
4. Common pitfalls to avoid`

  return { systemPrompt, userPrompt }
}
```

**Step 4: Run tests**

```bash
cd "apps/web" && npx vitest run tests/unit/ai/litigation-legal/deposition-prep.test.ts
```
Expected: All pass.

**Step 5: Create the API route**

Create `apps/web/src/app/api/ai/deposition-prep/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { AIClient } from '@/lib/ai/client'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { checkDistributedRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'
import { buildCaseContext, applyProSeGuardrails } from '@/lib/ai/litigation-legal/pro-se-adapter'
import { buildDepoPrompt } from '@/lib/ai/litigation-legal/deposition-prep'

const RequestSchema = z.object({
  caseId: z.string().uuid(),
  witnessName: z.string().min(1).max(200),
  witnessRole: z.enum(['opposing_party', 'expert_witness', 'fact_witness']),
  depositionPerspective: z.enum(['deposing', 'defending']),
  keyFacts: z.string().min(10).max(3000),
})

export async function POST(request: NextRequest) {
  const supabase = await getAuthenticatedClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rateLimitResult = await checkDistributedRateLimit(user.id, RATE_LIMITS.documentGeneration)
  if (!rateLimitResult.allowed) return rateLimitResponse(rateLimitResult)

  const body = await request.json().catch(() => null)
  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const { caseId, witnessName, witnessRole, depositionPerspective, keyFacts } = parsed.data

  const [{ data: caseRow }, { data: evidence }] = await Promise.all([
    supabase.from('cases').select('name, dispute_type, state, role, court_type, opposing_party').eq('id', caseId).single(),
    supabase.from('evidence_items').select('title, description').eq('case_id', caseId).limit(15),
  ])

  if (!caseRow) return NextResponse.json({ error: 'Case not found' }, { status: 404 })

  const caseContext = buildCaseContext({
    caseId, disputeType: caseRow.dispute_type, state: caseRow.state ?? 'TX',
    role: (caseRow.role ?? 'plaintiff') as 'plaintiff' | 'defendant',
    caseName: caseRow.name ?? 'Your Case', opposingParty: caseRow.opposing_party ?? witnessName,
    court: caseRow.court_type ?? null, caseNumber: null,
    keyFacts: keyFacts.split('\n').filter(Boolean), evidenceSummary: '',
    upcomingDeadlines: [], completedSteps: [],
  })

  const { systemPrompt, userPrompt } = buildDepoPrompt({
    witnessName, witnessRole, depositionPerspective, caseContext, keyFacts,
    evidenceSummary: evidence?.map((e) => `${e.title}: ${e.description ?? ''}`).join('\n') ?? 'No evidence recorded',
  })

  const client = new AIClient({ model: 'claude-opus-4-7', maxRetries: 1 })
  const result = await client.complete({ systemPrompt, userPrompt, temperature: 0.4, maxTokens: 3000, caller: 'deposition-prep' })

  const safeDraft = applyProSeGuardrails(result.content)

  await supabase.from('documents').insert({
    case_id: caseId,
    title: `Deposition Prep — ${witnessName}`,
    content: safeDraft,
    document_type: 'deposition_prep',
    status: 'draft',
  })

  return NextResponse.json({ prep: safeDraft })
}
```

**Step 6: Commit**

```bash
git add src/lib/ai/litigation-legal/deposition-prep.ts \
        src/app/api/ai/deposition-prep/route.ts \
        tests/unit/ai/litigation-legal/deposition-prep.test.ts
git commit -m "feat: add AI deposition prep skill"
```

---

## Phase 7: Subpoena Triage

### Task 10: Create subpoena triage skill and API route

**Files:**
- Create: `apps/web/src/lib/ai/litigation-legal/subpoena-triage.ts`
- Create: `apps/web/src/app/api/ai/subpoena-triage/route.ts`
- Create: `apps/web/tests/unit/ai/litigation-legal/subpoena-triage.test.ts`

**Step 1: Write the failing test**

Create `apps/web/tests/unit/ai/litigation-legal/subpoena-triage.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { buildSubpoenaTriagePrompt } from '@/lib/ai/litigation-legal/subpoena-triage'

describe('buildSubpoenaTriagePrompt', () => {
  it('includes state and case context', () => {
    const { systemPrompt } = buildSubpoenaTriagePrompt({
      state: 'TX',
      caseContext: '## Case Context\nState: TX',
      subpoenaText: 'You are commanded to produce documents...',
    })
    expect(systemPrompt).toContain('TX')
    expect(systemPrompt).toContain('self-represented')
  })

  it('includes subpoena text in user prompt', () => {
    const { userPrompt } = buildSubpoenaTriagePrompt({
      state: 'CA',
      caseContext: '## Case Context\nState: CA',
      subpoenaText: 'Produce all emails from January 2024.',
    })
    expect(userPrompt).toContain('Produce all emails')
  })
})
```

**Step 2: Run test to confirm it fails**

```bash
cd "apps/web" && npx vitest run tests/unit/ai/litigation-legal/subpoena-triage.test.ts
```
Expected: FAIL.

**Step 3: Create the module**

Create `apps/web/src/lib/ai/litigation-legal/subpoena-triage.ts`:

```typescript
interface SubpoenaTriageInput {
  state: string
  caseContext: string
  subpoenaText: string
}

// Response deadline rules by state (rough guidance — user must verify)
const STATE_SUBPOENA_NOTES: Record<string, string> = {
  TX: 'Texas: Document subpoenas typically allow 10-30 days to respond. You may file a motion to quash or modify within that time. See TRCP Rule 176.',
  CA: 'California: Consumer records subpoenas require 15 days notice. Personal records subpoenas require 10 days. See CCP §§ 1985-1987.',
  NY: 'New York: Subpoenas are governed by CPLR Article 23. Response time depends on the type — typically 20 days for deposition, as specified for documents.',
  FL: 'Florida: See Fla. R. Civ. P. 1.351 for subpoenas to non-parties. Response time is typically set in the subpoena itself.',
}

export function buildSubpoenaTriagePrompt(input: SubpoenaTriageInput): { systemPrompt: string; userPrompt: string } {
  const stateNote = STATE_SUBPOENA_NOTES[input.state] ?? 'Check your state\'s rules of civil procedure for subpoena response requirements.'

  const systemPrompt = `You are helping a self-represented litigant understand and respond to a subpoena they received.

${input.caseContext}

${stateNote}

Rules:
- Use plain English. Explain legal terms when first used.
- Never predict outcomes or give legal advice.
- Always recommend consulting an attorney for the response.
- Structure your response as:
  1. What type of subpoena this is (document, deposition, or third-party)
  2. What it's asking for
  3. The response deadline (based on state rules, or as stated in the subpoena)
  4. Potential objection grounds to discuss with an attorney
  5. Step-by-step checklist for responding
- Flag urgent deadlines prominently.`

  const userPrompt = `Triage this subpoena. Classify it, explain what it requires in plain English, identify the response deadline, and provide a response checklist.

Subpoena text:
${input.subpoenaText}`

  return { systemPrompt, userPrompt }
}
```

**Step 4: Run tests**

```bash
cd "apps/web" && npx vitest run tests/unit/ai/litigation-legal/subpoena-triage.test.ts
```
Expected: All pass.

**Step 5: Create the API route**

Create `apps/web/src/app/api/ai/subpoena-triage/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { AIClient } from '@/lib/ai/client'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { checkDistributedRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'
import { buildCaseContext, applyProSeGuardrails } from '@/lib/ai/litigation-legal/pro-se-adapter'
import { buildSubpoenaTriagePrompt } from '@/lib/ai/litigation-legal/subpoena-triage'

const RequestSchema = z.object({
  caseId: z.string().uuid(),
  subpoenaText: z.string().min(20).max(10000),
})

export async function POST(request: NextRequest) {
  const supabase = await getAuthenticatedClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rateLimitResult = await checkDistributedRateLimit(user.id, RATE_LIMITS.documentGeneration)
  if (!rateLimitResult.allowed) return rateLimitResponse(rateLimitResult)

  const body = await request.json().catch(() => null)
  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const { caseId, subpoenaText } = parsed.data

  const { data: caseRow } = await supabase.from('cases').select('name, dispute_type, state, role, court_type, opposing_party').eq('id', caseId).single()
  if (!caseRow) return NextResponse.json({ error: 'Case not found' }, { status: 404 })

  const caseContext = buildCaseContext({
    caseId, disputeType: caseRow.dispute_type, state: caseRow.state ?? 'TX',
    role: (caseRow.role ?? 'plaintiff') as 'plaintiff' | 'defendant',
    caseName: caseRow.name ?? 'Your Case', opposingParty: caseRow.opposing_party ?? 'Opposing Party',
    court: caseRow.court_type ?? null, caseNumber: null,
    keyFacts: [], evidenceSummary: '', upcomingDeadlines: [], completedSteps: [],
  })

  const { systemPrompt, userPrompt } = buildSubpoenaTriagePrompt({
    state: caseRow.state ?? 'TX', caseContext, subpoenaText,
  })

  const client = new AIClient({ model: 'claude-sonnet-4-6', maxRetries: 1 })
  const result = await client.complete({ systemPrompt, userPrompt, temperature: 0.2, maxTokens: 2000, caller: 'subpoena-triage' })

  const safeResult = applyProSeGuardrails(result.content)

  await supabase.from('documents').insert({
    case_id: caseId,
    title: 'Subpoena Triage',
    content: safeResult,
    document_type: 'subpoena_triage',
    status: 'draft',
  })

  return NextResponse.json({ triage: safeResult })
}
```

**Step 6: Commit**

```bash
git add src/lib/ai/litigation-legal/subpoena-triage.ts \
        src/app/api/ai/subpoena-triage/route.ts \
        tests/unit/ai/litigation-legal/subpoena-triage.test.ts
git commit -m "feat: add subpoena triage skill"
```

---

## Phase 8: Docket Watcher

### Task 11: Create docket watcher Edge Function

**Files:**
- Create: `supabase/functions/docket-watcher/index.ts`

**Step 1: Check existing CourtListener client**

```bash
ls "apps/web/src/lib/courtlistener/"
```
Read `apps/web/src/lib/courtlistener/` to understand the existing client interface before writing the Edge Function.

**Step 2: Create the Edge Function**

Create `supabase/functions/docket-watcher/index.ts`:

```typescript
// Supabase Edge Function: runs daily via Supabase cron
// Polls CourtListener for new docket entries and pushes deadlines to the DB

import { createClient } from 'jsr:@supabase/supabase-js@2'

const COURTLISTENER_BASE = 'https://www.courtlistener.com/api/rest/v3'

interface DocketEntry {
  id: number
  date_filed: string
  description: string
  recap_documents: { id: number }[]
}

async function classifyDocketEntry(
  entry: DocketEntry,
  anthropicKey: string
): Promise<{ summary: string; responseDeadline: string | null; type: string }> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': anthropicKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: 'You classify court docket entries for self-represented litigants. Respond with JSON only: {"summary": "one sentence plain English", "type": "motion|order|notice|other", "responseDeadline": "YYYY-MM-DD or null"}. If no response deadline is implied, set responseDeadline to null. Be conservative — only set a deadline when clearly implied.',
      messages: [{ role: 'user', content: `Classify this docket entry: ${entry.description} (filed: ${entry.date_filed})` }],
    }),
  })
  const data = await res.json()
  try {
    const text = data.content[0].text
    return JSON.parse(text)
  } catch {
    return { summary: entry.description.slice(0, 200), responseDeadline: null, type: 'other' }
  }
}

Deno.serve(async () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')!
  const clApiKey = Deno.env.get('COURTLISTENER_API_KEY') ?? ''

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Get all active cases with a court case number
  const { data: cases } = await supabase
    .from('cases')
    .select('id, court_case_number, courtlistener_docket_id, docket_last_checked')
    .not('courtlistener_docket_id', 'is', null)

  if (!cases?.length) return new Response('No cases to watch', { status: 200 })

  let processed = 0
  for (const c of cases) {
    const since = c.docket_last_checked ?? new Date(Date.now() - 7 * 86400000).toISOString()

    const url = `${COURTLISTENER_BASE}/docket-entries/?docket=${c.courtlistener_docket_id}&date_filed__gte=${since.slice(0, 10)}&format=json`
    const clRes = await fetch(url, {
      headers: clApiKey ? { Authorization: `Token ${clApiKey}` } : {},
    })
    if (!clRes.ok) continue

    const { results: entries } = await clRes.json() as { results: DocketEntry[] }

    for (const entry of (entries ?? [])) {
      const classified = await classifyDocketEntry(entry, anthropicKey)

      // Record the docket entry summary
      await supabase.from('task_events').insert({
        case_id: c.id,
        description: `[Court docket] ${classified.summary}`,
        source: 'docket_watcher',
      }).select()

      // Push deadline if one was found
      if (classified.responseDeadline) {
        await supabase.from('deadlines').upsert({
          case_id: c.id,
          title: `Response to court filing (${classified.type})`,
          due_date: classified.responseDeadline,
          source: 'docket_watcher',
          is_confirmed: true,
          notes: classified.summary,
        }, { onConflict: 'case_id,title,due_date' })
      }
    }

    // Update last checked timestamp
    await supabase.from('cases').update({ docket_last_checked: new Date().toISOString() }).eq('id', c.id)
    processed++
  }

  return new Response(JSON.stringify({ processed }), { status: 200, headers: { 'content-type': 'application/json' } })
})
```

**Step 3: Create migration to add docket columns to cases**

Create `supabase/migrations/20260608000002_cases_docket_columns.sql`:

```sql
alter table public.cases
  add column if not exists courtlistener_docket_id integer,
  add column if not exists court_case_number text,
  add column if not exists docket_last_checked timestamptz;
```

**Step 4: Apply migration**

```bash
cd "../../"  # project root
npx supabase db reset
```

**Step 5: Commit**

```bash
git add supabase/functions/docket-watcher/index.ts \
        supabase/migrations/20260608000002_cases_docket_columns.sql
git commit -m "feat: add docket watcher Edge Function and cases columns for CourtListener"
```

---

## Phase 9: Validation

### Task 12: Run all unit tests

```bash
cd "apps/web" && npx vitest run tests/unit/
```
Expected: All tests pass including new litigation-legal modules.

### Task 13: Run typecheck

```bash
cd "apps/web" && npx tsc --noEmit
```
Expected: No type errors.

### Task 14: Build check

```bash
cd "apps/web" && npm run build 2>&1 | tail -20
```
Expected: Build succeeds.

### Task 15: Final commit

```bash
git add docs/plans/2026-06-08-litigation-legal-integration-plan.md
git commit -m "docs: add litigation-legal integration implementation plan"
```
