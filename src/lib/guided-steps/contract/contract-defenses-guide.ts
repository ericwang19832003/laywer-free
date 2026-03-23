import type { GuidedStepConfig } from '../types'

export const contractDefensesGuideConfig: GuidedStepConfig = {
  title: 'Common Defenses — What the Other Side Will Argue',
  reassurance:
    'Knowing their arguments in advance lets you prepare your rebuttal before they even raise them.',

  questions: [
    {
      id: 'top_defenses_info',
      type: 'info',
      prompt:
        'TOP 8 CONTRACT DEFENSES IN TEXAS:\n\n1. STATUTE OF LIMITATIONS — \'You waited too long to sue\' (4 years for written and oral contracts)\n2. PRIOR MATERIAL BREACH — \'YOU broke the contract first\'\n3. WAIVER — \'You accepted the breach without objecting\'\n4. STATUTE OF FRAUDS — \'The contract needed to be in writing\'\n5. IMPOSSIBILITY — \'Performance became impossible\' (rare)\n6. FAILURE TO MITIGATE — \'You didn\'t try to reduce your losses\'\n7. FRAUD/DURESS — \'The contract was obtained by fraud or threats\'\n8. PAYMENT/PERFORMANCE — \'We already paid/performed\'',
    },
    {
      id: 'likely_defense',
      type: 'single_choice',
      prompt: 'Which defenses might apply to your case?',
      options: [
        { value: 'sol', label: 'Statute of limitations — it\'s been a while since the breach' },
        { value: 'prior_breach', label: 'Prior material breach — I may have breached first' },
        { value: 'waiver', label: 'Waiver — I accepted partial performance without objecting' },
        { value: 'fraud', label: 'Fraud/duress — the contract formation was questionable' },
        { value: 'impossibility', label: 'Impossibility — circumstances changed dramatically' },
        { value: 'mitigation', label: 'Failure to mitigate — I haven\'t tried to reduce my losses' },
        { value: 'payment', label: 'Payment/performance — they claim they already performed' },
        { value: 'multiple', label: 'Multiple defenses may apply' },
        { value: 'unsure', label: 'Not sure what they\'ll argue' },
      ],
    },
    {
      id: 'sol_rebuttal',
      type: 'info',
      prompt:
        'REBUTTAL — STATUTE OF LIMITATIONS:\nTexas allows 4 years for both written and oral contracts (Civ. Prac. & Rem. Code §16.004). The clock starts when the breach occurs, NOT when the contract was signed.\n\nYour defense against this defense:\n- Calculate the exact breach date — when did they fail to perform?\n- Did you discover the breach later? The "discovery rule" may apply if the breach was hidden\n- Did they make partial payments or acknowledge the debt? This can RESTART the clock\n- Document the timeline with dates and evidence',
      showIf: (answers) => answers.likely_defense === 'sol',
    },
    {
      id: 'prior_breach_rebuttal',
      type: 'info',
      prompt:
        'REBUTTAL — PRIOR MATERIAL BREACH:\nThey\'ll argue YOU broke the contract first, excusing their non-performance.\n\nYour defense against this defense:\n- Was your alleged breach material or minor? A minor breach doesn\'t excuse their performance\n- Did they notify you of the alleged breach? If not, they may have waived it\n- Did they continue performing after your alleged breach? That suggests they didn\'t consider it material\n- Gather evidence showing you performed your obligations (receipts, emails, delivery records)',
      showIf: (answers) => answers.likely_defense === 'prior_breach',
    },
    {
      id: 'waiver_rebuttal',
      type: 'info',
      prompt:
        'REBUTTAL — WAIVER:\nThey\'ll argue you accepted the deficient performance without objecting, waiving your right to complain.\n\nYour defense against this defense:\n- Did you object at the time? Show emails, texts, or letters of complaint\n- Did you accept performance "under protest" or "with reservation of rights"?\n- Does the contract have a "no waiver" clause? Many contracts state that accepting partial performance doesn\'t waive future claims\n- A single instance of forbearance doesn\'t waive all future rights',
      showIf: (answers) => answers.likely_defense === 'waiver',
    },
    {
      id: 'fraud_rebuttal',
      type: 'info',
      prompt:
        'REBUTTAL — FRAUD/DURESS:\nThey\'ll argue the contract itself is invalid because it was obtained through fraud or threats.\n\nYour defense against this defense:\n- Show the contract was negotiated at arm\'s length (both sides had equal bargaining power)\n- Show both parties had time to review the terms\n- Show no misrepresentations were made (or that both sides verified independently)\n- If they had a lawyer review the contract, the fraud defense is very weak\n- Duress requires actual threats — mere hard bargaining is not duress',
      showIf: (answers) => answers.likely_defense === 'fraud',
    },
    {
      id: 'impossibility_rebuttal',
      type: 'info',
      prompt:
        'REBUTTAL — IMPOSSIBILITY:\nThey\'ll argue performance became impossible due to circumstances beyond their control.\n\nYour defense against this defense:\n- Impossibility is a HIGH bar — it must be truly impossible, not just difficult or expensive\n- Financial hardship alone is NOT impossibility\n- Was the impossibility foreseeable? If so, they assumed the risk\n- Did the contract have a force majeure clause? If not, general impossibility is hard to prove\n- Could they have performed in a different way? Impracticability ≠ impossibility',
      showIf: (answers) => answers.likely_defense === 'impossibility',
    },
    {
      id: 'mitigation_rebuttal',
      type: 'info',
      prompt:
        'REBUTTAL — FAILURE TO MITIGATE:\nThey\'ll argue you let your damages grow when you could have reduced them.\n\nYour defense against this defense:\n- Document every step you took to reduce losses (hired replacement, found alternative supplier, etc.)\n- The duty to mitigate only requires REASONABLE steps — you don\'t have to accept unfavorable terms\n- You don\'t have to mitigate at your own significant expense\n- The burden is on THEM to prove you failed to mitigate — not on you to prove you did',
      showIf: (answers) => answers.likely_defense === 'mitigation',
    },
    {
      id: 'payment_rebuttal',
      type: 'info',
      prompt:
        'REBUTTAL — PAYMENT/PERFORMANCE:\nThey\'ll claim they already paid or performed their obligations.\n\nYour defense against this defense:\n- Demand proof of payment (canceled checks, wire transfer records, receipts)\n- If they claim performance, inspect and document deficiencies\n- Compare what was delivered against the contract specifications\n- Get an expert opinion on whether their performance meets the contract standard\n- If they partially performed, calculate the remaining amount owed',
      showIf: (answers) => answers.likely_defense === 'payment',
    },
    {
      id: 'multiple_rebuttal',
      type: 'info',
      prompt:
        'MULTIPLE DEFENSES: When the other side throws multiple defenses at the wall, it often means none of them are strong. Prepare a rebuttal for each:\n\n1. Timeline showing you\'re within the statute of limitations\n2. Evidence you performed YOUR obligations\n3. Records showing you objected to deficiencies (no waiver)\n4. Written communications confirming the agreement (Statute of Frauds)\n5. Steps you took to mitigate damages\n6. Proof they did NOT fully pay or perform\n\nAddress the strongest defense first in your demand letter.',
      showIf: (answers) => answers.likely_defense === 'multiple',
    },
    {
      id: 'unsure_rebuttal',
      type: 'info',
      prompt:
        'NOT SURE? Prepare for the most common ones:\n\n1. Calculate your dates — are you within 4 years of the breach?\n2. Review your own performance — did YOU do everything the contract required?\n3. Check for written objections — did you complain about the breach in writing?\n4. Verify you have a writing (if required)\n5. Document your mitigation steps\n\nThe strongest case anticipates and addresses every possible defense before trial.',
      showIf: (answers) => answers.likely_defense === 'unsure',
    },
    {
      id: 'how_to_prepare_info',
      type: 'info',
      prompt:
        'HOW TO PREPARE:\n- For each possible defense, gather evidence that disproves it\n- Draft a one-paragraph rebuttal for each\n- In your demand letter, preemptively address the strongest defense\n- At trial, be ready with documents that counter each argument',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.likely_defense) {
      const labels: Record<string, string> = {
        sol: 'Likely defense: Statute of Limitations — verify breach date is within 4 years.',
        prior_breach: 'Likely defense: Prior Material Breach — gather evidence of your own performance.',
        waiver: 'Likely defense: Waiver — collect written objections and complaints.',
        fraud: 'Likely defense: Fraud/Duress — document arm\'s-length negotiation.',
        impossibility: 'Likely defense: Impossibility — show performance was feasible.',
        mitigation: 'Likely defense: Failure to Mitigate — document steps taken to reduce losses.',
        payment: 'Likely defense: Payment/Performance — demand proof and document deficiencies.',
        multiple: 'Multiple defenses expected — prepare rebuttals for each.',
        unsure: 'Defense unknown — prepare for the top 5 most common defenses.',
      }
      items.push({ status: 'info', text: labels[answers.likely_defense] })
    } else {
      items.push({ status: 'needed', text: 'Identify which defenses the other side is likely to raise.' })
    }

    items.push({ status: 'needed', text: 'Gather evidence that disproves each potential defense.' })
    items.push({ status: 'needed', text: 'Draft a one-paragraph rebuttal for each defense.' })
    items.push({ status: 'info', text: 'Preemptively address the strongest defense in your demand letter.' })

    return items
  },
}
