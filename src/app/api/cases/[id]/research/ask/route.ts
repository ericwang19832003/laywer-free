import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createHash } from 'crypto'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { generateSingleEmbedding } from '@/lib/courtlistener/embeddings'
import { buildRAGPrompt, isRAGAnswerSafe, ragQuestionSchema, type RAGChunkContext } from '@/lib/courtlistener/rag-prompts'
import { expandQueryWithContext, mergeHybridResults } from '@/lib/courtlistener/search'
import { sanitizeDirectiveLanguage, validateAnswerCitations } from '@/lib/courtlistener/validators'
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

    // Fetch authorities for cache key + check availability
    const { data: authorityRows } = await supabase
      .from('case_authorities')
      .select('cluster_id')
      .eq('case_id', caseId)
      .eq('status', 'ready')

    const authorityIds = (authorityRows ?? []).map((row) => row.cluster_id).sort((a, b) => a - b)

    if (authorityIds.length === 0) {
      return NextResponse.json({
        answer: 'You haven\'t saved any case law authorities yet. Search for relevant cases and click "Use as Authority" to build your research library, then ask your question again.',
        citations: [],
        _meta: { source: 'no_authorities' },
      })
    }

    const authoritiesHash = createHash('sha256')
      .update(JSON.stringify(authorityIds))
      .digest('hex')

    const queryHash = createHash('sha256')
      .update(JSON.stringify({ question }))
      .digest('hex')

    const { data: cached } = await supabase
      .from('cl_query_cache')
      .select('response')
      .eq('query_hash', queryHash)
      .eq('case_id', caseId)
      .eq('authorities_hash', authoritiesHash)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle()

    if (cached?.response) {
      return NextResponse.json({ ...cached.response, _meta: { source: 'cache' } })
    }

    const expandedQuestion = expandQueryWithContext(question, {
      dispute_type: caseData.dispute_type,
      jurisdiction: caseData.jurisdiction,
      role: caseData.role,
      county: caseData.county,
    })

    // 1. Embed the question
    const questionEmbedding = await generateSingleEmbedding(expandedQuestion)

    // 2. Vector similarity search using the DB function
    const { data: vectorChunks, error: matchError } = await supabase
      .rpc('match_opinion_chunks', {
        query_embedding: JSON.stringify(questionEmbedding),
        match_count: 8,
        filter_case_id: caseId,
      })

    const { data: keywordChunks } = await supabase
      .rpc('match_opinion_chunks_keyword', {
        query_text: expandedQuestion,
        match_count: 20,
        filter_case_id: caseId,
      })

    const vectorList = (vectorChunks ?? []).map((c: { id: string; similarity: number }) => ({
      id: c.id,
      score: c.similarity,
      source: 'vector' as const,
    }))
    const keywordList = (keywordChunks ?? []).map((c: { id: string; rank: number }) => ({
      id: c.id,
      score: c.rank ?? 0,
      source: 'keyword' as const,
    }))

    const merged = mergeHybridResults(vectorList, keywordList, { limit: 10 })
    const chunkById = new Map<string, Record<string, unknown>>()
    ;(vectorChunks ?? []).forEach((c: Record<string, unknown>) => chunkById.set(String(c.id), c))
    ;(keywordChunks ?? []).forEach((c: Record<string, unknown>) => chunkById.set(String(c.id), c))

    type MatchedChunk = {
      case_name: string
      court_name: string
      date_filed: string
      opinion_type: string
      content: string
      similarity?: number
      rank?: number
    }

    const matchedChunks = merged
      .map((m) => chunkById.get(m.id))
      .filter(Boolean) as MatchedChunk[]

    if (matchError || matchedChunks.length === 0) {
      return NextResponse.json({
        answer: 'No relevant case law excerpts found in your saved authorities. Try adding more cases that relate to your question.',
        citations: [],
        _meta: { source: 'no_matches' },
      })
    }

    // 3. Build RAG prompt
    const chunks: RAGChunkContext[] = matchedChunks.map((c) => ({
      case_name: c.case_name,
      court_name: c.court_name,
      date_filed: c.date_filed,
      opinion_type: c.opinion_type,
      content: c.content,
      similarity: c.similarity ?? c.rank ?? 0,
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

    const answerRaw = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('\n')

    const answer = sanitizeDirectiveLanguage(answerRaw)

    const citationValidation = validateAnswerCitations(answer)
    if (!citationValidation.ok) {
      return NextResponse.json({
        answer: 'The AI response did not include sufficient citations for every statement. Please try asking a narrower question or add more authorities.',
        citations: [],
        _meta: { source: 'citation_missing' },
      })
    }

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

    const responsePayload = {
      answer,
      citations: uniqueCitations,
      _meta: { source: 'rag', model: AI_MODEL, chunks_used: chunks.length },
    }

    const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()
    await supabase
      .from('cl_query_cache')
      .upsert({
        query_hash: queryHash,
        question,
        case_id: caseId,
        authorities_hash: authoritiesHash,
        response: responsePayload,
        chunks_used: chunks.map((c) => ({
          case_name: c.case_name,
          court_name: c.court_name,
          date_filed: c.date_filed,
          opinion_type: c.opinion_type,
          similarity: c.similarity,
        })),
        expires_at: expiresAt,
      }, { onConflict: 'query_hash,case_id,authorities_hash' })

    return NextResponse.json(responsePayload)
  } catch (err) {
    safeError('research/ask', err)
    return NextResponse.json({ error: 'Failed to generate answer. Please try again.' }, { status: 500 })
  }
}
