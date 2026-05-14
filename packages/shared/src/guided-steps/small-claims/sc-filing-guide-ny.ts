import type { GuidedStepConfig } from '../types'

export const scFilingGuideNyConfig: GuidedStepConfig = {
  title: 'File a Small Claims Case in New York',
  reassurance:
    'New York small claims court is designed for people without lawyers. No formal pleading is required — you fill out a simple Statement of Claim form at the clerk\'s office.',

  questions: [
    // === Eligibility ===
    {
      id: 'eligibility_info',
      type: 'info',
      prompt:
        'WHO CAN FILE IN SMALL CLAIMS COURT\n\nYou must be at least 18 years old and filing as an individual (not a corporation, LLC, or partnership). Businesses must use Commercial Small Claims Court.\n\nIf you are under 18, a parent or legal guardian can file on your behalf.',
    },
    {
      id: 'is_individual',
      type: 'yes_no',
      prompt: 'Are you filing as an individual (not a business)?',
      helpText:
        'Corporations, LLCs, and partnerships cannot use regular small claims court. They must file in Commercial Small Claims Court (up to $10,000).',
    },
    {
      id: 'business_redirect',
      type: 'info',
      prompt:
        'COMMERCIAL SMALL CLAIMS COURT\n\nBusinesses (corporations, LLCs, partnerships) must file in Commercial Small Claims Court, which handles claims up to $10,000. The process is similar but separate.\n\nSole proprietors can file in regular small claims court as individuals.',
      showIf: (answers) => answers.is_individual === 'no',
    },

    // === Location ===
    {
      id: 'claim_location',
      type: 'single_choice',
      prompt: 'Where did the problem occur or where does the defendant live/work?',
      helpText:
        'This determines which court you file in and your maximum claim amount. NYC includes Manhattan, Brooklyn, Queens, the Bronx, and Staten Island.',
      options: [
        { value: 'nyc', label: 'New York City (five boroughs)' },
        { value: 'outside_nyc', label: 'Outside New York City' },
        { value: 'unsure', label: 'I am not sure' },
      ],
    },
    {
      id: 'nyc_limit_info',
      type: 'info',
      prompt:
        'NYC SMALL CLAIMS: UP TO $10,000\n\nIn New York City, small claims court handles cases up to $10,000 (NYC Civil Court Act §1801). Cases are heard in NYC Civil Court, Small Claims Part.\n\nThere is one small claims court in each borough:\n• Manhattan — 111 Centre Street\n• Brooklyn — 141 Livingston Street\n• Queens — 89-17 Sutphin Boulevard\n• Bronx — 851 Grand Concourse\n• Staten Island — 927 Castleton Avenue\n\nHearings are typically held in the evening (5:30-6:30 PM start times).',
      showIf: (answers) => answers.claim_location === 'nyc',
    },
    {
      id: 'outside_nyc_limit_info',
      type: 'info',
      prompt:
        'OUTSIDE NYC SMALL CLAIMS: UP TO $5,000\n\nOutside New York City, small claims court handles cases up to $5,000 (UJCA §1801). Cases are heard in City Courts, Town Courts, or Village Courts depending on your location.\n\nContact the clerk of the local court where the defendant lives or works, or where the transaction occurred.',
      showIf: (answers) =>
        answers.claim_location === 'outside_nyc' || answers.claim_location === 'unsure',
    },

    // === Claim Amount ===
    {
      id: 'claim_amount',
      type: 'single_choice',
      prompt: 'How much are you claiming?',
      helpText:
        'If your claim exceeds the small claims limit, you can reduce it to fit — but you give up the excess. You cannot split one claim into multiple cases.',
      options: [
        { value: 'under_5000', label: 'Under $5,000' },
        { value: '5000_to_10000', label: '$5,000 to $10,000' },
        { value: 'over_10000', label: 'Over $10,000' },
      ],
    },
    {
      id: 'over_limit_warning',
      type: 'info',
      prompt:
        'YOUR CLAIM EXCEEDS THE SMALL CLAIMS LIMIT\n\nYou have two options:\n\n1. Reduce your claim to the small claims limit ($10,000 in NYC, $5,000 outside NYC) and file in small claims court. You permanently waive the excess amount.\n\n2. File in a higher court (NYC Civil Court up to $50,000, or Supreme Court for any amount). This involves more formal procedures and you may want an attorney.\n\nMost people choose option 1 for the speed and simplicity of small claims court.',
      showIf: (answers) => answers.claim_amount === 'over_10000',
    },
    {
      id: 'outside_nyc_5k_warning',
      type: 'info',
      prompt:
        'CLAIM MAY EXCEED YOUR COURT\'S LIMIT\n\nOutside NYC, the small claims limit is $5,000. If your claim is between $5,000 and $10,000, you would need to file in City Court (regular part) or reduce your claim to $5,000.\n\nIf you are in a City Court that also has a small claims part, check with the clerk about the exact limit for your court.',
      showIf: (answers) =>
        answers.claim_location === 'outside_nyc' && answers.claim_amount === '5000_to_10000',
    },

    // === Venue ===
    {
      id: 'venue_info',
      type: 'info',
      prompt:
        'WHERE TO FILE (VENUE)\n\nYou must file in the court where:\n• The defendant lives, OR\n• The defendant works, OR\n• The transaction or event that caused your claim occurred\n\nIf the defendant is a business, file where the business is located or where you dealt with them.\n\nFiling in the wrong court can get your case dismissed. If you are unsure, the clerk can help you determine the correct venue.',
    },

    // === Filing Process ===
    {
      id: 'filing_process_info',
      type: 'info',
      prompt:
        'HOW TO FILE\n\nFiling is simple — no formal legal complaint is required:\n\n1. Go to the small claims clerk\'s office during business hours (or evening filing hours in NYC)\n2. Fill out a Statement of Claim form — the clerk can help you\n3. Provide the defendant\'s full name and address (you need this for service)\n4. Pay the filing fee\n5. The clerk will give you a hearing date\n\nYou can also file online in some NYC courts via nycourts.gov.\n\nBring: valid ID, defendant\'s full name and address, and your filing fee (cash, money order, or check — policies vary by court).',
    },

    // === Filing Fee ===
    {
      id: 'can_afford_fee',
      type: 'yes_no',
      prompt: 'Can you afford the filing fee?',
      helpText:
        'Filing fees are $10-$20 in NYC and $10-$15 outside NYC, depending on the claim amount. These are among the lowest court filing fees in the state.',
    },
    {
      id: 'fee_waiver_info',
      type: 'info',
      prompt:
        'FEE WAIVER\n\nIf you cannot afford the filing fee, you can request a fee waiver by filing a Poor Person Application (CPLR Article 11). The clerk can provide this form.\n\nYou will need to show that paying the fee would be a financial hardship. If approved, your filing fee and service costs are waived.',
      showIf: (answers) => answers.can_afford_fee === 'no',
    },

    // === Service of Process ===
    {
      id: 'service_info',
      type: 'info',
      prompt:
        'HOW THE DEFENDANT GETS NOTIFIED (SERVICE)\n\nAfter you file, the court sends notice to the defendant by certified mail. You do not need to arrange this yourself initially.\n\nHowever, if the certified mail is undeliverable (defendant does not sign for it), you will be responsible for arranging personal service — having someone 18 or older (not you) hand-deliver the papers to the defendant.\n\nThe clerk will notify you if personal service is needed and explain the process.',
    },

    // === Defendant Info ===
    {
      id: 'know_defendant_address',
      type: 'yes_no',
      prompt: "Do you have the defendant's current address?",
      helpText:
        'You need the defendant\'s actual address for the court to mail notice. A P.O. Box alone may not be sufficient.',
    },
    {
      id: 'find_address_info',
      type: 'info',
      prompt:
        'FINDING THE DEFENDANT\'S ADDRESS\n\nYou need a physical address where the defendant can receive mail. Options:\n\n• For businesses: check the NY Secretary of State\'s Corporation and Business Entity Database (dos.ny.gov) for registered addresses\n• For individuals: check any contracts, invoices, or correspondence you have\n• White pages or online people-search tools\n• If the defendant is a licensed professional, check their licensing board\n\nThe clerk cannot help you find the defendant\'s address — you must provide it when filing.',
      showIf: (answers) => answers.know_defendant_address === 'no',
    },

    // === Arbitration vs. Judge ===
    {
      id: 'arbitration_info',
      type: 'info',
      prompt:
        'ARBITRATION VS. JUDGE — IMPORTANT CHOICE\n\nOn your hearing night, you may be offered two options:\n\n1. ARBITRATOR (volunteer attorney) — faster, usually heard the same night. However, the arbitrator\'s decision is FINAL. Neither side can appeal.\n\n2. JUDGE — you may have to come back another night. But if the judge decides against you, the DEFENDANT can appeal (you as plaintiff CANNOT appeal a judge\'s decision under UCCA §1807).\n\nKey point: As the plaintiff, you cannot appeal regardless of who hears the case. Choose the arbitrator if you want a faster resolution and are confident in your evidence.',
    },

    // === Mediation ===
    {
      id: 'mediation_info',
      type: 'info',
      prompt:
        'MEDIATION — OFTEN OFFERED FIRST\n\nBefore your hearing, the court may offer free mediation. A trained mediator helps you and the defendant negotiate a settlement.\n\nBenefits of mediation:\n• Faster than waiting for a hearing\n• You control the outcome (vs. a judge deciding)\n• Agreements are enforceable like a court judgment\n• Preserves relationships (useful for landlord/tenant, neighbor disputes)\n\nMediation is voluntary — if it does not work, your case goes to a hearing as scheduled.\n\nIn NYC, mediators are available on hearing nights at no cost.',
    },

    // === Hearing Preparation ===
    {
      id: 'evidence_info',
      type: 'info',
      prompt:
        'WHAT TO BRING TO YOUR HEARING\n\nSmall claims hearings are informal — no formal discovery, no rules of evidence in the traditional sense. But organization wins cases.\n\nBring:\n• All contracts, receipts, invoices, or agreements related to your claim\n• Photos or videos showing damage or the problem\n• Text messages, emails, or letters between you and the defendant\n• Estimates or repair bills showing your damages\n• Witnesses who saw what happened (or signed written statements)\n• A clear, brief written summary of your claim for your own reference\n\nOrganize documents in chronological order. Bring originals and at least two copies (one for the judge, one for the defendant).',
    },

    // === Attorney Info ===
    {
      id: 'attorney_info',
      type: 'info',
      prompt:
        'DO YOU NEED A LAWYER?\n\nNo. Small claims court is designed for self-represented individuals. Most claimants do not have attorneys.\n\nAttorneys are allowed but not required. If the defendant has an attorney and you do not, do not panic — the judge knows this is a court for regular people and will let you present your case informally.\n\nFree legal help:\n• NYC: free legal assistance is available through the Civil Justice Center and legal aid organizations\n• Outside NYC: contact your local bar association for free consultations or legal aid\n• Interpreters are available at no cost in NYC courts — request one when filing if needed',
    },

    // === After Judgment ===
    {
      id: 'judgment_info',
      type: 'info',
      prompt:
        'AFTER THE HEARING — JUDGMENT AND COLLECTION\n\nThe judge or arbitrator\'s decision is mailed to both parties within a few days.\n\nIf you win and the defendant does not pay voluntarily, you can enforce the judgment:\n\n• Income execution (wage garnishment) — CPLR §5231\n• Bank levy — CPLR §5222-a (note: the first $3,600 in a bank account is exempt from levy)\n• Information subpoena — compel the defendant to disclose assets and income\n\nThe court does not collect money for you. You may need to hire a marshal or sheriff to enforce the judgment.\n\nImportant: Judgments earn 9% annual interest and are valid for 20 years in New York.',
    },

    // === Appeal Limitations ===
    {
      id: 'appeal_info',
      type: 'info',
      prompt:
        'APPEAL RULES — KNOW BEFORE YOU FILE\n\nSmall claims appeal rules are unusual in New York:\n\n• If a JUDGE hears your case: only the DEFENDANT can appeal. As the plaintiff, you CANNOT appeal (UCCA §1807).\n• If an ARBITRATOR hears your case: NEITHER party can appeal. The decision is final.\n• Appeals must be filed within 30 days of the judgment.\n• Appeals are based on the record — no new trial.\n\nThis means your first hearing is likely your only chance. Come prepared with all your evidence.',
    },

    // === Key Differences from Other Courts ===
    {
      id: 'ccfa_note',
      type: 'info',
      prompt:
        'IMPORTANT: CONSUMER CREDIT FAIRNESS ACT DOES NOT APPLY HERE\n\nThe Consumer Credit Fairness Act (CCFA), which provides extra protections in debt collection lawsuits, does NOT apply to small claims court cases. Small claims court operates on a separate procedural track.\n\nIf you are being sued for a consumer debt, the case would typically be filed in Civil Court or City Court — not in small claims court. If a debt collector has filed against you in small claims court, you may want to challenge whether that is the proper venue.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Eligibility
    if (answers.is_individual === 'no') {
      items.push({
        status: 'info',
        text: 'You may need to file in Commercial Small Claims Court instead of regular small claims.',
      })
    }

    // Location and limits
    if (answers.claim_location === 'nyc') {
      items.push({
        status: 'info',
        text: 'NYC Small Claims Court — claims up to $10,000 (NYC Civil Court Act §1801).',
      })
    } else if (answers.claim_location === 'outside_nyc') {
      items.push({
        status: 'info',
        text: 'Small Claims Court outside NYC — claims up to $5,000 (UJCA §1801).',
      })
    }

    // Claim amount issues
    if (answers.claim_amount === 'over_10000') {
      items.push({
        status: 'needed',
        text: 'Your claim exceeds the small claims limit. Reduce it or file in a higher court.',
      })
    } else if (
      answers.claim_location === 'outside_nyc' &&
      answers.claim_amount === '5000_to_10000'
    ) {
      items.push({
        status: 'needed',
        text: 'Your claim may exceed the $5,000 limit outside NYC. Check with the clerk or consider reducing.',
      })
    }

    // Filing fee
    if (answers.can_afford_fee === 'yes') {
      items.push({ status: 'done', text: 'You can afford the filing fee.' })
    } else if (answers.can_afford_fee === 'no') {
      items.push({
        status: 'needed',
        text: 'File a Poor Person Application (CPLR Article 11) to request a fee waiver.',
      })
    }

    // Defendant address
    if (answers.know_defendant_address === 'yes') {
      items.push({ status: 'done', text: "You have the defendant's address for service." })
    } else if (answers.know_defendant_address === 'no') {
      items.push({
        status: 'needed',
        text: "Obtain the defendant's physical address before filing.",
      })
    }

    // Filing steps
    items.push({
      status: 'needed',
      text: 'Go to the small claims clerk and fill out a Statement of Claim form.',
    })

    const feeRange =
      answers.claim_location === 'nyc' ? '$10-$20' : '$10-$15'
    items.push({
      status: 'needed',
      text: `Pay the filing fee (${feeRange}) and receive your hearing date.`,
    })

    items.push({
      status: 'info',
      text: 'Bring all evidence organized chronologically with copies for the judge and defendant.',
    })

    items.push({
      status: 'info',
      text: 'As plaintiff, you cannot appeal — your hearing is likely your only chance. Come fully prepared.',
    })

    return items
  },
}
