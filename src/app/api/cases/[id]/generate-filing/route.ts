import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { generateFilingRequestSchema } from '@/lib/schemas/filing'
import { buildFilingPrompt } from '@/lib/rules/filing-prompts'
import {
  buildAmendedComplaintPrompt,
  buildRemandMotionPrompt,
  amendedComplaintFactsSchema,
  remandMotionFactsSchema,
} from '@/lib/rules/removal-prompts'
import {
  buildDefaultJudgmentPrompt,
  defaultJudgmentFactsSchema,
} from '@/lib/rules/default-judgment-prompts'
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
    const documentType = body.document_type as string | undefined

    let prompt: { system: string; user: string }
    let auditDocType = 'original'

    if (documentType === 'amended_complaint') {
      const parsed = amendedComplaintFactsSchema.safeParse(body.facts)
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Validation failed', details: parsed.error.issues },
          { status: 422 }
        )
      }
      prompt = buildAmendedComplaintPrompt(parsed.data)
      auditDocType = 'amended_complaint'
    } else if (documentType === 'motion_to_remand') {
      const parsed = remandMotionFactsSchema.safeParse(body.facts)
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Validation failed', details: parsed.error.issues },
          { status: 422 }
        )
      }
      prompt = buildRemandMotionPrompt(parsed.data)
      auditDocType = 'motion_to_remand'
    } else if (documentType === 'default_judgment') {
      const parsed = defaultJudgmentFactsSchema.safeParse(body.facts)
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Validation failed', details: parsed.error.issues },
          { status: 422 }
        )
      }
      prompt = buildDefaultJudgmentPrompt(parsed.data)
      auditDocType = 'default_judgment'
    } else {
      // Original filing (petition/answer)
      const parsed = generateFilingRequestSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Validation failed', details: parsed.error.issues },
          { status: 422 }
        )
      }
      const { facts } = parsed.data
      prompt = buildFilingPrompt(facts)
    }

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
        document_type: auditDocType,
        court_type: caseData.court_type,
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
