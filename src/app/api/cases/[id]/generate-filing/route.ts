import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { ZodType } from 'zod'
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
import {
  motionToCompelFactsSchema,
  buildMotionToCompelPrompt,
} from '@/lib/motions/configs/motion-to-compel'
import {
  summaryJudgmentFactsSchema,
  buildSummaryJudgmentPrompt,
} from '@/lib/motions/configs/motion-summary-judgment'
import {
  settlementDemandFactsSchema,
  buildSettlementDemandPrompt,
} from '@/lib/motions/configs/settlement-demand'
import {
  continuanceFactsSchema,
  buildContinuancePrompt,
} from '@/lib/motions/configs/motion-continuance'
import {
  mtdResponseFactsSchema,
  buildMtdResponsePrompt,
} from '@/lib/motions/configs/mtd-response'
import {
  noticeOfAppealFactsSchema,
  buildNoticeOfAppealPrompt,
} from '@/lib/motions/configs/notice-of-appeal'
import {
  appellateBriefFactsSchema,
  buildAppellateBriefPrompt,
} from '@/lib/motions/configs/appellate-brief'
import { isFilingOutputSafe } from '@/lib/rules/filing-safety'

/* ------------------------------------------------------------------ */
/*  Motion registry — add new motion types here instead of if/else    */
/* ------------------------------------------------------------------ */

interface RegistryEntry {
  schema: ZodType
  buildPrompt: (facts: Record<string, unknown>) => { system: string; user: string }
}

// Each buildPrompt expects its own typed facts, but after Zod validation
// the data matches — the `unknown` cast bridges the generic registry type.
const MOTION_REGISTRY: Record<string, RegistryEntry> = {
  amended_complaint: {
    schema: amendedComplaintFactsSchema,
    buildPrompt: buildAmendedComplaintPrompt as unknown as RegistryEntry['buildPrompt'],
  },
  motion_to_remand: {
    schema: remandMotionFactsSchema,
    buildPrompt: buildRemandMotionPrompt as unknown as RegistryEntry['buildPrompt'],
  },
  default_judgment: {
    schema: defaultJudgmentFactsSchema,
    buildPrompt: buildDefaultJudgmentPrompt as unknown as RegistryEntry['buildPrompt'],
  },
  motion_to_compel: {
    schema: motionToCompelFactsSchema,
    buildPrompt: buildMotionToCompelPrompt as unknown as RegistryEntry['buildPrompt'],
  },
  motion_summary_judgment: {
    schema: summaryJudgmentFactsSchema,
    buildPrompt: buildSummaryJudgmentPrompt as unknown as RegistryEntry['buildPrompt'],
  },
  settlement_demand: {
    schema: settlementDemandFactsSchema,
    buildPrompt: buildSettlementDemandPrompt as unknown as RegistryEntry['buildPrompt'],
  },
  motion_continuance: {
    schema: continuanceFactsSchema,
    buildPrompt: buildContinuancePrompt as unknown as RegistryEntry['buildPrompt'],
  },
  mtd_response: {
    schema: mtdResponseFactsSchema,
    buildPrompt: buildMtdResponsePrompt as unknown as RegistryEntry['buildPrompt'],
  },
  notice_of_appeal: {
    schema: noticeOfAppealFactsSchema,
    buildPrompt: buildNoticeOfAppealPrompt as unknown as RegistryEntry['buildPrompt'],
  },
  appellate_brief: {
    schema: appellateBriefFactsSchema,
    buildPrompt: buildAppellateBriefPrompt as unknown as RegistryEntry['buildPrompt'],
  },
}

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

    if (documentType && MOTION_REGISTRY[documentType]) {
      const handler = MOTION_REGISTRY[documentType]
      const parsed = handler.schema.safeParse(body.facts)
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Validation failed', details: parsed.error.issues },
          { status: 422 }
        )
      }
      prompt = handler.buildPrompt(parsed.data as Record<string, unknown>)
      auditDocType = documentType
    } else {
      // Original filing (petition/answer) — uses generateFilingRequestSchema
      // which validates the whole body (not body.facts), so it stays separate.
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
