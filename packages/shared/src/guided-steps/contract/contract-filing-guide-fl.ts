import type { GuidedStepConfig } from '../types'

export const contractFilingGuideFlConfig: GuidedStepConfig = {
  title: 'Florida Contract Dispute — Statute of Limitations & Filing Guide',
  reassurance:
    'Florida has clear rules for contract lawsuits. We will walk you through the statute of limitations, correct court, and every filing step.',

  questions: [
    // === Statute of Limitations ===
    {
      id: 'sol_overview',
      type: 'info',
      prompt:
        'FLORIDA STATUTE OF LIMITATIONS FOR CONTRACTS\n\nThe statute of limitations (SOL) is the deadline to file a lawsuit. If the SOL has expired, the claim is time-barred.\n\n• Written contracts: 5 YEARS (Fla. Stat. §95.11(2)(b))\n• Oral contracts: 4 years (Fla. Stat. §95.11(3)(k))\n\nThe clock starts on the date of the breach — when the other party failed to perform.\n\nIMPORTANT: HB 837 (2023) changed the SOL for negligence claims, but did NOT change the SOL or damages rules for contract claims. Contract SOL periods remain unchanged.',
    },
    {
      id: 'contract_type',
      type: 'single_choice',
      prompt: 'What type of contract is involved?',
      helpText:
        'A written contract is signed or documented in writing (including emails and text messages that form an agreement). An oral contract is a verbal agreement with no written documentation.',
      options: [
        { value: 'written', label: 'Written contract — 5-year SOL' },
        { value: 'oral', label: 'Oral (verbal) contract — 4-year SOL' },
        { value: 'unsure', label: 'I am not sure' },
      ],
    },
    {
      id: 'oral_contract_warning',
      type: 'info',
      prompt:
        'ORAL CONTRACT — STATUTE OF FRAUDS WARNING (Fla. Stat. §725.01)\n\nCertain contracts MUST be in writing to be enforceable in Florida:\n\n• Contracts that cannot be performed within 1 year\n• Contracts for the sale of real property\n• Guarantees or promises to pay the debt of another\n• Contracts for the sale of goods over $500 (UCC §2-201)\n\nIf your oral contract falls into one of these categories, it may be unenforceable under the statute of frauds. However, partial performance or detrimental reliance can sometimes overcome this defense.',
      showIf: (answers) => answers.contract_type === 'oral' || answers.contract_type === 'unsure',
    },
    {
      id: 'breach_date_known',
      type: 'yes_no',
      prompt: 'Do you know the date the breach occurred?',
      helpText:
        'The breach date is when the other party failed to do what the contract required — missed a payment, failed to deliver goods, stopped performing services, etc.',
    },
    {
      id: 'breach_date_warning',
      type: 'info',
      prompt:
        'You need to determine the breach date to calculate your SOL deadline. Review the contract terms and identify when the other party first failed to perform. If there were multiple breaches, each may have its own SOL clock.\n\nFor continuing contracts (e.g., installment payments), each missed payment may start a separate SOL period for that payment.',
      showIf: (answers) => answers.breach_date_known === 'no',
    },
    {
      id: 'sol_expired_concern',
      type: 'yes_no',
      prompt: 'Are you concerned the statute of limitations may have expired?',
    },
    {
      id: 'sol_expired_info',
      type: 'info',
      prompt:
        'IF THE SOL MAY HAVE EXPIRED\n\nIf you are the plaintiff and the SOL has expired, you generally cannot file suit. However, check for:\n\n• Tolling: The SOL may be paused if the defendant was absent from Florida, concealed the breach, or if you were under a legal disability.\n• Discovery rule: For fraud-based contract claims, the SOL may start when you discovered (or should have discovered) the breach.\n• Partial payments or written acknowledgments by the debtor can restart the clock in some circumstances.\n\nIf you are the defendant and the SOL has expired, raise it as an affirmative defense in your Answer. The court will NOT raise it for you. Assert: "Plaintiff\'s claims are barred by the applicable statute of limitations, Florida Statutes §95.11."',
      showIf: (answers) => answers.sol_expired_concern === 'yes',
    },

    // === Are you plaintiff or defendant? ===
    {
      id: 'party_role',
      type: 'single_choice',
      prompt: 'What is your role in this dispute?',
      options: [
        { value: 'plaintiff', label: 'I want to file a lawsuit (plaintiff)' },
        { value: 'defendant', label: 'I was sued and need to respond (defendant)' },
        { value: 'unsure_role', label: 'I am not sure yet' },
      ],
    },

    // === Defendant-specific: Answer deadline ===
    {
      id: 'answer_deadline_info',
      type: 'info',
      prompt:
        'DEFENDANT — YOUR ANSWER DEADLINE\n\nYou have 20 calendar days from the date of service to file your Answer (Fla. R. Civ. P. 1.140(a)(1)). This is shorter than many other states.\n\nIf you do not file an Answer within 20 days, the court can enter a default judgment against you — meaning the plaintiff wins automatically.\n\nYour Answer must contain:\n• Specific denials — respond to each allegation individually (Fla. R. Civ. P. 1.110(c))\n• All affirmative defenses in a separate section (Fla. R. Civ. P. 1.110(d))\n\nFlorida is a FACT PLEADING state (Fla. R. Civ. P. 1.110(b)) — you must include the ultimate facts supporting each defense, not just legal conclusions.\n\nYou may also file a Motion to Dismiss (Fla. R. Civ. P. 1.140(b)) BEFORE or WITH your Answer if the complaint is legally defective (failure to state a cause of action, lack of jurisdiction, improper venue, insufficiency of service).',
      showIf: (answers) => answers.party_role === 'defendant',
    },

    // === Court selection (plaintiff or general) ===
    {
      id: 'total_damages',
      type: 'single_choice',
      prompt: 'How much are your total damages?',
      helpText:
        'Include the full amount owed under the contract, consequential damages, and any out-of-pocket costs caused by the breach.',
      options: [
        { value: 'under_8k', label: '$8,000 or less' },
        { value: '8k_to_50k', label: '$8,001 to $50,000' },
        { value: 'over_50k', label: 'Over $50,000' },
      ],
    },
    {
      id: 'court_small_claims',
      type: 'info',
      prompt:
        'File in SMALL CLAIMS COURT (≤$8,000).\n\nFiling fee: approximately $55–$300 depending on amount. Simplified procedures — no formal rules of evidence. Attorneys are allowed but not required. Cases are typically resolved in 1–2 hearings.\n\nYou can represent yourself without difficulty in small claims court.',
      showIf: (answers) => answers.total_damages === 'under_8k',
    },
    {
      id: 'court_county',
      type: 'info',
      prompt:
        'File in COUNTY COURT ($8,001–$50,000).\n\nFiling fee: approximately $300–$400. More formal than small claims — Florida Rules of Civil Procedure apply. A Civil Cover Sheet (Form 1.997) is REQUIRED with your initial filing.\n\nFact pleading applies (Fla. R. Civ. P. 1.110(b)). Your complaint must include the ultimate facts constituting each element of your claim.',
      showIf: (answers) => answers.total_damages === '8k_to_50k',
    },
    {
      id: 'court_circuit',
      type: 'info',
      prompt:
        'File in CIRCUIT COURT (over $50,000).\n\nFiling fee: approximately $400+. Most formal court level — full Florida Rules of Civil Procedure apply. A Civil Cover Sheet (Form 1.997) is REQUIRED.\n\nFact pleading applies (Fla. R. Civ. P. 1.110(b)). Consider consulting an attorney for cases at this level, especially if the opposing party is represented.',
      showIf: (answers) => answers.total_damages === 'over_50k',
    },

    // === Venue ===
    {
      id: 'venue_info',
      type: 'info',
      prompt:
        'VENUE — WHERE TO FILE (Fla. Stat. §47.011)\n\nFile in the county where:\n• The cause of action accrued (where the breach happened), OR\n• The defendant resides\n\nIf your contract has a forum selection clause specifying a county or court, that clause usually controls. Check the contract for language like "any disputes shall be resolved in [county]" or "exclusive jurisdiction in [court]."\n\nIf the defendant is a business, venue is proper where the business has a principal office or where the cause of action accrued.',
    },

    // === Forum selection clause ===
    {
      id: 'forum_selection',
      type: 'yes_no',
      prompt: 'Does your contract specify where disputes must be filed (a "forum selection" clause)?',
      helpText:
        'Look near the end of the contract for language about jurisdiction, venue, or dispute resolution.',
    },
    {
      id: 'forum_selection_yes_info',
      type: 'info',
      prompt:
        'Your contract\'s forum selection clause generally controls where you must file. Florida courts enforce these clauses unless they are unreasonable or the result of fraud or overreaching. File in the court and location specified in the contract.',
      showIf: (answers) => answers.forum_selection === 'yes',
    },

    // === Damages types ===
    {
      id: 'damages_info',
      type: 'info',
      prompt:
        'FLORIDA CONTRACT DAMAGES\n\nYou may claim the following types of damages:\n\n1. EXPECTATION DAMAGES — the benefit you expected to receive under the contract (most common)\n2. RELIANCE DAMAGES — out-of-pocket costs you incurred relying on the contract\n3. RESTITUTION — the value of any benefit you conferred on the breaching party\n4. CONSEQUENTIAL DAMAGES — foreseeable losses caused by the breach (e.g., lost profits, cost of replacement)\n\nYou must prove damages with reasonable certainty — speculative damages are not recoverable.\n\nPREJUDGMENT INTEREST: For contract claims, the contractual interest rate applies if specified in the contract. Otherwise, the statutory rate applies. Note: Fla. Stat. §768.0710 governs prejudgment interest for tort claims, not contract claims.\n\nFDUTPA (Fla. Stat. §501.201): If the breach involved deceptive or unfair trade practices, you may also have a claim under the Florida Deceptive and Unfair Trade Practices Act, which provides for actual damages, attorney fees, and injunctive relief.',
    },

    // === Filing method ===
    {
      id: 'filing_method',
      type: 'single_choice',
      prompt: 'How do you plan to file?',
      helpText:
        'E-filing is mandatory in Florida for most civil cases. Pro se parties may also file in person or by mail at the clerk\'s office in some counties.',
      options: [
        { value: 'efile', label: 'Online (www.myflcourtaccess.com) — mandatory for most cases' },
        { value: 'in_person', label: 'In person at the clerk\'s office' },
        { value: 'mail', label: 'By mail' },
      ],
    },
    {
      id: 'efile_instructions',
      type: 'info',
      prompt:
        'E-FILING IS MANDATORY IN FLORIDA (www.myflcourtaccess.com)\n\n1. Go to www.myflcourtaccess.com and create a free account\n2. Select your county, court division, and case type\n3. Upload your Complaint/Petition as a PDF\n4. Upload the Civil Cover Sheet (Form 1.997) — REQUIRED for county and circuit court\n5. Pay the filing fee online (or submit an Application for Determination of Civil Indigent Status)\n6. You will receive email confirmation when your filing is accepted\n\nPro se litigants who cannot e-file may request an exemption from the clerk.',
      showIf: (answers) => answers.filing_method === 'efile',
    },
    {
      id: 'in_person_instructions',
      type: 'info',
      prompt:
        'To file in person:\n1. Print 3 copies of your Complaint (one for the court, one for you, one to serve)\n2. Print the Civil Cover Sheet (Form 1.997) if filing in county or circuit court\n3. Go to the Clerk of Court\'s office during business hours\n4. Tell the clerk: "I need to file a Complaint for breach of contract"\n5. Pay the filing fee (or bring a completed Application for Determination of Civil Indigent Status)\n6. The clerk will stamp all copies — keep your stamped copy\n7. Ask the clerk about service of process options\n\nNote: Some counties may require you to e-file even in person. Ask the clerk.',
      showIf: (answers) => answers.filing_method === 'in_person',
    },
    {
      id: 'mail_instructions',
      type: 'info',
      prompt:
        'To file by mail:\n1. Print 3 copies of your Complaint and the Civil Cover Sheet (Form 1.997)\n2. Include a self-addressed stamped envelope for the clerk to return your stamped copy\n3. Mail to the Clerk of Court via certified mail with return receipt requested\n4. Include a check or money order for the filing fee (or the indigency application form)\n\nWarning: Mail takes time. Allow at least 7–10 business days. E-filing via myflcourtaccess.com is strongly preferred.',
      showIf: (answers) => answers.filing_method === 'mail',
    },

    // === Fee affordability ===
    {
      id: 'can_afford_fee',
      type: 'yes_no',
      prompt: 'Can you afford the filing fee?',
    },
    {
      id: 'fee_waiver_info',
      type: 'info',
      prompt:
        'You can file an "Application for Determination of Civil Indigent Status" with the Clerk of Court.\n\n1. Obtain the form from the clerk\'s office or download it from your county clerk\'s website\n2. Complete it honestly — include your income, assets, and expenses\n3. File it WITH your Complaint\n4. The clerk will review your application — if approved, fees are waived\n5. If denied, you may seek review by the court\n\nDefendants filing an Answer generally do NOT pay a filing fee in Florida (Fla. Stat. §34.041 for county court).',
      showIf: (answers) => answers.can_afford_fee === 'no',
    },

    // === Fact pleading requirement ===
    {
      id: 'fact_pleading_info',
      type: 'info',
      prompt:
        'FLORIDA IS A FACT PLEADING STATE (Fla. R. Civ. P. 1.110(b))\n\nYour Complaint must contain a short and plain statement of the ULTIMATE FACTS constituting your cause of action. This is different from federal "notice pleading."\n\nFor a breach of contract claim, you must plead:\n1. A valid contract existed between the parties\n2. You performed your obligations (or were excused from performance)\n3. The defendant breached the contract\n4. You suffered damages as a result\n\nState the specific facts — do not merely recite legal conclusions. For example, say "Defendant failed to deliver 500 widgets by January 15, 2025 as required by Section 3 of the Agreement" rather than "Defendant breached the contract."',
    },

    // === Required documents checklist ===
    {
      id: 'filing_checklist',
      type: 'info',
      prompt:
        'FILING CHECKLIST — DOCUMENTS YOU NEED\n\n• Complaint/Petition (signed, with specific factual allegations)\n• Civil Cover Sheet (Form 1.997) — required for county and circuit court\n• Copy of the contract (attach as exhibit if written)\n• Filing fee payment or Application for Determination of Civil Indigent Status\n• Summons (the clerk will issue this for service on the defendant)\n\nAfter filing:\n• Serve the defendant within 120 days (Fla. R. Civ. P. 1.070(i))\n• File proof of service (Return of Service) with the court\n• The defendant then has 20 days to respond (Fla. R. Civ. P. 1.140)',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Contract type & SOL
    if (answers.contract_type) {
      const solLabels: Record<string, string> = {
        written: 'Written contract — 5-year SOL (Fla. Stat. §95.11(2)(b))',
        oral: 'Oral contract — 4-year SOL (Fla. Stat. §95.11(3)(k))',
        unsure: 'Contract type undetermined — SOL is 4 or 5 years depending on type',
      }
      items.push({
        status: answers.contract_type === 'unsure' ? 'needed' : 'done',
        text: solLabels[answers.contract_type],
      })
    }

    // Breach date
    if (answers.breach_date_known === 'yes') {
      items.push({ status: 'done', text: 'Breach date identified — calculate your SOL deadline.' })
    } else if (answers.breach_date_known === 'no') {
      items.push({
        status: 'needed',
        text: 'Determine the date of breach to calculate your filing deadline.',
      })
    }

    // SOL concern
    if (answers.sol_expired_concern === 'yes') {
      items.push({
        status: 'needed',
        text: 'SOL may have expired — check for tolling, discovery rule, or other exceptions. If defending, raise SOL as an affirmative defense.',
      })
    }

    // Party role
    if (answers.party_role === 'defendant') {
      items.push({
        status: 'needed',
        text: 'File your Answer within 20 days of service (Fla. R. Civ. P. 1.140). Include specific denials and all affirmative defenses. Consider a Motion to Dismiss (Fla. R. Civ. P. 1.140(b)) if the complaint is defective.',
      })
    }

    // Court type
    if (answers.total_damages) {
      const courtLabels: Record<string, string> = {
        under_8k: 'Small Claims Court ($8,000 or less)',
        '8k_to_50k': 'County Court ($8,001–$50,000)',
        over_50k: 'Circuit Court (over $50,000)',
      }
      items.push({
        status: 'done',
        text: `Court: ${courtLabels[answers.total_damages]}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Determine your total damages to identify the correct court.',
      })
    }

    // Forum selection
    if (answers.forum_selection === 'yes') {
      items.push({
        status: 'info',
        text: 'Contract specifies where to file — follow the forum selection clause.',
      })
    }

    // Filing method
    if (answers.filing_method) {
      const methodLabels: Record<string, string> = {
        efile: 'E-file via www.myflcourtaccess.com (mandatory for most cases)',
        in_person: 'In person at the Clerk of Court',
        mail: 'By certified mail',
      }
      items.push({
        status: 'done',
        text: `Filing method: ${methodLabels[answers.filing_method]}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Choose a filing method. E-filing via myflcourtaccess.com is mandatory for most FL civil cases.',
      })
    }

    // Fee
    if (answers.can_afford_fee === 'yes') {
      items.push({ status: 'done', text: 'Filing fee: prepared to pay.' })
    } else if (answers.can_afford_fee === 'no') {
      items.push({
        status: 'needed',
        text: 'File an Application for Determination of Civil Indigent Status with your Complaint.',
      })
    }

    // Civil Cover Sheet reminder for county/circuit
    if (answers.total_damages === '8k_to_50k' || answers.total_damages === 'over_50k') {
      items.push({
        status: 'needed',
        text: 'Complete and file Civil Cover Sheet (Form 1.997) — required for county and circuit court.',
      })
    }

    // Venue reminder
    items.push({
      status: 'info',
      text: 'Venue: file where the cause of action accrued or where the defendant resides (Fla. Stat. §47.011).',
    })

    // Fact pleading reminder
    if (answers.party_role === 'plaintiff' || answers.party_role === 'unsure_role') {
      items.push({
        status: 'info',
        text: 'Florida requires fact pleading (Fla. R. Civ. P. 1.110(b)) — your Complaint must state ultimate facts, not just legal conclusions.',
      })
    }

    return items
  },
}
