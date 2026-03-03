import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import {
  evidenceCategorySchema,
  isCategorySafe,
  getHeuristicCategory,
  buildCategorizationPrompt,
  EVIDENCE_CATEGORIZATION_SYSTEM_PROMPT,
} from '@/lib/ai/evidence-categorization'

export const runtime = 'nodejs'
export const maxDuration = 30

const AI_MODEL = 'gpt-4o-mini'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    // Verify case
    const { error: caseError } = await supabase
      .from('cases').select('id').eq('id', caseId).single()
    if (caseError) return NextResponse.json({ error: 'Case not found' }, { status: 404 })

    const body = await request.json()
    const { file_name, mime_type, text_snippet } = body

    if (!file_name) {
      return NextResponse.json({ error: 'file_name is required' }, { status: 400 })
    }

    // Try heuristic first
    let result = getHeuristicCategory(file_name)
    let source: 'ai' | 'heuristic' | 'none' = result ? 'heuristic' : 'none'

    // Try AI if available
    if (process.env.OPENAI_API_KEY) {
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
        const userPrompt = buildCategorizationPrompt({ file_name, mime_type, text_snippet })

        const completion = await openai.chat.completions.create({
          model: AI_MODEL,
          temperature: 0.3,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: EVIDENCE_CATEGORIZATION_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
        })

        const raw = completion.choices[0]?.message?.content
        if (raw) {
          const parsed = JSON.parse(raw)
          const validated = evidenceCategorySchema.safeParse(parsed)
          if (validated.success && isCategorySafe(validated.data.relevance_note)) {
            result = validated.data
            source = 'ai'
          }
        }
      } catch (err) {
        console.error('[evidence-categorize] AI call failed:', err)
      }
    }

    return NextResponse.json({
      suggestion: result,
      _meta: { source, model: source === 'ai' ? AI_MODEL : null },
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
