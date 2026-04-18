import type { GuidedStepConfig } from '../types'

export const preparePiPetitionNyConfig: GuidedStepConfig = {
  title: 'Prepare Your New York PI Complaint',
  reassurance:
    'New York uses fact pleading — your complaint must state the ultimate facts of your claim with enough detail to give the court and parties fair notice. We will walk you through the key procedural requirements.',

  questions: [
    // === Commencement Method ===
    {
      id: 'commencement_header',
      type: 'info',
      prompt:
        'Starting Your Lawsuit — Two Options\n\nNew York gives you two ways to commence a personal injury action:\n\n• Summons and Complaint (CPLR §3012(a)) — File both documents together with all factual allegations. This is the standard approach.\n• Summons with Notice (CPLR §305(b)) — File only a summons with a brief notice stating the nature of the action and relief sought. The defendant can then demand the full complaint, and you must serve it within 20 days.\n\nSummons with Notice is often used when the SOL is about to expire and you need to file quickly.',
    },
    {
      id: 'commencement_method',
      type: 'single_choice',
      prompt: 'How will you commence your action?',
      helpText:
        'Summons and Complaint is recommended unless you are under time pressure.',
      options: [
        { value: 'summons_complaint', label: 'Summons and Complaint (recommended)' },
        { value: 'summons_notice', label: 'Summons with Notice (SOL deadline approaching)' },
      ],
    },
    {
      id: 'summons_notice_info',
      type: 'info',
      prompt:
        'Summons with Notice — What to Include\n\nYour Summons with Notice must contain (CPLR §305(b)):\n• The nature of the action (personal injury)\n• The relief sought (damages)\n• A brief description of the claim\n\nExample: "Action for personal injuries sustained on [date] at [location] due to defendant\'s negligence. Plaintiff seeks damages in the amount of $[amount]."\n\nAfter the defendant receives the summons, they can demand the full complaint. You then have 20 days to serve it (CPLR §3012(b)).',
      showIf: (answers) => answers.commencement_method === 'summons_notice',
    },

    // === Index Number ===
    {
      id: 'index_number_info',
      type: 'info',
      prompt:
        'Index Number — Required Before Filing\n\nYou must purchase an index number from the County Clerk before or at the time of filing. This is your case\'s unique identifier.\n\n• Supreme Court filing fee: approximately $210 (index number) + $95 (RJI when needed) = ~$305 total\n• NYC Civil Court: approximately $45-$150 depending on amount\n• Small Claims: approximately $10-$20 in NYC\n\nIf you cannot afford filing fees, you may apply to proceed as a poor person under CPLR §1101.',
    },

    // === Court Selection ===
    {
      id: 'court_selection_info',
      type: 'info',
      prompt:
        'Court Selection\n\nNew York has multiple trial courts:\n\n• Supreme Court — Unlimited jurisdiction, where most PI cases are filed. Despite the name, this is the trial court.\n• NYC Civil Court — Up to $50,000 (5 boroughs only)\n• City Courts (outside NYC) — Up to $15,000\n• Small Claims — Up to $10,000 (NYC) / $5,000 (outside NYC). No jury trial.',
    },
    {
      id: 'court_type',
      type: 'single_choice',
      prompt: 'In which court will you file?',
      options: [
        { value: 'supreme', label: 'Supreme Court (recommended for most PI cases)' },
        { value: 'nyc_civil', label: 'NYC Civil Court (under $50,000)' },
        { value: 'city_court', label: 'City Court (under $15,000, outside NYC)' },
        { value: 'small_claims', label: 'Small Claims (under $10,000 NYC / $5,000 outside)' },
      ],
    },

    // === Venue ===
    {
      id: 'venue_info',
      type: 'info',
      prompt:
        'Venue Selection — CPLR §503\n\nYou may file your case in:\n\n• The county where the cause of action arose (where the incident happened)\n• The county where the defendant resides\n\nFor corporate defendants: where the principal office is located, or where the incident occurred.',
    },
    {
      id: 'venue_county',
      type: 'text',
      prompt: 'In which county will you file?',
      placeholder: 'e.g., Kings, New York, Queens, Suffolk, Westchester',
    },
    {
      id: 'venue_basis',
      type: 'single_choice',
      prompt: 'What is your basis for filing in this county?',
      options: [
        { value: 'incident_location', label: 'The injury/incident occurred in this county' },
        { value: 'defendant_residence', label: 'The defendant resides in this county' },
        { value: 'defendant_business', label: 'The defendant\'s principal office is in this county' },
      ],
    },

    // === Fact Pleading Requirements ===
    {
      id: 'pleading_info',
      type: 'info',
      prompt:
        'NY Fact Pleading — CPLR §3013\n\nNew York requires fact pleading. Your complaint must state "ultimate facts" — not mere legal conclusions, and not evidentiary detail. For a PI complaint, you must allege:\n\n1. Duty — the defendant owed you a duty of care\n2. Breach — with factual specificity (date, location, nature of negligence)\n3. Proximate cause — the breach caused your injuries\n4. Damages — type and nature of injuries\n\nEach cause of action must be separately stated and numbered (CPLR §3014). Specific injuries and dates must be included (CPLR §3016(g)).',
    },

    // === Cause of Action ===
    {
      id: 'cause_of_action_type',
      type: 'single_choice',
      prompt: 'What type of negligence claim are you filing?',
      helpText:
        'This determines the duty element in your complaint.',
      options: [
        { value: 'motor_vehicle', label: 'Motor Vehicle Accident' },
        { value: 'premises_liability', label: 'Premises Liability (slip and fall, unsafe property)' },
        { value: 'medical_malpractice', label: 'Medical Malpractice' },
        { value: 'general_negligence', label: 'General Negligence' },
        { value: 'products_liability', label: 'Products Liability' },
        { value: 'construction_accident', label: 'Construction Accident (Labor Law §§240, 241)' },
      ],
    },
    {
      id: 'med_mal_certificate',
      type: 'info',
      prompt:
        'Certificate of Merit Required — CPLR §3012-a\n\nMedical malpractice actions require a Certificate of Merit. Your attorney must certify they consulted with a physician and believe there is a reasonable basis for the action.\n\nPro se exception: CPLR §3012-a(a)(2) allows pro se plaintiffs to file a certificate stating they were unable to obtain a consultation but believe the case is meritorious, along with the reasons why they were unable to consult a physician.\n\nThis must be filed with or shortly after the complaint.',
      showIf: (answers) => answers.cause_of_action_type === 'medical_malpractice',
    },
    {
      id: 'construction_labor_law_info',
      type: 'info',
      prompt:
        'NY Labor Law — Special Protections for Construction Workers\n\nNew York has some of the strongest protections for injured construction workers:\n\n• Labor Law §240 (Scaffold Law) — Absolute liability for gravity-related injuries (falls from heights, falling objects). The owner/contractor is strictly liable — no comparative fault defense.\n• Labor Law §241(6) — Requires compliance with specific Industrial Code safety rules. Violation creates a basis for liability.\n• Labor Law §200 — General duty to provide safe workplace (codifies common law negligence).\n\nIf §240 applies, this is one of the strongest PI claims in any state.',
      showIf: (answers) => answers.cause_of_action_type === 'construction_accident',
    },
    {
      id: 'breach_description',
      type: 'text',
      prompt: 'Briefly describe how the defendant breached their duty of care.',
      placeholder:
        'e.g., Defendant ran a red light; Defendant failed to maintain safe premises; Defendant misdiagnosed my condition',
    },
    {
      id: 'causation_description',
      type: 'text',
      prompt: 'Briefly describe how the breach caused your injuries.',
      placeholder:
        'e.g., As a direct result of the collision, I suffered a herniated disc and fractured wrist',
    },

    // === Verification ===
    {
      id: 'verification_info',
      type: 'info',
      prompt:
        'Verification — Generally NOT Required\n\nUnlike Pennsylvania, New York does NOT generally require verified complaints in personal injury actions (CPLR §3020-3023). However, if you choose to verify your complaint, the defendant must verify their answer.\n\nFor actions against municipalities: reference compliance with Notice of Claim requirements in your complaint.',
    },

    // === Jury Demand ===
    {
      id: 'jury_demand',
      type: 'yes_no',
      prompt: 'Do you want a jury trial?',
      helpText:
        'A jury trial is strongly recommended for personal injury cases. Juries tend to award higher damages than judges.',
    },
    {
      id: 'jury_demand_info',
      type: 'info',
      prompt:
        'Jury Demand — CPLR §4102\n\nUnlike PA (where you must include it in the complaint), in New York you demand a jury trial by filing a Note of Issue and Jury Demand when the case is ready for trial (after discovery).\n\nYou can also demand a jury within 15 days of the opposing party filing a Note of Issue without a jury demand.\n\nJury fee: $65. If you fail to demand a jury, you permanently waive the right.\n\nFor most PI cases, the jury demand is made later in the case — but plan for it now.',
      showIf: (answers) => answers.jury_demand === 'yes',
    },

    // === Damages Categories ===
    {
      id: 'damages_header',
      type: 'info',
      prompt:
        'Damages Categories\n\nNew York has NO statutory cap on personal injury damages, including non-economic damages. Pre-judgment interest is 9% per annum (CPLR §5004) — one of the highest statutory rates in the country.\n\nSelect which categories of damages apply to your case.',
    },
    {
      id: 'damages_past_medical',
      type: 'yes_no',
      prompt: 'Are you claiming past medical expenses?',
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
      id: 'damages_loss_consortium',
      type: 'yes_no',
      prompt: 'Is your spouse filing a loss of consortium claim?',
      helpText:
        'Loss of consortium must be pleaded by the spouse as a separate cause of action.',
    },
    {
      id: 'prejudgment_interest_info',
      type: 'info',
      prompt:
        'Pre-Judgment Interest — CPLR §§5001-5004\n\nNew York awards pre-judgment interest at 9% per annum — mandatory, not discretionary. Interest runs from the date of the injury (for past damages) through verdict.\n\nThis is a powerful incentive for defendants to settle. On a $500,000 verdict, 3 years of pre-judgment interest adds $135,000.',
    },

    // === Collateral Source ===
    {
      id: 'collateral_source_info',
      type: 'info',
      prompt:
        'Modified Collateral Source Rule — CPLR §4545\n\nNew York has a modified collateral source rule. At trial, defendants can introduce evidence that your medical expenses or lost earnings were replaced by collateral sources (insurance, Medicare, etc.). The award may be reduced to avoid double recovery.\n\nHowever, amounts YOU paid for insurance premiums are subtracted — so you still benefit from having paid for insurance.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Commencement method
    if (answers.commencement_method === 'summons_complaint') {
      items.push({ status: 'done', text: 'Commencement: Summons and Complaint' })
    } else if (answers.commencement_method === 'summons_notice') {
      items.push({
        status: 'done',
        text: 'Commencement: Summons with Notice — must serve complaint within 20 days of demand (CPLR §3012(b))',
      })
    } else {
      items.push({ status: 'needed', text: 'Commencement method not yet selected' })
    }

    // Court
    if (answers.court_type) {
      const courtLabels: Record<string, string> = {
        supreme: 'Supreme Court',
        nyc_civil: 'NYC Civil Court',
        city_court: 'City Court',
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
        defendant_business: 'defendant principal office',
      }
      const basis = answers.venue_basis ? ` (${basisLabels[answers.venue_basis] || answers.venue_basis})` : ''
      items.push({ status: 'done', text: `Venue: ${answers.venue_county} County${basis}` })
    } else {
      items.push({ status: 'needed', text: 'Venue: County not yet selected' })
    }

    // Certificate of Merit
    if (answers.cause_of_action_type === 'medical_malpractice') {
      items.push({
        status: 'needed',
        text: 'Certificate of Merit required (CPLR §3012-a) — pro se exception available',
      })
    }

    // Construction accident
    if (answers.cause_of_action_type === 'construction_accident') {
      items.push({
        status: 'info',
        text: 'Labor Law §240/§241(6) may apply — strict liability for gravity-related injuries',
      })
    }

    // Jury demand
    if (answers.jury_demand === 'yes') {
      items.push({
        status: 'info',
        text: 'Jury trial: Requested — file Note of Issue + Jury Demand + $65 fee when ready for trial (CPLR §4102)',
      })
    } else if (answers.jury_demand === 'no') {
      items.push({ status: 'done', text: 'Jury trial: Waived — bench trial' })
    }

    // Damages categories
    const damagesKeys = [
      'damages_past_medical', 'damages_future_medical', 'damages_past_lost_earnings',
      'damages_future_lost_earning', 'damages_pain_suffering', 'damages_emotional_distress',
      'damages_loss_enjoyment', 'damages_property_damage', 'damages_loss_consortium',
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

    // Pre-judgment interest
    items.push({
      status: 'info',
      text: 'Pre-judgment interest: 9% per annum from date of injury (CPLR §5004) — mandatory',
    })

    return items
  },
}
