import type { GuidedStepConfig } from '../types'

export const reFilingGuideFlConfig: GuidedStepConfig = {
  title: 'Florida Real Estate Dispute — Filing Guide',
  reassurance:
    'Florida has well-established rules for real estate lawsuits. We will walk you through the statute of limitations, correct court, lis pendens, and every filing step specific to Florida law.',

  questions: [
    // === Dispute Type ===
    {
      id: 'dispute_type',
      type: 'single_choice',
      prompt: 'What type of real estate dispute is this?',
      helpText:
        'The type of dispute determines which statutes, deadlines, and procedures apply to your case.',
      options: [
        { value: 'contract_breach', label: 'Breach of purchase/sale contract' },
        { value: 'disclosure', label: 'Seller failed to disclose defects' },
        { value: 'title_defect', label: 'Title defect or cloud on title' },
        { value: 'boundary', label: 'Boundary or easement dispute' },
        { value: 'adverse_possession', label: 'Adverse possession claim' },
        { value: 'construction_defect', label: 'Construction defect' },
        { value: 'mechanic_lien', label: "Mechanic's lien dispute" },
        { value: 'hoa_condo', label: 'HOA or condominium dispute' },
        { value: 'title_insurance', label: 'Title insurance claim' },
        { value: 'other', label: 'Other real estate dispute' },
      ],
    },

    // === Statute of Limitations ===
    {
      id: 'sol_overview',
      type: 'info',
      prompt:
        'FLORIDA STATUTE OF LIMITATIONS FOR REAL ESTATE DISPUTES\n\nThe statute of limitations (SOL) is the deadline to file a lawsuit. Key SOL periods:\n\n• Written contracts (purchase agreements, leases): 5 YEARS (Fla. Stat. §95.11(2)(b))\n• Oral contracts: 4 years (Fla. Stat. §95.11(3)(k))\n• Fraud / nondisclosure: 4 years from discovery (Fla. Stat. §95.11(3)(j))\n• Adverse possession: 7 years of continuous possession with color of title and taxes paid (Fla. Stat. §95.18)\n• Construction defects: 4 years, with a 10-year repose period from completion (Fla. Stat. §95.11(3)(c))\n• Mechanic\'s liens: 1 year to enforce after recording (Fla. Stat. §713.22)\n\nThe clock generally starts on the date of the breach or when you discovered (or should have discovered) the problem.',
    },

    // === Disclosure failure — Johnson v. Davis ===
    {
      id: 'disclosure_info',
      type: 'info',
      prompt:
        'SELLER DISCLOSURE FAILURES — JOHNSON v. DAVIS (1985)\n\nFlorida follows the landmark Johnson v. Davis rule: a seller of residential property MUST disclose all known material defects that are not readily observable by the buyer.\n\nTo prove a disclosure claim, you must show:\n1. The seller knew of a defect in the property\n2. The defect materially affected the value of the property\n3. The defect was not readily observable and was unknown to the buyer\n4. The buyer relied on the seller\'s silence or misrepresentation\n\nFlorida does NOT have a mandatory seller disclosure form by statute (unlike many states), but the common law duty from Johnson v. Davis is binding. Many sellers use a voluntary disclosure form — if they lied on it, that strengthens your claim.\n\nThe SOL is 4 years from discovery of the defect (fraud SOL applies).',
      showIf: (answers) => answers.dispute_type === 'disclosure',
    },

    // === Construction defect pre-suit notice ===
    {
      id: 'construction_defect_info',
      type: 'info',
      prompt:
        'CONSTRUCTION DEFECT — MANDATORY PRE-SUIT NOTICE (Fla. Stat. §558.001-558.005)\n\nBefore filing a construction defect lawsuit, Florida law REQUIRES a written pre-suit notice to the contractor, subcontractor, supplier, or design professional.\n\n• Residential property: 60-DAY notice period\n• Commercial property: 120-DAY notice period\n\nThe notice must describe the defect in reasonable detail. The contractor then has the notice period to inspect the property and offer to repair, settle, or deny the claim.\n\nFAILURE TO SEND THIS NOTICE can result in your lawsuit being dismissed or stayed. This is a mandatory prerequisite — you cannot skip it.\n\nThe notice must be sent via certified mail, return receipt requested.',
      showIf: (answers) => answers.dispute_type === 'construction_defect',
    },

    // === Mechanic's lien deadlines ===
    {
      id: 'mechanic_lien_info',
      type: 'info',
      prompt:
        'MECHANIC\'S LIEN DEADLINES (Fla. Stat. §713)\n\nFlorida mechanic\'s lien law has strict deadlines:\n\n• NOTICE TO OWNER: Must be served within 45 DAYS of first furnishing labor or materials (Fla. Stat. §713.06). Missing this deadline waives your lien rights.\n• CLAIM OF LIEN: Must be recorded within 90 DAYS after final furnishing of labor or materials (Fla. Stat. §713.08).\n• ENFORCEMENT: Lawsuit to enforce the lien must be filed within 1 YEAR of recording (Fla. Stat. §713.22).\n\nIf you are defending against a lien:\n• The owner may file a NOTICE OF CONTEST OF LIEN (Fla. Stat. §713.22(2)), which shortens the enforcement deadline to 60 DAYS.\n• Check that the lienor properly served the Notice to Owner — failure is a common defense.\n\nLien amounts include labor, materials, and may include lost profits on the contract.',
      showIf: (answers) => answers.dispute_type === 'mechanic_lien',
    },

    // === HOA / Condo disputes ===
    {
      id: 'hoa_condo_info',
      type: 'info',
      prompt:
        'HOA / CONDOMINIUM DISPUTES\n\nFlorida has specific statutes governing these disputes:\n\n• HOMEOWNERS\' ASSOCIATIONS: Florida Homeowners\' Association Act (Fla. Stat. §720). Covers covenant enforcement, assessments, elections, records access, and architectural review.\n• CONDOMINIUMS: Florida Condominium Act (Fla. Stat. §718). Covers common elements, special assessments, reserves, unit owner rights, and association governance.\n\nMANDATORY PRE-SUIT MEDIATION: Many HOA/condo disputes require pre-suit mediation or arbitration through the Florida Division of Condominiums (for condos) before filing suit.\n\nFor condos specifically, Fla. Stat. §718.1255 requires non-binding arbitration through the Division of Florida Condominiums, Timeshares, and Mobile Homes BEFORE filing a lawsuit for most internal disputes.\n\nATTORNEY FEES: Both §718 and §720 contain prevailing party attorney fee provisions — the loser may pay the winner\'s legal fees.',
      showIf: (answers) => answers.dispute_type === 'hoa_condo',
    },

    // === Quiet title ===
    {
      id: 'quiet_title_info',
      type: 'info',
      prompt:
        'QUIET TITLE ACTIONS (Fla. Stat. §65.061)\n\nA quiet title action asks the court to determine who owns the property and clear any clouds on the title. Common situations:\n\n• Disputed ownership after a defective deed\n• Unreleased mortgages or liens on the title\n• Boundary disputes that affect title\n• Adverse possession claims\n• Forged or fraudulent documents in the chain of title\n\nKey requirements:\n• Must name ALL persons who may have an interest in the property as defendants\n• Must include a full legal description of the property\n• Filed in CIRCUIT COURT (equity jurisdiction)\n• Lis pendens should be filed simultaneously\n• The court may order a title search and require publication to unknown claimants\n\nQuiet title is an equitable remedy — there is generally NO statute of limitations for asserting ownership of property you currently possess.',
      showIf: (answers) =>
        answers.dispute_type === 'title_defect' ||
        answers.dispute_type === 'boundary' ||
        answers.dispute_type === 'adverse_possession',
    },

    // === Title insurance ===
    {
      id: 'title_insurance_info',
      type: 'info',
      prompt:
        'TITLE INSURANCE DISPUTES\n\nFlorida is one of the highest-volume states for title insurance claims. If you purchased title insurance and discover a title defect:\n\n1. NOTIFY YOUR TITLE INSURER in writing immediately — most policies require prompt notice of claims\n2. Review your policy for covered risks vs. exclusions (standard exceptions include survey matters, mechanic\'s liens, and government regulations)\n3. The insurer has a duty to defend you against covered claims AND indemnify you for losses\n4. If the insurer denies your claim improperly, you may have a bad faith claim\n\nFlorida regulates title insurance through the Office of Insurance Regulation. You may file a complaint with the Florida Department of Financial Services if your insurer acts in bad faith.\n\nSOL for breach of title insurance contract: 5 years (written contract).',
      showIf: (answers) => answers.dispute_type === 'title_insurance',
    },

    // === Adverse possession ===
    {
      id: 'adverse_possession_info',
      type: 'info',
      prompt:
        'ADVERSE POSSESSION IN FLORIDA (Fla. Stat. §95.18)\n\nTo claim property by adverse possession in Florida, you must prove:\n\n1. Possession for at least 7 CONTINUOUS YEARS under color of title\n2. Payment of all property taxes during the 7-year period\n3. Possession was actual, open and notorious, hostile, exclusive, and continuous\n4. Filing of a return with the county property appraiser within 1 year of entering possession (Fla. Stat. §95.18(3))\n\nWithout color of title, the required period is longer and the claim is much harder to establish.\n\nIMPORTANT: Florida amended §95.18 in 2011 to add stricter requirements, including the tax payment and property appraiser filing requirements. Claims that began before 2011 may be governed by the prior, less restrictive statute.',
      showIf: (answers) => answers.dispute_type === 'adverse_possession',
    },

    // === Party role ===
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

    // === Defendant — Answer deadline ===
    {
      id: 'answer_deadline_info',
      type: 'info',
      prompt:
        'DEFENDANT — YOUR ANSWER DEADLINE\n\nYou have 20 calendar days from the date of service to file your Answer (Fla. R. Civ. P. 1.140(a)(1)).\n\nIf you do not file an Answer within 20 days, the court can enter a default judgment against you — meaning the plaintiff wins automatically. In a real estate case, this could mean losing your property or being ordered to pay damages.\n\nYour Answer must contain:\n• Specific denials — respond to each allegation individually (Fla. R. Civ. P. 1.110(c))\n• All affirmative defenses in a separate section (Fla. R. Civ. P. 1.110(d))\n\nCommon affirmative defenses in real estate cases:\n• Statute of limitations / statute of repose\n• Failure to give required pre-suit notice (construction defects)\n• Waiver, estoppel, or laches\n• Buyer\'s failure to inspect (caveat emptor for commercial property)\n• Homestead exemption (FL Constitution Art. X §4)\n\nYou may also file a Motion to Dismiss (Fla. R. Civ. P. 1.140(b)) BEFORE or WITH your Answer.',
      showIf: (answers) => answers.party_role === 'defendant',
    },

    // === Court selection ===
    {
      id: 'seeking_equitable_relief',
      type: 'yes_no',
      prompt:
        'Are you seeking equitable relief (quiet title, specific performance, injunction, or lis pendens)?',
      helpText:
        'Equitable relief is non-monetary — it asks the court to order someone to do something (transfer property, remove a lien, stop construction) rather than just pay money.',
    },
    {
      id: 'circuit_court_equity_info',
      type: 'info',
      prompt:
        'CIRCUIT COURT — EQUITY JURISDICTION\n\nReal estate cases seeking equitable relief (quiet title, specific performance, injunctions, lis pendens) MUST be filed in Circuit Court, regardless of the dollar amount. Circuit Court has exclusive equity jurisdiction in Florida.\n\nFiling fee: approximately $400+. Full Florida Rules of Civil Procedure apply. A Civil Cover Sheet (Form 1.997) is REQUIRED.',
      showIf: (answers) => answers.seeking_equitable_relief === 'yes',
    },
    {
      id: 'total_damages',
      type: 'single_choice',
      prompt: 'How much are your total monetary damages?',
      helpText:
        'Include the full amount: repair costs, diminished property value, lost earnest money, lost rent, out-of-pocket expenses, and consequential damages.',
      showIf: (answers) => answers.seeking_equitable_relief === 'no',
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
        'File in SMALL CLAIMS COURT (up to $8,000).\n\nFiling fee: approximately $55-$300 depending on amount. Simplified procedures — no formal rules of evidence. Attorneys are allowed but not required.\n\nNote: Small claims cannot grant equitable relief (no quiet title, no specific performance). If you need equitable relief, you must file in Circuit Court.',
      showIf: (answers) =>
        answers.seeking_equitable_relief === 'no' && answers.total_damages === 'under_8k',
    },
    {
      id: 'court_county',
      type: 'info',
      prompt:
        'File in COUNTY COURT ($8,001-$50,000).\n\nFiling fee: approximately $300-$400. Florida Rules of Civil Procedure apply. A Civil Cover Sheet (Form 1.997) is REQUIRED.\n\nNote: County Court has limited jurisdiction. If you later discover you need equitable relief, you may need to transfer to Circuit Court.',
      showIf: (answers) =>
        answers.seeking_equitable_relief === 'no' && answers.total_damages === '8k_to_50k',
    },
    {
      id: 'court_circuit_damages',
      type: 'info',
      prompt:
        'File in CIRCUIT COURT (over $50,000).\n\nFiling fee: approximately $400+. Most formal court level — full Florida Rules of Civil Procedure apply. A Civil Cover Sheet (Form 1.997) is REQUIRED.\n\nCircuit Court is the standard court for real estate disputes. It has full equity jurisdiction and can grant any relief (damages, quiet title, specific performance, injunctions).',
      showIf: (answers) =>
        answers.seeking_equitable_relief === 'no' && answers.total_damages === 'over_50k',
    },

    // === Venue ===
    {
      id: 'property_county',
      type: 'text',
      prompt: 'What county is the property located in?',
      helpText:
        'Under Fla. Stat. §47.011, lawsuits involving real property must be filed in the county where the property is located. This is mandatory venue for actions affecting title or possession.',
      placeholder: 'e.g. Miami-Dade County',
    },
    {
      id: 'venue_info',
      type: 'info',
      prompt:
        'VENUE — WHERE TO FILE (Fla. Stat. §47.011)\n\nFor real estate disputes, file in the county where the PROPERTY IS LOCATED. This is mandatory venue for actions affecting title, possession, boundaries, or liens on real property.\n\nFlorida has 67 counties, each with its own Clerk of Court. Find yours at www.flclerks.com.\n\nIf your case involves only monetary damages (not title or possession), venue is also proper where the defendant resides or where the cause of action accrued.',
    },

    // === Property identification ===
    {
      id: 'has_legal_description',
      type: 'yes_no',
      prompt: 'Do you have the full legal description of the property?',
      helpText:
        'The legal description is NOT the street address. It is the metes and bounds description, lot/block/subdivision reference, or condominium unit description found on the deed.',
    },
    {
      id: 'legal_description_needed',
      type: 'info',
      prompt:
        'Your Complaint MUST identify the property by its full legal description — a street address alone is not sufficient for real estate cases.\n\nYou can find the legal description on:\n1. Your deed (recorded at the county clerk\'s office or available on the county\'s Official Records search)\n2. Your title commitment or title insurance policy\n3. The county property appraiser\'s website (search by address or folio number)\n4. A survey of the property\n\nFlorida property descriptions are typically:\n• Metes and bounds\n• Lot/block/subdivision (platted communities)\n• Condominium unit description (unit number, building, phase, per declaration of condominium)',
      showIf: (answers) => answers.has_legal_description === 'no',
    },

    // === Homestead exemption ===
    {
      id: 'is_homestead',
      type: 'yes_no',
      prompt: 'Is the property your primary residence (homestead)?',
      helpText:
        'Florida has one of the strongest homestead protections in the country. This affects what creditors can do and what exemptions apply.',
    },
    {
      id: 'homestead_info',
      type: 'info',
      prompt:
        'FLORIDA HOMESTEAD EXEMPTION (FL Constitution Art. X, §4)\n\nFlorida provides an UNLIMITED homestead exemption for your primary residence (up to 1/2 acre in a municipality or 160 acres outside a municipality). This means:\n\n• Your home is protected from MOST creditor claims and forced sale\n• Exceptions: mortgages, property taxes, mechanic\'s liens for work on the property, and HOA/condo assessments can still attach\n• The homestead exemption does NOT protect you from losing the property in a quiet title action or boundary dispute\n\nIf you are a defendant and your homestead is at risk, raise the homestead exemption as a defense immediately. If you are a plaintiff, be aware that collecting a money judgment against a Florida homestead is extremely difficult.',
      showIf: (answers) => answers.is_homestead === 'yes',
    },

    // === Lis pendens ===
    {
      id: 'want_lis_pendens',
      type: 'yes_no',
      prompt: 'Do you want to file a lis pendens (notice of pending litigation) against the property?',
      helpText:
        'A lis pendens is recorded in the county Official Records and warns anyone searching the title that a lawsuit affecting the property is pending. This prevents the owner from selling or refinancing without the buyer knowing about your claim.',
    },
    {
      id: 'lis_pendens_info',
      type: 'info',
      prompt:
        'LIS PENDENS (Fla. Stat. §48.23)\n\nA lis pendens puts the world on notice that the property is subject to a pending lawsuit. To file one in Florida:\n\n1. Your lawsuit must assert a claim to title, an interest in, or a lien on the property\n2. Prepare a notice identifying: the court, case number, parties, and full legal description of the property\n3. Record the notice with the Clerk of Court in the county where the property is located\n4. File it AFTER your lawsuit is filed — you need a case number\n\nIMPORTANT DISTINCTIONS:\n• Claims founded on a duly recorded instrument (deed, mortgage, lien): the lis pendens is effective immediately upon recording and CANNOT be discharged by the defendant posting a bond\n• All other claims: the court may discharge the lis pendens if the defendant posts a bond or shows the claimant cannot demonstrate a fair likelihood of success (Fla. Stat. §48.23(3))\n\nWarning: Filing a frivolous lis pendens can result in attorney fees and damages under Fla. Stat. §48.23(4).',
      showIf: (answers) => answers.want_lis_pendens === 'yes',
    },

    // === Filing method ===
    {
      id: 'filing_method',
      type: 'single_choice',
      prompt: 'How do you plan to file?',
      helpText:
        'E-filing is MANDATORY in Florida for most civil cases. Pro se parties may request an exemption in limited circumstances.',
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
        'E-FILING IS MANDATORY IN FLORIDA (www.myflcourtaccess.com)\n\n1. Go to www.myflcourtaccess.com and create a free account\n2. Select your county, court division (civil), and case type (real property / real estate)\n3. Upload your Complaint as a PDF — include the full legal description of the property\n4. Upload the Civil Cover Sheet (Form 1.997) — REQUIRED for county and circuit court\n5. If filing a lis pendens, upload it as a separate document\n6. Pay the filing fee online (or submit an Application for Determination of Civil Indigent Status)\n7. You will receive email confirmation when your filing is accepted\n\nPro se litigants who cannot e-file may request an exemption from the clerk.',
      showIf: (answers) => answers.filing_method === 'efile',
    },
    {
      id: 'in_person_instructions',
      type: 'info',
      prompt:
        'To file in person:\n1. Print 3 copies of your Complaint (one for the court, one for you, one to serve)\n2. Print the Civil Cover Sheet (Form 1.997) if filing in county or circuit court\n3. Go to the Clerk of Court\'s office during business hours\n4. Tell the clerk: "I need to file a real estate lawsuit"\n5. Pay the filing fee (or bring a completed Application for Determination of Civil Indigent Status)\n6. The clerk will stamp all copies — keep your stamped copy\n7. Ask the clerk about service of process options\n\nNote: Some counties may require you to e-file even if you appear in person. Ask the clerk.',
      showIf: (answers) => answers.filing_method === 'in_person',
    },
    {
      id: 'mail_instructions',
      type: 'info',
      prompt:
        'To file by mail:\n1. Print 3 copies of your Complaint and the Civil Cover Sheet (Form 1.997)\n2. Include a self-addressed stamped envelope for the clerk to return your stamped copy\n3. Mail to the Clerk of Court via certified mail with return receipt requested\n4. Include a check or money order for the filing fee (or the indigency application form)\n\nWarning: Mail takes time. Allow at least 7-10 business days. E-filing via myflcourtaccess.com is strongly preferred and is technically mandatory.',
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

    // === Fact pleading ===
    {
      id: 'fact_pleading_info',
      type: 'info',
      prompt:
        'FLORIDA IS A FACT PLEADING STATE (Fla. R. Civ. P. 1.110(b))\n\nYour Complaint must contain a short and plain statement of the ULTIMATE FACTS constituting your cause of action. This is different from federal "notice pleading."\n\nFor a real estate claim, you must plead:\n• The property (full legal description)\n• Your interest in the property (owner, buyer, lienor, etc.)\n• The defendant\'s wrongful act (breach, nondisclosure, trespass, cloud on title, etc.)\n• The specific facts supporting each element\n• The damages or equitable relief you seek\n\nState specific facts — do not merely recite legal conclusions. For example, say "Seller failed to disclose a known roof leak that caused $45,000 in water damage" rather than "Seller breached the duty to disclose."',
      showIf: (answers) => answers.party_role === 'plaintiff' || answers.party_role === 'unsure_role',
    },

    // === Filing checklist ===
    {
      id: 'filing_checklist',
      type: 'info',
      prompt:
        'FILING CHECKLIST — DOCUMENTS YOU NEED\n\n• Complaint (signed, with specific factual allegations and full legal description of the property)\n• Civil Cover Sheet (Form 1.997) — required for county and circuit court\n• Copy of the deed, purchase agreement, or relevant contract (attach as exhibit)\n• Filing fee payment or Application for Determination of Civil Indigent Status\n• Summons (the clerk will issue this for service on the defendant)\n• Lis pendens (if applicable — prepared with case number after filing)\n• Pre-suit notice (if construction defect — proof of 60/120-day notice under Fla. Stat. §558)\n\nAfter filing:\n• Serve the defendant within 120 days (Fla. R. Civ. P. 1.070(i))\n• If filing a lis pendens, record it with the Clerk immediately after receiving your case number\n• File proof of service (Return of Service) with the court\n• The defendant has 20 days to respond (Fla. R. Civ. P. 1.140)',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Dispute type
    if (answers.dispute_type) {
      const typeLabels: Record<string, string> = {
        contract_breach: 'Breach of purchase/sale contract',
        disclosure: 'Seller disclosure failure (Johnson v. Davis)',
        title_defect: 'Title defect or cloud on title',
        boundary: 'Boundary or easement dispute',
        adverse_possession: 'Adverse possession claim',
        construction_defect: 'Construction defect',
        mechanic_lien: "Mechanic's lien dispute",
        hoa_condo: 'HOA or condominium dispute',
        title_insurance: 'Title insurance claim',
        other: 'Other real estate dispute',
      }
      items.push({
        status: 'done',
        text: `Dispute type: ${typeLabels[answers.dispute_type]}.`,
      })
    }

    // Construction defect pre-suit notice
    if (answers.dispute_type === 'construction_defect') {
      items.push({
        status: 'needed',
        text: 'Mandatory pre-suit notice required (Fla. Stat. §558): 60 days residential, 120 days commercial. Send via certified mail before filing.',
      })
    }

    // Mechanic's lien deadlines
    if (answers.dispute_type === 'mechanic_lien') {
      items.push({
        status: 'needed',
        text: "Verify mechanic's lien deadlines: Notice to Owner within 45 days, Claim of Lien within 90 days, enforcement suit within 1 year (Fla. Stat. §713).",
      })
    }

    // HOA/condo pre-suit
    if (answers.dispute_type === 'hoa_condo') {
      items.push({
        status: 'needed',
        text: 'Check for mandatory pre-suit mediation or arbitration requirements under Fla. Stat. §718 (condo) or §720 (HOA).',
      })
    }

    // Party role
    if (answers.party_role === 'defendant') {
      items.push({
        status: 'needed',
        text: 'File your Answer within 20 days of service (Fla. R. Civ. P. 1.140). Include specific denials and all affirmative defenses. Consider a Motion to Dismiss if the complaint is defective.',
      })
    }

    // Court type
    if (answers.seeking_equitable_relief === 'yes') {
      items.push({
        status: 'done',
        text: 'Court: Circuit Court (equity jurisdiction required for quiet title, specific performance, injunctions).',
      })
    } else if (answers.total_damages) {
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
        text: 'Determine your damages amount and whether you need equitable relief to identify the correct court.',
      })
    }

    // Venue
    if (answers.property_county) {
      items.push({
        status: 'done',
        text: `Venue: ${answers.property_county} (county where property is located, per Fla. Stat. §47.011).`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Identify the county where the property is located — this determines venue (Fla. Stat. §47.011).',
      })
    }

    // Legal description
    if (answers.has_legal_description === 'yes') {
      items.push({
        status: 'done',
        text: 'Full legal description of the property obtained.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Obtain the full legal description from your deed, title policy, or county property appraiser website.',
      })
    }

    // Homestead
    if (answers.is_homestead === 'yes') {
      items.push({
        status: 'info',
        text: 'Homestead property — unlimited homestead exemption applies (FL Constitution Art. X, §4). Protected from most creditor claims.',
      })
    }

    // Lis pendens
    if (answers.want_lis_pendens === 'yes') {
      items.push({
        status: 'needed',
        text: 'Prepare lis pendens with legal description and case number. Record with Clerk after filing (Fla. Stat. §48.23).',
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

    // Civil Cover Sheet reminder
    if (
      answers.seeking_equitable_relief === 'yes' ||
      answers.total_damages === '8k_to_50k' ||
      answers.total_damages === 'over_50k'
    ) {
      items.push({
        status: 'needed',
        text: 'Complete and file Civil Cover Sheet (Form 1.997) — required for county and circuit court.',
      })
    }

    // Venue reminder
    items.push({
      status: 'info',
      text: 'Venue: file in the county where the property is located (Fla. Stat. §47.011). E-filing is mandatory.',
    })

    // Fact pleading reminder
    if (answers.party_role === 'plaintiff' || answers.party_role === 'unsure_role') {
      items.push({
        status: 'info',
        text: 'Florida requires fact pleading (Fla. R. Civ. P. 1.110(b)) — your Complaint must state ultimate facts including the full legal description of the property.',
      })
    }

    return items
  },
}
