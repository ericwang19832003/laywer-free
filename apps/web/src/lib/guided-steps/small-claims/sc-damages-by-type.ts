import type { GuidedStepConfig } from '../types'

export const scDamagesByTypeConfig: GuidedStepConfig = {
  title: 'Calculating Your Damages',
  reassurance:
    'Knowing exactly what you\'re owed — and being able to prove it — is the single most important factor in small claims.',

  questions: [
    {
      id: 'claim_type',
      type: 'single_choice',
      prompt: 'What type of claim are you bringing?',
      options: [
        { value: 'security_deposit', label: 'Security deposit' },
        { value: 'breach_of_contract', label: 'Breach of contract' },
        { value: 'consumer_refund', label: 'Consumer refund / deceptive trade' },
        { value: 'property_damage', label: 'Property damage' },
        { value: 'car_accident', label: 'Car accident' },
        { value: 'unpaid_loan', label: 'Unpaid loan' },
        { value: 'neighbor_dispute', label: 'Neighbor dispute' },
      ],
    },
    {
      id: 'security_deposit_info',
      type: 'info',
      prompt:
        'Security deposit damages: (1) Your deposit amount. (2) 3x statutory penalty for bad faith retention under Texas Property Code \u00a792.109. (3) $100 statutory penalty. (4) Reasonable attorney fees (even if you don\'t have an attorney, you can claim this). Example: $1,500 deposit + $4,500 bad faith penalty + $100 = $6,100 maximum.',
      showIf: (answers) => answers.claim_type === 'security_deposit',
    },
    {
      id: 'breach_of_contract_info',
      type: 'info',
      prompt:
        'Breach of contract damages: (1) What you paid minus the value of what you received. (2) Consequential damages — additional losses that were foreseeable when the contract was made (e.g., you paid a contractor $5,000, got nothing, and had to pay another contractor $7,000 — damages are $5,000 refund + $2,000 difference).',
      showIf: (answers) => answers.claim_type === 'breach_of_contract',
    },
    {
      id: 'consumer_refund_info',
      type: 'info',
      prompt:
        'Consumer refund damages: (1) Purchase price (full refund). (2) If the seller engaged in deceptive practices, the Texas Deceptive Trade Practices Act (\u00a717.50) allows treble (3x) damages. Example: $2,000 purchase with deceptive conduct = up to $6,000. Deceptive conduct includes false advertising, bait-and-switch, or misrepresenting the product.',
      showIf: (answers) => answers.claim_type === 'consumer_refund',
    },
    {
      id: 'property_damage_info',
      type: 'info',
      prompt:
        'Property damage: (1) Repair cost — get 3 written estimates to show the judge. (2) Diminished value — if the property is worth less even after repair. (3) Loss of use — reasonable cost of replacement while yours was being repaired (e.g., rental car, temporary equipment). All three together must be under $20,000.',
      showIf: (answers) => answers.claim_type === 'property_damage',
    },
    {
      id: 'car_accident_info',
      type: 'info',
      prompt:
        'Car accident damages: (1) Repair estimate (get at least one written estimate, preferably 2-3). (2) Rental car costs while your vehicle was being repaired. (3) Medical expenses if claiming injury — total of all damages must stay under $20,000 for JP Court. Bring the police report, repair estimates, rental receipts, and any medical bills.',
      showIf: (answers) => answers.claim_type === 'car_accident',
    },
    {
      id: 'unpaid_loan_info',
      type: 'info',
      prompt:
        'Unpaid loan damages: (1) Principal — the amount loaned that hasn\'t been repaid. (2) Contractual interest — if your agreement specifies an interest rate. (3) Late fees — if your agreement specifies late fees. If there\'s no written agreement, you can still claim the principal based on text messages, emails, or bank transfer records showing the loan.',
      showIf: (answers) => answers.claim_type === 'unpaid_loan',
    },
    {
      id: 'neighbor_dispute_info',
      type: 'info',
      prompt:
        'Neighbor dispute damages: (1) Repair or remediation cost — what it costs to fix the damage (e.g., fence repair, tree removal, water damage cleanup). (2) Loss of enjoyment — if the neighbor\'s actions prevented you from using your property (e.g., blocked access, noise). Get written estimates for all repair costs.',
      showIf: (answers) => answers.claim_type === 'neighbor_dispute',
    },
    {
      id: 'calculated_amount',
      type: 'yes_no',
      prompt: 'Have you calculated the total amount you\'re claiming?',
    },
    {
      id: 'calculate_info',
      type: 'info',
      prompt:
        'Write down each component of your damages on a single sheet of paper. Add them up. Make sure the total is $20,000 or less for JP Court. The judge needs to see a clear, itemized breakdown — not just a lump sum.',
      showIf: (answers) => answers.calculated_amount === 'no',
    },
    {
      id: 'have_proof',
      type: 'yes_no',
      prompt: 'Do you have documentation to prove each damage amount?',
    },
    {
      id: 'proof_info',
      type: 'info',
      prompt:
        'Every dollar you claim needs supporting evidence. Receipts, invoices, estimates, bank statements, or contracts showing the amounts. If you\'re claiming statutory penalties (like 3x for security deposits or DTPA), print out the relevant statute section to show the judge.',
      showIf: (answers) => answers.have_proof === 'no',
    },
    {
      id: 'under_limit',
      type: 'yes_no',
      prompt: 'Is your total claim (including penalties) $20,000 or less?',
    },
    {
      id: 'over_limit_info',
      type: 'info',
      prompt:
        'If your total exceeds $20,000, you have two options: (1) Reduce your claim to $20,000 and stay in JP Court — you give up the excess but benefit from the simpler process. (2) File in County Court for the full amount — more complex, but no cap. Many people choose to stay in JP Court for the speed and simplicity.',
      showIf: (answers) => answers.under_limit === 'no',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.claim_type) {
      const formulas: Record<string, string> = {
        security_deposit: 'Deposit + 3x bad faith penalty (\u00a792.109) + $100 + attorney fees.',
        breach_of_contract: 'Amount paid - value received + foreseeable consequential damages.',
        consumer_refund: 'Purchase price + DTPA treble damages if deceptive conduct (\u00a717.50).',
        property_damage: 'Repair cost (3 estimates) + diminished value + loss of use.',
        car_accident: 'Repair estimate + rental car + medical bills (must total under $20K).',
        unpaid_loan: 'Principal + contractual interest + late fees.',
        neighbor_dispute: 'Repair/remediation cost + loss of enjoyment.',
      }
      items.push({
        status: 'info',
        text: `Damage formula: ${formulas[answers.claim_type]}`,
      })
    }

    if (answers.calculated_amount === 'yes') {
      items.push({ status: 'done', text: 'Total claim amount calculated.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Calculate and itemize each component of your damages on paper.',
      })
    }

    if (answers.have_proof === 'yes') {
      items.push({ status: 'done', text: 'Documentation supports each damage amount.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Gather receipts, invoices, estimates, or bank statements proving each dollar claimed.',
      })
    }

    if (answers.under_limit === 'yes') {
      items.push({ status: 'done', text: 'Total claim is within the $20,000 JP Court limit.' })
    } else if (answers.under_limit === 'no') {
      items.push({
        status: 'needed',
        text: 'Claim exceeds $20,000. Decide: reduce to $20K for JP Court, or file in County Court for the full amount.',
      })
    }

    return items
  },
}
