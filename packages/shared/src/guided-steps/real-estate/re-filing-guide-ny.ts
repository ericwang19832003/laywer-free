import type { GuidedStepConfig } from '../types'

export const reFilingGuideNyConfig: GuidedStepConfig = {
  title: 'New York Real Estate Dispute — Statute of Limitations & Filing Guide',
  reassurance:
    'New York has well-established real estate litigation procedures rooted in the CPLR and RPAPL. We will walk you through the statute of limitations for your specific dispute, the correct court, venue rules, and every step to file or defend your case.',

  questions: [
    // === Dispute Type ===
    {
      id: 'dispute_type',
      type: 'single_choice',
      prompt: 'What type of real estate dispute do you have?',
      helpText:
        'Different real estate disputes have different statutes of limitations and procedural requirements under New York law. Select the category that best describes your situation.',
      options: [
        { value: 'breach_contract', label: 'Breach of purchase/sale contract' },
        { value: 'fraud', label: 'Fraud or misrepresentation' },
        { value: 'title_defect', label: 'Title defect or cloud on title' },
        { value: 'quiet_title', label: 'Quiet title (competing ownership claims)' },
        { value: 'boundary', label: 'Boundary or encroachment dispute' },
        { value: 'easement', label: 'Easement dispute' },
        { value: 'adverse_possession', label: 'Adverse possession' },
        { value: 'disclosure', label: 'Seller disclosure failure' },
        { value: 'mechanic_lien', label: 'Mechanic\'s lien or construction dispute' },
        { value: 'coop_condo', label: 'Co-op or condominium dispute' },
        { value: 'other', label: 'Other real estate dispute' },
      ],
    },

    // === SOL — Breach of Contract ===
    {
      id: 'sol_breach_contract',
      type: 'info',
      prompt:
        'STATUTE OF LIMITATIONS: 6 YEARS (CPLR §213(2))\n\nBreach of a real estate purchase or sale contract has a 6-year statute of limitations. The clock starts on the date of the breach — typically the failed closing date, the date earnest money was wrongfully withheld, or the date a contractual obligation was not performed.\n\nFor installment contracts (e.g., contract for deed), each missed payment may trigger a new 6-year period for that installment.\n\nIf the 6 years have passed, your claim is time-barred and the court will dismiss it if the defendant raises the defense.',
      showIf: (answers) => answers.dispute_type === 'breach_contract',
    },

    // === SOL — Fraud ===
    {
      id: 'sol_fraud',
      type: 'info',
      prompt:
        'STATUTE OF LIMITATIONS: 6 YEARS (CPLR §213(8))\n\nFraud claims in real estate have a 6-year statute of limitations. However, the clock may start later than the fraudulent act itself.\n\nNew York uses the later of:\n1. Six years from the date the fraud was committed, OR\n2. Two years from the date the fraud was discovered or should have been discovered with reasonable diligence (CPLR §203(g))\n\nThis "discovery rule" is critical in real estate — many defects or misrepresentations are not discovered until months or years after closing.\n\nYou must plead fraud with particularity: who, what, when, where, and how (CPLR §3016(b)).',
      showIf: (answers) => answers.dispute_type === 'fraud',
    },

    // === SOL — Title Defect ===
    {
      id: 'sol_title_defect',
      type: 'info',
      prompt:
        'STATUTE OF LIMITATIONS: VARIES BY UNDERLYING CLAIM\n\nTitle defect claims depend on the underlying theory:\n• Breach of warranty of title: 6 years (CPLR §213(2))\n• Fraud in the chain of title: 6 years with discovery rule (CPLR §213(8))\n• Title insurance claim: governed by the policy terms, typically 6 years from denial of claim\n\nIf the defect renders title unmarketable, you may also have a quiet title action under RPAPL Article 15, which has no statute of limitations as long as you are in possession of the property.\n\nFile a lis pendens (notice of pendency) under CPLR §6501 to protect your interest while the case is pending.',
      showIf: (answers) => answers.dispute_type === 'title_defect',
    },

    // === SOL — Quiet Title ===
    {
      id: 'sol_quiet_title',
      type: 'info',
      prompt:
        'QUIET TITLE: RPAPL ARTICLE 15\n\nA quiet title action asks the court to determine the rightful owner and eliminate competing claims. Under RPAPL Article 15, the plaintiff must have been seized or possessed of the premises within 10 years before commencing the action.\n\nKey requirements:\n• Must name all known adverse claimants as defendants\n• Must include "unknown" defendants if applicable (RPAPL §1511)\n• Must file a lis pendens (CPLR §6501) at the time of filing\n• The court can determine all claims to the property in one action\n\nQuiet title is heard in Supreme Court because it requires equity jurisdiction. There is no dollar-amount threshold — the nature of the relief (declaratory judgment) places it in Supreme Court.\n\nThis is the primary "weapon of choice" for resolving New York real estate ownership disputes.',
      showIf: (answers) => answers.dispute_type === 'quiet_title',
    },

    // === SOL — Boundary Dispute ===
    {
      id: 'sol_boundary',
      type: 'info',
      prompt:
        'BOUNDARY & ENCROACHMENT DISPUTES\n\nBoundary disputes are typically resolved through:\n1. Quiet title action (RPAPL Article 15) — no strict SOL if you are in possession\n2. Ejectment action (RPAPL Article 6) — 10-year SOL (CPLR §212(a))\n3. Trespass — 3-year SOL (CPLR §214(4))\n4. Injunction to remove encroachment — filed in Supreme Court as an equitable action\n\nYou will need a current survey showing the property lines and the encroachment. The survey must be prepared by a licensed New York surveyor.\n\nIf the encroachment has existed for 10+ years, the encroaching party may claim adverse possession (RPAPL §501-551).',
      showIf: (answers) => answers.dispute_type === 'boundary',
    },

    // === SOL — Easement ===
    {
      id: 'sol_easement',
      type: 'info',
      prompt:
        'EASEMENT DISPUTES\n\nEasement disputes involve:\n• Express easements — created by written instrument, enforced as contract (6-year SOL)\n• Implied easements — arise by necessity or prior use\n• Prescriptive easements — similar to adverse possession, requires 10 years of open, notorious, continuous, and hostile use\n\nTo enforce or challenge an easement, file in Supreme Court. Common claims include:\n1. Interference with an existing easement — 3-year SOL for damages (CPLR §214(4)), but equitable relief (injunction) has no strict SOL\n2. Quiet title to extinguish an easement — RPAPL Article 15\n3. Declaration of easement by prescription — 10-year use period required\n\nFile a lis pendens (CPLR §6501) to put third parties on notice of the dispute.',
      showIf: (answers) => answers.dispute_type === 'easement',
    },

    // === SOL — Adverse Possession ===
    {
      id: 'sol_adverse_possession',
      type: 'info',
      prompt:
        'ADVERSE POSSESSION: 10 YEARS (RPAPL §501-551, CPLR §212(a))\n\nTo claim title by adverse possession in New York, you must show 10 continuous years of occupation that is:\n1. Adverse and under claim of right\n2. Open and notorious\n3. Continuous and uninterrupted\n4. Exclusive\n5. Actual\n\n"Claim of right" means a reasonable basis for believing the property belongs to you (RPAPL §501(3)). After the 2008 amendments, mere maintenance or mowing alone may not satisfy these requirements.\n\nTo formalize the claim, file a quiet title action under RPAPL Article 15 in Supreme Court. The burden of proof is on the adverse possessor — you must prove each element by clear and convincing evidence.\n\nDefending against adverse possession: the true owner must commence an ejectment action within 10 years (CPLR §212(a)).',
      showIf: (answers) => answers.dispute_type === 'adverse_possession',
    },

    // === SOL — Disclosure Failure ===
    {
      id: 'sol_disclosure',
      type: 'info',
      prompt:
        'SELLER DISCLOSURE FAILURE: PROPERTY CONDITION DISCLOSURE ACT (RPL §462-467)\n\nAs of March 20, 2024, New York eliminated the seller\'s option to pay a $500 credit instead of completing the Property Condition Disclosure Statement (PCDS). Sellers must now provide a complete PCDS or face liability.\n\nFor transactions before March 20, 2024, sellers could opt out by providing the $500 credit at closing. For transactions on or after that date, the PCDS is mandatory.\n\nClaims for disclosure failure:\n• Breach of contract: 6-year SOL (CPLR §213(2))\n• Fraud/misrepresentation: 6-year SOL with discovery rule (CPLR §213(8), §203(g))\n• Negligent misrepresentation: 6-year SOL\n\nYou must prove that the seller knew of a defect, failed to disclose it, and that you relied on the non-disclosure to your detriment. The PCDS covers structural, environmental, mechanical, and other property conditions.',
      showIf: (answers) => answers.dispute_type === 'disclosure',
    },

    // === SOL — Mechanic's Lien ===
    {
      id: 'sol_mechanic_lien',
      type: 'info',
      prompt:
        'MECHANIC\'S LIENS: LIEN LAW §§3-38\n\nFiling deadlines (private improvements):\n• General contractor: 8 months from completion of work (Lien Law §10)\n• Subcontractor/supplier: 8 months from completion of work\n• Single-family dwellings: 4 months from completion\n\nCritical procedures:\n1. File the notice of lien with the county clerk where the property is located\n2. Within 5 days before OR 30 days after filing, serve notice on the owner and contractor\n3. File proof of service within 35 days of filing the lien — failure terminates the lien\n4. The lien expires 1 year after filing unless an action to foreclose is commenced or an extension is filed\n\nForeclosure: File a lien foreclosure action in Supreme Court. The lien is enforced similarly to a mortgage foreclosure.\n\nOwners may discharge the lien by posting a bond (Lien Law §19).',
      showIf: (answers) => answers.dispute_type === 'mechanic_lien',
    },

    // === SOL — Co-op/Condo ===
    {
      id: 'sol_coop_condo',
      type: 'info',
      prompt:
        'CO-OP & CONDOMINIUM DISPUTES\n\nGoverning law:\n• Co-ops: NY Business Corporation Law (BCL) — co-ops are corporations; shareholders own stock, not real property\n• Condos: Real Property Law §339-d et seq. (NY Condominium Act)\n\nCommon disputes and their SOL:\n• Board decision challenges (business judgment rule): file Article 78 proceeding within 4 months (CPLR §217) or plenary action within applicable SOL\n• Breach of fiduciary duty by board: 6 years (CPLR §213(7))\n• Breach of proprietary lease/bylaws: 6 years (CPLR §213(2))\n• Common charge liens (condos): RPL §339-z allows lien filing; foreclosure under RPL §339-aa\n• Discrimination claims: Fair Housing Act or NY Human Rights Law — 3 years (CPLR §214(2))\n\nCo-op and condo disputes are typically filed in Supreme Court. Board decisions are reviewed under the "business judgment rule" — courts will not second-guess board decisions made in good faith, for a legitimate purpose, and within the board\'s authority (Levandusky v. One Fifth Ave. Apt. Corp.).',
      showIf: (answers) => answers.dispute_type === 'coop_condo',
    },

    // === SOL — Other ===
    {
      id: 'sol_other',
      type: 'info',
      prompt:
        'COMMON STATUTES OF LIMITATIONS FOR REAL ESTATE DISPUTES\n\n• Breach of contract: 6 years (CPLR §213(2))\n• Fraud: 6 years with discovery rule (CPLR §213(8), §203(g))\n• Trespass: 3 years (CPLR §214(4))\n• Ejectment: 10 years (CPLR §212(a))\n• Adverse possession: 10 years (RPAPL §501-551)\n• Nuisance: 3 years (CPLR §214(4))\n• Breach of fiduciary duty: 6 years (CPLR §213(7))\n• Mortgage foreclosure: 6 years from acceleration (CPLR §213(4))\n\nThe clock typically starts on the date of the wrongful act, though the discovery rule may apply to fraud and latent defect claims.\n\nIf your dispute does not fit neatly into one category, consult an attorney to confirm the applicable SOL.',
      showIf: (answers) => answers.dispute_type === 'other',
    },

    // === Lis Pendens ===
    {
      id: 'involves_title',
      type: 'yes_no',
      prompt: 'Does your dispute involve ownership, title, or a lien on the property?',
      helpText:
        'If your lawsuit could affect who owns the property or what liens encumber it, you may need to file a lis pendens (notice of pendency) to protect your interest.',
    },
    {
      id: 'lis_pendens_info',
      type: 'info',
      prompt:
        'LIS PENDENS — NOTICE OF PENDENCY (CPLR §6501)\n\nA lis pendens is a notice filed in the county clerk\'s office that alerts third parties (including potential buyers) that a lawsuit affecting the property is pending. It effectively prevents the property from being sold or refinanced without the buyer taking subject to your claim.\n\nKey rules:\n• Must be filed simultaneously with or after commencing the action\n• Effective for 3 years from filing; can be extended by court order before expiration\n• Must describe the property and state the nature of the action\n• The defendant can move to cancel the lis pendens if the plaintiff cannot show probable cause (CPLR §6514)\n• Wrongful filing of a lis pendens can result in liability for damages\n\nFiling a lis pendens is standard practice in quiet title, specific performance, and mortgage foreclosure actions.',
      showIf: (answers) => answers.involves_title === 'yes',
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

    // === Venue ===
    {
      id: 'property_county',
      type: 'text',
      prompt: 'What county is the property located in?',
      helpText:
        'Under CPLR §507, actions involving real property must be tried in the county where the property is situated. This is mandatory venue — the court will transfer your case if filed in the wrong county.',
      placeholder: 'e.g. Kings County (Brooklyn)',
    },
    {
      id: 'venue_info',
      type: 'info',
      prompt:
        'MANDATORY VENUE: COUNTY WHERE PROPERTY IS LOCATED (CPLR §507)\n\nUnlike most civil cases where venue is based on where the defendant resides (CPLR §503), real property actions MUST be filed in the county where the property is situated. This rule is mandatory and cannot be changed by agreement of the parties.\n\nThis applies to: quiet title, partition, foreclosure, specific performance of a real property contract, dower, and any action where the judgment would directly affect title to or possession of real property.\n\nFor mixed claims (e.g., breach of contract AND quiet title), the real property venue rule controls.',
    },

    // === Court Selection ===
    {
      id: 'damages_amount',
      type: 'single_choice',
      prompt: 'How much money is at stake (or what is the value of the property interest)?',
      helpText:
        'Most real estate disputes are filed in Supreme Court because they involve equity jurisdiction (title, specific performance, injunctions). However, if your claim is purely for money damages, the amount determines the available courts.',
      options: [
        { value: 'under_5k', label: 'Under $5,000 (money damages only)' },
        { value: '5k_to_50k', label: '$5,000 to $50,000 (money damages only)' },
        { value: 'over_50k', label: 'Over $50,000' },
        { value: 'equity', label: 'Title, specific performance, or injunction (any amount)' },
      ],
    },
    {
      id: 'court_small_claims',
      type: 'info',
      prompt:
        'SMALL CLAIMS COURT (up to $5,000 outside NYC; up to $10,000 in NYC)\n\nIf your real estate dispute is purely about money damages (e.g., return of earnest money, security deposit), Small Claims Court is an option.\n\n• No formal complaint needed — fill out a short statement of claim\n• Filing fee: $15-$20\n• Hearing typically within 30-60 days\n• No discovery, no formal rules of evidence\n\nHowever, Small Claims Court CANNOT order specific performance, quiet title, or injunctive relief. If you need any equitable remedy, you must file in Supreme Court.',
      showIf: (answers) => answers.damages_amount === 'under_5k',
    },
    {
      id: 'court_civil',
      type: 'info',
      prompt:
        'NYC CIVIL COURT (up to $50,000) or CITY/COUNTY COURT\n\nFor money-only claims between $5,000 and $50,000:\n• In NYC: file in NYC Civil Court\n• Outside NYC: file in City Court (up to $15,000) or County Court\n\nFiling fee: approximately $45-$210 depending on the court.\n\nYou must file a formal summons and complaint meeting CPLR §3013 fact-pleading standards. Full discovery and motion practice apply.\n\nNote: These courts CANNOT grant equitable relief (quiet title, specific performance, injunctions). If you need equitable relief, file in Supreme Court regardless of the amount.',
      showIf: (answers) => answers.damages_amount === '5k_to_50k',
    },
    {
      id: 'court_supreme',
      type: 'info',
      prompt:
        'SUPREME COURT (unlimited jurisdiction — required for equity)\n\nFile in New York Supreme Court if:\n• Your damages exceed $50,000, OR\n• You seek any equitable relief: quiet title, specific performance, injunction, partition, foreclosure, or declaratory judgment\n\nSupreme Court is the ONLY trial court with equity jurisdiction. Despite its name, it is NOT the highest court — it is the general trial court.\n\nFiling costs:\n• Index number: $210\n• Request for Judicial Intervention (RJI): $95\n• Total: $305 to initiate\n\nFull formal procedure applies: fact pleading (CPLR §3013), discovery (CPLR Article 31), motions, trial. Cases typically take 1-3 years to reach trial.',
      showIf: (answers) =>
        answers.damages_amount === 'over_50k' || answers.damages_amount === 'equity',
    },

    // === Fact Pleading Requirement ===
    {
      id: 'fact_pleading_info',
      type: 'info',
      prompt:
        'NEW YORK REQUIRES FACT PLEADING (CPLR §3013)\n\nUnlike federal court (which uses "notice pleading"), New York requires fact pleading. Your complaint must contain:\n\n1. A plain and concise statement of the material FACTS — not just legal conclusions\n2. Enough detail so the defendant knows what conduct is at issue\n3. Each cause of action stated separately\n\nFor real estate disputes, you must plead:\n• A description of the property (legal description preferred)\n• The nature of your interest in the property\n• The specific wrongful conduct\n• How you were damaged\n\nFor fraud claims, you must plead with heightened particularity under CPLR §3016(b): who, what, when, where, and how.\n\nVague complaints will be dismissed under CPLR §3211(a)(7).',
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

    // === Prejudgment Interest ===
    {
      id: 'prejudgment_interest_info',
      type: 'info',
      prompt:
        'PREJUDGMENT INTEREST: 9% PER YEAR (CPLR §5004)\n\nNew York awards prejudgment interest at 9% per annum — one of the highest rates in the country. For breach of contract claims (including real estate contracts), this is mandatory, not discretionary.\n\nInterest runs from the date of the breach or when damages were incurred (CPLR §5001).\n\nExample: On a $100,000 breach that occurred 2 years ago, prejudgment interest alone adds $18,000.\n\nFor equity claims (quiet title, specific performance), prejudgment interest may not apply or may be calculated differently. For money damages claims alongside equity claims, interest applies to the monetary portion.\n\nThis is a powerful tool in settlement negotiations — always include it in your demand.',
    },

    // === Key Motions & Procedures ===
    {
      id: 'key_motions_info',
      type: 'info',
      prompt:
        'KEY MOTIONS & PROCEDURES FOR REAL ESTATE CASES\n\nMotion to Dismiss (CPLR §3211):\n• §3211(a)(1) — documentary evidence defeats the claim (e.g., the deed itself)\n• §3211(a)(5) — statute of limitations expired\n• §3211(a)(7) — complaint fails to state a cause of action\n\nLis Pendens Cancellation (CPLR §6514):\n• Defendant can move to cancel if plaintiff lacks probable cause\n• Court may require plaintiff to post a bond\n\nDefault Judgment (CPLR §3215):\n• If defendant fails to answer within 20/30 days\n• For real estate cases, court may require an inquest and a title search\n\nDiscovery (CPLR Article 31):\n• Depositions, document demands, interrogatories\n• Title documents, surveys, inspection reports are key discovery targets\n• Expert disclosure for appraisers, surveyors, engineers\n\nSummary Judgment (CPLR §3212):\n• Must show no material facts in dispute\n• In real estate: particularly useful when documents (deeds, contracts) are unambiguous',
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
        { value: 'not_sure_method', label: 'I am not sure yet' },
      ],
    },
    {
      id: 'efile_nyscef_info',
      type: 'info',
      prompt:
        'E-FILING VIA NYSCEF\n\n1. Go to nyscef.nycourts.gov and create a free account\n2. Select "File a New Case" and choose your court and case type\n3. Upload your summons and complaint as PDF\n4. If filing a lis pendens, upload it as a separate document\n5. Pay the filing fee online (credit card or e-check)\n6. You will receive a confirmation number and index number\n\nNYSCEF is mandatory for Supreme Court in most counties (including all NYC boroughs). For other courts, check if e-filing is available in your county.\n\nAll subsequent filings (motions, lis pendens, discovery) are also done through NYSCEF once the case is in the system.',
      showIf: (answers) => answers.filing_method === 'efile',
    },
    {
      id: 'in_person_info',
      type: 'info',
      prompt:
        'FILING IN PERSON\n\n1. Print at least 3 copies of your summons and complaint (court, defendant, your records)\n2. If filing a lis pendens, bring copies of that as well\n3. Go to the Supreme Court clerk\'s office in the county where the property is located\n4. Tell the clerk you are filing a real property action\n5. Pay the filing fee ($210 index number + $95 RJI) or submit a fee waiver\n6. The clerk will assign an index number and stamp your copies\n7. Arrange for service on the defendant within 120 days (CPLR §306-b)\n8. File the lis pendens with the county clerk\'s office (separate from the court clerk)\n\nBring a valid government-issued ID.',
      showIf: (answers) => answers.filing_method === 'in_person',
    },

    // === Fee Affordability ===
    {
      id: 'can_afford_fee',
      type: 'yes_no',
      prompt: 'Can you afford the filing fee?',
      helpText:
        'Filing fees vary: Small Claims ($15-$20), NYC Civil Court ($45), Supreme Court ($305 total for index number + RJI). If you cannot afford it, fee waivers are available.',
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
        'FILING CHECKLIST FOR NEW YORK REAL ESTATE DISPUTES\n\nDocuments to prepare:\n• Summons and Complaint — 3 copies minimum, meeting CPLR §3013 fact-pleading standards\n• Legal description of the property (from deed, title commitment, or survey)\n• Lis pendens (if applicable) — file with county clerk\n• Copy of the contract, deed, or other operative document\n• Supporting documents: emails, inspection reports, surveys, title search, appraisals\n• Filing fee payment ($305 for Supreme Court) or Poor Person Application\n\nAfter filing:\n• Serve the defendant within 120 days (CPLR §306-b)\n• File proof of service with the court\n• File Request for Judicial Intervention (RJI) to get a judge assigned\n• If lis pendens filed, serve a copy on the defendant with the summons and complaint\n\nFor fraud claims: verify you have pleaded with particularity (CPLR §3016(b))',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Dispute type & SOL
    if (answers.dispute_type) {
      const solLabels: Record<string, string> = {
        breach_contract: 'Breach of contract — 6-year SOL (CPLR §213(2))',
        fraud: 'Fraud — 6-year SOL with discovery rule (CPLR §213(8))',
        title_defect: 'Title defect — SOL varies by underlying claim',
        quiet_title: 'Quiet title — RPAPL Article 15 (10-year possession requirement)',
        boundary: 'Boundary dispute — ejectment 10 years (CPLR §212(a)), trespass 3 years',
        easement: 'Easement dispute — prescriptive easement requires 10 years of use',
        adverse_possession: 'Adverse possession — 10-year period (RPAPL §501-551)',
        disclosure: 'Disclosure failure — 6-year SOL; PCDS now mandatory (RPL §462-467)',
        mechanic_lien: 'Mechanic\'s lien — file within 8 months (4 months single-family); Lien Law §§3-38',
        coop_condo: 'Co-op/condo dispute — governed by BCL (co-ops) or RPL §339-d (condos)',
        other: 'Other real estate dispute — SOL varies by claim type',
      }
      items.push({
        status: 'done',
        text: `Dispute type: ${solLabels[answers.dispute_type]}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Determine dispute type to identify the applicable statute of limitations.',
      })
    }

    // Lis pendens
    if (answers.involves_title === 'yes') {
      items.push({
        status: 'needed',
        text: 'File a lis pendens (notice of pendency) under CPLR §6501 with the county clerk. Effective for 3 years.',
      })
    }

    // Role
    if (answers.your_role === 'plaintiff') {
      items.push({ status: 'done', text: 'Role: Plaintiff (filing the lawsuit).' })
    } else if (answers.your_role === 'defendant') {
      items.push({ status: 'done', text: 'Role: Defendant (responding to the lawsuit).' })
    }

    // Venue
    if (answers.property_county) {
      items.push({
        status: 'done',
        text: `Venue: ${answers.property_county} — mandatory for real property actions (CPLR §507).`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Identify the county where the property is located — mandatory venue (CPLR §507).',
      })
    }

    // Court
    if (answers.damages_amount) {
      const courtLabels: Record<string, string> = {
        under_5k: 'Small Claims Court (up to $5K outside NYC, $10K in NYC) — money damages only',
        '5k_to_50k': 'NYC Civil Court or City/County Court — money damages only',
        over_50k: 'Supreme Court (unlimited jurisdiction)',
        equity: 'Supreme Court (equity jurisdiction required)',
      }
      items.push({
        status: 'done',
        text: `Court: ${courtLabels[answers.damages_amount]}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Determine damages amount or relief type to identify the correct court.',
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
        text: 'Complete a Poor Person Application (CPLR Article 11) for fee waiver.',
      })
    }

    // Prejudgment interest reminder
    items.push({
      status: 'info',
      text: 'Prejudgment interest: 9% per year (CPLR §5004) — runs from date of breach. Include in your demand.',
    })

    // Service reminder for plaintiffs
    if (answers.your_role === 'plaintiff') {
      items.push({
        status: 'needed',
        text: 'Serve the defendant within 120 days of filing (CPLR §306-b). File proof of service with the court.',
      })
    }

    // Fact pleading reminder
    items.push({
      status: 'info',
      text: 'New York requires fact pleading (CPLR §3013) — state material facts, not just legal conclusions.',
    })

    return items
  },
}
