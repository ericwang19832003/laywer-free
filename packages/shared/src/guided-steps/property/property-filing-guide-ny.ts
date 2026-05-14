import type { GuidedStepConfig } from '../types'

export const propertyFilingGuideNyConfig: GuidedStepConfig = {
  title: 'New York Property Damage Dispute — Statute of Limitations & Filing Guide',
  reassurance:
    'New York has clear rules for property damage disputes. We will walk you through the statute of limitations, the correct court, and every step to file or defend your case.',

  questions: [
    // === Damage Type ===
    {
      id: 'damage_type',
      type: 'single_choice',
      prompt: 'What type of property damage is involved?',
      helpText:
        'The type of damage affects which statute of limitations applies and what you need to prove. Select the category that best fits your situation.',
      options: [
        { value: 'vehicle', label: 'Vehicle damage (car accident, hit-and-run, vandalism)' },
        { value: 'real_property', label: 'Property destruction (fire, flood, vandalism to home)' },
        { value: 'trespass', label: 'Trespass (unauthorized entry, dumping, encroachment)' },
        { value: 'nuisance', label: 'Nuisance (noise, odors, water runoff, tree roots)' },
        { value: 'construction', label: 'Construction defect (faulty work, structural problems)' },
        { value: 'neighbor', label: 'Neighbor dispute (trees, fences, party walls)' },
        { value: 'other', label: 'Other property damage' },
      ],
    },

    // === Statute of Limitations by Type ===
    {
      id: 'sol_tort',
      type: 'info',
      prompt:
        'STATUTE OF LIMITATIONS: 3 YEARS (CPLR §214(4))\n\nNew York gives you 3 years from the date the damage occurred to file a lawsuit for injury to property. This applies to most tort-based property damage claims including vehicle damage, vandalism, fire damage, and general property destruction.\n\nThe clock starts on the date the damage occurred, NOT the date you discovered it (unless the damage was hidden or latent, in which case the discovery rule may apply under CPLR §214-c).\n\nIf the 3 years have passed, your claim is time-barred and the court will dismiss it if the defendant raises the defense.',
      showIf: (answers) =>
        answers.damage_type === 'vehicle' ||
        answers.damage_type === 'real_property' ||
        answers.damage_type === 'trespass' ||
        answers.damage_type === 'nuisance' ||
        answers.damage_type === 'neighbor' ||
        answers.damage_type === 'other',
    },
    {
      id: 'sol_construction',
      type: 'info',
      prompt:
        'STATUTE OF LIMITATIONS: DEPENDS ON YOUR CLAIM\n\nConstruction defect cases can involve multiple statutes of limitations:\n\n1. Negligence/property damage: 3 years from the date of damage (CPLR §214(4))\n2. Breach of contract: 6 years from the date of breach (CPLR §213(2))\n3. Housing Merchant Implied Warranty (GBL §777-a): action must be commenced before the later of (a) 1 year after the warranty period expires, or (b) 4 years after the warranty date\n\nGBL §777-a warranty periods for new homes:\n• 1 year — workmanship defects\n• 2 years — plumbing, electrical, heating, cooling, ventilation systems\n• 6 years — material defects (structural)\n\nIf your claim involves a contract with the builder, the 6-year contract SOL often provides the longest window. File under the theory that gives you the most time.',
      showIf: (answers) => answers.damage_type === 'construction',
    },

    // === Contract-Based SOL Note ===
    {
      id: 'contract_basis',
      type: 'single_choice',
      prompt: 'Is the property damage related to a breach of contract?',
      helpText:
        'If someone damaged your property while breaching a contract (e.g., a contractor, tenant, or service provider), you may also have a 6-year statute of limitations under CPLR §213(2) in addition to the 3-year tort SOL.',
      options: [
        { value: 'yes', label: 'Yes — the damage arose from a contract' },
        { value: 'no', label: 'No — this is purely a tort claim (negligence, intentional act)' },
        { value: 'unsure', label: 'I am not sure' },
      ],
      showIf: (answers) => answers.damage_type !== 'construction',
    },
    {
      id: 'sol_contract_note',
      type: 'info',
      prompt:
        'ADDITIONAL SOL: 6 YEARS FOR BREACH OF CONTRACT (CPLR §213(2))\n\nBecause your property damage arose from a contract, you may have two separate claims:\n\n1. Tort claim (negligence/property damage): 3 years (CPLR §214(4))\n2. Breach of contract claim: 6 years (CPLR §213(2))\n\nFile under both theories if the tort SOL has not expired. If the 3-year tort SOL has passed but the 6-year contract SOL has not, you can still sue for breach of contract — but your damages may be measured differently.\n\nThe contract SOL runs from the date of the breach, not the date of discovery.',
      showIf: (answers) =>
        answers.contract_basis === 'yes' && answers.damage_type !== 'construction',
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
        'This determines which court you should file in (or which court your case is in). Include repair costs, diminished value, loss of use, and any other losses. Use your highest estimate.',
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
        'SMALL CLAIMS COURT (up to $5,000 outside NYC)\n\nOutside New York City, Small Claims Court handles cases up to $5,000. Inside NYC, the limit is $10,000.\n\n• No formal pleading required — fill out a simple statement of claim\n• No discovery\n• No jury — a judge or arbitrator decides\n• Filing fee: approximately $15–$20\n• Hearing usually within 30–60 days\n• Only individuals can sue (not corporations or LLCs)\n• You cannot have an attorney represent you at trial (but you can consult one beforehand)\n\nThis is the fastest, simplest option for smaller property damage claims. Bring photos, repair estimates, and receipts to your hearing.',
      showIf: (answers) => answers.damages_amount === 'under_5k',
    },
    {
      id: 'court_small_claims_nyc',
      type: 'info',
      prompt:
        'SMALL CLAIMS COURT — NYC (up to $10,000)\n\nIn NYC, Small Claims Court handles cases up to $10,000 — double the limit outside the city.\n\n• File at the clerk\'s office for your borough or online at nycourts.gov\n• Filing fee: $15–$20\n• No formal complaint needed — fill out a short statement of claim\n• Hearing typically within 30–60 days\n• Informal proceeding — no formal rules of evidence\n• Bring photos, repair estimates, contractor quotes, and any other proof of damage\n• You can bring witnesses but no attorney can represent you at trial\n\nFor property damage between $5,000 and $10,000, verify you are filing in an NYC court to get the higher limit.',
      showIf: (answers) => answers.damages_amount === '5k_to_10k',
    },
    {
      id: 'court_civil',
      type: 'info',
      prompt:
        'NYC CIVIL COURT (up to $50,000) or CITY/DISTRICT COURT\n\nFor claims between $10,000 and $50,000:\n• In NYC: file in NYC Civil Court\n• Outside NYC: file in City Court (up to $15,000) or County Court\n\nFiling fee: approximately $45–$210 depending on the court\n\nYou must file a formal complaint (called a "summons and complaint" or "summons with notice"). The complaint must meet CPLR §3013 fact-pleading standards — state the material facts showing how the defendant damaged your property, not just legal conclusions.\n\nDiscovery, motions, and formal trial procedures apply. You can have an attorney represent you.',
      showIf: (answers) => answers.damages_amount === '10k_to_50k',
    },
    {
      id: 'court_supreme',
      type: 'info',
      prompt:
        'SUPREME COURT (unlimited jurisdiction)\n\nFor claims over $50,000, file in New York Supreme Court. Despite its name, this is NOT the highest court — it is the general trial court of unlimited jurisdiction.\n\n• Filing fee (index number): $210 + Request for Judicial Intervention (RJI) fee of $95\n• Full formal procedure: fact pleading (CPLR §3013), discovery (CPLR Article 31), motions, trial\n• Cases can take 1–3 years to reach trial\n• You can request a jury trial\n\nFor claims this size, strongly consider consulting an attorney. Many property damage attorneys work on contingency or offer free consultations.',
      showIf: (answers) => answers.damages_amount === 'over_50k',
    },

    // === Damage-Type Specific Guidance ===
    {
      id: 'vehicle_damage_info',
      type: 'info',
      prompt:
        'VEHICLE DAMAGE — WHAT TO PROVE\n\nFor vehicle damage claims in New York, you must prove:\n\n1. The defendant caused the damage (negligence or intentional act)\n2. Your vehicle was damaged as a result\n3. The amount of your damages\n\nRecoverable damages include:\n• Repair costs (get at least 2–3 written estimates)\n• Diminished value — the decrease in your vehicle\'s market value even after repair\n• Loss of use — rental car costs or fair market value of daily use while your car was being repaired\n• Towing and storage fees\n\nNew York follows pure comparative negligence (CPLR §1411). Even if you were partially at fault, you can recover — your award is just reduced by your percentage of fault.',
      showIf: (answers) => answers.damage_type === 'vehicle',
    },
    {
      id: 'trespass_info',
      type: 'info',
      prompt:
        'TRESPASS — WHAT TO PROVE\n\nIn New York, trespass to real property requires:\n\n1. You own or have the right to possess the property\n2. The defendant intentionally entered your property (or caused something to enter it)\n3. You did not consent to the entry\n\nTrespass is an intentional tort — the defendant need not intend to cause harm, only intend to enter the property. Mistake about ownership is NOT a defense.\n\nRecoverable damages include:\n• Cost to repair any damage caused\n• Diminished property value\n• Loss of use of the property\n• Nominal damages even if no actual damage occurred\n• Punitive damages if the trespass was willful, wanton, or malicious',
      showIf: (answers) => answers.damage_type === 'trespass',
    },
    {
      id: 'nuisance_info',
      type: 'info',
      prompt:
        'NUISANCE — WHAT TO PROVE\n\nA private nuisance in New York is a substantial and unreasonable interference with the use and enjoyment of your property.\n\nYou must prove:\n1. The defendant\'s conduct (or condition they created) interferes with your property use\n2. The interference is substantial (not trivial)\n3. The interference is unreasonable (balancing the harm to you against the utility of the defendant\'s conduct)\n\nCommon property nuisance claims:\n• Water runoff or flooding from neighboring property\n• Noise, odors, or vibrations\n• Pollution or contamination\n• Light obstruction\n\nRemedies:\n• Money damages for the harm caused\n• Injunctive relief — a court order requiring the defendant to stop the nuisance\n• Both damages and injunction can be awarded together',
      showIf: (answers) => answers.damage_type === 'nuisance',
    },
    {
      id: 'neighbor_dispute_info',
      type: 'info',
      prompt:
        'NEIGHBOR DISPUTES — TREES, FENCES & PARTY WALLS\n\nTree disputes:\n• You can trim branches and roots that cross onto your property up to your property line (self-help), but you CANNOT damage or kill the tree\n• If a healthy tree falls and damages your property, the tree owner is generally NOT liable — it is considered an act of nature\n• If a dead, decayed, or dangerous tree falls, the owner IS liable if they had actual or constructive notice of the hazardous condition\n• Deliberately cutting down or damaging a neighbor\'s tree can result in treble (3x) damages under Real Property Actions and Proceedings Law §861\n\nFences and party walls:\n• Shared boundary walls — both owners have equal rights and obligations to maintain\n• A property owner generally cannot remove a party wall without the neighbor\'s consent\n• Local municipal codes may impose fence height and setback requirements\n\nBefore suing, consider whether mediation or a demand letter could resolve the dispute more quickly and cheaply.',
      showIf: (answers) => answers.damage_type === 'neighbor',
    },
    {
      id: 'construction_defect_info',
      type: 'info',
      prompt:
        'CONSTRUCTION DEFECTS — YOUR OPTIONS\n\nNew York provides several legal theories for construction defect claims:\n\n1. Breach of contract — if you hired the contractor directly (6-year SOL)\n2. Housing Merchant Implied Warranty (GBL §777-a) — for new home buyers (warranty periods of 1, 2, or 6 years depending on defect type)\n3. Negligence — if the contractor failed to meet the standard of care (3-year SOL)\n\nGBL §777-a warranty coverage (new homes only):\n• 1 year: workmanship defects\n• 2 years: plumbing, electrical, HVAC systems\n• 6 years: material/structural defects\n\nDamages for construction defects:\n• Reasonable cost of repair or replacement\n• Property damage proximately caused by the defect\n• Consequential damages (temporary housing, lost rental income) if foreseeable\n• For GBL §777-a claims, damages cannot exceed replacement cost of the home (excluding land value)\n\nDocument everything: hire an independent inspector, get repair estimates, and photograph all defects.',
      showIf: (answers) => answers.damage_type === 'construction',
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
        'NEW YORK REQUIRES FACT PLEADING (CPLR §3013)\n\nUnlike federal court (which uses "notice pleading"), New York requires fact pleading. Your complaint must contain:\n\n1. A plain and concise statement of the material FACTS — not just legal conclusions\n2. Enough detail so the defendant knows what property was damaged and how\n3. Each cause of action stated separately\n\nFor property damage, you must plead:\n• What property was damaged and your ownership/right to possession\n• How the defendant caused the damage (negligence, intentional act, breach of duty)\n• When and where the damage occurred\n• The specific damages you suffered (repair costs, diminished value, loss of use)\n\nVague complaints like "defendant damaged my property" without factual detail will be dismissed under CPLR §3211(a)(7).',
    },

    // === Damages Categories ===
    {
      id: 'damages_sought',
      type: 'single_choice',
      prompt: 'What types of damages are you seeking?',
      helpText:
        'New York allows several categories of damages for property damage. Select the primary type.',
      options: [
        { value: 'repair', label: 'Repair or replacement costs' },
        { value: 'diminished_value', label: 'Diminished value of property' },
        { value: 'loss_of_use', label: 'Loss of use (rental costs, lost income)' },
        { value: 'multiple', label: 'Multiple types of damages' },
        { value: 'unsure_damages', label: 'I am not sure' },
      ],
    },
    {
      id: 'repair_damages_info',
      type: 'info',
      prompt:
        'REPAIR / REPLACEMENT COSTS\n\nThe primary measure of damages for property damage in New York is the reasonable cost of repair. If the property is destroyed or repair is impractical, you can recover the fair market value at the time of loss.\n\nTo prove repair costs:\n• Get at least 2–3 written estimates from licensed contractors or repair shops\n• Keep all receipts if repairs are already completed\n• Photographs of the damage (before and after repair) are critical evidence\n\nThe court will typically award the lesser of: (1) the cost of repair, or (2) the fair market value of the property before the damage (if repair costs exceed the property\'s value).',
      showIf: (answers) => answers.damages_sought === 'repair',
    },
    {
      id: 'diminished_value_info',
      type: 'info',
      prompt:
        'DIMINISHED VALUE\n\nEven after repair, property may be worth less than before the damage. New York allows recovery for this "diminished value" — the difference between the property\'s market value before the damage and its market value after repair.\n\nThis is most common in vehicle damage cases (a car with a damage history sells for less) and real property cases (a home with a history of flooding or structural damage).\n\nProof: You will need an appraiser or expert to testify about the property\'s value before and after the damage.',
      showIf: (answers) => answers.damages_sought === 'diminished_value',
    },
    {
      id: 'loss_of_use_info',
      type: 'info',
      prompt:
        'LOSS OF USE\n\nYou can recover the reasonable value of the loss of use of your property during the repair period. This includes:\n\n• Rental car costs (for vehicle damage)\n• Temporary housing or hotel costs (for home damage)\n• Lost rental income (if the property was income-producing)\n• Fair rental value of your own property during the time you could not use it\n\nThe period of loss of use must be reasonable — only the time actually needed for repair, not delays caused by your own inaction.',
      showIf: (answers) => answers.damages_sought === 'loss_of_use',
    },
    {
      id: 'multiple_damages_info',
      type: 'info',
      prompt:
        'MULTIPLE DAMAGES CATEGORIES\n\nYou can claim all applicable damages together in one lawsuit:\n\n• Repair or replacement costs — the cost to fix or replace the damaged property\n• Diminished value — the decrease in market value even after repair\n• Loss of use — rental costs, temporary housing, or lost income during the repair period\n• Consequential damages — foreseeable indirect losses caused by the damage\n• Incidental damages — inspection costs, towing fees, storage fees\n\nYou must prove each category with reasonable certainty. Speculative damages are not recoverable.\n\nNew York follows pure comparative negligence (CPLR §1411) — your recovery is reduced by your percentage of fault, but you can still recover even if you were mostly at fault.',
      showIf: (answers) =>
        answers.damages_sought === 'multiple' || answers.damages_sought === 'unsure_damages',
    },

    // === Insurance Considerations ===
    {
      id: 'insurance_involved',
      type: 'single_choice',
      prompt: 'Is an insurance company involved?',
      helpText:
        'If the damage is covered by insurance (yours or the defendant\'s), there are special rules that affect your recovery.',
      options: [
        { value: 'my_insurance', label: 'Yes — I filed a claim with MY insurance' },
        { value: 'their_insurance', label: 'Yes — I am dealing with the DEFENDANT\'S insurance' },
        { value: 'both', label: 'Both insurers are involved' },
        { value: 'none', label: 'No insurance involved' },
      ],
    },
    {
      id: 'collateral_source_info',
      type: 'info',
      prompt:
        'COLLATERAL SOURCE RULE (CPLR §4545)\n\nIf you received insurance payments for your property damage, the court will reduce your verdict by the amount you received from collateral sources (like your own insurance) — MINUS the premiums you paid for the 2 years before the claim.\n\nThis means:\n• You cannot collect twice for the same damage (once from insurance, once from the defendant)\n• BUT you get credit for the premiums you paid, so the offset is not dollar-for-dollar\n• Your insurance company may have subrogation rights — they can sue the defendant to recover what they paid you\n\nThe collateral source reduction happens AFTER the jury verdict, not during trial. You can present your full damages to the jury.',
      showIf: (answers) =>
        answers.insurance_involved === 'my_insurance' ||
        answers.insurance_involved === 'both',
    },
    {
      id: 'bad_faith_info',
      type: 'info',
      prompt:
        'INSURANCE BAD FAITH IN NEW YORK\n\nNew York recognizes insurance bad faith claims under common law (not by statute). If the defendant\'s insurer unreasonably denies or delays your claim, your options are limited as a third-party claimant — New York does not allow third-party bad faith claims.\n\nIf YOUR OWN insurer acts in bad faith:\n• You may sue for breach of the implied covenant of good faith and fair dealing\n• Damages can include the amount of the unpaid claim plus consequential damages\n• Consequential damages are available if the insurer\'s bad faith was foreseeable at the time the policy was issued (Bi-Economy Market v. Harleysville Ins. Co.)\n\nDocument every interaction with the insurance company — save letters, emails, and notes from phone calls.',
      showIf: (answers) =>
        answers.insurance_involved === 'their_insurance' ||
        answers.insurance_involved === 'my_insurance' ||
        answers.insurance_involved === 'both',
    },

    // === Venue ===
    {
      id: 'venue_info',
      type: 'info',
      prompt:
        'VENUE — WHERE TO FILE (CPLR §503)\n\nFile in the county where:\n\n1. The defendant resides (for individuals) or has its principal office (for businesses)\n2. The property damage occurred\n\nFor real property damage (home, land): file in the county where the property is located.\n\nIf there is a contract with a forum selection clause, that usually controls. New York courts generally enforce forum selection clauses unless they are unreasonable or the result of fraud.\n\nImproper venue does not void your case — the defendant can move to change venue under CPLR §510, but the case will be transferred, not dismissed.',
    },

    // === Prejudgment Interest ===
    {
      id: 'prejudgment_interest_info',
      type: 'info',
      prompt:
        'PREJUDGMENT INTEREST: 9% PER YEAR (CPLR §5004)\n\nNew York awards prejudgment interest at 9% per annum — one of the highest rates in the country. For property damage claims, interest runs from the date the damage occurred (or when damages were incurred) through the date of judgment (CPLR §5001).\n\nExample: On $30,000 in property damage that occurred 2 years ago, prejudgment interest alone would add $5,400 (9% x $30,000 x 2 years).\n\nThis significantly increases your recovery and is an important factor in settlement negotiations. Make sure to include your prejudgment interest calculation in any demand letter or settlement offer.',
    },

    // === Key Motions & Discovery ===
    {
      id: 'key_motions_info',
      type: 'info',
      prompt:
        'KEY MOTIONS & DISCOVERY\n\nMotion to Dismiss (CPLR §3211):\n• §3211(a)(1) — documentary evidence defeats the claim\n• §3211(a)(5) — statute of limitations expired\n• §3211(a)(7) — complaint fails to state a cause of action\n• Must be filed before or with the Answer\n\nDefault Judgment (CPLR §3215):\n• If the defendant fails to answer within 20/30 days\n• Plaintiff must show proof of service, the facts, and the amount of damages\n• Court may require an inquest (hearing on damages)\n\nDiscovery (CPLR Article 31):\n• Depositions, interrogatories, document demands, requests to admit\n• For property damage: demand inspection of the damaged property, contractor reports, insurance files, photos, and repair records\n• Parties must exchange automatic disclosure early in the case\n\nSummary Judgment (CPLR §3212):\n• Available after discovery is complete (or issue joined)\n• Must show no material facts in dispute — strong when liability is clear and damages are documented',
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
        'FILING IN PERSON\n\n1. Print at least 3 copies of your summons and complaint (court, defendant, your records)\n2. Go to the court clerk\'s office during business hours\n3. Tell the clerk you are filing a property damage action\n4. Pay the filing fee or submit a fee waiver (Poor Person Application under CPLR Article 11)\n5. The clerk will assign an index number and stamp your copies\n6. Arrange for service on the defendant within 120 days (CPLR §306-b)\n\nBring a valid government-issued ID and all supporting documents (photos, estimates, receipts).',
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
        'FILING CHECKLIST\n\n• Summons and Complaint (or Summons with Notice) — 3 copies minimum\n• Photos of the property damage (before, during, and after if repairs done)\n• Repair estimates (at least 2–3 written quotes)\n• Receipts for any repairs already completed\n• Insurance correspondence (claim letters, denial letters, adjuster reports)\n• Any contracts related to the damage (contractor agreements, lease, etc.)\n• Filing fee payment or Poor Person Application\n• Government-issued ID (for in-person filing)\n• Serve the defendant within 120 days of filing (CPLR §306-b)\n• File proof of service with the court after service is complete',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Damage type & SOL
    if (answers.damage_type) {
      const typeLabels: Record<string, string> = {
        vehicle: 'Vehicle damage',
        real_property: 'Property destruction',
        trespass: 'Trespass',
        nuisance: 'Nuisance',
        construction: 'Construction defect',
        neighbor: 'Neighbor dispute',
        other: 'Other property damage',
      }
      const solText =
        answers.damage_type === 'construction'
          ? '3 years tort (CPLR §214(4)), 6 years contract (CPLR §213(2)), or GBL §777-a warranty periods.'
          : answers.contract_basis === 'yes'
            ? '3 years tort (CPLR §214(4)) and 6 years contract (CPLR §213(2)).'
            : '3 years (CPLR §214(4)).'
      items.push({
        status: 'done',
        text: `${typeLabels[answers.damage_type]}. Statute of limitations: ${solText}`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Determine damage type. NY property damage SOL is generally 3 years (CPLR §214(4)).',
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

    // Insurance
    if (answers.insurance_involved && answers.insurance_involved !== 'none') {
      items.push({
        status: 'info',
        text: 'Insurance involved — collateral source rule (CPLR §4545) may reduce your verdict by insurance payments received (minus premiums paid).',
      })
    }

    // Damages type
    if (answers.damages_sought) {
      const damageLabels: Record<string, string> = {
        repair: 'Repair or replacement costs',
        diminished_value: 'Diminished value of property',
        loss_of_use: 'Loss of use (rental costs, lost income)',
        multiple: 'Multiple damage categories',
        unsure_damages: 'Damages type not yet determined',
      }
      items.push({
        status: answers.damages_sought === 'unsure_damages' ? 'needed' : 'info',
        text: `Damages: ${damageLabels[answers.damages_sought]}.`,
      })
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

    // Prejudgment interest reminder
    items.push({
      status: 'info',
      text: 'Prejudgment interest: 9% per year (CPLR §5004) — runs from date of damage. Include in your demand.',
    })

    // Venue reminder
    items.push({
      status: 'info',
      text: 'Venue (CPLR §503): file where the defendant resides or where the property damage occurred.',
    })

    // Comparative negligence reminder
    items.push({
      status: 'info',
      text: 'New York uses pure comparative negligence (CPLR §1411) — you can recover even if partially at fault, reduced by your percentage of fault.',
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
