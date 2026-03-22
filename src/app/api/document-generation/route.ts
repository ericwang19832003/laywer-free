import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
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
import { getSubscription, incrementAiUsage } from '@/lib/subscription/check'

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

const aiResponseSchema = z.string().min(100, {
  message: 'Response too short to be a valid legal document',
}).refine(
  (text) => !AI_REFUSAL_PATTERNS.some((p) => text.toLowerCase().includes(p)),
  { message: 'AI response appears to be a refusal' }
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

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error: 'AI generation is not configured',
          fallback: true,
          message: 'Please set OPENAI_API_KEY in your environment variables.',
        },
        { status: 503 }
      )
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const systemPrompt = getSystemPrompt(body.documentType)
    const userPrompt = buildUserPrompt(body)

    const maxAttempts = 2
    let lastError: z.ZodError | null = null

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const completion = await openai.chat.completions.create({
        model: AI_MODEL,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      })

      const rawContent = completion.choices[0]?.message?.content ?? ''

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
          tokens: completion.usage?.total_tokens,
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

    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        {
          error: `OpenAI API error: ${error.message}`,
          fallback: true,
        },
        { status: error.status || 500 }
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
