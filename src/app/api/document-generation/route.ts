import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import {
  type DocumentType,
  getSystemPrompt,
  buildUserPrompt,
  isDocumentSafe,
  sanitizeDocument,
} from '@/lib/ai/document-generation'

const AI_MODEL = 'gpt-4o-mini'

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

    const rawContent = completion.choices[0]?.message?.content

    if (!rawContent) {
      return NextResponse.json(
        {
          error: 'AI returned empty response',
          fallback: true,
        },
        { status: 500 }
      )
    }

    let document = rawContent
    if (!isDocumentSafe(rawContent)) {
      document = sanitizeDocument(rawContent)
    }

    return NextResponse.json({
      success: true,
      document,
      meta: {
        model: AI_MODEL,
        documentType: body.documentType,
        tokens: completion.usage?.total_tokens,
      },
    })
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
