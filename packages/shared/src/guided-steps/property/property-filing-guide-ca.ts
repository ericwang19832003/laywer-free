import type { GuidedStepConfig } from '../types'

export const propertyFilingGuideCaConfig: GuidedStepConfig = {
  title: 'California Property Damage — Filing Guide',
  reassurance:
    'California has clear rules for property damage claims. We will walk you through deadlines, court selection, and exactly how to file.',

  questions: [
    // === Damage type ===
    {
      id: 'damage_type',
      type: 'single_choice',
      prompt: 'What type of property damage are you dealing with?',
      helpText:
        'The type of damage affects your statute of limitations, available damages, and which laws apply.',
      options: [
        { value: 'vehicle', label: 'Vehicle damage (car accident, hit-and-run, vandalism)' },
        { value: 'real_property', label: 'Real property damage (home, land, structures)' },
        { value: 'construction_defect', label: 'Construction defect (new home or renovation)' },
        { value: 'trespass', label: 'Trespass (unauthorized entry, damage to land)' },
        { value: 'nuisance', label: 'Nuisance (neighbor disputes, tree damage, noise)' },
        { value: 'personal_property', label: 'Personal property (belongings, equipment, pets)' },
      ],
    },

    // === Statute of Limitations ===
    {
      id: 'sol_vehicle_info',
      type: 'info',
      prompt:
        'STATUTE OF LIMITATIONS: 3 YEARS (CCP §338(b))\n\nYou have 3 years from the date of the accident or damage to file suit. The clock starts when the damage occurred — or when you discovered it if not immediately apparent (discovery rule).\n\nIf the at-fault driver was uninsured or fled the scene, you may also have an underinsured/uninsured motorist claim under your own policy — check your policy deadlines separately.',
      showIf: (answers) => answers.damage_type === 'vehicle',
    },
    {
      id: 'sol_real_property_info',
      type: 'info',
      prompt:
        'STATUTE OF LIMITATIONS: 3 YEARS (CCP §338(b))\n\nYou have 3 years from the date you discovered (or reasonably should have discovered) the damage to your real property. This applies to damage from accidents, vandalism, water intrusion, fire, and similar events.\n\nIf the damage arose from a written contract (e.g., a contractor damaged your property during work), you may have 4 years under CCP §337.',
      showIf: (answers) => answers.damage_type === 'real_property',
    },
    {
      id: 'sol_construction_defect_info',
      type: 'info',
      prompt:
        'CONSTRUCTION DEFECT — RIGHT TO REPAIR ACT (Civ. Code §895 et seq.)\n\nFor new residential construction sold after January 1, 2003, SB 800 provides specific deadlines measured from close of escrow:\n\n• Soil/foundation/structural: 10 years (latent defects)\n• Plumbing, electrical, sewer: 4 years\n• Exterior components (roof, windows, stucco): 10 years\n• Paint and stains: 5 years\n• General patent (visible) defects: 4 years\n\nPRE-LITIGATION REQUIREMENT: You must give the builder written notice and a right to inspect (14 days) and repair (30 days) before filing suit. The SOL is tolled during this process.\n\nFor non-SB 800 claims (remodels, commercial, older homes): 3 years from discovery (CCP §338(b)) or 4 years for breach of written contract (CCP §337).',
      showIf: (answers) => answers.damage_type === 'construction_defect',
    },
    {
      id: 'sol_trespass_info',
      type: 'info',
      prompt:
        'STATUTE OF LIMITATIONS: 3 YEARS (CCP §338(b))\n\nYou have 3 years from the date of trespass or damage to your property. If the trespass is ongoing (e.g., a neighbor continuously encroaching), each new trespass restarts the clock for that incident.\n\nTrespass to real property can support claims for actual damages plus, in some cases, treble damages under CCP §733 or double damages under Civ. Code §3346 if trees or timber were wrongfully cut or destroyed.',
      showIf: (answers) => answers.damage_type === 'trespass',
    },
    {
      id: 'sol_nuisance_info',
      type: 'info',
      prompt:
        'STATUTE OF LIMITATIONS: 3 YEARS (CCP §338(b))\n\nFor nuisance claims (Civ. Code §3479), you have 3 years. If the nuisance is continuing (e.g., ongoing tree root damage, persistent flooding), a new cause of action arises each day the nuisance continues.\n\nNEIGHBOR TREE LAW (Civ. Code §§833–834):\n• Trees belong to the owner of the land where the trunk stands (§833)\n• Boundary-line trees are co-owned — neither owner can remove without consent (§834)\n• You may trim branches and roots to your property line (self-help)\n• Wrongful cutting of trees: double damages (Civ. Code §3346) or treble damages (CCP §733)',
      showIf: (answers) => answers.damage_type === 'nuisance',
    },
    {
      id: 'sol_personal_property_info',
      type: 'info',
      prompt:
        'STATUTE OF LIMITATIONS: 3 YEARS (CCP §338(b)/(c))\n\nYou have 3 years from the date of damage or loss to your personal property. The discovery rule applies — the clock starts when you knew or reasonably should have known about the damage.',
      showIf: (answers) => answers.damage_type === 'personal_property',
    },
    {
      id: 'damage_date',
      type: 'text',
      prompt: 'When did the damage occur (or when did you first discover it)?',
      placeholder: 'MM/DD/YYYY',
      helpText:
        'This determines whether your statute of limitations has expired. Enter the date the damage happened, or when you first discovered it if it was not immediately obvious.',
    },

    // === Insurance claim status ===
    {
      id: 'insurance_status',
      type: 'single_choice',
      prompt: 'Have you filed an insurance claim for this damage?',
      helpText:
        'Insurance claims and lawsuits are separate processes, but they interact. Your insurance status affects your strategy.',
      options: [
        { value: 'filed_denied', label: 'Yes — claim was denied' },
        { value: 'filed_underpaid', label: 'Yes — but the payout was too low' },
        { value: 'filed_pending', label: 'Yes — still pending' },
        { value: 'not_filed', label: 'No — I have not filed a claim' },
        { value: 'no_insurance', label: 'No insurance coverage applies' },
      ],
    },
    {
      id: 'insurance_denied_info',
      type: 'info',
      prompt:
        'INSURANCE BAD FAITH (Civ. Code §§1785 et seq.; Ins. Code §790.03)\n\nIf your insurer unreasonably denied your claim, you may have a bad faith cause of action in addition to your property damage claim. California law provides:\n\n• BRANDT FEES: Attorney fees you incur to obtain wrongfully withheld policy benefits are recoverable as damages (Brandt v. Superior Court, 1985)\n• PUNITIVE DAMAGES: Available if the insurer acted with fraud, oppression, or malice\n• CA DEPT. OF INSURANCE: File a complaint at insurance.ca.gov — the CDI investigates unfair practices under Prop 103\n• APPRAISAL CLAUSE: Most property policies have an appraisal process — check your policy\n\nYou can sue the at-fault party AND your insurer separately.',
      showIf: (answers) => answers.insurance_status === 'filed_denied',
    },
    {
      id: 'insurance_underpaid_info',
      type: 'info',
      prompt:
        'UNDERPAID INSURANCE CLAIM\n\nIf your insurer paid less than the actual damage, you have options:\n\n1. REQUEST RE-INSPECTION: Ask the adjuster to re-evaluate with updated estimates\n2. APPRAISAL: Invoke the appraisal clause in your policy (most CA policies have one) — each side picks an appraiser, they pick an umpire, and the panel decides the amount\n3. CDI COMPLAINT: File with the CA Department of Insurance (insurance.ca.gov) if the insurer is acting unreasonably\n4. BAD FAITH LAWSUIT: If the underpayment was unreasonable, you can sue for the full amount plus Brandt fees and potentially punitive damages\n5. SUE THE AT-FAULT PARTY: You can always sue the person who caused the damage directly for the uninsured gap',
      showIf: (answers) => answers.insurance_status === 'filed_underpaid',
    },
    {
      id: 'insurance_subrogation_info',
      type: 'info',
      prompt:
        'INSURANCE SUBROGATION\n\nIf your insurance company paid your claim, they may pursue the at-fault party through subrogation (stepping into your shoes to recover what they paid). Important:\n\n• Your insurer handles the subrogation claim — you do not need to sue for amounts they paid\n• You CAN still sue the at-fault party for your deductible and any uninsured losses (diminished value, loss of use)\n• Coordinate with your insurer to avoid conflicting claims\n• Your insurer cannot settle the subrogation claim in a way that prejudices your remaining claims',
      showIf: (answers) =>
        answers.insurance_status === 'filed_denied' ||
        answers.insurance_status === 'filed_underpaid',
    },

    // === Total damages ===
    {
      id: 'total_damages',
      type: 'single_choice',
      prompt: 'How much are your total damages?',
      helpText:
        'Include repair/replacement cost, diminished value, loss of use (rental costs), and any other losses. Use your highest contractor or repair estimate.',
      options: [
        { value: 'under_12500', label: '$12,500 or less' },
        { value: '12500_to_25k', label: '$12,501 to $25,000' },
        { value: 'over_25k', label: 'More than $25,000' },
      ],
    },

    // === Court routing ===
    {
      id: 'court_small_claims_info',
      type: 'info',
      prompt:
        'SMALL CLAIMS COURT (up to $12,500)\n\n• No lawyers allowed — you represent yourself\n• Simplified procedures — no formal discovery, no motions\n• Filing fee: $30–$75 (based on claim amount)\n• Hearing usually within 30–70 days of filing\n• Judge decides on the spot or by mail within a few days\n• Defendant can appeal for a new trial; plaintiff generally cannot appeal\n• Ideal for straightforward property damage with clear evidence (photos, estimates)\n• File at your local Superior Court — Small Claims division',
      showIf: (answers) => answers.total_damages === 'under_12500',
    },
    {
      id: 'court_limited_info',
      type: 'info',
      prompt:
        'LIMITED CIVIL COURT ($12,501–$25,000)\n\n• Filed in Superior Court — Limited Civil division\n• Lawyers permitted but not required\n• Simplified discovery rules (limited interrogatories, depositions)\n• Case must be resolved within 12 months\n• Filing fee: approximately $225–$370\n• You CAN state the dollar amount in the complaint\n• Jury trial available if requested\n• More formal than Small Claims but still manageable pro se',
      showIf: (answers) => answers.total_damages === '12500_to_25k',
    },
    {
      id: 'court_unlimited_info',
      type: 'info',
      prompt:
        'UNLIMITED CIVIL COURT (over $25,000)\n\n• Filed in Superior Court — Unlimited Civil division\n• Full discovery available (interrogatories, depositions, RFAs, document requests)\n• More complex procedures — strongly consider consulting an attorney\n• Filing fee: approximately $435–$450\n• Jury trial available if requested\n• Demurrer available to challenge the complaint (CCP §430.10)\n• Appropriate for major property damage, construction defects, and insurance bad faith cases',
      showIf: (answers) => answers.total_damages === 'over_25k',
    },

    // === Venue ===
    {
      id: 'venue_info',
      type: 'info',
      prompt:
        'VENUE — WHERE TO FILE\n\nFor real property damage: File in the county where the property is located (CCP §392).\n\nFor personal property damage (vehicle, belongings): File in the county where the damage occurred OR where the defendant resides (CCP §395(a)).\n\nIf a contract is involved (e.g., contractor dispute): File where the contract was made or was to be performed, OR where the defendant resides (CCP §395(b)).',
    },

    // === Filing method ===
    {
      id: 'filing_method',
      type: 'single_choice',
      prompt: 'How do you plan to file?',
      helpText:
        'Most California Superior Courts accept e-filing. In-person filing is available at the court clerk window. Mail is the slowest option.',
      options: [
        { value: 'efile', label: 'Online (e-filing) — recommended' },
        { value: 'in_person', label: 'In person at the courthouse' },
        { value: 'mail', label: 'By mail' },
      ],
    },
    {
      id: 'efile_instructions',
      type: 'info',
      prompt:
        'To file online:\n1. Check your county\'s Superior Court website for their approved e-filing provider (common providers: One Legal, File & ServeXpress, Odyssey)\n2. Create an account with the e-filing provider\n3. Select your court, case type (property damage / other civil), and jurisdiction level\n4. Upload your Complaint as a PDF along with the Civil Case Cover Sheet (form CM-010)\n5. Pay the filing fee online (or submit a fee waiver — form FW-001)\n6. You will receive a confirmation email when accepted\n\nTip: Most courts process e-filed documents within 24–48 hours.',
      showIf: (answers) => answers.filing_method === 'efile',
    },
    {
      id: 'in_person_instructions',
      type: 'info',
      prompt:
        'To file in person:\n1. Print at least 3 copies of your Complaint and Civil Case Cover Sheet (form CM-010)\n2. Go to the Superior Court clerk\'s office during business hours (usually 8:30am–4:30pm)\n3. Tell the clerk: "I need to file a Complaint for property damage"\n4. Pay the filing fee (cash, check, or card depending on the court) or bring a completed fee waiver (form FW-001)\n5. The clerk will stamp all copies — keep your stamped copy as proof of filing\n6. Ask the clerk about service options for the defendant',
      showIf: (answers) => answers.filing_method === 'in_person',
    },
    {
      id: 'mail_instructions',
      type: 'info',
      prompt:
        'To file by mail:\n1. Print at least 3 copies of your Complaint and Civil Case Cover Sheet (form CM-010)\n2. Include a self-addressed stamped envelope for the clerk to return your file-stamped copy\n3. Mail to the court clerk\'s office via certified mail with return receipt requested\n4. Include a check or money order for the filing fee payable to the court (or include form FW-001 for a fee waiver)\n\nWarning: Mail filing is slow. Allow 2–3 weeks for processing. If your SOL deadline is close, file online or in person.',
      showIf: (answers) => answers.filing_method === 'mail',
    },

    // === Fee affordability ===
    {
      id: 'can_afford_fee',
      type: 'yes_no',
      prompt: 'Can you afford the filing fee?',
    },
    {
      id: 'fee_waiver_info',
      type: 'info',
      prompt:
        'FEE WAIVER (Form FW-001)\n\nYou may qualify for a fee waiver if you:\n• Receive public benefits (Medi-Cal, food stamps, SSI, CalWORKs, CAPI, county relief)\n• Have household income below 125% of the federal poverty guidelines\n• Cannot pay court costs and still afford basic necessities\n\nHow to apply:\n1. Complete form FW-001 (Request to Waive Court Fees)\n2. File it WITH your Complaint (same time)\n3. The court will review it — if approved, all court fees are waived\n4. If denied, you have 10 days to request a hearing\n\nDownload FW-001 from courts.ca.gov/forms.',
      showIf: (answers) => answers.can_afford_fee === 'no',
    },

    // === Damages available ===
    {
      id: 'damages_info',
      type: 'info',
      prompt:
        'DAMAGES AVAILABLE IN CALIFORNIA PROPERTY DAMAGE CASES\n\n1. REPAIR/REPLACEMENT COST — The reasonable cost to repair or the fair market value if destroyed (whichever is less)\n2. DIMINISHED VALUE — The loss in market value even after repair (common for vehicles)\n3. LOSS OF USE — Rental costs or fair rental value while property is being repaired\n4. CONSEQUENTIAL DAMAGES — Foreseeable losses caused by the damage (e.g., lost business income)\n5. EMOTIONAL DISTRESS — Available if the property has special personal value or the defendant acted outrageously (rare for pure property damage)\n6. TREE/TIMBER DAMAGES — Double (Civ. Code §3346) or treble (CCP §733) damages for wrongful destruction of trees\n\nPREJUDGMENT INTEREST: 10% per year on liquidated (fixed-amount) claims as a matter of right (Civ. Code §3287(a)). Include this demand in your Complaint.',
    },

    // === What to bring checklist ===
    {
      id: 'what_to_bring',
      type: 'info',
      prompt:
        'Checklist — what to bring when filing:\n\n• Your Complaint (at least 3 copies, signed)\n• Civil Case Cover Sheet (form CM-010)\n• Evidence: photos, repair estimates, contractor bids, receipts\n• Insurance correspondence (denial letter, settlement offer)\n• Filing fee payment or fee waiver form (FW-001)\n• Government-issued ID\n• Summons form (SUM-100) — the clerk will issue this for you to serve on the defendant\n• A pen (in case you need to sign anything)',
    },

    // === Construction defect pre-litigation ===
    {
      id: 'construction_prelitigation_info',
      type: 'info',
      prompt:
        'CONSTRUCTION DEFECT — PRE-LITIGATION REQUIREMENT (Civ. Code §910)\n\nBefore filing suit for construction defects in new residential construction (SB 800), you MUST:\n\n1. Send written notice to the builder describing each defect in reasonable detail\n2. Builder has 14 days to acknowledge and 14 days to inspect\n3. Builder has 30 days to offer a repair plan\n4. If builder does not respond or you reject the repair, you may file suit\n5. The statute of limitations is TOLLED during this process\n\nKeep copies of all notices sent via certified mail. Failure to follow this process may result in your case being stayed while you comply.',
      showIf: (answers) => answers.damage_type === 'construction_defect',
    },

    // === Next steps ===
    {
      id: 'next_steps',
      type: 'info',
      prompt:
        'YOUR NEXT STEPS\n\n1. Confirm your statute of limitations has NOT expired (3 years from damage/discovery for most claims)\n2. Gather all evidence: photos, videos, repair estimates, contractor bids, receipts, insurance correspondence\n3. Calculate your total damages (repair cost + diminished value + loss of use + prejudgment interest)\n4. Determine the correct court level based on your total damages\n5. Identify the correct venue (county)\n6. Draft and file your Complaint with the Civil Case Cover Sheet (CM-010)\n7. Obtain a Summons (SUM-100) from the clerk\n8. Serve the defendant within 60 days of filing (CCP §583.210 allows 3 years, but courts expect prompt service)\n9. If the defendant does not respond within 30 days of service, request a default judgment',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Damage type
    if (answers.damage_type) {
      const typeLabels: Record<string, string> = {
        vehicle: 'Vehicle damage',
        real_property: 'Real property damage',
        construction_defect: 'Construction defect',
        trespass: 'Trespass',
        nuisance: 'Nuisance / neighbor dispute',
        personal_property: 'Personal property damage',
      }
      items.push({
        status: 'done',
        text: `Claim type: ${typeLabels[answers.damage_type]}. SOL: 3 years (CCP §338(b)).`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Identify your damage type to determine the correct statute of limitations.',
      })
    }

    // SOL date calculation
    if (answers.damage_date) {
      const parts = answers.damage_date.split('/')
      const damageDate = new Date(`${parts[2]}-${parts[0]}-${parts[1]}`)
      const now = new Date()
      const yearsDiff =
        (now.getTime() - damageDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)

      const solYears = answers.damage_type === 'construction_defect' ? 10 : 3

      if (yearsDiff >= solYears) {
        items.push({
          status: 'info',
          text: `Based on damage date ${answers.damage_date}, approximately ${Math.floor(yearsDiff)} years have passed. The ${solYears}-year SOL appears to have EXPIRED. Your claim may be time-barred — consult an attorney about possible tolling or discovery rule exceptions.`,
        })
      } else {
        const remainingMonths = Math.ceil((solYears - yearsDiff) * 12)
        items.push({
          status: 'info',
          text: `Based on damage date ${answers.damage_date}, approximately ${Math.floor(yearsDiff * 12)} months have passed. SOL has NOT expired — approximately ${remainingMonths} months remain. File promptly.`,
        })
      }
    } else {
      items.push({
        status: 'needed',
        text: 'Enter the damage date to calculate whether the SOL has expired.',
      })
    }

    // Insurance status
    if (answers.insurance_status === 'filed_denied') {
      items.push({
        status: 'info',
        text: 'Insurance claim denied. Consider a bad faith action — Brandt fees and punitive damages may be available. File a CDI complaint at insurance.ca.gov.',
      })
    } else if (answers.insurance_status === 'filed_underpaid') {
      items.push({
        status: 'needed',
        text: 'Insurance underpaid. Invoke the appraisal clause in your policy, file a CDI complaint, or sue the at-fault party for the gap.',
      })
    } else if (answers.insurance_status === 'filed_pending') {
      items.push({
        status: 'info',
        text: 'Insurance claim pending. Monitor the claim but be aware of your lawsuit filing deadline — do not let the SOL expire while waiting.',
      })
    }

    // Court type
    if (answers.total_damages) {
      const courtLabels: Record<string, string> = {
        under_12500: 'Small Claims Court (up to $12,500) — filing fee $30–$75.',
        '12500_to_25k': 'Limited Civil Court ($12,501–$25,000) — filing fee ~$225–$370.',
        over_25k: 'Unlimited Civil Court (over $25,000) — filing fee ~$435–$450.',
      }
      items.push({
        status: 'done',
        text: `Court: ${courtLabels[answers.total_damages]}`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Determine your total damages to identify the correct court.',
      })
    }

    // Filing method
    if (answers.filing_method) {
      const methodLabels: Record<string, string> = {
        efile: 'Online via e-filing provider',
        in_person: 'In person at the courthouse',
        mail: 'By certified mail',
      }
      items.push({
        status: 'done',
        text: `Filing method: ${methodLabels[answers.filing_method]}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Choose a filing method (online, in person, or by mail).',
      })
    }

    // Method-specific reminders
    if (answers.filing_method === 'efile') {
      items.push({
        status: 'needed',
        text: 'Find your county\'s approved e-filing provider and upload your Complaint as a PDF with Civil Case Cover Sheet (CM-010).',
      })
    } else if (answers.filing_method === 'in_person') {
      items.push({
        status: 'needed',
        text: 'Print at least 3 copies of your Complaint and Civil Case Cover Sheet. Bring to the clerk during business hours (8:30am–4:30pm).',
      })
    } else if (answers.filing_method === 'mail') {
      items.push({
        status: 'needed',
        text: 'Mail 3 copies via certified mail with return receipt. Include SASE and filing fee check. Allow 2–3 weeks.',
      })
    }

    // Fee
    if (answers.can_afford_fee === 'yes') {
      items.push({
        status: 'done',
        text: 'Filing fee: prepared to pay.',
      })
    } else if (answers.can_afford_fee === 'no') {
      items.push({
        status: 'needed',
        text: 'Complete fee waiver form FW-001 from courts.ca.gov/forms. File it with your Complaint.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Determine if you can afford the filing fee. Fee waivers are available if you qualify.',
      })
    }

    // Construction defect pre-litigation reminder
    if (answers.damage_type === 'construction_defect') {
      items.push({
        status: 'needed',
        text: 'Send pre-litigation notice to builder per Civ. Code §910 (SB 800) before filing suit. Allow 14 days for acknowledgment, 14 days for inspection, and 30 days for repair offer.',
      })
    }

    // Venue reminder
    if (answers.damage_type === 'real_property' || answers.damage_type === 'construction_defect') {
      items.push({
        status: 'info',
        text: 'File in the county where the property is located (CCP §392).',
      })
    } else {
      items.push({
        status: 'info',
        text: 'File in the county where the damage occurred or where the defendant resides (CCP §395(a)).',
      })
    }

    // Prejudgment interest reminder
    items.push({
      status: 'info',
      text: 'Include a demand for prejudgment interest at 10% per year on liquidated amounts (Civ. Code §3287(a)) in your Complaint.',
    })

    return items
  },
}
