import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { generateFilingRequestSchema } from '@/lib/schemas/filing'
import { buildFilingPrompt } from '@/lib/rules/filing-prompts'
import { isFilingOutputSafe } from '@/lib/rules/filing-safety'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    // Verify case exists (RLS handles ownership)
    const { data: caseData, error: caseError } = await supabase!
      .from('cases')
      .select('id, role, court_type, county, dispute_type')
      .eq('id', caseId)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const parsed = generateFilingRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 422 }
      )
    }

    const { facts } = parsed.data
    const prompt = buildFilingPrompt(facts)

    const anthropic = new Anthropic()
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: prompt.system,
      messages: [{ role: 'user', content: prompt.user }],
    })

    const draft = message.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n')

    if (!isFilingOutputSafe(draft)) {
      return NextResponse.json(
        { error: 'Generated document did not pass safety review. Please try again.' },
        { status: 422 }
      )
    }

    // Audit event
    await supabase!.from('task_events').insert({
      case_id: caseId,
      kind: 'filing_draft_generated',
      payload: {
        court_type: facts.court_type,
        role: facts.role,
        dispute_type: facts.dispute_type,
      },
    })

    return NextResponse.json({ draft })
  } catch (err) {
    console.error('[generate-filing] Error:', err)
    return NextResponse.json(
      { error: 'Failed to generate document. Please try again.' },
      { status: 500 }
    )
  }
}
