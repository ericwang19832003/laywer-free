import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { z } from 'zod'
import {
  AIClient,
  AIRateLimitError,
  AIResponseError,
  AIConnectionError,
  AIConfigError,
  AIError,
} from '@/lib/ai/client'

// ---------------------------------------------------------------------------
// Mock OpenAI
// ---------------------------------------------------------------------------

const mockCreate = vi.fn()

vi.mock('openai', () => {
  class RateLimitError extends Error {
    status = 429
    headers: Record<string, string> = {}
    constructor(msg: string) {
      super(msg)
      this.name = 'RateLimitError'
    }
  }

  class APIConnectionError extends Error {
    constructor(msg: string) {
      super(msg)
      this.name = 'APIConnectionError'
    }
  }

  class APIConnectionTimeoutError extends Error {
    constructor(msg: string) {
      super(msg)
      this.name = 'APIConnectionTimeoutError'
    }
  }

  class InternalServerError extends Error {
    status = 500
    constructor(msg: string) {
      super(msg)
      this.name = 'InternalServerError'
    }
  }

  class MockOpenAI {
    chat = {
      completions: {
        create: mockCreate,
      },
    }
  }

  return {
    default: MockOpenAI,
    RateLimitError,
    APIConnectionError,
    APIConnectionTimeoutError,
    InternalServerError,
  }
})

// Mock logger to avoid console noise and allow assertions
vi.mock('@/lib/observability/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeCompletion(content: string, model = 'gpt-4o-mini') {
  return {
    choices: [{ message: { content } }],
    model,
    usage: {
      prompt_tokens: 10,
      completion_tokens: 20,
      total_tokens: 30,
    },
  }
}

