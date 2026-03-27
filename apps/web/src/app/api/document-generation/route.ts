import { NextRequest, NextResponse } from 'next/server'
import { aiClient, AIError } from '@/lib/ai/client'
import { z } from 'zod'
import {
  type DocumentType,
  getSystemPrompt,
  buildUserPrompt,
  isDocumentSafe,
  sanitizeDocument,
} from '@/lib/ai/document-generation'
import { INPUT_LIMITS, validateTextLength } from '@/lib/validation/input-limits'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { validateAIInput } from '@/lib/ai/input-validation'
import { getSubscription, incrementAiUsage } from '@/lib/subscription/check'
import { checkDistributedRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'

const AI_MODEL = 'gpt-4o-mini'

const AI_REFUSAL_PATTERNS = [
  'i cannot',
  "i'm sorry, i can't",
  'as an ai',
  'i am not able to',
  'i\'m not able to',
  'i am unable to',
  'i\'m unable to',
]

/**
 * Validates that AI output is a structurally valid legal document:
 * - Minimum length (100 chars) to reject empty/stub responses
 * - Not an AI refusal message
 * - Contains paragraph structure (at least 2 line breaks)
 * - Not repetitive gibberish (no single token repeated excessively)
 */
export const aiResponseSchema = z.string()
  .min(100, {
    message: 'Response too short to be a valid legal document',
  })
  .refine(
    (text) => !AI_REFUSAL_PATTERNS.some((p) => text.toLowerCase().includes(p)),
    { message: 'AI response appears to be a refusal' }
  )
  .refine(
    (text) => {
      // Must contain at least 2 line breaks indicating paragraph structure
      const lineBreaks = (text.match(/\n/g) || []).length
      return lineBreaks >= 2
    },
    { message: 'Response lacks paragraph structure expected in a legal document' }
  )
  .refine(
    (text) => {
      // Detect repetitive gibberish: if any single word accounts for >40% of
      // total words (excluding common articles/prepositions), flag it
      const words = text.toLowerCase().match(/[a-z]{4,}/g) || []
      if (words.length < 20) return true // too short to judge by frequency
      const freq: Record<string, number> = {}
      for (const w of words) {
        freq[w] = (freq[w] || 0) + 1
      }
      const maxFreq = Math.max(...Object.values(freq))
      return maxFreq / words.length <= 0.4
    },
    { message: 'Response appears to contain repetitive or garbled text' }
  )

interface DocumentGenerationRequest {
  documentType: DocumentType
  caseDetails: {
    caseName: string
    caseNumber?: string
    court?: string
    yourName: string
    opposingParty?: string
    disputeType?: string
    state?: string
    role?: 'plaintiff' | 'defendant'
  }
  documentDetails: {
    recipientName?: string
    recipientTitle?: string
    subject?: string
    facts?: string
    claims?: string
    damages?: string
    settlementAmount?: string
    timeline?: string
    additionalInfo?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase, user } = auth

    // Rate limit
    const rl = await checkDistributedRateLimit(supabase, user.id, 'ai', RATE_LIMITS.ai.maxRequests, RATE_LIMITS.ai.windowMs)
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

    // Subscription gate: aiGenerationsPerMonth
    const sub = await getSubscription(supabase, user.id)
    if (sub.aiRemaining <= 0) {
      return NextResponse.json(
        {
          error: 'upgrade_required',
          message: 'You\'ve used all your AI generations this month. Upgrade for unlimited.',
          feature: 'aiGenerationsPerMonth',
          currentTier: sub.tier,
          upgradeUrl: '/pricing',
        },
        { status: 403 }
      )
    }

    const body: DocumentGenerationRequest = await request.json()

    if (!body.documentType || !body.caseDetails || !body.documentDetails) {
      return NextResponse.json(
        { error: 'Missing required fields: documentType, caseDetails, documentDetails' },
        { status: 400 }
      )
    }

    if (!body.caseDetails.caseName || !body.caseDetails.yourName) {
      return NextResponse.json(
        { error: 'caseName and yourName are required' },
        { status: 400 }
      )
    }

    // Validate free-text field lengths
    const textChecks: [string | undefined, number, string][] = [
      [body.documentDetails.facts, INPUT_LIMITS.DOCUMENT_FACTS, 'facts'],
      [body.documentDetails.claims, INPUT_LIMITS.DOCUMENT_CLAIMS, 'claims'],
      [body.documentDetails.damages, INPUT_LIMITS.GENERAL_TEXT, 'damages'],
      [body.documentDetails.settlementAmount, INPUT_LIMITS.GENERAL_TEXT, 'settlementAmount'],
      [body.documentDetails.timeline, INPUT_LIMITS.GENERAL_TEXT, 'timeline'],
      [body.documentDetails.additionalInfo, INPUT_LIMITS.GENERAL_TEXT, 'additionalInfo'],
      [body.documentDetails.subject, INPUT_LIMITS.GENERAL_TEXT, 'subject'],
    ]

    for (const [value, limit, fieldName] of textChecks) {
      if (typeof value === 'string') {
        const err = validateTextLength(value, limit, fieldName)
        if (err) {
          return NextResponse.json({ error: err }, { status: 422 })
        }
      }
    }

    // Prompt injection check on free-text fields
    const textFields: Record<string, string> = {}
    if (body.documentDetails.facts) textFields.facts = body.documentDetails.facts
    if (body.documentDetails.claims) textFields.claims = body.documentDetails.claims
    if (body.documentDetails.damages) textFields.damages = body.documentDetails.damages
    if (body.documentDetails.timeline) textFields.timeline = body.documentDetails.timeline
    if (body.documentDetails.additionalInfo) textFields.additionalInfo = body.documentDetails.additionalInfo
    if (body.documentDetails.subject) textFields.subject = body.documentDetails.subject
    for (const [field, value] of Object.entries(textFields)) {
      const check = validateAIInput(value)
      if (!check.safe) {
        return NextResponse.json(
          { error: `Field "${field}": ${check.reason}` },
          { status: 400 }
        )
      }
    }

    const systemPrompt = getSystemPrompt(body.documentType)
    const userPrompt = buildUserPrompt(body)

    const maxAttempts = 2
    let lastError: z.ZodError | null = null

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const { content: rawContent, usage } = await aiClient.complete({
        systemPrompt,
        userPrompt,
        temperature: 0.7,
        maxTokens: 4000,
        caller: 'document-generation',
      })

      const result = aiResponseSchema.safeParse(rawContent)

      if (!result.success) {
        lastError = result.error
        console.error(
          `Document generation validation failed (documentType: ${body.documentType}, attempt: ${attempt}/${maxAttempts}):`,
          result.error.issues.map((i) => i.message).join('; ')
        )
        continue
      }

      let document = result.data
      if (!isDocumentSafe(document)) {
        document = sanitizeDocument(document)
      }

      // Increment AI usage after successful generation
      await incrementAiUsage(supabase)

      return NextResponse.json({
        success: true,
        document,
        meta: {
          model: AI_MODEL,
          documentType: body.documentType,
          tokens: usage?.totalTokens,
        },
      })
    }

    console.error(
      `Document generation failed after ${maxAttempts} attempts (documentType: ${body.documentType}):`,
      lastError?.issues.map((i) => i.message).join('; ')
    )

    return NextResponse.json(
      {
        error: 'Document generation produced an invalid result. Please try again.',
        fallback: true,
      },
      { status: 500 }
    )
  } catch (error) {
    console.error('Document generation error:', error)

    if (error instanceof AIError) {
      return NextResponse.json(
        {
          error: `AI error: ${error.message}`,
          fallback: true,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to generate document',
        fallback: true,
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
