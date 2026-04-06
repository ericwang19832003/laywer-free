import type { GuidedStepConfig } from '../types'

export const scFilingGuidePaConfig: GuidedStepConfig = {
  title: 'How to File Your Small Claims Case in Pennsylvania',
  reassurance:
    'Filing in Magisterial District Court is straightforward. No formal pleading is required — you fill out a complaint form at the MDJ office.',

  questions: [
    {
      id: 'pa_overview',
      type: 'info',
      prompt:
        'PENNSYLVANIA SMALL CLAIMS — MAGISTERIAL DISTRICT COURT\n\nPennsylvania small claims are filed in Magisterial District Court (MDJ) for amounts up to $12,000. The process is informal — no formal rules of evidence, no jury, and the judge decides the case at a hearing.\n\nPhiladelphia exception: Philadelphia uses Municipal Court instead of MDJ for claims up to $12,000. The process is similar but the courthouse and forms differ.',
    },
    {
      id: 'location',
      type: 'single_choice',
      prompt: 'Where will you be filing?',
      options: [
        { value: 'outside_philly', label: 'Outside Philadelphia (Magisterial District Court)' },
        { value: 'philadelphia', label: 'Philadelphia (Municipal Court)' },
        { value: 'unsure', label: 'I am not sure' },
      ],
    },
    {
      id: 'philly_info',
      type: 'info',
      prompt:
        'Philadelphia Municipal Court handles small claims up to $12,000. File at the Municipal Court Civil Division, 1339 Chestnut Street, 10th Floor. Forms are available at the clerk\'s office. The process is similar to MDJ but uses Municipal Court rules.',
      showIf: (answers) => answers.location === 'philadelphia',
    },
    {
      id: 'venue_unsure_info',
      type: 'info',
      prompt:
        'File in the Magisterial District Court where the defendant resides OR where the cause of action arose (e.g., where the contract was signed, where the damage occurred). If the defendant is in Philadelphia, file in Municipal Court instead.\n\nTo find your local MDJ office, visit the Unified Judicial System of Pennsylvania website or call your county courthouse.',
      showIf: (answers) => answers.unsure === 'unsure' || answers.location === 'unsure',
    },

    // === Venue ===
    {
      id: 'know_venue',
      type: 'yes_no',
      prompt: 'Do you know which MDJ office to file in?',
      helpText:
        'File where the defendant resides or where the cause of action arose (Pa.R.C.P.M.D.J. 302).',
      showIf: (answers) => answers.location !== 'philadelphia',
    },
    {
      id: 'venue_info',
      type: 'info',
      prompt:
        'Venue: File in the magisterial district where the defendant lives, OR where the transaction or incident occurred. If those are in different districts, you can choose either one.\n\nFind your MDJ: Visit the Unified Judicial System website (ujsportal.pacourts.us) or call your county courthouse for the correct MDJ office.',
      showIf: (answers) => answers.know_venue === 'no' && answers.location !== 'philadelphia',
    },

    // === Claim Amount ===
    {
      id: 'claim_amount',
      type: 'single_choice',
      prompt: 'Is your claim for $12,000 or less?',
      options: [
        { value: 'under_limit', label: 'Yes, $12,000 or less' },
        { value: 'over_limit', label: 'No, it exceeds $12,000' },
        { value: 'not_sure', label: 'I am not sure of the amount yet' },
      ],
    },
    {
      id: 'over_limit_info',
      type: 'info',
      prompt:
        'If your claim exceeds $12,000, you cannot file in Magisterial District Court. You would need to file in the Court of Common Pleas, which is more formal and has different procedures.\n\nAlternatively, you can voluntarily reduce your claim to $12,000 to stay in MDJ. You would give up the amount over $12,000, but the simpler process may be worth it.',
      showIf: (answers) => answers.claim_amount === 'over_limit',
    },

    // === Filing Fee ===
    {
      id: 'know_filing_fee',
      type: 'yes_no',
      prompt: 'Do you know the filing fee for your MDJ office?',
    },
    {
      id: 'filing_fee_info',
      type: 'info',
      prompt:
        'Filing fees in Pennsylvania MDJ Courts are approximately $50-$100 depending on the claim amount and county. Call your MDJ office for the exact fee. You will also pay a service fee for the constable or certified mail.\n\nIf you cannot afford the filing fee, you can file an In Forma Pauperis (IFP) petition to request a fee waiver.',
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
        'You can file a Petition to Proceed In Forma Pauperis (IFP) if you cannot afford the filing fee. The MDJ clerk can provide the form. You will need to show proof of income or public benefits. If approved, the filing fee and service costs are waived.',
      showIf: (answers) => answers.can_afford_fee === 'no',
    },

    // === Complaint Form ===
    {
      id: 'complaint_form_info',
      type: 'info',
      prompt:
        'NO FORMAL PLEADING REQUIRED\n\nUnlike the Court of Common Pleas, you do NOT need to draft a formal complaint. The MDJ office has a fill-in-the-blank complaint form. You provide:\n\n• Your name and address\n• The defendant\'s full name and address\n• The amount you are claiming\n• A brief description of what happened and why you are owed money\n\nThe clerk can help you fill out the form. Bring any supporting documents (contracts, invoices, photos, receipts).',
    },
    {
      id: 'have_defendant_address',
      type: 'yes_no',
      prompt: 'Do you have the defendant\'s current address?',
    },
    {
      id: 'defendant_address_info',
      type: 'info',
      prompt:
        'You need the defendant\'s physical address for the complaint form and for service. If you don\'t have it, try:\n\n• The original contract or invoice\n• Pennsylvania business registration records (search at dos.pa.gov)\n• County property records\n• White pages or public records search\n\nThe case cannot proceed without a valid address for service.',
      showIf: (answers) => answers.have_defendant_address === 'no',
    },

    // === Service ===
    {
      id: 'service_info',
      type: 'info',
      prompt:
        'SERVICE OF PROCESS (Pa.R.C.P.M.D.J. 302)\n\nAfter you file the complaint, the court arranges service on the defendant. Service is by:\n\n• Constable — personal delivery (most common)\n• Certified mail, return receipt requested\n\nYou do NOT serve the defendant yourself. The MDJ office handles this. You pay the service fee when you file.',
    },

    // === Attorney ===
    {
      id: 'plan_attorney',
      type: 'single_choice',
      prompt: 'Do you plan to have an attorney represent you?',
      options: [
        { value: 'yes', label: 'Yes, I have or will hire an attorney' },
        { value: 'no', label: 'No, I will represent myself' },
        { value: 'considering', label: 'I am considering it' },
      ],
    },
    {
      id: 'attorney_info',
      type: 'info',
      prompt:
        'Unlike some states (like California), Pennsylvania allows attorneys in Magisterial District Court. You can represent yourself or hire an attorney — either is fine.\n\nIf representing yourself: the hearing is informal. The judge will ask both sides to explain their case. No formal rules of evidence apply. Just be organized and bring your documents.',
      showIf: (answers) => answers.plan_attorney === 'no' || answers.plan_attorney === 'considering',
    },

    // === What to Expect ===
    {
      id: 'hearing_overview',
      type: 'info',
      prompt:
        'WHAT TO EXPECT AT THE HEARING\n\n• The hearing is informal — no jury, the Magisterial District Judge decides\n• No formal rules of evidence apply\n• You explain your case, present documents, and the judge may ask questions\n• The defendant can present their side and may file a counterclaim (Pa.R.C.P.M.D.J. 315)\n• Bring ORIGINALS and COPIES of all evidence (contracts, photos, receipts, texts, emails)\n• If the defendant does not appear, a default judgment is entered in your favor',
    },

    // === Counterclaim Warning ===
    {
      id: 'counterclaim_warning',
      type: 'info',
      prompt:
        'COUNTERCLAIMS ARE ALLOWED (Pa.R.C.P.M.D.J. 315)\n\nBe prepared: the defendant can file a counterclaim against you at or before the hearing. If they do, you will need to defend against it at the same hearing. Consider whether the defendant might have any claims against you and prepare accordingly.',
    },

    // === Appeal ===
    {
      id: 'appeal_info',
      type: 'info',
      prompt:
        'APPEAL RIGHTS — DE NOVO TRIAL (Pa.R.C.P.M.D.J. 1002)\n\nEither party can appeal the MDJ judgment to the Court of Common Pleas within 30 days. The appeal results in a completely new trial (de novo) — as if the MDJ hearing never happened.\n\nThis is important: even if you lose at the MDJ level, you get a second chance with a fresh trial. However, the Court of Common Pleas is more formal and follows standard rules of evidence.',
    },

    // === Collection Warning ===
    {
      id: 'collection_info',
      type: 'info',
      prompt:
        'COLLECTING YOUR JUDGMENT — IMPORTANT PA RULES\n\nIf you win, collecting can be the hardest part. Key Pennsylvania rules:\n\n• NO wage garnishment for most civil judgments (42 Pa.C.S.A. §8127) — this is one of the strongest debtor protections in the country\n• You CAN levy bank accounts, but $300 is exempt from execution\n• You can place a lien on real property\n• You can request the court to order the debtor to appear for a debtor\'s examination to disclose assets\n\nIf the defendant has limited assets, collecting may be difficult even with a judgment in your favor.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Location
    if (answers.location === 'philadelphia') {
      items.push({
        status: 'info',
        text: 'Filing in Philadelphia Municipal Court (1339 Chestnut Street, 10th Floor).',
      })
    } else if (answers.location === 'outside_philly') {
      items.push({ status: 'done', text: 'Filing in Magisterial District Court.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Determine whether to file in MDJ or Philadelphia Municipal Court.',
      })
    }

    // Venue
    if (answers.know_venue === 'yes') {
      items.push({ status: 'done', text: 'Correct MDJ office identified.' })
    } else if (answers.location !== 'philadelphia') {
      items.push({
        status: 'needed',
        text: 'Identify the correct MDJ office: where the defendant lives or where the cause of action arose.',
      })
    }

    // Claim amount
    if (answers.claim_amount === 'under_limit') {
      items.push({ status: 'done', text: 'Claim is within the $12,000 MDJ limit.' })
    } else if (answers.claim_amount === 'over_limit') {
      items.push({
        status: 'needed',
        text: 'Claim exceeds $12,000 — file in Court of Common Pleas or reduce the claim to stay in MDJ.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Calculate your claim amount (must be $12,000 or less for MDJ).',
      })
    }

    // Filing fee
    if (answers.know_filing_fee === 'yes') {
      items.push({ status: 'done', text: 'Filing fee amount identified.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Confirm filing fee with your MDJ office (approximately $50-$100).',
      })
    }

    if (answers.can_afford_fee === 'no') {
      items.push({
        status: 'needed',
        text: 'File a Petition to Proceed In Forma Pauperis (IFP) for fee waiver.',
      })
    }

    // Defendant address
    if (answers.have_defendant_address === 'yes') {
      items.push({ status: 'done', text: 'Defendant\'s address confirmed.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Locate the defendant\'s current address for the complaint and service.',
      })
    }

    // Attorney
    if (answers.plan_attorney === 'yes') {
      items.push({ status: 'done', text: 'Attorney representation planned.' })
    } else if (answers.plan_attorney === 'no') {
      items.push({ status: 'info', text: 'Self-representation — hearing is informal, no formal rules of evidence.' })
    }

    // Standard reminders
    items.push({
      status: 'info',
      text: 'Service handled by constable or certified mail (Pa.R.C.P.M.D.J. 302) — you do not serve the defendant yourself.',
    })

    items.push({
      status: 'info',
      text: 'Bring originals and copies of all evidence to the hearing.',
    })

    items.push({
      status: 'info',
      text: 'Either party can appeal to Court of Common Pleas within 30 days for a de novo trial (Pa.R.C.P.M.D.J. 1002).',
    })

    items.push({
      status: 'info',
      text: 'PA collection limits: NO wage garnishment for most civil judgments (42 Pa.C.S.A. §8127). Bank accounts can be levied ($300 exempt).',
    })

    return items
  },
}
