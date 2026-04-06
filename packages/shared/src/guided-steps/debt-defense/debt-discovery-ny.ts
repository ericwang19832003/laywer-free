import type { GuidedStepConfig } from '../types'

export const debtDiscoveryNyConfig: GuidedStepConfig = {
  title: 'Use Discovery to Fight Back',
  reassurance:
    'Discovery is your most powerful tool. It forces the collector to prove they own the debt and that the amount is correct.',

  questions: [
    // === Overview ===
    {
      id: 'discovery_overview',
      type: 'info',
      prompt:
        'WHAT IS DISCOVERY?\n\n' +
        'Discovery is the legal process that forces the other side to share documents and answer questions under oath BEFORE trial. In debt cases, this is critical because debt buyers often cannot prove they own your debt or that the amount is correct.\n\n' +
        'In New York, discovery is governed by CPLR Article 31. If the collector can\'t prove their case through discovery, you may win without ever going to trial.',
    },
    {
      id: 'ccfa_overview',
      type: 'info',
      prompt:
        'NEW YORK CONSUMER CREDIT FAIRNESS ACT:\n\n' +
        'New York\'s Consumer Credit Fairness Act requires debt collectors to include specific documentation with their complaint — including proof of the chain of assignment, the original agreement, and an itemized accounting of the debt.\n\n' +
        'If any of this documentation is missing from the complaint, discovery is your tool to expose those gaps and challenge the plaintiff\'s standing to sue.',
    },

    // === Interrogatories ===
    {
      id: 'interrogatories',
      type: 'info',
      prompt:
        'INTERROGATORIES (CPLR §3130):\n\n' +
        'Interrogatories are written questions the other side must answer under oath. In New York, you are limited to 25 interrogatories for commercial claims (CPLR §3130.1). Make them count.\n\n' +
        'Critical questions to ask:\n' +
        '• "Identify each person or entity that has owned this account from origination to the present, including the date of each transfer."\n' +
        '• "State the amount you paid to acquire this account and the date of acquisition."\n' +
        '• "Identify the original signed agreement between the original creditor and the defendant."\n' +
        '• "State the exact date the account was first in default and the basis for that determination."\n' +
        '• "State the date of the last payment made on this account and the amount of that payment."\n' +
        '• "State the exact amount alleged to be owed and how it was calculated, including all fees, interest, and charges."',
    },

    // === Document Demands ===
    {
      id: 'document_demands',
      type: 'info',
      prompt:
        'DOCUMENT DEMANDS (CPLR §3120):\n\n' +
        'These force the plaintiff to produce actual documents. There is no strict numerical limit on document demands in New York, but requests must be reasonable and relevant.\n\n' +
        'Critical documents to request:\n' +
        '• The ORIGINAL signed credit agreement between the defendant and the original creditor\n' +
        '• The complete chain of assignment from original creditor to the current plaintiff\n' +
        '• All account statements from origination to charge-off\n' +
        '• The purchase/sale agreement by which the plaintiff acquired this account\n' +
        '• The bill of sale identifying this specific account\n' +
        '• Any data file or spreadsheet provided with the purchase that references this account\n' +
        '• All documents required under the Consumer Credit Fairness Act that were not attached to the complaint\n\n' +
        'Debt buyers often have NONE of these documents — they buy accounts in bulk spreadsheets.',
    },

    // === Notice to Admit / Requests for Admission ===
    {
      id: 'requests_admission',
      type: 'info',
      prompt:
        'NOTICE TO ADMIT — THE NUCLEAR WEAPON (CPLR §3123):\n\n' +
        'This is the most powerful discovery tool in New York. You serve a Notice to Admit asking the plaintiff to admit or deny specific facts. If they do NOT respond within 20 DAYS, the facts are DEEMED ADMITTED — meaning the court treats them as true.\n\n' +
        'The 20-day window is shorter than many other states, making this an especially powerful weapon.\n\n' +
        'Strategic admissions that can END your case:\n' +
        '• "Admit that Plaintiff does not possess the original signed credit agreement between the Defendant and [Original Creditor]."\n' +
        '• "Admit that Plaintiff purchased the alleged debt for less than the face value of the account."\n' +
        '• "Admit that the statute of limitations on the alleged debt expired before this lawsuit was filed."\n' +
        '• "Admit that Plaintiff cannot identify any person with personal knowledge of the original transaction."\n' +
        '• "Admit that Plaintiff has no records of payments made by the Defendant."\n' +
        '• "Admit that the complaint does not comply with the requirements of the Consumer Credit Fairness Act."\n\n' +
        'If these are deemed admitted, file a Motion for Summary Judgment — the case is effectively over.',
    },
    {
      id: 'rfa_deadline_warning',
      type: 'info',
      prompt:
        'CRITICAL DEADLINE: The plaintiff has only 20 DAYS to respond to a Notice to Admit under CPLR §3123. If they miss the deadline, every item is DEEMED ADMITTED.\n\n' +
        'Track this deadline carefully. If they miss it, file a Motion for Summary Judgment citing CPLR §3123.',
    },

    // === Depositions ===
    {
      id: 'depositions',
      type: 'info',
      prompt:
        'DEPOSITIONS (CPLR §3107):\n\n' +
        'You have the right to depose (question under oath in person) parties and witnesses. In debt cases, this can be devastating because debt buyers usually have no employee with personal knowledge of the original account.\n\n' +
        'Key deposition questions:\n' +
        '• How did you acquire this account?\n' +
        '• Do you have the original signed credit agreement?\n' +
        '• Can you describe the consideration paid for this specific debt?\n' +
        '• What is the chain of title from the original creditor to your company?\n' +
        '• What records did you receive when you purchased this account?\n\n' +
        'If they cannot produce a witness with personal knowledge, their case is severely weakened.',
    },

    // === Arbitration ===
    {
      id: 'arbitration_intro',
      type: 'yes_no',
      prompt: 'Is this a credit card debt?',
      helpText:
        'Many credit card agreements contain arbitration clauses that can be strategically used in your favor.',
    },
    {
      id: 'arbitration_info',
      type: 'info',
      prompt:
        'MOTION TO COMPEL ARBITRATION:\n\n' +
        'Many credit card agreements include an arbitration clause. You can USE this against the debt collector.\n\n' +
        'How to check: Look up your credit card agreement at the CFPB database:\n' +
        'consumerfinance.gov/credit-cards/agreements\n\n' +
        'WHY THIS WORKS:\n' +
        '• Arbitration filing fees for the plaintiff/business: $1,500+ (JAMS) or $1,300+ (AAA)\n' +
        '• Under JAMS and AAA consumer rules, the BUSINESS must pay almost all fees\n' +
        '• Debt buyers often ABANDON cases rather than pay these fees\n' +
        '• The debt they bought for pennies on the dollar isn\'t worth $1,500+ in arbitration costs\n\n' +
        'IMPORTANT: File early — waiting too long to request arbitration can waive your right. The court may find you waived it by participating too much in the lawsuit.',
      showIf: (answers) => answers.arbitration_intro === 'yes',
    },

    // === What if they don't respond? ===
    {
      id: 'no_response',
      type: 'info',
      prompt:
        'WHAT IF THE PLAINTIFF DOESN\'T RESPOND TO DISCOVERY?\n\n' +
        'This happens frequently with debt buyers. Here\'s the escalation path:\n\n' +
        '1. GOOD FAITH EFFORT — Contact the plaintiff\'s attorney to request compliance. Document your efforts.\n\n' +
        '2. MOTION TO COMPEL (CPLR §3124) — Ask the court to order them to respond. The court can award you costs and attorney\'s fees.\n\n' +
        '3. SANCTIONS FOR NON-COMPLIANCE (CPLR §3126) — If they still don\'t comply after a court order, the court can:\n' +
        '   • Strike the plaintiff\'s pleadings (dismiss their case)\n' +
        '   • Preclude them from introducing evidence\n' +
        '   • Hold them in contempt\n\n' +
        'Each step puts more pressure on the debt buyer. Many will dismiss or settle rather than comply.',
    },

    // === Timeline ===
    {
      id: 'timeline',
      type: 'info',
      prompt:
        'DISCOVERY TIMELINE:\n\n' +
        '• Interrogatories: response due within 20 days of service\n' +
        '• Document demands (CPLR §3120): response due within 20 days of service\n' +
        '• Notice to Admit (CPLR §3123): response due within 20 days — if missed, DEEMED ADMITTED\n' +
        '• Depositions: reasonable notice required\n\n' +
        'Serve your discovery as soon as possible after filing your answer.\n\n' +
        'TIP: Serve interrogatories, document demands, and a Notice to Admit all at the same time to maximize pressure. The 20-day admission deadline creates urgency the plaintiff cannot ignore.',
    },

    // === Ready to proceed? ===
    {
      id: 'ready_to_proceed',
      type: 'single_choice',
      prompt: 'What would you like to do?',
      options: [
        { value: 'send_discovery', label: 'I\'m ready to send discovery requests' },
        { value: 'received_discovery', label: 'I received discovery from the plaintiff' },
        { value: 'no_response', label: 'The plaintiff hasn\'t responded to my discovery' },
        { value: 'need_more_info', label: 'I need more information before deciding' },
      ],
    },
    {
      id: 'send_discovery_info',
      type: 'info',
      prompt:
        'Great. Here\'s your action plan:\n\n' +
        '1. Draft your Interrogatories (up to 25 questions)\n' +
        '2. Draft your Document Demands (CPLR §3120) — request the original agreement, chain of assignment, and account statements\n' +
        '3. Draft your Notice to Admit (CPLR §3123) — these are the most critical, 20-day deadline\n' +
        '4. Serve all discovery requests together\n' +
        '5. Calendar the 20-day response deadline for the Notice to Admit\n' +
        '6. If no response, make a good faith effort to resolve, then file a Motion to Compel (CPLR §3124)\n\n' +
        'Also check your credit card agreement for an arbitration clause at consumerfinance.gov/credit-cards/agreements.',
      showIf: (answers) => answers.ready_to_proceed === 'send_discovery',
    },
    {
      id: 'received_discovery_info',
      type: 'info',
      prompt:
        'You have 20 days to respond to discovery requests. Key rules:\n\n' +
        '• You must respond to each request individually\n' +
        '• You can object to improper requests (overbroad, vague, burdensome, not relevant)\n' +
        '• Do NOT ignore discovery — failure to respond can result in sanctions under CPLR §3126 or the court ruling against you\n' +
        '• You can claim privileges (attorney-client, privacy) but must state the basis\n' +
        '• For a Notice to Admit, be very careful — if you fail to respond within 20 days, the items are DEEMED ADMITTED against you',
      showIf: (answers) => answers.ready_to_proceed === 'received_discovery',
    },
    {
      id: 'no_response_action',
      type: 'info',
      prompt:
        'Action steps for non-response:\n\n' +
        '1. Confirm the response deadline has passed (20 days from service)\n' +
        '2. Make a good faith effort to resolve — contact plaintiff\'s attorney in writing\n' +
        '3. If still no response, file a Motion to Compel under CPLR §3124\n' +
        '4. Request costs and fees in your motion\n' +
        '5. For Notice to Admit specifically, file a Motion for Summary Judgment citing deemed admissions under CPLR §3123\n' +
        '6. If they violate a court order to respond, seek sanctions under CPLR §3126 (striking pleadings, preclusion, or contempt)',
      showIf: (answers) => answers.ready_to_proceed === 'no_response',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    items.push({
      status: 'info',
      text: 'Discovery forces the collector to prove their case. Debt buyers often lack the original agreement, chain of ownership, and payment history. NY\'s Consumer Credit Fairness Act requires specific documentation — use discovery to expose gaps.',
    })

    items.push({
      status: 'info',
      text: 'NY discovery is governed by CPLR Article 31. Interrogatories limited to 25. No strict limit on document demands. Notice to Admit has a 20-day response deadline.',
    })

    items.push({
      status: 'needed',
      text: 'Send Interrogatories, Document Demands (CPLR §3120), and a Notice to Admit (CPLR §3123). Serve all at once for maximum pressure.',
    })

    items.push({
      status: 'info',
      text: 'Notice to Admit is the most powerful tool — if not answered within 20 days, items are DEEMED ADMITTED and can win your case outright via Motion for Summary Judgment.',
    })

    if (answers.arbitration_intro === 'yes') {
      items.push({
        status: 'needed',
        text: 'Check your credit card agreement for an arbitration clause at consumerfinance.gov/credit-cards/agreements. If present, file a Motion to Compel Arbitration early — the $1,500+ filing fees often cause debt buyers to abandon the case.',
      })
    }

    if (answers.ready_to_proceed === 'send_discovery') {
      items.push({
        status: 'needed',
        text: 'Draft your interrogatories (up to 25), document demands, and Notice to Admit. Serve them and calendar the 20-day deadline.',
      })
    } else if (answers.ready_to_proceed === 'received_discovery') {
      items.push({
        status: 'needed',
        text: 'Respond to plaintiff\'s discovery within 20 days. Object to improper requests. Do NOT ignore — especially the Notice to Admit.',
      })
    } else if (answers.ready_to_proceed === 'no_response') {
      items.push({
        status: 'needed',
        text: 'Make a good faith effort to resolve, then file a Motion to Compel under CPLR §3124. For unanswered Notice to Admit, file a Motion for Summary Judgment citing CPLR §3123 deemed admissions.',
      })
    }

    items.push({
      status: 'info',
      text: 'If the plaintiff ignores a court order to respond, seek sanctions under CPLR §3126 — the court can strike their pleadings, preclude evidence, or hold them in contempt.',
    })

    return items
  },
}
