import Anthropic, {
  RateLimitError as AnthropicRateLimitError,
  APIConnectionError as AnthropicAPIConnectionError,
  APIConnectionTimeoutError as AnthropicAPIConnectionTimeoutError,
  InternalServerError as AnthropicInternalServerError,
  AuthenticationError as AnthropicAuthenticationError,
} from '@anthropic-ai/sdk'
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
  private anthropicInstance: Anthropic | null = null

  constructor(config: AIClientConfig = {}) {
    this.provider = 'anthropic'
    this.model = config.model ?? 'claude-sonnet-4-6'
    this.maxRetries = config.maxRetries ?? 2
    this.timeoutMs = config.timeoutMs ?? 30_000
  }

  private getAnthropicClient(): Anthropic {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) throw new AIConfigError('ANTHROPIC_API_KEY is not set')
    if (!this.anthropicInstance) {
      this.anthropicInstance = new Anthropic({ apiKey })
    }
    return this.anthropicInstance
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
    const anthropic = this.getAnthropicClient()

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
      const raw = block?.type === 'text' ? block.text : ''
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

    if (error instanceof AnthropicRateLimitError) {
      const h = error.headers
      const retryAfter = h instanceof Headers
        ? h.get('retry-after')
        : (h as Record<string, string> | null | undefined)?.['retry-after']
      return new AIRateLimitError(error.message, {
        retryAfterMs: retryAfter ? Number(retryAfter) * 1000 : undefined,
        cause: error,
      })
    }
    if (error instanceof AnthropicAPIConnectionError || error instanceof AnthropicAPIConnectionTimeoutError) {
      return new AIConnectionError(error.message, error)
    }
    if (error instanceof AnthropicInternalServerError) {
      return new AIError(`Provider server error: ${error.message}`, 'PROVIDER_ERROR', error)
    }
    if (error instanceof AnthropicAuthenticationError) {
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
