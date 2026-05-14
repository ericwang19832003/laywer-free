import type { GuidedStepConfig } from '../types'

export const ltEvictionDefensePaConfig: GuidedStepConfig = {
  title: 'Pennsylvania Eviction Defense Guide',
  reassurance:
    'Pennsylvania has strong tenant protections. Understanding your rights and the landlord\'s obligations can make the difference between keeping and losing your home.',

  questions: [
    // === Overview ===
    {
      id: 'pa_overview',
      type: 'info',
      prompt:
        'PENNSYLVANIA EVICTION DEFENSE — PRO SE TENANT GUIDE\n\nEviction in Pennsylvania is governed by the Landlord and Tenant Act of 1951 (68 P.S. \u00A7\u00A7 250.101\u2013250.602). Landlords CANNOT use "self-help" eviction \u2014 changing locks, shutting off utilities, or removing belongings is ILLEGAL. All evictions must go through Magisterial District Court.\n\nKey protections:\n\u2022 Right to proper written notice before any filing\n\u2022 Right to cure nonpayment at any time before physical eviction\n\u2022 Right to appeal to Court of Common Pleas for a brand-new trial\n\u2022 Implied warranty of habitability defense\n\u2022 Retaliatory eviction prohibition\n\u2022 Rent escrow option for uninhabitable conditions\n\u2022 Wage garnishment limited to 10% of net wages (42 Pa.C.S.A. \u00A78127)',
    },

    // === Eviction Reason ===
    {
      id: 'eviction_reason',
      type: 'single_choice',
      prompt: 'What reason did the landlord give for the eviction?',
      options: [
        { value: 'nonpayment', label: 'Nonpayment of rent' },
        { value: 'lease_violation', label: 'Lease violation (other than rent)' },
        { value: 'end_of_lease', label: 'End of lease term / non-renewal' },
        { value: 'month_to_month', label: 'Ending a month-to-month tenancy' },
        { value: 'illegal_activity', label: 'Alleged illegal activity' },
        { value: 'no_reason', label: 'No reason given' },
        { value: 'unsure', label: 'I am not sure' },
      ],
    },

    // === Notice Requirements by Reason ===
    {
      id: 'nonpayment_notice_info',
      type: 'info',
      prompt:
        'NONPAYMENT OF RENT \u2014 10-Day Notice Required (68 P.S. \u00A7250.501(b))\n\nThe landlord must serve a written "Notice to Quit" giving you 10 days to either pay or vacate. The notice must:\n\u2022 Be in writing\n\u2022 Specify the amount of rent owed\n\u2022 Be served personally, posted conspicuously on the premises, or left at the principal building\n\nCRITICAL DEFENSE: You can STOP the eviction at ANY TIME before the constable physically removes you by paying all rent in arrears plus court costs (68 P.S. \u00A7250.501(b)). This right exists even after a judgment for possession is entered.\n\nNote: Your lease may waive or shorten the notice period. Check your lease carefully.',
      showIf: (answers) => answers.eviction_reason === 'nonpayment',
    },
    {
      id: 'lease_violation_notice_info',
      type: 'info',
      prompt:
        'LEASE VIOLATION \u2014 15-Day Notice Required (68 P.S. \u00A7250.501(b))\n\nFor lease violations other than nonpayment, the landlord must give 15 days\u2019 written notice to quit for a lease of one year or less (or an indeterminate term). For leases over one year, 30 days\u2019 notice is required.\n\nDefense check:\n\u2022 Was the notice in writing?\n\u2022 Did it specify the alleged violation?\n\u2022 Did it give the full required notice period?\n\u2022 Was the violation actually a breach of a material lease term?\n\u2022 Have you cured the violation? (Some violations can be remedied before the notice expires)',
      showIf: (answers) => answers.eviction_reason === 'lease_violation',
    },
    {
      id: 'end_of_lease_notice_info',
      type: 'info',
      prompt:
        'END OF LEASE \u2014 15 or 30-Day Notice Required (68 P.S. \u00A7250.501(b))\n\nIf your lease has expired:\n\u2022 Lease of one year or less / indeterminate term: 15-day written notice\n\u2022 Lease for more than one year: 30-day written notice\n\nIf you are in Philadelphia, "Good Cause" eviction protections may apply \u2014 the landlord must have a valid reason even at the end of a lease term.',
      showIf: (answers) => answers.eviction_reason === 'end_of_lease',
    },
    {
      id: 'month_to_month_notice_info',
      type: 'info',
      prompt:
        'MONTH-TO-MONTH TENANCY \u2014 15-Day Notice Required\n\nMonth-to-month tenancies are considered leases for an indeterminate term, so the landlord must provide at least 15 days\u2019 written notice.\n\nIf you are in Philadelphia, the Good Cause Eviction Ordinance requires the landlord to show a valid reason for termination \u2014 they cannot end a month-to-month tenancy without cause.',
      showIf: (answers) => answers.eviction_reason === 'month_to_month',
    },

    // === Notice Received Check ===
    {
      id: 'received_notice',
      type: 'yes_no',
      prompt: 'Did the landlord give you a written Notice to Quit before filing in court?',
      helpText:
        'This is a written notice telling you to vacate within a specific number of days. It is NOT the court complaint. It should have been posted on your door, hand-delivered, or left at the premises.',
    },
    {
      id: 'no_notice_defense',
      type: 'info',
      prompt:
        'POWERFUL DEFENSE: No Written Notice to Quit\n\nIf the landlord filed the complaint without first giving you a proper written Notice to Quit, the case may be dismissed. The Notice to Quit is a MANDATORY prerequisite under 68 P.S. \u00A7250.501.\n\nAt the hearing, tell the judge: "I did not receive a written Notice to Quit as required by the Landlord and Tenant Act. The complaint should be dismissed for failure to comply with the statutory notice requirement."\n\nThe landlord bears the burden of proving proper notice was given.',
      showIf: (answers) => answers.received_notice === 'no',
    },

    // === Case Stage ===
    {
      id: 'case_stage',
      type: 'single_choice',
      prompt: 'Where are you in the eviction process?',
      options: [
        { value: 'notice_only', label: 'I only received a Notice to Quit (no court papers yet)' },
        { value: 'complaint_filed', label: 'The landlord filed a complaint \u2014 I have a hearing date' },
        { value: 'judgment_entered', label: 'A judgment for possession was already entered against me' },
        { value: 'order_possession', label: 'I received an Order for Possession (lockout notice)' },
      ],
    },
    {
      id: 'notice_only_info',
      type: 'info',
      prompt:
        'You are in the earliest stage. The landlord has NOT yet filed in court. You have time to:\n\n1. CURE the issue (pay rent, fix the violation) before the notice period expires\n2. Negotiate with the landlord\n3. Contact a legal aid organization for help\n4. Document any habitability issues for a potential defense\n5. If in Philadelphia, contact the Eviction Diversion Program\n\nIf you pay all rent owed (for nonpayment cases), the landlord CANNOT proceed with the eviction.',
      showIf: (answers) => answers.case_stage === 'notice_only',
    },
    {
      id: 'complaint_filed_info',
      type: 'info',
      prompt:
        'COMPLAINT FILED \u2014 Hearing Scheduled\n\nThe Magisterial District Court hearing will be scheduled 7\u201315 days from the filing date. A constable or sheriff must serve you with the complaint at least 5 days before the hearing.\n\nCRITICAL:\n\u2022 YOU MUST APPEAR AT THE HEARING. If you are even a few minutes late, the judge may enter a default judgment against you.\n\u2022 Bring all evidence: lease, receipts, photos, repair requests, communications with landlord.\n\u2022 You do NOT need to file a formal written answer in Magisterial District Court \u2014 you present your defense orally at the hearing.\n\u2022 The judge will decide that day or within 3 days.',
      showIf: (answers) => answers.case_stage === 'complaint_filed',
    },
    {
      id: 'judgment_entered_info',
      type: 'info',
      prompt:
        'JUDGMENT ENTERED \u2014 You Have 10 Days to Appeal\n\nYou can appeal to the Court of Common Pleas within 10 days of the judgment. The appeal gives you a DE NOVO trial \u2014 a completely new hearing as if the first one never happened.\n\nTo appeal:\n1. File a Notice of Appeal with the Court of Common Pleas within 10 DAYS\n2. Pay the filing fee (or file an In Forma Pauperis petition if you cannot afford it)\n3. Post a supersedeas bond to stop the eviction while the appeal is pending\n\nSUPERSEDEAS BOND: You must deposit the LESSER of 3 months\u2019 rent OR the actual rent in arrears. If you cannot afford this, you can sign a poverty affidavit (In Forma Pauperis) and deposit only 1/3 of one month\u2019s rent, then pay the remaining 2/3 within 20 days, then continue monthly payments.\n\nDO NOT MISS THE 10-DAY DEADLINE \u2014 it is strict and cannot be extended.',
      showIf: (answers) => answers.case_stage === 'judgment_entered',
    },
    {
      id: 'order_possession_info',
      type: 'info',
      prompt:
        'ORDER FOR POSSESSION \u2014 Last Chance\n\nThe landlord waited at least 10 days after the judgment before requesting this order. A constable will deliver it, giving you notice to vacate.\n\nEven at this stage, for NONPAYMENT cases, you can STOP the eviction by paying all rent in arrears plus all court costs to the constable or executing officer BEFORE the actual physical lockout occurs (68 P.S. \u00A7250.501(b)).\n\nIf the 10-day appeal window has passed and you did not appeal, your options are very limited. Contact legal aid immediately.',
      showIf: (answers) => answers.case_stage === 'order_possession',
    },

    // === Philadelphia Check ===
    {
      id: 'in_philadelphia',
      type: 'yes_no',
      prompt: 'Is your rental property located in Philadelphia?',
      helpText:
        'Philadelphia has additional tenant protections not available in other PA counties.',
    },
    {
      id: 'philadelphia_protections',
      type: 'info',
      prompt:
        'PHILADELPHIA-SPECIFIC PROTECTIONS\n\n1. EVICTION DIVERSION PROGRAM (mandatory since 2024)\nLandlords must participate in out-of-court mediation BEFORE filing an eviction. If your landlord skipped this, the case may be dismissed.\n\n2. RIGHT TO COUNSEL\nLow-income tenants in eligible ZIP codes have the RIGHT to a free attorney for eviction cases. Contact Community Legal Services (CLS) at 215-981-3700 or Philadelphia Legal Assistance at 215-981-3800.\n\n3. GOOD CAUSE EVICTION ORDINANCE\nFor leases under one year (including month-to-month), the landlord must show "good cause" to evict \u2014 they cannot simply refuse to renew without a valid reason. Good cause includes: habitual nonpayment, material lease breach, nuisance activity, substantial property damage, or the landlord/family moving in.\n\n4. Mark your hearing date and arrive EARLY. In Philadelphia, 2.8% of represented tenants receive default judgments vs. 38.7% of unrepresented tenants.',
      showIf: (answers) => answers.in_philadelphia === 'yes',
    },

    // === Defenses ===
    {
      id: 'defenses_header',
      type: 'info',
      prompt:
        'AVAILABLE DEFENSES FOR PA TENANTS\n\nSelect the defense that best applies to your situation. You can raise MULTIPLE defenses at the hearing.',
    },
    {
      id: 'primary_defense',
      type: 'single_choice',
      prompt: 'Which primary defense applies to your situation?',
      options: [
        { value: 'habitability', label: 'The property has serious repair issues (habitability)' },
        { value: 'retaliation', label: 'The eviction is retaliation for complaints I made' },
        { value: 'improper_notice', label: 'The landlord did not give proper notice' },
        { value: 'rent_paid', label: 'I already paid the rent they claim is owed' },
        { value: 'amount_wrong', label: 'The amount they claim I owe is incorrect' },
        { value: 'discrimination', label: 'The eviction is discriminatory (Fair Housing Act)' },
        { value: 'rent_escrow', label: 'I deposited rent in escrow due to conditions' },
        { value: 'security_deposit', label: 'Landlord violated security deposit rules' },
        { value: 'illegal_lockout', label: 'Landlord attempted illegal self-help eviction' },
        { value: 'not_sure', label: 'I am not sure which defense to use' },
      ],
    },

    // === Habitability Defense ===
    {
      id: 'habitability_defense',
      type: 'info',
      prompt:
        'IMPLIED WARRANTY OF HABITABILITY \u2014 Pugh v. Holmes (1979)\n\nThe PA Supreme Court held that every residential lease includes an implied warranty that the property is safe, sanitary, and fit for human habitation. This warranty CANNOT be waived in a lease.\n\nCovers serious problems including:\n\u2022 Lack of heat in winter or cooling in summer\n\u2022 Unsafe/inadequate electrical service\n\u2022 No drinkable water\n\u2022 Malfunctioning sewage\n\u2022 Serious leaks, structural problems, or vermin infestation\n\nTO USE THIS DEFENSE:\n1. You MUST have notified the landlord about the problems in writing\n2. You MUST have given the landlord a "reasonable" time to repair\n3. Bring evidence: photos, written complaints, code violation reports, text messages\n\nIf the property is certified as unfit by the appropriate municipal agency, no tenant can be evicted while rent is deposited in escrow (68 P.S. \u00A7250.505-A).',
      showIf: (answers) => answers.primary_defense === 'habitability',
    },

    // === Retaliation Defense ===
    {
      id: 'retaliation_defense',
      type: 'info',
      prompt:
        'RETALIATORY EVICTION DEFENSE (68 P.S. \u00A7250.205-a)\n\nA landlord CANNOT evict you in retaliation for:\n\u2022 Reporting code violations to the city or county\n\u2022 Exercising your rights under the warranty of habitability\n\u2022 Paying to restore/maintain utilities the landlord failed to provide\n\u2022 Joining or organizing a tenants\u2019 union\n\u2022 Complaining about housing conditions\n\nRetaliation also includes raising rent or reducing services.\n\nHOW TO PROVE IT:\n\u2022 Show the timeline: complaint to landlord/city \u2192 eviction notice shortly after\n\u2022 The closer in time, the stronger the inference of retaliation\n\u2022 Bring copies of your complaints, inspection reports, and any communications showing the landlord\u2019s reaction',
      showIf: (answers) => answers.primary_defense === 'retaliation',
    },

    // === Improper Notice Defense ===
    {
      id: 'improper_notice_defense',
      type: 'info',
      prompt:
        'IMPROPER NOTICE DEFENSE\n\nThe landlord\u2019s Notice to Quit must comply with 68 P.S. \u00A7250.501. Check for these defects:\n\n\u2022 Wrong notice period: Was it 10 days for nonpayment? 15 days for lease violation (1 year or less)? 30 days for leases over 1 year?\n\u2022 Not in writing: Verbal notice is insufficient\n\u2022 Improper service: Must be served personally, posted conspicuously on premises, or left at principal building\n\u2022 Missing information: For nonpayment, should state the amount owed\n\u2022 No notice at all: Landlord filed directly without the prerequisite notice\n\nIf the notice is defective, tell the judge: "The landlord failed to provide a proper Notice to Quit as required by 68 P.S. \u00A7250.501. I ask that the complaint be dismissed."',
      showIf: (answers) => answers.primary_defense === 'improper_notice',
    },

    // === Rent Paid Defense ===
    {
      id: 'rent_paid_defense',
      type: 'info',
      prompt:
        'RENT ALREADY PAID DEFENSE\n\nIf you paid the rent the landlord claims is owed, bring ALL evidence:\n\u2022 Bank statements showing transfers to landlord\n\u2022 Cancelled checks (front and back)\n\u2022 Money order receipts\n\u2022 Cash payment receipts (always get receipts for cash payments)\n\u2022 Text messages or emails confirming payment\n\u2022 Venmo/Zelle/CashApp transaction records\n\nRemember: For nonpayment cases, you can pay all rent in arrears plus costs AT ANY TIME before the constable physically removes you, and the eviction must stop (68 P.S. \u00A7250.501(b)).',
      showIf: (answers) => answers.primary_defense === 'rent_paid',
    },

    // === Amount Wrong Defense ===
    {
      id: 'amount_wrong_defense',
      type: 'info',
      prompt:
        'DISPUTED AMOUNT DEFENSE\n\nIf the landlord is claiming more than you actually owe:\n\u2022 Bring your lease showing the actual rent amount\n\u2022 Bring all payment records\n\u2022 Create a written ledger showing each month, what was due, and what was paid\n\u2022 Challenge any unauthorized fees or charges not in the lease\n\u2022 If the landlord is holding your security deposit, it should be credited against any amount owed\n\nThe landlord has the burden of proving the exact amount owed. Challenge any charges not supported by the lease or by receipts.',
      showIf: (answers) => answers.primary_defense === 'amount_wrong',
    },

    // === Rent Escrow Defense ===
    {
      id: 'rent_escrow_defense',
      type: 'info',
      prompt:
        'RENT ESCROW DEFENSE (68 P.S. \u00A7250.505-A)\n\nIf the dwelling has been certified as unfit for human habitation by the appropriate city or county agency, you can deposit rent with the court (rent escrow). While rent is in escrow, you CANNOT be evicted for nonpayment.\n\nHow to use rent escrow:\n1. Report housing code violations to your local code enforcement agency\n2. Get the property inspected and certified as unfit\n3. Deposit rent payments with the Magisterial District Court\n4. Continue depositing rent each month while conditions persist\n\nThe court may release escrowed funds to the landlord only after repairs are made, or may apply them to fund necessary repairs.',
      showIf: (answers) => answers.primary_defense === 'rent_escrow',
    },

    // === Security Deposit Defense ===
    {
      id: 'security_deposit_defense',
      type: 'info',
      prompt:
        'SECURITY DEPOSIT VIOLATIONS (68 P.S. \u00A7\u00A7250.511a\u2013512)\n\nPA security deposit rules landlords frequently violate:\n\n\u2022 LIMIT: Max 2 months\u2019 rent in year 1; max 1 month\u2019s rent after year 1\n\u2022 ESCROW: Deposits over $100 must be held in a regulated escrow account; landlord must notify you of the bank name, address, and amount deposited\n\u2022 INTEREST: After 2 years, deposit must be in an interest-bearing account; you\u2019re entitled to the interest (minus 1% admin fee)\n\u2022 RETURN: Within 30 days of lease end, landlord must provide an itemized list of damages AND return the balance\n\u2022 PENALTY: If landlord fails to return the deposit within 30 days, you are entitled to DOUBLE the amount owed\n\nIn an eviction case, argue that any security deposit held should be credited against any alleged rent owed.',
      showIf: (answers) => answers.primary_defense === 'security_deposit',
    },

    // === Illegal Lockout Defense ===
    {
      id: 'illegal_lockout_defense',
      type: 'info',
      prompt:
        'ILLEGAL SELF-HELP EVICTION\n\nIt is ILLEGAL for a landlord in Pennsylvania to:\n\u2022 Change your locks\n\u2022 Shut off utilities (electric, gas, water)\n\u2022 Remove your belongings\n\u2022 Board up windows or doors\n\u2022 Physically remove you without a court order\n\nIf the landlord has done any of these, you can:\n1. Call the police \u2014 illegal lockout is a criminal offense\n2. File a complaint with the Magisterial District Court for unlawful eviction\n3. Sue for damages including the cost of alternative housing, damaged/lost property, and emotional distress\n\nOnly a constable executing a valid Order for Possession can physically remove you.',
      showIf: (answers) => answers.primary_defense === 'illegal_lockout',
    },

    // === Not Sure Defense ===
    {
      id: 'not_sure_defense',
      type: 'info',
      prompt:
        'RECOMMENDED: Raise Multiple Defenses\n\nIf you are not sure which defense to use, raise ALL that could apply:\n\n1. Challenge the Notice to Quit \u2014 was it proper?\n2. Challenge the amount owed \u2014 bring all payment records\n3. Raise habitability issues \u2014 document all property defects\n4. Check for retaliation \u2014 did you recently complain?\n5. Verify landlord\u2019s compliance with security deposit rules\n\nAt the Magisterial District Court, the hearing is informal. Simply tell the judge your side of the story and present your evidence. You do not need legal jargon \u2014 just be honest, organized, and on time.',
      showIf: (answers) => answers.primary_defense === 'not_sure',
    },

    // === Evidence Preparation ===
    {
      id: 'has_evidence',
      type: 'yes_no',
      prompt: 'Have you gathered evidence to support your defense?',
      helpText:
        'Evidence includes: your lease, rent receipts, bank statements, photos of property conditions, written communications with landlord, code violation reports, repair requests.',
    },
    {
      id: 'evidence_checklist',
      type: 'info',
      prompt:
        'EVIDENCE CHECKLIST FOR YOUR HEARING\n\nBring COPIES of everything (originals for you, copies for the judge and landlord):\n\n\u2022 Your lease agreement\n\u2022 All rent payment records (bank statements, receipts, money orders)\n\u2022 Written communications with landlord (texts, emails, letters)\n\u2022 Photos/videos of property conditions (with dates)\n\u2022 Written repair requests you sent to landlord\n\u2022 Code enforcement inspection reports\n\u2022 The Notice to Quit you received\n\u2022 The court complaint\n\u2022 Any witnesses who can testify (they must appear in person)\n\u2022 A written timeline of events\n\nOrganize everything in chronological order. The more organized you are, the more credible you appear to the judge.',
      showIf: (answers) => answers.has_evidence === 'no',
    },

    // === Hearing Tips ===
    {
      id: 'hearing_tips',
      type: 'info',
      prompt:
        'HEARING DAY TIPS \u2014 MAGISTERIAL DISTRICT COURT\n\n\u2022 ARRIVE EARLY \u2014 If you are even a few minutes late, a default judgment may be entered against you\n\u2022 Dress professionally\n\u2022 Address the judge as "Your Honor" or "Judge"\n\u2022 Do not interrupt the landlord\u2019s testimony \u2014 you will get your turn\n\u2022 Stick to the facts and present your evidence calmly\n\u2022 If the landlord\u2019s attorney asks you questions, answer honestly but briefly\n\u2022 You can ask the landlord questions too\n\u2022 The judge decides that day or within 3 business days\n\nThe hearing is relatively informal compared to higher courts. There are no formal rules of evidence. Focus on telling a clear, truthful story supported by documentation.',
      showIf: (answers) =>
        answers.case_stage === 'complaint_filed' || answers.case_stage === 'notice_only',
    },

    // === Appeal Information ===
    {
      id: 'appeal_info',
      type: 'info',
      prompt:
        'YOUR RIGHT TO APPEAL (Pa.R.C.P.M.D.J. 1001\u20131008)\n\nIf you lose at the Magisterial District Court, you have the RIGHT to appeal to the Court of Common Pleas within 10 DAYS of the judgment date.\n\nThe appeal gives you a DE NOVO TRIAL \u2014 a completely fresh hearing. The Magisterial District Court judgment is wiped clean and you start over in front of a new judge.\n\nTo stay in your home during the appeal:\n\u2022 POST A SUPERSEDEAS BOND: Deposit the LESSER of 3 months\u2019 rent OR actual rent in arrears with the Prothonotary\n\u2022 IF YOU CANNOT AFFORD IT: File an In Forma Pauperis (IFP) petition. Deposit only 1/3 of one month\u2019s rent at filing, then the remaining 2/3 within 20 days, then monthly rent each 30 days\n\u2022 You must continue paying monthly rent into the court during the appeal\n\nFiling fee: Varies by county. If you cannot afford it, request fee waiver with an IFP petition.',
    },

    // === Wage Garnishment Protection ===
    {
      id: 'wage_garnishment_info',
      type: 'info',
      prompt:
        'WAGE PROTECTION \u2014 Even If You Lose (42 Pa.C.S.A. \u00A78127)\n\nUnlike most states, Pennsylvania LIMITS wage garnishment for rent judgments:\n\u2022 Maximum attachment: 10% of NET wages per pay period\n\u2022 Cannot reduce your income below federal poverty guidelines\n\u2022 Security deposit must be credited against the judgment first\n\u2022 Domestic violence victims with a Protection From Abuse order are FULLY exempt from wage attachment for physical damages to the property\n\u2022 Your employer CANNOT take adverse action against you for having wages attached\n\nThis means even if you lose, the landlord\u2019s ability to collect is significantly limited.',
    },

    // === Legal Aid Resources ===
    {
      id: 'legal_aid',
      type: 'info',
      prompt:
        'FREE LEGAL HELP IN PENNSYLVANIA\n\n\u2022 Pennsylvania Legal Aid Network: palegalaid.net\n\u2022 PA Law Help: palawhelp.org\n\u2022 Community Legal Services (Philadelphia): 215-981-3700\n\u2022 Philadelphia Legal Assistance: 215-981-3800\n\u2022 MidPenn Legal Services (Central PA): 800-326-9177\n\u2022 Southwestern PA Legal Services: 800-846-0871\n\u2022 Legal Aid of Southeastern PA: 877-429-5994\n\u2022 Neighborhood Legal Services (Pittsburgh): 866-761-6572\n\nIf you are in Philadelphia and low-income, you may qualify for the RIGHT TO COUNSEL program \u2014 a free attorney appointed for your eviction case. Call Community Legal Services immediately.\n\nContact legal aid AS SOON AS POSSIBLE \u2014 do not wait until the hearing date.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Eviction reason
    const reasonLabels: Record<string, string> = {
      nonpayment: 'Nonpayment of rent (10-day notice required)',
      lease_violation: 'Lease violation (15-day notice required)',
      end_of_lease: 'End of lease term',
      month_to_month: 'Month-to-month termination',
      illegal_activity: 'Alleged illegal activity',
      no_reason: 'No reason given',
      unsure: 'Reason unclear',
    }
    if (answers.eviction_reason) {
      items.push({
        status: 'info',
        text: `Eviction reason: ${reasonLabels[answers.eviction_reason] || answers.eviction_reason}.`,
      })
    }

    // Notice check
    if (answers.received_notice === 'no') {
      items.push({
        status: 'info',
        text: 'No written Notice to Quit received \u2014 this is a strong procedural defense. Raise it at the hearing.',
      })
    } else if (answers.received_notice === 'yes') {
      items.push({
        status: 'done',
        text: 'Written Notice to Quit received. Verify it meets all statutory requirements (proper time period, written form, proper service).',
      })
    }

    // Case stage
    const stageActions: Record<string, { status: 'done' | 'needed' | 'info'; text: string }> = {
      notice_only: {
        status: 'needed',
        text: 'You are in the notice period. Cure the issue if possible (pay rent, fix violation) to prevent the landlord from filing.',
      },
      complaint_filed: {
        status: 'needed',
        text: 'Complaint filed \u2014 ATTEND YOUR HEARING. Arrive early with all evidence organized.',
      },
      judgment_entered: {
        status: 'needed',
        text: 'Judgment entered \u2014 FILE AN APPEAL within 10 DAYS to the Court of Common Pleas for a de novo trial. Post supersedeas bond or IFP affidavit.',
      },
      order_possession: {
        status: 'needed',
        text: 'Order for Possession issued. For nonpayment: you can still pay all arrears + costs to stop the lockout. Contact legal aid immediately.',
      },
    }
    if (answers.case_stage && stageActions[answers.case_stage]) {
      items.push(stageActions[answers.case_stage])
    }

    // Philadelphia
    if (answers.in_philadelphia === 'yes') {
      items.push({
        status: 'info',
        text: 'Philadelphia tenant: Check eligibility for Right to Counsel (free attorney), Eviction Diversion Program, and Good Cause protections.',
      })
    }

    // Defense
    const defenseLabels: Record<string, string> = {
      habitability: 'Implied warranty of habitability (Pugh v. Holmes)',
      retaliation: 'Retaliatory eviction (68 P.S. \u00A7250.205-a)',
      improper_notice: 'Improper Notice to Quit (68 P.S. \u00A7250.501)',
      rent_paid: 'Rent already paid',
      amount_wrong: 'Disputed amount',
      discrimination: 'Discriminatory eviction (Fair Housing Act)',
      rent_escrow: 'Rent escrow for uninhabitable conditions (68 P.S. \u00A7250.505-A)',
      security_deposit: 'Security deposit violations (68 P.S. \u00A7\u00A7250.511a\u2013512)',
      illegal_lockout: 'Illegal self-help eviction',
      not_sure: 'Raise all applicable defenses',
    }
    if (answers.primary_defense) {
      items.push({
        status: 'info',
        text: `Primary defense: ${defenseLabels[answers.primary_defense] || answers.primary_defense}.`,
      })
    }

    // Evidence
    if (answers.has_evidence === 'yes') {
      items.push({ status: 'done', text: 'Evidence gathered. Organize in chronological order and bring copies for the judge and landlord.' })
    } else if (answers.has_evidence === 'no') {
      items.push({
        status: 'needed',
        text: 'Gather evidence: lease, payment records, photos, repair requests, communications, code violation reports.',
      })
    }

    // Right to cure reminder for nonpayment
    if (answers.eviction_reason === 'nonpayment') {
      items.push({
        status: 'info',
        text: 'Nonpayment: You can stop the eviction at ANY time before physical lockout by paying all rent in arrears + court costs (68 P.S. \u00A7250.501(b)).',
      })
    }

    // Appeal reminder
    items.push({
      status: 'info',
      text: 'If you lose: Appeal to Court of Common Pleas within 10 days for a de novo trial. Post supersedeas bond or file IFP affidavit to stay in your home.',
    })

    // Wage protection
    items.push({
      status: 'info',
      text: 'PA wage protection: Garnishment limited to 10% of net wages and cannot reduce income below poverty level (42 Pa.C.S.A. \u00A78127).',
    })

    return items
  },
}
