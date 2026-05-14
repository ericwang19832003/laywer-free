import type { GuidedStepConfig } from '../types'

export const reFilingGuideCaConfig: GuidedStepConfig = {
  title: 'California Real Estate Dispute — Statute of Limitations & Filing Guide',
  reassurance:
    'California real estate disputes follow specific rules for deadlines, venue, and court selection. This guide walks you through each requirement so you can protect your rights.',

  questions: [
    // === Dispute type ===
    {
      id: 'dispute_type',
      type: 'single_choice',
      prompt: 'What type of real estate dispute do you have?',
      helpText:
        'The type of dispute determines your statute of limitations, available remedies, and whether special pre-filing requirements apply.',
      options: [
        { value: 'breach_written', label: 'Breach of written contract (purchase agreement, lease)' },
        { value: 'breach_oral', label: 'Breach of oral agreement' },
        { value: 'fraud', label: 'Fraud or misrepresentation (seller, agent, or lender)' },
        { value: 'disclosure', label: 'Failure to disclose defects (TDS violations)' },
        { value: 'quiet_title', label: 'Quiet title (ownership or title dispute)' },
        { value: 'boundary', label: 'Boundary or easement dispute' },
        { value: 'construction', label: 'Construction defect' },
        { value: 'hoa', label: 'HOA dispute (Davis-Stirling Act)' },
        { value: 'mechanic_lien', label: 'Mechanic\'s lien dispute' },
        { value: 'adverse_possession', label: 'Adverse possession' },
        { value: 'other', label: 'Other real estate dispute' },
      ],
    },

    // === SOL by dispute type ===
    {
      id: 'sol_breach_written_info',
      type: 'info',
      prompt:
        'STATUTE OF LIMITATIONS: 4 YEARS (CCP §337)\n\nBreach of a written contract — including purchase agreements, leases, and land contracts — has a 4-year SOL from the date of breach. The clock starts when the other party failed to perform, not when you discovered the breach (unless fraud concealed the breach).',
      showIf: (answers) => answers.dispute_type === 'breach_written',
    },
    {
      id: 'sol_breach_oral_info',
      type: 'info',
      prompt:
        'STATUTE OF LIMITATIONS: 2 YEARS (CCP §339)\n\nBreach of an oral agreement has only a 2-year SOL. Important: Under the Statute of Frauds (Civ. Code §1624), contracts for the sale or transfer of real property MUST be in writing to be enforceable. An oral agreement for real property may be unenforceable unless an exception applies (partial performance, estoppel).',
      showIf: (answers) => answers.dispute_type === 'breach_oral',
    },
    {
      id: 'sol_fraud_info',
      type: 'info',
      prompt:
        'STATUTE OF LIMITATIONS: 3 YEARS (CCP §338(d))\n\nFraud or misrepresentation claims have a 3-year SOL from the date you discovered (or should have discovered) the fraud — this is the "discovery rule." The clock does NOT start at the date of the transaction if the fraud was concealed.\n\nYou must prove: (1) a false representation, (2) knowledge it was false, (3) intent to induce reliance, (4) actual reliance, and (5) resulting damages.',
      showIf: (answers) => answers.dispute_type === 'fraud',
    },
    {
      id: 'sol_disclosure_info',
      type: 'info',
      prompt:
        'DISCLOSURE FAILURES — TRANSFER DISCLOSURE STATEMENT (Civ. Code §1102)\n\nSellers of residential property (1-4 units) must provide a Transfer Disclosure Statement (TDS) disclosing all known material defects. Failure to disclose can give rise to:\n\n- Fraud claim: 3-year SOL (CCP §338(d)) from discovery\n- Breach of contract: 4-year SOL (CCP §337)\n- Negligence: 2-year SOL (CCP §335.1)\n\nThe discovery rule applies — the SOL runs from when you discovered or should have discovered the undisclosed defect, not from closing.',
      showIf: (answers) => answers.dispute_type === 'disclosure',
    },
    {
      id: 'sol_quiet_title_info',
      type: 'info',
      prompt:
        'QUIET TITLE ACTION (CCP §760.010–764.080)\n\nA quiet title action resolves competing claims to real property ownership. There is generally NO statute of limitations for a true quiet title action by a party in possession. However:\n\n- If you are NOT in possession, the SOL depends on the underlying claim\n- The complaint must identify: the property (legal description), the plaintiff\'s title, the adverse claims, and the date as of which you seek determination\n- A lis pendens MUST be filed with a quiet title action (CCP §761.010)',
      showIf: (answers) => answers.dispute_type === 'quiet_title',
    },
    {
      id: 'sol_boundary_info',
      type: 'info',
      prompt:
        'BOUNDARY & EASEMENT DISPUTES\n\nThe SOL depends on the specific claim:\n- Trespass to real property: 3 years (CCP §338(b))\n- Prescriptive easement: 5 years of continuous use (CCP §318–325)\n- Breach of easement agreement (written): 4 years (CCP §337)\n- Nuisance: 3 years (CCP §338)\n\nBoundary disputes often require a professional survey. If the dispute involves a fence line or encroachment, evidence of the historical boundary is critical.',
      showIf: (answers) => answers.dispute_type === 'boundary',
    },
    {
      id: 'sol_construction_info',
      type: 'info',
      prompt:
        'CONSTRUCTION DEFECTS — RIGHT TO REPAIR ACT (Civ. Code §895–945.5)\n\nCalifornia\'s Right to Repair Act governs construction defect claims for new residential construction:\n\n- LATENT DEFECTS (hidden): 10-year statute of repose from substantial completion\n- PATENT DEFECTS (visible): 4-year statute of repose from substantial completion\n- Specific component deadlines vary (e.g., plumbing leaks: 4 years; structural: 10 years)\n\nPRE-FILING REQUIREMENT: Before filing suit, you MUST give the builder written notice and an opportunity to inspect and repair (Civ. Code §910). The builder has 14 days to acknowledge and 30 days to inspect.\n\nFailure to follow this process can result in a stay of your lawsuit.',
      showIf: (answers) => answers.dispute_type === 'construction',
    },
    {
      id: 'sol_hoa_info',
      type: 'info',
      prompt:
        'HOA DISPUTES — DAVIS-STIRLING ACT (Civ. Code §4000+)\n\nThe Davis-Stirling Common Interest Development Act governs HOA disputes:\n\n- Assessment disputes: File within 4 years of breach (CCP §337)\n- CC&R enforcement: Generally 4 years (written contract) or 5 years (restrictive covenant)\n- Election challenges: 9 months after election (Corp. Code §7616)\n- Construction defects in common areas: Right to Repair Act timelines apply\n\nPRE-FILING REQUIREMENT: Most HOA disputes require ADR (Alternative Dispute Resolution) before filing suit (Civ. Code §5930). The HOA or owner must request ADR, and the other party has 30 days to accept. Courts may dismiss cases filed without attempting ADR.\n\nException: ADR is NOT required for assessment collection, restraining orders, or small claims.',
      showIf: (answers) => answers.dispute_type === 'hoa',
    },
    {
      id: 'sol_mechanic_lien_info',
      type: 'info',
      prompt:
        'MECHANIC\'S LIEN DISPUTES (Civ. Code §8400+)\n\nCritical deadlines for mechanic\'s liens:\n\n- RECORDING THE LIEN: Must be recorded within 90 days after completion of the work (Civ. Code §8412)\n- ENFORCING THE LIEN: Must file a lawsuit to enforce within 90 days after recording (Civ. Code §8460). If you miss this deadline, the lien is void.\n- PRELIMINARY NOTICE: Subcontractors and material suppliers must serve a 20-day preliminary notice to preserve lien rights (Civ. Code §8200)\n\nProperty owners can petition to release a lien if the claimant fails to commence a foreclosure action within the 90-day enforcement period (Civ. Code §8480).',
      showIf: (answers) => answers.dispute_type === 'mechanic_lien',
    },
    {
      id: 'sol_adverse_possession_info',
      type: 'info',
      prompt:
        'ADVERSE POSSESSION (CCP §318–325)\n\nTo claim adverse possession in California, you must prove 5 years of continuous possession that is:\n\n1. Open and notorious (visible to the owner)\n2. Hostile (without the owner\'s permission)\n3. Exclusive (not shared with the owner)\n4. Continuous for 5 years\n5. Under claim of right or color of title\n6. Property taxes paid for the entire 5-year period (CCP §325) — this is mandatory in California\n\nThe landowner has 5 years to bring an ejectment action (CCP §318). After 5 years of qualifying possession with taxes paid, the adverse possessor may claim title.',
      showIf: (answers) => answers.dispute_type === 'adverse_possession',
    },
    {
      id: 'sol_other_info',
      type: 'info',
      prompt:
        'COMMON SOL PERIODS FOR REAL ESTATE DISPUTES\n\n- Written contract breach: 4 years (CCP §337)\n- Oral contract breach: 2 years (CCP §339)\n- Fraud/misrepresentation: 3 years from discovery (CCP §338(d))\n- Trespass to real property: 3 years (CCP §338(b))\n- Negligence (property damage): 2 years (CCP §335.1)\n- Adverse possession: 5 years (CCP §318–325)\n- Quiet title (party in possession): no SOL\n\nIf your dispute doesn\'t fit neatly into one category, the SOL of the most analogous cause of action applies. When in doubt, assume the shortest applicable deadline.',
      showIf: (answers) => answers.dispute_type === 'other',
    },

    // === Key date ===
    {
      id: 'dispute_date',
      type: 'text',
      prompt: 'When did the dispute arise (breach, discovery of defect, or triggering event)?',
      placeholder: 'MM/DD/YYYY',
      helpText:
        'This is when the SOL clock started. For fraud or defect cases, enter when you first discovered (or should have discovered) the problem.',
    },

    // === Venue ===
    {
      id: 'property_county',
      type: 'text',
      prompt: 'What county is the property located in?',
      helpText:
        'Under CCP §392, lawsuits involving real property must be filed in the county where the property is located. This is mandatory venue for actions affecting title or possession.',
      placeholder: 'e.g. Los Angeles County',
    },
    {
      id: 'venue_info',
      type: 'info',
      prompt:
        'MANDATORY VENUE (CCP §392)\n\nReal property actions MUST be filed in the county where the property is situated. This includes:\n- Actions for the recovery of real property or an interest in it\n- Actions to determine title (quiet title)\n- Actions for trespass or injury to real property\n- Foreclosure actions\n\nUnlike other civil cases, you cannot file where the defendant lives — the property location controls.',
    },

    // === Property identification ===
    {
      id: 'has_legal_description',
      type: 'yes_no',
      prompt: 'Do you have the full legal description of the property?',
      helpText:
        'The legal description is NOT the street address. It is the metes and bounds description, lot/block/tract reference, or parcel number found on the deed or title report.',
    },
    {
      id: 'legal_description_needed',
      type: 'info',
      prompt:
        'Your complaint MUST identify the property by its full legal description — a street address alone is not sufficient for real property actions. You can find the legal description on:\n\n1. Your grant deed (recorded at the county recorder\'s office)\n2. Your title report or title insurance policy\n3. The county assessor\'s website (search by APN — Assessor\'s Parcel Number)\n4. A recorded survey of the property\n\nThe description will be either:\n- Lot/tract (e.g., "Lot 5 of Tract 12345, per map recorded in Book 100, Page 50")\n- Metes and bounds (bearings and distances)\n- Section/township/range (rural properties)',
      showIf: (answers) => answers.has_legal_description === 'no',
    },

    // === Dispute amount & court selection ===
    {
      id: 'dispute_amount',
      type: 'single_choice',
      prompt: 'What is the approximate dollar amount of your dispute?',
      helpText:
        'California has three court levels. The amount — plus whether you need equitable relief — determines where you file.',
      options: [
        { value: 'small_claims', label: '$10,000 or less' },
        { value: 'limited', label: '$10,001 to $25,000' },
        { value: 'unlimited', label: 'More than $25,000 (or seeking equitable relief)' },
      ],
    },
    {
      id: 'court_small_claims_info',
      type: 'info',
      prompt:
        'SMALL CLAIMS COURT (≤$10,000)\n\n- No attorneys allowed — you represent yourself\n- Simplified procedures, no formal discovery\n- Filing fee: approximately $30–$75\n- Hearing typically within 30–70 days\n- Limited to monetary damages only — no specific performance, no injunctions\n- Defendant can appeal for a new trial; plaintiff generally cannot appeal\n\nNote: Small Claims is limited to MONEY damages. If you need the court to order someone to do something (specific performance, injunction), you must file in Limited or Unlimited Civil.',
      showIf: (answers) => answers.dispute_amount === 'small_claims',
    },
    {
      id: 'court_limited_info',
      type: 'info',
      prompt:
        'LIMITED CIVIL COURT ($10,001–$25,000)\n\n- Filed in Superior Court — Limited Civil division\n- Attorneys permitted but not required\n- Simplified discovery rules\n- Case must be resolved within 12 months\n- Filing fee: approximately $225–$370\n- Jury trial available if requested\n\nNote: Quiet title actions and other cases seeking equitable relief may need to be filed as Unlimited Civil regardless of the dollar amount.',
      showIf: (answers) => answers.dispute_amount === 'limited',
    },
    {
      id: 'court_unlimited_info',
      type: 'info',
      prompt:
        'UNLIMITED CIVIL COURT (>$25,000 or equitable relief)\n\n- Filed in Superior Court — Unlimited Civil division\n- Full discovery (interrogatories, depositions, RFAs, document requests)\n- Filing fee: approximately $435–$450\n- Jury trial available if requested\n- Equitable remedies available: specific performance, injunctive relief, quiet title\n- Demurrer available to challenge the complaint (CCP §430.10)\n\nRequired for: quiet title actions, specific performance (forcing sale or transfer), lis pendens, and injunctive relief.',
      showIf: (answers) => answers.dispute_amount === 'unlimited',
    },

    // === Equitable relief ===
    {
      id: 'seeks_equitable_relief',
      type: 'single_choice',
      prompt: 'Are you seeking any of these equitable remedies?',
      helpText:
        'Equitable relief is when you want the court to ORDER something, not just award money.',
      options: [
        { value: 'specific_performance', label: 'Specific performance (force the sale or transfer)' },
        { value: 'injunction', label: 'Injunction (stop construction, stop trespass, etc.)' },
        { value: 'quiet_title', label: 'Quiet title (establish ownership)' },
        { value: 'declaratory', label: 'Declaratory relief (determine rights under a contract)' },
        { value: 'money_only', label: 'Money damages only' },
      ],
    },
    {
      id: 'equitable_relief_info',
      type: 'info',
      prompt:
        'EQUITABLE REMEDIES IN CALIFORNIA REAL ESTATE CASES\n\nSpecific performance (Civ. Code §3384): Courts can order a party to complete a real property transaction. Real property is considered "unique," so specific performance is more readily available than in other contract cases.\n\nInjunctive relief (CCP §526): You can seek a temporary restraining order (TRO) or preliminary injunction to stop ongoing harm (e.g., construction, encroachment, waste). You must show: (1) likelihood of success, (2) irreparable harm, (3) balance of hardships favors you.\n\nQuiet title (CCP §760.010): Establishes your ownership and eliminates competing claims. A lis pendens is mandatory.\n\nNote: Cases seeking equitable relief must be filed in Unlimited Civil — regardless of the dollar amount.',
      showIf: (answers) => answers.seeks_equitable_relief !== 'money_only' && !!answers.seeks_equitable_relief,
    },

    // === Lis pendens ===
    {
      id: 'want_lis_pendens',
      type: 'yes_no',
      prompt: 'Do you want to file a lis pendens (notice of pending action)?',
      helpText:
        'A lis pendens alerts the public that your lawsuit affects the property. It prevents the other party from selling or refinancing without the buyer/lender knowing about your claim. Required for quiet title actions.',
    },
    {
      id: 'lis_pendens_info',
      type: 'info',
      prompt:
        'LIS PENDENS — NOTICE OF PENDING ACTION (CCP §405.20)\n\nA lis pendens is recorded in the county recorder\'s office and puts the world on notice that a lawsuit affects the property.\n\nTo file:\n1. The action must be a "real property claim" — one that would affect title or possession (CCP §405.4)\n2. Record the notice with the County Recorder where the property is located\n3. The notice must identify: the parties, the court, the case number, and the property (legal description)\n4. Serve a copy on the other party within 5 days of recording\n\nEXPUNGEMENT (CCP §405.30–405.33): The other side can move to expunge the lis pendens. You bear the burden of showing "probable validity" of your real property claim — meaning you are more likely than not to win on the merits. If expunged, you may be liable for attorney fees.\n\nQuiet title actions: A lis pendens is MANDATORY — you must file one with your complaint (CCP §761.010).',
      showIf: (answers) => answers.want_lis_pendens === 'yes',
    },

    // === Mediation/arbitration ===
    {
      id: 'has_mediation_arbitration',
      type: 'single_choice',
      prompt: 'Does your purchase contract or agreement contain a mediation or arbitration clause?',
      helpText:
        'California residential purchase contracts (CAR forms) typically include both a mediation clause and an optional arbitration clause. Check paragraphs 22 and 23 of the CAR Residential Purchase Agreement.',
      options: [
        { value: 'mediation_only', label: 'Mediation clause only' },
        { value: 'mediation_and_arbitration', label: 'Both mediation and arbitration clauses' },
        { value: 'arbitration_only', label: 'Arbitration clause only' },
        { value: 'none', label: 'No mediation or arbitration clause' },
        { value: 'unsure', label: 'Not sure' },
      ],
    },
    {
      id: 'mediation_clause_info',
      type: 'info',
      prompt:
        'MEDIATION CLAUSE — ATTORNEY FEES PENALTY\n\nIf your contract includes a mediation clause (standard in CAR purchase agreements), you MUST attempt mediation BEFORE filing suit or arbitration. If you skip mediation and later win the case, you FORFEIT your right to recover attorney fees — even if the contract has an attorney fees clause.\n\nThis is a significant financial penalty. To preserve your attorney fee rights:\n1. Send a written mediation demand to the other party\n2. If they refuse or don\'t respond within 30 days, you have satisfied the requirement\n3. Keep proof of your mediation demand and their response (or non-response)',
      showIf: (answers) =>
        answers.has_mediation_arbitration === 'mediation_only' ||
        answers.has_mediation_arbitration === 'mediation_and_arbitration',
    },
    {
      id: 'arbitration_clause_info',
      type: 'info',
      prompt:
        'ARBITRATION CLAUSE (CCP §1281.2)\n\nIf your contract includes an arbitration clause AND both parties initialed it (CAR form paragraph 23 requires separate initials), disputes must go to private arbitration:\n\n- The other side can petition to compel arbitration\n- Arbitration is typically binding — very limited appeal rights\n- Arbitrator fees can be $5,000–$20,000+ (split between parties)\n- Discovery is more limited than in court\n- No jury trial right\n\nExceptions — arbitration may NOT be compelled if:\n- The clause is unconscionable (Armendariz factors)\n- The party waived arbitration by participating in litigation\n- The clause was not separately initialed (in CAR forms)\n- A third party not bound by the clause is involved',
      showIf: (answers) =>
        answers.has_mediation_arbitration === 'arbitration_only' ||
        answers.has_mediation_arbitration === 'mediation_and_arbitration',
    },
    {
      id: 'mediation_check_info',
      type: 'info',
      prompt:
        'CHECK YOUR CONTRACT CAREFULLY\n\nCalifornia residential purchase contracts (CAR forms) almost always include mediation and arbitration provisions. Locate your purchase agreement and check:\n\n- Paragraph 22: Mediation (usually mandatory)\n- Paragraph 23: Arbitration (optional — requires separate initials by BOTH parties)\n\nSkipping mediation when required can cost you attorney fees. Filing in court when arbitration applies can result in your case being stayed and sent to arbitration.',
      showIf: (answers) => answers.has_mediation_arbitration === 'unsure',
    },

    // === Party role ===
    {
      id: 'party_role',
      type: 'single_choice',
      prompt: 'Are you the plaintiff (filing suit) or the defendant (being sued)?',
      options: [
        { value: 'plaintiff', label: 'Plaintiff — I want to file a lawsuit' },
        { value: 'defendant', label: 'Defendant — I have been sued' },
      ],
    },
    {
      id: 'answer_deadline_info',
      type: 'info',
      prompt:
        'ANSWER DEADLINE: 30 DAYS (CCP §412.20)\n\nYou have 30 calendar days from the date you were served to file your Answer (or other responsive pleading). If served by substituted service, you get 40 days.\n\nDo NOT miss this deadline — the plaintiff can obtain a default judgment against you, which may result in a judgment on the property.\n\nYou can also:\n- File a demurrer (CCP §430.10) to challenge the legal sufficiency of the complaint\n- File a motion to expunge lis pendens (CCP §405.30) if one was recorded\n- File a cross-complaint if you have claims against the plaintiff',
      showIf: (answers) => answers.party_role === 'defendant',
    },

    // === Damages info for plaintiff ===
    {
      id: 'damages_info',
      type: 'info',
      prompt:
        'DAMAGES AVAILABLE IN CALIFORNIA REAL ESTATE CASES\n\n1. COMPENSATORY DAMAGES — Cost of repair, diminished value, out-of-pocket losses\n2. BENEFIT OF THE BARGAIN — Difference between the value as represented and actual value\n3. CONSEQUENTIAL DAMAGES — Foreseeable losses caused by the breach (temporary housing, storage, etc.)\n4. SPECIFIC PERFORMANCE — Court orders completion of the transaction (Civ. Code §3384)\n5. RESCISSION — Undo the transaction and restore both parties to their pre-contract positions\n6. PUNITIVE DAMAGES — Available in fraud cases where the defendant acted with malice or oppression (Civ. Code §3294)\n7. PREJUDGMENT INTEREST — 10% per year on liquidated claims (Civ. Code §3287); 7% on unliquidated (CCP §685.010)\n\nNote: For disclosure failures, you can recover the cost of repairs PLUS diminished value.',
      showIf: (answers) => answers.party_role === 'plaintiff',
    },

    // === Filing method ===
    {
      id: 'filing_method',
      type: 'single_choice',
      prompt: 'How do you plan to file?',
      helpText:
        'Most California Superior Courts require or strongly encourage electronic filing.',
      options: [
        { value: 'efile', label: 'Online (court e-filing portal) — recommended' },
        { value: 'in_person', label: 'In person at the courthouse' },
      ],
    },
    {
      id: 'efile_instructions',
      type: 'info',
      prompt:
        'To file electronically:\n1. Identify your county\'s approved e-filing service provider (e.g., File & ServeXpress, One Legal, Odyssey)\n2. Create an account on the provider\'s website\n3. Select your court, case type (Real Property), and filing type\n4. Upload your Complaint as a PDF — include the full legal description\n5. Upload the Civil Case Cover Sheet (Judicial Council form CM-010)\n6. Pay the filing fee online (or submit a fee waiver — form FW-001)\n7. If filing a lis pendens, upload it as a separate document\n\nMost courts accept e-filings within 24–48 hours.',
      showIf: (answers) => answers.filing_method === 'efile',
    },
    {
      id: 'in_person_instructions',
      type: 'info',
      prompt:
        'To file in person:\n1. Print at least 3 copies of your Complaint (court copy, your copy, service copy)\n2. Complete the Civil Case Cover Sheet (form CM-010)\n3. Go to the Civil Clerk\'s office at the Superior Court in the county where the property is located\n4. Tell the clerk: "I need to file a real property complaint"\n5. Pay the filing fee or submit a fee waiver (form FW-001)\n6. The clerk will stamp and file your originals — keep your stamped copy\n7. Ask the clerk about service options and lis pendens recording',
      showIf: (answers) => answers.filing_method === 'in_person',
    },

    // === Fee waiver ===
    {
      id: 'can_afford_fee',
      type: 'yes_no',
      prompt: 'Can you afford the filing fee?',
    },
    {
      id: 'fee_waiver_info',
      type: 'info',
      prompt:
        'FEE WAIVER — FORM FW-001\n\nIf you cannot afford the filing fee, you can request a fee waiver by filing Judicial Council form FW-001 (Request to Waive Court Fees). You automatically qualify if you receive:\n- Medi-Cal, Food Stamps (CalFresh), SSI/SSP, CalWORKs, CAPI, or County Relief\n- Your income is at or below 125% of the Federal Poverty Level\n\nFile the fee waiver WITH your Complaint. The court will rule within 5 days. If denied, you can ask for a hearing.\n\nThe fee waiver covers: filing fees, motion fees, jury fees, and service by the sheriff.',
      showIf: (answers) => answers.can_afford_fee === 'no',
    },

    // === Pre-filing requirements ===
    {
      id: 'pre_filing_construction',
      type: 'info',
      prompt:
        'PRE-FILING REQUIREMENT — RIGHT TO REPAIR ACT NOTICE\n\nBefore filing a construction defect lawsuit, you MUST comply with the pre-litigation process (Civ. Code §910–938):\n\n1. Serve the builder/developer with written notice of the claimed defects\n2. Builder has 14 days to acknowledge receipt\n3. Builder has 30 days to inspect the property\n4. Builder has 30 days after inspection to make a written offer of repair\n5. You have 30 days to accept or reject the offer\n\nIf the builder does not respond or you reject the offer, you may file suit. Failure to follow this process can result in a stay of your lawsuit until the notice requirements are met.',
      showIf: (answers) => answers.dispute_type === 'construction',
    },
    {
      id: 'pre_filing_hoa',
      type: 'info',
      prompt:
        'PRE-FILING REQUIREMENT — HOA ADR (Civ. Code §5930)\n\nBefore filing a lawsuit against your HOA (or if the HOA is suing you), the Davis-Stirling Act requires that either party first attempt Alternative Dispute Resolution (ADR):\n\n1. Send a written Request for Resolution to the other party\n2. The recipient has 30 days to accept or reject\n3. If accepted, ADR must be completed within 90 days\n4. If rejected or no response, you may proceed to file suit\n\nException: ADR is NOT required for small claims, restraining orders, or assessment lien enforcement.\n\nKeep proof of your ADR request — the court may ask to see it.',
      showIf: (answers) => answers.dispute_type === 'hoa',
    },

    // === Discovery ===
    {
      id: 'discovery_info',
      type: 'info',
      prompt:
        'DISCOVERY IN REAL ESTATE CASES\n\nIf your case is in Limited or Unlimited Civil Court, you have access to:\n\n1. INTERROGATORIES — Written questions (35 special + unlimited form interrogatories)\n2. REQUESTS FOR ADMISSION (RFAs) — Deemed admitted if not answered in 30 days\n3. REQUESTS FOR PRODUCTION — Demand documents (deeds, contracts, inspection reports, disclosures, communications)\n4. DEPOSITIONS — Live questioning under oath\n5. SUBPOENAS — Compel third parties (title companies, escrow, inspectors) to produce records\n\nKey documents to request in real estate cases: TDS, inspection reports, repair estimates, title reports, escrow instructions, HOA documents, permit records, and all communications between the parties.\n\nRespond to all discovery within 30 days (CCP §2030.260).',
      showIf: (answers) =>
        answers.dispute_amount === 'limited' || answers.dispute_amount === 'unlimited',
    },

    // === Next steps ===
    {
      id: 'next_steps_plaintiff',
      type: 'info',
      prompt:
        'YOUR NEXT STEPS AS PLAINTIFF\n\n1. Confirm your SOL has not expired — if close to expiring, file immediately\n2. Check for mediation/arbitration clauses and comply with pre-filing requirements\n3. Gather: contract, deed, disclosures (TDS), inspection reports, correspondence, photos of defects\n4. Obtain the full legal description of the property\n5. Calculate your damages (include prejudgment interest at 10% for liquidated claims)\n6. Draft and file your Complaint with the Civil Case Cover Sheet (CM-010)\n7. Record a lis pendens if your claim affects title or possession\n8. Serve the defendant (personal service, substituted service, or service by mail with acknowledgment)\n9. If defendant does not respond within 30 days, request a default judgment',
      showIf: (answers) => answers.party_role === 'plaintiff',
    },
    {
      id: 'next_steps_defendant',
      type: 'info',
      prompt:
        'YOUR NEXT STEPS AS DEFENDANT\n\n1. Check the SOL — if the claim is time-barred, raise it as an affirmative defense\n2. File your Answer within 30 days of service (CCP §412.20) — do NOT miss this deadline\n3. If a lis pendens was recorded, consider a motion to expunge (CCP §405.30)\n4. Assert all affirmative defenses (SOL, statute of frauds, waiver, estoppel, laches, failure to mitigate)\n5. Consider filing a cross-complaint if you have claims against the plaintiff\n6. Respond to all discovery within 30 days\n7. Do NOT ignore the lawsuit — a default judgment on real property can result in loss of title or forced sale',
      showIf: (answers) => answers.party_role === 'defendant',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Dispute type & SOL
    if (answers.dispute_type) {
      const solMap: Record<string, string> = {
        breach_written: 'Written contract breach — 4-year SOL (CCP §337).',
        breach_oral: 'Oral agreement breach — 2-year SOL (CCP §339). Statute of Frauds may apply.',
        fraud: 'Fraud/misrepresentation — 3-year SOL from discovery (CCP §338(d)).',
        disclosure: 'Disclosure failure (TDS) — 3-year fraud SOL or 4-year contract SOL.',
        quiet_title: 'Quiet title — no SOL for party in possession (CCP §760.010).',
        boundary: 'Boundary/easement dispute — 3-year trespass SOL (CCP §338(b)).',
        construction: 'Construction defect — 10-year latent / 4-year patent (Right to Repair Act).',
        hoa: 'HOA dispute — Davis-Stirling Act (Civ. Code §4000+).',
        mechanic_lien: 'Mechanic\'s lien — 90-day recording + 90-day enforcement deadlines (Civ. Code §8400+).',
        adverse_possession: 'Adverse possession — 5-year continuous possession with taxes paid (CCP §318–325).',
        other: 'Real estate dispute — SOL depends on specific cause of action.',
      }
      items.push({ status: 'done', text: solMap[answers.dispute_type] })
    } else {
      items.push({ status: 'needed', text: 'Identify your dispute type to determine the applicable SOL.' })
    }

    // SOL date calculation
    if (answers.dispute_date && answers.dispute_type) {
      const parts = answers.dispute_date.split('/')
      const disputeDate = new Date(`${parts[2]}-${parts[0]}-${parts[1]}`)
      const now = new Date()
      const yearsDiff =
        (now.getTime() - disputeDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)

      const solYearsMap: Record<string, number> = {
        breach_written: 4,
        breach_oral: 2,
        fraud: 3,
        disclosure: 3,
        boundary: 3,
        construction: 10,
        mechanic_lien: 0.25, // 90 days
        adverse_possession: 5,
        other: 3,
      }

      const solYears = solYearsMap[answers.dispute_type]
      if (solYears && answers.dispute_type !== 'quiet_title' && answers.dispute_type !== 'hoa') {
        if (yearsDiff >= solYears) {
          items.push({
            status: 'info',
            text: `Based on date ${answers.dispute_date}, approximately ${yearsDiff < 1 ? Math.floor(yearsDiff * 365) + ' days' : Math.floor(yearsDiff) + ' years'} have passed. The SOL may have EXPIRED. ${answers.party_role === 'defendant' ? 'Raise this as an affirmative defense.' : 'Consult an attorney — tolling doctrines (discovery rule, estoppel) may extend the deadline.'}`,
          })
        } else {
          const remaining = solYears - yearsDiff
          const remainingLabel = remaining < 1
            ? `${Math.ceil(remaining * 365)} days`
            : `${Math.ceil(remaining * 12)} months`
          items.push({
            status: 'info',
            text: `Based on date ${answers.dispute_date}, SOL has NOT expired — approximately ${remainingLabel} remain. File promptly.`,
          })
        }
      }
    } else if (!answers.dispute_date) {
      items.push({ status: 'needed', text: 'Enter the dispute date to calculate SOL status.' })
    }

    // Venue
    if (answers.property_county) {
      items.push({
        status: 'done',
        text: `Venue: ${answers.property_county} Superior Court (mandatory venue per CCP §392).`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Identify the county where the property is located — this determines mandatory venue (CCP §392).',
      })
    }

    // Legal description
    if (answers.has_legal_description === 'yes') {
      items.push({ status: 'done', text: 'Full legal description of the property obtained.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Obtain the full legal description from your deed, title report, or county assessor.',
      })
    }

    // Court selection
    if (answers.dispute_amount) {
      const courtLabels: Record<string, string> = {
        small_claims: 'Small Claims Court (≤$10,000) — no attorneys, money damages only.',
        limited: 'Limited Civil Court ($10,001–$25,000) — Superior Court, simplified discovery.',
        unlimited: 'Unlimited Civil Court (>$25,000) — Superior Court, full discovery, equitable relief.',
      }
      items.push({ status: 'done', text: `Court: ${courtLabels[answers.dispute_amount]}` })
    } else {
      items.push({ status: 'needed', text: 'Determine the dispute amount to identify the correct court.' })
    }

    // Equitable relief note
    if (
      answers.seeks_equitable_relief &&
      answers.seeks_equitable_relief !== 'money_only' &&
      answers.dispute_amount !== 'unlimited'
    ) {
      items.push({
        status: 'info',
        text: 'You are seeking equitable relief — this requires Unlimited Civil Court regardless of the dollar amount.',
      })
    }

    // Mediation/arbitration
    if (
      answers.has_mediation_arbitration === 'mediation_only' ||
      answers.has_mediation_arbitration === 'mediation_and_arbitration'
    ) {
      items.push({
        status: 'needed',
        text: 'Mediation clause present. Send a written mediation demand BEFORE filing suit — or forfeit attorney fee recovery.',
      })
    }
    if (
      answers.has_mediation_arbitration === 'arbitration_only' ||
      answers.has_mediation_arbitration === 'mediation_and_arbitration'
    ) {
      items.push({
        status: 'info',
        text: 'Arbitration clause present (CCP §1281.2). Case may be compelled to binding arbitration if the clause was properly initialed.',
      })
    }

    // Pre-filing requirements
    if (answers.dispute_type === 'construction') {
      items.push({
        status: 'needed',
        text: 'Right to Repair Act: Serve written notice on the builder before filing suit (Civ. Code §910). Builder gets 14 days to acknowledge + 30 days to inspect.',
      })
    }
    if (answers.dispute_type === 'hoa') {
      items.push({
        status: 'needed',
        text: 'Davis-Stirling Act: Send a written Request for Resolution (ADR) before filing suit (Civ. Code §5930).',
      })
    }

    // Lis pendens
    if (answers.want_lis_pendens === 'yes') {
      items.push({
        status: 'needed',
        text: 'Prepare and record lis pendens with the County Recorder after filing (CCP §405.20). Serve on opposing party within 5 days.',
      })
    }
    if (answers.dispute_type === 'quiet_title' && answers.want_lis_pendens !== 'yes') {
      items.push({
        status: 'needed',
        text: 'Quiet title action REQUIRES a lis pendens (CCP §761.010). You must file one with your complaint.',
      })
    }

    // Filing method
    if (answers.filing_method) {
      const methodLabels: Record<string, string> = {
        efile: 'Online via court e-filing portal',
        in_person: 'In person at the courthouse',
      }
      items.push({ status: 'done', text: `Filing method: ${methodLabels[answers.filing_method]}.` })
    } else {
      items.push({ status: 'needed', text: 'Choose a filing method (online or in person).' })
    }

    // Fee
    if (answers.can_afford_fee === 'yes') {
      items.push({
        status: 'done',
        text: 'Filing fee: prepared to pay ($30–$75 Small Claims, $225–$370 Limited, $435–$450 Unlimited).',
      })
    } else if (answers.can_afford_fee === 'no') {
      items.push({
        status: 'needed',
        text: 'Complete fee waiver form FW-001 and file it with your Complaint.',
      })
    }

    // Party role reminders
    if (answers.party_role === 'defendant') {
      items.push({
        status: 'needed',
        text: 'File your Answer within 30 days of service (CCP §412.20). Do NOT miss this deadline — default judgment on real property can result in loss of title.',
      })
    }

    items.push({
      status: 'info',
      text: 'Real property venue is mandatory — file in the county where the property is located (CCP §392).',
    })

    return items
  },
}
