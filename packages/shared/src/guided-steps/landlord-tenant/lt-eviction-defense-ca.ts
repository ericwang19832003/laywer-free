import type { GuidedStepConfig } from '../types'

export const ltEvictionDefenseCaConfig: GuidedStepConfig = {
  title: 'California Eviction Defense Guide',
  reassurance:
    'Being served with an eviction lawsuit is scary, but California law gives tenants strong protections. You have the right to fight back, and many evictions are dismissed because landlords fail to follow proper procedures.',

  questions: [
    // === Deadline Awareness ===
    {
      id: 'response_deadline_info',
      type: 'info',
      prompt:
        'YOUR RESPONSE DEADLINE\n\nAs of January 1, 2025, you have 10 court days (excluding weekends and court holidays) to file a response after being personally served with an unlawful detainer summons and complaint (CCP \u00A71167, as amended by AB 2347).\n\nIf served by substituted service (left with someone at your home or taped to your door + mailed), you get an additional 15 calendar days from the mailing date.\n\nIf you do NOT respond in time, the landlord can get a default judgment and you lose your right to fight the eviction.\n\nFiling a response is the single most important step.',
    },
    {
      id: 'service_method',
      type: 'single_choice',
      prompt: 'How were you served with the eviction lawsuit papers?',
      helpText:
        'This determines your exact deadline. Look at the proof of service attached to your papers.',
      options: [
        { value: 'personal', label: 'Personally handed to me' },
        { value: 'substituted', label: 'Left with someone at my home or posted on door + mailed' },
        { value: 'not_yet_served', label: 'I have not been served yet (only received a notice)' },
        { value: 'unsure', label: 'I am not sure how I was served' },
      ],
    },
    {
      id: 'info_personal_service',
      type: 'info',
      prompt:
        'You have 10 court days from the date you were personally served to file your response (CCP \u00A71167). Court days exclude weekends and court holidays. Count carefully and mark the deadline on your calendar.',
      showIf: (answers) => answers.service_method === 'personal',
    },
    {
      id: 'info_substituted_service',
      type: 'info',
      prompt:
        'With substituted service, you have 10 court days PLUS 15 additional calendar days from the date the papers were mailed to you (CCP \u00A71167). This gives you more time, but do not wait \u2014 start preparing your answer immediately.',
      showIf: (answers) => answers.service_method === 'substituted',
    },
    {
      id: 'info_not_yet_served',
      type: 'info',
      prompt:
        'If you have only received a notice (3-day, 30-day, 60-day, or 90-day) but no court papers, the lawsuit has not been filed yet. Use this time to prepare. Once you are served with the Summons and Complaint, your 10 court-day clock starts.\n\nDo NOT move out just because you received a notice \u2014 a notice is not a court order.',
      showIf: (answers) => answers.service_method === 'not_yet_served',
    },

    // === Notice Type ===
    {
      id: 'notice_type',
      type: 'single_choice',
      prompt: 'What type of notice did your landlord give you before filing the lawsuit?',
      helpText:
        'The landlord must serve a proper written notice before filing an unlawful detainer. The type of notice determines your defenses.',
      options: [
        { value: 'three_day_pay', label: '3-Day Notice to Pay Rent or Quit' },
        { value: 'three_day_cure', label: '3-Day Notice to Perform Covenants (Cure) or Quit' },
        { value: 'three_day_unconditional', label: '3-Day Unconditional Notice to Quit' },
        { value: 'thirty_day', label: '30-Day Notice to Quit' },
        { value: 'sixty_day', label: '60-Day Notice to Quit' },
        { value: 'ninety_day', label: '90-Day Notice (Section 8 housing)' },
        { value: 'no_notice', label: 'I never received a proper notice' },
        { value: 'unsure_notice', label: 'I am not sure what type of notice I received' },
      ],
    },
    {
      id: 'info_three_day_pay',
      type: 'info',
      prompt:
        '3-DAY NOTICE TO PAY RENT OR QUIT (CCP \u00A71161(2))\n\nThis notice must:\n\u2022 State the exact amount of rent owed (no late fees, utilities, or other charges)\n\u2022 Include the name, phone number, and address where rent can be paid\n\u2022 Be served properly (in person, by posting + mailing, or substituted service)\n\u2022 Give you 3 days to pay (excluding weekends and court holidays)\n\nCommon defects that can get the case dismissed:\n\u2022 Amount includes charges other than rent\n\u2022 Amount is wrong (even by $1)\n\u2022 Missing payment address or contact info\n\u2022 Not properly served\n\u2022 Did not wait the full 3 days before filing',
      showIf: (answers) => answers.notice_type === 'three_day_pay',
    },
    {
      id: 'info_three_day_cure',
      type: 'info',
      prompt:
        '3-DAY NOTICE TO PERFORM COVENANTS OR QUIT (CCP \u00A71161(3))\n\nThis notice is used for lease violations that can be fixed (e.g., unauthorized pet, unauthorized occupant). It must:\n\u2022 Clearly describe the violation\n\u2022 Give you 3 days to fix it or move out\n\u2022 Be served properly\n\nIf the violation is vague or you cured it within 3 days, the eviction may be dismissed.',
      showIf: (answers) => answers.notice_type === 'three_day_cure',
    },
    {
      id: 'info_thirty_sixty_day',
      type: 'info',
      prompt:
        'NO-FAULT NOTICE TO QUIT\n\n\u2022 30-day notice: For month-to-month tenancies of less than 1 year (Civ. Code \u00A71946.1)\n\u2022 60-day notice: For tenancies of 1 year or more (Civ. Code \u00A71946.1)\n\nIMPORTANT: If you are covered by the Tenant Protection Act (AB 1482), your landlord CANNOT use a no-fault notice without just cause AND must pay relocation assistance equal to one month\u2019s rent. If the notice does not include a just cause reason or relocation offer, it may be invalid.',
      showIf: (answers) =>
        answers.notice_type === 'thirty_day' || answers.notice_type === 'sixty_day',
    },
    {
      id: 'info_no_notice',
      type: 'info',
      prompt:
        'NO NOTICE RECEIVED \u2014 STRONG DEFENSE\n\nCalifornia law requires the landlord to serve a proper written notice before filing an unlawful detainer lawsuit (CCP \u00A71161). If no notice was served, or the notice was defective, the entire case can be dismissed.\n\nRaise this in your Answer as a defense: "Plaintiff failed to serve a valid notice to quit as required by CCP \u00A71161."',
      showIf: (answers) => answers.notice_type === 'no_notice',
    },

    // === AB 1482 / Just Cause ===
    {
      id: 'tenancy_length',
      type: 'single_choice',
      prompt: 'How long have you lived in this unit?',
      helpText:
        'Under AB 1482, just cause protections apply after 12 months of tenancy (or 24 months if all tenants moved in at different times).',
      options: [
        { value: 'less_than_12', label: 'Less than 12 months' },
        { value: '12_to_24', label: '12 to 24 months' },
        { value: 'more_than_24', label: 'More than 24 months' },
      ],
    },
    {
      id: 'property_type',
      type: 'single_choice',
      prompt: 'What type of property do you rent?',
      helpText:
        'AB 1482 covers most rental properties, but some are exempt.',
      options: [
        { value: 'apartment', label: 'Apartment or multi-unit building' },
        { value: 'single_family', label: 'Single-family home' },
        { value: 'condo', label: 'Condo or townhome' },
        { value: 'room_in_house', label: 'Room in a house where the owner lives' },
        { value: 'subsidized', label: 'Subsidized / Section 8 housing' },
        { value: 'unsure_property', label: 'I am not sure' },
      ],
    },
    {
      id: 'ab1482_info',
      type: 'info',
      prompt:
        'TENANT PROTECTION ACT (AB 1482) \u2014 JUST CAUSE REQUIRED\n\nIf you have lived in your unit for 12+ months and your property is covered by AB 1482, your landlord MUST have "just cause" to evict you. The law expires January 1, 2030.\n\nAt-fault just causes include: nonpayment of rent, material lease violation, nuisance, criminal activity, refusal to sign a similar lease renewal, unauthorized subletting, refusal to allow lawful entry.\n\nNo-fault just causes include: owner move-in, substantial remodel, withdrawal from rental market, government order to vacate. For no-fault evictions, the landlord MUST provide relocation assistance equal to one month\u2019s rent.\n\nExemptions: Owner-occupied duplexes, single-family homes owned by natural persons (if proper notice of exemption was given), housing built within the last 15 years, and units where the owner shares a bathroom or kitchen with the tenant.\n\nIf your landlord did not state a just cause reason on the notice, raise this defense in your Answer.',
      showIf: (answers) =>
        answers.tenancy_length === '12_to_24' || answers.tenancy_length === 'more_than_24',
    },

    // === Rent Control ===
    {
      id: 'rent_control_city',
      type: 'single_choice',
      prompt: 'Do you live in a city with its own rent control ordinance?',
      helpText:
        'Local rent control laws often provide ADDITIONAL protections beyond AB 1482, including stricter just cause requirements and relocation assistance.',
      options: [
        { value: 'los_angeles', label: 'Los Angeles' },
        { value: 'san_francisco', label: 'San Francisco' },
        { value: 'oakland', label: 'Oakland' },
        { value: 'berkeley', label: 'Berkeley' },
        { value: 'san_jose', label: 'San Jose' },
        { value: 'santa_monica', label: 'Santa Monica' },
        { value: 'west_hollywood', label: 'West Hollywood' },
        { value: 'other_rent_control', label: 'Another city with rent control' },
        { value: 'no_local', label: 'No local rent control (state law AB 1482 only)' },
        { value: 'dont_know', label: 'I do not know' },
      ],
    },
    {
      id: 'info_rent_control',
      type: 'info',
      prompt:
        'LOCAL RENT CONTROL \u2014 ADDITIONAL PROTECTIONS\n\nYour city\u2019s rent control ordinance may provide protections beyond state law, including:\n\u2022 Stricter just cause eviction requirements\n\u2022 Higher relocation payments\n\u2022 Protections for seniors, disabled tenants, and long-term residents\n\u2022 Mandatory mediation before eviction\n\u2022 Right to counsel (San Francisco guarantees a lawyer for tenants)\n\nCheck with your local rent board or tenant rights organization. Violating local rent control is an additional defense you can raise.\n\nKey rent boards:\n\u2022 LA: LAHD Housing \u2014 housing.lacity.gov\n\u2022 SF: SF Rent Board \u2014 sf.gov/rent-board\n\u2022 Oakland: Rent Adjustment Program \u2014 oaklandca.gov/RAP\n\u2022 Berkeley: Rent Board \u2014 cityofberkeley.info/rent\n\u2022 Santa Monica: Rent Control Board \u2014 smgov.net/rentcontrol',
      showIf: (answers) =>
        answers.rent_control_city !== 'no_local' &&
        answers.rent_control_city !== 'dont_know' &&
        !!answers.rent_control_city,
    },

    // === Habitability Defense ===
    {
      id: 'habitability_issues',
      type: 'yes_no',
      prompt: 'Does your rental unit have serious maintenance or habitability problems?',
      helpText:
        'Examples: no hot water, broken heating, mold, pest infestation, leaking roof, no working plumbing, broken windows, lead paint, exposed wiring.',
    },
    {
      id: 'info_habitability',
      type: 'info',
      prompt:
        'HABITABILITY DEFENSE (Civ. Code \u00A71941\u20131942.5, Green v. Superior Court (1974))\n\nCalifornia law requires landlords to maintain rental units in habitable condition. If your landlord failed to maintain the property, you can raise this as an affirmative defense AND a counterclaim for damages.\n\nThe implied warranty of habitability covers:\n\u2022 Effective waterproofing and weather protection\n\u2022 Working plumbing and hot/cold water\n\u2022 Heating facilities in good working order\n\u2022 Electrical lighting and wiring\n\u2022 Clean and sanitary buildings and grounds\n\u2022 Adequate trash receptacles\n\u2022 Floors, stairways, and railings in good repair\n\u2022 Working locks and deadbolts on doors and windows\n\u2022 No lead paint, mold, or pest infestations\n\nTo use this defense:\n1. You must have notified the landlord of the problems (in writing is best)\n2. The landlord must have had reasonable time to fix them\n3. The problems must be serious enough to affect habitability\n4. Document everything with photos, videos, and dated written complaints\n\nThis defense can reduce or eliminate the rent you owe.',
      showIf: (answers) => answers.habitability_issues === 'yes',
    },

    // === Retaliation Defense ===
    {
      id: 'retaliation',
      type: 'yes_no',
      prompt:
        'Did you do any of the following within 180 days before receiving the eviction notice: complain to the landlord about repairs, report code violations, contact a government agency, organize with other tenants, or exercise any legal right?',
      helpText:
        'California Civil Code \u00A71942.5 protects tenants from retaliation for exercising their rights.',
    },
    {
      id: 'info_retaliation',
      type: 'info',
      prompt:
        'RETALIATORY EVICTION DEFENSE (Civ. Code \u00A71942.5)\n\nIt is illegal for a landlord to evict you in retaliation for:\n\u2022 Complaining about habitability issues\n\u2022 Reporting code violations to a government agency\n\u2022 Exercising rights under the lease or law\n\u2022 Organizing or participating in a tenant organization\n\u2022 Lawfully withholding rent after giving proper notice of defective conditions\n\nIf the eviction was filed within 180 days of your protected activity, the law presumes it is retaliatory and the landlord must prove otherwise.\n\nTo strengthen this defense, gather:\n\u2022 Copies of your written complaints to the landlord\n\u2022 Dates of any code enforcement inspections\n\u2022 Communications showing the timeline\n\u2022 Witness statements from other tenants\n\nA proven retaliation defense entitles you to actual damages, punitive damages of $100\u2013$2,000 per violation, and attorney fees.',
      showIf: (answers) => answers.retaliation === 'yes',
    },

    // === Primary Defense Selection ===
    {
      id: 'primary_defense',
      type: 'single_choice',
      prompt: 'What is your primary defense?',
      helpText:
        'You can raise multiple defenses in your Answer. Select the strongest one here.',
      options: [
        { value: 'paid_rent', label: 'I paid the rent owed' },
        { value: 'defective_notice', label: 'The notice was defective or improperly served' },
        { value: 'no_just_cause', label: 'No just cause reason given (AB 1482)' },
        { value: 'habitability', label: 'Uninhabitable conditions / landlord failed to repair' },
        { value: 'retaliation', label: 'Eviction is retaliatory' },
        { value: 'discrimination', label: 'Eviction is discriminatory' },
        { value: 'rent_control_violation', label: 'Landlord violated local rent control rules' },
        { value: 'covid_debt', label: 'Unpaid rent is from COVID-19 protected period' },
        { value: 'not_sure', label: 'I am not sure yet' },
      ],
    },
    {
      id: 'info_defense_paid',
      type: 'info',
      prompt:
        'DEFENSE: RENT WAS PAID\n\nIf you paid the full rent owed within the notice period, the eviction must be dismissed. Gather ALL proof:\n\u2022 Bank statements showing transfers\n\u2022 Canceled checks (front and back)\n\u2022 Money order receipts\n\u2022 Venmo, Zelle, or Cash App records\n\u2022 Written receipts from landlord\n\u2022 Witness testimony\n\nBring originals and copies to court.',
      showIf: (answers) => answers.primary_defense === 'paid_rent',
    },
    {
      id: 'info_defense_defective_notice',
      type: 'info',
      prompt:
        'DEFENSE: DEFECTIVE NOTICE\n\nCommon notice defects that can get the case dismissed:\n\u2022 Wrong amount of rent claimed on 3-day notice\n\u2022 Includes late fees, utilities, or other non-rent charges\n\u2022 Missing required contact information for payment\n\u2022 Not served properly (must be personal, substituted, or posting + mailing)\n\u2022 Landlord did not wait full notice period before filing\n\u2022 Notice not in the language required (if lease was negotiated in another language)\n\u2022 30/60-day notice used without just cause when AB 1482 applies\n\nA defective notice is a complete defense \u2014 the court must dismiss the case even if you owe rent.',
      showIf: (answers) => answers.primary_defense === 'defective_notice',
    },
    {
      id: 'info_defense_no_just_cause',
      type: 'info',
      prompt:
        'DEFENSE: NO JUST CAUSE (AB 1482)\n\nIf you have lived in your unit 12+ months and your property is covered by AB 1482, the landlord must state a specific just cause on the termination notice.\n\nIf no just cause was stated, or the stated cause is pretextual (not the real reason), raise this defense:\n"The termination notice fails to state a just cause for eviction as required by Civil Code \u00A71946.2, and is therefore void."\n\nThe landlord bears the burden of proving just cause at trial.',
      showIf: (answers) => answers.primary_defense === 'no_just_cause',
    },
    {
      id: 'info_defense_discrimination',
      type: 'info',
      prompt:
        'DEFENSE: DISCRIMINATION\n\nThe Fair Housing Act and California\u2019s Fair Employment and Housing Act (FEHA) prohibit evictions based on race, color, national origin, religion, sex, sexual orientation, gender identity, familial status, disability, marital status, source of income (including Section 8), or veteran/military status.\n\nFile a complaint with:\n\u2022 California Civil Rights Department (CRD): calcivilrights.ca.gov\n\u2022 HUD: hud.gov/fairhousing\n\nA pending discrimination complaint can strengthen your eviction defense.',
      showIf: (answers) => answers.primary_defense === 'discrimination',
    },
    {
      id: 'info_defense_covid',
      type: 'info',
      prompt:
        'COVID-19 RENT DEBT PROTECTIONS\n\nCalifornia\u2019s statewide COVID eviction moratorium expired June 30, 2022. However, limited protections remain:\n\n\u2022 Rent owed March 1, 2020 \u2013 August 31, 2020: Cannot be the basis for eviction if you submitted a Declaration of COVID-19 Financial Distress\n\u2022 Rent owed September 1, 2020 \u2013 September 30, 2021: Protected if you submitted the declaration AND paid at least 25% of rent due during that period\n\u2022 COVID-era rent debt was converted to civil debt \u2014 it cannot be used in an unlawful detainer\n\nSome cities (e.g., Los Angeles, San Francisco) may have additional local COVID protections. Check with your local tenant rights organization.\n\nIf your eviction is based on COVID-era rent, raise this defense in your Answer.',
      showIf: (answers) => answers.primary_defense === 'covid_debt',
    },
    {
      id: 'info_defense_unsure',
      type: 'info',
      prompt:
        'NOT SURE OF YOUR DEFENSE \u2014 THAT IS OKAY\n\nFile your Answer with a General Denial and list every possible affirmative defense. You can narrow your defense later. Common affirmative defenses to include:\n\n1. Defective notice\n2. Improper service\n3. Failure to state just cause (AB 1482)\n4. Breach of warranty of habitability\n5. Retaliatory eviction\n6. Discriminatory eviction\n7. Waiver (landlord accepted rent after notice)\n8. Estoppel\n9. Violation of local rent control\n10. Failure to provide relocation assistance for no-fault eviction\n\nList them all \u2014 you can always drop defenses that do not apply, but you cannot add defenses you did not raise in your Answer.',
      showIf: (answers) => answers.primary_defense === 'not_sure',
    },

    // === Security Deposit ===
    {
      id: 'security_deposit_issue',
      type: 'yes_no',
      prompt: 'Has your landlord improperly withheld your security deposit or used it for rent?',
      helpText:
        'Under Civil Code \u00A71950.5, a security deposit can only be used for unpaid rent, cleaning, and repair of damages beyond normal wear. As of 2025, deposits are capped at 1 month\u2019s rent (with limited exceptions).',
    },
    {
      id: 'info_security_deposit',
      type: 'info',
      prompt:
        'SECURITY DEPOSIT COUNTERCLAIM (Civ. Code \u00A71950.5)\n\nYou may have a counterclaim if your landlord:\n\u2022 Kept your deposit without providing an itemized statement within 21 days\n\u2022 Charged for normal wear and tear\n\u2022 Failed to take pre-move-out photos (required after April 1, 2025)\n\u2022 Charged for carpet cleaning not reasonably necessary\n\u2022 Collected more than 1 month\u2019s rent as deposit (AB 12)\n\nPenalties: Up to 2x the deposit amount, or 3x if the landlord acted in bad faith.\n\nYou can raise this as a counterclaim in your unlawful detainer Answer.',
      showIf: (answers) => answers.security_deposit_issue === 'yes',
    },

    // === Fee Waiver ===
    {
      id: 'can_afford_fees',
      type: 'yes_no',
      prompt: 'Can you afford the court filing fees?',
      helpText:
        'Filing an Answer costs approximately $225 (Limited Civil) to $435 (Unlimited Civil). If you cannot afford this, you can request a fee waiver.',
    },
    {
      id: 'info_fee_waiver',
      type: 'info',
      prompt:
        'FEE WAIVER (Form FW-001)\n\nIf you cannot afford filing fees, fill out and file Judicial Council Form FW-001 (Request to Waive Court Fees) along with your Answer. You qualify if:\n\u2022 You receive public benefits (Medi-Cal, CalWORKs, SSI, SNAP, etc.)\n\u2022 Your household income is below 125% of the federal poverty level\n\u2022 You cannot pay court fees and still meet basic needs\n\nThe fee waiver covers filing fees, jury fees, and other court costs. You have a right to a jury trial even with a fee waiver \u2014 file Form FW-002 to waive the $150 jury deposit.\n\nFile FW-001 at the same time as your Answer.',
      showIf: (answers) => answers.can_afford_fees === 'no',
    },

    // === Jury Trial ===
    {
      id: 'want_jury_trial',
      type: 'yes_no',
      prompt: 'Do you want to request a jury trial?',
      helpText:
        'You have a constitutional right to a jury trial in an unlawful detainer case (CCP \u00A71171). A jury trial often favors tenants because landlords must convince all 12 jurors. It also delays the process, giving you more time.',
    },
    {
      id: 'info_jury_trial',
      type: 'info',
      prompt:
        'RIGHT TO JURY TRIAL (CCP \u00A71171, \u00A71170.5)\n\nKey facts about requesting a jury trial:\n\u2022 You must post a $150 jury fee deposit at least 5 days before trial (CCP \u00A7631) \u2014 unless you have a fee waiver\n\u2022 Request the jury trial in your Answer or by separate written demand\n\u2022 The case must be set for trial within 20 days of the first request (CCP \u00A71170.5(a))\n\u2022 A jury trial requires the landlord to convince all 12 jurors\n\u2022 Jury trials typically take longer, giving you more time to prepare\n\nStrategic advantage: Many landlord attorneys prefer bench trials. A jury of your peers may be more sympathetic to your situation.',
      showIf: (answers) => answers.want_jury_trial === 'yes',
    },

    // === Filing Instructions ===
    {
      id: 'filing_instructions',
      type: 'info',
      prompt:
        'HOW TO FILE YOUR ANSWER\n\n1. Use Judicial Council Form UD-105 (Answer \u2014 Unlawful Detainer)\n2. Check "General Denial" to deny all allegations\n3. List ALL affirmative defenses (habitability, retaliation, defective notice, no just cause, etc.)\n4. If applicable, file a counterclaim for damages (habitability, security deposit, retaliation)\n5. File with the court clerk \u2014 in person, by mail, or e-file\n6. Serve a copy on the landlord\u2019s attorney by mail (add 5 days per CCP \u00A71013)\n7. Keep a file-stamped copy for your records\n\nFiling fees: ~$225 (Limited Civil) or ~$435 (Unlimited Civil). File Form FW-001 if you need a fee waiver.\n\nDEADLINE: 10 court days from personal service. DO NOT MISS THIS.\n\nFree legal help:\n\u2022 Your county\u2019s Self-Help Center at the courthouse\n\u2022 Legal Aid \u2014 lawhelpca.org\n\u2022 Bay Area Legal Aid, LAFLA, Bet Tzedek, Public Counsel\n\u2022 Tenant rights hotlines (check 211.org for your area)',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Service and deadline
    const serviceLabels: Record<string, string> = {
      personal: 'Personally served \u2014 10 court days to respond.',
      substituted: 'Substituted service \u2014 10 court days + 15 calendar days to respond.',
      not_yet_served: 'Not yet served with lawsuit papers.',
      unsure: 'Service method unclear \u2014 determine how you were served.',
    }
    if (answers.service_method) {
      items.push({
        status: answers.service_method === 'not_yet_served' ? 'info' : 'needed',
        text: serviceLabels[answers.service_method] ?? 'Determine your service date and deadline.',
      })
    }

    // Notice type
    const noticeLabels: Record<string, string> = {
      three_day_pay: '3-Day Notice to Pay Rent or Quit',
      three_day_cure: '3-Day Notice to Perform Covenants or Quit',
      three_day_unconditional: '3-Day Unconditional Notice to Quit',
      thirty_day: '30-Day Notice to Quit',
      sixty_day: '60-Day Notice to Quit',
      ninety_day: '90-Day Notice (Section 8)',
      no_notice: 'No proper notice received \u2014 strong defense',
      unsure_notice: 'Notice type unclear',
    }
    if (answers.notice_type) {
      items.push({
        status: answers.notice_type === 'no_notice' ? 'info' : 'info',
        text: `Notice type: ${noticeLabels[answers.notice_type] ?? answers.notice_type}.`,
      })
    }

    // AB 1482 / Just cause
    if (
      answers.tenancy_length === '12_to_24' ||
      answers.tenancy_length === 'more_than_24'
    ) {
      items.push({
        status: 'info',
        text: 'AB 1482 just cause protections likely apply. Verify landlord stated a valid just cause reason.',
      })
    }

    // Rent control
    if (
      answers.rent_control_city &&
      answers.rent_control_city !== 'no_local' &&
      answers.rent_control_city !== 'dont_know'
    ) {
      items.push({
        status: 'needed',
        text: 'Check local rent control ordinance for additional protections and contact your rent board.',
      })
    }

    // Habitability
    if (answers.habitability_issues === 'yes') {
      items.push({
        status: 'needed',
        text: 'Document all habitability issues with photos, videos, and written complaints. This is both a defense and a potential counterclaim.',
      })
    }

    // Retaliation
    if (answers.retaliation === 'yes') {
      items.push({
        status: 'needed',
        text: 'Gather evidence of protected activity and timeline showing retaliation (Civ. Code \u00A71942.5).',
      })
    }

    // Primary defense
    const defenseLabels: Record<string, string> = {
      paid_rent: 'Primary defense: Rent was paid \u2014 gather all proof of payment.',
      defective_notice: 'Primary defense: Defective notice \u2014 review notice for errors.',
      no_just_cause: 'Primary defense: No just cause stated (AB 1482).',
      habitability: 'Primary defense: Breach of warranty of habitability.',
      retaliation: 'Primary defense: Retaliatory eviction.',
      discrimination: 'Primary defense: Discriminatory eviction \u2014 file complaint with CRD or HUD.',
      rent_control_violation: 'Primary defense: Local rent control violation.',
      covid_debt: 'Primary defense: COVID-era rent debt protections apply.',
      not_sure: 'Defense not yet identified \u2014 file General Denial with all possible affirmative defenses.',
    }
    if (answers.primary_defense) {
      items.push({
        status: answers.primary_defense === 'not_sure' ? 'needed' : 'info',
        text: defenseLabels[answers.primary_defense] ?? 'Review your available defenses.',
      })
    }

    // Security deposit
    if (answers.security_deposit_issue === 'yes') {
      items.push({
        status: 'needed',
        text: 'Potential security deposit counterclaim (Civ. Code \u00A71950.5). Gather deposit records and any itemized statements.',
      })
    }

    // Fee waiver
    if (answers.can_afford_fees === 'no') {
      items.push({
        status: 'needed',
        text: 'File Fee Waiver (Form FW-001) with your Answer. File FW-002 if requesting jury trial.',
      })
    }

    // Jury trial
    if (answers.want_jury_trial === 'yes') {
      items.push({
        status: 'needed',
        text: 'Request jury trial in your Answer. Post $150 jury fee 5 days before trial (or use fee waiver).',
      })
    }

    // Always include filing reminder
    items.push({
      status: 'needed',
      text: 'File Answer (Form UD-105) within your deadline. Serve a copy on the landlord\u2019s attorney. Keep a file-stamped copy.',
    })

    return items
  },
}
