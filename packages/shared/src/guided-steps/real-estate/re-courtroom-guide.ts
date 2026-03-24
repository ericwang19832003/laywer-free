import type { GuidedStepConfig } from '../types'

export const reCourtroomGuideConfig: GuidedStepConfig = {
  title: 'What to Expect at Your Real Estate Trial',
  reassurance:
    'Real estate trials are won with documents — deeds, contracts, photos, and expert reports. If you have the paperwork, you have a strong case.',

  questions: [
    // Court type
    {
      id: 'which_court',
      type: 'single_choice',
      prompt: 'Which court is your case in?',
      options: [
        { value: 'jp', label: 'Justice of the Peace (JP) Court' },
        { value: 'county', label: 'County Court' },
        { value: 'district', label: 'District Court' },
        { value: 'unsure', label: "I'm not sure" },
      ],
    },
    {
      id: 'jp_info',
      type: 'info',
      prompt:
        'JP Court is informal. No jury unless requested. The judge may ask questions directly. You can present evidence without strict formal rules. Keep it simple and organized.',
      showIf: (answers) => answers.which_court === 'jp',
    },
    {
      id: 'county_info',
      type: 'info',
      prompt:
        'County Court is more formal. Rules of evidence apply. You may have a jury. Dress professionally, address the judge as "Your Honor," and be prepared to formally introduce each exhibit.',
      showIf: (answers) => answers.which_court === 'county',
    },
    {
      id: 'district_info',
      type: 'info',
      prompt:
        'District Court is the most formal. Strict rules of evidence and procedure apply. Jury trials are common. You will need to formally offer each exhibit, lay foundation for evidence, and follow courtroom protocol precisely.',
      showIf: (answers) => answers.which_court === 'district',
    },
    {
      id: 'unsure_info',
      type: 'info',
      prompt:
        'Check your court paperwork — the court name is on your citation or petition. JP Courts handle claims up to $20,000. County Courts handle claims up to $200,000. District Courts handle claims over $200,000 and all cases seeking specific performance.',
      showIf: (answers) => answers.which_court === 'unsure',
    },

    // Sub-type of dispute
    {
      id: 'dispute_subtype',
      type: 'single_choice',
      prompt: 'What type of real estate dispute is this?',
      options: [
        { value: 'title_defect', label: 'Title defect or quiet title' },
        { value: 'construction_defect', label: 'Construction defect (RCLA)' },
        { value: 'seller_disclosure', label: 'Seller disclosure violation' },
        { value: 'earnest_money', label: 'Earnest money dispute' },
        { value: 'boundary', label: 'Boundary or survey dispute' },
        { value: 'breach_contract', label: 'Breach of purchase agreement' },
        { value: 'other', label: 'Other' },
      ],
    },

    // Title evidence
    {
      id: 'title_evidence_info',
      type: 'info',
      prompt:
        'PRESENTING TITLE EVIDENCE:\n- Bring the full chain of title (all deeds from the original grant to the present)\n- Present your title insurance policy — show what is covered vs. excluded\n- If you have a title commitment, highlight Schedule B exceptions\n- Use certified copies of deeds from the county clerk — courts prefer these over photocopies\n- A title examiner or title company representative can testify as an expert on chain of title issues',
      showIf: (answers) => answers.dispute_subtype === 'title_defect',
    },

    // Construction defect (RCLA)
    {
      id: 'rcla_evidence_info',
      type: 'info',
      prompt:
        'PRESENTING CONSTRUCTION DEFECT EVIDENCE (RCLA):\n- You will need expert testimony — a licensed engineer, architect, or qualified inspector must testify about the defect, its cause, and the cost to repair\n- Present your RCLA notice (60-day pre-suit notice to the builder) and any inspection or repair offer from the builder\n- Show photos and videos of the defects (before and after if available)\n- Present repair estimates from licensed contractors (at least 2-3 for credibility)\n- If the builder inspected and offered repairs, explain why the offer was inadequate',
      showIf: (answers) => answers.dispute_subtype === 'construction_defect',
    },

    // Seller disclosure
    {
      id: 'disclosure_evidence_info',
      type: 'info',
      prompt:
        'PRESENTING SELLER DISCLOSURE EVIDENCE:\n- Show the Seller\'s Disclosure Notice (or prove one was never provided)\n- Compare what the seller disclosed vs. the actual condition of the property\n- Present your inspection report that reveals the undisclosed defects\n- Show repair estimates for the undisclosed issues\n- If claiming DTPA violations, present evidence the seller KNEW about the defect (prior repair invoices, neighbor testimony, prior inspection reports)',
      showIf: (answers) => answers.dispute_subtype === 'seller_disclosure',
    },

    // Earnest money
    {
      id: 'earnest_money_evidence_info',
      type: 'info',
      prompt:
        'PRESENTING EARNEST MONEY EVIDENCE:\n- Bring the purchase agreement showing the earnest money terms\n- Show the earnest money receipt from the title company\n- Present evidence of who breached the contract and why\n- If the buyer backed out: show evidence of valid termination (inspection contingency, financing contingency, etc.) or evidence of breach\n- If the seller backed out: show evidence of buyer\'s performance and readiness to close\n- Bring correspondence about the earnest money dispute (demand letters, title company communications)',
      showIf: (answers) => answers.dispute_subtype === 'earnest_money',
    },

    // Boundary/survey
    {
      id: 'boundary_evidence_info',
      type: 'info',
      prompt:
        'PRESENTING SURVEY AND BOUNDARY EVIDENCE:\n- A licensed surveyor must testify about boundary locations — survey maps alone are usually not sufficient\n- Present the most recent survey of both properties\n- Show older surveys or plat maps if the boundary has shifted over time\n- Bring deed descriptions (metes and bounds) for comparison\n- If claiming adverse possession, show evidence of continuous, hostile, open, and exclusive possession for the statutory period\n- Aerial photos and GIS maps can supplement surveyor testimony',
      showIf: (answers) => answers.dispute_subtype === 'boundary',
    },

    // Breach of purchase agreement
    {
      id: 'breach_contract_evidence_info',
      type: 'info',
      prompt:
        'PRESENTING BREACH OF PURCHASE AGREEMENT EVIDENCE:\n- The purchase agreement is Exhibit A — bring the original or best copy\n- Highlight the specific provision that was breached\n- Show your performance (proof you met your obligations: financing approval, inspection completion, etc.)\n- Show the breach (missed closing date, failure to deliver clear title, refusal to make agreed repairs)\n- Present damages: out-of-pocket costs, difference in property value, lost earnest money, relocation costs',
      showIf: (answers) => answers.dispute_subtype === 'breach_contract',
    },

    // Sample testimony
    {
      id: 'sample_testimony',
      type: 'info',
      prompt:
        'SAMPLE TESTIMONY SCRIPTS:\n\nTitle defect: "Your Honor, I purchased the property at [address] on [date]. After closing, I discovered [describe defect — lien, encumbrance, boundary overlap]. My title policy from [company] excludes this defect under Schedule B. The seller warranted clear title in the deed, and I have suffered damages of $[amount] to cure the defect."\n\nConstruction defect: "Your Honor, I purchased a new home from [builder] on [date]. Within [time], I discovered [defect]. I sent the required 60-day RCLA notice on [date]. The builder [offered inadequate repairs / failed to respond]. My expert, [name], will testify that the defect was caused by [cause] and costs $[amount] to repair."\n\nSeller disclosure: "Your Honor, I purchased the property on [date]. The seller\'s disclosure form stated [what was disclosed]. In fact, the property had [actual condition]. The seller knew about this because [evidence of knowledge]. I have spent $[amount] to address this issue."\n\nEarnest money: "Your Honor, I entered into a contract to [buy/sell] the property on [date] and deposited $[amount] in earnest money with [title company]. The [other party] breached the contract by [describe breach]. Under the contract terms, I am entitled to the return of [/ forfeiture of] the earnest money."',
    },

    // What NOT to say
    {
      id: 'what_not_to_say',
      type: 'info',
      prompt:
        'WHAT NOT TO SAY:\n- Do not say "they knew about it" unless you have evidence the other party had actual knowledge\n- Do not discuss what you "feel" the property is worth — use appraisals and comparable sales\n- Do not bring up personal hardship unrelated to the legal claim\n- Do not discuss settlement negotiations — these are inadmissible under Texas Rule of Evidence 408\n- Do not speculate about the other party\'s motives — stick to documented facts\n- Do not interrupt the judge, opposing counsel, or witnesses',
    },

    // What to bring
    {
      id: 'what_to_bring',
      type: 'info',
      prompt:
        'WHAT TO BRING TO COURT:\n\n- 3 copies of everything (you, judge, defendant)\n- The purchase agreement or contract\n- Deed and legal description of the property\n- Title policy and title commitment\n- Survey (if boundary or title issue)\n- Inspection reports\n- Seller\'s Disclosure Notice\n- All communications (emails, texts, letters)\n- Photos and videos of the property and defects\n- Repair estimates (2-3 from licensed contractors)\n- Appraisal or comparable sales data\n- Expert reports (engineer, surveyor, inspector)\n- Timeline of events (written out)\n- Damages calculation with supporting receipts\n- RCLA notice and builder response (if construction defect)',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Court type
    if (answers.which_court && answers.which_court !== 'unsure') {
      const courtLabels: Record<string, string> = {
        jp: 'Justice of the Peace (JP) Court',
        county: 'County Court',
        district: 'District Court',
      }
      items.push({
        status: 'done',
        text: `Court identified: ${courtLabels[answers.which_court]}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Determine which court your case is in — check your citation or petition.',
      })
    }

    // Dispute sub-type
    if (answers.dispute_subtype) {
      const subtypeLabels: Record<string, string> = {
        title_defect: 'Title defect or quiet title',
        construction_defect: 'Construction defect (RCLA)',
        seller_disclosure: 'Seller disclosure violation',
        earnest_money: 'Earnest money dispute',
        boundary: 'Boundary or survey dispute',
        breach_contract: 'Breach of purchase agreement',
        other: 'Other real estate dispute',
      }
      items.push({
        status: 'done',
        text: `Dispute type: ${subtypeLabels[answers.dispute_subtype]}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Identify the specific type of real estate dispute for trial preparation.',
      })
    }

    // Expert testimony reminder
    if (
      answers.dispute_subtype === 'construction_defect' ||
      answers.dispute_subtype === 'boundary'
    ) {
      items.push({
        status: 'needed',
        text: 'Arrange expert testimony — construction defect cases need a licensed engineer or inspector; boundary cases need a licensed surveyor.',
      })
    }

    items.push({
      status: 'info',
      text: 'Prepare 3 copies of all evidence (you, judge, defendant).',
    })

    items.push({
      status: 'needed',
      text: 'Organize all property documents, communications, and proof of damages chronologically.',
    })

    items.push({
      status: 'needed',
      text: 'Prepare a clear damages calculation with supporting documents (repair estimates, appraisals, receipts).',
    })

    items.push({
      status: 'info',
      text: 'Practice your testimony — keep it factual, reference specific documents, and focus on the legal elements of your claim.',
    })

    return items
  },
}
