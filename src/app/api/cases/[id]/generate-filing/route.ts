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
import { buildFamilyFilingPrompt } from '@/lib/rules/family-filing-prompts'
import { familyFilingFactsSchema } from '@/lib/schemas/family-filing'
import {
  temporaryOrdersFactsSchema,
  buildTemporaryOrdersPrompt,
} from '@/lib/motions/configs/temporary-orders'
import {
  protectiveOrderFactsSchema,
  buildProtectiveOrderPrompt,
} from '@/lib/motions/configs/protective-order'
import {
  motionToModifyFactsSchema,
  buildMotionToModifyPrompt,
} from '@/lib/motions/configs/motion-to-modify'
import {
  motionForEnforcementFactsSchema,
  buildMotionForEnforcementPrompt,
} from '@/lib/motions/configs/motion-for-enforcement'
import {
  motionForMediationFactsSchema,
  buildMotionForMediationPrompt,
} from '@/lib/motions/configs/motion-for-mediation'
import { buildSmallClaimsFilingPrompt } from '@/lib/rules/small-claims-filing-prompts'
import { smallClaimsFilingFactsSchema } from '@/lib/schemas/small-claims-filing'
import { demandLetterFactsSchema, buildDemandLetterPrompt } from '@/lib/rules/demand-letter-prompts'
import { buildLandlordTenantFilingPrompt } from '@/lib/rules/landlord-tenant-filing-prompts'
import { landlordTenantFilingFactsSchema } from '@/lib/schemas/landlord-tenant-filing'
import { ltDemandLetterFactsSchema, buildLtDemandLetterPrompt } from '@/lib/rules/landlord-tenant-demand-letter-prompts'
import { debtValidationLetterFactsSchema, buildDebtValidationLetterPrompt } from '@/lib/rules/debt-validation-letter-prompts'
import { debtDefenseFactsSchema, buildDebtDefensePrompt } from '@/lib/rules/debt-defense-prompts'
import { piDemandLetterFactsSchema, buildPiDemandLetterPrompt } from '@/lib/rules/pi-demand-letter-prompts'
import { piPetitionFactsSchema, buildPiPetitionPrompt } from '@/lib/rules/pi-petition-prompts'
import { propertyFilingFactsSchema, buildPropertyFilingPrompt } from '@/lib/rules/property-filing-prompts'
import { contractFilingFactsSchema, buildContractFilingPrompt } from '@/lib/rules/contract-filing-prompts'
import { contractDemandLetterFactsSchema, buildContractDemandLetterPrompt } from '@/lib/rules/contract-demand-letter-prompts'
import { otherFilingFactsSchema, buildOtherFilingPrompt } from '@/lib/rules/other-filing-prompts'
import { otherDemandLetterFactsSchema, buildOtherDemandLetterPrompt } from '@/lib/rules/other-demand-letter-prompts'
import { propertyDemandLetterFactsSchema, buildPropertyDemandLetterPrompt } from '@/lib/rules/property-demand-letter-prompts'
import { piSettlementFactsSchema, buildPiSettlementPrompt } from '@/lib/rules/pi-settlement-prompts'
import { isFilingOutputSafe } from '@/lib/rules/filing-safety'
import { validateFactsObject } from '@/lib/ai/input-validation'
import { validateAIOutput } from '@/lib/ai/output-validation'
import { safeError } from '@/lib/security/safe-log'
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'
import { logger, metrics, METRIC } from '@/lib/observability'

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
  // Family filing types — all 7 sub-types use the same schema/prompt builder
  family_divorce: {
    schema: familyFilingFactsSchema,
    buildPrompt: buildFamilyFilingPrompt as unknown as RegistryEntry['buildPrompt'],
  },
  family_custody: {
    schema: familyFilingFactsSchema,
    buildPrompt: buildFamilyFilingPrompt as unknown as RegistryEntry['buildPrompt'],
  },
  family_child_support: {
    schema: familyFilingFactsSchema,
    buildPrompt: buildFamilyFilingPrompt as unknown as RegistryEntry['buildPrompt'],
  },
  family_visitation: {
    schema: familyFilingFactsSchema,
    buildPrompt: buildFamilyFilingPrompt as unknown as RegistryEntry['buildPrompt'],
  },
  family_spousal_support: {
    schema: familyFilingFactsSchema,
    buildPrompt: buildFamilyFilingPrompt as unknown as RegistryEntry['buildPrompt'],
  },
  family_protective_order: {
    schema: familyFilingFactsSchema,
    buildPrompt: buildFamilyFilingPrompt as unknown as RegistryEntry['buildPrompt'],
  },
  family_modification: {
    schema: familyFilingFactsSchema,
    buildPrompt: buildFamilyFilingPrompt as unknown as RegistryEntry['buildPrompt'],
  },
  // Family motions
  temporary_orders: {
    schema: temporaryOrdersFactsSchema,
    buildPrompt: buildTemporaryOrdersPrompt as unknown as RegistryEntry['buildPrompt'],
  },
  protective_order: {
    schema: protectiveOrderFactsSchema,
    buildPrompt: buildProtectiveOrderPrompt as unknown as RegistryEntry['buildPrompt'],
  },
  motion_to_modify: {
    schema: motionToModifyFactsSchema,
    buildPrompt: buildMotionToModifyPrompt as unknown as RegistryEntry['buildPrompt'],
  },
  motion_for_enforcement: {
    schema: motionForEnforcementFactsSchema,
    buildPrompt: buildMotionForEnforcementPrompt as unknown as RegistryEntry['buildPrompt'],
  },
  motion_for_mediation: {
    schema: motionForMediationFactsSchema,
    buildPrompt: buildMotionForMediationPrompt as unknown as RegistryEntry['buildPrompt'],
  },
  // Small claims filing types — all 8 sub-types use the same schema/prompt builder
  small_claims_security_deposit: {
    schema: smallClaimsFilingFactsSchema,
    buildPrompt: buildSmallClaimsFilingPrompt as unknown as RegistryEntry['buildPrompt'],
  },
  small_claims_breach_of_contract: {
    schema: smallClaimsFilingFactsSchema,
    buildPrompt: buildSmallClaimsFilingPrompt as unknown as RegistryEntry['buildPrompt'],
  },
  small_claims_consumer_refund: {
    schema: smallClaimsFilingFactsSchema,
    buildPrompt: buildSmallClaimsFilingPrompt as unknown as RegistryEntry['buildPrompt'],
  },
  small_claims_property_damage: {
    schema: smallClaimsFilingFactsSchema,
    buildPrompt: buildSmallClaimsFilingPrompt as unknown as RegistryEntry['buildPrompt'],
  },
  small_claims_car_accident: {
    schema: smallClaimsFilingFactsSchema,
    buildPrompt: buildSmallClaimsFilingPrompt as unknown as RegistryEntry['buildPrompt'],
  },
  small_claims_neighbor_dispute: {
    schema: smallClaimsFilingFactsSchema,
    buildPrompt: buildSmallClaimsFilingPrompt as unknown as RegistryEntry['buildPrompt'],
  },
  small_claims_unpaid_loan: {
    schema: smallClaimsFilingFactsSchema,
    buildPrompt: buildSmallClaimsFilingPrompt as unknown as RegistryEntry['buildPrompt'],
  },
  small_claims_other: {
    schema: smallClaimsFilingFactsSchema,
    buildPrompt: buildSmallClaimsFilingPrompt as unknown as RegistryEntry['buildPrompt'],
  },
  // Demand letter
  demand_letter: {
    schema: demandLetterFactsSchema,
    buildPrompt: buildDemandLetterPrompt as unknown as RegistryEntry['buildPrompt'],
  },
  // Landlord-tenant filing types — all 8 sub-types use the same schema/prompt builder
  landlord_tenant_eviction: {
    schema: landlordTenantFilingFactsSchema,
    buildPrompt: buildLandlordTenantFilingPrompt as unknown as RegistryEntry['buildPrompt'],
  },
  landlord_tenant_nonpayment: {
    schema: landlordTenantFilingFactsSchema,
    buildPrompt: buildLandlordTenantFilingPrompt as unknown as RegistryEntry['buildPrompt'],
  },
  landlord_tenant_security_deposit: {
    schema: landlordTenantFilingFactsSchema,
    buildPrompt: buildLandlordTenantFilingPrompt as unknown as RegistryEntry['buildPrompt'],
  },
  landlord_tenant_property_damage: {
    schema: landlordTenantFilingFactsSchema,
    buildPrompt: buildLandlordTenantFilingPrompt as unknown as RegistryEntry['buildPrompt'],
  },
  landlord_tenant_repair_maintenance: {
    schema: landlordTenantFilingFactsSchema,
    buildPrompt: buildLandlordTenantFilingPrompt as unknown as RegistryEntry['buildPrompt'],
  },
  landlord_tenant_lease_termination: {
    schema: landlordTenantFilingFactsSchema,
    buildPrompt: buildLandlordTenantFilingPrompt as unknown as RegistryEntry['buildPrompt'],
  },
  landlord_tenant_habitability: {
    schema: landlordTenantFilingFactsSchema,
    buildPrompt: buildLandlordTenantFilingPrompt as unknown as RegistryEntry['buildPrompt'],
  },
  landlord_tenant_other: {
    schema: landlordTenantFilingFactsSchema,
    buildPrompt: buildLandlordTenantFilingPrompt as unknown as RegistryEntry['buildPrompt'],
  },
  // LT demand letter
  landlord_tenant_demand_letter: {
    schema: ltDemandLetterFactsSchema,
    buildPrompt: buildLtDemandLetterPrompt as unknown as RegistryEntry['buildPrompt'],
  },
  // Debt defense
  debt_validation_letter: {
    schema: debtValidationLetterFactsSchema,
    buildPrompt: buildDebtValidationLetterPrompt as unknown as RegistryEntry['buildPrompt'],
  },
  debt_defense_general_denial: {
    schema: debtDefenseFactsSchema,
    buildPrompt: buildDebtDefensePrompt as unknown as RegistryEntry['buildPrompt'],
  },
  debt_defense_specific_answer: {
    schema: debtDefenseFactsSchema,
    buildPrompt: buildDebtDefensePrompt as unknown as RegistryEntry['buildPrompt'],
  },
  // Personal injury
  pi_demand_letter: {
    schema: piDemandLetterFactsSchema,
    buildPrompt: buildPiDemandLetterPrompt as unknown as RegistryEntry['buildPrompt'],
  },
  pi_petition: {
    schema: piPetitionFactsSchema,
    buildPrompt: buildPiPetitionPrompt as unknown as RegistryEntry['buildPrompt'],
  },
  pi_settlement_agreement: {
    schema: piSettlementFactsSchema,
    buildPrompt: buildPiSettlementPrompt as unknown as RegistryEntry['buildPrompt'],
  },
  // Property dispute filing
  property_petition: {
    schema: propertyFilingFactsSchema,
    buildPrompt: buildPropertyFilingPrompt as unknown as RegistryEntry['buildPrompt'],
  },
  property_demand_letter: {
    schema: propertyDemandLetterFactsSchema,
    buildPrompt: buildPropertyDemandLetterPrompt as unknown as RegistryEntry['buildPrompt'],
  },
  // Contract dispute filing
  contract_petition: {
    schema: contractFilingFactsSchema,
    buildPrompt: buildContractFilingPrompt as unknown as RegistryEntry['buildPrompt'],
  },
  contract_demand_letter: {
    schema: contractDemandLetterFactsSchema,
    buildPrompt: buildContractDemandLetterPrompt as unknown as RegistryEntry['buildPrompt'],
  },
  // Other dispute filing
  other_petition: {
    schema: otherFilingFactsSchema,
    buildPrompt: buildOtherFilingPrompt as unknown as RegistryEntry['buildPrompt'],
  },
  other_demand_letter: {
    schema: otherDemandLetterFactsSchema,
    buildPrompt: buildOtherDemandLetterPrompt as unknown as RegistryEntry['buildPrompt'],
  },
}

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now()
  try {
    const { id: caseId } = await params
    metrics.increment(METRIC.AI_GENERATION_REQUEST)
    logger.info('ai.generate-filing started', { caseId })
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase, user } = auth

    const rl = checkRateLimit(user.id, 'ai', RATE_LIMITS.ai.maxRequests, RATE_LIMITS.ai.windowMs)
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

    // Verify case exists (RLS handles ownership)
    const { data: caseData, error: caseError } = await supabase
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

    // Fetch authority citations if provided
    const authorityClusterIds = body.authority_cluster_ids as number[] | undefined
    let authorityCitationBlock = ''

    if (authorityClusterIds && authorityClusterIds.length > 0) {
      const { data: authorities } = await supabase
        .from('case_authorities')
        .select(`
          cluster_id,
          cl_case_clusters!inner (
            case_name,
            court_name,
            date_filed,
            citations,
            snippet
          )
        `)
        .eq('case_id', caseId)
        .in('cluster_id', authorityClusterIds)

      if (authorities && authorities.length > 0) {
        const citationLines = authorities.map((a: any) => {
          const c = a.cl_case_clusters
          const cite = (c.citations as string[])?.length > 0
            ? (c.citations as string[])[0]
            : c.case_name
          const snippetText = c.snippet
            ? `\n  Key passage: "${(c.snippet as string).replace(/<[^>]*>/g, '').trim().slice(0, 300)}"`
            : ''
          return `- ${c.case_name}, ${cite} (${c.court_name ?? 'Court unknown'}, ${c.date_filed ?? 'date unknown'})${snippetText}`
        })

        authorityCitationBlock = `\n\nCASE AUTHORITIES TO CITE:\nThe user has selected these cases to support their position. Weave relevant citations naturally into the document where they strengthen the legal arguments. Use standard legal citation format (e.g., "See *Case Name*, Citation."). Do NOT fabricate additional citations.\n\n${citationLines.join('\n')}\n`
      }
    }

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

      // Prompt injection check on user-provided facts
      const inputCheck = validateFactsObject(parsed.data as Record<string, unknown>)
      if (!inputCheck.safe) {
        return NextResponse.json(
          { error: "Some of your input couldn't be processed. Please review and try again." },
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

      // Prompt injection check on user-provided facts
      const inputCheck = validateFactsObject(facts as unknown as Record<string, unknown>)
      if (!inputCheck.safe) {
        return NextResponse.json(
          { error: "Some of your input couldn't be processed. Please review and try again." },
          { status: 422 }
        )
      }

      prompt = buildFilingPrompt(facts)
    }

    if (authorityCitationBlock) {
      prompt = {
        system: prompt.system,
        user: prompt.user + authorityCitationBlock,
      }
    }

    const anthropic = new Anthropic()
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: prompt.system,
      messages: [{ role: 'user', content: prompt.user }],
    })

    const fullText = message.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n')

    const annotationMarker = '---ANNOTATIONS---'
    const markerIndex = fullText.indexOf(annotationMarker)

    let draft: string
    let annotations: { id: number; section: string; text: string }[] = []

    if (markerIndex !== -1) {
      draft = fullText.substring(0, markerIndex).trim()
      const annotationText = fullText.substring(markerIndex + annotationMarker.length).trim()
      const lines = annotationText.split('\n').filter(line => line.trim())
      for (const line of lines) {
        const match = line.match(/^\[(\d+)\]\s+([^:]+):\s+(.+)$/)
        if (match) {
          annotations.push({
            id: parseInt(match[1]),
            section: match[2].trim(),
            text: match[3].trim(),
          })
        }
      }
    } else {
      draft = fullText
    }

    if (!isFilingOutputSafe(draft)) {
      return NextResponse.json(
        { error: 'Generated document did not pass safety review. Please try again.' },
        { status: 422 }
      )
    }

    // AI output validation — reject dangerous content, flag citations for review
    const outputCheck = validateAIOutput(draft)
    if (!outputCheck.safe) {
      return NextResponse.json(
        { error: 'Generated document did not pass safety review. Please try again.' },
        { status: 422 }
      )
    }
    if (outputCheck.sanitized) {
      draft = outputCheck.sanitized
    }

    // Audit event
    await supabase.from('task_events').insert({
      case_id: caseId,
      kind: 'filing_draft_generated',
      payload: {
        document_type: auditDocType,
        court_type: caseData.court_type,
      },
    })

    const durationMs = Date.now() - startTime
    metrics.increment(METRIC.AI_GENERATION_SUCCESS)
    metrics.timing(METRIC.AI_GENERATION_DURATION, durationMs, { document_type: auditDocType })
    logger.info('ai.generate-filing succeeded', { caseId, auditDocType, durationMs })

    return NextResponse.json({ draft, annotations })
  } catch (err) {
    const durationMs = Date.now() - startTime
    metrics.increment(METRIC.AI_GENERATION_ERROR)
    logger.error('ai.generate-filing failed', err instanceof Error ? err : undefined, { durationMs })
    safeError('generate-filing', err)
    return NextResponse.json(
      { error: 'Failed to generate document. Please try again.' },
      { status: 500 }
    )
  }
}
