import OpenAI, {
  APIConnectionError,
  APIConnectionTimeoutError,
  RateLimitError as OpenAIRateLimitError,
  InternalServerError as OpenAIInternalServerError,
} from 'openai'
import type { ZodType } from 'zod'
import { logger } from '@/lib/observability/logger'

// ---------------------------------------------------------------------------
// Error types
// ---------------------------------------------------------------------------

/** Base error for all AI client failures. */
export class AIError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: unknown
  ) {
    super(message)
    this.name = 'AIError'
  }
}

/** Thrown when the provider returns a rate-limit (429) response. */
export class AIRateLimitError extends AIError {
  public readonly retryAfterMs: number | undefined

  constructor(message: string, opts?: { retryAfterMs?: number; cause?: unknown }) {
    super(message, 'RATE_LIMIT', opts?.cause)
    this.name = 'AIRateLimitError'
    this.retryAfterMs = opts?.retryAfterMs
  }
}

/** Thrown when the AI response is empty, unparseable, or fails schema validation. */
export class AIResponseError extends AIError {
  constructor(message: string, cause?: unknown) {
    super(message, 'RESPONSE_ERROR', cause)
    this.name = 'AIResponseError'
  }
}

/** Thrown when a network or timeout error occurs. */
export class AIConnectionError extends AIError {
  constructor(message: string, cause?: unknown) {
    super(message, 'CONNECTION_ERROR', cause)
    this.name = 'AIConnectionError'
  }
}

/** Thrown when the API key is missing or invalid. */
export class AIConfigError extends AIError {
  constructor(message: string) {
    super(message, 'CONFIG_ERROR')
    this.name = 'AIConfigError'
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AIClientConfig {
  provider?: 'openai'
  model?: string
  maxRetries?: number
  timeoutMs?: number
}

export interface AICompletionRequest {
  /** System prompt. */
  systemPrompt: string
  /** User prompt. */
  userPrompt: string
  /** Sampling temperature (0-2). Default 0.7. */
  temperature?: number
  /** Max tokens in response. Default 4000. */
  maxTokens?: number
  /** When true, instructs model to return JSON. */
  jsonMode?: boolean
  /**
   * Optional Zod schema to validate the parsed JSON response.
   * Only applicable when jsonMode is true.
   * If validation fails, an AIResponseError is thrown.
   */
  schema?: ZodType
  /** Caller label for structured logs (e.g. "health-tips", "timeline-summary"). */
  caller?: string
}

export interface AICompletionResponse<T = string> {
  /** Parsed content — typed T when schema provided, string otherwise. */
  content: T
  /** Raw string content from the model. */
  raw: string
  /** Model identifier used. */
  model: string
  /** Token usage stats when available. */
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number }
  /** Wall-clock duration of the successful attempt in ms. */
  durationMs: number
}

// ---------------------------------------------------------------------------
// AIClient
// ---------------------------------------------------------------------------

export class AIClient {
  private readonly provider: 'openai'
  private readonly model: string
  private readonly maxRetries: number
  private readonly timeoutMs: number

  constructor(config: AIClientConfig = {}) {
    this.provider = config.provider ?? 'openai'
    this.model = config.model ?? 'gpt-4o-mini'
    this.maxRetries = config.maxRetries ?? 2
    this.timeoutMs = config.timeoutMs ?? 30_000
  }

  // -----------------------------------------------------------------------
  // Public API
  // -----------------------------------------------------------------------

  /**
   * Send a chat completion request with automatic retry, structured logging,
   * and optional Zod schema validation on the response.
   *
   * @returns Typed response — `T` when `schema` is provided, `string` otherwise.
   */
  async complete<T = string>(
    request: AICompletionRequest
  ): Promise<AICompletionResponse<T>> {
    const totalAttempts = this.maxRetries + 1
    let lastError: AIError | undefined

    for (let attempt = 1; attempt <= totalAttempts; attempt++) {
      if (attempt > 1) {
        const delayMs = 1000 * Math.pow(2, attempt - 2) // 1s, 2s, ...
        await sleep(delayMs)
      }

      const start = Date.now()
      try {
        const result = await this.executeOpenAI(request)
        const durationMs = Date.now() - start

        // Schema validation (when provided)
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

        this.logCompletion({
          caller: request.caller,
          attempt,
          durationMs,
          status: 'success',
          model: result.model,
          usage: result.usage,
        })

        return {
          content,
          raw: result.raw,
          model: result.model,
          usage: result.usage,
          durationMs,
        }
      } catch (error) {
        const durationMs = Date.now() - start
        lastError = this.wrapError(error)

        this.logCompletion({
          caller: request.caller,
          attempt,
          durationMs,
          status: 'failure',
          model: this.model,
          errorCode: lastError.code,
          errorMessage: lastError.message,
        })

        // Don't retry rate-limit or config errors
        if (lastError instanceof AIRateLimitError || lastError instanceof AIConfigError) {
          break
        }

        // Don't retry schema validation failures (response is deterministic for same content)
        if (lastError instanceof AIResponseError) {
          break
        }
      }
    }

    throw lastError ?? new AIError('All attempts failed', 'UNKNOWN')
  }

