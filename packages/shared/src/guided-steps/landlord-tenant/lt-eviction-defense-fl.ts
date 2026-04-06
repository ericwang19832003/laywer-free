import type { GuidedStepConfig } from '../types'

export const ltEvictionDefenseFlConfig: GuidedStepConfig = {
  title: 'Defend Against Eviction (Florida)',
  reassurance:
    'Being served with an eviction lawsuit is frightening, but Florida law gives tenants real defenses. Acting quickly is critical — you only have 5 business days to respond.',

  questions: [
    // === CRITICAL: Timeline ===
    {
      id: 'timeline_warning',
      type: 'info',
      prompt:
        'CRITICAL FLORIDA TIMELINE\n\nFlorida evictions use SUMMARY PROCEDURE (Fla. Stat. §51.011), which means everything moves faster than a normal lawsuit:\n\n• You have only 5 BUSINESS DAYS to file your response after being served (excludes day of service, weekends, and legal holidays)\n• If you do not respond within 5 days, the court enters a DEFAULT JUDGMENT and issues a writ of possession — you will be removed by the sheriff\n• The landlord files in County Court in the county where the property is located\n\nCount your days carefully. If you were served on Monday, your answer is due the following Monday (assuming no holidays).',
    },

    // === Notice Type ===
    {
      id: 'notice_type',
      type: 'single_choice',
      prompt: 'What type of eviction notice did your landlord serve BEFORE filing the lawsuit?',
      helpText:
        'Florida requires the landlord to serve a written notice before filing an eviction complaint. The notice type determines your defenses. Check the document your landlord gave you before the court papers arrived.',
      options: [
        { value: 'three_day_nonpayment', label: '3-day notice — nonpayment of rent (Fla. Stat. §83.56(3))' },
        { value: 'seven_day_cure', label: '7-day notice to cure — lease violation (Fla. Stat. §83.56(2)(b))' },
        { value: 'seven_day_terminate', label: '7-day notice to terminate — noncurable violation (Fla. Stat. §83.56(2)(a))' },
        { value: 'fifteen_day', label: '15-day notice — month-to-month termination (Fla. Stat. §83.57)' },
        { value: 'no_notice', label: 'I never received a written notice before the lawsuit' },
        { value: 'unsure', label: 'I am not sure / I have the paper but cannot tell' },
      ],
    },
    {
      id: 'three_day_info',
      type: 'info',
      prompt:
        '3-DAY NOTICE FOR NONPAYMENT (Fla. Stat. §83.56(3))\n\nThis notice must:\n• State the specific amount of rent owed (not late fees, attorney fees, or other charges — ONLY rent)\n• Give you 3 business days to pay or vacate (excludes weekends and holidays)\n• Be delivered by mail, hand delivery, or posting on the door\n\nCOMMON DEFECTS that invalidate the notice:\n• Includes charges beyond rent (utilities, late fees, damages)\n• Wrong amount listed\n• Does not give the full 3 business days\n• Not properly delivered\n• Demands rent for a period already paid\n\nIf the notice is defective, the entire eviction case should be dismissed.',
      showIf: (answers) => answers.notice_type === 'three_day_nonpayment',
    },
    {
      id: 'seven_day_cure_info',
      type: 'info',
      prompt:
        '7-DAY NOTICE TO CURE (Fla. Stat. §83.56(2)(b))\n\nFor curable lease violations (unauthorized pet, noise complaints, unauthorized occupant, etc.), the landlord must:\n• Specify the exact violation\n• Give you 7 days to fix (cure) the problem\n• If you cure the violation within 7 days, the landlord CANNOT proceed with eviction\n\nIMPORTANT: If this is the FIRST violation, you have the right to cure. If it is a repeat of a substantially similar violation within 12 months, the landlord may serve a 7-day termination notice with no right to cure.',
      showIf: (answers) => answers.notice_type === 'seven_day_cure',
    },
    {
      id: 'seven_day_terminate_info',
      type: 'info',
      prompt:
        '7-DAY UNCONDITIONAL NOTICE TO TERMINATE (Fla. Stat. §83.56(2)(a))\n\nFor noncurable violations (intentional destruction, unauthorized assignment, repeated violations within 12 months), the landlord can give you 7 days to vacate with no opportunity to cure.\n\nDEFENSES:\n• The violation is actually curable (landlord used the wrong notice type)\n• The alleged conduct did not actually occur\n• The notice does not adequately describe the violation\n• This is the first occurrence of a curable violation',
      showIf: (answers) => answers.notice_type === 'seven_day_terminate',
    },
    {
      id: 'fifteen_day_info',
      type: 'info',
      prompt:
        '15-DAY NOTICE FOR MONTH-TO-MONTH (Fla. Stat. §83.57)\n\nEither party may terminate a month-to-month tenancy by giving at least 15 days written notice before the end of any monthly period.\n\nDEFENSES:\n• Notice was not given at least 15 days before the end of the monthly period\n• You actually have a fixed-term lease (not month-to-month)\n• The termination is retaliatory (Fla. Stat. §83.64)\n• The termination is discriminatory (Fair Housing Act)',
      showIf: (answers) => answers.notice_type === 'fifteen_day',
    },
    {
      id: 'no_notice_info',
      type: 'info',
      prompt:
        'NO PRIOR NOTICE — STRONG DEFENSE\n\nFlorida law REQUIRES the landlord to serve a written notice and wait for the notice period to expire BEFORE filing an eviction complaint. If the landlord filed without giving you proper written notice, the case should be DISMISSED.\n\nThis is one of the strongest defenses available. Raise it in your Answer:\n"Plaintiff failed to serve proper statutory notice as required by Fla. Stat. §83.56 prior to filing this action. This action is premature and should be dismissed."',
      showIf: (answers) => answers.notice_type === 'no_notice',
    },

    // === CRITICAL: Rent Deposit Into Court Registry ===
    {
      id: 'rent_deposit_warning',
      type: 'info',
      prompt:
        'CRITICAL FLORIDA REQUIREMENT: DEPOSIT RENT INTO COURT REGISTRY (Fla. Stat. §83.60(2))\n\nThis is the single most important rule for tenants defending evictions in Florida.\n\nIf you want to raise ANY defense against an eviction for nonpayment of rent, you MUST deposit the rent you allegedly owe into the court registry. The court will NOT hear your defenses unless you do this.\n\nHere is what happens:\n1. You file your Answer within 5 business days\n2. The court determines the amount of rent to be deposited\n3. You deposit that amount into the court registry\n4. You continue depositing rent into the registry as it comes due during the case\n\nIF YOU FAIL TO DEPOSIT RENT: The court MUST enter a default judgment against you and issue a writ of possession immediately. Your defenses will not be heard — no matter how valid they are.\n\nEven if you believe you owe less than what the landlord claims, deposit the disputed amount and argue about the correct amount at trial. You can get money back if you win.\n\nTo deposit rent, go to the Clerk of Court and ask to deposit funds into the court registry for your case. Bring your case number.',
    },
    {
      id: 'can_deposit_rent',
      type: 'single_choice',
      prompt: 'Are you able to deposit the rent owed into the court registry?',
      helpText:
        'This is required to raise defenses in a nonpayment eviction. Without this deposit, the court must rule against you regardless of your defenses.',
      options: [
        { value: 'yes', label: 'Yes, I can deposit the rent' },
        { value: 'partial', label: 'I can deposit some but not all of it' },
        { value: 'no', label: 'No, I cannot afford to deposit rent' },
        { value: 'not_nonpayment', label: 'My eviction is not for nonpayment of rent' },
      ],
    },
    {
      id: 'cannot_deposit_info',
      type: 'info',
      prompt:
        'IF YOU CANNOT DEPOSIT RENT\n\nThis severely limits your options in a nonpayment eviction. Without the deposit, the court must enter default judgment against you.\n\nConsider these alternatives:\n• Apply for emergency rental assistance through your county or local legal aid\n• Contact Florida legal aid organizations (Florida Rural Legal Services, Legal Aid Society, Bay Area Legal Services)\n• Ask the court about indigent status — while it waives filing fees, it does NOT waive the rent deposit requirement\n• Try to negotiate directly with the landlord for more time or a payment plan\n• If you qualify, file a motion requesting the court to reduce the deposit amount based on your ability to pay\n\nEven if you cannot deposit, FILE YOUR ANSWER on time to preserve your rights while you seek assistance.',
      showIf: (answers) => answers.can_deposit_rent === 'no' || answers.can_deposit_rent === 'partial',
    },

    // === Have You Been Served With the Complaint? ===
    {
      id: 'have_complaint',
      type: 'yes_no',
      prompt: 'Have you been served with the eviction complaint (court papers)?',
    },
    {
      id: 'get_complaint_info',
      type: 'info',
      prompt:
        'If you have received a notice from your landlord but have NOT yet been served with court papers, the lawsuit may not have been filed yet. Monitor your mailbox and door for service.\n\nIf you believe a case has been filed, check the Clerk of Court website for your county or visit the clerk\'s office with your name and address to search for the case.',
      showIf: (answers) => answers.have_complaint === 'no',
    },
    {
      id: 'service_date',
      type: 'text',
      prompt: 'What date were you served with the eviction complaint?',
      helpText:
        'Enter the date you received the court papers (not the landlord notice). This starts your 5 business day clock. Format: MM/DD/YYYY',
      placeholder: 'MM/DD/YYYY',
      showIf: (answers) => answers.have_complaint === 'yes',
    },

    // === Defenses ===
    {
      id: 'defenses_overview',
      type: 'info',
      prompt:
        'FLORIDA EVICTION DEFENSES\n\nYou must raise ALL defenses in your initial Answer or risk waiving them. Common defenses include:\n\n1. Defective notice — notice was wrong, incomplete, or never served\n2. Landlord failed to maintain premises — habitability defense (Fla. Stat. §83.51)\n3. Retaliatory eviction — landlord is retaliating for complaints (Fla. Stat. §83.64)\n4. Discriminatory eviction — based on race, religion, sex, familial status, disability, national origin (Fair Housing Act)\n5. Landlord accepted rent after notice — waives the notice\n6. Rent was paid — you have proof of payment\n7. Improper service of process\n8. Landlord failed to return security deposit properly (Fla. Stat. §83.49)\n\nRaise EVERY defense that could apply — even if you are not certain. You lose defenses you do not raise.',
    },
    {
      id: 'primary_defense',
      type: 'single_choice',
      prompt: 'What is your primary defense?',
      options: [
        { value: 'defective_notice', label: 'The notice was defective or never served' },
        { value: 'habitability', label: 'The property has serious maintenance problems (habitability)' },
        { value: 'retaliation', label: 'The eviction is retaliation for complaints I made' },
        { value: 'rent_paid', label: 'I already paid the rent' },
        { value: 'accepted_rent', label: 'Landlord accepted rent after serving the notice' },
        { value: 'discrimination', label: 'The eviction is discriminatory' },
        { value: 'improper_service', label: 'I was not properly served with the lawsuit' },
        { value: 'deny_all', label: 'Deny everything and force landlord to prove it' },
        { value: 'not_sure', label: 'I am not sure which defense applies' },
      ],
    },
    {
      id: 'habitability_defense_info',
      type: 'info',
      prompt:
        'HABITABILITY DEFENSE (Fla. Stat. §83.51 / §83.60(1))\n\nFlorida landlords must maintain the property in compliance with building, housing, and health codes. If the landlord materially failed to maintain the premises, this is a COMPLETE DEFENSE to eviction for nonpayment.\n\nTo use this defense, you must have:\n1. Given the landlord written notice specifying the maintenance problems at least 7 days before withholding rent (Fla. Stat. §83.56(1))\n2. The problems must be material — not minor cosmetic issues\n\nExamples of material noncompliance:\n• No hot water, no running water\n• Broken air conditioning or heating (in extreme weather)\n• Pest infestation the landlord refuses to treat\n• Mold, roof leaks, structural damage\n• No working locks on doors or windows\n• Sewage or plumbing failures\n• Electrical hazards\n\nThe court may reduce the rent owed based on the diminished value of the unit during the period of noncompliance.\n\nCRITICAL: Even with this defense, you must STILL deposit rent into the court registry (Fla. Stat. §83.60(2)).',
      showIf: (answers) => answers.primary_defense === 'habitability',
    },
    {
      id: 'retaliation_defense_info',
      type: 'info',
      prompt:
        'RETALIATORY EVICTION DEFENSE (Fla. Stat. §83.64)\n\nIt is unlawful for a landlord to evict a tenant primarily in retaliation for:\n• Complaining to the landlord about maintenance or code violations\n• Complaining to a government agency about code violations\n• Organizing or joining a tenant organization\n• Exercising any legal right under the lease or Florida law\n\nPRESUMPTION: If the landlord served an eviction notice within 6 months of your protected activity, Florida law PRESUMES it is retaliatory. The landlord must prove a legitimate, non-retaliatory reason.\n\nTo raise this defense, document:\n• Dates of your complaints (written complaints are strongest)\n• Who you complained to\n• The timeline between your complaint and the eviction notice\n• Any witnesses\n• Any texts, emails, or voicemails from the landlord',
      showIf: (answers) => answers.primary_defense === 'retaliation',
    },
    {
      id: 'accepted_rent_info',
      type: 'info',
      prompt:
        'LANDLORD ACCEPTED RENT AFTER NOTICE\n\nIf the landlord accepted rent after serving the eviction notice, this generally WAIVES the notice and the landlord must start the process over.\n\nKeep proof of any payment made after the notice was served:\n• Receipts, canceled checks, bank statements\n• Money order stubs\n• Venmo/Zelle/CashApp transaction records\n• Text messages confirming payment\n\nInclude this in your Answer: "Plaintiff waived the notice to vacate by accepting rent from Defendant after service of said notice."',
      showIf: (answers) => answers.primary_defense === 'accepted_rent',
    },
    {
      id: 'deny_all_info',
      type: 'info',
      prompt:
        'DENY ALL ALLEGATIONS\n\nThis is a valid and effective strategy. Respond to each paragraph of the complaint:\n"Defendant denies each and every allegation contained in Paragraph [X] of the Complaint."\n\nThis forces the landlord to PROVE every element:\n• Valid lease or tenancy\n• Proper notice served and expired\n• Standing to bring the action\n• Amount of rent owed (if any)\n\nEven when denying everything, also list ALL applicable affirmative defenses in a separate section of your Answer.',
      showIf: (answers) => answers.primary_defense === 'deny_all' || answers.primary_defense === 'not_sure',
    },

    // === Security Deposit Issues ===
    {
      id: 'security_deposit_issue',
      type: 'yes_no',
      prompt: 'Did your landlord fail to properly handle your security deposit?',
      helpText:
        'Florida law (Fla. Stat. §83.49) requires landlords to hold deposits in a separate account and provide written notice of how the deposit is held within 30 days. Violations can be raised in your defense.',
    },
    {
      id: 'security_deposit_info',
      type: 'info',
      prompt:
        'SECURITY DEPOSIT VIOLATIONS (Fla. Stat. §83.49)\n\nFlorida landlords must:\n• Hold the deposit in a separate non-interest-bearing account OR an interest-bearing account OR post a surety bond\n• Notify you in writing within 30 days of receiving the deposit, stating where it is held\n• After you vacate, provide written notice of any claim against the deposit within 30 days by certified mail\n• You then have 15 days to dispute the claim\n\nIf the landlord failed to comply with §83.49, you may raise this as a counterclaim. A landlord who fails to give proper notice of intent to impose a claim forfeits the right to make any claim against the deposit.\n\nNote: While security deposit issues are typically a counterclaim rather than a defense to eviction, they can be strategically important in settlement negotiations and may offset amounts the landlord claims you owe.',
      showIf: (answers) => answers.security_deposit_issue === 'yes',
    },

    // === Filing the Answer ===
    {
      id: 'filing_answer_info',
      type: 'info',
      prompt:
        'FILING YOUR ANSWER IN FLORIDA\n\nYour Answer must be filed within 5 BUSINESS DAYS of service.\n\n1. FILE with the Clerk of Court — e-file via the Florida Courts E-Filing Portal (www.myflcourtaccess.com), file in person, or by mail at the clerk\'s office\n2. SERVE a copy on the landlord\'s attorney (or landlord if unrepresented) by mail, email, or hand delivery\n3. FILE a Certificate of Service proving you served the other side\n4. DEPOSIT rent into the court registry if defending a nonpayment eviction\n5. KEEP a file-stamped copy for your records\n\nFILING FEES: Defendants generally do not pay a filing fee to respond. If you have any fees and cannot afford them, file an Application for Determination of Civil Indigent Status (Fla. Stat. §57.082) — this waives filing fees, summons costs, and service fees.\n\nYOUR ANSWER SHOULD INCLUDE:\n• Caption (case number, court, parties)\n• Numbered denials responding to each paragraph of the complaint\n• Affirmative defenses (each as a separate numbered section)\n• Certificate of Service\n• Your signature, address, and phone number',
    },

    // === Writ of Possession Warning ===
    {
      id: 'writ_of_possession_info',
      type: 'info',
      prompt:
        'WHAT HAPPENS IF YOU LOSE OR DO NOT RESPOND\n\nIf the court rules against you or you fail to respond within 5 business days:\n• The court issues a FINAL JUDGMENT for possession\n• A WRIT OF POSSESSION is issued to the sheriff\n• The sheriff posts a 24-HOUR NOTICE on your door\n• After 24 hours, the sheriff will physically remove you and your belongings\n\nIMPORTANT: Only the SHERIFF can execute a writ of possession. If your landlord tries to lock you out, shut off utilities, or remove your belongings without a court order, that is an ILLEGAL LOCKOUT — call the police and seek emergency legal help. Self-help evictions are illegal in Florida (Fla. Stat. §83.67).\n\nYou cannot be evicted without a court order, even if you owe rent.',
    },

    // === No Rent Control Reminder ===
    {
      id: 'rent_control_info',
      type: 'info',
      prompt:
        'FLORIDA RENT LAW\n\nFlorida has NO rent control (Fla. Stat. §166.043 preempts local rent control ordinances). Your landlord may raise the rent to any amount at the end of your lease term or with proper notice for month-to-month tenancies.\n\nHowever, a rent increase DURING a fixed-term lease violates the lease and is a defense if the landlord claims you owe a higher amount than your lease states.\n\nA rent increase cannot be retaliatory (Fla. Stat. §83.64).',
    },

    // === Legal Resources ===
    {
      id: 'legal_resources',
      type: 'info',
      prompt:
        'FREE LEGAL RESOURCES IN FLORIDA\n\n• Florida Bar Lawyer Referral Service: 1-800-342-8011\n• Florida Rural Legal Services: www.frls.org\n• Legal Aid Society of your county (search "legal aid [your county] Florida")\n• Bay Area Legal Services (Tampa Bay area): www.bals.org\n• Jacksonville Area Legal Aid: www.jaxlegalaid.org\n• Legal Services of Greater Miami: www.lsgmi.org\n• Community Legal Services of Mid-Florida: www.clsmf.org\n• Florida Courts Self-Help Center: www.flcourts.gov/resources-and-services/self-help\n\nMany legal aid organizations have emergency eviction defense programs. Call as soon as you are served — do not wait.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Complaint received
    if (answers.have_complaint === 'yes') {
      items.push({ status: 'done', text: 'You have received the eviction complaint.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Confirm whether an eviction lawsuit has been filed. Check with the Clerk of Court in your county.',
      })
    }

    // Service date / deadline
    if (answers.service_date) {
      items.push({
        status: 'info',
        text: `Served on ${answers.service_date}. Your Answer is due within 5 BUSINESS DAYS of that date (Fla. Stat. §51.011). Count carefully — excludes weekends and holidays.`,
      })
    } else if (answers.have_complaint === 'yes') {
      items.push({
        status: 'needed',
        text: 'Determine your exact service date to calculate your 5 business day deadline.',
      })
    }

    // Notice type
    const noticeLabels: Record<string, string> = {
      three_day_nonpayment: '3-day notice for nonpayment (Fla. Stat. §83.56(3))',
      seven_day_cure: '7-day notice to cure lease violation (Fla. Stat. §83.56(2)(b))',
      seven_day_terminate: '7-day unconditional termination (Fla. Stat. §83.56(2)(a))',
      fifteen_day: '15-day month-to-month termination (Fla. Stat. §83.57)',
      no_notice: 'No notice received — STRONG defense (motion to dismiss)',
      unsure: 'Notice type unclear — review the document carefully',
    }
    if (answers.notice_type) {
      items.push({
        status: answers.notice_type === 'no_notice' ? 'info' : 'info',
        text: `Notice type: ${noticeLabels[answers.notice_type] || answers.notice_type}.`,
      })
    }

    // Rent deposit — CRITICAL
    if (answers.can_deposit_rent === 'yes') {
      items.push({
        status: 'needed',
        text: 'CRITICAL: Deposit rent into the court registry immediately (Fla. Stat. §83.60(2)). Go to the Clerk of Court with your case number. Without this deposit, the court MUST enter default judgment against you.',
      })
    } else if (answers.can_deposit_rent === 'partial') {
      items.push({
        status: 'needed',
        text: 'CRITICAL: Deposit whatever rent you can into the court registry and file a motion requesting a reduced deposit amount. Contact legal aid immediately for assistance (Fla. Stat. §83.60(2)).',
      })
    } else if (answers.can_deposit_rent === 'no') {
      items.push({
        status: 'needed',
        text: 'URGENT: You must deposit rent into the court registry to raise defenses (Fla. Stat. §83.60(2)). Contact legal aid or apply for emergency rental assistance immediately. File your Answer on time regardless.',
      })
    } else if (answers.can_deposit_rent === 'not_nonpayment') {
      items.push({
        status: 'info',
        text: 'Rent deposit requirement does not apply — your eviction is not for nonpayment.',
      })
    }

    // Primary defense
    const defenseLabels: Record<string, string> = {
      defective_notice: 'Defective or missing notice (Fla. Stat. §83.56)',
      habitability: 'Landlord failed to maintain premises (Fla. Stat. §83.51)',
      retaliation: 'Retaliatory eviction (Fla. Stat. §83.64)',
      rent_paid: 'Rent was already paid',
      accepted_rent: 'Landlord waived notice by accepting rent',
      discrimination: 'Discriminatory eviction (Fair Housing Act)',
      improper_service: 'Improper service of process',
      deny_all: 'Deny all allegations — force landlord to prove case',
      not_sure: 'Deny all allegations (recommended default strategy)',
    }
    if (answers.primary_defense) {
      items.push({
        status: 'info',
        text: `Primary defense: ${defenseLabels[answers.primary_defense] || answers.primary_defense}.`,
      })
    }

    // Security deposit counterclaim
    if (answers.security_deposit_issue === 'yes') {
      items.push({
        status: 'info',
        text: 'Potential counterclaim for security deposit violations (Fla. Stat. §83.49). Include in your Answer or file separately.',
      })
    }

    // Action items
    items.push({
      status: 'needed',
      text: 'File your Answer within 5 BUSINESS DAYS. E-file via myflcourtaccess.com or file at the Clerk of Court. Include specific denials, all affirmative defenses, and a Certificate of Service.',
    })

    if (
      answers.notice_type === 'three_day_nonpayment' &&
      answers.can_deposit_rent !== 'not_nonpayment'
    ) {
      items.push({
        status: 'needed',
        text: 'Deposit rent into the court registry at the Clerk of Court. Continue depositing rent as it comes due during the case.',
      })
    }

    items.push({
      status: 'needed',
      text: 'Serve a copy of your Answer on the landlord or their attorney and file a Certificate of Service with the court.',
    })

    items.push({
      status: 'info',
      text: 'Contact a Florida legal aid organization immediately for free legal assistance with your eviction defense.',
    })

    return items
  },
}
