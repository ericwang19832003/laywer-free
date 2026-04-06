import type { GuidedStepConfig } from '../types'

export const contractFilingGuidePaConfig: GuidedStepConfig = {
  title: 'Pennsylvania Contract Dispute — Statute of Limitations & Filing Guide',
  reassurance:
    "Pennsylvania has clear rules for contract disputes. We'll help you determine if your claim is timely and guide you through the filing process step by step.",

  questions: [
    // === Statute of Limitations ===
    {
      id: 'sol_intro',
      type: 'info',
      prompt:
        'STATUTE OF LIMITATIONS — YOUR CLAIM MUST BE TIMELY\n\nPennsylvania gives you 4 years to file a contract lawsuit:\n\n• Written contracts: 4 years (42 Pa.C.S. §5525(a)(8))\n• Oral contracts: 4 years (42 Pa.C.S. §5525(a)(3))\n\nThe clock starts on the date of the breach — not when the contract was signed. If the deadline has passed, your claim is likely barred.',
    },
    {
      id: 'contract_type',
      type: 'single_choice',
      prompt: 'What type of contract is involved?',
      options: [
        { value: 'written', label: 'Written contract (signed agreement, letter, email exchange)' },
        { value: 'oral', label: 'Oral contract (verbal agreement, handshake deal)' },
        { value: 'unsure', label: 'I am not sure' },
      ],
    },
    {
      id: 'oral_contract_warning',
      type: 'info',
      prompt:
        'ORAL CONTRACT — STATUTE OF FRAUDS WARNING\n\nSome oral contracts are unenforceable under Pennsylvania\'s Statute of Frauds (33 Pa.C.S. §1 and UCC §2-201). An oral contract is NOT enforceable if it involves:\n\n• Sale of goods over $500 (UCC requirement)\n• Real property (sale, lease over 1 year, or mortgage)\n• Contracts that cannot be performed within 1 year\n• Promises to pay another\'s debt (surety)\n\nIf your oral contract falls into one of these categories, you may need to show partial performance or other evidence to overcome the Statute of Frauds.',
      showIf: (answers) => answers.contract_type === 'oral' || answers.contract_type === 'unsure',
    },
    {
      id: 'breach_timing',
      type: 'single_choice',
      prompt: 'When did the breach occur?',
      helpText:
        'The breach date is when the other party failed to perform — missed a payment, failed to deliver, or violated a term.',
      options: [
        { value: 'under_2_years', label: 'Less than 2 years ago' },
        { value: '2_to_4_years', label: '2 to 4 years ago' },
        { value: 'over_4_years', label: 'More than 4 years ago' },
        { value: 'unsure', label: 'I am not sure when the breach occurred' },
      ],
    },
    {
      id: 'sol_safe',
      type: 'info',
      prompt:
        'Your claim appears to be well within the 4-year statute of limitations. You should file promptly — waiting increases the risk of lost evidence and fading memories.',
      showIf: (answers) => answers.breach_timing === 'under_2_years',
    },
    {
      id: 'sol_urgent',
      type: 'info',
      prompt:
        'YOUR DEADLINE MAY BE APPROACHING. The statute of limitations is 4 years from the date of breach. Calculate your exact deadline and file as soon as possible. Once the deadline passes, your claim is permanently barred.',
      showIf: (answers) => answers.breach_timing === '2_to_4_years',
    },
    {
      id: 'sol_expired_warning',
      type: 'info',
      prompt:
        'WARNING: If the breach occurred more than 4 years ago, your claim is likely barred by the statute of limitations (42 Pa.C.S. §5525). However, there are narrow exceptions:\n\n• Discovery rule: if you could not have reasonably discovered the breach earlier\n• Defendant\'s absence from Pennsylvania (tolling)\n• Fraudulent concealment of the breach\n• Written acknowledgment or partial payment that restarted the clock\n\nConsult an attorney if you believe an exception applies.',
      showIf: (answers) => answers.breach_timing === 'over_4_years',
    },
    {
      id: 'sol_unsure_info',
      type: 'info',
      prompt:
        'Review your contract, emails, payment records, and any communications to pinpoint when the other party stopped performing. The 4-year clock starts on that date. If you cannot determine the breach date, consult an attorney — filing a time-barred claim wastes money and can expose you to sanctions.',
      showIf: (answers) => answers.breach_timing === 'unsure',
    },

    // === Court Selection ===
    {
      id: 'court_header',
      type: 'info',
      prompt:
        'CHOOSING THE RIGHT COURT\n\nPennsylvania has two main courts for contract disputes:\n\n• Magisterial District Court — claims under $12,000. Informal, no formal pleading rules, faster.\n• Court of Common Pleas — claims over $12,000 (no upper limit). Formal procedure, Pa. Rules of Civil Procedure apply.',
    },
    {
      id: 'total_damages',
      type: 'single_choice',
      prompt: 'How much are your total damages?',
      helpText:
        'Include the full amount owed, consequential damages (losses caused by the breach), and out-of-pocket costs. Do not include attorney fees unless the contract provides for them.',
      options: [
        { value: 'under_12k', label: 'Under $12,000' },
        { value: '12k_to_50k', label: '$12,000 to $50,000' },
        { value: 'over_50k', label: 'Over $50,000' },
      ],
    },
    {
      id: 'court_magisterial',
      type: 'info',
      prompt:
        'File in Magisterial District Court.\n\nFiling fee: approximately $45–$125 depending on the amount claimed.\n\nAdvantages:\n• Simpler process — no formal pleading rules\n• Faster resolution (hearing within 30–60 days)\n• Either party can APPEAL to the Court of Common Pleas for a brand-new trial (de novo) within 30 days of judgment\n\nFile a "Complaint in Civil Action" form at your local Magisterial District Court.',
      showIf: (answers) => answers.total_damages === 'under_12k',
    },
    {
      id: 'court_common_pleas',
      type: 'info',
      prompt:
        'File in the Court of Common Pleas.\n\nFiling fee: approximately $200–$350 depending on the county.\n\nIMPORTANT: If your claim is under the county\'s compulsory arbitration threshold ($25,000–$50,000 depending on county), the case will first go to mandatory arbitration. Either party can appeal the arbitration award for a full trial (de novo) within 30 days.',
      showIf: (answers) =>
        answers.total_damages === '12k_to_50k' || answers.total_damages === 'over_50k',
    },
    {
      id: 'arbitration_info',
      type: 'info',
      prompt:
        'COMPULSORY ARBITRATION\n\nMost PA counties require arbitration for claims under a threshold (typically $25,000–$50,000). This is NOT binding — either party can appeal for a de novo trial.\n\nArbitration is faster and less formal than a full trial. A panel of 3 attorneys hears your case. Many contract disputes settle at or after arbitration.',
      showIf: (answers) => answers.total_damages === '12k_to_50k',
    },

    // === Written Instrument Requirement ===
    {
      id: 'written_instrument_header',
      type: 'info',
      prompt:
        'CRITICAL RULE: Pa.R.C.P. 1019(i)\n\nIf your claim is based on a written contract, you MUST attach a copy of the contract to your complaint. If you are the defendant, the plaintiff must attach it to theirs.\n\nFailure to attach the writing is grounds for Preliminary Objections under Pa.R.C.P. 1028. The court can dismiss or require amendment of the complaint.',
      showIf: (answers) =>
        answers.contract_type === 'written' &&
        (answers.total_damages === '12k_to_50k' || answers.total_damages === 'over_50k'),
    },

    // === Venue ===
    {
      id: 'venue_info',
      type: 'info',
      prompt:
        'VENUE — WHERE TO FILE (Pa.R.C.P. 1006)\n\nFile in the county where:\n(a) The defendant resides\n(b) The contract was made (signed)\n(c) The breach occurred (where performance was due)\n\nIf the contract has a forum selection clause, that usually controls. Filing in the wrong venue lets the defendant request a transfer, which delays your case.',
    },

    // === Filing Method ===
    {
      id: 'filing_method',
      type: 'single_choice',
      prompt: 'How do you plan to file?',
      helpText:
        'Many PA counties now offer electronic filing. Check your county\'s Prothonotary website.',
      options: [
        { value: 'efile', label: 'Online (county e-filing system) — if available' },
        { value: 'in_person', label: 'In person at the Prothonotary\'s office' },
        { value: 'mail', label: 'By certified mail' },
      ],
    },
    {
      id: 'efile_instructions',
      type: 'info',
      prompt:
        'To file online:\n1. Check if your county offers e-filing (e.g., Philadelphia uses PACFile at pacfile.mdjs.us)\n2. Create an account and select "Civil Action — Breach of Contract"\n3. Upload your Complaint as a PDF, including the contract as an exhibit\n4. Pay the filing fee online\n5. You will receive a confirmation and docket number\n\nNot all counties offer e-filing. If yours does not, file in person or by mail.',
      showIf: (answers) => answers.filing_method === 'efile',
    },
    {
      id: 'in_person_instructions',
      type: 'info',
      prompt:
        "To file in person:\n1. Print at least 3 copies of your Complaint (court, you, service)\n2. Go to the Prothonotary's office during business hours\n3. Tell the clerk: \"I need to file a civil complaint for breach of contract\"\n4. Pay the filing fee (or submit a fee waiver — IFP petition)\n5. The clerk will stamp all copies with the filing date and docket number\n6. Keep your stamped copy as proof of filing",
      showIf: (answers) => answers.filing_method === 'in_person',
    },
    {
      id: 'mail_instructions',
      type: 'info',
      prompt:
        "To file by mail:\n1. Print at least 3 copies of your Complaint\n2. Include a check or money order for the filing fee (or IFP petition)\n3. Include a self-addressed stamped envelope for return of your stamped copy\n4. Mail everything to the Prothonotary's office via certified mail with return receipt\n\nAllow 7–14 business days for processing. Keep your certified mail receipt as proof of timely filing.",
      showIf: (answers) => answers.filing_method === 'mail',
    },

    // === Fee Affordability ===
    {
      id: 'can_afford_fee',
      type: 'yes_no',
      prompt: 'Can you afford the filing fee?',
    },
    {
      id: 'fee_waiver_info',
      type: 'info',
      prompt:
        'You can petition to proceed In Forma Pauperis (IFP) — Pa.R.C.P. 240.\n\n1. File a "Petition to Proceed In Forma Pauperis" with your Complaint\n2. Include a financial affidavit listing your income, expenses, assets, and debts\n3. The court will review — if approved, all filing fees and service costs are waived\n4. If denied, you can request a hearing\n\nThis is available in both Magisterial District Court and Court of Common Pleas.',
      showIf: (answers) => answers.can_afford_fee === 'no',
    },

    // === Answer Deadline ===
    {
      id: 'answer_deadline_info',
      type: 'info',
      prompt:
        'DEFENDANT\'S ANSWER DEADLINE\n\nOnce the defendant is served, they have 20 days to respond (Pa.R.C.P. 1007.1). The defendant may:\n\n• File an Answer (admitting or denying each allegation)\n• File Preliminary Objections under Pa.R.C.P. 1028 (challenging legal sufficiency, venue, etc.)\n• Do nothing — you can then seek default judgment\n\nIf the defendant files Preliminary Objections, the Answer deadline is paused until the court rules.',
      showIf: (answers) =>
        answers.total_damages === '12k_to_50k' || answers.total_damages === 'over_50k',
    },

    // === Damages Types ===
    {
      id: 'damages_info',
      type: 'info',
      prompt:
        'DAMAGES YOU CAN CLAIM\n\n• Expectation damages — the benefit you would have received if the contract had been performed\n• Reliance damages — out-of-pocket costs you incurred in reliance on the contract\n• Restitution — value of any benefit you conferred on the breaching party\n• Consequential damages — foreseeable losses caused by the breach (e.g., lost profits, costs to find a replacement)\n\nYou must prove damages with reasonable certainty. Keep all receipts, invoices, and communications.',
    },

    // === UTPCPL / Deceptive Practices ===
    {
      id: 'deceptive_practices',
      type: 'yes_no',
      prompt: 'Did the breach involve fraud, misrepresentation, or deceptive business practices?',
      helpText:
        'Examples: the other party lied about what they would deliver, used bait-and-switch tactics, made false promises to induce you to sign, or engaged in unfair business practices.',
    },
    {
      id: 'utpcpl_info',
      type: 'info',
      prompt:
        'UTPCPL — TREBLE DAMAGES AVAILABLE\n\nIf the contract dispute involves deceptive trade practices, you may have a claim under Pennsylvania\'s Unfair Trade Practices and Consumer Protection Law (73 P.S. §201-1 et seq.).\n\nUTPCPL provides:\n• Up to TREBLE (3x) actual damages\n• Minimum $100 statutory damages\n• Attorney fees if you win\n\nThis is a powerful weapon. Include a UTPCPL count in your Complaint alongside the breach of contract claim.',
      showIf: (answers) => answers.deceptive_practices === 'yes',
    },

    // === Delay Damages ===
    {
      id: 'delay_damages_info',
      type: 'info',
      prompt:
        'DELAY DAMAGES (Pa.R.C.P. 238)\n\nPennsylvania allows prejudgment interest at the prime rate + 1% on contract damages. This compensates you for the time value of money while the case is pending.\n\nDelay damages are awarded automatically in most contract cases — you do not need to prove anything extra. Include a request for delay damages in your Complaint.',
    },

    // === Wage Garnishment Protection ===
    {
      id: 'garnishment_info',
      type: 'info',
      prompt:
        'IMPORTANT: PA WAGE GARNISHMENT PROTECTION\n\nEven if you WIN a judgment, Pennsylvania law (42 Pa.C.S.A. §8127) prohibits wage garnishment for contract judgments. You cannot garnish the defendant\'s wages to collect.\n\nYou CAN collect through:\n• Bank account execution (after locating accounts)\n• Property liens\n• Sheriff\'s sale of personal property\n• Voluntary payment plans\n\nExceptions where wages CAN be garnished: child support, taxes, federal student loans, criminal restitution.',
    },

    // === Filing Checklist ===
    {
      id: 'filing_checklist',
      type: 'info',
      prompt:
        'FILING CHECKLIST\n\n• Complaint (3 copies, signed) — include specific facts: who, what, when, where, how much\n• Copy of the written contract attached as Exhibit A (required under Pa.R.C.P. 1019(i) for written contracts)\n• Evidence of damages (invoices, receipts, communications)\n• Filing fee payment or IFP petition\n• Government-issued ID (for in-person filing)\n• Certificate of Compliance with PA Public Access Policy (Pa.R.C.P. 205.6) — redact Social Security numbers, financial account numbers, and dates of birth',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Contract type
    if (answers.contract_type) {
      const typeLabels: Record<string, string> = {
        written: 'Written contract — 4-year SOL (42 Pa.C.S. §5525(a)(8))',
        oral: 'Oral contract — 4-year SOL (42 Pa.C.S. §5525(a)(3))',
        unsure: 'Contract type undetermined — SOL is 4 years either way',
      }
      items.push({ status: 'done', text: typeLabels[answers.contract_type] })
    }

    // Statute of limitations status
    if (answers.breach_timing === 'under_2_years') {
      items.push({ status: 'done', text: 'Claim is within the statute of limitations.' })
    } else if (answers.breach_timing === '2_to_4_years') {
      items.push({
        status: 'needed',
        text: 'Calculate your exact SOL deadline — it may be approaching. File promptly.',
      })
    } else if (answers.breach_timing === 'over_4_years') {
      items.push({
        status: 'needed',
        text: 'Claim may be time-barred. Consult an attorney about possible exceptions (discovery rule, tolling, fraudulent concealment).',
      })
    } else if (answers.breach_timing === 'unsure') {
      items.push({
        status: 'needed',
        text: 'Determine the exact breach date from your records to confirm the claim is timely.',
      })
    }

    // Oral contract — Statute of Frauds warning
    if (answers.contract_type === 'oral' || answers.contract_type === 'unsure') {
      items.push({
        status: 'info',
        text: 'Verify your oral contract is not barred by the Statute of Frauds (33 Pa.C.S. §1; UCC §2-201 for goods over $500).',
      })
    }

    // Court type
    if (answers.total_damages) {
      const courtLabels: Record<string, string> = {
        under_12k: 'Magisterial District Court (under $12K)',
        '12k_to_50k': 'Court of Common Pleas ($12K–$50K, compulsory arbitration likely)',
        over_50k: 'Court of Common Pleas (over $50K)',
      }
      items.push({ status: 'done', text: `Court: ${courtLabels[answers.total_damages]}.` })
    } else {
      items.push({
        status: 'needed',
        text: 'Determine your total damages to identify the correct court.',
      })
    }

    // Filing method
    if (answers.filing_method) {
      const methodLabels: Record<string, string> = {
        efile: 'Online via county e-filing system',
        in_person: "In person at the Prothonotary's office",
        mail: 'By certified mail',
      }
      items.push({ status: 'done', text: `Filing method: ${methodLabels[answers.filing_method]}.` })
    } else {
      items.push({
        status: 'needed',
        text: 'Choose a filing method (online, in person, or by mail).',
      })
    }

    // Fee
    if (answers.can_afford_fee === 'yes') {
      items.push({ status: 'done', text: 'Filing fee: prepared to pay.' })
    } else if (answers.can_afford_fee === 'no') {
      items.push({
        status: 'needed',
        text: 'File an In Forma Pauperis (IFP) petition under Pa.R.C.P. 240 with your Complaint.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Determine if you can afford the filing fee. IFP fee waivers are available.',
      })
    }

    // UTPCPL
    if (answers.deceptive_practices === 'yes') {
      items.push({
        status: 'info',
        text: 'Include a UTPCPL count (73 P.S. §201-1) — treble damages and attorney fees available.',
      })
    }

    // Written instrument reminder
    if (answers.contract_type === 'written') {
      items.push({
        status: 'needed',
        text: 'Attach the written contract to your Complaint as required by Pa.R.C.P. 1019(i).',
      })
    }

    // Delay damages
    items.push({
      status: 'info',
      text: 'Request delay damages (Pa.R.C.P. 238): prime rate + 1% prejudgment interest.',
    })

    // Venue reminder
    items.push({
      status: 'info',
      text: 'File in the county where the defendant resides, the contract was made, or the breach occurred (Pa.R.C.P. 1006).',
    })

    // Wage garnishment limitation
    items.push({
      status: 'info',
      text: 'PA prohibits wage garnishment for contract judgments (42 Pa.C.S.A. §8127). Plan alternative collection methods.',
    })

    return items
  },
}
