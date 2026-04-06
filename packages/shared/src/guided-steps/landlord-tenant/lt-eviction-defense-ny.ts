import type { GuidedStepConfig } from '../types'

export const ltEvictionDefenseNyConfig: GuidedStepConfig = {
  title: 'Defend Against Eviction in New York',
  reassurance:
    'New York has some of the strongest tenant protections in the country. Landlords must follow strict procedures, and tenants have powerful defenses. Filing a response and appearing in court prevents a default judgment.',

  questions: [
    // === Overview ===
    {
      id: 'overview_info',
      type: 'info',
      prompt:
        'HOW NEW YORK EVICTION WORKS\n\nIn New York, a landlord cannot evict you without a court order. Self-help evictions (changing locks, shutting off utilities, removing belongings) are illegal under RPAPL §768.\n\nEviction lawsuits are called "summary proceedings" under RPAPL Article 7. There are two main types:\n\n1. NONPAYMENT PROCEEDING — landlord claims you owe rent\n2. HOLDOVER PROCEEDING — landlord claims you must leave for reasons other than nonpayment (lease expired, lease violation, nuisance, etc.)\n\nYou have the right to appear, answer, raise defenses, request adjournments, and in many cases get a free lawyer. The process typically takes weeks to months, not days.',
    },

    // === Court Location ===
    {
      id: 'court_location',
      type: 'single_choice',
      prompt: 'Where is your case?',
      helpText:
        'Check your court papers. In NYC, evictions go to Housing Court. Outside NYC, they go to City Court, Town Court, or Village Court depending on your location.',
      options: [
        { value: 'nyc_housing', label: 'NYC Housing Court (any borough)' },
        { value: 'city_court', label: 'City Court (Buffalo, Rochester, Syracuse, etc.)' },
        { value: 'town_village', label: 'Town or Village Court' },
        { value: 'unsure', label: 'I am not sure' },
      ],
    },

    // === Right to Counsel (NYC) ===
    {
      id: 'rtc_info',
      type: 'info',
      prompt:
        'FREE LAWYER AVAILABLE — NYC RIGHT TO COUNSEL\n\nNew York City guarantees free legal representation for tenants facing eviction if your household income is at or below 200% of the federal poverty level (about $30,000 for one person or $62,000 for a family of four).\n\nThis applies to ALL eviction cases — nonpayment and holdover — in every ZIP code, regardless of immigration status.\n\nHow to get a free lawyer:\n• Attend your first court date — screenings happen at the courthouse\n• Call 718-557-1379 or 212-962-4795 (Mon-Fri, 9am-5pm)\n• Email civiljustice@hra.nyc.gov\n• Visit Housing Court Help Centers in each borough\n\nEven if you do not qualify for Right to Counsel, free legal help is available through Legal Aid Society, Legal Services NYC, and other nonprofit providers.',
      showIf: (answers) => answers.court_location === 'nyc_housing',
    },
    {
      id: 'upstate_legal_help',
      type: 'info',
      prompt:
        'FREE LEGAL HELP OUTSIDE NYC\n\nWhile there is no universal right to counsel outside NYC, free legal assistance may be available:\n\n• Legal Aid Society of your county\n• LawHelpNY.org — statewide directory of free legal services\n• NY Courts Help Center: 833-753-0900\n• Court-based Help Centers at many courthouses\n• Law school clinics (Albany, Buffalo, Syracuse, Cornell)\n\nIf you cannot afford a lawyer, contact your local legal aid office immediately. Many have dedicated housing units.',
      showIf: (answers) =>
        answers.court_location === 'city_court' ||
        answers.court_location === 'town_village' ||
        answers.court_location === 'unsure',
    },

    // === Proceeding Type ===
    {
      id: 'proceeding_type',
      type: 'single_choice',
      prompt: 'What type of eviction proceeding is this?',
      helpText:
        'Check your court papers (the "petition"). A nonpayment petition says you owe rent. A holdover petition says you must leave for another reason (lease expired, lease violation, nuisance, illegal use, etc.).',
      options: [
        { value: 'nonpayment', label: 'Nonpayment — landlord says I owe rent' },
        { value: 'holdover', label: 'Holdover — landlord wants me to leave (not about rent)' },
        { value: 'unsure', label: 'I am not sure' },
      ],
    },

    // ================================================================
    // NONPAYMENT PROCEEDING
    // ================================================================
    {
      id: 'nonpayment_overview',
      type: 'info',
      prompt:
        'NONPAYMENT PROCEEDING — YOUR RIGHTS\n\nBefore filing a nonpayment case, your landlord was required to:\n\n1. Serve you a written 14-day rent demand (RPAPL §711(2)) specifying:\n   — Which months are unpaid\n   — The amount owed for each month\n   — A demand to pay or surrender possession\n   — A Good Cause Eviction Law notice (RPL §231-c)\n\n2. Serve the demand using proper methods (personal service, leave-and-mail, or nail-and-mail per RPAPL §735)\n\n3. Wait the full 14 days before filing in court\n\nIf any of these steps were not followed, you have a defense to dismiss the case.\n\nIMPORTANT: You can stop a nonpayment eviction at any time before the warrant is executed by paying all rent owed. This is your absolute right under RPAPL §731(1).',
      showIf: (answers) => answers.proceeding_type === 'nonpayment',
    },
    {
      id: 'received_rent_demand',
      type: 'single_choice',
      prompt: 'Did you receive a written 14-day rent demand before the court papers?',
      helpText:
        'This is a separate document from the court petition. It should have been served at least 14 days before the landlord filed the case. It must state the months and amounts owed.',
      options: [
        { value: 'yes', label: 'Yes — I received a written rent demand' },
        { value: 'no', label: 'No — I never received one' },
        { value: 'verbal_only', label: 'Landlord only asked verbally, nothing in writing' },
        { value: 'unsure', label: 'I am not sure' },
      ],
      showIf: (answers) => answers.proceeding_type === 'nonpayment',
    },
    {
      id: 'no_rent_demand_defense',
      type: 'info',
      prompt:
        'STRONG DEFENSE — NO PREDICATE RENT DEMAND\n\nUnder RPAPL §711(2), the landlord MUST serve a written 14-day rent demand before commencing a nonpayment proceeding. A verbal demand is not sufficient.\n\nThe demand must:\n• Be in writing\n• Specify the months and amounts of rent claimed due\n• Demand payment or possession in the alternative\n• Include the Good Cause Eviction Law notice (RPL §231-c)\n• Be served using RPAPL §735 methods\n\nIf the landlord did not serve a proper rent demand or did not wait the full 14 days, the case should be dismissed. Raise this as a defense in your answer:\n\n"The petition should be dismissed because petitioner failed to serve a proper written rent demand as required by RPAPL §711(2)."',
      showIf: (answers) =>
        answers.proceeding_type === 'nonpayment' &&
        (answers.received_rent_demand === 'no' ||
          answers.received_rent_demand === 'verbal_only'),
    },

    // ================================================================
    // HOLDOVER PROCEEDING
    // ================================================================
    {
      id: 'holdover_overview',
      type: 'info',
      prompt:
        'HOLDOVER PROCEEDING — YOUR RIGHTS\n\nIn a holdover proceeding, the landlord must prove a valid reason to evict you AND must have followed all required notice procedures.\n\nBefore filing a holdover case, the landlord must have served you with a written termination notice. The required notice period depends on how long you have lived there (RPL §226-c):\n\n• Less than 1 year (no lease): 30 days notice\n• 1-2 years (or lease term of 1-2 years): 60 days notice\n• More than 2 years (or lease term of 2+ years): 90 days notice\n\nIf your unit is covered by the Good Cause Eviction Law or rent stabilization, additional protections apply and the landlord must prove "good cause" to evict you.\n\nCommon holdover grounds: lease expiration, lease violation, nuisance, illegal use, owner occupancy. Each has specific legal requirements the landlord must meet.',
      showIf: (answers) => answers.proceeding_type === 'holdover',
    },
    {
      id: 'holdover_reason',
      type: 'single_choice',
      prompt: 'What reason does the landlord give for the holdover?',
      options: [
        { value: 'lease_expired', label: 'Lease expired and landlord will not renew' },
        { value: 'lease_violation', label: 'Lease violation (noise, pets, unauthorized occupant, etc.)' },
        { value: 'nuisance', label: 'Nuisance' },
        { value: 'owner_use', label: 'Owner wants to move in or use the unit' },
        { value: 'illegal_use', label: 'Illegal use of the premises' },
        { value: 'no_reason', label: 'No reason given' },
        { value: 'unsure', label: 'I am not sure' },
      ],
      showIf: (answers) => answers.proceeding_type === 'holdover',
    },
    {
      id: 'holdover_notice_received',
      type: 'single_choice',
      prompt: 'Did you receive a written termination notice before the court papers?',
      helpText:
        'This is a separate notice from the court petition. Under RPL §226-c, the landlord must give 30, 60, or 90 days written notice depending on your length of tenancy before commencing a holdover proceeding.',
      options: [
        { value: 'yes_proper', label: 'Yes — received with enough notice time' },
        { value: 'yes_short', label: 'Yes — but less notice than required' },
        { value: 'no', label: 'No — I never received a termination notice' },
        { value: 'unsure', label: 'I am not sure' },
      ],
      showIf: (answers) => answers.proceeding_type === 'holdover',
    },
    {
      id: 'holdover_no_notice_defense',
      type: 'info',
      prompt:
        'STRONG DEFENSE — IMPROPER OR MISSING TERMINATION NOTICE\n\nUnder RPL §226-c, the landlord must serve a written termination notice with the correct notice period before commencing a holdover proceeding. Failure to serve proper notice is grounds for dismissal.\n\nRaise this defense in your answer:\n"The petition should be dismissed because petitioner failed to serve a proper termination notice as required by RPL §226-c, providing [30/60/90] days notice based on respondent\'s length of tenancy."\n\nIf the notice was served but with insufficient time, the case is premature and should be dismissed without prejudice.',
      showIf: (answers) =>
        answers.proceeding_type === 'holdover' &&
        (answers.holdover_notice_received === 'no' ||
          answers.holdover_notice_received === 'yes_short'),
    },

    // ================================================================
    // GOOD CAUSE EVICTION LAW (2024)
    // ================================================================
    {
      id: 'good_cause_info',
      type: 'info',
      prompt:
        'GOOD CAUSE EVICTION LAW (Effective April 20, 2024)\n\nNew York\'s Good Cause Eviction Law (RPL Article 6-A) provides major protections for many tenants statewide. If your unit is covered, your landlord must prove "good cause" to evict you and cannot impose unreasonable rent increases.\n\nYOU ARE COVERED if ALL of the following are true:\n• Your landlord owns more than 1 rental unit in NYS\n• Your rent is below 345% of Fair Market Rent (about $3,900/month for a 1-bedroom in NYC)\n• Your unit was built before 2009\n• You are NOT in owner-occupied housing with fewer than 11 units\n• You are NOT already covered by rent stabilization, rent control, or public housing\n• You are NOT renting from a co-op or condo owner\n\nIF COVERED — the landlord must:\n• Prove one of the enumerated "good cause" grounds to evict\n• Offer a lease renewal\n• Limit rent increases to 10% or CPI + 5% (whichever is lower) per year\n\nThe landlord must include a Good Cause Eviction Law notice (RPL §231-c) with the petition. If missing, this is a defense.',
    },
    {
      id: 'good_cause_covered',
      type: 'single_choice',
      prompt: 'Do you believe your unit is covered by the Good Cause Eviction Law?',
      helpText:
        'Check whether your landlord owns more than 1 rental unit in NYS and your rent is below 345% of Fair Market Rent. Units built after 2009, rent-stabilized units, and certain owner-occupied buildings are exempt.',
      options: [
        { value: 'yes', label: 'Yes — I believe I am covered' },
        { value: 'no', label: 'No — I believe I am exempt' },
        { value: 'rent_stabilized', label: 'I am rent stabilized or rent controlled' },
        { value: 'unsure', label: 'I am not sure' },
      ],
    },
    {
      id: 'good_cause_defense_info',
      type: 'info',
      prompt:
        'GOOD CAUSE EVICTION DEFENSE\n\nIf your unit is covered by the Good Cause Eviction Law, the landlord must prove one of the enumerated grounds:\n\n• Nonpayment of rent\n• Substantial lease violation (after notice and opportunity to cure)\n• Nuisance or illegal use\n• Unreasonable refusal of access for repairs\n• Owner or immediate family personal use (limited circumstances)\n• Building demolition or major renovation (with permits)\n\nRaise this defense in your answer:\n"Petitioner has failed to establish good cause for eviction as required by Real Property Law Article 6-A."\n\nAlso challenge any rent increase above the statutory cap if the nonpayment is based on a rent hike you believe is unreasonable.',
      showIf: (answers) =>
        answers.good_cause_covered === 'yes' || answers.good_cause_covered === 'unsure',
    },

    // ================================================================
    // RENT STABILIZATION (NYC)
    // ================================================================
    {
      id: 'rent_stabilization_info',
      type: 'info',
      prompt:
        'RENT STABILIZATION PROTECTIONS\n\nIf your apartment is rent stabilized, you have powerful additional protections under the Rent Stabilization Law (RSL) and the Housing Stability and Tenant Protection Act of 2019 (HSTPA):\n\n• Right to a lease renewal — your landlord must offer a 1 or 2 year renewal\n• Rent increases limited to Rent Guidelines Board percentages\n• No vacancy decontrol — apartments stay stabilized regardless of rent level (HSTPA 2019 eliminated high-rent decontrol)\n• Eviction only for specific grounds (nonpayment, owner use, demolition, etc.)\n• Right to challenge rent overcharges going back 6 years\n\nCheck your unit\'s registration at the DHCR/HCR RENT INFO portal or call 718-739-6400.\n\nIf your landlord is trying to deregulate your apartment or claims it is not stabilized, contact a tenant rights organization immediately — many apartments are illegally deregulated.',
      showIf: (answers) => answers.good_cause_covered === 'rent_stabilized',
    },

    // ================================================================
    // ANSWERING THE PETITION
    // ================================================================
    {
      id: 'answer_info',
      type: 'info',
      prompt:
        'ANSWERING THE EVICTION PETITION\n\nYour answer is your official response to the landlord\'s petition. You MUST respond or the court may issue a default judgment against you.\n\nIN NYC HOUSING COURT:\n• Nonpayment cases: You must answer within 10 days of receiving the notice of petition, OR you can answer orally in court on your court date\n• Holdover cases: You typically answer orally in court on the return date\n• You can answer orally (tell the clerk) or in writing (use the court form)\n• Written answer forms are available at the Help Center or nycourts.gov\n\nOUTSIDE NYC:\n• Answer deadlines vary — check your papers for the return date\n• You may need to file a written answer before the court date\n• Contact the court clerk to confirm procedures\n\nYour answer should include:\n1. Denials of allegations that are false\n2. All affirmative defenses (see next steps)\n3. Any counterclaims against the landlord',
    },

    // ================================================================
    // AFFIRMATIVE DEFENSES
    // ================================================================
    {
      id: 'defenses_overview',
      type: 'info',
      prompt:
        'AFFIRMATIVE DEFENSES — List ALL That Apply\n\nYou must raise affirmative defenses in your answer or risk waiving them. Common defenses in NY eviction cases:\n\n1. Warranty of habitability (RPL §235-b) — conditions are unsafe or unlivable\n2. Retaliatory eviction (RPL §223-b) — eviction follows a complaint or protected activity\n3. Improper predicate notice — no 14-day rent demand or insufficient termination notice\n4. Improper service of papers — not served according to RPAPL §735\n5. Good Cause Eviction Law — landlord lacks "good cause" (RPL Art. 6-A)\n6. Rent overcharge — landlord is charging more than the legal rent\n7. Laches / waiver — landlord waited too long or accepted rent after the alleged breach\n8. Breach of duty to mitigate — landlord failed to re-rent after tenant vacated\n9. Payment — you already paid the rent claimed due\n10. Discrimination — eviction based on protected class (Fair Housing Act, NY Human Rights Law)',
    },
    {
      id: 'primary_defense',
      type: 'single_choice',
      prompt: 'Which primary defense applies to your situation?',
      options: [
        { value: 'habitability', label: 'Warranty of habitability — my apartment has serious problems' },
        { value: 'retaliation', label: 'Retaliatory eviction — I complained and now face eviction' },
        { value: 'improper_notice', label: 'Improper notice — landlord skipped required steps' },
        { value: 'improper_service', label: 'Improper service — I was not properly served' },
        { value: 'already_paid', label: 'I already paid the rent claimed due' },
        { value: 'rent_overcharge', label: 'Landlord is overcharging rent' },
        { value: 'good_cause', label: 'Landlord has no good cause to evict me' },
        { value: 'discrimination', label: 'Eviction is discriminatory' },
        { value: 'not_sure', label: 'I am not sure which defense to use' },
      ],
    },

    // === Warranty of Habitability ===
    {
      id: 'habitability_defense_info',
      type: 'info',
      prompt:
        'WARRANTY OF HABITABILITY DEFENSE (RPL §235-b)\n\nEvery residential lease in New York — written or oral — includes an implied warranty that the landlord will keep the premises fit for human habitation, suitable for the uses intended, and free from conditions endangering life, health, or safety. This warranty CANNOT be waived.\n\nIn a nonpayment case, habitability conditions can reduce or eliminate the rent owed. The court will typically calculate an "abatement" — a percentage reduction in rent based on the severity of the conditions.\n\nConditions that support this defense:\n• No heat or hot water\n• Pest infestation (roaches, bedbugs, mice, rats)\n• Mold\n• Lead paint hazards\n• Broken plumbing or no running water\n• No working locks or security\n• Structural damage (ceilings, walls, floors)\n• Lack of smoke/carbon monoxide detectors\n\nDocument everything: photos with dates, 311 complaints, HPD violations, written complaints to the landlord. Request an HPD inspection if you have not already.\n\nInclude in your answer:\n"Respondent asserts the affirmative defense of breach of the warranty of habitability pursuant to RPL §235-b. The premises suffer from the following conditions: [list conditions]. Respondent is entitled to an abatement of rent."',
      showIf: (answers) => answers.primary_defense === 'habitability',
    },

    // === Retaliatory Eviction ===
    {
      id: 'retaliation_defense_info',
      type: 'info',
      prompt:
        'RETALIATORY EVICTION DEFENSE (RPL §223-b)\n\nA landlord may not evict you in retaliation for:\n• Complaining to a government agency (HPD, 311, DOB, etc.) about housing conditions\n• Complaining to the landlord about needed repairs\n• Participating in a tenant organization\n• Exercising any right under your lease or under law\n\nIf you engaged in any protected activity within the past 12 months before the eviction was commenced, there is a REBUTTABLE PRESUMPTION of retaliation (HSTPA 2019 extended this from 6 months to 12 months).\n\nThis presumption applies to:\n• Holdover proceedings\n• Nonpayment proceedings\n• Unreasonable rent increases\n\nThe landlord must prove the eviction is NOT retaliatory. If they cannot, the case should be dismissed.\n\nInclude in your answer:\n"Respondent asserts the affirmative defense of retaliatory eviction pursuant to RPL §223-b. Petitioner commenced this proceeding in retaliation for respondent\'s [describe protected activity] on or about [date]."',
      showIf: (answers) => answers.primary_defense === 'retaliation',
    },

    // === Improper Service ===
    {
      id: 'improper_service_defense_info',
      type: 'info',
      prompt:
        'IMPROPER SERVICE DEFENSE (RPAPL §735)\n\nThe petition and notice of petition must be properly served. Under RPAPL §735, service must be made by:\n\n1. Personal delivery to you — handing papers directly to you\n2. Substituted service — delivering to a person of suitable age and discretion at your home or workplace, PLUS mailing a copy\n3. Conspicuous place service ("nail and mail") — ONLY after at least 2 failed attempts at personal or substituted service, affixing to the door AND mailing\n\nCommon service defects:\n• Process server never actually came to your address\n• Papers left with someone who does not live at your address\n• No mailing after substituted or conspicuous place service\n• Nail-and-mail used without first attempting personal service\n• Service made on a date or time that seems fabricated\n\n"Sewer service" (false affidavits of service) is a well-documented problem in NYC.\n\nInclude in your answer:\n"Respondent was not properly served with the notice of petition and petition as required by RPAPL §735. The Court lacks personal jurisdiction over respondent."',
      showIf: (answers) => answers.primary_defense === 'improper_service',
    },

    // === Already Paid ===
    {
      id: 'already_paid_defense_info',
      type: 'info',
      prompt:
        'PAYMENT DEFENSE\n\nIf you have already paid the rent the landlord claims is owed, gather your proof:\n\n• Bank statements showing payments\n• Cancelled checks (front and back)\n• Money order receipts\n• Venmo, Zelle, or Cash App records\n• Rent receipts signed by the landlord\n• Text messages or emails confirming payment\n\nUnder RPL §235-e, a landlord must provide a written receipt for any rent paid in cash. If your landlord refuses receipts, this is a violation.\n\nIMPORTANT: In a nonpayment case, if you pay the full amount owed at any time before the warrant of eviction is executed, the case must be dismissed (RPAPL §731(1)). Bring proof of any partial payments to court.\n\nInclude in your answer:\n"Respondent denies the allegations of nonpayment. Respondent has paid the rent demanded and offers proof thereof."',
      showIf: (answers) => answers.primary_defense === 'already_paid',
    },

    // === Rent Overcharge ===
    {
      id: 'rent_overcharge_defense_info',
      type: 'info',
      prompt:
        'RENT OVERCHARGE DEFENSE\n\nIf your landlord is charging more than the legal regulated rent, you have a defense in a nonpayment case AND a potential counterclaim.\n\nThis applies to:\n• Rent stabilized apartments — rent must follow Rent Guidelines Board increases\n• Good Cause Eviction Law units — rent increases capped at 10% or CPI + 5% (whichever is lower)\n• Section 8 / voucher tenants — landlord cannot charge above the approved rent\n\nUnder the HSTPA (2019), tenants can challenge rent overcharges going back 6 years and recover treble damages if the overcharge was willful.\n\nCheck your apartment\'s rent history:\n• DHCR/HCR Rent Info: hcr.ny.gov or call 718-739-6400\n• Request your rent history from DHCR (form RA-45)\n\nInclude in your answer:\n"Respondent asserts the affirmative defense of rent overcharge. The legal regulated rent for the subject premises is [amount], and petitioner has been charging in excess of the lawful rent."',
      showIf: (answers) => answers.primary_defense === 'rent_overcharge',
    },

    // === General / Not Sure ===
    {
      id: 'general_defense_info',
      type: 'info',
      prompt:
        'RECOMMENDED APPROACH IF UNSURE\n\nIf you are not sure which specific defense applies, include ALL of the following in your answer:\n\n1. General denial: "Respondent denies all allegations in the petition."\n2. Improper predicate notice: "Petitioner failed to serve proper predicate notices as required by law."\n3. Improper service: "Respondent was not properly served as required by RPAPL §735."\n4. Warranty of habitability: "Respondent asserts a breach of the warranty of habitability (RPL §235-b)." — only if there are conditions issues\n5. Good Cause Eviction Law: "Petitioner has failed to establish good cause as required by RPL Art. 6-A." — if you believe your unit is covered\n\nRaising multiple defenses does not hurt you. It is far better to raise a defense you might not need than to waive one you did need.\n\nThe court will sort out which defenses apply at trial. Your job right now is to preserve all your options.',
      showIf: (answers) =>
        answers.primary_defense === 'not_sure' || answers.primary_defense === 'good_cause',
    },

    // ================================================================
    // HARDSHIP STAY & ORDER TO SHOW CAUSE
    // ================================================================
    {
      id: 'hardship_stay_info',
      type: 'info',
      prompt:
        'STAY OF EVICTION — BUYING TIME\n\nEven if the landlord wins, you have options to stay in your home temporarily:\n\nNONPAYMENT CASES:\n• Pay all rent owed before the warrant is executed — case dismissed (RPAPL §731(1))\n• Request a stay from the judge — up to 5 days to pay (RPAPL §732(3))\n\nHOLDOVER CASES:\n• Hardship stay — the court can issue a stay of up to 1 year if you cannot find suitable housing in the same neighborhood or the eviction would cause extreme hardship (RPAPL §753)\n\nAFTER A WARRANT IS ISSUED:\n• Order to Show Cause (OSC) — an emergency motion asking the judge to stop the eviction temporarily while you present your case. File this at the courthouse.\n• 14-day notice — the marshal or sheriff must give you at least 14 days notice before executing the warrant (RPAPL §749(2), as amended by HSTPA)\n\nThe marshal/sheriff cannot evict you on weekends, holidays, or during extreme weather conditions.\n\nACT QUICKLY — once a warrant is issued, time is limited.',
    },

    // ================================================================
    // SECURITY DEPOSIT
    // ================================================================
    {
      id: 'security_deposit_issue',
      type: 'yes_no',
      prompt: 'Has your landlord failed to return your security deposit or applied it improperly?',
      helpText:
        'Under GOL §7-108, security deposits are limited to one month\'s rent, must be held in a separate trust account, and must be returned with an itemized statement within 14 days of vacating.',
    },
    {
      id: 'security_deposit_defense_info',
      type: 'info',
      prompt:
        'SECURITY DEPOSIT — COUNTERCLAIM OPPORTUNITY\n\nUnder General Obligations Law §7-108 (as amended by HSTPA 2019):\n\n• Security deposit is capped at ONE month\'s rent\n• Landlord must hold it in a separate interest-bearing trust account\n• Landlord must return the deposit with an itemized statement within 14 days of vacating\n• If the landlord fails to provide the itemized statement within 14 days, they forfeit the right to retain any portion\n• Landlord cannot deduct for normal wear and tear\n\nIf your landlord violated these rules, you can file a counterclaim in the eviction proceeding for return of the deposit plus any damages.\n\nNote: In a nonpayment case, you may argue that the landlord should apply the security deposit to the unpaid rent, though courts vary on whether this is required.',
      showIf: (answers) => answers.security_deposit_issue === 'yes',
    },

    // ================================================================
    // EMERGENCY RENTAL ASSISTANCE
    // ================================================================
    {
      id: 'financial_hardship',
      type: 'yes_no',
      prompt: 'Are you experiencing financial hardship that is making it difficult to pay rent?',
    },
    {
      id: 'rental_assistance_info',
      type: 'info',
      prompt:
        'EMERGENCY RENTAL ASSISTANCE\n\nIf you are behind on rent due to financial hardship, apply for assistance immediately:\n\nNYC:\n• CityFHEPS (City Family Homelessness and Eviction Prevention Supplement) — rental vouchers for those at risk of homelessness\n• HRA One-Shot Deal — emergency one-time payment for rent arrears\n• Apply at ACCESS HRA (a069-access.nyc.gov) or visit an HRA office\n• Call 311 and ask about emergency rental assistance\n\nSTATEWIDE:\n• Contact your local Department of Social Services\n• 211 Helpline — dial 211 for local resources\n• Community action agencies and nonprofit organizations\n• Houses of worship and charitable organizations\n\nBring proof of your application to court — judges may grant adjournments while applications are pending.\n\nTell the court if you have applied. Many judges will give you time to receive assistance before issuing a judgment.',
      showIf: (answers) => answers.financial_hardship === 'yes',
    },

    // ================================================================
    // SERVICE & PROCEDURAL CHECKS
    // ================================================================
    {
      id: 'service_method',
      type: 'single_choice',
      prompt: 'How were you served with the court papers (notice of petition and petition)?',
      helpText:
        'Under RPAPL §735, the papers must be served by personal delivery, substituted service (left with someone + mailed), or conspicuous place service (affixed to door + mailed). Improper service is a strong defense.',
      options: [
        { value: 'personal', label: 'Handed to me personally' },
        { value: 'substituted', label: 'Left with someone at my home + mailed' },
        { value: 'nail_and_mail', label: 'Affixed to my door + mailed' },
        { value: 'just_mail', label: 'Only received by mail — no one came to my door' },
        { value: 'never_received', label: 'I never received any papers' },
        { value: 'unsure', label: 'I am not sure how I was served' },
      ],
    },
    {
      id: 'service_defect_info',
      type: 'info',
      prompt:
        'POTENTIAL SERVICE DEFECT\n\nIf you only received papers by mail (without personal delivery or conspicuous place service), or never received papers at all, service may be defective under RPAPL §735.\n\nMail alone is NOT a valid method of service for an eviction petition in New York.\n\nIf you found out about the case only through mail or by checking court records, raise this defense:\n"Respondent was not properly served with the notice of petition and petition as required by RPAPL §735. The Court lacks personal jurisdiction over respondent."\n\nAppearing in court does NOT waive your right to challenge service — you can contest service while also raising other defenses.',
      showIf: (answers) =>
        answers.service_method === 'just_mail' ||
        answers.service_method === 'never_received',
    },

    // ================================================================
    // NEXT STEPS / FILING
    // ================================================================
    {
      id: 'have_court_papers',
      type: 'yes_no',
      prompt: 'Do you have a copy of the petition and notice of petition?',
      helpText:
        'These are the official court papers that start the eviction case. The petition describes what the landlord is claiming. The notice of petition tells you when to appear in court.',
    },
    {
      id: 'get_papers_info',
      type: 'info',
      prompt:
        'OBTAIN YOUR COURT PAPERS\n\nYou need a copy of the petition and notice of petition to prepare your defense. Options:\n\n• Visit the court clerk\'s office and request a copy of the file\n• In NYC, check NYSCEF (iCourts.nycourts.gov) or eCourts for electronic filings\n• Ask the landlord\'s attorney for a copy\n• If you were never properly served, you may learn about the case through a marshal\'s notice — go to the courthouse immediately\n\nRead the petition carefully. Note:\n— The amount of rent claimed\n— The months listed\n— The grounds stated\n— Whether predicate notices are attached\n— Whether the Good Cause Eviction Law notice (RPL §231-c) is included',
      showIf: (answers) => answers.have_court_papers === 'no',
    },
    {
      id: 'know_court_date',
      type: 'yes_no',
      prompt: 'Do you know your court date?',
      helpText:
        'The court date is listed on the notice of petition. In NYC Housing Court, nonpayment cases typically have a first court date ("return date") 10-17 days after service.',
    },

    // ================================================================
    // COURT DAY PREPARATION
    // ================================================================
    {
      id: 'court_day_info',
      type: 'info',
      prompt:
        'WHAT TO EXPECT ON YOUR COURT DATE\n\nDO NOT MISS YOUR COURT DATE. If you do not appear, the landlord gets a default judgment.\n\n1. ARRIVE EARLY — courts are busy. Bring all your documents.\n\n2. CHECK IN — tell the clerk you are a respondent. In NYC Housing Court, ask about the Help Center and Right to Counsel screening.\n\n3. ANSWER — if you have not already filed a written answer, you can answer orally in court (NYC Housing Court). Tell the clerk your defenses.\n\n4. CONFERENCE — most cases go to a conference first, where you negotiate with the landlord\'s attorney. You do NOT have to agree to anything. If you need time, ask for an adjournment.\n\n5. ADJOURNMENTS — you are entitled to at least one 14-day adjournment as of right (HSTPA 2019). Use this time to get a lawyer or prepare your case.\n\n6. SETTLEMENT — many cases settle with a "stipulation" (agreement). Read ANY document carefully before signing. Common stipulation terms include payment plans, repairs, or move-out dates. You can ask the judge questions.\n\n7. TRIAL — if no settlement, the case goes to trial. You have the right to a trial, including a jury trial if you request one.\n\nBRING TO COURT:\n• All court papers received\n• Lease or rental agreement\n• Rent receipts / proof of payment\n• Photos of conditions (if habitability defense)\n• Complaint records (311, HPD, written complaints)\n• Any notices from the landlord\n• Photo ID',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Court location
    const courtLabels: Record<string, string> = {
      nyc_housing: 'NYC Housing Court',
      city_court: 'City Court (outside NYC)',
      town_village: 'Town or Village Court',
    }
    if (answers.court_location && courtLabels[answers.court_location]) {
      items.push({
        status: 'info',
        text: `Court: ${courtLabels[answers.court_location]}.`,
      })
    }

    // Right to Counsel
    if (answers.court_location === 'nyc_housing') {
      items.push({
        status: 'needed',
        text: 'Apply for free lawyer through NYC Right to Counsel — call 718-557-1379 or attend your first court date.',
      })
    }

    // Proceeding type
    if (answers.proceeding_type === 'nonpayment') {
      items.push({ status: 'info', text: 'Case type: Nonpayment proceeding.' })
    } else if (answers.proceeding_type === 'holdover') {
      items.push({ status: 'info', text: 'Case type: Holdover proceeding.' })
    }

    // Predicate notice issues
    if (
      answers.proceeding_type === 'nonpayment' &&
      (answers.received_rent_demand === 'no' ||
        answers.received_rent_demand === 'verbal_only')
    ) {
      items.push({
        status: 'info',
        text: 'Strong defense: No proper 14-day written rent demand served (RPAPL §711(2)).',
      })
    }

    if (
      answers.proceeding_type === 'holdover' &&
      (answers.holdover_notice_received === 'no' ||
        answers.holdover_notice_received === 'yes_short')
    ) {
      items.push({
        status: 'info',
        text: 'Strong defense: Improper or missing termination notice (RPL §226-c).',
      })
    }

    // Good Cause Eviction
    if (
      answers.good_cause_covered === 'yes' ||
      answers.good_cause_covered === 'unsure'
    ) {
      items.push({
        status: 'info',
        text: 'Good Cause Eviction Law may apply — landlord must prove enumerated cause (RPL Art. 6-A).',
      })
    }

    if (answers.good_cause_covered === 'rent_stabilized') {
      items.push({
        status: 'info',
        text: 'Rent stabilized unit — check rent history at DHCR/HCR and verify legal regulated rent.',
      })
    }

    // Primary defense
    const defenseLabels: Record<string, string> = {
      habitability: 'Warranty of habitability (RPL §235-b)',
      retaliation: 'Retaliatory eviction (RPL §223-b)',
      improper_notice: 'Improper predicate notice',
      improper_service: 'Improper service of process (RPAPL §735)',
      already_paid: 'Rent already paid',
      rent_overcharge: 'Rent overcharge',
      good_cause: 'Landlord lacks good cause (RPL Art. 6-A)',
      discrimination: 'Discriminatory eviction',
      not_sure: 'Multiple defenses recommended',
    }

    if (answers.primary_defense) {
      items.push({
        status: 'info',
        text: `Primary defense: ${defenseLabels[answers.primary_defense] || answers.primary_defense}.`,
      })
    }

    // Service issues
    if (
      answers.service_method === 'just_mail' ||
      answers.service_method === 'never_received'
    ) {
      items.push({
        status: 'info',
        text: 'Potential service defect — challenge jurisdiction under RPAPL §735.',
      })
    }

    // Security deposit counterclaim
    if (answers.security_deposit_issue === 'yes') {
      items.push({
        status: 'info',
        text: 'Security deposit violation — potential counterclaim under GOL §7-108.',
      })
    }

    // Financial hardship / rental assistance
    if (answers.financial_hardship === 'yes') {
      items.push({
        status: 'needed',
        text: 'Apply for emergency rental assistance immediately (CityFHEPS, One-Shot Deal, or local DSS).',
      })
    }

    // Court papers
    if (answers.have_court_papers === 'yes') {
      items.push({ status: 'done', text: 'You have the court papers (petition and notice of petition).' })
    } else if (answers.have_court_papers === 'no') {
      items.push({
        status: 'needed',
        text: 'Obtain petition and notice of petition from the court clerk.',
      })
    }

    // Court date
    if (answers.know_court_date === 'yes') {
      items.push({ status: 'done', text: 'You know your court date.' })
    } else if (answers.know_court_date === 'no') {
      items.push({
        status: 'needed',
        text: 'Determine your court date — check papers or call the court clerk.',
      })
    }

    // Action items
    items.push({
      status: 'needed',
      text: 'File your answer with ALL affirmative defenses before your court date. Appear in court — do not default.',
    })

    items.push({
      status: 'needed',
      text: 'Bring to court: lease, rent receipts, photos of conditions, complaint records, any notices from landlord.',
    })

    return items
  },
}
