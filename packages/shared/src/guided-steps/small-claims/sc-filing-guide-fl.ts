import type { GuidedStepConfig } from '../types'

export const scFilingGuideFlConfig: GuidedStepConfig = {
  title: 'How to File Your Small Claims Case in Florida',
  reassurance:
    'Florida small claims court is designed for everyday people. The process is simplified, and clerks can help you with procedural questions.',

  questions: [
    // === Jurisdiction Check ===
    {
      id: 'claim_amount',
      type: 'single_choice',
      prompt: 'How much money are you claiming?',
      helpText:
        'Florida small claims jurisdiction covers disputes up to $8,000 (Fla. Stat. §34.01, updated Jan 1, 2023). If your claim exceeds $8,000, you must file in County Court civil division.',
      options: [
        { value: 'under_2500', label: 'Under $2,500' },
        { value: '2500_5000', label: '$2,500 to $5,000' },
        { value: '5001_8000', label: '$5,001 to $8,000' },
        { value: 'over_8000', label: 'Over $8,000' },
      ],
    },
    {
      id: 'over_limit_info',
      type: 'info',
      prompt:
        'YOUR CLAIM EXCEEDS THE SMALL CLAIMS LIMIT.\n\nFlorida small claims court only handles claims up to $8,000. You have two options:\n\n1. Reduce your claim to $8,000 and file in small claims (you waive the excess)\n2. File in County Court civil division for the full amount (more complex procedure, higher fees)\n\nIf you reduce to $8,000, you cannot later sue for the remainder.',
      showIf: (answers) => answers.claim_amount === 'over_8000',
    },

    // === Filing Fee ===
    {
      id: 'know_filing_fee',
      type: 'yes_no',
      prompt: 'Do you know the filing fee for your claim amount?',
    },
    {
      id: 'filing_fee_info',
      type: 'info',
      prompt:
        'FLORIDA SMALL CLAIMS FILING FEES (approximate — varies slightly by county):\n\n• Claims up to $500: approximately $55\n• Claims $501 to $2,500: approximately $80\n• Claims $2,501 to $5,000: approximately $175\n• Claims $5,001 to $8,000: approximately $300\n\nThese fees cover filing only. Service of process fees are additional ($10-$40 for sheriff service). Check your county clerk\'s website for exact amounts.',
      showIf: (answers) => answers.know_filing_fee === 'no',
    },

    // === Fee Waiver ===
    {
      id: 'can_afford_fee',
      type: 'yes_no',
      prompt: 'Can you afford the filing fee?',
    },
    {
      id: 'fee_waiver_info',
      type: 'info',
      prompt:
        'FEE WAIVER — INDIGENCY AFFIDAVIT (Fla. Stat. §57.081)\n\nIf you cannot afford the filing fee, you can apply for a determination of civil indigent status at the clerk\'s office. If approved, filing fees, service fees, and other court costs are waived.\n\nYou qualify if your income is at or below 200% of the federal poverty guidelines, or if you receive public assistance (Medicaid, food stamps, SSI, TANF, etc.).\n\nAsk the clerk for the "Application for Determination of Civil Indigent Status" form.',
      showIf: (answers) => answers.can_afford_fee === 'no',
    },

    // === Venue ===
    {
      id: 'know_venue',
      type: 'yes_no',
      prompt: 'Do you know which county to file in?',
    },
    {
      id: 'venue_info',
      type: 'info',
      prompt:
        'VENUE — WHERE TO FILE (Fla. Stat. §47.011)\n\nFile in the County Court, Small Claims Division in either:\n\n• The county where the DEFENDANT resides, OR\n• The county where the cause of action accrued (where the event or transaction happened)\n\nIf the defendant is a business, file where the business has an office or where the transaction occurred. If you file in the wrong county, the defendant can ask to have the case transferred, delaying your case.',
      showIf: (answers) => answers.know_venue === 'no',
    },

    // === Complaint Preparation ===
    {
      id: 'have_complaint_ready',
      type: 'yes_no',
      prompt: 'Do you have your Statement of Claim (complaint) ready?',
      helpText:
        'Florida small claims uses a simplified complaint form called a "Statement of Claim" (Fla. Sm. Cl. R. 7.010). Many clerk offices provide a fill-in-the-blank form.',
    },
    {
      id: 'complaint_prep_info',
      type: 'info',
      prompt:
        'PREPARING YOUR STATEMENT OF CLAIM (Fla. Sm. Cl. R. 7.010)\n\nYour complaint must include:\n\n1. Your full legal name and address (plaintiff)\n2. The defendant\'s full legal name and address\n3. A short, plain statement of the facts — what happened and why the defendant owes you money\n4. The specific dollar amount you are claiming (up to $8,000)\n5. Whether you have attempted to resolve the dispute before filing\n\nKeep it simple and factual. You do NOT need legal jargon. Many clerks have pre-printed forms — ask at the clerk\'s office or download from your county\'s court website.\n\nTIP: Attach copies (not originals) of key evidence to your complaint — contracts, receipts, photos, text messages, etc.',
      showIf: (answers) => answers.have_complaint_ready === 'no',
    },

    // === Defendant Information ===
    {
      id: 'have_defendant_address',
      type: 'yes_no',
      prompt: 'Do you have the defendant\'s current address?',
    },
    {
      id: 'defendant_address_info',
      type: 'info',
      prompt:
        'You MUST have the defendant\'s physical address for service of process. Florida requires personal service — you cannot just mail the complaint.\n\nIf you don\'t have their address, try:\n• The original contract or invoice\n• Florida Division of Corporations (sunbiz.org) for businesses\n• County property appraiser records\n• Florida voter registration records\n• White pages or people-search websites\n\nIf you truly cannot locate the defendant, you may request service by publication as a last resort, but this is expensive and rarely successful in small claims.',
      showIf: (answers) => answers.have_defendant_address === 'no',
    },

    // === Filing Method ===
    {
      id: 'filing_method',
      type: 'single_choice',
      prompt: 'How do you plan to file your case?',
      options: [
        { value: 'efiling', label: 'Online at myflcourtaccess.com (e-filing)' },
        { value: 'in_person', label: 'In person at the clerk\'s office' },
        { value: 'not_sure', label: 'Not sure yet' },
      ],
    },
    {
      id: 'efiling_info',
      type: 'info',
      prompt:
        'E-FILING THROUGH MYFLCOURTACCESS.COM\n\nFlorida offers electronic filing through the statewide portal at myflcourtaccess.com.\n\n1. Create a free account at myflcourtaccess.com\n2. Select your county and "Small Claims" as the case type\n3. Upload your Statement of Claim as a PDF\n4. Pay the filing fee online (credit/debit card or e-check)\n5. The system will generate a case number and filing confirmation\n\nE-filing is available 24/7 and is often faster than filing in person. There may be a small e-filing service provider fee ($3-$5) in addition to the court filing fee.',
      showIf: (answers) => answers.filing_method === 'efiling',
    },
    {
      id: 'in_person_info',
      type: 'info',
      prompt:
        'FILING IN PERSON\n\nBring to the clerk\'s office:\n• Your completed Statement of Claim (original + 1 copy per defendant)\n• Filing fee (check if the clerk accepts cash, check, or card)\n• The defendant\'s address for service\n• Copies of any supporting documents\n\nThe clerk can help with procedural questions but cannot give legal advice. Some clerks have notaries on site if your form requires notarization.',
      showIf: (answers) => answers.filing_method === 'in_person',
    },
    {
      id: 'not_sure_filing_info',
      type: 'info',
      prompt:
        'If you are unsure, going in person to the clerk\'s office is the easiest option for first-time filers. The clerk can provide forms and help with procedural questions. You can also e-file at myflcourtaccess.com from home.',
      showIf: (answers) => answers.filing_method === 'not_sure',
    },

    // === Service of Process ===
    {
      id: 'service_info',
      type: 'info',
      prompt:
        'SERVICE OF PROCESS (Fla. Stat. §48.031)\n\nAfter filing, the defendant must be formally served. Florida requires service by:\n\n• Sheriff\'s office — request through the clerk; fees are typically $10-$40\n• Certified process server — a private option, often faster\n\nYou CANNOT serve the defendant yourself.\n\nOnce served, the defendant has 5 days to respond under summary procedure (Fla. Stat. §51.011). In practice, the court sets a pretrial conference date at filing, which is the more important deadline.\n\nThe clerk will include a notice of the pretrial conference date with the served documents.',
    },

    // === Pretrial Conference ===
    {
      id: 'pretrial_info',
      type: 'info',
      prompt:
        'MANDATORY PRETRIAL CONFERENCE (Fla. Sm. Cl. R. 7.090)\n\nFlorida small claims requires a pretrial conference BEFORE any trial. This is mandatory — you MUST attend or your case may be dismissed.\n\nAt the pretrial conference:\n1. Mediation is attempted — a neutral mediator tries to help you reach a settlement\n2. If mediation fails, the judge sets a trial date or may try the case that day if both parties agree\n3. Bring ALL your evidence and witnesses to the pretrial conference in case the judge decides to proceed immediately\n\nMany cases settle at the pretrial conference through mediation. Come prepared with your best settlement offer and your bottom line.',
    },

    // === Attorneys and Representation ===
    {
      id: 'plan_attorney',
      type: 'single_choice',
      prompt: 'Do you plan to have an attorney represent you?',
      helpText:
        'Unlike some states, Florida ALLOWS attorneys in small claims court. However, most people represent themselves (pro se).',
      options: [
        { value: 'yes', label: 'Yes, I have or will hire an attorney' },
        { value: 'no', label: 'No, I will represent myself (pro se)' },
        { value: 'unsure', label: 'Not sure yet' },
      ],
    },
    {
      id: 'pro_se_info',
      type: 'info',
      prompt:
        'REPRESENTING YOURSELF (PRO SE)\n\nSmall claims court is designed for self-represented parties. Tips:\n\n• Organize your evidence clearly — label each document\n• Prepare a simple timeline of events\n• Practice explaining your case in 5 minutes or less\n• Be respectful and address the judge as "Your Honor"\n• Arrive early and dress appropriately\n• Bring 3 copies of all documents (one for you, one for the judge, one for the defendant)\n\nFlorida Bar lawyer referral service: 1-800-342-8011\nFlorida Legal Aid: floridalawhelp.org',
      showIf: (answers) => answers.plan_attorney === 'no' || answers.plan_attorney === 'unsure',
    },

    // === Counterclaims ===
    {
      id: 'counterclaim_info',
      type: 'info',
      prompt:
        'COUNTERCLAIMS (Fla. Sm. Cl. R. 7.100)\n\nBe aware: the defendant can file a counterclaim against you for up to $8,000. If they do, you must respond. If the counterclaim exceeds $8,000, the entire case may be transferred to regular County Court civil division, which has more complex procedures.\n\nPrepare for this possibility by gathering evidence that addresses any claims the defendant might raise against you.',
    },

    // === Jury Demand ===
    {
      id: 'jury_info',
      type: 'info',
      prompt:
        'JURY TRIAL\n\nSmall claims cases are normally tried before a county judge without a jury. However, either party can demand a jury trial if the amount in dispute exceeds $5,000.\n\nA jury demand transfers the case out of the simplified small claims procedure into regular County Court, which involves more formal rules. In most cases, a bench trial (judge only) is faster and simpler.',
    },

    // === Discovery ===
    {
      id: 'discovery_info',
      type: 'info',
      prompt:
        'DISCOVERY — VERY LIMITED (Fla. Sm. Cl. R. 7.020)\n\nFlorida small claims allows only very limited discovery:\n\n• Unsworn statements (informal depositions) of parties only — not non-party witnesses\n• Document requests by court order only\n• No interrogatories, no formal depositions, no requests for admission\n\nThis means you should gather your evidence BEFORE filing. Do not rely on discovery to build your case. Bring everything you need to prove your claim to the pretrial conference.',
    },

    // === Judgment Enforcement ===
    {
      id: 'enforcement_info',
      type: 'info',
      prompt:
        'COLLECTING YOUR JUDGMENT\n\nIf you win, the defendant may not pay voluntarily. Florida enforcement options:\n\n• Wage garnishment — up to 25% of disposable earnings, or the amount exceeding 30 times federal minimum wage, whichever is less\n• Bank account levy — through a Writ of Garnishment\n• Property liens — record the judgment in any county where defendant owns property\n\nIMPORTANT FLORIDA EXEMPTIONS:\n• Head of household exemption — wages of a head of household providing more than half the support for a dependent cannot be garnished (unless they agree in writing)\n• Homestead exemption — the defendant\'s primary residence is fully exempt from forced sale (unlimited value, up to half acre in municipality or 160 acres outside)\n• Personal property exemption — up to $1,000 in personal property\n\nJudgments are valid for 20 years in Florida and accrue interest at the statutory rate.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Claim amount / jurisdiction
    if (answers.claim_amount === 'over_8000') {
      items.push({
        status: 'needed',
        text: 'Your claim exceeds $8,000. Reduce to $8,000 for small claims or file in County Court civil division.',
      })
    } else if (answers.claim_amount) {
      const amountLabels: Record<string, string> = {
        under_2500: 'under $2,500',
        '2500_5000': '$2,500 to $5,000',
        '5001_8000': '$5,001 to $8,000',
      }
      items.push({
        status: 'done',
        text: `Claim amount (${amountLabels[answers.claim_amount]}) is within small claims jurisdiction.`,
      })
    }

    // Filing fee
    if (answers.know_filing_fee === 'yes') {
      items.push({ status: 'done', text: 'Filing fee amount identified.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Confirm filing fee with your county clerk ($55-$300 depending on claim amount).',
      })
    }

    // Fee waiver
    if (answers.can_afford_fee === 'no') {
      items.push({
        status: 'needed',
        text: 'Request an Application for Determination of Civil Indigent Status from the clerk (Fla. Stat. §57.081).',
      })
    } else if (answers.can_afford_fee === 'yes') {
      items.push({ status: 'done', text: 'Filing fee is affordable.' })
    }

    // Venue
    if (answers.know_venue === 'yes') {
      items.push({ status: 'done', text: 'Correct county identified for filing.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Identify the correct county: where the defendant resides or where the cause of action accrued (Fla. Stat. §47.011).',
      })
    }

    // Complaint
    if (answers.have_complaint_ready === 'yes') {
      items.push({ status: 'done', text: 'Statement of Claim is ready.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Prepare your Statement of Claim — get the form from the clerk or your county court website.',
      })
    }

    // Defendant address
    if (answers.have_defendant_address === 'yes') {
      items.push({ status: 'done', text: 'Defendant\'s address confirmed.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Locate the defendant\'s current address for service of process.',
      })
    }

    // Filing method
    if (answers.filing_method && answers.filing_method !== 'not_sure') {
      const labels: Record<string, string> = {
        efiling: 'online at myflcourtaccess.com',
        in_person: 'in person at the clerk\'s office',
      }
      items.push({
        status: 'done',
        text: `Filing method chosen: ${labels[answers.filing_method]}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Choose a filing method: in person at the clerk\'s office or online at myflcourtaccess.com.',
      })
    }

    // Attorney
    if (answers.plan_attorney === 'yes') {
      items.push({ status: 'done', text: 'Attorney representation planned.' })
    } else if (answers.plan_attorney === 'no') {
      items.push({
        status: 'info',
        text: 'Self-represented (pro se). Florida Bar referral: 1-800-342-8011.',
      })
    }

    // Always-needed items
    items.push({
      status: 'needed',
      text: 'After filing, arrange service on the defendant via sheriff or certified process server (Fla. Stat. §48.031).',
    })

    items.push({
      status: 'info',
      text: 'A mandatory pretrial conference with mediation will be scheduled (Fla. Sm. Cl. R. 7.090). Bring ALL evidence and witnesses.',
    })

    return items
  },
}
