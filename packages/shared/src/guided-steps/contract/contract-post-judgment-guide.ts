import type { GuidedStepConfig } from '../types'

export const contractPostJudgmentGuideConfig: GuidedStepConfig = {
  title: "After the Court's Decision",
  reassurance:
    "Winning a judgment is step one. Collecting is step two. We'll guide you through both.",

  questions: [
    {
      id: 'outcome',
      type: 'single_choice',
      prompt: 'What was the outcome of your case?',
      options: [
        { value: 'won_full', label: 'Won — full amount awarded' },
        { value: 'won_partial', label: 'Won — partial amount awarded' },
        { value: 'lost', label: 'Lost the case' },
        { value: 'settled', label: 'Settled / agreed to a resolution' },
      ],
    },

    // Won — immediate first steps (shared for full and partial)
    {
      id: 'won_first_steps',
      type: 'info',
      prompt:
        'YOUR FIRST TWO STEPS:\n\n' +
        'DEMAND LETTER: Send the defendant a letter demanding payment within 10 days. Include a copy of the judgment.\n\n' +
        'ABSTRACT OF JUDGMENT: File with the County Clerk to create a lien on the defendant\'s property. They cannot sell or refinance without paying you first.',
      acknowledgeLabel: "I'll send the demand letter and file the abstract →",
      showIf: (answers) => answers.outcome === 'won_full' || answers.outcome === 'won_partial',
    },

    // Won partial — appeal consideration
    {
      id: 'won_partial_appeal_note',
      type: 'info',
      prompt:
        'CONSIDER AN APPEAL:\n\nYou received a partial award. If you believe the judge undervalued your damages, you have 30 days from the judgment to file a notice of appeal. An appellate court reviews whether legal errors affected the outcome — it is not a re-trial.',
      acknowledgeLabel: "I understand the 30-day appeal window →",
      showIf: (answers) => answers.outcome === 'won_partial',
    },

    // Enforcement method choice
    {
      id: 'enforced_collection_method',
      type: 'single_choice',
      prompt: 'If the defendant does not pay voluntarily, which enforcement tool do you want to use?',
      options: [
        { value: 'bank', label: 'Bank account garnishment' },
        { value: 'wage', label: 'Wage garnishment' },
        { value: 'both', label: 'Both — start with bank, then wage' },
        { value: 'skip', label: "Not sure yet — I'll wait and see" },
      ],
      showIf: (answers) => answers.outcome === 'won_full' || answers.outcome === 'won_partial',
    },

    // Bank garnishment detail
    {
      id: 'bank_garnishment_info',
      type: 'info',
      prompt:
        'BANK ACCOUNT GARNISHMENT:\n\nFile a Writ of Garnishment with the court and serve it on the defendant\'s bank. The bank must freeze and turn over funds up to the judgment amount. You will need to know which bank the defendant uses — the judgment debtor examination can help uncover this.',
      acknowledgeLabel: "I'll file a Writ of Garnishment for the bank account →",
      showIf: (answers) =>
        (answers.outcome === 'won_full' || answers.outcome === 'won_partial') &&
        (answers.enforced_collection_method === 'bank' || answers.enforced_collection_method === 'both'),
    },

    // Wage garnishment detail
    {
      id: 'wage_garnishment_info',
      type: 'info',
      prompt:
        "WAGE GARNISHMENT:\n\nFile a Writ of Garnishment directed at the defendant's employer. You can garnish up to 25% of the defendant's disposable earnings. The employer must withhold and remit that amount each pay period until the judgment is fully paid.",
      acknowledgeLabel: "I'll file a Writ of Garnishment for wages →",
      showIf: (answers) =>
        (answers.outcome === 'won_full' || answers.outcome === 'won_partial') &&
        (answers.enforced_collection_method === 'wage' || answers.enforced_collection_method === 'both'),
    },

    // Lost
    {
      id: 'lost_info',
      type: 'info',
      prompt:
        'YOUR OPTIONS AFTER LOSING:\n\n1. APPEAL: You have 30 days to file a notice of appeal. The appellate court reviews whether the trial court made legal errors — it is not a re-trial.\n2. MOTION FOR NEW TRIAL: File within 30 days if there is newly discovered evidence or procedural errors.\n3. WHAT TO DO DIFFERENTLY: Consider whether you had sufficient evidence of the contract terms, whether you clearly proved the breach, and whether your damages were well-documented.\n4. LEGAL AID: Contact your local legal aid office for help with an appeal — TexasLawHelp.org maintains a directory of free legal services.',
      acknowledgeLabel: "I understand my options and the 30-day appeal deadline →",
      showIf: (answers) => answers.outcome === 'lost',
    },

    // Settled
    {
      id: 'settled_info',
      type: 'info',
      prompt:
        'ENFORCING YOUR SETTLEMENT AGREEMENT:\n\n1. GET IT IN WRITING: Ensure the settlement agreement is signed by both parties and filed with the court (agreed judgment).\n2. SPECIFIC TERMS: The agreement should include exact amounts, payment deadlines, and consequences for breach.\n3. IF THEY DON\'T PAY: File a motion to enforce the settlement agreement — the court can hold them in contempt or enter a judgment for the full amount.\n4. CONSENT JUDGMENT: Ask the court to enter a consent judgment so you can use enforcement tools (garnishment, liens) if the other party defaults.',
      acknowledgeLabel: "I understand how to enforce the settlement agreement →",
      showIf: (answers) => answers.outcome === 'settled',
    },

    // Judgment debtor examination
    {
      id: 'judgment_debtor_exam',
      type: 'info',
      prompt:
        "JUDGMENT DEBTOR EXAMINATION:\nIf the defendant won't pay, you can force them to appear in court and disclose their assets (bank accounts, property, income). File a 'Motion for Post-Judgment Discovery' and serve interrogatories asking about their finances.",
      acknowledgeLabel: "I'll file a Motion for Post-Judgment Discovery to uncover assets →",
      showIf: (answers) =>
        answers.outcome === 'won_full' || answers.outcome === 'won_partial',
    },

    // Post-judgment interest
    {
      id: 'post_judgment_interest',
      type: 'info',
      prompt:
        "POST-JUDGMENT INTEREST:\nIn Texas, judgments accrue interest at 5% per year (Tex. Fin. Code §304.003) from the date of judgment. This means every day they don't pay, they owe more.",
      acknowledgeLabel: "I'll track post-judgment interest accruing at 5% per year →",
      showIf: (answers) =>
        answers.outcome === 'won_full' || answers.outcome === 'won_partial',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.outcome === 'won_full') {
      items.push({
        status: 'done',
        text: 'Full judgment awarded in your favor.',
      })
      items.push({
        status: 'needed',
        text: 'Send a demand letter requiring payment within 10 days.',
      })
      items.push({
        status: 'needed',
        text: "File an Abstract of Judgment with the County Clerk to create a lien on the defendant's property.",
      })
      items.push({
        status: 'info',
        text: 'If the defendant does not pay voluntarily, pursue bank garnishment, wage garnishment (up to 25% of disposable earnings), or a Writ of Execution.',
      })
      items.push({
        status: 'info',
        text: 'The judgment accrues interest at 5% per year (Tex. Fin. Code §304.003) until paid.',
      })
    } else if (answers.outcome === 'won_partial') {
      items.push({
        status: 'done',
        text: 'Partial judgment awarded in your favor.',
      })
      items.push({
        status: 'needed',
        text: 'Send a demand letter requiring payment within 10 days.',
      })
      items.push({
        status: 'needed',
        text: "File an Abstract of Judgment with the County Clerk to create a lien on the defendant's property.",
      })
      items.push({
        status: 'info',
        text: 'Consider whether the difference is worth appealing — you have 30 days to file a notice of appeal.',
      })
    } else if (answers.outcome === 'lost') {
      items.push({
        status: 'info',
        text: 'You have 30 days to file a notice of appeal or a motion for new trial.',
      })
      items.push({
        status: 'needed',
        text: 'Decide whether to appeal — consult with an attorney or contact legal aid at TexasLawHelp.org.',
      })
    } else if (answers.outcome === 'settled') {
      items.push({
        status: 'done',
        text: 'Case settled by agreement.',
      })
      items.push({
        status: 'needed',
        text: 'Ensure the settlement agreement is in writing, signed, and filed with the court.',
      })
      items.push({
        status: 'info',
        text: 'If the other party defaults, file a motion to enforce the settlement agreement.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Determine the outcome of your case to identify next steps.',
      })
    }

    return items
  },
}
