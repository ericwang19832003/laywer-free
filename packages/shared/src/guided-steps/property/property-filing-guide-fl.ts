import type { GuidedStepConfig } from '../types'

export const propertyFilingGuideFlConfig: GuidedStepConfig = {
  title: 'Florida Property Damage Dispute — Statute of Limitations & Filing Guide',
  reassurance:
    'Florida has specific rules for property damage lawsuits. We will walk you through the statute of limitations, correct court, pre-suit requirements, and every filing step.',

  questions: [
    // === Statute of Limitations ===
    {
      id: 'sol_overview',
      type: 'info',
      prompt:
        'FLORIDA STATUTE OF LIMITATIONS FOR PROPERTY DAMAGE\n\nThe statute of limitations (SOL) is the deadline to file a lawsuit. If the SOL has expired, the claim is time-barred.\n\n• Property damage (negligence): 2 YEARS (Fla. Stat. §95.11(3)(a), as amended by HB 837 effective March 24, 2023)\n• Taking or injuring personal property: 4 YEARS (Fla. Stat. §95.11(3)(g))\n• Breach of written contract (e.g., insurance policy): 5 YEARS (Fla. Stat. §95.11(2)(b))\n• Construction defects: 4 YEARS from discovery, but must be within 7 years of certificate of occupancy or completion (Fla. Stat. §95.11(3)(c))\n\nIMPORTANT: HB 837 (2023) reduced the general negligence SOL from 4 years to 2 years. This applies to negligence-based property damage claims accruing after March 24, 2023. Claims for intentional taking or injury to personal property retain a 4-year SOL under §95.11(3)(g).\n\nThe clock starts on the date the damage occurred or the date you discovered (or should have discovered) the damage.',
    },
    {
      id: 'damage_type',
      type: 'single_choice',
      prompt: 'What type of property damage is involved?',
      helpText:
        'Select the category that best describes your situation. This affects which SOL period applies and whether pre-suit requirements exist.',
      options: [
        { value: 'vehicle', label: 'Vehicle damage (car accident, vandalism, etc.)' },
        { value: 'storm', label: 'Hurricane or storm damage' },
        { value: 'construction', label: 'Construction defect or building code violation' },
        { value: 'trespass', label: 'Trespass or intentional property destruction' },
        { value: 'insurance', label: 'Insurance dispute (claim denied or underpaid)' },
        { value: 'other', label: 'Other property damage' },
      ],
    },

    // === Construction defect pre-suit notice ===
    {
      id: 'construction_presuit_info',
      type: 'info',
      prompt:
        'CONSTRUCTION DEFECT — MANDATORY PRE-SUIT NOTICE (Fla. Stat. §558.004)\n\nBefore filing a construction defect lawsuit, you MUST serve a written notice on the contractor, subcontractor, supplier, or design professional.\n\n• Residential (fewer than 20 parcels): 60-DAY notice before filing suit\n• Associations (20 or more parcels) and commercial: 120-DAY notice before filing suit\n\nThe notice must describe the defect in reasonable detail and provide the contractor an opportunity to inspect and make a repair offer.\n\nAdditionally, under Fla. Stat. §553.84, you have a statutory right of action for damages caused by a violation of the Florida Building Code. This is separate from a negligence claim and has its own 4-year SOL.\n\nFailing to provide the pre-suit notice can result in your case being dismissed or stayed until you comply.',
      showIf: (answers) => answers.damage_type === 'construction',
    },

    // === Insurance dispute guidance ===
    {
      id: 'insurance_dispute_info',
      type: 'info',
      prompt:
        'INSURANCE DISPUTE — FLORIDA BAD FAITH RULES (Fla. Stat. §624.155)\n\nIf your insurance company denied or underpaid your property damage claim, you may have a bad faith claim.\n\nBefore filing a bad faith lawsuit, you MUST file a Civil Remedy Notice (CRN) with the Florida Department of Financial Services.\n\n1. File the CRN online at www.myfloridacfo.com/division/consumers/civilremedy\n2. The CRN must state with specificity the statutory provision the insurer violated\n3. The insurer has 60 DAYS to cure — pay the claim or correct the violation\n4. If the insurer does NOT cure within 60 days, you may then file a bad faith lawsuit\n\nIMPORTANT: You generally must resolve or obtain a judgment on your underlying breach of contract claim BEFORE pursuing bad faith. The SOL for breach of an insurance contract is 5 years (Fla. Stat. §95.11(2)(b)).\n\nHB 837 (2023) also created new standards for bad faith actions, including a rebuttable presumption that the insurer acted in good faith if it followed certain claim-handling procedures.',
      showIf: (answers) => answers.insurance_dispute === 'yes' || answers.damage_type === 'insurance',
    },

    // === Storm damage specifics ===
    {
      id: 'storm_damage_info',
      type: 'info',
      prompt:
        'HURRICANE / STORM DAMAGE — SPECIAL CONSIDERATIONS\n\nFlorida has specific rules for storm-related property damage:\n\n• Your property insurance policy likely covers hurricane and storm damage — review your declarations page\n• File your insurance claim PROMPTLY — most policies require "prompt" or "immediate" notice of loss\n• Document everything: photos, videos, temporary repairs, receipts for emergency work\n• The SOL for suing your insurer for breach of the insurance contract is 5 YEARS from the date of loss\n• If your insurer denies or underpays, you can file a Civil Remedy Notice (see insurance dispute guidance)\n\nAssignment of Benefits (AOB): Florida law (§627.7152) restricts AOB agreements. Be cautious about signing over your insurance benefits to contractors.\n\nPublic adjusters can help negotiate with your insurer but will take a percentage of your recovery (typically 10-20%). You are NOT required to hire one.',
      showIf: (answers) => answers.damage_type === 'storm',
    },

    // === Breach date ===
    {
      id: 'damage_date_known',
      type: 'yes_no',
      prompt: 'Do you know the date the property damage occurred?',
      helpText:
        'This is the date of the accident, storm, discovery of the defect, or when you first noticed the damage. For insurance disputes, this is the date of loss or the date the insurer denied your claim.',
    },
    {
      id: 'damage_date_warning',
      type: 'info',
      prompt:
        'You need to determine the date the damage occurred or was discovered to calculate your SOL deadline.\n\n• Vehicle damage: the date of the accident or incident\n• Storm damage: the date of the storm\n• Construction defect: the date you discovered (or should have discovered) the defect\n• Insurance dispute: the date the insurer denied or underpaid your claim\n• Trespass: the date of the trespass or when you discovered it\n\nIf you are unsure, gather police reports, weather records, inspection reports, or insurance correspondence to establish the date.',
      showIf: (answers) => answers.damage_date_known === 'no',
    },

    {
      id: 'sol_expired_concern',
      type: 'yes_no',
      prompt: 'Are you concerned the statute of limitations may have expired?',
    },
    {
      id: 'sol_expired_info',
      type: 'info',
      prompt:
        'IF THE SOL MAY HAVE EXPIRED\n\nIf you are the plaintiff and the SOL has expired, you generally cannot file suit. However, check for:\n\n• Tolling: The SOL may be paused if the defendant was absent from Florida, concealed the damage, or if you were under a legal disability (Fla. Stat. §95.051).\n• Discovery rule: For latent defects or concealed damage, the SOL may start when you discovered (or should have discovered) the damage.\n• Continuing trespass: If the property damage is ongoing, a new cause of action may accrue each day.\n\nIf you are the defendant and the SOL has expired, raise it as an affirmative defense in your Answer. The court will NOT raise it for you. Assert: "Plaintiff\'s claims are barred by the applicable statute of limitations, Florida Statutes §95.11."',
      showIf: (answers) => answers.sol_expired_concern === 'yes',
    },

    // === Plaintiff or defendant? ===
    {
      id: 'party_role',
      type: 'single_choice',
      prompt: 'What is your role in this dispute?',
      options: [
        { value: 'plaintiff', label: 'I want to file a lawsuit (plaintiff)' },
        { value: 'defendant', label: 'I was sued and need to respond (defendant)' },
        { value: 'unsure_role', label: 'I am not sure yet' },
      ],
    },

    // === Defendant-specific: Answer deadline ===
    {
      id: 'answer_deadline_info',
      type: 'info',
      prompt:
        'DEFENDANT — YOUR ANSWER DEADLINE\n\nYou have 20 calendar days from the date of service to file your Answer (Fla. R. Civ. P. 1.140(a)(1)).\n\nIf you do not file an Answer within 20 days, the court can enter a default judgment against you — meaning the plaintiff wins automatically.\n\nYour Answer must contain:\n• Specific denials — respond to each allegation individually (Fla. R. Civ. P. 1.110(c))\n• All affirmative defenses in a separate section (Fla. R. Civ. P. 1.110(d))\n\nCommon affirmative defenses in property damage cases:\n• Statute of limitations expired\n• Comparative fault (plaintiff was partly responsible for the damage)\n• Act of God (unforeseeable natural event)\n• Failure to mitigate damages\n• Assumption of risk\n\nFlorida is a FACT PLEADING state (Fla. R. Civ. P. 1.110(b)) — you must include the ultimate facts supporting each defense.\n\nYou may also file a Motion to Dismiss (Fla. R. Civ. P. 1.140(b)) BEFORE or WITH your Answer if the complaint is legally defective.',
      showIf: (answers) => answers.party_role === 'defendant',
    },

    // === Comparative fault ===
    {
      id: 'comparative_fault_info',
      type: 'info',
      prompt:
        'MODIFIED COMPARATIVE FAULT — 51% BAR (Fla. Stat. §768.81, as amended by HB 837)\n\nEffective March 24, 2023, Florida uses MODIFIED comparative fault for negligence claims, including property damage:\n\n• If you are 50% or less at fault: you can recover damages, reduced by your percentage of fault\n• If you are 51% or more at fault: you are BARRED from recovering any damages\n\nExample: If your property damage is $10,000 and you are found 30% at fault, you recover $7,000.\n\nThis applies to negligence-based property damage claims. It does NOT apply to intentional torts (trespass, vandalism) or breach of contract (insurance disputes).\n\nIf there is any possibility the other side will argue you were partly at fault, be prepared to address comparative fault in your case.',
      showIf: (answers) => answers.party_role === 'plaintiff' || answers.party_role === 'unsure_role',
    },

    // === Court selection ===
    {
      id: 'total_damages',
      type: 'single_choice',
      prompt: 'How much are your total damages?',
      helpText:
        'Include repair costs, diminished value, loss of use, rental costs, and any other out-of-pocket losses caused by the property damage.',
      options: [
        { value: 'under_8k', label: '$8,000 or less' },
        { value: '8k_to_50k', label: '$8,001 to $50,000' },
        { value: 'over_50k', label: 'Over $50,000' },
      ],
    },
    {
      id: 'court_small_claims',
      type: 'info',
      prompt:
        'File in SMALL CLAIMS COURT (up to $8,000).\n\nFiling fee: approximately $55-$300 depending on amount. Simplified procedures — no formal rules of evidence. Attorneys are allowed but not required. Cases are typically resolved in 1-2 hearings.\n\nYou can represent yourself without difficulty in small claims court. The court will schedule a pretrial conference first where mediation may be attempted.',
      showIf: (answers) => answers.total_damages === 'under_8k',
    },
    {
      id: 'court_county',
      type: 'info',
      prompt:
        'File in COUNTY COURT ($8,001-$50,000).\n\nFiling fee: approximately $300-$400. More formal than small claims — Florida Rules of Civil Procedure apply. A Civil Cover Sheet (Form 1.997) is REQUIRED with your initial filing.\n\nFact pleading applies (Fla. R. Civ. P. 1.110(b)). Your complaint must include the ultimate facts constituting each element of your claim.',
      showIf: (answers) => answers.total_damages === '8k_to_50k',
    },
    {
      id: 'court_circuit',
      type: 'info',
      prompt:
        'File in CIRCUIT COURT (over $50,000).\n\nFiling fee: approximately $400+. Most formal court level — full Florida Rules of Civil Procedure apply. A Civil Cover Sheet (Form 1.997) is REQUIRED.\n\nFact pleading applies (Fla. R. Civ. P. 1.110(b)). Consider consulting an attorney for cases at this level, especially for construction defect or major insurance dispute cases.',
      showIf: (answers) => answers.total_damages === 'over_50k',
    },

    // === Venue ===
    {
      id: 'venue_info',
      type: 'info',
      prompt:
        'VENUE — WHERE TO FILE (Fla. Stat. §47.011)\n\nFile in the county where:\n• The property damage occurred, OR\n• The defendant resides\n\nFor insurance disputes, you may also file where the insured property is located or where the insurer has its principal office in Florida.\n\nIf the defendant is a business, venue is proper where the business has a principal office or where the cause of action accrued.\n\nIf you file in the wrong county, the defendant can move to transfer the case, which causes delay.',
    },

    // === Damages types ===
    {
      id: 'damages_info',
      type: 'info',
      prompt:
        'FLORIDA PROPERTY DAMAGE DAMAGES\n\nYou may claim the following types of damages:\n\n1. REPAIR COST — the reasonable cost to repair the damaged property to its pre-damage condition\n2. REPLACEMENT COST — if the property is a total loss, the fair market value at the time of damage\n3. DIMINISHED VALUE — the reduction in property value even after repair\n4. LOSS OF USE — costs incurred while property was unusable (rental car, temporary housing, etc.)\n5. CONSEQUENTIAL DAMAGES — foreseeable losses flowing from the damage (lost business income, etc.)\n\nPREJUDGMENT INTEREST: Under Fla. Stat. §768.0710, you are entitled to prejudgment interest on economic damages at the prime rate. This accrues from the date of loss.\n\nMITIGATION: You have a duty to mitigate your damages — take reasonable steps to prevent further damage (e.g., tarp a damaged roof, move valuables from a flooded area). Failure to mitigate can reduce your recovery.',
    },

    // === Filing method ===
    {
      id: 'filing_method',
      type: 'single_choice',
      prompt: 'How do you plan to file?',
      helpText:
        'E-filing is mandatory in Florida for most civil cases. Pro se parties may also file in person or by mail at the clerk\'s office in some counties.',
      options: [
        { value: 'efile', label: 'Online (www.myflcourtaccess.com) — mandatory for most cases' },
        { value: 'in_person', label: 'In person at the clerk\'s office' },
        { value: 'mail', label: 'By mail' },
      ],
    },
    {
      id: 'efile_instructions',
      type: 'info',
      prompt:
        'E-FILING IS MANDATORY IN FLORIDA (www.myflcourtaccess.com)\n\n1. Go to www.myflcourtaccess.com and create a free account\n2. Select your county, court division, and case type (property damage / tort)\n3. Upload your Complaint as a PDF\n4. Upload the Civil Cover Sheet (Form 1.997) — REQUIRED for county and circuit court\n5. Pay the filing fee online (or submit an Application for Determination of Civil Indigent Status)\n6. You will receive email confirmation when your filing is accepted\n\nPro se litigants who cannot e-file may request an exemption from the clerk.',
      showIf: (answers) => answers.filing_method === 'efile',
    },
    {
      id: 'in_person_instructions',
      type: 'info',
      prompt:
        'To file in person:\n1. Print 3 copies of your Complaint (one for the court, one for you, one to serve)\n2. Print the Civil Cover Sheet (Form 1.997) if filing in county or circuit court\n3. Go to the Clerk of Court\'s office during business hours\n4. Tell the clerk: "I need to file a Complaint for property damage"\n5. Pay the filing fee (or bring a completed Application for Determination of Civil Indigent Status)\n6. The clerk will stamp all copies — keep your stamped copy\n7. Ask the clerk about service of process options\n\nNote: Some counties may require you to e-file even in person. Ask the clerk.',
      showIf: (answers) => answers.filing_method === 'in_person',
    },
    {
      id: 'mail_instructions',
      type: 'info',
      prompt:
        'To file by mail:\n1. Print 3 copies of your Complaint and the Civil Cover Sheet (Form 1.997)\n2. Include a self-addressed stamped envelope for the clerk to return your stamped copy\n3. Mail to the Clerk of Court via certified mail with return receipt requested\n4. Include a check or money order for the filing fee (or the indigency application form)\n\nWarning: Mail takes time. Allow at least 7-10 business days. E-filing via myflcourtaccess.com is strongly preferred.',
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
        'You can file an "Application for Determination of Civil Indigent Status" with the Clerk of Court.\n\n1. Obtain the form from the clerk\'s office or download it from your county clerk\'s website\n2. Complete it honestly — include your income, assets, and expenses\n3. File it WITH your Complaint\n4. The clerk will review your application — if approved, fees are waived\n5. If denied, you may seek review by the court\n\nDefendants filing an Answer generally do NOT pay a filing fee in Florida.',
      showIf: (answers) => answers.can_afford_fee === 'no',
    },

    // === Fact pleading requirement ===
    {
      id: 'fact_pleading_info',
      type: 'info',
      prompt:
        'FLORIDA IS A FACT PLEADING STATE (Fla. R. Civ. P. 1.110(b))\n\nYour Complaint must contain a short and plain statement of the ULTIMATE FACTS constituting your cause of action. This is different from federal "notice pleading."\n\nFor a property damage claim, you must plead:\n\nNEGLIGENCE:\n1. The defendant owed a duty of care\n2. The defendant breached that duty\n3. The breach caused your property damage\n4. You suffered specific, quantifiable damages\n\nINTENTIONAL TORT (trespass, vandalism):\n1. The defendant intentionally acted (entered your property, destroyed property, etc.)\n2. The act was without your consent or authorization\n3. You suffered specific, quantifiable damages\n\nBREACH OF CONTRACT (insurance dispute):\n1. A valid insurance policy existed\n2. You complied with all policy conditions (timely notice, cooperation, etc.)\n3. The insurer breached the policy (denied, underpaid, or delayed)\n4. You suffered damages as a result\n\nState specific facts — do not merely recite legal conclusions.',
      showIf: (answers) => answers.party_role === 'plaintiff' || answers.party_role === 'unsure_role',
    },

    // === Required documents checklist ===
    {
      id: 'filing_checklist',
      type: 'info',
      prompt:
        'FILING CHECKLIST — DOCUMENTS YOU NEED\n\n• Complaint (signed, with specific factual allegations)\n• Civil Cover Sheet (Form 1.997) — required for county and circuit court\n• Evidence of damages: photos, repair estimates, contractor quotes, receipts\n• Police report (if applicable — vehicle accident, vandalism, trespass)\n• Insurance correspondence (if insurance dispute — denial letter, claim file)\n• Filing fee payment or Application for Determination of Civil Indigent Status\n• Summons (the clerk will issue this for service on the defendant)\n\nFor construction defect cases, also include:\n• Copy of the Chapter 558 pre-suit notice and any response from the contractor\n• Building permits or inspection reports\n\nAfter filing:\n• Serve the defendant within 120 days (Fla. R. Civ. P. 1.070(i))\n• File proof of service (Return of Service) with the court\n• The defendant then has 20 days to respond (Fla. R. Civ. P. 1.140)',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Damage type & SOL
    if (answers.damage_type) {
      const solLabels: Record<string, string> = {
        vehicle: 'Vehicle damage — 2-year SOL for negligence (Fla. Stat. §95.11(3)(a)), 4-year SOL for intentional damage (§95.11(3)(g))',
        storm: 'Storm damage — 5-year SOL for insurance breach of contract (Fla. Stat. §95.11(2)(b))',
        construction: 'Construction defect — 4-year SOL from discovery, within 7 years of completion (Fla. Stat. §95.11(3)(c))',
        trespass: 'Trespass / intentional damage — 4-year SOL (Fla. Stat. §95.11(3)(g))',
        insurance: 'Insurance dispute — 5-year SOL for breach of contract (Fla. Stat. §95.11(2)(b))',
        other: 'Property damage — 2-year SOL for negligence (§95.11(3)(a)), 4-year for intentional damage (§95.11(3)(g))',
      }
      items.push({
        status: 'done',
        text: solLabels[answers.damage_type],
      })
    }

    // Pre-suit requirements
    if (answers.damage_type === 'construction') {
      items.push({
        status: 'needed',
        text: 'Serve Chapter 558 pre-suit notice on contractor (60 days residential, 120 days commercial/associations) before filing suit.',
      })
    }
    if (answers.damage_type === 'insurance') {
      items.push({
        status: 'needed',
        text: 'File a Civil Remedy Notice with the FL Department of Financial Services (www.myfloridacfo.com) and wait 60 days before filing a bad faith claim.',
      })
    }

    // Damage date
    if (answers.damage_date_known === 'yes') {
      items.push({ status: 'done', text: 'Damage date identified — calculate your SOL deadline.' })
    } else if (answers.damage_date_known === 'no') {
      items.push({
        status: 'needed',
        text: 'Determine the date of damage or discovery to calculate your filing deadline.',
      })
    }

    // SOL concern
    if (answers.sol_expired_concern === 'yes') {
      items.push({
        status: 'needed',
        text: 'SOL may have expired — check for tolling, discovery rule, or continuing trespass. If defending, raise SOL as an affirmative defense.',
      })
    }

    // Party role
    if (answers.party_role === 'defendant') {
      items.push({
        status: 'needed',
        text: 'File your Answer within 20 days of service (Fla. R. Civ. P. 1.140). Include specific denials and all affirmative defenses (comparative fault, SOL, failure to mitigate, etc.).',
      })
    }

    // Court type
    if (answers.total_damages) {
      const courtLabels: Record<string, string> = {
        under_8k: 'Small Claims Court ($8,000 or less)',
        '8k_to_50k': 'County Court ($8,001-$50,000)',
        over_50k: 'Circuit Court (over $50,000)',
      }
      items.push({
        status: 'done',
        text: `Court: ${courtLabels[answers.total_damages]}.`,
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
        efile: 'E-file via www.myflcourtaccess.com (mandatory for most cases)',
        in_person: 'In person at the Clerk of Court',
        mail: 'By certified mail',
      }
      items.push({
        status: 'done',
        text: `Filing method: ${methodLabels[answers.filing_method]}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Choose a filing method. E-filing via myflcourtaccess.com is mandatory for most FL civil cases.',
      })
    }

    // Fee
    if (answers.can_afford_fee === 'yes') {
      items.push({ status: 'done', text: 'Filing fee: prepared to pay.' })
    } else if (answers.can_afford_fee === 'no') {
      items.push({
        status: 'needed',
        text: 'File an Application for Determination of Civil Indigent Status with your Complaint.',
      })
    }

    // Civil Cover Sheet reminder for county/circuit
    if (answers.total_damages === '8k_to_50k' || answers.total_damages === 'over_50k') {
      items.push({
        status: 'needed',
        text: 'Complete and file Civil Cover Sheet (Form 1.997) — required for county and circuit court.',
      })
    }

    // Comparative fault reminder for plaintiffs
    if (
      (answers.party_role === 'plaintiff' || answers.party_role === 'unsure_role') &&
      answers.damage_type !== 'insurance' &&
      answers.damage_type !== 'trespass'
    ) {
      items.push({
        status: 'info',
        text: 'Modified comparative fault (51% bar) applies to negligence claims — if you are 51%+ at fault, recovery is barred (Fla. Stat. §768.81).',
      })
    }

    // Venue reminder
    items.push({
      status: 'info',
      text: 'Venue: file where the property damage occurred or where the defendant resides (Fla. Stat. §47.011).',
    })

    // Fact pleading reminder
    if (answers.party_role === 'plaintiff' || answers.party_role === 'unsure_role') {
      items.push({
        status: 'info',
        text: 'Florida requires fact pleading (Fla. R. Civ. P. 1.110(b)) — your Complaint must state ultimate facts, not just legal conclusions.',
      })
    }

    // Prejudgment interest reminder
    items.push({
      status: 'info',
      text: 'Prejudgment interest on economic damages accrues at the prime rate from the date of loss (Fla. Stat. §768.0710).',
    })

    return items
  },
}