  /**
   * Convenience alias matching the original API shape.
   * @deprecated Use `complete()` instead.
   */
  async chat(
    request: AICompletionRequest
  ): Promise<AICompletionResponse<string>> {
    return this.complete<string>(request)
  }

  // -----------------------------------------------------------------------
  // Provider execution
  // -----------------------------------------------------------------------

  private async executeOpenAI(
    request: AICompletionRequest
  ): Promise<{
    raw: string
    model: string
    usage?: { promptTokens: number; completionTokens: number; totalTokens: number }
  }> {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new AIConfigError('OPENAI_API_KEY is not set')
    }

    const openai = new OpenAI({ apiKey })

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs)

    try {
      const completion = await openai.chat.completions.create(
        {
          model: this.model,
          messages: [
            { role: 'system', content: request.systemPrompt },
            { role: 'user', content: request.userPrompt },
          ],
          temperature: request.temperature ?? 0.7,
          max_tokens: request.maxTokens ?? 4000,
          ...(request.jsonMode ? { response_format: { type: 'json_object' as const } } : {}),
        },
        { signal: controller.signal }
      )

      const raw = completion.choices[0]?.message?.content
      if (!raw) {
        throw new AIResponseError('AI returned an empty response')
      }

      return {
        raw,
        model: completion.model,
        usage: completion.usage
          ? {
              promptTokens: completion.usage.prompt_tokens,
              completionTokens: completion.usage.completion_tokens,
              totalTokens: completion.usage.total_tokens,
            }
          : undefined,
      }
    } finally {
      clearTimeout(timeout)
    }
  }

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------

  /** Wrap unknown errors into typed AI errors. */
  private wrapError(error: unknown): AIError {
    if (error instanceof AIError) return error

    if (error instanceof OpenAIRateLimitError) {
      const retryAfter = error.headers?.get?.('retry-after')
      return new AIRateLimitError(error.message, {
        retryAfterMs: retryAfter ? Number(retryAfter) * 1000 : undefined,
        cause: error,
      })
    }

    if (error instanceof APIConnectionError || error instanceof APIConnectionTimeoutError) {
      return new AIConnectionError(error.message, error)
    }

    if (error instanceof OpenAIInternalServerError) {
      return new AIError(`Provider server error: ${error.message}`, 'PROVIDER_ERROR', error)
    }

    if (error instanceof Error && error.name === 'AbortError') {
      return new AIConnectionError(`Request timed out after ${this.timeoutMs}ms`, error)
    }

    const message = error instanceof Error ? error.message : String(error)
    return new AIError(message, 'UNKNOWN', error)
  }

  /** Parse a JSON string, wrapping parse errors as AIResponseError. */
  private parseJSON(raw: string): unknown {
    try {
      return JSON.parse(raw)
    } catch (err) {
      throw new AIResponseError(
        `Failed to parse AI response as JSON: ${raw.slice(0, 200)}`,
        err
      )
    }
  }

  /** Emit structured log for each completion attempt. */
  private logCompletion(info: {
    caller?: string
    attempt: number
    durationMs: number
    status: 'success' | 'failure'
    model: string
    usage?: { promptTokens: number; completionTokens: number; totalTokens: number }
    errorCode?: string
    errorMessage?: string
  }) {
    const context: Record<string, unknown> = {
      provider: this.provider,
      model: info.model,
      attempt: info.attempt,
      maxRetries: this.maxRetries,
      durationMs: info.durationMs,
      status: info.status,
    }

    if (info.caller) context.caller = info.caller
    if (info.usage) {
      context.promptTokens = info.usage.promptTokens
      context.completionTokens = info.usage.completionTokens
      context.totalTokens = info.usage.totalTokens
    }
    if (info.errorCode) context.errorCode = info.errorCode
    if (info.errorMessage) context.errorMessage = info.errorMessage

    if (info.status === 'success') {
      logger.info('ai.completion', context)
    } else {
      logger.warn('ai.completion', context)
    }
  }
}

// ---------------------------------------------------------------------------
// Module-level helpers
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ---------------------------------------------------------------------------
// Default singleton
// ---------------------------------------------------------------------------

export const aiClient = new AIClient()

// Re-export types for consumers
export type { ZodType as AISchema }
