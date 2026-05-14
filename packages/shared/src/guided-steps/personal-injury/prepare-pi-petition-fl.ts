import type { GuidedStepConfig } from '../types'

export const preparePiPetitionFlConfig: GuidedStepConfig = {
  title: 'Prepare Your Florida PI Complaint',
  reassurance:
    'Florida uses fact pleading — your complaint must state the ultimate facts showing you are entitled to relief. We will walk you through the key procedural requirements, including critical HB 837 changes.',

  questions: [
    // === Court Selection ===
    {
      id: 'court_selection_info',
      type: 'info',
      prompt:
        'Court Selection\n\nFlorida courts by amount in controversy:\n\n• Small Claims — $8,000 or less (simplified procedure)\n• County Court — $8,001 to $50,000\n• Circuit Court — Over $50,000 (general jurisdiction, where most PI cases are filed)\n\nYou must plead that your damages fall within the court\'s jurisdictional amount.',
    },
    {
      id: 'court_type',
      type: 'single_choice',
      prompt: 'In which court will you file?',
      options: [
        { value: 'circuit', label: 'Circuit Court — over $50,000 (recommended for most PI cases)' },
        { value: 'county', label: 'County Court — $8,001 to $50,000' },
        { value: 'small_claims', label: 'Small Claims — $8,000 or less' },
      ],
    },

    // === Civil Cover Sheet ===
    {
      id: 'civil_cover_sheet_info',
      type: 'info',
      prompt:
        'Civil Cover Sheet — MANDATORY\n\nYou MUST file a Civil Cover Sheet (Form 1.997) with your complaint. This is required by Fla. R. Civ. P. 1.100(c)(2). It contains:\n\n• Case type (negligence, auto negligence, medical malpractice, etc.)\n• Amount in controversy\n• Whether jury trial is demanded\n• Related cases\n• Party information\n\nDownload from the Florida Courts website. Filing without it will result in rejection.',
    },

    // === Venue ===
    {
      id: 'venue_info',
      type: 'info',
      prompt:
        'Venue Selection — §47.011\n\nYou may file your lawsuit in:\n\n• The county where the cause of action accrued (where the accident happened)\n• The county where the defendant resides',
    },
    {
      id: 'venue_county',
      type: 'text',
      prompt: 'In which county will you file?',
      placeholder: 'e.g., Miami-Dade, Broward, Orange, Hillsborough',
    },
    {
      id: 'venue_basis',
      type: 'single_choice',
      prompt: 'What is your basis for filing in this county?',
      options: [
        { value: 'incident_location', label: 'The injury/incident occurred in this county' },
        { value: 'defendant_residence', label: 'The defendant resides in this county' },
      ],
    },

    // === Complaint Format ===
    {
      id: 'pleading_info',
      type: 'info',
      prompt:
        'FL Fact Pleading — Fla. R. Civ. P. 1.110(b)\n\nYour complaint must contain:\n\n1. Jurisdictional statement — basis for court\'s jurisdiction and proper venue\n2. Ultimate facts — duty, breach, causation, damages (numbered paragraphs)\n3. Demand for judgment — specific relief sought, including the dollar amount\n\nUnlike California, Florida REQUIRES you to state the dollar amount of damages sought. This also determines which court has jurisdiction.\n\nVerification is generally NOT required for PI complaints in Florida.',
    },

    // === Cause of Action ===
    {
      id: 'cause_of_action_type',
      type: 'single_choice',
      prompt: 'What type of negligence claim are you filing?',
      options: [
        { value: 'auto_negligence', label: 'Auto Negligence (motor vehicle accident)' },
        { value: 'premises_liability', label: 'Premises Liability (slip and fall, unsafe property)' },
        { value: 'medical_malpractice', label: 'Medical Malpractice' },
        { value: 'general_negligence', label: 'General Negligence' },
        { value: 'products_liability', label: 'Products Liability' },
        { value: 'negligent_security', label: 'Negligent Security' },
      ],
    },
    {
      id: 'med_mal_presuit_info',
      type: 'info',
      prompt:
        'MANDATORY: Medical Malpractice Pre-Suit Process — §766.106\n\nFlorida requires a mandatory pre-suit process for medical malpractice claims:\n\n1. Serve a written notice of intent to initiate litigation on the prospective defendant (§766.106(2))\n2. Include a verified written medical expert opinion that there are reasonable grounds for the claim (§766.203)\n3. Wait 90 days for investigation (extendable by agreement)\n4. Defendant must respond with rejection, settlement offer, or admission within 90 days\n\nFailure to comply = dismissal without prejudice. The SOL is tolled during the pre-suit period.\n\nYou MUST complete this process BEFORE filing your complaint.',
      showIf: (answers) => answers.cause_of_action_type === 'medical_malpractice',
    },
    {
      id: 'negligent_security_presuit_info',
      type: 'info',
      prompt:
        'Pre-Suit Notice Required — §768.0706 (HB 837)\n\nHB 837 created a new pre-suit notice requirement for negligent security cases:\n\n• You must provide written notice to the property owner at least 90 DAYS before filing suit\n• The notice must describe the claim, identify the criminal act, and specify damages sought\n• Failure to give notice is grounds for abatement (stay)\n\nThis is a new requirement — make sure to comply before filing.',
      showIf: (answers) => answers.cause_of_action_type === 'negligent_security',
    },
    {
      id: 'breach_description',
      type: 'text',
      prompt: 'Briefly describe how the defendant breached their duty of care.',
      placeholder:
        'e.g., Defendant ran a red light; Defendant failed to maintain safe premises',
    },
    {
      id: 'causation_description',
      type: 'text',
      prompt: 'Briefly describe how the breach caused your injuries.',
      placeholder:
        'e.g., As a direct result of the collision, I suffered a herniated disc and fractured wrist',
    },

    // === Jury Demand ===
    {
      id: 'jury_demand',
      type: 'yes_no',
      prompt: 'Do you want a jury trial?',
      helpText:
        'A jury trial is strongly recommended for personal injury cases.',
    },
    {
      id: 'jury_demand_warning',
      type: 'info',
      prompt:
        'CRITICAL: Include Jury Demand in Your Complaint — Fla. R. Civ. P. 1.430\n\nYou must demand a jury trial no later than 10 days after service of the last pleading (Rule 1.430(b)). The safest approach is to include "PLAINTIFF DEMANDS TRIAL BY JURY" in your complaint caption AND body.\n\nFailure to demand = permanent waiver. Title your pleading "COMPLAINT AND DEMAND FOR JURY TRIAL."',
      showIf: (answers) => answers.jury_demand === 'yes',
    },

    // === Damages Categories ===
    {
      id: 'damages_header',
      type: 'info',
      prompt:
        'Damages Categories\n\nFlorida has no statutory cap on non-economic damages for standard negligence (med mal caps were struck down by the FL Supreme Court). However, HB 837 changed the collateral source rule — the jury now sees actual amounts paid, not billed amounts.\n\nSelect which categories apply.',
    },
    {
      id: 'damages_past_medical',
      type: 'yes_no',
      prompt: 'Are you claiming past medical expenses?',
      helpText:
        'HB 837 change: The jury will see actual amounts PAID by insurance, not the full billed amount (§768.76).',
    },
    {
      id: 'damages_future_medical',
      type: 'yes_no',
      prompt: 'Are you claiming future medical expenses?',
    },
    {
      id: 'damages_past_lost_earnings',
      type: 'yes_no',
      prompt: 'Are you claiming past lost earnings?',
    },
    {
      id: 'damages_future_lost_earning',
      type: 'yes_no',
      prompt: 'Are you claiming future lost earning capacity?',
    },
    {
      id: 'damages_pain_suffering',
      type: 'yes_no',
      prompt: 'Are you claiming pain and suffering?',
    },
    {
      id: 'damages_emotional_distress',
      type: 'yes_no',
      prompt: 'Are you claiming emotional distress?',
    },
    {
      id: 'damages_loss_enjoyment',
      type: 'yes_no',
      prompt: 'Are you claiming loss of enjoyment of life?',
    },
    {
      id: 'damages_property_damage',
      type: 'yes_no',
      prompt: 'Are you claiming property damage?',
    },
    {
      id: 'prejudgment_interest_info',
      type: 'info',
      prompt:
        'Pre-Judgment Interest — §768.0710 (HB 837)\n\nHB 837 created a new prejudgment interest statute. You are entitled to prejudgment interest on past economic damages from the date of loss. The rate is based on the prime rate published by the Federal Reserve, adjusted annually.\n\nThis applies automatically — but good practice to plead it. Does NOT apply to future damages or non-economic damages.',
    },

    // === Filing Fees ===
    {
      id: 'filing_fees_info',
      type: 'info',
      prompt:
        'Filing Fees (approximate — verify with your county clerk)\n\n• Circuit Court: ~$400-$435\n• County Court: ~$300\n• Small Claims: ~$55-$300 (varies by amount)\n\nIf you cannot afford fees, file a Motion to Proceed In Forma Pauperis with an Affidavit of Indigency (§57.081). The clerk must accept your filing without fees if the affidavit is proper.',
    },
    {
      id: 'fee_waiver_needed',
      type: 'yes_no',
      prompt: 'Do you need a fee waiver to file your case?',
    },

    // === E-Filing ===
    {
      id: 'efiling_info',
      type: 'info',
      prompt:
        'Mandatory E-Filing\n\nMost Florida courts require mandatory electronic filing through the Florida Courts E-Filing Portal (www.myflcourtaccess.com) under Fla. R. Jud. Admin. 2.525.\n\nPro se parties may be exempt in some circuits but are encouraged to e-file. Check with your circuit\'s clerk of court for specific requirements.',
    },

    // === 51% Bar Reminder ===
    {
      id: 'comparative_fault_reminder',
      type: 'info',
      prompt:
        'REMINDER: 51% Bar Applies (HB 837)\n\nUnder the modified comparative fault system (§768.81), if the jury finds you 51% or more at fault, you recover NOTHING. The defense will aggressively try to shift blame.\n\nIn your complaint, clearly establish the defendant\'s negligence and minimize any suggestion of your own fault. Document all evidence supporting the defendant\'s liability.\n\nException: Medical malpractice cases retain pure comparative fault — no bar.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Court
    if (answers.court_type) {
      const courtLabels: Record<string, string> = {
        circuit: 'Circuit Court',
        county: 'County Court',
        small_claims: 'Small Claims',
      }
      items.push({ status: 'done', text: `Court: ${courtLabels[answers.court_type] || answers.court_type}` })
    } else {
      items.push({ status: 'needed', text: 'Court not yet selected' })
    }

    // Venue
    if (answers.venue_county) {
      const basisLabels: Record<string, string> = {
        incident_location: 'incident location',
        defendant_residence: 'defendant residence',
      }
      const basis = answers.venue_basis ? ` (${basisLabels[answers.venue_basis] || answers.venue_basis})` : ''
      items.push({ status: 'done', text: `Venue: ${answers.venue_county} County${basis}` })
    } else {
      items.push({ status: 'needed', text: 'Venue: County not yet selected' })
    }

    // Civil cover sheet
    items.push({
      status: 'needed',
      text: 'Civil Cover Sheet (Form 1.997): Must be filed with complaint',
    })

    // Pre-suit requirements
    if (answers.cause_of_action_type === 'medical_malpractice') {
      items.push({
        status: 'needed',
        text: 'Medical malpractice pre-suit process required (§766.106) — notice + expert opinion + 90-day investigation',
      })
    }
    if (answers.cause_of_action_type === 'negligent_security') {
      items.push({
        status: 'needed',
        text: 'Negligent security 90-day pre-suit notice required (§768.0706, HB 837)',
      })
    }

    // Jury demand
    if (answers.jury_demand === 'yes') {
      items.push({
        status: 'info',
        text: 'Jury trial: Requested — include "DEMAND FOR JURY TRIAL" in complaint caption (Fla. R. Civ. P. 1.430)',
      })
    } else if (answers.jury_demand === 'no') {
      items.push({ status: 'done', text: 'Jury trial: Waived — bench trial' })
    }

    // Damages
    const damagesKeys = [
      'damages_past_medical', 'damages_future_medical', 'damages_past_lost_earnings',
      'damages_future_lost_earning', 'damages_pain_suffering', 'damages_emotional_distress',
      'damages_loss_enjoyment', 'damages_property_damage',
    ]
    const claimedCount = damagesKeys.filter((k) => answers[k] === 'yes').length
    const answeredCount = damagesKeys.filter((k) => answers[k] !== undefined).length

    if (answeredCount > 0) {
      items.push({
        status: claimedCount > 0 ? 'done' : 'info',
        text: `Damages: ${claimedCount} categor${claimedCount === 1 ? 'y' : 'ies'} claimed`,
      })
    } else {
      items.push({ status: 'needed', text: 'Damages: Categories not yet selected' })
    }

    // HB 837 reminders
    items.push({
      status: 'info',
      text: 'HB 837: Collateral source rule changed — jury sees actual amounts paid, not billed amounts (§768.76)',
    })
    items.push({
      status: 'info',
      text: 'HB 837: 51% comparative fault bar applies (§768.81). Pre-judgment interest on past economic damages at prime rate (§768.0710).',
    })

    // Fee waiver
    if (answers.fee_waiver_needed === 'yes') {
      items.push({ status: 'needed', text: 'Fee waiver: File Motion to Proceed In Forma Pauperis (§57.081)' })
    }

    return items
  },
}
