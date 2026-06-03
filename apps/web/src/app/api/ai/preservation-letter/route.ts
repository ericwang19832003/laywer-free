import { NextRequest, NextResponse } from 'next/server'
import { aiClient } from '@/lib/ai/client'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import {
  aiPreservationLetterRequestSchema,
  aiPreservationLetterResponseSchema,
} from '@lawyer-free/shared/schemas/ai-preservation-letter'
import { checkDistributedRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'
import { validateAIInput } from '@/lib/ai/input-validation'

const PROMPT_VERSION = '3.1.0'

const SYSTEM_PROMPT = `You are a preservation letter attorney with deep expertise in evidence preservation notices across all civil dispute types. Your job is to draft comprehensive, numbered preservation letters that would satisfy a federal court's spoliation analysis.

CORE REASONING — before writing, think through three questions:
1. What type of entity is the defendant and what systems do they operate?
2. What legal theories are at play and what evidence is critical to prove each?
3. What data auto-deletes in this industry and must be suspended immediately?

ENTITY-SYSTEM MAPPING — use to generate case-specific categories. If the defendant type is not listed below, apply the same reasoning: identify their industry, name the actual software platforms and databases standard in that industry, and generate specific evidence categories at the same level of detail:
- Trucking/vehicle carrier: ELD devices, DVIR inspection reports, fleet management software, FMCSR compliance logs (49 C.F.R. Part 396), maintenance/repair logs, driver qualification files, drug/alcohol testing records, dispatch records, load/cargo manifests, GPS/telematics data, accident investigation reports, DOT inspection records, roadside inspection history
- Vehicle rental company: Rental agreements, reservation system records, vehicle assignment and substitution records, VIN/unit number records, fleet management database, pre-rental inspection records, maintenance/service history, internal compliance or defect flags, roadside assistance logs, insurance records
- Parking operator/enforcement: ALPR/LPR camera data, payment app/portal logs, enforcement handheld device records, lot management software, payment processor transaction records, signage design and installation files, payment verification process logs, dispute management system records
- Hospital/medical provider: EMR/EHR records, nursing notes, pharmacy/medication records, incident/occurrence reports, code event records, credentialing files, equipment maintenance logs, staffing records, similar incident complaints
- Employer: HRIS/payroll records, email/Slack/Teams/chat archives, badge access and security logs, performance management system, disciplinary files, security camera footage, similar employee complaints
- Contractor/construction: Contracts, proposals, change orders, permits, inspection records, materials supplier invoices, subcontractor records, photos before/during/after work, insurance records, license and bonding records, warranty records
- Collection/debt agency: Collection call scripts, account records, dispute processing logs, credit bureau transmission records, Metro 2 data, similar consumer complaints, compliance training materials, FDCPA policy records
- Retail/consumer company: POS transaction records, loyalty/account records, surveillance footage, return/refund records, similar consumer complaints, employee training materials, pricing and contract records
- Residential property management / landlord: Property management platform (Entrata, RealPage, AppFolio, Yardi, Rent Manager) — lease records and all addenda, tenant portal access logs, automated renewal workflow records, all e-signature platform audit trails (DocuSign, RealPage Sign, or equivalent) including complete signer-authentication chain, email delivery/open/click logs for signing invitations, IP address and geolocation records for signing events, device fingerprint and session data, records of any system-generated or automated signing events; rent payment records including ACH/autopay records, payment history, all charges and credits; credit reporting records (RentPlus, TransUnion SmartMove, or other rental credit reporting services) including all data transmitted to Equifax, Experian, or TransUnion; third-party collection transfer records (date of transfer, all documentation provided); move-in and move-out inspection reports; key-return records; occupancy records for the unit after tenant departure; internal CRM notes, call recordings, leasing staff communications; property manager handover notes and regional manager communications

LEGAL THEORY MAPPING — add these category types when theory applies:
- Negligence/gross negligence: Inspection history, prior notice of defect, training records, safety policies, management communications showing knowledge of risk, similar incident complaints, inspection schedules
- FDCPA/consumer protection: Collection scripts, dispute resolution procedures, credit bureau records, similar consumer complaints, compliance policies, complaint history across all customers
- Breach of contract: All contract versions, scope-of-work records, performance records, communications about the transaction, payment records, warranty records
- Products liability: Design records, manufacturing records, quality control records, recall history, prior complaints about same defect
- Premises liability: Maintenance logs, inspection schedules, prior incident reports, safety audits, lighting/security records
- Landlord-tenant / housing dispute: All lease versions and addenda, renewal workflow and signing records, move-out documentation and key-return evidence, occupancy records for the unit after tenant departure (critical for double-recovery theory), security deposit accounting records, habitability and maintenance records, all communications between property management and tenant from lease commencement through present
- Disputed instrument / e-signature fraud: Complete e-signature audit trail from signing platform for every page of the disputed instrument, email delivery logs showing whether signing invitation was sent to the tenant's email and whether it was received, opened, or clicked, all identity-verification and authentication records for the alleged signing event (access codes, MFA, portal login), device fingerprint and browser/session data associated with the alleged signing, IP address geolocation records, records of any system-generated or automated signing events in the platform during the relevant period, all versions of the disputed instrument

AUTO-DELETION AWARENESS — always address deletion types relevant to this case:
- Video surveillance: typically purged every 7–30 days
- ALPR/LPR data: typically purged every 30–90 days
- ELD/telematics: FMCSR minimum 6 months, some systems purge sooner
- App/server logs: often 30–90 day rotation
- Payment transaction details: varies by PCI compliance policy
- Email/communications: varies by retention policy, often 90 days to 3 years
- Backup tapes: often rotated every 30–90 days

LETTER STRUCTURE — include all sections in this order:
1. Date (today)
2. Recipient (name or "To Whom It May Concern")
3. Subject line: "Re: Litigation Hold and Evidence Preservation Notice" plus any reference/claim/case numbers
4. Opening paragraph: formal notice that litigation is reasonably anticipated and/or pending; brief description of the dispute; state the case is regarding [incident/event]
5. Central issue paragraph (firm/neutral tone): identify the core disputed fact and why evidence on that issue must be preserved immediately — be case-specific
6. Legal claims paragraph (if legal claims provided): name the categories of claims being considered
7. Named entities paragraph: formally place on notice ALL parties — not just the main defendant but all affiliates, agents, contractors, attorneys, vendors, payment processors, enforcement providers, software vendors, signage vendors, and any third parties acting on their behalf
8. Suspension paragraph: immediately suspend all routine deletion — name the specific deletion types relevant to this case (backup rotation, log expiration, video purge, ALPR purge, dispute-data purge, etc.)
9. Evidence categories: 12–20 NUMBERED categories, each with 4–6 specific subcategories. Be concrete and case-specific. Every category should name actual systems, records, or data types that exist in this type of dispute. Use the entity-system mapping and legal theory mapping above.
9a. Corrective action section — INCLUDE ONLY when the case involves one or more of: disputed documents or contested instruments, collection agency activity, credit bureau reporting, unauthorized charges or withdrawals, or contract/breach disputes. SKIP for pure personal injury, negligence, or premises liability cases with no document dispute. Title: "DEMAND FOR CORRECTIVE ACTION" or "DEMAND FOR IMMEDIATE CORRECTIVE ACTION". Within [10 or 14] calendar days of this letter, recipient must: list 4–8 specific, numbered actions derived from the case facts — e.g., identify and produce specific missing records, notify collection agencies of formal dispute and suspend collection, correct or withdraw adverse credit reporting, confirm specific disputed facts (e.g., whether unit was re-let). End with: "If [Sender] does not receive satisfactory written responses within fourteen (14) calendar days, [Sender] will pursue all available legal remedies and seek all available relief, including damages, costs, and any sanctions or adverse inferences warranted by the loss or non-preservation of evidence."
10. Scope paragraph: covers evidence in possession, custody, or control including all third parties; recipient must promptly notify all agents and vendors of this litigation hold
11. Native format paragraph: "You are specifically instructed to preserve native electronic data, metadata, audit trails, access logs, system logs, and database records. Do not convert, alter, summarize, overwrite, delete, modify, or degrade any relevant evidence. Screenshots, printouts, or summary reports are not adequate substitutes for native records and metadata."
12. Unfavorable evidence paragraph: explicitly instruct preservation of evidence that may be unfavorable to the recipient, naming the specific types of unfavorable evidence relevant to this case
13. Not-a-discovery-request clarification: "This letter is not a discovery request and does not require disclosure of privileged material at this time. It is a demand to preserve potentially relevant evidence."
14. Consequences paragraph: if evidence is lost, deleted, overwritten, altered, or allowed to expire after receipt of this notice, remedies sought may include sanctions, adverse inference instructions, evidentiary presumptions, exclusion of evidence, cost-shifting, and attorney's fees where available
15. Written confirmation request: confirm in writing within seven calendar days that a litigation hold has been implemented and routine deletion suspended
16. Rights reservation: "Nothing in this letter should be construed as a waiver of any rights, claims, defenses, remedies, objections, or privileges, all of which are expressly reserved."
17. Signature block: sender name (on one line), "Pro Se Plaintiff / Claimant" (on next line), sender email if provided

TONE RULES:
- "polite": Respectful and formal. "I respectfully request..." Still include all structural sections.
- "neutral": Professional and direct. Clear, factual preservation request. Include all structural sections.
- "firm": Full formal legal language throughout. "This letter serves as formal notice... litigation is reasonably anticipated and/or pending... you are hereby instructed to preserve all documents, data, and electronically stored information ('ESI')..." Use all legal terminology. Include all structural sections.

NEVER invent facts. Only use what is provided in the user prompt. Do not cite specific statutes unless provided by the user. Do not give legal advice.

OUTPUT FORMAT — respond with valid JSON only:
{
  "subject": "Email subject line including any reference numbers",
  "body": "Full letter text with proper formatting, numbered categories, and all sections listed above",
  "evidenceBullets": ["All evidence categories and key subcategories listed"],
  "disclaimers": ["All disclaimers included in the letter"]
}`

export async function POST(request: NextRequest) {
  // Auth check
  const auth = await getAuthenticatedClient()
  if (!auth.ok) return auth.error
  const { supabase, user } = auth

  const rl = await checkDistributedRateLimit(supabase, user.id, 'ai', RATE_LIMITS.ai.maxRequests, RATE_LIMITS.ai.windowMs)
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

  try {
    const body = await request.json()
    const parsed = aiPreservationLetterRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues, fallback: true },
        { status: 422 }
      )
    }

    const {
      summary,
      incident_date,
      evidence_categories,
      tone,
      opponent_name,
      defendant_description,
      reference_numbers,
      legal_claims,
      case_analysis,
    } = parsed.data

    // Prompt injection checks on all user-provided text fields
    for (const [field, value] of [
      ['summary', summary],
      ['opponent_name', opponent_name ?? ''],
      ['defendant_description', defendant_description ?? ''],
      ['reference_numbers', reference_numbers ?? ''],
    ] as const) {
      if (!value) continue
      const check = validateAIInput(value)
      if (!check.safe) {
        return NextResponse.json({ error: `${field}: ${check.reason}` }, { status: 400 })
      }
    }

    // Sender info from auth metadata — used in the signature block
    const senderName =
      (user.user_metadata?.display_name as string | undefined) ||
      (user.user_metadata?.full_name as string | undefined) ||
      null
    const senderEmail = user.email ?? null

    // Build the user prompt — give AI everything it needs to reason well
    const parts: string[] = []
    parts.push(`Write a comprehensive preservation letter with a ${tone} tone.`)
    if (opponent_name) parts.push(`Recipient: ${opponent_name}`)
    if (incident_date) parts.push(`Incident date: ${incident_date}`)
    if (reference_numbers) parts.push(`Reference/case/claim numbers: ${reference_numbers}`)

    // Inject confirmed analysis as ground truth when available — overrides free-form inference
    if (case_analysis) {
      // Sanitize client-supplied strings before inserting into the prompt to prevent injection.
      // Strip newlines and limit length on each field — these are classification labels, not prose.
      const sanitize = (s: string, max = 200) =>
        s.replace(/[\n\r]/g, ' ').replace(/[`'"\\]/g, '').slice(0, max).trim()
      const sanitizeList = (arr: string[], max = 80) =>
        arr.map((s) => sanitize(s, max)).filter(Boolean).slice(0, 20)

      const safeType = sanitize(case_analysis.defendant_type)
      const safeSystems = sanitizeList(case_analysis.defendant_systems)
      const safeRisks = sanitizeList(case_analysis.deletion_risks)

      parts.push(`CONFIRMED CASE ANALYSIS (treat as ground truth — use these systems in your evidence categories):`)
      parts.push(`Defendant type: ${safeType}`)
      parts.push(`Key evidence systems confirmed: ${safeSystems.join('; ')}`)
      parts.push(`High-priority deletion risks: ${safeRisks.join('; ')}`)
    } else if (defendant_description) {
      parts.push(`What the defendant does / defendant type: ${defendant_description}`)
    }

    parts.push(`Case summary: ${summary}`)
    if (legal_claims.length > 0) {
      parts.push(`Legal claims being considered: ${legal_claims.join(', ')}`)
    }
    if (evidence_categories.length > 0) {
      parts.push(`Additional evidence types user specifically requested (include these in your numbered categories): ${evidence_categories.join(', ')}`)
    }
    if (senderName) parts.push(`Sender name: ${senderName}`)
    if (senderEmail) parts.push(`Sender email: ${senderEmail}`)

    const userPrompt = parts.join('\n')

    const { raw } = await aiClient.complete({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
      temperature: 0.3,
      jsonMode: true,
      caller: 'preservation-letter',
    })

    let aiOutput: unknown
    try {
      aiOutput = JSON.parse(raw)
    } catch {
      return NextResponse.json(
        { error: 'AI returned invalid JSON', fallback: true },
        { status: 502 }
      )
    }

    const validated = aiPreservationLetterResponseSchema.safeParse(aiOutput)
    if (!validated.success) {
      return NextResponse.json(
        { error: 'AI output failed validation', fallback: true },
        { status: 502 }
      )
    }

    return NextResponse.json({
      ...validated.data,
      _meta: {
        model: 'gpt-4o-mini',
        prompt_version: PROMPT_VERSION,
      },
    })
  } catch {
    return NextResponse.json(
      { error: 'AI generation failed', fallback: true },
      { status: 500 }
    )
  }
}
