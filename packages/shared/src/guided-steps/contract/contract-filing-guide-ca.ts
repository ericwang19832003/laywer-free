import type { GuidedStepConfig } from '../types'

export const contractFilingGuideCaConfig: GuidedStepConfig = {
  title: 'California Contract Dispute — Statute of Limitations & Filing Guide',
  reassurance:
    'Understanding deadlines and court rules is the first step to protecting your rights in a California contract dispute.',

  questions: [
    // === Contract type & SOL ===
    {
      id: 'contract_form',
      type: 'single_choice',
      prompt: 'Is your contract written or oral?',
      helpText:
        'The statute of limitations depends on whether the contract was written or oral. Emails, texts, and signed documents count as written.',
      options: [
        { value: 'written', label: 'Written contract (includes emails, signed documents)' },
        { value: 'oral', label: 'Oral contract (verbal agreement, nothing in writing)' },
        { value: 'unsure', label: 'Not sure' },
      ],
    },
    {
      id: 'sol_written_info',
      type: 'info',
      prompt:
        'WRITTEN CONTRACT SOL: 4 YEARS (CCP §337)\n\nYou have 4 years from the date of breach to file suit. The clock starts when the other party failed to perform — not when you discovered the breach (unless fraud is involved).',
      showIf: (answers) => answers.contract_form === 'written',
    },
    {
      id: 'sol_oral_info',
      type: 'info',
      prompt:
        'ORAL CONTRACT SOL: 2 YEARS (CCP §339)\n\nYou have only 2 years from the date of breach to file suit. This is significantly shorter than the written contract deadline. If you are close to the deadline, act quickly.',
      showIf: (answers) => answers.contract_form === 'oral',
    },
    {
      id: 'sol_unsure_info',
      type: 'info',
      prompt:
        'If you are unsure whether your contract is written or oral, assume the shorter deadline applies: 2 YEARS (CCP §339) for oral contracts. Gather any emails, texts, letters, or documents that could establish a written agreement — this would extend your deadline to 4 years (CCP §337).',
      showIf: (answers) => answers.contract_form === 'unsure',
    },
    {
      id: 'breach_date',
      type: 'text',
      prompt: 'When did the breach occur (when did the other party fail to perform)?',
      placeholder: 'MM/DD/YYYY',
      helpText:
        'This is when the SOL clock started. Enter the date the other party failed to do what they promised.',
    },

    // === Statute of Frauds ===
    {
      id: 'sof_header',
      type: 'info',
      prompt:
        'CALIFORNIA STATUTE OF FRAUDS (Civ. Code §1624)\n\nCertain contracts MUST be in writing to be enforceable:\n1. Contracts for the sale of goods over $500\n2. Contracts for the sale or transfer of real property\n3. Contracts that cannot be performed within one year\n4. Leases lasting more than one year\n5. Promises to pay someone else\'s debt (guaranty/suretyship)\n6. Contracts by executors to pay estate debts from personal funds\n\nIf your contract falls into one of these categories and is NOT in writing, enforceability may be an issue.',
    },
    {
      id: 'sof_category',
      type: 'single_choice',
      prompt: 'Does your contract fall into any Statute of Frauds category?',
      options: [
        { value: 'goods_over_500', label: 'Sale of goods over $500' },
        { value: 'real_property', label: 'Sale or transfer of real property' },
        { value: 'over_one_year', label: 'Cannot be performed within one year' },
        { value: 'guaranty', label: 'Promise to pay someone else\'s debt' },
        { value: 'none', label: 'None of the above' },
      ],
    },
    {
      id: 'sof_warning',
      type: 'info',
      prompt:
        'Your contract may be subject to the Statute of Frauds (Civ. Code §1624). If no signed writing exists, the contract may be unenforceable — but exceptions exist:\n\n- PARTIAL PERFORMANCE: If you already performed or paid, courts may enforce the oral agreement\n- WRITTEN CONFIRMATION: Emails or texts confirming the deal may satisfy the writing requirement\n- ESTOPPEL: If you reasonably relied on the promise to your detriment\n- SPECIALLY MANUFACTURED GOODS: UCC exception for custom goods\n\nGather all emails, texts, invoices, and receipts showing the agreement and your performance.',
      showIf: (answers) =>
        answers.sof_category !== 'none' &&
        !!answers.sof_category &&
        answers.contract_form !== 'written',
    },

    // === Dispute amount & court selection ===
    {
      id: 'dispute_amount',
      type: 'single_choice',
      prompt: 'What is the approximate dollar amount of your dispute?',
      helpText:
        'California has three court levels for civil cases. The amount determines which court you file in.',
      options: [
        { value: 'small_claims', label: '$10,000 or less' },
        { value: 'limited', label: '$10,001 to $25,000' },
        { value: 'unlimited', label: 'More than $25,000' },
      ],
    },
    {
      id: 'court_small_claims_info',
      type: 'info',
      prompt:
        'SMALL CLAIMS COURT (≤$10,000)\n\n- No lawyers allowed (you represent yourself)\n- Simplified procedures — no formal discovery, no motions\n- Filing fee: approximately $30–$75\n- Hearing usually within 30–70 days of filing\n- The judge decides on the spot or by mail\n- Defendant can appeal for a new trial; plaintiff generally cannot appeal\n- Ideal for straightforward contract disputes with clear evidence',
      showIf: (answers) => answers.dispute_amount === 'small_claims',
    },
    {
      id: 'court_limited_info',
      type: 'info',
      prompt:
        'LIMITED CIVIL COURT ($10,001–$25,000)\n\n- Filed in Superior Court — Limited Civil division\n- Lawyers permitted but not required\n- Simplified discovery rules (limited interrogatories, depositions)\n- Case must be resolved within 12 months\n- Filing fee: approximately $225–$370\n- You CAN state the dollar amount in the complaint for contract cases\n- Jury trial available if requested',
      showIf: (answers) => answers.dispute_amount === 'limited',
    },
    {
      id: 'court_unlimited_info',
      type: 'info',
      prompt:
        'UNLIMITED CIVIL COURT (>$25,000)\n\n- Filed in Superior Court — Unlimited Civil division\n- Full discovery available (interrogatories, depositions, RFAs, document requests)\n- More complex procedures — strongly consider hiring an attorney\n- Filing fee: approximately $435–$450\n- You CAN state the dollar amount in the complaint for contract cases\n- Jury trial available if requested\n- Demurrer available to challenge the complaint (CCP §430.10)',
      showIf: (answers) => answers.dispute_amount === 'unlimited',
    },

    // === Venue ===
    {
      id: 'venue_info',
      type: 'info',
      prompt:
        'VENUE — WHERE TO FILE (CCP §395)\n\nFor contract disputes, you generally file in the county where:\n1. The contract was made or was to be performed, OR\n2. The defendant resides at the time the action is filed\n\nIf the contract specifies a venue (forum selection clause), that clause is usually enforceable. Check your contract for any venue or jurisdiction provision.',
    },

    // === Arbitration check ===
    {
      id: 'has_arbitration_clause',
      type: 'yes_no',
      prompt: 'Does your contract contain an arbitration clause?',
      helpText:
        'An arbitration clause requires disputes to be resolved through private arbitration instead of court. Check your contract carefully.',
    },
    {
      id: 'arbitration_info',
      type: 'info',
      prompt:
        'ARBITRATION CLAUSE (CCP §1281.2)\n\nIf your contract has an arbitration clause, the other side can file a petition to compel arbitration, and the court will likely grant it. This means:\n\n- The dispute goes to a private arbitrator, not a judge\n- Arbitration can be expensive (arbitrator fees)\n- Discovery is usually more limited\n- The arbitrator\'s decision is typically final and binding\n- Very limited grounds for appeal\n\nExceptions: The court MAY deny arbitration if the clause is unconscionable (one-sided or hidden in fine print) or if the right to arbitrate was waived by delay.',
      showIf: (answers) => answers.has_arbitration_clause === 'yes',
    },

    // === Answer deadline (if you are the defendant) ===
    {
      id: 'party_role',
      type: 'single_choice',
      prompt: 'Are you the plaintiff (suing) or the defendant (being sued)?',
      options: [
        { value: 'plaintiff', label: 'Plaintiff — I want to file a lawsuit' },
        { value: 'defendant', label: 'Defendant — I have been sued' },
      ],
    },
    {
      id: 'answer_deadline_info',
      type: 'info',
      prompt:
        'ANSWER DEADLINE: 30 DAYS (CCP §412.20)\n\nYou have 30 calendar days from the date you were served to file your Answer (or a responsive pleading). If you were served by substituted service, you get 40 days.\n\nDo NOT miss this deadline — if you fail to respond, the plaintiff can obtain a default judgment against you.\n\nYou can also file a demurrer (CCP §430.10) to challenge the legal sufficiency of the complaint, but this must also be filed within 30 days and does NOT extend your time to answer if overruled.',
      showIf: (answers) => answers.party_role === 'defendant',
    },
    {
      id: 'demurrer_info',
      type: 'info',
      prompt:
        'DEMURRER OPTION (CCP §430.10)\n\nInstead of (or before) answering, you can file a demurrer arguing the complaint fails to state a valid cause of action. Common grounds:\n\n- The complaint does not state facts sufficient for a cause of action\n- The court lacks jurisdiction\n- There is another action pending between the same parties on the same cause\n- The complaint is uncertain or ambiguous\n\nIf sustained with leave to amend, the plaintiff gets a chance to fix their complaint. If sustained without leave, the case (or that cause of action) is dismissed.',
      showIf: (answers) =>
        answers.party_role === 'defendant' &&
        (answers.dispute_amount === 'limited' || answers.dispute_amount === 'unlimited'),
    },

    // === Damages ===
    {
      id: 'damages_info',
      type: 'info',
      prompt:
        'DAMAGES AVAILABLE IN CALIFORNIA CONTRACT CASES\n\n1. EXPECTATION DAMAGES — The benefit you expected from the contract (the most common measure)\n2. RELIANCE DAMAGES — Out-of-pocket costs you incurred relying on the contract\n3. RESTITUTION — The value of any benefit you conferred on the other party\n4. CONSEQUENTIAL DAMAGES — Foreseeable losses caused by the breach (e.g., lost profits)\n5. SPECIFIC PERFORMANCE — Court orders the breaching party to perform (rare; usually for unique property)\n\nNote: Punitive damages are generally NOT available in contract cases unless fraud or tort is involved.\n\nYou CAN state the dollar amount in the complaint for contract cases (unlike personal injury).',
      showIf: (answers) => answers.party_role === 'plaintiff',
    },

    // === Prejudgment interest ===
    {
      id: 'claim_type',
      type: 'single_choice',
      prompt: 'Is your claim for a specific, calculable amount (liquidated) or an uncertain amount?',
      helpText:
        'A liquidated claim is a fixed amount — like an unpaid invoice for $5,000. An unliquidated claim is uncertain — like lost profits that need to be proven at trial.',
      options: [
        { value: 'liquidated', label: 'Liquidated — specific amount owed (e.g., unpaid invoice)' },
        { value: 'unliquidated', label: 'Unliquidated — uncertain amount (e.g., lost profits, damages to be determined)' },
      ],
      showIf: (answers) => answers.party_role === 'plaintiff',
    },
    {
      id: 'interest_liquidated_info',
      type: 'info',
      prompt:
        'PREJUDGMENT INTEREST — LIQUIDATED CLAIMS: 10% per year (Civ. Code §3287(a))\n\nFor liquidated claims (a specific amount certain), you are entitled to prejudgment interest at 10% per year as a matter of right. The interest accrues from the date the amount became due.\n\nExample: If you are owed $10,000 and it has been 2 years, you can claim $2,000 in prejudgment interest on top of the $10,000.\n\nInclude a prejudgment interest demand in your complaint.',
      showIf: (answers) => answers.claim_type === 'liquidated',
    },
    {
      id: 'interest_unliquidated_info',
      type: 'info',
      prompt:
        'PREJUDGMENT INTEREST — UNLIQUIDATED CLAIMS: 7% per year (CCP §685.010)\n\nFor unliquidated claims (amount uncertain until trial), the court may award prejudgment interest at 7% per year at its discretion. This rate applies from the date the lawsuit was filed or the date the damages became certain.\n\nYou should still request prejudgment interest in your complaint.',
      showIf: (answers) => answers.claim_type === 'unliquidated',
    },

    // === Discovery ===
    {
      id: 'discovery_info',
      type: 'info',
      prompt:
        'DISCOVERY TOOLS (Limited & Unlimited Civil)\n\nIf your case is NOT in Small Claims, you have access to these discovery tools:\n\n1. INTERROGATORIES — Written questions the other side must answer under oath (Form Interrogatories + Special Interrogatories)\n2. REQUESTS FOR ADMISSION (RFAs) — Statements the other side must admit or deny. Unanswered RFAs are deemed admitted.\n3. REQUESTS FOR PRODUCTION — Demand documents (contracts, emails, invoices, bank records)\n4. DEPOSITIONS — Live questioning under oath (expensive but powerful)\n5. SUBPOENAS — Compel third parties to produce documents or testify\n\nRespond to all discovery within 30 days (CCP §2030.260). Failure to respond can result in sanctions or evidence being deemed admitted.',
      showIf: (answers) =>
        answers.dispute_amount === 'limited' || answers.dispute_amount === 'unlimited',
    },

    // === Next steps ===
    {
      id: 'next_steps_plaintiff',
      type: 'info',
      prompt:
        'YOUR NEXT STEPS AS PLAINTIFF\n\n1. Confirm your SOL has not expired\n2. Gather all contract documents, correspondence, and evidence of breach\n3. Calculate your damages (include prejudgment interest)\n4. Determine the correct court and venue\n5. Draft and file your complaint\n6. Serve the defendant (personal service, substituted service, or service by mail with acknowledgment)\n7. If defendant does not respond within 30 days, request a default judgment',
      showIf: (answers) => answers.party_role === 'plaintiff',
    },
    {
      id: 'next_steps_defendant',
      type: 'info',
      prompt:
        'YOUR NEXT STEPS AS DEFENDANT\n\n1. Check the SOL — if the claim is time-barred, raise it as an affirmative defense\n2. File your Answer (or demurrer) within 30 days of service\n3. Assert all affirmative defenses (SOL, statute of frauds, failure of consideration, waiver, estoppel, etc.)\n4. Consider filing a cross-complaint if you have claims against the plaintiff\n5. Respond to all discovery requests within 30 days\n6. Do NOT ignore the lawsuit — a default judgment is very difficult to set aside',
      showIf: (answers) => answers.party_role === 'defendant',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // SOL determination
    const solYears = answers.contract_form === 'oral' ? 2 : 4
    const solStatute = answers.contract_form === 'oral' ? 'CCP §339' : 'CCP §337'

    if (answers.contract_form) {
      const formLabel = answers.contract_form === 'written'
        ? 'Written contract'
        : answers.contract_form === 'oral'
          ? 'Oral contract'
          : 'Contract form uncertain'
      items.push({
        status: 'done',
        text: `${formLabel}. California SOL: ${solYears} years (${solStatute}).`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Determine whether contract is written or oral to identify the correct SOL.',
      })
    }

    // SOL date calculation
    if (answers.breach_date) {
      const parts = answers.breach_date.split('/')
      const breachDate = new Date(`${parts[2]}-${parts[0]}-${parts[1]}`)
      const now = new Date()
      const yearsDiff =
        (now.getTime() - breachDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)

      if (yearsDiff >= solYears) {
        items.push({
          status: 'info',
          text: `Based on breach date ${answers.breach_date}, approximately ${Math.floor(yearsDiff)} years have passed. The ${solYears}-year SOL appears to have EXPIRED. ${answers.party_role === 'defendant' ? 'Raise this as an affirmative defense.' : 'Your claim may be time-barred.'}`,
        })
      } else {
        const remainingMonths = Math.ceil((solYears - yearsDiff) * 12)
        items.push({
          status: 'info',
          text: `Based on breach date ${answers.breach_date}, approximately ${Math.floor(yearsDiff * 12)} months have passed. SOL has NOT expired — approximately ${remainingMonths} months remain. ${answers.party_role === 'plaintiff' ? 'File promptly.' : ''}`,
        })
      }
    } else {
      items.push({
        status: 'needed',
        text: 'Enter the breach date to calculate whether the SOL has expired.',
      })
    }

    // Statute of Frauds
    if (
      answers.sof_category &&
      answers.sof_category !== 'none' &&
      answers.contract_form !== 'written'
    ) {
      items.push({
        status: 'needed',
        text: 'Statute of Frauds (Civ. Code §1624) may apply. Gather emails, texts, and evidence of partial performance to establish a writing or exception.',
      })
    }

    // Court selection
    if (answers.dispute_amount) {
      const courtLabels: Record<string, string> = {
        small_claims: 'Small Claims Court (≤$10,000) — no attorneys, simplified process.',
        limited: 'Limited Civil Court ($10,001–$25,000) — Superior Court, limited discovery.',
        unlimited: 'Unlimited Civil Court (>$25,000) — Superior Court, full discovery.',
      }
      items.push({ status: 'done', text: courtLabels[answers.dispute_amount] })
    } else {
      items.push({ status: 'needed', text: 'Determine the dispute amount to identify the correct court.' })
    }

    // Arbitration
    if (answers.has_arbitration_clause === 'yes') {
      items.push({
        status: 'info',
        text: 'Arbitration clause present (CCP §1281.2). The case may be compelled to arbitration unless the clause is unconscionable or waived.',
      })
    }

    // Party role & deadline
    if (answers.party_role === 'defendant') {
      items.push({
        status: 'needed',
        text: 'File your Answer within 30 days of service (CCP §412.20). Do NOT miss this deadline.',
      })
      items.push({
        status: 'info',
        text: 'Consider filing a demurrer (CCP §430.10) if the complaint is legally deficient.',
      })
    } else if (answers.party_role === 'plaintiff') {
      // Prejudgment interest
      if (answers.claim_type === 'liquidated') {
        items.push({
          status: 'info',
          text: 'Prejudgment interest: 10% per year on liquidated claims (Civ. Code §3287). Include in your complaint.',
        })
      } else if (answers.claim_type === 'unliquidated') {
        items.push({
          status: 'info',
          text: 'Prejudgment interest: 7% per year on unliquidated claims (CCP §685.010). Request in your complaint.',
        })
      }
      items.push({
        status: 'needed',
        text: 'File in the county where the contract was made/performed or where the defendant resides (CCP §395).',
      })
    }

    return items
  },
}
