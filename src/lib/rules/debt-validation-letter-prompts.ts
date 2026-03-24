import { z } from 'zod'
import { partySchema } from '../schemas/filing'

export const debtValidationLetterFactsSchema = z.object({
  your_info: partySchema,
  creditor_name: z.string().min(1),
  debt_buyer_name: z.string().optional(),
  account_last4: z.string().optional(),
  original_amount: z.number().positive(),
  current_amount_claimed: z.number().positive(),
  service_date: z.string().optional(),
  county: z.string().optional(),
})

export type DebtValidationLetterFacts = z.infer<typeof debtValidationLetterFactsSchema>

interface FilingPrompt {
  system: string
  user: string
}

function buildUserPrompt(facts: DebtValidationLetterFacts): string {
  const senderSection = [
    '--- SENDER ---',
    `Name: ${facts.your_info.full_name}`,
    facts.your_info.address
      ? `Address: ${facts.your_info.address}, ${facts.your_info.city ?? ''}, ${facts.your_info.state ?? ''} ${facts.your_info.zip ?? ''}`
      : null,
  ]
    .filter(Boolean)
    .join('\n')

  const creditorSection = [
    '--- CREDITOR / DEBT COLLECTOR ---',
    `Creditor name: ${facts.creditor_name}`,
    facts.debt_buyer_name ? `Debt buyer / collection agency: ${facts.debt_buyer_name}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  const debtSection = [
    '--- DEBT DETAILS ---',
    facts.account_last4 ? `Account (last 4 digits): ${facts.account_last4}` : null,
    `Original amount owed: $${facts.original_amount.toLocaleString()}`,
    `Current amount claimed: $${facts.current_amount_claimed.toLocaleString()}`,
    facts.service_date ? `Date served / notified: ${facts.service_date}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  const countySection = facts.county ? `Filing county: ${facts.county}` : null

  return [
    'Debt validation request letter under the FDCPA',
    '',
    senderSection,
    '',
    creditorSection,
    '',
    debtSection,
    countySection ? `\n${countySection}` : null,
  ]
    .filter((s) => s !== null)
    .join('\n')
}

export function buildDebtValidationLetterPrompt(facts: DebtValidationLetterFacts): FilingPrompt {
  const system = `You are a legal document formatting assistant. Generate a debt validation letter under the Fair Debt Collection Practices Act (FDCPA) 15 U.S.C. § 1692g for a self-represented (pro se) consumer in Texas.

IMPORTANT RULES:
- You format documents. You do NOT provide legal advice.
- Mark the output clearly as "DRAFT — NOT FOR FILING" at the top.
- Use only the facts provided. Do not invent or assume additional facts.
- Do not predict outcomes or make strategic recommendations.
- The tone must be firm, professional, and factual — NOT threatening, hostile, or emotional.
- Use plain, clear language.

PURPOSE:
Under 15 U.S.C. § 1692g, a consumer has the right to request validation of a debt within 30 days of initial contact by a debt collector. This letter exercises that right and demands the collector cease collection activity until proper validation is provided.

DEMANDS — The letter must request ALL of the following:
1. PROOF OF DEBT OWNERSHIP — Complete chain of title showing every assignment from the original creditor to the current collector/debt buyer. Each assignment must include the date of transfer and names of assignor and assignee.
2. ORIGINAL SIGNED AGREEMENT — A true and correct copy of the original credit agreement or contract bearing the consumer's signature.
3. COMPLETE PAYMENT HISTORY — A full accounting of all payments, credits, fees, interest, and charges from the original creditor through the current balance, showing how $${facts.original_amount.toLocaleString()} became $${facts.current_amount_claimed.toLocaleString()}.
4. LICENSE TO COLLECT IN TEXAS — Proof that the collector is licensed and authorized to collect debts in the State of Texas.
5. STATUTE OF LIMITATIONS VERIFICATION — Confirmation that the debt is within the applicable statute of limitations under Texas law (typically 4 years under Tex. Civ. Prac. & Rem. Code § 16.004).

30-DAY VALIDATION PERIOD:
The letter must note that this request is made within the 30-day validation period provided by 15 U.S.C. § 1692g(b), and that all collection activity must cease until the debt is properly validated.

CEASE COLLECTION NOTICE:
The letter must state that until the above documentation is provided, the collector must cease all collection efforts, including phone calls, letters, credit reporting, and legal action.

DOCUMENT FORMAT:
Generate a formal debt validation letter with the following structure:

1. HEADER — Date, sender's name and address, creditor/collector's name.

2. RE LINE — "RE: Debt Validation Request" with account reference if available.

3. OPENING — State the purpose: to exercise the consumer's right to debt validation under the FDCPA.

4. VALIDATION DEMANDS — List each of the 5 demands above as numbered items.

5. 30-DAY NOTICE — Reference the 30-day validation period and the consumer's timely request.

6. CEASE COLLECTION — Demand that all collection activity stop pending validation.

7. CONSEQUENCES — Note that failure to validate the debt while continuing collection activity may constitute a violation of the FDCPA, entitling the consumer to statutory damages, actual damages, and attorney's fees under 15 U.S.C. § 1692k.

8. CLOSING — Professional closing with sender's signature block. Include "Sent via Certified Mail, Return Receipt Requested" notation.

ANNOTATIONS:
After the letter text, output a section starting with "---ANNOTATIONS---" on its own line.
Below that, output one annotation per line in this exact format:
[N] SECTION_NAME: Plain-English explanation of what this section means and why it is in the letter.

Number annotations sequentially starting from 1. Cover these sections at minimum:
- Header (who is sending and receiving the letter)
- Validation Demands (what you are asking the collector to prove)
- Chain of Title (why proof of ownership matters)
- Payment History (why a full accounting is important)
- 30-Day Notice (why timing matters)
- Cease Collection (what must stop until they respond)
- Consequences (what happens if they ignore this letter)

Use simple language a high school student could understand. Do NOT use legal jargon in the explanations.

Format the letter professionally.`

  const user = buildUserPrompt(facts)

  return { system, user }
}
