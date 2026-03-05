import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { generateSingleEmbedding } from '@/lib/courtlistener/embeddings'
import { buildRAGPrompt, isRAGAnswerSafe, ragQuestionSchema, type RAGChunkContext } from '@/lib/courtlistener/rag-prompts'
import { safeError } from '@/lib/security/safe-log'
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'

export const runtime = 'nodejs'
export const maxDuration = 60

const AI_MODEL = 'claude-sonnet-4-20250514'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase, user } = auth

    const rl = checkRateLimit(user.id, 'ai', RATE_LIMITS.ai.maxRequests, RATE_LIMITS.ai.windowMs)
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

    // Verify case + get context
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('id, jurisdiction, dispute_type, role, county')
      .eq('id', caseId)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    const body = await request.json()
    const parsed = ragQuestionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid question', details: parsed.error.issues },
        { status: 422 }
      )
    }

    const { question } = parsed.data

    // Check if user has any authorities
    const { count } = await supabase
      .from('case_authorities')
      .select('id', { count: 'exact', head: true })
      .eq('case_id', caseId)
      .eq('status', 'ready')

    if (!count || count === 0) {
      return NextResponse.json({
        answer: 'You haven\'t saved any case law authorities yet. Search for relevant cases and click "Use as Authority" to build your research library, then ask your question again.',
        citations: [],
        _meta: { source: 'no_authorities' },
      })
    }

    // 1. Embed the question
    const questionEmbedding = await generateSingleEmbedding(question)

    // 2. Vector similarity search using the DB function
    const { data: matchedChunks, error: matchError } = await supabase
      .rpc('match_opinion_chunks', {
        query_embedding: JSON.stringify(questionEmbedding),
        match_count: 8,
        filter_case_id: caseId,
      })

    if (matchError || !matchedChunks || matchedChunks.length === 0) {
      return NextResponse.json({
        answer: 'No relevant case law excerpts found in your saved authorities. Try adding more cases that relate to your question.',
        citations: [],
        _meta: { source: 'no_matches' },
      })
    }

    // 3. Build RAG prompt
    const chunks: RAGChunkContext[] = matchedChunks.map((c: {
      case_name: string
      court_name: string
      date_filed: string
      opinion_type: string
      content: string
      similarity: number
    }) => ({
      case_name: c.case_name,
      court_name: c.court_name,
      date_filed: c.date_filed,
      opinion_type: c.opinion_type,
      content: c.content,
      similarity: c.similarity,
    }))

    const prompt = buildRAGPrompt(question, chunks, {
      dispute_type: caseData.dispute_type,
      jurisdiction: caseData.jurisdiction,
      role: caseData.role,
      county: caseData.county,
    })

    // 4. Call Claude
    const anthropic = new Anthropic()
    const response = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 2048,
      messages: [
        { role: 'user', content: prompt.user },
      ],
      system: prompt.system,
    })

    const answer = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('\n')

    // Safety check
    if (!isRAGAnswerSafe(answer)) {
      return NextResponse.json({
        answer: 'The AI response could not be displayed because it contained language that may constitute legal advice. Please rephrase your question to focus on what the case law says rather than what actions to take.',
        citations: [],
        _meta: { source: 'safety_filtered' },
      })
    }

    // 5. Build citations from chunks used
    const citations = chunks.map((c) => ({
      case_name: c.case_name,
      court: c.court_name,
      year: c.date_filed ? new Date(c.date_filed).getFullYear() : null,
      excerpt: c.content.slice(0, 300) + (c.content.length > 300 ? '...' : ''),
      opinion_type: c.opinion_type,
    }))

    // Dedupe citations by case_name
    const seen = new Set<string>()
    const uniqueCitations = citations.filter((c) => {
      if (seen.has(c.case_name)) return false
      seen.add(c.case_name)
      return true
    })

    return NextResponse.json({
      answer,
      citations: uniqueCitations,
      _meta: { source: 'rag', model: AI_MODEL, chunks_used: chunks.length },
    })
  } catch (err) {
    safeError('research/ask', err)
    return NextResponse.json({ error: 'Failed to generate answer. Please try again.' }, { status: 500 })
  }
}
