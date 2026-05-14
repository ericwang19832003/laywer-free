import type { GuidedStepConfig } from '../types'

export const reFilingGuidePaConfig: GuidedStepConfig = {
  title: 'Pennsylvania Real Estate Dispute — Filing Guide',
  reassurance:
    "Pennsylvania real estate disputes follow specific rules about where to file, what deadlines apply, and what documents are required. We'll walk you through every step so you know exactly what to do.",

  questions: [
    // === Statute of Limitations ===
    {
      id: 'sol_intro',
      type: 'info',
      prompt:
        'STATUTE OF LIMITATIONS — YOUR CLAIM MUST BE TIMELY\n\nPennsylvania has different deadlines depending on your real estate dispute type:\n\n• Written contract disputes (purchase agreements, leases): 4 years (42 Pa.C.S. §5525(a)(8))\n• Fraud / misrepresentation: 2 years (42 Pa.C.S. §5524(7))\n• Adverse possession: 21 years of continuous possession required (42 Pa.C.S. §5530)\n• Mechanic\'s liens: 6 months from last work performed (49 P.S. §1501)\n• Property damage / trespass: 2 years (42 Pa.C.S. §5524(1))\n\nThe clock typically starts when the cause of action accrues — when you knew or should have known about the problem.',
    },

    // === Dispute Type ===
    {
      id: 'dispute_type',
      type: 'single_choice',
      prompt: 'What type of real estate dispute do you have?',
      options: [
        { value: 'contract', label: 'Purchase agreement or contract dispute' },
        { value: 'title_defect', label: 'Title defect or quiet title action' },
        { value: 'boundary', label: 'Boundary or survey dispute' },
        { value: 'easement', label: 'Easement dispute (access, use, or interference)' },
        { value: 'disclosure', label: 'Seller failed to disclose defects' },
        { value: 'adverse_possession', label: 'Adverse possession claim' },
        { value: 'mechanic_lien', label: 'Mechanic\'s lien (contractor / construction)' },
        { value: 'hoa', label: 'HOA or planned community dispute' },
        { value: 'landlord_tenant', label: 'Landlord-tenant dispute involving real property' },
        { value: 'other', label: 'Other real estate dispute' },
      ],
    },

    // === Disclosure Failure Info ===
    {
      id: 'disclosure_info',
      type: 'info',
      prompt:
        'SELLER DISCLOSURE FAILURES — PA Real Estate Seller Disclosure Law (68 Pa.C.S. §7301-7315)\n\nPennsylvania law requires most residential sellers to provide a detailed Seller Disclosure Statement covering known defects, environmental hazards, water damage, structural issues, and more.\n\nKey points:\n• The disclosure must be provided before execution of the agreement of sale\n• Buyer has a right to rescind within a specific period if disclosure is late or incomplete\n• Seller is liable for KNOWN defects that were not disclosed — not for latent defects the seller did not know about\n• Exemptions: new construction, foreclosures, transfers between co-owners, court-ordered sales\n\nYou must prove the seller KNEW about the defect and intentionally concealed it. Evidence includes prior repair records, insurance claims, permits, and neighbor testimony.',
      showIf: (answers) => answers.dispute_type === 'disclosure',
    },

    // === Mechanic's Lien Info ===
    {
      id: 'mechanic_lien_info',
      type: 'info',
      prompt:
        'MECHANIC\'S LIEN — PA Mechanic\'s Lien Law (49 P.S. §1101 et seq.)\n\nCRITICAL DEADLINE: You must file your mechanic\'s lien claim within 6 months of the last date work was performed or materials were furnished.\n\nRequirements:\n• The claim must be filed in the Court of Common Pleas in the county where the property is located\n• It must include a detailed description of the work, the amount owed, and the legal description of the property\n• Subcontractors must have served a formal notice of intent to file a lien on the property owner before or within specific timeframes\n• Residential properties (single-family homes): subcontractors must give a Preliminary Notice within 30 days of first furnishing labor/materials\n\nOnce filed, you have 2 years to enforce the lien by filing a suit to foreclose. If you do not act within 2 years, the lien expires.',
      showIf: (answers) => answers.dispute_type === 'mechanic_lien',
    },

    // === Quiet Title / Title Defect Info ===
    {
      id: 'quiet_title_info',
      type: 'info',
      prompt:
        'QUIET TITLE ACTIONS\n\nA quiet title action asks the court to determine who owns the property and to eliminate competing claims. Pennsylvania courts handle these in equity (no jury trial).\n\nCommon grounds:\n• Unresolved liens or encumbrances on title\n• Conflicting deeds or chain-of-title breaks\n• Dormant mineral interests — 68 Pa.C.S. §7501 (Dormant Oil and Gas Act) allows you to extinguish old mineral reservations if the interest holder has not used or claimed them for 20+ years\n• Adverse possession claims\n• Errors in recorded documents\n\nYou must name all known parties with a potential interest in the property. A title search is essential before filing.',
      showIf: (answers) =>
        answers.dispute_type === 'title_defect' || answers.dispute_type === 'adverse_possession',
    },

    // === Boundary Dispute Info ===
    {
      id: 'boundary_info',
      type: 'info',
      prompt:
        'BOUNDARY DISPUTES\n\nPennsylvania boundary disputes are resolved in the Court of Common Pleas, typically in equity. Key considerations:\n\n• Get a licensed surveyor\'s report — this is your most important piece of evidence\n• Review both deeds for the legal descriptions and compare them\n• Acquiescence doctrine: if neighbors have treated a boundary line as correct for 21+ years, the court may enforce it regardless of the survey\n• Encroachments (fences, buildings, driveways crossing the line) may give rise to adverse possession or prescriptive easement claims\n• Trespass damages: if the encroachment was intentional, you can recover damages plus potentially force removal',
      showIf: (answers) => answers.dispute_type === 'boundary',
    },

    // === Easement Dispute Info ===
    {
      id: 'easement_info',
      type: 'info',
      prompt:
        'EASEMENT DISPUTES\n\nPennsylvania recognizes several types of easements:\n\n• Express easement — created by a written document (deed, agreement)\n• Easement by necessity — landlocked parcel with no other access\n• Prescriptive easement — open, continuous, hostile use for 21 years (same period as adverse possession)\n• Easement by implication — implied from prior use when a parcel is subdivided\n\nCommon disputes: blocking access, overburdening the easement, scope of permitted use, maintenance responsibilities.\n\nEasement claims are heard in the Court of Common Pleas in equity. Remedies include injunctive relief (forcing access or removal of obstruction) and damages.',
      showIf: (answers) => answers.dispute_type === 'easement',
    },

    // === HOA Dispute Info ===
    {
      id: 'hoa_info',
      type: 'info',
      prompt:
        'HOA / PLANNED COMMUNITY DISPUTES — PA Uniform Planned Community Act (68 Pa.C.S. §5101 et seq.)\n\nThis Act governs condominiums and planned communities created after 1997. Key provisions:\n\n• The association must follow its declaration, bylaws, and rules — any action outside these is challengeable\n• Lien priority: HOA assessments have limited priority over mortgages (up to 6 months of assessments)\n• Meetings, budgets, and records must be transparent to unit owners\n• Architectural restrictions must be uniformly enforced\n• Dispute resolution: many declarations require mediation or arbitration before litigation\n\nBefore filing in court, check your declaration for mandatory dispute resolution procedures. Failure to exhaust these may result in dismissal.',
      showIf: (answers) => answers.dispute_type === 'hoa',
    },

    // === Adverse Possession Info ===
    {
      id: 'adverse_possession_info',
      type: 'info',
      prompt:
        'ADVERSE POSSESSION — 42 Pa.C.S. §5530\n\nTo claim title by adverse possession in Pennsylvania, you must prove 21 years of continuous possession that was:\n\n• Actual — you physically occupied and used the land\n• Open and notorious — visible to anyone, including the true owner\n• Hostile — without the owner\'s permission\n• Exclusive — not shared with the true owner\n• Continuous — uninterrupted for the full 21-year period\n\n21 years is one of the longest adverse possession periods in the country. Tacking (combining successive possessors\' time) is allowed if there is privity between them.\n\nYou will need to file a quiet title action to obtain a court order recognizing your ownership.',
      showIf: (answers) => answers.dispute_type === 'adverse_possession',
    },

    // === Breach Timing ===
    {
      id: 'breach_timing',
      type: 'single_choice',
      prompt: 'When did the problem first occur or when did you first discover it?',
      helpText:
        'For contract disputes, this is when the breach occurred. For disclosure failures, this is when you discovered the defect. For mechanic\'s liens, this is when the last work was performed.',
      options: [
        { value: 'under_6_months', label: 'Less than 6 months ago' },
        { value: '6_months_to_2_years', label: '6 months to 2 years ago' },
        { value: '2_to_4_years', label: '2 to 4 years ago' },
        { value: 'over_4_years', label: 'More than 4 years ago' },
        { value: 'unsure', label: 'I am not sure' },
      ],
    },
    {
      id: 'sol_mechanic_urgent',
      type: 'info',
      prompt:
        'URGENT: If you are filing a mechanic\'s lien, the 6-month deadline from last work performed may have already passed. Verify the exact date of last work and file immediately if you are still within the window. A late mechanic\'s lien is void.',
      showIf: (answers) =>
        answers.dispute_type === 'mechanic_lien' &&
        answers.breach_timing !== 'under_6_months',
    },
    {
      id: 'sol_safe',
      type: 'info',
      prompt:
        'Your claim appears to be within the applicable statute of limitations. File promptly — delays risk lost evidence, fading witness memories, and potential property transfers.',
      showIf: (answers) =>
        answers.breach_timing === 'under_6_months' ||
        (answers.breach_timing === '6_months_to_2_years' && answers.dispute_type !== 'mechanic_lien'),
    },
    {
      id: 'sol_approaching',
      type: 'info',
      prompt:
        'YOUR DEADLINE MAY BE APPROACHING. Fraud and trespass claims have a 2-year SOL. Contract claims have 4 years. Calculate your exact deadline and file as soon as possible.',
      showIf: (answers) => answers.breach_timing === '2_to_4_years',
    },
    {
      id: 'sol_expired_warning',
      type: 'info',
      prompt:
        'WARNING: Your claim may be barred by the statute of limitations. However, narrow exceptions may apply:\n\n• Discovery rule: if you could not have reasonably discovered the problem earlier\n• Defendant\'s absence from Pennsylvania (tolling under 42 Pa.C.S. §5532)\n• Fraudulent concealment of the defect or breach\n\nQuiet title and adverse possession claims are not subject to the same SOL — they depend on the 21-year possession period.\n\nConsult an attorney if you believe an exception applies.',
      showIf: (answers) => answers.breach_timing === 'over_4_years',
    },
    {
      id: 'sol_unsure_info',
      type: 'info',
      prompt:
        'Review your purchase agreement, closing documents, inspection reports, repair invoices, and communications to determine when the issue first arose or when you discovered it. The applicable statute of limitations starts on that date. If you cannot determine the date, consult an attorney.',
      showIf: (answers) => answers.breach_timing === 'unsure',
    },

    // === Court Selection ===
    {
      id: 'court_header',
      type: 'info',
      prompt:
        'CHOOSING THE RIGHT COURT\n\nMost Pennsylvania real estate disputes must be filed in the Court of Common Pleas, which has equity jurisdiction over property matters.\n\n• Court of Common Pleas — handles quiet title, boundary disputes, easements, mechanic\'s liens, specific performance, and all claims involving title or possession. Required for equitable relief (injunctions, declaratory judgments).\n• Magisterial District Court — limited to monetary claims under $12,000 (e.g., security deposit disputes, minor damage claims). Cannot grant equitable relief.\n\nIMPORTANT: Most real estate disputes require equitable relief that only the Court of Common Pleas can provide.',
    },
    {
      id: 'total_damages',
      type: 'single_choice',
      prompt: 'What type of relief are you seeking?',
      helpText:
        'Equitable relief includes forcing a sale, quieting title, removing a lien, or stopping a trespass. Monetary relief is a dollar amount for damages.',
      options: [
        { value: 'equitable_only', label: 'Equitable relief only (quiet title, injunction, specific performance)' },
        { value: 'money_under_12k', label: 'Monetary damages only — under $12,000' },
        { value: 'money_12k_to_50k', label: 'Monetary damages — $12,000 to $50,000' },
        { value: 'money_over_50k', label: 'Monetary damages — over $50,000' },
        { value: 'both', label: 'Both equitable relief and monetary damages' },
      ],
    },
    {
      id: 'court_common_pleas',
      type: 'info',
      prompt:
        'File in the Court of Common Pleas.\n\nFiling fee: approximately $200-$350 depending on the county.\n\nThe Court of Common Pleas has full equity jurisdiction and can order:\n• Quiet title (declaring you the owner)\n• Specific performance (forcing completion of a sale)\n• Injunctions (stopping trespass, construction, or interference)\n• Partition (dividing co-owned property)\n• Declaratory judgment (determining rights under a deed or easement)\n• Monetary damages\n\nIf your claim is under the county\'s compulsory arbitration threshold ($25,000-$50,000 depending on county), purely monetary claims will first go to mandatory arbitration.',
      showIf: (answers) =>
        answers.total_damages === 'equitable_only' ||
        answers.total_damages === 'money_12k_to_50k' ||
        answers.total_damages === 'money_over_50k' ||
        answers.total_damages === 'both',
    },
    {
      id: 'court_magisterial',
      type: 'info',
      prompt:
        'You may file in Magisterial District Court for monetary claims under $12,000.\n\nFiling fee: approximately $45-$125.\n\nAdvantages:\n• Simpler process — no formal pleading rules\n• Faster resolution (hearing within 30-60 days)\n• Either party can appeal to the Court of Common Pleas for a de novo trial within 30 days\n\nLimitation: Magisterial District Court CANNOT grant equitable relief (quiet title, injunctions, specific performance). If you need equitable relief, you must file in the Court of Common Pleas.',
      showIf: (answers) => answers.total_damages === 'money_under_12k',
    },

    // === Venue ===
    {
      id: 'property_county',
      type: 'text',
      prompt: 'What county is the property located in?',
      helpText:
        'Under Pa.R.C.P. 1006(a), real estate actions must generally be filed in the county where the property is situated. This is especially strict for actions involving title, possession, or liens on real property.',
      placeholder: 'e.g. Allegheny County',
    },
    {
      id: 'venue_info',
      type: 'info',
      prompt:
        'VENUE — WHERE TO FILE (Pa.R.C.P. 1006)\n\nFor real estate disputes involving title, possession, or liens, you MUST file in the county where the property is located. This is mandatory venue — the court will transfer your case if you file in the wrong county.\n\nFor monetary-only disputes related to real estate (e.g., breach of purchase agreement seeking only damages), venue may also be proper where the defendant resides or where the contract was signed. However, filing where the property is located is safest.',
    },

    // === Lis Pendens ===
    {
      id: 'want_lis_pendens',
      type: 'yes_no',
      prompt: 'Does your dispute involve title, ownership, or a lien on the property?',
      helpText:
        'If your lawsuit could affect who owns the property or what liens encumber it, you should consider filing a lis pendens (notice of pending action) to protect your interest.',
    },
    {
      id: 'lis_pendens_info',
      type: 'info',
      prompt:
        'LIS PENDENS — NOTICE OF PENDING ACTION (Pa.R.C.P. 1901-1910)\n\nA lis pendens puts the world on notice that the property is subject to a pending lawsuit. It prevents the other party from selling or refinancing without buyers and lenders knowing about your claim.\n\nTo file a lis pendens in Pennsylvania:\n1. File your complaint first — you need a docket number\n2. File a praecipe for lis pendens with the Prothonotary in the county where the property is located\n3. The praecipe must include the legal description of the property, docket number, and names of all parties\n4. The Prothonotary will index it against the property\n\nEffect: Any subsequent purchaser or lender takes title subject to the outcome of your lawsuit. This is powerful leverage.\n\nCAUTION: Filing a frivolous lis pendens can result in damages and sanctions. Only file if your claim genuinely involves an interest in the property.',
      showIf: (answers) => answers.want_lis_pendens === 'yes',
    },

    // === Property Identification ===
    {
      id: 'has_legal_description',
      type: 'yes_no',
      prompt: 'Do you have the full legal description of the property?',
      helpText:
        'The legal description is NOT the street address. It is the metes and bounds description or lot/block reference found on the deed or title commitment.',
    },
    {
      id: 'legal_description_needed',
      type: 'info',
      prompt:
        'Your complaint MUST identify the property by its full legal description — a street address alone is not sufficient for actions involving title or possession. You can find the legal description on:\n\n1. Your deed (recorded at the county Recorder of Deeds)\n2. Your title commitment or title insurance policy\n3. The county assessment office website (search by address or parcel number)\n4. A survey of the property\n\nThe description will typically be either:\n• Metes and bounds (bearings and distances describing the boundary)\n• Lot/block/plan (e.g., "Lot 5, Block 3, Plan Book 12, Page 45")',
      showIf: (answers) => answers.has_legal_description === 'no',
    },

    // === Written Instrument Requirement ===
    {
      id: 'written_instrument_info',
      type: 'info',
      prompt:
        'CRITICAL RULE: Pa.R.C.P. 1019(i)\n\nIf your claim is based on a written agreement (purchase agreement, deed, lease, easement grant), you MUST attach a copy of that document to your complaint as an exhibit.\n\nFailure to attach the writing is grounds for Preliminary Objections under Pa.R.C.P. 1028. The court can dismiss or require amendment of the complaint.',
      showIf: (answers) =>
        answers.dispute_type === 'contract' ||
        answers.dispute_type === 'easement' ||
        answers.dispute_type === 'hoa',
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
        'To file online:\n1. Check if your county offers e-filing (e.g., Philadelphia uses PACFile at pacfile.mdjs.us)\n2. Create an account and select the appropriate case type (e.g., "Civil Action — Real Property")\n3. Upload your Complaint as a PDF, including the deed or contract as an exhibit\n4. Pay the filing fee online\n5. You will receive a confirmation and docket number\n\nNot all counties offer e-filing. If yours does not, file in person or by mail.',
      showIf: (answers) => answers.filing_method === 'efile',
    },
    {
      id: 'in_person_instructions',
      type: 'info',
      prompt:
        "To file in person:\n1. Print at least 3 copies of your Complaint (court, you, service)\n2. Go to the Prothonotary's office during business hours\n3. Tell the clerk: \"I need to file a real estate complaint\"\n4. Pay the filing fee (or submit a fee waiver — IFP petition)\n5. The clerk will stamp all copies with the filing date and docket number\n6. Keep your stamped copy as proof of filing",
      showIf: (answers) => answers.filing_method === 'in_person',
    },
    {
      id: 'mail_instructions',
      type: 'info',
      prompt:
        "To file by mail:\n1. Print at least 3 copies of your Complaint\n2. Include a check or money order for the filing fee (or IFP petition)\n3. Include a self-addressed stamped envelope for return of your stamped copy\n4. Mail everything to the Prothonotary's office via certified mail with return receipt\n\nAllow 7-14 business days for processing. Keep your certified mail receipt as proof of timely filing.",
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
        'DEFENDANT\'S ANSWER DEADLINE\n\nOnce the defendant is served, they have 20 days to respond (Pa.R.C.P. 1007.1). The defendant may:\n\n• File an Answer (admitting or denying each allegation)\n• File Preliminary Objections under Pa.R.C.P. 1028 (challenging legal sufficiency, venue, or form)\n• Do nothing — you can then seek default judgment\n\nIf the defendant files Preliminary Objections, the Answer deadline is paused until the court rules on them.',
      showIf: (answers) =>
        answers.total_damages !== 'money_under_12k',
    },

    // === Damages Types ===
    {
      id: 'damages_info',
      type: 'info',
      prompt:
        'DAMAGES AND REMEDIES IN REAL ESTATE DISPUTES\n\n• Compensatory damages — cost to repair defects, diminished property value, out-of-pocket losses\n• Specific performance — forcing the other party to complete the sale (equity remedy)\n• Rescission — unwinding the transaction and returning the parties to their pre-contract positions\n• Quiet title — court order declaring you the owner, eliminating competing claims\n• Injunctive relief — court order stopping trespass, construction, or interference with your property rights\n• Consequential damages — foreseeable losses caused by the breach (e.g., temporary housing, storage costs)\n\nYou must prove damages with reasonable certainty. Keep all receipts, inspection reports, repair estimates, and communications.',
    },

    // === Deceptive Practices ===
    {
      id: 'deceptive_practices',
      type: 'yes_no',
      prompt: 'Did the dispute involve fraud, misrepresentation, or deceptive business practices?',
      helpText:
        'Examples: the seller lied about the condition of the property, a contractor made false promises about work quality, a real estate agent concealed material defects, or a developer used bait-and-switch tactics.',
    },
    {
      id: 'utpcpl_info',
      type: 'info',
      prompt:
        'UTPCPL — TREBLE DAMAGES AVAILABLE\n\nIf the dispute involves deceptive trade practices, you may have a claim under Pennsylvania\'s Unfair Trade Practices and Consumer Protection Law (73 P.S. §201-1 et seq.).\n\nUTPCPL provides:\n• Up to TREBLE (3x) actual damages\n• Minimum $100 statutory damages\n• Attorney fees if you win\n\nThis is commonly used in real estate cases involving:\n• Seller disclosure fraud\n• Contractor misrepresentation\n• Predatory lending\n• Real estate agent deception\n\nInclude a UTPCPL count in your Complaint alongside your real estate claims.',
      showIf: (answers) => answers.deceptive_practices === 'yes',
    },

    // === Delay Damages ===
    {
      id: 'delay_damages_info',
      type: 'info',
      prompt:
        'DELAY DAMAGES (Pa.R.C.P. 238)\n\nPennsylvania allows prejudgment interest at the prime rate + 1% on monetary damages. This compensates you for the time value of money while the case is pending.\n\nDelay damages are awarded automatically in most cases involving monetary awards. Include a request for delay damages in your Complaint.',
    },

    // === Wage Garnishment Protection ===
    {
      id: 'garnishment_info',
      type: 'info',
      prompt:
        'IMPORTANT: PA WAGE GARNISHMENT PROTECTION\n\nEven if you WIN a judgment, Pennsylvania law (42 Pa.C.S.A. §8127) prohibits wage garnishment for real estate judgments. You cannot garnish the defendant\'s wages to collect.\n\nYou CAN collect through:\n• Bank account execution (after locating accounts)\n• Property liens — particularly effective in real estate cases\n• Sheriff\'s sale of personal property\n• Voluntary payment plans\n\nExceptions where wages CAN be garnished: child support, taxes, federal student loans, criminal restitution.',
    },

    // === Filing Checklist ===
    {
      id: 'filing_checklist',
      type: 'info',
      prompt:
        'FILING CHECKLIST\n\n• Complaint (3 copies, signed) — include the full legal description of the property and specific facts\n• Written agreement attached as exhibit (required by Pa.R.C.P. 1019(i) for claims based on written instruments)\n• Deed or title documentation showing your interest in the property\n• Evidence of damages (inspection reports, repair estimates, photos, communications)\n• Filing fee payment or IFP petition\n• Government-issued ID (for in-person filing)\n• Certificate of Compliance with PA Public Access Policy (Pa.R.C.P. 205.6) — redact Social Security numbers, financial account numbers, and dates of birth\n• If filing lis pendens: prepare the praecipe with legal description and docket number',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Dispute type
    if (answers.dispute_type) {
      const typeLabels: Record<string, string> = {
        contract: 'Purchase agreement / contract dispute — 4-year SOL (42 Pa.C.S. §5525)',
        title_defect: 'Title defect / quiet title action — equity jurisdiction',
        boundary: 'Boundary / survey dispute — equity jurisdiction',
        easement: 'Easement dispute — equity jurisdiction',
        disclosure: 'Seller disclosure failure — 68 Pa.C.S. §7301-7315',
        adverse_possession: 'Adverse possession — 21-year continuous possession (42 Pa.C.S. §5530)',
        mechanic_lien: 'Mechanic\'s lien — 6-month filing deadline (49 P.S. §1501)',
        hoa: 'HOA / planned community — 68 Pa.C.S. §5101 et seq.',
        landlord_tenant: 'Landlord-tenant dispute involving real property',
        other: 'Other real estate dispute',
      }
      items.push({ status: 'done', text: typeLabels[answers.dispute_type] })
    }

    // Statute of limitations status
    if (answers.breach_timing === 'under_6_months') {
      items.push({ status: 'done', text: 'Claim is within the statute of limitations.' })
    } else if (answers.breach_timing === '6_months_to_2_years') {
      if (answers.dispute_type === 'mechanic_lien') {
        items.push({
          status: 'needed',
          text: 'URGENT: Mechanic\'s lien 6-month deadline may have passed. Verify the exact date of last work performed.',
        })
      } else {
        items.push({ status: 'done', text: 'Claim appears to be within the statute of limitations.' })
      }
    } else if (answers.breach_timing === '2_to_4_years') {
      items.push({
        status: 'needed',
        text: 'Calculate your exact SOL deadline — it may be approaching. Fraud and trespass claims have only 2 years.',
      })
    } else if (answers.breach_timing === 'over_4_years') {
      items.push({
        status: 'needed',
        text: 'Claim may be time-barred. Consult an attorney about possible exceptions (discovery rule, tolling, fraudulent concealment).',
      })
    } else if (answers.breach_timing === 'unsure') {
      items.push({
        status: 'needed',
        text: 'Determine the date the problem first occurred or was discovered to confirm the claim is timely.',
      })
    }

    // Court type
    if (answers.total_damages) {
      const courtLabels: Record<string, string> = {
        equitable_only: 'Court of Common Pleas (equity jurisdiction)',
        money_under_12k: 'Magisterial District Court (under $12K, monetary only)',
        money_12k_to_50k: 'Court of Common Pleas ($12K-$50K, compulsory arbitration likely)',
        money_over_50k: 'Court of Common Pleas (over $50K)',
        both: 'Court of Common Pleas (equitable + monetary relief)',
      }
      items.push({ status: 'done', text: `Court: ${courtLabels[answers.total_damages]}.` })
    } else {
      items.push({
        status: 'needed',
        text: 'Determine the type of relief you are seeking to identify the correct court.',
      })
    }

    // Venue
    if (answers.property_county) {
      items.push({
        status: 'done',
        text: `Venue: ${answers.property_county} (county where property is located, per Pa.R.C.P. 1006).`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Identify the county where the property is located — this determines venue for real estate actions (Pa.R.C.P. 1006).',
      })
    }

    // Legal description
    if (answers.has_legal_description === 'yes') {
      items.push({
        status: 'done',
        text: 'Full legal description of the property obtained.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Obtain the full legal description from your deed, title policy, or county assessment office.',
      })
    }

    // Filing method
    if (answers.filing_method) {
      const methodLabels: Record<string, string> = {
        efile: 'Online via county e-filing system',
        in_person: 'In person at the Prothonotary\'s office',
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

    // Lis pendens
    if (answers.want_lis_pendens === 'yes') {
      items.push({
        status: 'needed',
        text: 'Prepare lis pendens praecipe with legal description and docket number. File with the Prothonotary after your complaint is filed (Pa.R.C.P. 1901-1910).',
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
    if (
      answers.dispute_type === 'contract' ||
      answers.dispute_type === 'easement' ||
      answers.dispute_type === 'hoa'
    ) {
      items.push({
        status: 'needed',
        text: 'Attach the written agreement to your Complaint as required by Pa.R.C.P. 1019(i).',
      })
    }

    // Mechanic's lien reminder
    if (answers.dispute_type === 'mechanic_lien') {
      items.push({
        status: 'info',
        text: 'Mechanic\'s lien must be filed within 6 months of last work performed. You then have 2 years to file suit to enforce it (49 P.S. §1101 et seq.).',
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
      text: 'File in the county where the property is located (Pa.R.C.P. 1006). This is mandatory venue for actions involving title, possession, or liens.',
    })

    // Wage garnishment limitation
    items.push({
      status: 'info',
      text: 'PA prohibits wage garnishment for real estate judgments (42 Pa.C.S.A. §8127). Plan alternative collection methods (bank execution, property liens).',
    })

    return items
  },
}
