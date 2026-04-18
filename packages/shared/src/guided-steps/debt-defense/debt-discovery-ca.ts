import type { GuidedStepConfig } from '../types'

export const debtDiscoveryCaConfig: GuidedStepConfig = {
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
        'If they can\'t prove their case through discovery, you may win without ever going to trial.',
    },
    {
      id: 'case_type',
      type: 'single_choice',
      prompt: 'Is your case a limited civil case (amount in dispute is $25,000 or less)?',
      helpText:
        'Most consumer debt cases are limited civil. The discovery limits below apply to limited civil cases. Unlimited civil cases have higher limits.',
      options: [
        { value: 'limited', label: 'Yes — limited civil ($25,000 or less)' },
        { value: 'unlimited', label: 'No — unlimited civil (over $25,000)' },
        { value: 'unsure', label: 'I\'m not sure' },
      ],
    },
    {
      id: 'case_type_unsure',
      type: 'info',
      prompt:
        'Check your complaint or summons — it should say "Limited Civil Case" or "Unlimited Civil Case" near the top. Most consumer debt collection cases are limited civil. The limits below assume limited civil (35 per category).',
      showIf: (answers) => answers.case_type === 'unsure',
    },

    // === Form Interrogatories ===
    {
      id: 'form_interrogatories',
      type: 'info',
      prompt:
        'FORM INTERROGATORIES (Judicial Council Form DISC-001):\n\n' +
        'These are pre-written questions approved by the California Judicial Council. You check the boxes for the questions you want answered. In limited civil cases, you can ask up to 35 form interrogatories (CCP §94).\n\n' +
        'Key form interrogatories for debt cases:\n' +
        '• Section 2.0 — General background questions\n' +
        '• Section 17.1 — Contention interrogatories (forces them to explain the basis for each denial or claim)\n\n' +
        'You can download DISC-001 from the California Courts website (courts.ca.gov).',
    },

    // === Special Interrogatories ===
    {
      id: 'special_interrogatories',
      type: 'info',
      prompt:
        'SPECIAL INTERROGATORIES (CCP §2030.010):\n\n' +
        'These are YOUR custom questions. In limited civil cases, you are limited to 35 total (CCP §94). Make them count.\n\n' +
        'Critical questions to ask:\n' +
        '• "Identify each person or entity that has owned this account from origination to the present, including the date of each transfer."\n' +
        '• "State the amount you paid to acquire this account and the date of acquisition."\n' +
        '• "Identify the original signed agreement between the original creditor and the defendant."\n' +
        '• "Provide a complete payment history for this account from origination to the present."\n' +
        '• "State the exact amount alleged to be owed and how it was calculated, including all fees, interest, and charges."\n' +
        '• "Identify all documents supporting Plaintiff\'s claim that it is the rightful owner of this account."',
    },

    // === Requests for Production ===
    {
      id: 'requests_production',
      type: 'info',
      prompt:
        'REQUESTS FOR PRODUCTION OF DOCUMENTS (CCP §2031.010):\n\n' +
        'These force the plaintiff to hand over actual documents. Limited to 35 in limited civil cases (CCP §94).\n\n' +
        'Critical documents to request:\n' +
        '• The ORIGINAL signed credit agreement between the defendant and the original creditor\n' +
        '• The complete chain of assignment from original creditor to the current plaintiff\n' +
        '• All account statements from origination to charge-off\n' +
        '• The purchase/sale agreement by which the plaintiff acquired this account\n' +
        '• The bill of sale identifying this specific account\n' +
        '• Any data file or spreadsheet provided with the purchase that references this account\n' +
        '• Plaintiff\'s SB 908 (Debt Collection Licensing Act) license from the DFPI\n\n' +
        'Debt buyers often have NONE of these documents — they buy accounts in bulk spreadsheets.',
    },

    // === Requests for Admission ===
    {
      id: 'requests_admission',
      type: 'info',
      prompt:
        'REQUESTS FOR ADMISSION — THE NUCLEAR WEAPON (CCP §2033.010):\n\n' +
        'This is the most powerful discovery tool. You ask the plaintiff to admit or deny specific facts. If they do NOT respond within 30 days, the facts are DEEMED ADMITTED — meaning the court treats them as true.\n\n' +
        'Limited to 35 in limited civil cases (CCP §94).\n\n' +
        'Strategic RFAs that can END your case:\n' +
        '• "Admit that Plaintiff does not possess the original signed credit agreement between the Defendant and [Original Creditor]."\n' +
        '• "Admit that Plaintiff purchased the alleged debt for less than the face value of the account."\n' +
        '• "Admit that the statute of limitations on the alleged debt expired before this lawsuit was filed."\n' +
        '• "Admit that Plaintiff cannot identify any person with personal knowledge of the original transaction."\n' +
        '• "Admit that Plaintiff has no records of payments made by the Defendant."\n\n' +
        'If these are deemed admitted, file a Motion for Summary Judgment — the case is effectively over.',
    },
    {
      id: 'rfa_deadline_warning',
      type: 'info',
      prompt:
        'CRITICAL DEADLINE: The plaintiff has 30 days to respond to Requests for Admission (plus 5 days if served by mail, plus 2 days if served by overnight delivery). If they miss the deadline, every request is DEEMED ADMITTED.\n\n' +
        'Track this deadline carefully. If they miss it, file a Motion for Summary Judgment citing CCP §2033.280.',
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
        'MOTION TO COMPEL ARBITRATION (CCP §1281.2):\n\n' +
        'Many credit card agreements include an arbitration clause. You can USE this against the debt collector.\n\n' +
        'How to check: Look up your credit card agreement at the CFPB database:\n' +
        'consumerfinance.gov/credit-cards/agreements\n\n' +
        'WHY THIS WORKS:\n' +
        '• Arbitration filing fees for the plaintiff/business: $1,500+ (JAMS) or $1,300+ (AAA)\n' +
        '• Under JAMS and AAA consumer rules, the BUSINESS must pay almost all fees\n' +
        '• Debt buyers often ABANDON cases rather than pay these fees\n' +
        '• The debt they bought for pennies on the dollar isn\'t worth $1,500+ in arbitration costs\n\n' +
        'IMPORTANT: File early — waiting too long to request arbitration can waive your right. The court may find you waived it by participating too much in the lawsuit.\n\n' +
        'File a "Petition to Compel Arbitration" or "Motion to Compel Arbitration and Stay Proceedings."',
      showIf: (answers) => answers.arbitration_intro === 'yes',
    },

    // === What if they don't respond? ===
    {
      id: 'no_response',
      type: 'info',
      prompt:
        'WHAT IF THE PLAINTIFF DOESN\'T RESPOND TO DISCOVERY?\n\n' +
        'This happens frequently with debt buyers. Here\'s the escalation path:\n\n' +
        '1. MEET AND CONFER — Send a letter (or call) asking them to respond. This is required before filing a motion.\n\n' +
        '2. MOTION TO COMPEL (CCP §2030.300 for interrogatories, §2031.310 for production) — Ask the court to order them to respond. The court can award you sanctions (money).\n\n' +
        '3. MOTION FOR TERMINATING SANCTIONS — If they still don\'t comply after a court order, ask the court to dismiss their case or strike their pleading. This is the ultimate remedy.\n\n' +
        'Each step puts more pressure on the debt buyer. Many will dismiss or settle rather than comply.',
    },

    // === Timeline ===
    {
      id: 'timeline',
      type: 'info',
      prompt:
        'DISCOVERY TIMELINE:\n\n' +
        '• Response deadline: 30 days from date of service\n' +
        '• Add 5 days if served by mail (CCP §1013)\n' +
        '• Add 2 days if served by overnight delivery\n' +
        '• Requests for Admission: same deadlines, but consequences of non-response are automatic (deemed admitted)\n\n' +
        'Serve your discovery as soon as possible. In limited civil cases, discovery is generally available after the defendant has responded to the complaint.\n\n' +
        'TIP: Serve all four types (form interrogatories, special interrogatories, requests for production, and requests for admission) at the same time to maximize pressure.',
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
        '1. Download form DISC-001 (Form Interrogatories) from courts.ca.gov\n' +
        '2. Draft your Special Interrogatories and Requests for Production\n' +
        '3. Draft your Requests for Admission — these are the most critical\n' +
        '4. Serve all discovery by mail (add proof of service)\n' +
        '5. Calendar the response deadline (30 days + 5 for mail)\n' +
        '6. If no response, meet and confer, then file a Motion to Compel\n\n' +
        'Also check your credit card agreement for an arbitration clause at consumerfinance.gov/credit-cards/agreements.',
      showIf: (answers) => answers.ready_to_proceed === 'send_discovery',
    },
    {
      id: 'received_discovery_info',
      type: 'info',
      prompt:
        'You have 30 days to respond (plus 5 for mail service). Key rules:\n\n' +
        '• You must respond to each request individually\n' +
        '• You can object to improper requests (overbroad, vague, burdensome, not relevant)\n' +
        '• Do NOT ignore discovery — failure to respond can result in sanctions or the court ruling against you\n' +
        '• You can claim privileges (attorney-client, privacy) but must state the basis\n' +
        '• For requests for admission, be very careful — if you fail to respond, they are deemed admitted AGAINST you',
      showIf: (answers) => answers.ready_to_proceed === 'received_discovery',
    },
    {
      id: 'no_response_action',
      type: 'info',
      prompt:
        'Action steps for non-response:\n\n' +
        '1. Confirm the response deadline has passed (30 days + 5 for mail)\n' +
        '2. Send a meet-and-confer letter giving them 10 more days\n' +
        '3. If still no response, file a Motion to Compel with the court\n' +
        '4. Request monetary sanctions in your motion\n' +
        '5. For Requests for Admission specifically, file a Motion for Summary Judgment citing deemed admissions (CCP §2033.280)\n' +
        '6. If they violate a court order to respond, file a Motion for Terminating Sanctions',
      showIf: (answers) => answers.ready_to_proceed === 'no_response',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    items.push({
      status: 'info',
      text: 'Discovery forces the collector to prove their case. Debt buyers often lack the original agreement, chain of ownership, and payment history.',
    })

    const caseType =
      answers.case_type === 'unlimited' ? 'unlimited' : 'limited'
    items.push({
      status: 'info',
      text: `Your case is ${caseType} civil. Discovery limit: ${caseType === 'limited' ? '35' : 'no strict limit'} per category.`,
    })

    items.push({
      status: 'needed',
      text: 'Send Form Interrogatories (DISC-001), Special Interrogatories, Requests for Production, and Requests for Admission. Serve all at once for maximum pressure.',
    })

    items.push({
      status: 'info',
      text: 'Requests for Admission are the most powerful tool — if not answered within 30 days (+5 mail), they are DEEMED ADMITTED and can win your case outright.',
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
        text: 'Download DISC-001, draft your discovery requests, serve them, and calendar the 35-day deadline (30 + 5 for mail).',
      })
    } else if (answers.ready_to_proceed === 'received_discovery') {
      items.push({
        status: 'needed',
        text: 'Respond to plaintiff\'s discovery within 30 days (+5 for mail). Object to improper requests. Do NOT ignore — especially Requests for Admission.',
      })
    } else if (answers.ready_to_proceed === 'no_response') {
      items.push({
        status: 'needed',
        text: 'Send a meet-and-confer letter, then file a Motion to Compel. For unanswered RFAs, file a Motion for Summary Judgment citing CCP §2033.280.',
      })
    }

    items.push({
      status: 'info',
      text: 'If the plaintiff ignores a court order to respond, escalate to a Motion for Terminating Sanctions to dismiss their case.',
    })

    return items
  },
}
