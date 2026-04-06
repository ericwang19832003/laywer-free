import type { GuidedStepConfig } from '../types'

export const preparePiPetitionCaConfig: GuidedStepConfig = {
  title: 'Prepare Your California PI Petition',
  reassurance:
    'California uses mandatory Judicial Council forms for personal injury cases. We will walk you through exactly which forms you need and how to fill them out correctly.',

  questions: [
    // === Form Selection ===
    {
      id: 'forms_overview',
      type: 'info',
      prompt:
        'California Required Court Forms\n\nUnlike many states where you draft a complaint from scratch, California requires you to use mandatory Judicial Council forms for personal injury cases. These are standardized fill-in-the-blank forms that ensure your complaint meets all procedural requirements.\n\nUsing the correct forms is critical — filing the wrong form or missing a required form can result in rejection by the clerk.',
    },
    {
      id: 'main_forms_info',
      type: 'info',
      prompt:
        'Required Judicial Council Forms\n\nYou will need the following forms:\n\n• PLD-PI-001 — Complaint for Personal Injury/Property Damage/Wrongful Death (your main complaint form)\n• SUM-100 — Summons (served on each defendant with the complaint)\n• CM-010 — Civil Case Cover Sheet (filed with the complaint)\n\nDownload all forms at: https://www.courts.ca.gov/forms\n\nAdditional forms may be required depending on your answers below.',
    },
    {
      id: 'cause_of_action_form',
      type: 'single_choice',
      prompt: 'What type of personal injury claim are you filing?',
      helpText:
        'This determines which cause of action attachment you need for form PLD-PI-001.',
      options: [
        {
          value: 'motor_vehicle',
          label: 'PLD-PI-001(1) — Motor Vehicle',
        },
        {
          value: 'general_negligence',
          label: 'PLD-PI-001(2) — General Negligence',
        },
        {
          value: 'premises_liability',
          label: 'PLD-PI-001(4) — Premises Liability',
        },
        {
          value: 'products_liability',
          label: 'PLD-PI-001(5) — Products Liability',
        },
      ],
    },
    {
      id: 'fee_waiver_needed',
      type: 'yes_no',
      prompt: 'Do you need a fee waiver to file your case?',
      helpText:
        'Filing fees in California are $435 for unlimited civil cases (over $35,000) and $240–$370 for limited civil cases ($35,000 or less). If you cannot afford the filing fee, you can request a fee waiver using form FW-001 (Request for Fee Waiver). You qualify if you receive public benefits, your income is at or below 125% of the federal poverty level, or paying the fee would deprive you of basic necessities.',
    },
    {
      id: 'punitive_damages',
      type: 'yes_no',
      prompt:
        'Are you seeking punitive damages against the defendant?',
      helpText:
        'Punitive damages require form PLD-PI-001(6). Under California Civil Code §3294, you must prove by clear and convincing evidence that the defendant acted with malice, oppression, or fraud. This is a high standard — mere negligence is not enough. Examples include drunk driving, intentional harm, or corporate concealment of known dangers.',
    },

    // === Case Classification ===
    {
      id: 'case_classification_info',
      type: 'info',
      prompt:
        'Case Classification: Limited vs. Unlimited Civil\n\nCalifornia divides civil cases into two categories based on the amount in dispute:\n\n• Limited Civil — Total damages sought are $35,000 or less. Lower filing fees, simplified procedures, but restricted discovery and no jury instructions on certain issues.\n• Unlimited Civil — Total damages sought exceed $35,000. Higher filing fees, full discovery rights, and no caps on recovery.\n\nMost personal injury cases with significant medical bills are filed as unlimited civil cases.',
    },
    {
      id: 'case_classification',
      type: 'single_choice',
      prompt: 'How do you want to classify your case?',
      options: [
        {
          value: 'limited_civil',
          label: 'Limited Civil — $35,000 or less in total damages',
        },
        {
          value: 'unlimited_civil',
          label: 'Unlimited Civil — More than $35,000 in total damages',
        },
      ],
    },
    {
      id: 'no_dollar_amount_warning',
      type: 'info',
      prompt:
        'Important: No Dollar Amounts in Your Complaint\n\nCalifornia Code of Civil Procedure §425.10(b) PROHIBITS you from stating a specific dollar amount in a personal injury complaint. Instead of writing "$100,000 in damages," you must request damages "according to proof" or "in an amount to be determined at trial."\n\nViolating this rule can result in your complaint being stricken. This is one of the most common mistakes pro se filers make.',
    },

    // === Venue (CCP §395) ===
    {
      id: 'venue_info',
      type: 'info',
      prompt:
        'Venue Selection — CCP §395\n\nUnder California Code of Civil Procedure §395, you may file your personal injury lawsuit in:\n\n• The county where the injury occurred\n• The county where the defendant resides\n• The county where the defendant conducts business\n\nIf the defendant is a corporation, you can also file where the contract was entered into or where the obligation was to be performed.',
    },
    {
      id: 'venue_county',
      type: 'text',
      prompt: 'In which county will you file?',
      placeholder: 'e.g., Los Angeles, San Francisco, San Diego',
    },
    {
      id: 'venue_basis',
      type: 'single_choice',
      prompt: 'What is your basis for filing in this county?',
      options: [
        {
          value: 'incident_location',
          label: 'The injury/incident occurred in this county',
        },
        {
          value: 'defendant_residence',
          label: 'The defendant resides in this county',
        },
        {
          value: 'defendant_business',
          label: 'The defendant conducts business in this county',
        },
      ],
    },

    // === Damages Categories ===
    {
      id: 'damages_header',
      type: 'info',
      prompt:
        'Damages Categories\n\nSelect which categories of damages apply to your case. Remember: do NOT include specific dollar amounts in your complaint — only indicate which categories you are claiming. The exact amounts will be proven at trial or during settlement negotiations.',
    },
    {
      id: 'damages_past_medical',
      type: 'yes_no',
      prompt: 'Are you claiming past medical expenses?',
      helpText:
        'Medical bills you have already incurred for treatment related to the injury.',
    },
    {
      id: 'damages_future_medical',
      type: 'yes_no',
      prompt: 'Are you claiming future medical expenses?',
      helpText:
        'Anticipated medical treatment you will need in the future due to the injury.',
    },
    {
      id: 'damages_past_lost_earnings',
      type: 'yes_no',
      prompt: 'Are you claiming past lost earnings?',
      helpText: 'Wages or income you have already lost due to the injury.',
    },
    {
      id: 'damages_future_lost_earning',
      type: 'yes_no',
      prompt: 'Are you claiming future lost earning capacity?',
      helpText:
        'Reduced ability to earn income in the future due to lasting effects of the injury.',
    },
    {
      id: 'damages_pain_suffering',
      type: 'yes_no',
      prompt: 'Are you claiming pain and suffering?',
      helpText:
        'Physical pain and suffering you have experienced and may continue to experience.',
    },
    {
      id: 'damages_emotional_distress',
      type: 'yes_no',
      prompt: 'Are you claiming emotional distress?',
      helpText:
        'Anxiety, depression, PTSD, fear, or other emotional harm caused by the injury.',
    },
    {
      id: 'damages_loss_enjoyment',
      type: 'yes_no',
      prompt: 'Are you claiming loss of enjoyment of life?',
      helpText:
        'Inability to participate in activities, hobbies, or experiences you enjoyed before the injury.',
    },
    {
      id: 'damages_property_damage',
      type: 'yes_no',
      prompt: 'Are you claiming property damage?',
      helpText:
        'Damage to your vehicle, personal belongings, or other property caused by the incident.',
    },

    // === Jury Fee Warning ===
    {
      id: 'jury_demand',
      type: 'yes_no',
      prompt: 'Do you want a jury trial?',
      helpText:
        'A jury trial is strongly recommended for personal injury cases. Juries tend to award higher damages than judges, especially for pain and suffering. You must post jury fees and make a timely demand to preserve this right.',
    },
    {
      id: 'jury_fee_warning',
      type: 'info',
      prompt:
        'Jury Fee Deadline — Do Not Miss This\n\nTo preserve your right to a jury trial, you must post a $150 non-refundable jury fee no later than your initial Case Management Conference (CMC), typically scheduled about 180 days after filing.\n\nIf you fail to post the fee by the deadline, you permanently waive your right to a jury trial. The court will not remind you. This is the single most common — and most costly — mistake pro se plaintiffs make in California PI cases.\n\nMark your calendar now. Post the fee as early as possible.',
      showIf: (answers) => answers.jury_demand === 'yes',
    },

    // === Doe Defendants ===
    {
      id: 'doe_defendants_info',
      type: 'info',
      prompt:
        'Doe Defendants — CCP §474\n\nCalifornia law allows you to name up to 100 "Doe" defendants in your complaint when you do not yet know the true names of all parties who may be responsible for your injuries.\n\nThis is standard practice in California PI cases. As discovery reveals the identities of additional responsible parties, you can amend your complaint to substitute their real names for the Doe designations.\n\nYour complaint will include standard Doe defendant language automatically.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Forms needed
    const causeLabels: Record<string, string> = {
      motor_vehicle: 'PLD-PI-001(1) Motor Vehicle',
      general_negligence: 'PLD-PI-001(2) General Negligence',
      premises_liability: 'PLD-PI-001(4) Premises Liability',
      products_liability: 'PLD-PI-001(5) Products Liability',
    }

    const forms = ['PLD-PI-001', 'SUM-100', 'CM-010']
    if (answers.cause_of_action_form) {
      forms.push(causeLabels[answers.cause_of_action_form] || answers.cause_of_action_form)
    }
    if (answers.punitive_damages === 'yes') {
      forms.push('PLD-PI-001(6) Punitive Damages')
    }
    if (answers.fee_waiver_needed === 'yes') {
      forms.push('FW-001 Fee Waiver')
    }

    items.push({
      status: answers.cause_of_action_form ? 'done' : 'needed',
      text: `Forms needed: ${forms.join(', ')}`,
    })

    // Case classification
    if (answers.case_classification === 'limited_civil') {
      items.push({ status: 'done', text: 'Case classification: Limited Civil ($35,000 or less)' })
    } else if (answers.case_classification === 'unlimited_civil') {
      items.push({ status: 'done', text: 'Case classification: Unlimited Civil (over $35,000)' })
    } else {
      items.push({ status: 'needed', text: 'Case classification: Not yet selected' })
    }

    // Venue
    if (answers.venue_county) {
      const basisLabels: Record<string, string> = {
        incident_location: 'incident location',
        defendant_residence: 'defendant residence',
        defendant_business: 'defendant business location',
      }
      const basis = answers.venue_basis ? ` (${basisLabels[answers.venue_basis] || answers.venue_basis})` : ''
      items.push({ status: 'done', text: `Venue: ${answers.venue_county} County${basis}` })
    } else {
      items.push({ status: 'needed', text: 'Venue: County not yet selected' })
    }

    // Damages categories count
    const damagesKeys = [
      'damages_past_medical',
      'damages_future_medical',
      'damages_past_lost_earnings',
      'damages_future_lost_earning',
      'damages_pain_suffering',
      'damages_emotional_distress',
      'damages_loss_enjoyment',
      'damages_property_damage',
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

    // Jury demand
    if (answers.jury_demand === 'yes') {
      items.push({
        status: 'info',
        text: 'Jury trial: Requested — post $150 fee before initial CMC (within ~180 days)',
      })
    } else if (answers.jury_demand === 'no') {
      items.push({ status: 'done', text: 'Jury trial: Waived — bench trial' })
    }

    // Fee waiver
    if (answers.fee_waiver_needed === 'yes') {
      items.push({ status: 'needed', text: 'Fee waiver: FW-001 required — file with complaint' })
    } else if (answers.fee_waiver_needed === 'no') {
      items.push({ status: 'done', text: 'Fee waiver: Not needed' })
    }

    return items
  },
}
