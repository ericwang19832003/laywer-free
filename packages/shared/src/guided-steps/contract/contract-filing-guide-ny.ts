import type { GuidedStepConfig } from '../types'

export const contractFilingGuideNyConfig: GuidedStepConfig = {
  title: 'New York Contract Dispute — Statute of Limitations & Filing Guide',
  reassurance:
    'New York has clear rules for contract disputes. We will walk you through the statute of limitations, the correct court, and every step to file or defend your case.',

  questions: [
    // === Contract Type & SOL ===
    {
      id: 'contract_type',
      type: 'single_choice',
      prompt: 'What type of contract is involved?',
      helpText:
        'In New York, both written and oral contracts have the same 6-year statute of limitations under CPLR §213(2). This is unusual — most states give oral contracts a shorter period.',
      options: [
        { value: 'written', label: 'Written contract' },
        { value: 'oral', label: 'Oral (verbal) contract' },
        { value: 'implied', label: 'Implied contract' },
        { value: 'unsure', label: 'I am not sure' },
      ],
    },
    {
      id: 'sol_written',
      type: 'info',
      prompt:
        'STATUTE OF LIMITATIONS: 6 YEARS (CPLR §213(2))\n\nNew York gives you 6 years from the date of breach to file a lawsuit on a written contract. This is the longest SOL of the 5 states covered by this app.\n\nThe clock starts on the date the breach occurred, NOT the date you discovered it (unless fraud is involved). If the contract calls for installment payments, each missed payment may start a new 6-year period for that installment.\n\nIf the 6 years have passed, your claim is time-barred and the court will dismiss it if the defendant raises the defense.',
      showIf: (answers) => answers.contract_type === 'written',
    },
    {
      id: 'sol_oral',
      type: 'info',
      prompt:
        'STATUTE OF LIMITATIONS: 6 YEARS (CPLR §213(2))\n\nNew York is unusual: oral contracts have the SAME 6-year statute of limitations as written contracts. Most states give oral contracts a shorter period (2–4 years).\n\nHowever, oral contracts face an additional hurdle — the Statute of Frauds (GOL §5-701). Certain contracts MUST be in writing to be enforceable. If your oral contract falls into one of those categories, it may be unenforceable regardless of timing.',
      showIf: (answers) => answers.contract_type === 'oral',
    },
    {
      id: 'sol_implied',
      type: 'info',
      prompt:
        'STATUTE OF LIMITATIONS: 6 YEARS (CPLR §213(2))\n\nImplied contracts (implied-in-fact or quasi-contract) generally follow the same 6-year period. However, if the court characterizes your claim as unjust enrichment or quantum meruit, the same 6-year SOL applies under CPLR §213(2).\n\nNote: Implied-in-law claims (quasi-contract) may be subject to different analysis. Consult an attorney if your claim is complex.',
      showIf: (answers) => answers.contract_type === 'implied',
    },
    {
      id: 'sol_unsure',
      type: 'info',
      prompt:
        'STATUTE OF LIMITATIONS: 6 YEARS (CPLR §213(2))\n\nRegardless of whether your contract is written or oral, New York provides a 6-year statute of limitations from the date of the breach. This is the longest period among the states covered by this app.\n\nIf you are unsure whether you have a written or oral contract, gather any documents, emails, text messages, or other records that show what was agreed upon. Even partial writings can help establish the terms.',
      showIf: (answers) => answers.contract_type === 'unsure',
    },

    // === Statute of Frauds ===
    {
      id: 'statute_of_frauds_check',
      type: 'single_choice',
      prompt: 'Does any of the following apply to your contract?',
      helpText:
        'Under New York\'s Statute of Frauds (GOL §5-701), certain agreements MUST be in writing to be enforceable. If your contract falls into one of these categories and is not in writing, it may be void.',
      options: [
        { value: 'over_500', label: 'Sale of goods worth more than $500' },
        { value: 'real_property', label: 'Involves real property (land, house, lease over 1 year)' },
        { value: 'over_1_year', label: 'Cannot be performed within 1 year' },
        { value: 'surety', label: 'Promise to pay another person\'s debt (surety/guarantee)' },
        { value: 'marriage', label: 'Made in consideration of marriage' },
        { value: 'none', label: 'None of the above apply' },
        { value: 'unsure_sof', label: 'I am not sure' },
      ],
    },
    {
      id: 'sof_applies',
      type: 'info',
      prompt:
        'STATUTE OF FRAUDS APPLIES (GOL §5-701)\n\nYour contract falls into a category that requires a written agreement to be enforceable under New York law. If there is no signed writing (or sufficient electronic record), the contract may be unenforceable.\n\nExceptions that may save an oral contract:\n• Part performance — one party has substantially performed (especially for real property)\n• Judicial admission — the other side admits the contract exists\n• Promissory estoppel — you relied on the promise to your detriment\n• Merchant\'s confirmatory memo (UCC §2-201 for goods over $500)\n\nIf you are the defendant and the contract is oral, the Statute of Frauds is a strong affirmative defense.',
      showIf: (answers) =>
        answers.statute_of_frauds_check === 'over_500' ||
        answers.statute_of_frauds_check === 'real_property' ||
        answers.statute_of_frauds_check === 'over_1_year' ||
        answers.statute_of_frauds_check === 'surety' ||
        answers.statute_of_frauds_check === 'marriage',
    },

    // === Your Role ===
    {
      id: 'your_role',
      type: 'single_choice',
      prompt: 'What is your role in this dispute?',
      options: [
        { value: 'plaintiff', label: 'I want to sue (plaintiff)' },
        { value: 'defendant', label: 'I have been sued (defendant)' },
      ],
    },

    // === Damages Amount & Court Selection ===
    {
      id: 'damages_amount',
      type: 'single_choice',
      prompt: 'How much money is at stake?',
      helpText:
        'This determines which court you should file in (or which court your case is in). New York has several court levels based on the amount in controversy.',
      options: [
        { value: 'under_5k', label: 'Under $5,000' },
        { value: '5k_to_10k', label: '$5,000 to $10,000' },
        { value: '10k_to_50k', label: '$10,000 to $50,000' },
        { value: 'over_50k', label: 'Over $50,000' },
      ],
    },
    {
      id: 'court_small_claims_outside_nyc',
      type: 'info',
      prompt:
        'SMALL CLAIMS COURT (up to $5,000 outside NYC)\n\nOutside New York City, Small Claims Court handles cases up to $5,000. Inside NYC, the limit is $10,000.\n\n• No formal pleading required — just fill out a simple form\n• No discovery\n• No jury — a judge or arbitrator decides\n• Filing fee: approximately $15–$20\n• Hearing usually within 30–60 days\n• You cannot have an attorney represent you (but you can consult one beforehand)\n\nThis is the fastest, simplest option for smaller contract disputes.',
      showIf: (answers) => answers.damages_amount === 'under_5k',
    },
    {
      id: 'court_small_claims_nyc',
      type: 'info',
      prompt:
        'SMALL CLAIMS COURT — NYC (up to $10,000)\n\nIn NYC, Small Claims Court handles cases up to $10,000 — double the limit outside the city.\n\n• File at the clerk\'s office for your borough or online at nycourts.gov\n• Filing fee: $15–$20\n• No formal complaint needed — fill out a short statement of claim\n• Hearing typically within 30–60 days\n• Informal proceeding — no formal rules of evidence\n• You can bring documents and witnesses but no attorney can represent you at trial\n\nIf your claim is between $5,000 and $10,000, verify you are filing in an NYC court to get the higher limit.',
      showIf: (answers) => answers.damages_amount === '5k_to_10k',
    },
    {
      id: 'court_civil',
      type: 'info',
      prompt:
        'NYC CIVIL COURT (up to $50,000) or CITY/DISTRICT COURT\n\nFor claims between $10,000 and $50,000:\n• In NYC: file in NYC Civil Court\n• Outside NYC: file in City Court (up to $15,000) or County Court\n\nFiling fee: approximately $45–$210 depending on the court\n\nYou must file a formal complaint (called a "summons and complaint" or "summons with notice"). The complaint must meet CPLR §3013 fact-pleading standards — state the material facts, not just legal conclusions.\n\nDiscovery, motions, and formal trial procedures apply.',
      showIf: (answers) => answers.damages_amount === '10k_to_50k',
    },
    {
      id: 'court_supreme',
      type: 'info',
      prompt:
        'SUPREME COURT (unlimited jurisdiction)\n\nFor claims over $50,000, file in New York Supreme Court. Despite its name, this is NOT the highest court — it is the general trial court of unlimited jurisdiction.\n\n• Filing fee (index number): $210 + Request for Judicial Intervention (RJI) fee of $95\n• Full formal procedure: fact pleading (CPLR §3013), discovery (CPLR Article 31), motions, trial\n• Cases can take 1–3 years to reach trial\n• You can request a jury trial\n\nFor claims this size, strongly consider consulting an attorney. Many contract attorneys work on contingency or offer free consultations.',
      showIf: (answers) => answers.damages_amount === 'over_50k',
    },

    // === Answer Deadline (Defendant) ===
    {
      id: 'service_method',
      type: 'single_choice',
      prompt: 'How were you served (or how will you serve the defendant)?',
      helpText:
        'The method of service determines the deadline to answer. Under CPLR §320, personal service in-state gives 20 days; all other methods give 30 days.',
      options: [
        { value: 'personal_in_state', label: 'Personal delivery in New York State' },
        { value: 'other_method', label: 'Other method (substituted, nail-and-mail, out of state)' },
        { value: 'not_yet', label: 'Not yet served / planning service' },
      ],
    },
    {
      id: 'deadline_20_days',
      type: 'info',
      prompt:
        'ANSWER DEADLINE: 20 DAYS (CPLR §320(a))\n\nPersonal service within New York State gives the defendant 20 calendar days to file an Answer or pre-answer motion.\n\nIf the last day falls on a Saturday, Sunday, or court holiday, the deadline extends to the next business day (General Construction Law §25-a).\n\nMissing this deadline can result in a default judgment (CPLR §3215). If you are the defendant, do NOT miss this deadline.',
      showIf: (answers) => answers.service_method === 'personal_in_state',
    },
    {
      id: 'deadline_30_days',
      type: 'info',
      prompt:
        'ANSWER DEADLINE: 30 DAYS (CPLR §320(a))\n\nFor all service methods other than personal delivery in-state, the defendant has 30 calendar days to file an Answer or pre-answer motion.\n\nFor substituted service ("leave and mail"), service is complete 10 days after the mailing. For "nail and mail," service is complete 10 days after the mailing and filing of proof of service.\n\nIf the last day falls on a Saturday, Sunday, or court holiday, the deadline extends to the next business day.',
      showIf: (answers) => answers.service_method === 'other_method',
    },

    // === Fact Pleading Requirement ===
    {
      id: 'fact_pleading_info',
      type: 'info',
      prompt:
        'NEW YORK REQUIRES FACT PLEADING (CPLR §3013)\n\nUnlike federal court (which uses "notice pleading"), New York requires fact pleading. Your complaint must contain:\n\n1. A plain and concise statement of the material FACTS — not just legal conclusions\n2. Enough detail so the defendant knows what conduct is at issue\n3. Each cause of action stated separately\n\nFor breach of contract, you must plead:\n• The existence of a valid contract\n• Your performance (or excuse for non-performance)\n• The defendant\'s breach\n• Resulting damages\n\nVague complaints like "defendant breached the agreement" without factual detail will be dismissed under CPLR §3211(a)(7).\n\nVerification: Contract claims generally do NOT require a verified complaint (unlike some special proceedings).',
    },

    // === Venue ===
    {
      id: 'venue_info',
      type: 'info',
      prompt:
        'VENUE — WHERE TO FILE (CPLR §503)\n\nFile in the county where:\n\n1. The defendant resides (for individuals) or has its principal office (for businesses)\n2. The breach occurred or was to be performed\n\nIf the contract has a forum selection clause, that usually controls. New York courts generally enforce forum selection clauses unless they are unreasonable or the result of fraud.\n\nImproper venue does not void your case — the defendant can move to change venue under CPLR §510, but the case will be transferred, not dismissed.',
    },

    // === Damages ===
    {
      id: 'damages_type',
      type: 'single_choice',
      prompt: 'What type of damages are you seeking?',
      helpText:
        'New York allows several categories of damages for breach of contract. Select the primary type you are seeking.',
      options: [
        { value: 'expectation', label: 'Expectation damages — what I was promised' },
        { value: 'reliance', label: 'Reliance damages — what I spent in reliance on the contract' },
        { value: 'restitution', label: 'Restitution — return of benefit conferred on the other side' },
        { value: 'consequential', label: 'Consequential damages — losses caused by the breach' },
        { value: 'specific_performance', label: 'Specific performance — force them to perform' },
        { value: 'unsure_damages', label: 'I am not sure' },
      ],
    },
    {
      id: 'expectation_info',
      type: 'info',
      prompt:
        'EXPECTATION DAMAGES\n\nThis is the standard measure for breach of contract in New York. You are entitled to be put in the position you would have been in had the contract been performed.\n\nFormula: benefit of the bargain minus costs saved by not having to perform your remaining obligations.\n\nYou must prove damages with reasonable certainty — speculative damages are not recoverable.',
      showIf: (answers) => answers.damages_type === 'expectation',
    },
    {
      id: 'consequential_info',
      type: 'info',
      prompt:
        'CONSEQUENTIAL DAMAGES\n\nConsequential (or "special") damages are indirect losses caused by the breach — for example, lost profits, lost business opportunities, or costs incurred to find a replacement.\n\nTo recover consequential damages in New York, you must show:\n1. The damages were foreseeable at the time of contracting (Hadley v. Baxendale rule)\n2. The damages were caused by the breach\n3. The amount is proven with reasonable certainty\n\nCheck your contract — many contracts include a consequential damages waiver. If yours does, these damages may be barred.',
      showIf: (answers) => answers.damages_type === 'consequential',
    },
    {
      id: 'specific_performance_info',
      type: 'info',
      prompt:
        'SPECIFIC PERFORMANCE\n\nSpecific performance is an equitable remedy — the court orders the breaching party to actually perform the contract. It is available only when money damages are inadequate, typically involving:\n\n• Unique goods or property (especially real estate)\n• Contracts where the subject matter cannot be replaced\n\nYou must show: (1) a valid contract, (2) your own performance or readiness to perform, (3) the other party\'s breach, and (4) that money damages are inadequate.\n\nNew York courts will NOT grant specific performance for personal services contracts.',
      showIf: (answers) => answers.damages_type === 'specific_performance',
    },

    // === Prejudgment Interest ===
    {
      id: 'prejudgment_interest_info',
      type: 'info',
      prompt:
        'PREJUDGMENT INTEREST: 9% PER YEAR (CPLR §5004)\n\nNew York awards prejudgment interest at 9% per annum — one of the highest rates in the country. This is mandatory for breach of contract claims, not discretionary.\n\nInterest runs from the date of the breach (or when damages were incurred) through the date of judgment (CPLR §5001).\n\nExample: On a $50,000 breach that occurred 3 years ago, prejudgment interest alone would add $13,500 (9% x $50,000 x 3 years).\n\nThis can significantly increase your recovery and is an important factor in settlement negotiations.',
    },

    // === Key Motions & Procedures ===
    {
      id: 'key_motions_info',
      type: 'info',
      prompt:
        'KEY MOTIONS & PROCEDURES\n\nMotion to Dismiss (CPLR §3211):\n• §3211(a)(1) — documentary evidence defeats the claim\n• §3211(a)(5) — statute of limitations expired\n• §3211(a)(7) — complaint fails to state a cause of action\n• Must be filed before or with the Answer\n\nDefault Judgment (CPLR §3215):\n• If the defendant fails to answer within 20/30 days\n• Plaintiff must show proof of service, the facts of the claim, and the amount owed\n• Court may require an inquest (hearing on damages)\n\nDiscovery (CPLR Article 31):\n• Depositions, interrogatories, document demands, requests to admit\n• Discovery disputes resolved by motion to compel\n• Parties must exchange automatic disclosure early in the case\n\nSummary Judgment (CPLR §3212):\n• Available after discovery is complete (or issue joined)\n• Must show no material facts in dispute',
    },

    // === Filing Method ===
    {
      id: 'filing_method',
      type: 'single_choice',
      prompt: 'How do you plan to file?',
      helpText:
        'New York courts support electronic filing through NYSCEF (New York State Courts Electronic Filing). E-filing is mandatory in Supreme Court in many counties.',
      options: [
        { value: 'efile', label: 'E-file via NYSCEF (nyscef.nycourts.gov) — recommended' },
        { value: 'in_person', label: 'In person at the court clerk\'s office' },
        { value: 'mail', label: 'By mail' },
        { value: 'not_sure_method', label: 'I am not sure yet' },
      ],
    },
    {
      id: 'efile_nyscef_info',
      type: 'info',
      prompt:
        'E-FILING VIA NYSCEF\n\n1. Go to nyscef.nycourts.gov and create a free account\n2. Select "File a New Case" and choose your court and case type\n3. Upload your summons and complaint as PDF\n4. Pay the filing fee online (credit card or e-check)\n5. You will receive a confirmation number and index number\n\nNYSCEF is mandatory for Supreme Court in most counties (including all NYC boroughs). For other courts, check if e-filing is available in your county.\n\nAll subsequent filings (motions, discovery, etc.) are also done through NYSCEF once the case is in the system.',
      showIf: (answers) => answers.filing_method === 'efile',
    },
    {
      id: 'in_person_info',
      type: 'info',
      prompt:
        'FILING IN PERSON\n\n1. Print at least 3 copies of your summons and complaint (court, defendant, your records)\n2. Go to the court clerk\'s office during business hours\n3. Tell the clerk you are filing a breach of contract action\n4. Pay the filing fee or submit a fee waiver (Poor Person Application under CPLR Article 11)\n5. The clerk will assign an index number and stamp your copies\n6. Arrange for service on the defendant within 120 days (CPLR §306-b)\n\nBring a valid government-issued ID.',
      showIf: (answers) => answers.filing_method === 'in_person',
    },

    // === Fee Affordability ===
    {
      id: 'can_afford_fee',
      type: 'yes_no',
      prompt: 'Can you afford the filing fee?',
      helpText:
        'Filing fees vary by court: Small Claims ($15–$20), NYC Civil Court ($45), Supreme Court ($210 index number + $95 RJI). If you cannot afford it, fee waivers are available.',
    },
    {
      id: 'fee_waiver_info',
      type: 'info',
      prompt:
        'FEE WAIVER — POOR PERSON APPLICATION (CPLR Article 11)\n\nIf you cannot afford the filing fee, you can apply to proceed as a "poor person" under CPLR §1101.\n\n1. Complete a Poor Person Application (available from the court clerk or nycourts.gov)\n2. Include information about your income, assets, and expenses\n3. File the application with your complaint\n4. The court will review and typically grants the waiver if your income is at or near the federal poverty level\n\nIf approved, all court fees are waived for the duration of the case.',
      showIf: (answers) => answers.can_afford_fee === 'no',
    },

    // === Filing Checklist ===
    {
      id: 'filing_checklist',
      type: 'info',
      prompt:
        'FILING CHECKLIST\n\n• Summons and Complaint (or Summons with Notice) — 3 copies minimum\n• Copy of the contract (if written) or summary of terms (if oral)\n• Any supporting documents (emails, letters, invoices, payment records)\n• Filing fee payment or Poor Person Application\n• Government-issued ID (for in-person filing)\n• Note: serve the defendant within 120 days of filing (CPLR §306-b)\n• Proof of service must be filed with the court after service is complete',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Contract type & SOL
    if (answers.contract_type) {
      const typeLabels: Record<string, string> = {
        written: 'Written contract',
        oral: 'Oral contract',
        implied: 'Implied contract',
        unsure: 'Contract type undetermined',
      }
      items.push({
        status: 'done',
        text: `${typeLabels[answers.contract_type]}. Statute of limitations: 6 years (CPLR §213(2)).`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Determine contract type. NY SOL is 6 years for both written and oral contracts.',
      })
    }

    // Statute of Frauds warning
    if (
      answers.statute_of_frauds_check &&
      answers.statute_of_frauds_check !== 'none' &&
      answers.statute_of_frauds_check !== 'unsure_sof'
    ) {
      items.push({
        status: 'info',
        text: 'Statute of Frauds (GOL §5-701) applies — a written agreement may be required for enforceability.',
      })
    }

    // Role
    if (answers.your_role === 'plaintiff') {
      items.push({ status: 'done', text: 'Role: Plaintiff (filing the lawsuit).' })
    } else if (answers.your_role === 'defendant') {
      items.push({ status: 'done', text: 'Role: Defendant (responding to the lawsuit).' })
    }

    // Court
    if (answers.damages_amount) {
      const courtLabels: Record<string, string> = {
        under_5k: 'Small Claims Court (up to $5K outside NYC, $10K in NYC)',
        '5k_to_10k': 'Small Claims Court NYC ($10K limit) or City Court',
        '10k_to_50k': 'NYC Civil Court (up to $50K) or County Court',
        over_50k: 'Supreme Court (unlimited jurisdiction)',
      }
      items.push({
        status: 'done',
        text: `Court: ${courtLabels[answers.damages_amount]}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Determine damages amount to identify the correct court.',
      })
    }

    // Answer deadline (defendant)
    if (answers.your_role === 'defendant') {
      if (answers.service_method === 'personal_in_state') {
        items.push({
          status: 'needed',
          text: 'Answer deadline: 20 days from personal service (CPLR §320(a)). Do not miss this.',
        })
      } else if (answers.service_method === 'other_method') {
        items.push({
          status: 'needed',
          text: 'Answer deadline: 30 days from service completion (CPLR §320(a)). Do not miss this.',
        })
      }
    }

    // Filing method
    if (answers.filing_method) {
      const methodLabels: Record<string, string> = {
        efile: 'E-file via NYSCEF (nyscef.nycourts.gov)',
        in_person: 'In person at the court clerk\'s office',
        mail: 'By mail',
        not_sure_method: 'Filing method not yet decided',
      }
      items.push({
        status: answers.filing_method === 'not_sure_method' ? 'needed' : 'done',
        text: `Filing method: ${methodLabels[answers.filing_method]}.`,
      })
    }

    // Fee
    if (answers.can_afford_fee === 'yes') {
      items.push({ status: 'done', text: 'Filing fee: prepared to pay.' })
    } else if (answers.can_afford_fee === 'no') {
      items.push({
        status: 'needed',
        text: 'Complete a Poor Person Application (CPLR Article 11) for fee waiver. File it with your complaint.',
      })
    }

    // Damages type
    if (answers.damages_type) {
      const damageLabels: Record<string, string> = {
        expectation: 'Expectation damages (benefit of the bargain)',
        reliance: 'Reliance damages (out-of-pocket costs)',
        restitution: 'Restitution (return of benefit conferred)',
        consequential: 'Consequential damages (indirect losses)',
        specific_performance: 'Specific performance (equitable remedy)',
        unsure_damages: 'Damages type not yet determined',
      }
      items.push({
        status: answers.damages_type === 'unsure_damages' ? 'needed' : 'info',
        text: `Damages: ${damageLabels[answers.damages_type]}.`,
      })
    }

    // Prejudgment interest reminder
    items.push({
      status: 'info',
      text: 'Prejudgment interest: 9% per year (CPLR §5004) — runs from date of breach. Include in your demand.',
    })

    // Venue reminder
    items.push({
      status: 'info',
      text: 'Venue (CPLR §503): file where the defendant resides or where the breach occurred.',
    })

    // Service reminder for plaintiffs
    if (answers.your_role === 'plaintiff') {
      items.push({
        status: 'needed',
        text: 'Serve the defendant within 120 days of filing (CPLR §306-b). File proof of service with the court.',
      })
    }

    return items
  },
}
