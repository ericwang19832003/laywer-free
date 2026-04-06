import type { GuidedStepConfig } from '../types'

export const scFilingGuideCaConfig: GuidedStepConfig = {
  title: 'How to File Your Small Claims Case in California',
  reassurance:
    'California small claims court is designed for people without lawyers. The process is straightforward — you fill out one form, pay a fee, and get a hearing date.',

  questions: [
    // === Jurisdiction Check ===
    {
      id: 'claim_amount_check',
      type: 'single_choice',
      prompt: 'How much are you claiming?',
      helpText:
        'California small claims jurisdiction depends on who is filing. Individuals can claim up to $10,000. Corporations, LLCs, partnerships, and other entities are limited to $5,000 (CCP §116.220-116.221).',
      options: [
        { value: 'under_5k', label: 'Under $5,000' },
        { value: '5k_to_10k', label: '$5,000 to $10,000' },
        { value: 'over_10k', label: 'Over $10,000' },
      ],
    },
    {
      id: 'filer_type',
      type: 'single_choice',
      prompt: 'Who is filing the claim?',
      helpText:
        'Corporations, LLCs, and other entities are limited to $5,000 in small claims (CCP §116.221). Individuals can claim up to $10,000.',
      options: [
        { value: 'individual', label: 'Individual person' },
        { value: 'sole_proprietor', label: 'Sole proprietor (filing in own name)' },
        { value: 'entity', label: 'Corporation, LLC, or partnership' },
      ],
      showIf: (answers) => answers.claim_amount_check === '5k_to_10k',
    },
    {
      id: 'entity_limit_warning',
      type: 'info',
      prompt:
        'ENTITY LIMIT: $5,000 MAXIMUM\n\nCorporations, LLCs, and partnerships can only claim up to $5,000 in small claims court (CCP §116.221). If your claim exceeds $5,000, you must either:\n\n• Reduce your claim to $5,000 (waiving the excess), or\n• File in Superior Court (limited civil division) instead.',
      showIf: (answers) =>
        answers.claim_amount_check === '5k_to_10k' && answers.filer_type === 'entity',
    },
    {
      id: 'over_limit_warning',
      type: 'info',
      prompt:
        'OVER THE SMALL CLAIMS LIMIT\n\nThe maximum for individuals is $10,000 and for entities is $5,000. If your claim exceeds the limit, you can:\n\n• Reduce your claim to the maximum and waive the excess, or\n• File in Superior Court (limited civil division for claims up to $25,000).\n\nMany people waive the excess to stay in small claims because it is faster, cheaper, and simpler.',
      showIf: (answers) => answers.claim_amount_check === 'over_10k',
    },
    {
      id: 'annual_limit_check',
      type: 'yes_no',
      prompt: 'Have you filed 2 or more small claims over $2,500 this calendar year?',
      helpText:
        'California limits individuals to 2 small claims over $2,500 per year (CCP §116.231). There is no limit on claims of $2,500 or less.',
    },
    {
      id: 'annual_limit_warning',
      type: 'info',
      prompt:
        'ANNUAL FILING LIMIT REACHED\n\nYou can only file 2 small claims over $2,500 per calendar year (CCP §116.231). You must wait until next year, reduce your claim to $2,500, or file in Superior Court instead.',
      showIf: (answers) => answers.annual_limit_check === 'yes',
    },

    // === Claim Type ===
    {
      id: 'claim_type',
      type: 'single_choice',
      prompt: 'What type of claim are you filing?',
      helpText:
        'This helps determine what evidence you will need at your hearing.',
      options: [
        { value: 'security_deposit', label: 'Security deposit not returned' },
        { value: 'property_damage', label: 'Property damage' },
        { value: 'breach_contract', label: 'Breach of contract' },
        { value: 'auto_accident', label: 'Auto accident' },
        { value: 'unpaid_services', label: 'Unpaid services or goods' },
        { value: 'other', label: 'Other' },
      ],
    },

    // === No Attorneys ===
    {
      id: 'no_attorneys_info',
      type: 'info',
      prompt:
        'NO ATTORNEYS IN SMALL CLAIMS COURT\n\nIn California, attorneys are NOT allowed to represent parties in small claims court (CCP §116.530). You must appear in person and present your own case. This levels the playing field — the other side cannot hire a lawyer either.\n\nException: An attorney can appear if they are a party to the dispute (suing or being sued personally).',
    },

    // === The Form ===
    {
      id: 'have_form',
      type: 'yes_no',
      prompt: 'Do you have Form SC-100 (Plaintiff\'s Claim and ORDER to Go to Small Claims Court)?',
      helpText:
        'This is the only form you need to file. No formal legal pleading is required.',
    },
    {
      id: 'form_info',
      type: 'info',
      prompt:
        'GET FORM SC-100\n\nDownload it free from the California Courts website (courts.ca.gov/forms) or pick one up at your local courthouse clerk\'s office.\n\nThe form asks for:\n• Your name and address\n• Defendant\'s name and address\n• Amount you are claiming\n• Brief description of why the defendant owes you\n• Date the dispute arose\n\nNo legal jargon needed — describe what happened in plain English.',
      showIf: (answers) => answers.have_form === 'no',
    },

    // === Venue ===
    {
      id: 'know_venue',
      type: 'yes_no',
      prompt: 'Do you know which courthouse to file in?',
      helpText:
        'California has specific venue rules for small claims (CCP §116.370).',
    },
    {
      id: 'venue_info',
      type: 'info',
      prompt:
        'VENUE RULES (CCP §116.370)\n\nYou must file in the correct court. Generally, file where:\n\n• The defendant lives (or has a principal place of business), OR\n• The obligation was to be performed (where the work was done, where the contract was to be carried out), OR\n• The contract was signed, OR\n• The defendant caused injury or damage.\n\nFor security deposit cases, file where the rental property is located.',
      showIf: (answers) => answers.know_venue === 'no',
    },

    // === Filing Fee ===
    {
      id: 'know_filing_fee',
      type: 'yes_no',
      prompt: 'Do you know your filing fee?',
    },
    {
      id: 'filing_fee_info',
      type: 'info',
      prompt:
        'FILING FEES\n\n• Claims up to $1,500: $30\n• Claims $1,500.01 to $5,000: $50\n• Claims $5,000.01 to $10,000: $75\n\nYou can also recover the filing fee as part of your judgment if you win.',
      showIf: (answers) => answers.know_filing_fee === 'no',
    },
    {
      id: 'can_afford_fee',
      type: 'yes_no',
      prompt: 'Can you afford the filing fee?',
    },
    {
      id: 'fee_waiver_info',
      type: 'info',
      prompt:
        'FEE WAIVER AVAILABLE\n\nIf you cannot afford the filing fee, file a Fee Waiver Request (Form FW-001) with your claim. You may qualify if you receive public benefits, your income is below 125% of the federal poverty level, or paying the fee would leave you unable to afford basic necessities.',
      showIf: (answers) => answers.can_afford_fee === 'no',
    },

    // === Defendant Info ===
    {
      id: 'have_defendant_address',
      type: 'yes_no',
      prompt: 'Do you have the defendant\'s current address?',
      helpText:
        'You need the defendant\'s address both for the claim form and for service.',
    },
    {
      id: 'defendant_address_info',
      type: 'info',
      prompt:
        'FINDING THE DEFENDANT\'S ADDRESS\n\nYou need a physical address — not a P.O. Box. Try:\n\n• The original contract or invoice\n• California Secretary of State website (for businesses: bizfileportal.sos.ca.gov)\n• County assessor records (for property owners)\n• DMV records (for auto accident defendants — request through the court)\n• Online search tools',
      showIf: (answers) => answers.have_defendant_address === 'no',
    },

    // === Service Requirements ===
    {
      id: 'service_info',
      type: 'info',
      prompt:
        'SERVICE REQUIREMENTS (CCP §116.340)\n\nAfter filing, you must serve the defendant with a copy of your claim. Rules:\n\n• Must be served at least 15 days before the hearing (or 20 days if outside your county)\n• YOU CANNOT SERVE IT YOURSELF — someone 18+ who is not a party must do it\n• Methods: personal service (best), substituted service, or certified mail through the clerk\n• Keep proof of service — you will need to file it with the court\n\nThe clerk can arrange service by certified mail for a small fee.',
    },

    // === Hearing Preparation ===
    {
      id: 'mediation_interest',
      type: 'yes_no',
      prompt: 'Are you interested in mediation before the hearing?',
      helpText:
        'Many courts offer free mediation on the day of the hearing. A neutral mediator helps you and the defendant reach an agreement. If mediation fails, you still get your hearing.',
    },
    {
      id: 'mediation_info',
      type: 'info',
      prompt:
        'MEDIATION IS AVAILABLE\n\nMany California courts offer free or low-cost mediation, often on the day of the hearing. Benefits:\n\n• Faster resolution\n• You control the outcome (vs. the judge deciding)\n• Agreements reached in mediation are enforceable\n• If it fails, your hearing still proceeds\n\nAsk the clerk about your court\'s mediation program when you file.',
      showIf: (answers) => answers.mediation_interest === 'yes',
    },
    {
      id: 'hearing_prep_info',
      type: 'info',
      prompt:
        'PREPARE FOR YOUR HEARING\n\nThe hearing is informal — the judge asks questions and reviews evidence. No formal rules of evidence apply. Tips:\n\n• Bring 3 COPIES of everything: one for you, one for the judge, one for the defendant\n• Organize evidence chronologically\n• Prepare a brief summary of what happened (2-3 minutes)\n• Bring witnesses if possible (or written declarations)\n• Bring the original contract, receipts, photos, texts, emails — anything that supports your claim\n• Arrive early and dress respectfully',
    },

    // === Appeal Warning ===
    {
      id: 'appeal_warning',
      type: 'info',
      prompt:
        'IMPORTANT: APPEAL RULES FOR PLAINTIFFS\n\nIf you file as the plaintiff and lose, you CANNOT appeal (CCP §116.710). The judgment is final. Only the defendant can appeal for a new trial (trial de novo) in Superior Court within 30 days.\n\nThis means you should bring your strongest case to the hearing — you only get one shot.',
    },

    // === Judgment Collection ===
    {
      id: 'collection_info',
      type: 'info',
      prompt:
        'IF YOU WIN: COLLECTING YOUR JUDGMENT\n\nWinning a judgment does not mean you automatically get paid. If the defendant does not pay voluntarily, you can enforce the judgment using the same tools as regular civil cases:\n\n• Wage garnishment\n• Bank levy\n• Property lien\n• Till-tap levy (for businesses)\n\nThe court clerk can provide forms for enforcement. Judgments earn 10% annual interest and are valid for 10 years (renewable).',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Jurisdiction
    if (answers.claim_amount_check === 'over_10k') {
      items.push({
        status: 'needed',
        text: 'Claim exceeds small claims limit. Reduce claim or file in Superior Court.',
      })
    } else if (
      answers.claim_amount_check === '5k_to_10k' &&
      answers.filer_type === 'entity'
    ) {
      items.push({
        status: 'needed',
        text: 'Entity claims capped at $5,000. Reduce claim or file in Superior Court.',
      })
    } else {
      items.push({ status: 'done', text: 'Claim is within small claims jurisdiction.' })
    }

    if (answers.annual_limit_check === 'yes') {
      items.push({
        status: 'needed',
        text: 'Annual filing limit reached (2 claims over $2,500). Wait until next year or reduce claim.',
      })
    }

    // Claim type
    if (answers.claim_type) {
      const typeLabels: Record<string, string> = {
        security_deposit: 'Security deposit',
        property_damage: 'Property damage',
        breach_contract: 'Breach of contract',
        auto_accident: 'Auto accident',
        unpaid_services: 'Unpaid services or goods',
        other: 'Other claim type',
      }
      items.push({
        status: 'info',
        text: `Claim type: ${typeLabels[answers.claim_type] || answers.claim_type}.`,
      })
    }

    // Form
    if (answers.have_form === 'yes') {
      items.push({ status: 'done', text: 'Form SC-100 obtained.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Get Form SC-100 from courts.ca.gov/forms or the courthouse clerk.',
      })
    }

    // Venue
    if (answers.know_venue === 'yes') {
      items.push({ status: 'done', text: 'Correct courthouse identified.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Identify the correct courthouse per venue rules (CCP §116.370).',
      })
    }

    // Filing fee
    if (answers.know_filing_fee === 'yes') {
      items.push({ status: 'done', text: 'Filing fee amount confirmed.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Confirm filing fee: $30 (up to $1,500), $50 ($1,500-$5,000), or $75 ($5,000-$10,000).',
      })
    }

    if (answers.can_afford_fee === 'no') {
      items.push({
        status: 'needed',
        text: 'File Fee Waiver Request (Form FW-001) with your claim.',
      })
    }

    // Defendant address
    if (answers.have_defendant_address === 'yes') {
      items.push({ status: 'done', text: 'Defendant\'s address confirmed.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Locate defendant\'s physical address for the claim form and service.',
      })
    }

    // Service reminder
    items.push({
      status: 'needed',
      text: 'Serve defendant at least 15 days before hearing (CCP §116.340). You cannot serve it yourself.',
    })

    // Copies reminder
    items.push({
      status: 'needed',
      text: 'Prepare 3 copies of all evidence for the hearing (you, judge, defendant).',
    })

    // Appeal warning
    items.push({
      status: 'info',
      text: 'As plaintiff, you cannot appeal if you lose (CCP §116.710). Bring your strongest case.',
    })

    return items
  },
}
