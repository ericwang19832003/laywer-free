import type { GuidedStepConfig } from '../types'

export const debtDiscoveryFlConfig: GuidedStepConfig = {
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
        'Florida discovery is governed by Fla. R. Civ. P. 1.280–1.400. Unlike federal court, Florida does NOT require mandatory initial disclosures — you must actively request discovery.\n\n' +
        'If they can\'t prove their case through discovery, you may win without ever going to trial.',
    },
    {
      id: 'case_type',
      type: 'single_choice',
      prompt: 'What type of court is your case in?',
      helpText:
        'Florida has different discovery rules depending on the court. County Court handles cases up to $50,000, and Small Claims handles cases under $8,000 with very limited discovery.',
      options: [
        { value: 'circuit', label: 'Circuit Court (over $50,000)' },
        { value: 'county', label: 'County Court ($8,000–$50,000)' },
        { value: 'small_claims', label: 'Small Claims (under $8,000)' },
        { value: 'unsure', label: 'I\'m not sure' },
      ],
    },
    {
      id: 'case_type_unsure',
      type: 'info',
      prompt:
        'Check your complaint or summons — it should identify the court. Most consumer debt collection cases are in County Court. If the amount is under $8,000, it may be in Small Claims. The discovery guidance below assumes County or Circuit Court rules.',
      showIf: (answers) => answers.case_type === 'unsure',
    },
    {
      id: 'small_claims_warning',
      type: 'info',
      prompt:
        'SMALL CLAIMS DISCOVERY IS VERY LIMITED (Fla. Sm. Cl. R. 7.020):\n\n' +
        'In Small Claims Court, formal discovery (interrogatories, requests for production, etc.) is generally NOT available unless the court grants permission. You may still:\n\n' +
        '• Subpoena witnesses and documents for trial\n' +
        '• Request the court allow limited discovery for good cause\n' +
        '• Demand the plaintiff bring the original agreement and chain of assignment to trial\n\n' +
        'If the debt buyer can\'t produce documents at trial, argue they failed to meet their burden of proof.',
      showIf: (answers) => answers.case_type === 'small_claims',
    },

    // === Interrogatories ===
    {
      id: 'interrogatories',
      type: 'info',
      prompt:
        'INTERROGATORIES (Fla. R. Civ. P. 1.340(a)):\n\n' +
        'Interrogatories are written questions the other side must answer under oath. Florida limits you to 30 interrogatories, including subparts.\n\n' +
        'Critical questions to ask:\n' +
        '• "Identify each person or entity that has owned this account from origination to the present, including the date of each transfer."\n' +
        '• "State the amount you paid to acquire this account and the date of acquisition."\n' +
        '• "Identify the original signed agreement between the original creditor and the defendant."\n' +
        '• "Provide a complete payment history for this account from origination to the present."\n' +
        '• "State the exact amount alleged to be owed and how it was calculated, including all fees, interest, and charges."\n' +
        '• "Identify all documents supporting Plaintiff\'s claim that it is the rightful owner of this account."\n' +
        '• "State whether Plaintiff is licensed under the Florida Consumer Collection Practices Act (FCCPA) and provide the license number."',
    },

    // === Requests for Production ===
    {
      id: 'requests_production',
      type: 'info',
      prompt:
        'REQUESTS FOR PRODUCTION OF DOCUMENTS (Fla. R. Civ. P. 1.350):\n\n' +
        'These force the plaintiff to hand over actual documents. There is no specific numerical limit on requests for production in Florida, but they must be reasonable.\n\n' +
        'Critical documents to request:\n' +
        '• The ORIGINAL signed credit agreement between the defendant and the original creditor\n' +
        '• The complete chain of assignment from original creditor to the current plaintiff\n' +
        '• All account statements from origination to charge-off\n' +
        '• The purchase/sale agreement by which the plaintiff acquired this account\n' +
        '• The bill of sale identifying this specific account\n' +
        '• Any data file or spreadsheet provided with the purchase that references this account\n' +
        '• Plaintiff\'s FCCPA license or proof of compliance with Florida Consumer Collection Practices Act\n' +
        '• Any and all communications between Plaintiff and the original creditor regarding this account\n\n' +
        'Debt buyers often have NONE of these documents — they buy accounts in bulk spreadsheets.',
    },

    // === Requests for Admission ===
    {
      id: 'requests_admission',
      type: 'info',
      prompt:
        'REQUESTS FOR ADMISSION — THE NUCLEAR WEAPON (Fla. R. Civ. P. 1.370):\n\n' +
        'This is the most powerful discovery tool. You ask the plaintiff to admit or deny specific facts. If they do NOT respond within 30 days, the facts are DEEMED ADMITTED — meaning the court treats them as true.\n\n' +
        'There is no specific numerical limit on requests for admission in Florida.\n\n' +
        'Strategic RFAs that can END your case:\n' +
        '• "Admit that Plaintiff does not possess the original signed credit agreement between the Defendant and [Original Creditor]."\n' +
        '• "Admit that Plaintiff purchased the alleged debt for less than the face value of the account."\n' +
        '• "Admit that the statute of limitations on the alleged debt expired before this lawsuit was filed."\n' +
        '• "Admit that Plaintiff cannot identify any person with personal knowledge of the original transaction."\n' +
        '• "Admit that Plaintiff has no records of payments made by the Defendant."\n' +
        '• "Admit that Plaintiff is not licensed under the Florida Consumer Collection Practices Act (FCCPA)."\n\n' +
        'If these are deemed admitted, file a Motion for Summary Judgment — the case is effectively over.',
    },
    {
      id: 'rfa_deadline_warning',
      type: 'info',
      prompt:
        'CRITICAL DEADLINE: The plaintiff has 30 days to respond to Requests for Admission (Fla. R. Civ. P. 1.370). If they miss the deadline, every request is DEEMED ADMITTED.\n\n' +
        'Track this deadline carefully. If they miss it, file a Motion for Summary Judgment citing the deemed admissions under Fla. R. Civ. P. 1.370(b).\n\n' +
        'NOTE: The court CAN allow late withdrawal of admissions, but only if (1) presentation of the merits will be served, and (2) the party relying on the admissions won\'t be prejudiced. Don\'t delay — act quickly once the deadline passes.',
    },

    // === Depositions ===
    {
      id: 'depositions_info',
      type: 'info',
      prompt:
        'DEPOSITIONS (Fla. R. Civ. P. 1.310):\n\n' +
        'A deposition lets you question the plaintiff\'s representative under oath, in person or by video. This can be devastating in debt cases because debt buyers often have no one with actual knowledge of the account.\n\n' +
        'Consider deposing:\n' +
        '• The person who signed the affidavit attached to the complaint\n' +
        '• A corporate representative with knowledge of the account acquisition\n\n' +
        'If their witness cannot answer basic questions (When was the account opened? What were the terms? How was the balance calculated?), it exposes how weak their case is.',
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
        'IMPORTANT: File early — waiting too long to request arbitration can waive your right. The court may find you waived it by participating too much in the lawsuit.\n\n' +
        'File a "Motion to Compel Arbitration and Stay Proceedings" under the Federal Arbitration Act (9 U.S.C. §§1–16) and/or the Florida Arbitration Code (Fla. Stat. §682.01 et seq.).',
      showIf: (answers) => answers.arbitration_intro === 'yes',
    },

    // === What if they don't respond? ===
    {
      id: 'no_response',
      type: 'info',
      prompt:
        'WHAT IF THE PLAINTIFF DOESN\'T RESPOND TO DISCOVERY?\n\n' +
        'This happens frequently with debt buyers. Here\'s the escalation path:\n\n' +
        '1. GOOD FAITH CONFERENCE — Before filing any motion, Florida requires you to certify that you made a good faith effort to resolve the dispute. Contact opposing counsel and document your attempt.\n\n' +
        '2. MOTION TO COMPEL (Fla. R. Civ. P. 1.380(a)) — Ask the court to order them to respond. The court can award you reasonable expenses, including attorney\'s fees.\n\n' +
        '3. SANCTIONS (Fla. R. Civ. P. 1.380(b)) — If they still don\'t comply after a court order, the court can:\n' +
        '   • Strike their pleadings\n' +
        '   • Enter a default judgment against them\n' +
        '   • Hold them in contempt of court\n' +
        '   • Dismiss their case entirely\n\n' +
        'Each step puts more pressure on the debt buyer. Many will dismiss or settle rather than comply.',
    },

    // === Timeline ===
    {
      id: 'timeline',
      type: 'info',
      prompt:
        'DISCOVERY TIMELINE:\n\n' +
        '• Interrogatories response deadline: 30 days from date of service (Fla. R. Civ. P. 1.340(a))\n' +
        '• Requests for Admission response deadline: 30 days from date of service (Fla. R. Civ. P. 1.370)\n' +
        '• Requests for Production response deadline: 30 days from date of service (Fla. R. Civ. P. 1.350)\n' +
        '• Add 5 days if served by mail (Fla. R. Civ. P. 1.090(e))\n\n' +
        'Serve your discovery as soon as possible. In Florida, discovery is generally available after the lawsuit is filed — you don\'t need to wait for a scheduling order.\n\n' +
        'TIP: Serve all three types (interrogatories, requests for production, and requests for admission) at the same time to maximize pressure.\n\n' +
        'COUNTY COURT NOTE: Some counties have local rules that may limit or modify discovery procedures. Check your county\'s local rules.',
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
        '1. Draft your Interrogatories (up to 30 total, including subparts)\n' +
        '2. Draft your Requests for Production of Documents\n' +
        '3. Draft your Requests for Admission — these are the most critical\n' +
        '4. Serve all discovery by mail, email, or hand delivery (with certificate of service)\n' +
        '5. Calendar the response deadline (30 days + 5 for mail)\n' +
        '6. If no response, conduct a good faith conference, then file a Motion to Compel\n\n' +
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
        '2. Conduct a good faith conference — contact opposing counsel and document the attempt\n' +
        '3. If still no response, file a Motion to Compel (Fla. R. Civ. P. 1.380(a))\n' +
        '4. Request reasonable expenses and attorney\'s fees in your motion\n' +
        '5. For Requests for Admission specifically, file a Motion for Summary Judgment citing deemed admissions under Fla. R. Civ. P. 1.370(b)\n' +
        '6. If they violate a court order to respond, file a Motion for Sanctions seeking striking of pleadings or default judgment (Fla. R. Civ. P. 1.380(b))',
      showIf: (answers) => answers.ready_to_proceed === 'no_response',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    items.push({
      status: 'info',
      text: 'Discovery forces the collector to prove their case. Debt buyers often lack the original agreement, chain of ownership, and payment history.',
    })

    const caseType = answers.case_type as string
    if (caseType === 'small_claims') {
      items.push({
        status: 'info',
        text: 'Your case is in Small Claims Court (under $8,000). Formal discovery is very limited — focus on subpoenas and demanding documents at trial.',
      })
    } else if (caseType === 'county') {
      items.push({
        status: 'info',
        text: 'Your case is in County Court ($8,000–$50,000). Full discovery is available but check local rules for any county-specific limits.',
      })
    } else if (caseType === 'circuit') {
      items.push({
        status: 'info',
        text: 'Your case is in Circuit Court (over $50,000). Full discovery is available with no special limits beyond the 30-interrogatory cap.',
      })
    } else {
      items.push({
        status: 'info',
        text: 'Check your complaint to determine your court type. Most consumer debt cases are in County Court. Discovery limits may vary.',
      })
    }

    if (caseType !== 'small_claims') {
      items.push({
        status: 'needed',
        text: 'Send Interrogatories (up to 30), Requests for Production, and Requests for Admission. Serve all at once for maximum pressure.',
      })

      items.push({
        status: 'info',
        text: 'Requests for Admission are the most powerful tool — if not answered within 30 days (+5 mail), they are DEEMED ADMITTED and can win your case outright.',
      })
    }

    if (answers.arbitration_intro === 'yes') {
      items.push({
        status: 'needed',
        text: 'Check your credit card agreement for an arbitration clause at consumerfinance.gov/credit-cards/agreements. If present, file a Motion to Compel Arbitration early — the $1,500+ filing fees often cause debt buyers to abandon the case.',
      })
    }

    if (answers.ready_to_proceed === 'send_discovery') {
      items.push({
        status: 'needed',
        text: 'Draft your interrogatories, requests for production, and requests for admission. Serve them and calendar the 35-day deadline (30 + 5 for mail).',
      })
    } else if (answers.ready_to_proceed === 'received_discovery') {
      items.push({
        status: 'needed',
        text: 'Respond to plaintiff\'s discovery within 30 days (+5 for mail). Object to improper requests. Do NOT ignore — especially Requests for Admission.',
      })
    } else if (answers.ready_to_proceed === 'no_response') {
      items.push({
        status: 'needed',
        text: 'Conduct a good faith conference, then file a Motion to Compel (Fla. R. Civ. P. 1.380(a)). For unanswered RFAs, file a Motion for Summary Judgment citing deemed admissions under Fla. R. Civ. P. 1.370(b).',
      })
    }

    items.push({
      status: 'info',
      text: 'If the plaintiff ignores a court order to respond, escalate to a Motion for Sanctions — the court can strike their pleadings, enter default judgment, or hold them in contempt (Fla. R. Civ. P. 1.380(b)).',
    })

    return items
  },
}
