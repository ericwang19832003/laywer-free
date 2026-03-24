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

    // Won full
    {
      id: 'won_full_info',
      type: 'info',
      prompt:
        'COLLECTING YOUR JUDGMENT:\n\n1. DEMAND LETTER: Send the defendant a letter demanding payment within 10 days. Include a copy of the judgment.\n2. ABSTRACT OF JUDGMENT: File with the County Clerk to create a lien on the defendant\'s property. They cannot sell or refinance without paying you first.\n3. BANK GARNISHMENT: File a Writ of Garnishment to seize funds directly from the defendant\'s bank account.\n4. WAGE GARNISHMENT: You can garnish up to 25% of the defendant\'s disposable earnings.\n5. POST-JUDGMENT INTEREST: In Texas, judgments accrue interest at 5% per year (Tex. Fin. Code §304.003) from the date of judgment. Every day they don\'t pay, they owe more.',
      showIf: (answers) => answers.outcome === 'won_full',
    },

    // Won partial
    {
      id: 'won_partial_info',
      type: 'info',
      prompt:
        'COLLECTING YOUR PARTIAL JUDGMENT:\n\nThe same collection tools apply even for a partial award:\n\n1. DEMAND LETTER: Send the defendant a letter demanding payment within 10 days. Include a copy of the judgment.\n2. ABSTRACT OF JUDGMENT: File with the County Clerk to create a lien on the defendant\'s property.\n3. BANK GARNISHMENT: File a Writ of Garnishment to seize funds from the defendant\'s bank account.\n4. WAGE GARNISHMENT: You can garnish up to 25% of the defendant\'s disposable earnings.\n5. POST-JUDGMENT INTEREST: 5% per year (Tex. Fin. Code §304.003) from the date of judgment.\n\nConsider whether the difference between what you asked and what was awarded is worth appealing. You have 30 days to file a notice of appeal.',
      showIf: (answers) => answers.outcome === 'won_partial',
    },

    // Lost
    {
      id: 'lost_info',
      type: 'info',
      prompt:
        'YOUR OPTIONS AFTER LOSING:\n\n1. APPEAL: You have 30 days to file a notice of appeal. The appellate court reviews whether the trial court made legal errors — it is not a re-trial.\n2. MOTION FOR NEW TRIAL: File within 30 days if there is newly discovered evidence or procedural errors.\n3. WHAT TO DO DIFFERENTLY: Consider whether you had sufficient evidence of the contract terms, whether you clearly proved the breach, and whether your damages were well-documented.\n4. LEGAL AID: Contact your local legal aid office for help with an appeal — TexasLawHelp.org maintains a directory of free legal services.',
      showIf: (answers) => answers.outcome === 'lost',
    },

    // Settled
    {
      id: 'settled_info',
      type: 'info',
      prompt:
        'ENFORCING YOUR SETTLEMENT AGREEMENT:\n\n1. GET IT IN WRITING: Ensure the settlement agreement is signed by both parties and filed with the court (agreed judgment).\n2. SPECIFIC TERMS: The agreement should include exact amounts, payment deadlines, and consequences for breach.\n3. IF THEY DON\'T PAY: File a motion to enforce the settlement agreement — the court can hold them in contempt or enter a judgment for the full amount.\n4. CONSENT JUDGMENT: Ask the court to enter a consent judgment so you can use enforcement tools (garnishment, liens) if the other party defaults.',
      showIf: (answers) => answers.outcome === 'settled',
    },

    // Judgment debtor examination
    {
      id: 'judgment_debtor_exam',
      type: 'info',
      prompt:
        "JUDGMENT DEBTOR EXAMINATION:\nIf the defendant won't pay, you can force them to appear in court and disclose their assets (bank accounts, property, income). File a 'Motion for Post-Judgment Discovery' and serve interrogatories asking about their finances.",
      showIf: (answers) =>
        answers.outcome === 'won_full' || answers.outcome === 'won_partial',
    },

    // Post-judgment interest
    {
      id: 'post_judgment_interest',
      type: 'info',
      prompt:
        "POST-JUDGMENT INTEREST:\nIn Texas, judgments accrue interest at 5% per year (Tex. Fin. Code §304.003) from the date of judgment. This means every day they don't pay, they owe more.",
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
