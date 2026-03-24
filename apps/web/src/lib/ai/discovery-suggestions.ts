import { z } from 'zod'

// --- Schema ---
export const discoverySuggestionSchema = z.object({
  title: z.string().min(1).max(200),
  items: z.array(z.object({
    item_type: z.enum(['rfp', 'rog', 'rfa']),
    prompt_text: z.string().min(1).max(1000),
  })).min(1),
})

export type DiscoverySuggestion = z.infer<typeof discoverySuggestionSchema>

// --- Static discovery packs by dispute type ---
type DiscoveryItem = DiscoverySuggestion['items'][number]

export function buildStaticDiscoveryPack(input: {
  dispute_type: string
}): DiscoverySuggestion {
  const type = input.dispute_type.toLowerCase()

  const packs: Record<string, { title: string; items: DiscoveryItem[] }> = {
    debt: {
      title: 'Debt Defense Interrogatories & Document Requests',
      items: [
        { item_type: 'rog', prompt_text: 'Identify the original creditor and every subsequent assignee of the alleged debt, including dates of assignment.' },
        { item_type: 'rog', prompt_text: 'State the exact amount claimed as owed, broken down by principal, interest, fees, and costs.' },
        { item_type: 'rfp', prompt_text: 'Produce the original signed credit agreement or contract between the consumer and the original creditor.' },
        { item_type: 'rfp', prompt_text: 'Produce a complete payment history showing every payment received and every charge applied to the account.' },
        { item_type: 'rfa', prompt_text: 'Admit that no signed written agreement exists between the plaintiff and the defendant.' },
        { item_type: 'rfp', prompt_text: 'Produce all documents evidencing the chain of assignment from the original creditor to the current plaintiff.' },
      ],
    },
    landlord_tenant: {
      title: 'Landlord-Tenant Discovery Pack',
      items: [
        { item_type: 'rfp', prompt_text: 'Produce the complete lease agreement, including all addenda, amendments, and renewal notices.' },
        { item_type: 'rog', prompt_text: 'Describe all maintenance and repair requests received from the tenant, including dates and responses.' },
        { item_type: 'rfp', prompt_text: 'Produce all photographs, videos, or inspection reports of the property taken at move-in and move-out.' },
        { item_type: 'rog', prompt_text: 'Itemize all deductions made from the security deposit, including amounts and reasons for each deduction.' },
        { item_type: 'rfa', prompt_text: 'Admit that the landlord received written notice of the needed repairs at least 30 days before this action was filed.' },
      ],
    },
    small_claims: {
      title: 'Small Claims Discovery Requests',
      items: [
        { item_type: 'rfp', prompt_text: 'Produce all contracts, invoices, and receipts related to the transaction at issue.' },
        { item_type: 'rog', prompt_text: 'State the amount you claim is owed and explain how that amount was calculated.' },
        { item_type: 'rfp', prompt_text: 'Produce all written communications (emails, texts, letters) between the parties regarding this dispute.' },
      ],
    },
    personal_injury: {
      title: 'Personal Injury Interrogatories & Document Requests',
      items: [
        { item_type: 'rog', prompt_text: 'Describe in detail how the incident occurred, including the date, time, location, and weather conditions.' },
        { item_type: 'rfp', prompt_text: 'Produce all incident or accident reports filed by any party, witness, or law enforcement agency.' },
        { item_type: 'rfp', prompt_text: 'Produce all insurance policies that may provide coverage for the claims in this action.' },
        { item_type: 'rog', prompt_text: 'Identify all witnesses to the incident, including their names, addresses, and phone numbers.' },
        { item_type: 'rfa', prompt_text: 'Admit that the defendant owed a duty of care to the plaintiff at the time of the incident.' },
        { item_type: 'rfp', prompt_text: 'Produce all photographs, videos, or surveillance footage of the scene taken before, during, or after the incident.' },
      ],
    },
    family: {
      title: 'Family Law Discovery Pack',
      items: [
        { item_type: 'rfp', prompt_text: 'Produce all bank statements, investment account statements, and retirement account statements for the past 24 months.' },
        { item_type: 'rog', prompt_text: 'State your current gross and net monthly income from all sources, including employment, investments, and other benefits.' },
        { item_type: 'rfp', prompt_text: 'Produce your most recent three years of federal and state income tax returns, including all schedules and W-2s.' },
        { item_type: 'rog', prompt_text: 'List all real and personal property owned individually or jointly, including estimated current values.' },
        { item_type: 'rfp', prompt_text: 'Produce all documents relating to monthly household expenses, including mortgage, utilities, childcare, and insurance.' },
      ],
    },
  }

  const pack = packs[type]
  if (pack) return pack

  return {
    title: 'General Discovery Requests',
    items: [
      { item_type: 'rfp', prompt_text: 'Produce all documents that support the claims or defenses in this action.' },
      { item_type: 'rog', prompt_text: 'Identify all persons with knowledge of the facts relevant to this case, including their contact information.' },
      { item_type: 'rfp', prompt_text: 'Produce all written communications between the parties related to the subject matter of this dispute.' },
    ],
  }
}

// --- System prompt ---
export const DISCOVERY_SUGGESTION_SYSTEM_PROMPT = `You suggest discovery requests for a pro se litigant preparing their case.

Given case context, generate a tailored discovery pack with a mix of Requests for Production (RFP), Interrogatories (ROG), and Requests for Admission (RFA).

Each item should be a specific, well-formed discovery request appropriate for the dispute type and jurisdiction.

RULES:
- Never give legal advice
- Never use directive language ("you must", "you should")
- Focus on commonly relevant discovery requests for the dispute type
- Keep each request clear and specific
- Use proper legal terminology but explain in plain language
- Tailor requests to the specific dispute type and jurisdiction

Respond with JSON only: { "title": "...", "items": [{ "item_type": "rfp|rog|rfa", "prompt_text": "..." }] }`

// --- Prompt builder ---
export function buildDiscoverySuggestionPrompt(input: {
  dispute_type: string
  state: string
  role: string
  evidence_categories?: string[]
}): string {
  const lines = [
    `Dispute type: ${input.dispute_type}`,
    `State: ${input.state}`,
    `Role: ${input.role}`,
  ]
  if (input.evidence_categories && input.evidence_categories.length > 0) {
    lines.push(`Evidence categories already collected: ${input.evidence_categories.join(', ')}`)
  }
  return lines.join('\n')
}
