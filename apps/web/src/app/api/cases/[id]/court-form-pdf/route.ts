import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { generateCourtFormPdf, type CourtFormData } from '@/lib/pdf/court-form-pdf'
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase, user } = auth

    const rl = checkRateLimit(user.id, 'court_form_pdf', RATE_LIMITS.standard.maxRequests, RATE_LIMITS.standard.windowMs)
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

    // Load case
    const { data: caseRow, error: caseError } = await supabase
      .from('cases')
      .select('id, jurisdiction, county, court_type, role, dispute_type')
      .eq('id', caseId)
      .single()

    if (caseError || !caseRow) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    // Load the latest generated document draft
    const body = await request.json().catch(() => ({}))
    const documentId = body.document_id as string | undefined

    let draftContent = ''
    let documentTitle = ''

    if (documentId) {
      const { data: doc } = await supabase
        .from('documents')
        .select('content_text, doc_type')
        .eq('id', documentId)
        .eq('case_id', caseId)
        .single()

      if (doc) {
        draftContent = doc.content_text ?? ''
        documentTitle = formatDocType(doc.doc_type)
      }
    }

    if (!draftContent) {
      // Fall back to most recent draft for this case
      const { data: latestDoc } = await supabase
        .from('documents')
        .select('content_text, doc_type')
        .eq('case_id', caseId)
        .eq('status', 'draft')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (!latestDoc?.content_text) {
        return NextResponse.json(
          { error: 'No draft document found. Generate a document first.' },
          { status: 422 }
        )
      }
      draftContent = latestDoc.content_text
      documentTitle = formatDocType(latestDoc.doc_type)
    }

    // Strip annotations section if present
    const annotationIdx = draftContent.indexOf('---ANNOTATIONS---')
    if (annotationIdx > 0) {
      draftContent = draftContent.slice(0, annotationIdx).trim()
    }

    // Load filing facts from the prepare-filing task
    const filingTaskKeys = [
      'prepare_filing', 'pi_filing', 'small_claims_filing',
      'lt_filing', 'contract_filing', 'property_filing',
      'family_filing', 'other_filing', 're_filing', 'business_filing',
    ]
    const { data: filingTask } = await supabase
      .from('tasks')
      .select('metadata')
      .eq('case_id', caseId)
      .in('task_key', filingTaskKeys)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const meta = (filingTask?.metadata ?? {}) as Record<string, unknown>
    const yourInfo = (meta.your_info ?? meta.plaintiff ?? {}) as Record<string, string>
    const opposingRaw = meta.opposing_parties ?? meta.defendants ?? meta.defendant
    const opposingParties = Array.isArray(opposingRaw)
      ? (opposingRaw as Array<Record<string, string>>)
      : opposingRaw
        ? [opposingRaw as Record<string, string>]
        : [{ full_name: 'DEFENDANT' }]

    const formData: CourtFormData = {
      state: caseRow.jurisdiction ?? 'TX',
      county: caseRow.county ?? (meta.county as string) ?? '',
      courtType: caseRow.court_type ?? 'district',
      causeNumber: (meta.cause_number as string) ?? undefined,
      plaintiffName: yourInfo.full_name ?? 'PLAINTIFF',
      plaintiffAddress: yourInfo.address ?? undefined,
      plaintiffCityStateZip: formatCityStateZip(yourInfo),
      defendants: opposingParties.map((p) => ({
        name: p.full_name ?? 'DEFENDANT',
        address: p.address ?? undefined,
        cityStateZip: formatCityStateZip(p),
      })),
      documentTitle: documentTitle || "PLAINTIFF'S ORIGINAL PETITION",
      documentBody: draftContent,
      role: (caseRow.role as 'plaintiff' | 'defendant') ?? 'plaintiff',
      proSe: true,
    }

    const pdfBytes = await generateCourtFormPdf(formData)

    // Audit event
    await supabase.from('task_events').insert({
      case_id: caseId,
      kind: 'court_form_pdf_generated',
      payload: { document_title: formData.documentTitle, court_type: formData.courtType },
    })

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="court-form-${caseId.slice(0, 8)}.pdf"`,
        'Content-Length': String(pdfBytes.length),
      },
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function formatDocType(docType: string): string {
  const labels: Record<string, string> = {
    petition: "PLAINTIFF'S ORIGINAL PETITION",
    complaint: 'COMPLAINT',
    answer: "DEFENDANT'S ORIGINAL ANSWER",
    general_denial: 'GENERAL DENIAL',
    amended_complaint: 'AMENDED COMPLAINT',
    motion_to_compel: 'MOTION TO COMPEL',
    motion_for_continuance: 'MOTION FOR CONTINUANCE',
    settlement_demand: 'SETTLEMENT DEMAND LETTER',
    demand_letter: 'DEMAND LETTER',
  }
  return labels[docType] ?? docType.replace(/_/g, ' ').toUpperCase()
}

function formatCityStateZip(info: Record<string, string>): string | undefined {
  const parts = [info.city, info.state, info.zip].filter(Boolean)
  if (parts.length === 0) return undefined
  if (info.city && info.state) {
    return info.zip ? `${info.city}, ${info.state} ${info.zip}` : `${info.city}, ${info.state}`
  }
  return parts.join(' ')
}
