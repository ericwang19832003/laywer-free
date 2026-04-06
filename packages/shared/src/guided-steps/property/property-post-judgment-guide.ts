import type { GuidedStepConfig } from '../types'

export const propertyPostJudgmentGuideConfig: GuidedStepConfig = {
  title: "After the Court's Decision",
  reassurance:
    'Whether you won or lost, there are important next steps to protect your property rights.',

  questions: [
    {
      id: 'outcome',
      type: 'single_choice',
      prompt: 'What was the outcome of your case?',
      options: [
        { value: 'won_money_judgment', label: 'Won — money judgment awarded' },
        { value: 'won_injunction', label: 'Won — injunction (court order) issued' },
        { value: 'lost', label: 'Lost the case' },
        { value: 'settled', label: 'Settled / agreed to a resolution' },
      ],
    },
    {
      id: 'won_money_info',
      type: 'info',
      prompt:
        'COLLECTING YOUR MONEY JUDGMENT:\n\n1. ABSTRACT OF JUDGMENT: File this with the County Clerk to create a lien on the defendant\'s property. This means they cannot sell or refinance without paying you first.\n2. WRIT OF EXECUTION: Ask the court to seize the defendant\'s non-exempt assets (bank accounts, personal property) to satisfy the judgment.\n3. WAGE GARNISHMENT: In some cases, you can garnish wages (limited in Texas — mainly for child support, but other mechanisms exist for judgment debtors).\n4. POST-JUDGMENT DISCOVERY: You can compel the defendant to disclose their assets.\n\nIMPORTANT: The defendant has 30 days to appeal. The judgment accrues interest at the legal rate until paid.',
      showIf: (answers) => answers.outcome === 'won_money_judgment',
    },
    {
      id: 'won_injunction_info',
      type: 'info',
      prompt:
        'ENFORCING YOUR INJUNCTION:\n\n1. SERVE THE ORDER: Make sure the defendant has been formally served with the court\'s order.\n2. DOCUMENT VIOLATIONS: If the defendant violates the injunction, document every instance with photos, video, and timestamps.\n3. FILE FOR CONTEMPT: Report violations to the court by filing a motion for contempt. The defendant can face fines or jail time for violating a court order.\n4. CALL LAW ENFORCEMENT: In some cases (trespass after injunction), you can call the police to enforce the order.\n\nKeep a copy of the court order accessible at all times.',
      showIf: (answers) => answers.outcome === 'won_injunction',
    },
    {
      id: 'lost_info',
      type: 'info',
      prompt:
        'YOUR OPTIONS AFTER LOSING:\n\n1. APPEAL: You have 30 days to file a notice of appeal. The appellate court reviews whether the trial court made legal errors (abuse of discretion standard). You generally cannot introduce new evidence on appeal.\n2. MOTION FOR NEW TRIAL: File within 30 days if there is newly discovered evidence or procedural errors.\n3. WHAT TO DO DIFFERENTLY: Consider whether you had sufficient evidence (photos, surveys, estimates), whether your witnesses were credible, and whether you clearly proved each element of your claim.\n\nAn appeal is not a re-trial — it reviews whether the law was applied correctly.',
      showIf: (answers) => answers.outcome === 'lost',
    },
    {
      id: 'settled_info',
      type: 'info',
      prompt:
        'PROTECTING YOUR SETTLEMENT:\n\n1. GET IT IN WRITING: Ensure the settlement agreement is signed by both parties and filed with the court (agreed judgment).\n2. SPECIFIC TERMS: The agreement should include exact amounts, payment deadlines, and consequences for breach.\n3. RECORD PROPERTY AGREEMENTS: If the settlement involves property rights (boundary lines, easements, access rights), record the agreement with the County Clerk so it appears in the property records.\n4. ENFORCE IF BREACHED: If the other party does not comply, file a motion to enforce the settlement agreement — the court can hold them in contempt.',
      showIf: (answers) => answers.outcome === 'settled',
    },
    {
      id: 'recording_judgment',
      type: 'info',
      prompt:
        "RECORDING YOUR JUDGMENT: If your judgment involves property rights (boundary, easement, title), record it with the County Clerk's office so it appears in the property records. This protects future buyers.",
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.outcome === 'won_money_judgment') {
      items.push({
        status: 'done',
        text: 'Money judgment awarded in your favor.',
      })
      items.push({
        status: 'needed',
        text: "File an Abstract of Judgment with the County Clerk to create a lien on the defendant's property.",
      })
      items.push({
        status: 'info',
        text: 'The defendant has 30 days to appeal. The judgment accrues interest until paid.',
      })
      items.push({
        status: 'needed',
        text: 'If the defendant does not pay voluntarily, request a Writ of Execution from the court.',
      })
    } else if (answers.outcome === 'won_injunction') {
      items.push({
        status: 'done',
        text: 'Court injunction issued in your favor.',
      })
      items.push({
        status: 'needed',
        text: 'Ensure the defendant has been formally served with the court order.',
      })
      items.push({
        status: 'info',
        text: 'Document any violations with photos, video, and timestamps — file for contempt if the order is violated.',
      })
    } else if (answers.outcome === 'lost') {
      items.push({
        status: 'info',
        text: 'You have 30 days to file a notice of appeal or a motion for new trial.',
      })
      items.push({
        status: 'needed',
        text: 'Decide whether to appeal — consult with an attorney if possible, as appeals review legal errors, not facts.',
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
        status: 'needed',
        text: 'Record any property-related agreements with the County Clerk.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Determine the outcome of your case to identify next steps.',
      })
    }

    items.push({
      status: 'info',
      text: "If your judgment involves property rights, record it with the County Clerk's office to protect future buyers.",
    })

    return items
  },
}
