import type { GuidedStepConfig } from '../types'

export const propertyFilingGuidePaConfig: GuidedStepConfig = {
  title: 'Pennsylvania Property Damage Dispute — Statute of Limitations & Filing Guide',
  reassurance:
    "Pennsylvania has well-established rules for property damage claims. We'll help you determine if your claim is timely and guide you through the filing process step by step.",

  questions: [
    // === Statute of Limitations ===
    {
      id: 'sol_intro',
      type: 'info',
      prompt:
        'STATUTE OF LIMITATIONS — YOUR CLAIM MUST BE TIMELY\n\nPennsylvania gives you 2 years to file a property damage lawsuit (42 Pa.C.S. §5524(7)).\n\nThe clock starts on the date the damage occurred — or the date you discovered (or should have discovered) the damage. If the deadline has passed, your claim is likely barred.',
    },
    {
      id: 'damage_type',
      type: 'single_choice',
      prompt: 'What type of property damage is involved?',
      options: [
        { value: 'vehicle', label: 'Vehicle damage (car accident, hit and run, vandalism)' },
        { value: 'real_property', label: 'Property destruction (fire, flooding, structural damage)' },
        { value: 'trespass', label: 'Trespass (unauthorized entry, dumping, encroachment)' },
        { value: 'nuisance', label: 'Nuisance (noise, pollution, obstruction of use)' },
        { value: 'construction', label: 'Construction defect (faulty workmanship, code violations)' },
        { value: 'neighbor', label: 'Neighbor dispute (tree damage, fence issues, water runoff)' },
        { value: 'other', label: 'Other property damage' },
      ],
    },
    {
      id: 'construction_warranty_info',
      type: 'info',
      prompt:
        'CONSTRUCTION DEFECT — IMPLIED WARRANTY OF HABITABILITY\n\nFor new construction in Pennsylvania, builders owe an implied warranty of habitability. This means the home must be fit for habitation and free from defects in materials and workmanship.\n\nThis warranty applies even without a written contract provision. It covers structural defects, plumbing, electrical, roofing, and other essential systems.\n\nIf the defect also involves a breach of contract, you may have a longer 4-year statute of limitations (42 Pa.C.S. §5525) for the contract claim in addition to the 2-year property damage claim.',
      showIf: (answers) => answers.damage_type === 'construction',
    },
    {
      id: 'neighbor_dispute_info',
      type: 'info',
      prompt:
        'NEIGHBOR DISPUTES — PA TREE & FENCE RULES\n\nPennsylvania follows common-law rules for neighbor disputes:\n\n• Trees: You may trim branches and roots that cross onto your property up to the property line, at your own expense. If a neighbor\'s dead or hazardous tree falls and damages your property, the neighbor may be liable if they knew or should have known of the danger.\n• Fences: PA has no statewide fence law — local ordinances govern. Spite fences (built solely to annoy) may be actionable as a nuisance.\n• Water runoff: A landowner cannot alter the natural flow of surface water to cause damage to a neighbor\'s property.\n\nDocument the damage with photos, dates, and any prior complaints or notices to the neighbor.',
      showIf: (answers) => answers.damage_type === 'neighbor',
    },
    {
      id: 'damage_timing',
      type: 'single_choice',
      prompt: 'When did the damage occur (or when did you discover it)?',
      helpText:
        'The damage date is when your property was harmed. For hidden damage (like a slow leak or construction defect), the clock may start when you discovered or should have discovered the problem (discovery rule).',
      options: [
        { value: 'under_1_year', label: 'Less than 1 year ago' },
        { value: '1_to_2_years', label: '1 to 2 years ago' },
        { value: 'over_2_years', label: 'More than 2 years ago' },
        { value: 'unsure', label: 'I am not sure when the damage occurred' },
      ],
    },
    {
      id: 'sol_safe',
      type: 'info',
      prompt:
        'Your claim appears to be well within the 2-year statute of limitations. You should file promptly — waiting increases the risk of lost evidence and fading memories.',
      showIf: (answers) => answers.damage_timing === 'under_1_year',
    },
    {
      id: 'sol_urgent',
      type: 'info',
      prompt:
        'YOUR DEADLINE MAY BE APPROACHING. The statute of limitations is 2 years from the date of damage or discovery (42 Pa.C.S. §5524(7)). Calculate your exact deadline and file as soon as possible. Once the deadline passes, your claim is permanently barred.',
      showIf: (answers) => answers.damage_timing === '1_to_2_years',
    },
    {
      id: 'sol_expired_warning',
      type: 'info',
      prompt:
        'WARNING: If the damage occurred more than 2 years ago, your claim is likely barred by the statute of limitations (42 Pa.C.S. §5524(7)). However, there are narrow exceptions:\n\n• Discovery rule: if you could not have reasonably discovered the damage earlier (common in construction defect and environmental contamination cases)\n• Defendant\'s absence from Pennsylvania (tolling)\n• Fraudulent concealment of the damage\n• Minor or incapacitated plaintiff (tolling until disability is removed)\n\nConsult an attorney if you believe an exception applies.',
      showIf: (answers) => answers.damage_timing === 'over_2_years',
    },
    {
      id: 'sol_unsure_info',
      type: 'info',
      prompt:
        'Review your photos, insurance records, repair estimates, and any communications to pinpoint when the damage occurred or was discovered. The 2-year clock starts on that date. If you cannot determine the date, consult an attorney — filing a time-barred claim wastes money and can expose you to sanctions.',
      showIf: (answers) => answers.damage_timing === 'unsure',
    },

    // === Insurance ===
    {
      id: 'insurance_involved',
      type: 'yes_no',
      prompt: 'Is an insurance company involved in this dispute?',
      helpText:
        'Examples: your insurance or the other party\'s insurance denied your claim, delayed payment, or offered an unreasonably low settlement.',
    },
    {
      id: 'insurance_bad_faith_info',
      type: 'info',
      prompt:
        'PA BAD FAITH STATUTE — 42 Pa.C.S. §8371\n\nIf an insurance company acted in bad faith (unreasonable denial, delay, or lowball offer), Pennsylvania law provides powerful remedies:\n\n• Interest on the claim amount from the date the claim was made\n• Punitive damages (no cap)\n• Court costs and attorney fees\n\nBad faith is proven by showing the insurer had no reasonable basis for denying or delaying the claim and knew or recklessly disregarded its lack of basis. This is a separate cause of action from the underlying property damage claim.\n\nKeep all correspondence with the insurance company — denial letters, adjuster reports, and recorded statements are critical evidence.',
      showIf: (answers) => answers.insurance_involved === 'yes',
    },

    // === Court Selection ===
    {
      id: 'court_header',
      type: 'info',
      prompt:
        'CHOOSING THE RIGHT COURT\n\nPennsylvania has two main courts for property damage disputes:\n\n• Magisterial District Court — claims under $12,000. Informal, no formal pleading rules, faster.\n• Court of Common Pleas — claims over $12,000 (no upper limit). Formal procedure, Pa. Rules of Civil Procedure apply.',
    },
    {
      id: 'total_damages',
      type: 'single_choice',
      prompt: 'How much are your total damages?',
      helpText:
        'Include repair costs, replacement value, diminished value, loss of use (e.g., rental car), and any out-of-pocket expenses caused by the damage. Do not include attorney fees unless a statute or contract provides for them.',
      options: [
        { value: 'under_12k', label: 'Under $12,000' },
        { value: '12k_to_50k', label: '$12,000 to $50,000' },
        { value: 'over_50k', label: 'Over $50,000' },
      ],
    },
    {
      id: 'court_magisterial',
      type: 'info',
      prompt:
        'File in Magisterial District Court.\n\nFiling fee: approximately $50–$100 depending on the amount claimed.\n\nAdvantages:\n• Simpler process — no formal pleading rules\n• Faster resolution (hearing within 30–60 days)\n• Either party can APPEAL to the Court of Common Pleas for a brand-new trial (de novo) within 30 days of judgment\n\nFile a "Complaint in Civil Action" form at your local Magisterial District Court.',
      showIf: (answers) => answers.total_damages === 'under_12k',
    },
    {
      id: 'court_common_pleas',
      type: 'info',
      prompt:
        'File in the Court of Common Pleas.\n\nFiling fee: varies by county (typically $200–$350).\n\nIMPORTANT: If your claim is under the county\'s compulsory arbitration threshold ($25,000–$50,000 depending on county), the case will first go to mandatory arbitration. Either party can appeal the arbitration award for a full trial (de novo) within 30 days.',
      showIf: (answers) =>
        answers.total_damages === '12k_to_50k' || answers.total_damages === 'over_50k',
    },
    {
      id: 'arbitration_info',
      type: 'info',
      prompt:
        'COMPULSORY ARBITRATION\n\nMost PA counties require arbitration for claims under a threshold (typically $25,000–$50,000). This is NOT binding — either party can appeal for a de novo trial.\n\nArbitration is faster and less formal than a full trial. A panel of 3 attorneys hears your case. Many property damage disputes settle at or after arbitration.',
      showIf: (answers) => answers.total_damages === '12k_to_50k',
    },

    // === Written Instrument Requirement ===
    {
      id: 'contract_based_claim',
      type: 'yes_no',
      prompt: 'Is your property damage claim based on a written contract or agreement?',
      helpText:
        'Examples: a construction contract, lease agreement, service contract, or warranty agreement that the other party violated, causing the damage.',
      showIf: (answers) =>
        answers.total_damages === '12k_to_50k' || answers.total_damages === 'over_50k',
    },
    {
      id: 'written_instrument_header',
      type: 'info',
      prompt:
        'CRITICAL RULE: Pa.R.C.P. 1019(i)\n\nSince your claim is based on a written instrument (contract, lease, warranty, etc.), you MUST attach a copy of the writing to your complaint.\n\nFailure to attach the writing is grounds for Preliminary Objections under Pa.R.C.P. 1028. The court can dismiss or require amendment of the complaint.',
      showIf: (answers) =>
        answers.contract_based_claim === 'yes' &&
        (answers.total_damages === '12k_to_50k' || answers.total_damages === 'over_50k'),
    },

    // === Venue ===
    {
      id: 'venue_info',
      type: 'info',
      prompt:
        'VENUE — WHERE TO FILE (Pa.R.C.P. 1006)\n\nFile in the county where:\n(a) The defendant resides or has a principal place of business\n(b) The damage occurred (where the property is located)\n(c) The transaction or occurrence that caused the damage took place\n\nFor property damage, venue is often straightforward — file where the damaged property is located. Filing in the wrong venue lets the defendant request a transfer, which delays your case.',
    },

    // === Filing Method ===
    {
      id: 'filing_method',
      type: 'single_choice',
      prompt: 'How do you plan to file?',
      helpText:
        'Many PA counties now offer electronic filing. Check your county\'s Prothonotary website.',
      options: [
        { value: 'efile', label: 'Online (county e-filing system) — if available' },
        { value: 'in_person', label: 'In person at the Prothonotary\'s office' },
        { value: 'mail', label: 'By certified mail' },
      ],
    },
    {
      id: 'efile_instructions',
      type: 'info',
      prompt:
        'To file online:\n1. Check if your county offers e-filing (e.g., Philadelphia uses PACFile at pacfile.mdjs.us)\n2. Create an account and select "Civil Action — Property Damage / Trespass / Negligence"\n3. Upload your Complaint as a PDF, including any contract or written agreement as an exhibit\n4. Pay the filing fee online\n5. You will receive a confirmation and docket number\n\nNot all counties offer e-filing. If yours does not, file in person or by mail.',
      showIf: (answers) => answers.filing_method === 'efile',
    },
    {
      id: 'in_person_instructions',
      type: 'info',
      prompt:
        "To file in person:\n1. Print at least 3 copies of your Complaint (court, you, service)\n2. Go to the Prothonotary's office during business hours\n3. Tell the clerk: \"I need to file a civil complaint for property damage\"\n4. Pay the filing fee (or submit a fee waiver — IFP petition)\n5. The clerk will stamp all copies with the filing date and docket number\n6. Keep your stamped copy as proof of filing",
      showIf: (answers) => answers.filing_method === 'in_person',
    },
    {
      id: 'mail_instructions',
      type: 'info',
      prompt:
        "To file by mail:\n1. Print at least 3 copies of your Complaint\n2. Include a check or money order for the filing fee (or IFP petition)\n3. Include a self-addressed stamped envelope for return of your stamped copy\n4. Mail everything to the Prothonotary's office via certified mail with return receipt\n\nAllow 7–14 business days for processing. Keep your certified mail receipt as proof of timely filing.",
      showIf: (answers) => answers.filing_method === 'mail',
    },

    // === Fee Affordability ===
    {
      id: 'can_afford_fee',
      type: 'yes_no',
      prompt: 'Can you afford the filing fee?',
    },
    {
      id: 'fee_waiver_info',
      type: 'info',
      prompt:
        'You can petition to proceed In Forma Pauperis (IFP) — Pa.R.C.P. 240.\n\n1. File a "Petition to Proceed In Forma Pauperis" with your Complaint\n2. Include a financial affidavit listing your income, expenses, assets, and debts\n3. The court will review — if approved, all filing fees and service costs are waived\n4. If denied, you can request a hearing\n\nThis is available in both Magisterial District Court and Court of Common Pleas.',
      showIf: (answers) => answers.can_afford_fee === 'no',
    },

    // === Answer Deadline ===
    {
      id: 'answer_deadline_info',
      type: 'info',
      prompt:
        'DEFENDANT\'S ANSWER DEADLINE\n\nOnce the defendant is served, they have 20 days to respond (Pa.R.C.P. 1007.1). The defendant may:\n\n• File an Answer (admitting or denying each allegation)\n• File Preliminary Objections under Pa.R.C.P. 1028 (challenging legal sufficiency, venue, etc.)\n• Do nothing — you can then seek default judgment\n\nIf the defendant files Preliminary Objections, the Answer deadline is paused until the court rules.',
      showIf: (answers) =>
        answers.total_damages === '12k_to_50k' || answers.total_damages === 'over_50k',
    },

    // === Damages Types ===
    {
      id: 'damages_info',
      type: 'info',
      prompt:
        'DAMAGES YOU CAN CLAIM\n\n• Repair cost — reasonable cost to restore the property to its pre-damage condition\n• Replacement value — if the property is a total loss, the fair market value at the time of damage\n• Diminished value — reduction in property value even after repairs (common in vehicle damage cases)\n• Loss of use — rental car costs, temporary housing, or lost income from the property while repairs are made\n• Out-of-pocket expenses — towing, storage, alternative transportation, temporary repairs\n\nYou must prove damages with reasonable certainty. Get multiple repair estimates, keep all receipts, and photograph the damage before and after repairs.',
    },

    // === Delay Damages ===
    {
      id: 'delay_damages_info',
      type: 'info',
      prompt:
        'DELAY DAMAGES (Pa.R.C.P. 238)\n\nPennsylvania allows prejudgment interest at the prime rate + 1% on property damage awards. This compensates you for the time value of money while the case is pending.\n\nDelay damages are awarded from the date the damage occurred or the complaint was filed (whichever is later) through the date of judgment. Include a request for delay damages in your Complaint.',
    },

    // === Wage Garnishment Protection ===
    {
      id: 'garnishment_info',
      type: 'info',
      prompt:
        'IMPORTANT: PA WAGE GARNISHMENT PROTECTION\n\nEven if you WIN a judgment, Pennsylvania law (42 Pa.C.S.A. §8127) prohibits wage garnishment for property damage judgments. You cannot garnish the defendant\'s wages to collect.\n\nYou CAN collect through:\n• Bank account execution (after locating accounts)\n• Property liens (real estate)\n• Sheriff\'s sale of personal property\n• Voluntary payment plans\n\nExceptions where wages CAN be garnished: child support, taxes, federal student loans, criminal restitution.',
    },

    // === Filing Checklist ===
    {
      id: 'filing_checklist',
      type: 'info',
      prompt:
        'FILING CHECKLIST\n\n• Complaint (3 copies, signed) — include specific facts: who caused the damage, what was damaged, when and where it happened, and how much it will cost to repair or replace\n• Photographs of the damage (before and after, if available)\n• Repair estimates or invoices (at least 2 estimates recommended)\n• Copy of any written contract, lease, or warranty attached as an exhibit (required under Pa.R.C.P. 1019(i) if the claim is based on a writing)\n• Insurance correspondence (claim denial letters, adjuster reports)\n• Filing fee payment or IFP petition\n• Government-issued ID (for in-person filing)\n• Certificate of Compliance with PA Public Access Policy (Pa.R.C.P. 205.6) — redact Social Security numbers, financial account numbers, and dates of birth',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Damage type
    if (answers.damage_type) {
      const typeLabels: Record<string, string> = {
        vehicle: 'Vehicle damage — 2-year SOL (42 Pa.C.S. §5524(7))',
        real_property: 'Property destruction — 2-year SOL (42 Pa.C.S. §5524(7))',
        trespass: 'Trespass — 2-year SOL (42 Pa.C.S. §5524(7))',
        nuisance: 'Nuisance — 2-year SOL (42 Pa.C.S. §5524(7))',
        construction: 'Construction defect — 2-year SOL (may also have 4-year contract claim)',
        neighbor: 'Neighbor dispute — 2-year SOL (42 Pa.C.S. §5524(7))',
        other: 'Property damage — 2-year SOL (42 Pa.C.S. §5524(7))',
      }
      items.push({ status: 'done', text: typeLabels[answers.damage_type] })
    }

    // Statute of limitations status
    if (answers.damage_timing === 'under_1_year') {
      items.push({ status: 'done', text: 'Claim is within the statute of limitations.' })
    } else if (answers.damage_timing === '1_to_2_years') {
      items.push({
        status: 'needed',
        text: 'Calculate your exact SOL deadline — it may be approaching. File promptly.',
      })
    } else if (answers.damage_timing === 'over_2_years') {
      items.push({
        status: 'needed',
        text: 'Claim may be time-barred. Consult an attorney about possible exceptions (discovery rule, tolling, fraudulent concealment).',
      })
    } else if (answers.damage_timing === 'unsure') {
      items.push({
        status: 'needed',
        text: 'Determine the exact date of damage from your records to confirm the claim is timely.',
      })
    }

    // Construction defect — implied warranty note
    if (answers.damage_type === 'construction') {
      items.push({
        status: 'info',
        text: 'New construction may carry an implied warranty of habitability. Consider adding a breach of warranty count.',
      })
    }

    // Insurance bad faith
    if (answers.insurance_involved === 'yes') {
      items.push({
        status: 'info',
        text: 'Consider a bad faith claim under 42 Pa.C.S. §8371 — provides interest, punitive damages, and attorney fees.',
      })
    }

    // Court type
    if (answers.total_damages) {
      const courtLabels: Record<string, string> = {
        under_12k: 'Magisterial District Court (under $12K)',
        '12k_to_50k': 'Court of Common Pleas ($12K–$50K, compulsory arbitration likely)',
        over_50k: 'Court of Common Pleas (over $50K)',
      }
      items.push({ status: 'done', text: `Court: ${courtLabels[answers.total_damages]}.` })
    } else {
      items.push({
        status: 'needed',
        text: 'Determine your total damages to identify the correct court.',
      })
    }

    // Filing method
    if (answers.filing_method) {
      const methodLabels: Record<string, string> = {
        efile: 'Online via county e-filing system',
        in_person: "In person at the Prothonotary's office",
        mail: 'By certified mail',
      }
      items.push({ status: 'done', text: `Filing method: ${methodLabels[answers.filing_method]}.` })
    } else {
      items.push({
        status: 'needed',
        text: 'Choose a filing method (online, in person, or by mail).',
      })
    }

    // Fee
    if (answers.can_afford_fee === 'yes') {
      items.push({ status: 'done', text: 'Filing fee: prepared to pay.' })
    } else if (answers.can_afford_fee === 'no') {
      items.push({
        status: 'needed',
        text: 'File an In Forma Pauperis (IFP) petition under Pa.R.C.P. 240 with your Complaint.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Determine if you can afford the filing fee. IFP fee waivers are available.',
      })
    }

    // Written instrument reminder
    if (answers.contract_based_claim === 'yes') {
      items.push({
        status: 'needed',
        text: 'Attach the written contract/agreement to your Complaint as required by Pa.R.C.P. 1019(i).',
      })
    }

    // Delay damages
    items.push({
      status: 'info',
      text: 'Request delay damages (Pa.R.C.P. 238): prime rate + 1% prejudgment interest.',
    })

    // Venue reminder
    items.push({
      status: 'info',
      text: 'File in the county where the property is located or the defendant resides (Pa.R.C.P. 1006).',
    })

    // Wage garnishment limitation
    items.push({
      status: 'info',
      text: 'PA prohibits wage garnishment for property damage judgments (42 Pa.C.S.A. §8127). Plan alternative collection methods.',
    })

    return items
  },
}
