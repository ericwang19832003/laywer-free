import OpenAI from 'openai'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AIClientConfig {
  provider?: 'openai' | 'anthropic'
  model?: string
  maxRetries?: number
  timeoutMs?: number
}

interface AICompletionRequest {
  systemPrompt: string
  userPrompt: string
  temperature?: number
  maxTokens?: number
}

interface AICompletionResponse {
  content: string
  model: string
  usage?: { promptTokens: number; completionTokens: number }
  durationMs: number
}

// ---------------------------------------------------------------------------
// AIClient
// ---------------------------------------------------------------------------

export class AIClient {
  private provider: 'openai' | 'anthropic'
  private model: string
  private maxRetries: number
  private timeoutMs: number

  constructor(config: AIClientConfig = {}) {
    this.provider = config.provider ?? 'openai'
    this.model = config.model ?? 'gpt-4o-mini'
    this.maxRetries = config.maxRetries ?? 2
    this.timeoutMs = config.timeoutMs ?? 30_000
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  async chat(request: AICompletionRequest): Promise<AICompletionResponse> {
    let lastError: Error | undefined

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      if (attempt > 0) {
        const delayMs = 1000 * Math.pow(2, attempt - 1) // 1s, 2s
        await this.sleep(delayMs)
      }

      const start = Date.now()
      try {
        const response = await this.execute(request)
        const durationMs = Date.now() - start
        this.log({ durationMs, status: 'success' })
        return { ...response, durationMs }
      } catch (error) {
        const durationMs = Date.now() - start
        lastError = error instanceof Error ? error : new Error(String(error))
        this.log({ durationMs, status: 'failure', error: lastError.message })
      }
    }

    throw new Error(
      `[AI] All ${this.maxRetries + 1} attempts failed ` +
        `(provider=${this.provider} model=${this.model}): ${lastError?.message}`
    )
  }

  // -------------------------------------------------------------------------
  // Provider dispatch
  // -------------------------------------------------------------------------

  private async execute(
    request: AICompletionRequest
  ): Promise<Omit<AICompletionResponse, 'durationMs'>> {
    if (this.provider === 'openai') {
      return this.executeOpenAI(request)
    }
    // Anthropic support can be added here in the future.
    throw new Error(`Unsupported AI provider: ${this.provider}`)
  }

  private async executeOpenAI(
    request: AICompletionRequest
  ): Promise<Omit<AICompletionResponse, 'durationMs'>> {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set')
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
        },
        { signal: controller.signal }
      )

      const content = completion.choices[0]?.message?.content
      if (!content) {
        throw new Error('AI returned an empty response')
      }

      return {
        content,
        model: completion.model,
        usage: completion.usage
          ? {
              promptTokens: completion.usage.prompt_tokens,
              completionTokens: completion.usage.completion_tokens,
            }
          : undefined,
      }
    } finally {
      clearTimeout(timeout)
    }
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  private log(info: { durationMs: number; status: string; error?: string }) {
    const parts = [
      `[AI]`,
      `provider=${this.provider}`,
      `model=${this.model}`,
      `duration=${info.durationMs}ms`,
      `status=${info.status}`,
    ]
    if (info.error) parts.push(`error="${info.error}"`)
    console.log(parts.join(' '))
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

// ---------------------------------------------------------------------------
// Default singleton
// ---------------------------------------------------------------------------

export const aiClient = new AIClient()

// Re-export types for consumers
export type { AIClientConfig, AICompletionRequest, AICompletionResponse }