const BASE_REQUEST = {
  systemPrompt: 'You are a test assistant.',
  userPrompt: 'Say hello.',
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AIClient', () => {
  beforeEach(() => {
    vi.stubEnv('OPENAI_API_KEY', 'test-key-123')
    vi.useFakeTimers({ shouldAdvanceTime: true })
    mockCreate.mockReset()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.useRealTimers()
  })

  // ── Basic completion ──────────────────────────────────────────────

  describe('complete()', () => {
    it('returns content, raw, model, usage, and durationMs on success', async () => {
      mockCreate.mockResolvedValueOnce(makeCompletion('Hello!'))

      const client = new AIClient()
      const res = await client.complete(BASE_REQUEST)

      expect(res.content).toBe('Hello!')
      expect(res.raw).toBe('Hello!')
      expect(res.model).toBe('gpt-4o-mini')
      expect(res.usage).toEqual({
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30,
      })
      expect(res.durationMs).toBeGreaterThanOrEqual(0)
    })

    it('passes temperature, maxTokens, and jsonMode to OpenAI', async () => {
      mockCreate.mockResolvedValueOnce(makeCompletion('{"ok":true}'))

      const client = new AIClient()
      await client.complete({
        ...BASE_REQUEST,
        temperature: 0.2,
        maxTokens: 500,
        jsonMode: true,
      })

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 0.2,
          max_tokens: 500,
          response_format: { type: 'json_object' },
        }),
        expect.anything()
      )
    })

    it('uses custom model from config', async () => {
      mockCreate.mockResolvedValueOnce(makeCompletion('Hello!', 'gpt-4o'))

      const client = new AIClient({ model: 'gpt-4o' })
      await client.complete(BASE_REQUEST)

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({ model: 'gpt-4o' }),
        expect.anything()
      )
    })
  })

  // ── Retry logic ───────────────────────────────────────────────────

  describe('retry logic', () => {
    it('retries on transient errors and succeeds on second attempt', async () => {
      mockCreate
        .mockRejectedValueOnce(new Error('Connection reset'))
        .mockResolvedValueOnce(makeCompletion('Recovered'))

      const client = new AIClient({ maxRetries: 2 })
      const res = await client.complete(BASE_REQUEST)

      expect(res.content).toBe('Recovered')
      expect(mockCreate).toHaveBeenCalledTimes(2)
    })

    it('throws after exhausting all retries', async () => {
      mockCreate.mockRejectedValue(new Error('Persistent failure'))

      const client = new AIClient({ maxRetries: 1 })

      await expect(client.complete(BASE_REQUEST)).rejects.toThrow(AIError)
      expect(mockCreate).toHaveBeenCalledTimes(2) // 1 initial + 1 retry
    })

    it('does not retry rate-limit errors', async () => {
      const { RateLimitError } = await import('openai')
      mockCreate.mockRejectedValueOnce(new RateLimitError('429'))

      const client = new AIClient({ maxRetries: 2 })

      await expect(client.complete(BASE_REQUEST)).rejects.toThrow(AIRateLimitError)
      expect(mockCreate).toHaveBeenCalledTimes(1)
    })

    it('does not retry schema validation errors', async () => {
      mockCreate.mockResolvedValue(makeCompletion('{"bad":true}'))

      const schema = z.object({ name: z.string() })
      const client = new AIClient({ maxRetries: 2 })

      await expect(
        client.complete({ ...BASE_REQUEST, jsonMode: true, schema })
      ).rejects.toThrow(AIResponseError)
      expect(mockCreate).toHaveBeenCalledTimes(1)
    })
  })

  // ── Schema validation ──────────────────────────────────────────────

  describe('schema validation', () => {
    it('validates and returns typed data when schema is provided', async () => {
      const schema = z.object({
        tips: z.array(z.object({ tip: z.string() })),
      })

      const payload = { tips: [{ tip: 'File early' }] }
      mockCreate.mockResolvedValueOnce(makeCompletion(JSON.stringify(payload)))

      const client = new AIClient()
      const res = await client.complete({
        ...BASE_REQUEST,
        jsonMode: true,
        schema,
      })

      expect(res.content).toEqual(payload)
      expect(res.raw).toBe(JSON.stringify(payload))
    })

    it('throws AIResponseError on invalid JSON', async () => {
      mockCreate.mockResolvedValueOnce(makeCompletion('not json {{{'))

      const schema = z.object({ name: z.string() })
      const client = new AIClient()

      await expect(
        client.complete({ ...BASE_REQUEST, jsonMode: true, schema })
      ).rejects.toThrow(AIResponseError)
    })

    it('throws AIResponseError when schema validation fails', async () => {
      mockCreate.mockResolvedValueOnce(makeCompletion('{"count": 42}'))

      const schema = z.object({ name: z.string() })
      const client = new AIClient()

      await expect(
        client.complete({ ...BASE_REQUEST, jsonMode: true, schema })
      ).rejects.toThrow(AIResponseError)
    })
  })

  // ── Error wrapping ──────────────────────────────────────────────────

  describe('error types', () => {
    it('wraps empty response as AIResponseError', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: null } }],
        model: 'gpt-4o-mini',
        usage: null,
      })

      const client = new AIClient({ maxRetries: 0 })

      await expect(client.complete(BASE_REQUEST)).rejects.toThrow(AIResponseError)
    })

    it('throws AIConfigError when OPENAI_API_KEY is missing', async () => {
      vi.stubEnv('OPENAI_API_KEY', '')
      // AIConfigError is thrown before the mock is called
      const client = new AIClient({ maxRetries: 0 })

      await expect(client.complete(BASE_REQUEST)).rejects.toThrow(AIConfigError)
      expect(mockCreate).not.toHaveBeenCalled()
    })

    it('wraps connection errors as AIConnectionError', async () => {
      const { APIConnectionError } = await import('openai')
      mockCreate.mockRejectedValueOnce(new APIConnectionError('ECONNREFUSED'))

      const client = new AIClient({ maxRetries: 0 })

      await expect(client.complete(BASE_REQUEST)).rejects.toThrow(AIConnectionError)
    })

    it('error instances carry the correct code property', async () => {
      expect(new AIRateLimitError('test').code).toBe('RATE_LIMIT')
      expect(new AIResponseError('test').code).toBe('RESPONSE_ERROR')
      expect(new AIConnectionError('test').code).toBe('CONNECTION_ERROR')
      expect(new AIConfigError('test').code).toBe('CONFIG_ERROR')
    })
  })

  // ── Structured logging ──────────────────────────────────────────────

  describe('structured logging', () => {
    it('logs success with caller, model, tokens, and duration', async () => {
      const { logger } = await import('@/lib/observability/logger')
      mockCreate.mockResolvedValueOnce(makeCompletion('ok'))

      const client = new AIClient()
      await client.complete({ ...BASE_REQUEST, caller: 'test-caller' })

      expect(logger.info).toHaveBeenCalledWith(
        'ai.completion',
        expect.objectContaining({
          provider: 'openai',
          model: 'gpt-4o-mini',
          status: 'success',
          caller: 'test-caller',
          promptTokens: 10,
          completionTokens: 20,
          totalTokens: 30,
        })
      )
    })

    it('logs failure with error details', async () => {
      const { logger } = await import('@/lib/observability/logger')
      mockCreate.mockRejectedValue(new Error('boom'))

      const client = new AIClient({ maxRetries: 0 })
      await client.complete(BASE_REQUEST).catch(() => {})

      expect(logger.warn).toHaveBeenCalledWith(
        'ai.completion',
        expect.objectContaining({
          status: 'failure',
          errorCode: 'UNKNOWN',
        })
      )
    })
  })

  // ── Backward compatibility ──────────────────────────────────────────

  describe('chat() backward compatibility', () => {
    it('delegates to complete() and returns string content', async () => {
      mockCreate.mockResolvedValueOnce(makeCompletion('Hello!'))

      const client = new AIClient()
      const res = await client.chat(BASE_REQUEST)

      expect(res.content).toBe('Hello!')
      expect(typeof res.content).toBe('string')
    })
  })
})
