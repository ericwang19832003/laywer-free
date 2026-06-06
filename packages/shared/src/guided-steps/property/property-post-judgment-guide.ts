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
      id: 'won_money_overview',
      type: 'info',
      prompt:
        'YOU WON A MONEY JUDGMENT.\n\nThe court has ruled in your favor, but winning is just the first step — you still need to collect. You have several tools available. Let\'s focus on the one that fits your situation best.\n\nIMPORTANT: The defendant has 30 days to appeal. The judgment accrues interest at the legal rate until paid.',
      acknowledgeLabel: 'Got it — show me my collection options →',
      showIf: (answers) => answers.outcome === 'won_money_judgment',
    },
    {
      id: 'collection_method_choice',
      type: 'single_choice',
      prompt: 'Which collection method do you want to pursue first?',
      options: [
        { value: 'abstract', label: 'Abstract of Judgment (create a property lien)' },
        { value: 'writ', label: 'Writ of Execution (seize assets)' },
        { value: 'garnishment', label: 'Bank or wage garnishment' },
        { value: 'discovery', label: 'Post-judgment discovery (find out what they own)' },
      ],
      showIf: (answers) => answers.outcome === 'won_money_judgment',
    },
    {
      id: 'collection_abstract_info',
      type: 'info',
      prompt:
        'ABSTRACT OF JUDGMENT\n\nFile an Abstract of Judgment with the County Clerk\'s office. This creates a lien on any real property the defendant owns in that county — they cannot sell or refinance without paying you first.\n\nSteps:\n1. Obtain a certified copy of the judgment from the court clerk.\n2. Complete the Abstract of Judgment form (available at the County Clerk).\n3. File it with the County Clerk in every county where the defendant may own property.\n4. Pay the filing fee (usually $25–$50).\n\nThe lien stays in effect for 10 years and can be renewed.',
      acknowledgeLabel: 'Got it — I\'ll file the Abstract of Judgment →',
      showIf: (answers) =>
        answers.outcome === 'won_money_judgment' &&
        answers.collection_method_choice === 'abstract',
    },
    {
      id: 'collection_writ_info',
      type: 'info',
      prompt:
        'WRIT OF EXECUTION\n\nA Writ of Execution directs a constable or sheriff to seize the defendant\'s non-exempt assets and sell them to satisfy your judgment.\n\nSteps:\n1. File an Application for Writ of Execution with the court clerk.\n2. The constable will levy (seize) non-exempt personal property: vehicles, bank accounts, business assets.\n3. Exempt property (homestead, certain personal property) cannot be seized.\n\nTip: You must identify where the assets are located. If you don\'t know what the defendant owns, start with post-judgment discovery first.',
      acknowledgeLabel: 'Got it — I\'ll apply for a Writ of Execution →',
      showIf: (answers) =>
        answers.outcome === 'won_money_judgment' &&
        answers.collection_method_choice === 'writ',
    },
    {
      id: 'collection_garnishment_info',
      type: 'info',
      prompt:
        'BANK OR WAGE GARNISHMENT\n\nBank garnishment: If you know which bank the defendant uses, you can garnish funds directly from their account. File a Writ of Garnishment with the court naming the bank as the garnishee.\n\nWage garnishment: Texas severely limits wage garnishment for civil judgments — it is generally only available for child support, student loans, and taxes. For most civil judgments, focus on bank garnishment or asset seizure instead.\n\nYou will need to know the defendant\'s bank or employer name and address to proceed.',
      acknowledgeLabel: 'Got it — I\'ll pursue garnishment →',
      showIf: (answers) =>
        answers.outcome === 'won_money_judgment' &&
        answers.collection_method_choice === 'garnishment',
    },
    {
      id: 'collection_discovery_info',
      type: 'info',
      prompt:
        'POST-JUDGMENT DISCOVERY\n\nIf you don\'t know what the defendant owns, you can compel them to disclose their assets through post-judgment discovery.\n\nOptions:\n1. INTERROGATORIES: Written questions the defendant must answer under oath, listing bank accounts, property, income, and employers.\n2. DEBTOR EXAMINATION: Request the court to order the defendant to appear and answer questions about their assets in person.\n\nOnce you know what they have, you can target the right collection method — Abstract of Judgment for property, Writ of Execution for vehicles and personal property, or garnishment for bank accounts.',
      acknowledgeLabel: 'Got it — I\'ll start with post-judgment discovery →',
      showIf: (answers) =>
        answers.outcome === 'won_money_judgment' &&
        answers.collection_method_choice === 'discovery',
    },

    {
      id: 'won_injunction_what_it_means',
      type: 'info',
      prompt:
        'YOUR INJUNCTION IS NOW IN EFFECT.\n\nThe court has issued a binding order requiring the other party to do something (or stop doing something). This is not just a suggestion — violating a court order can result in fines or jail time for contempt of court.\n\nFirst step: Make sure the defendant has been formally served with the court\'s order. If they haven\'t received it, they cannot be held in contempt for violating it.',
      acknowledgeLabel: 'Got it — I\'ll confirm they were served →',
      showIf: (answers) => answers.outcome === 'won_injunction',
    },
    {
      id: 'won_injunction_enforcement',
      type: 'info',
      prompt:
        'IF THEY VIOLATE THE INJUNCTION:\n\n1. DOCUMENT EVERY VIOLATION: Take photos, video, and detailed notes with exact dates and times. Each violation is a separate contempt incident.\n2. FILE FOR CONTEMPT: File a Motion for Contempt with the court. Attach your documentation. The court can impose fines or jail time.\n3. CALL LAW ENFORCEMENT: For certain violations (trespass after an injunction), you can call the police to enforce the order immediately.\n\nKeep a copy of the court order accessible at all times — give a copy to local law enforcement if trespass is a concern.',
      acknowledgeLabel: 'Got it — I\'ll document any violations →',
      showIf: (answers) => answers.outcome === 'won_injunction',
    },
    {
      id: 'lost_info',
      type: 'info',
      prompt:
        'YOUR OPTIONS AFTER LOSING:\n\n1. APPEAL: You have 30 days to file a notice of appeal. The appellate court reviews whether the trial court made legal errors (abuse of discretion standard). You generally cannot introduce new evidence on appeal.\n2. MOTION FOR NEW TRIAL: File within 30 days if there is newly discovered evidence or procedural errors.\n3. WHAT TO DO DIFFERENTLY: Consider whether you had sufficient evidence (photos, surveys, estimates), whether your witnesses were credible, and whether you clearly proved each element of your claim.\n\nAn appeal is not a re-trial — it reviews whether the law was applied correctly.',
      acknowledgeLabel: 'Understood — I\'ll consider my options →',
      showIf: (answers) => answers.outcome === 'lost',
    },
    {
      id: 'settled_info',
      type: 'info',
      prompt:
        'PROTECTING YOUR SETTLEMENT:\n\n1. GET IT IN WRITING: Ensure the settlement agreement is signed by both parties and filed with the court (agreed judgment).\n2. SPECIFIC TERMS: The agreement should include exact amounts, payment deadlines, and consequences for breach.\n3. RECORD PROPERTY AGREEMENTS: If the settlement involves property rights (boundary lines, easements, access rights), record the agreement with the County Clerk so it appears in the property records.\n4. ENFORCE IF BREACHED: If the other party does not comply, file a motion to enforce the settlement agreement — the court can hold them in contempt.',
      acknowledgeLabel: 'Got it — I\'ll put it in writing and record it →',
      showIf: (answers) => answers.outcome === 'settled',
    },
    {
      id: 'recording_judgment',
      type: 'info',
      prompt:
        "RECORDING YOUR JUDGMENT: If your judgment involves property rights (boundary, easement, title), record it with the County Clerk's office so it appears in the property records. This protects future buyers.",
      acknowledgeLabel: 'Got it — I\'ll record my judgment →',
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
