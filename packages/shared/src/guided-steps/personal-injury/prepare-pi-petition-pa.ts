import type { GuidedStepConfig } from '../types'

export const preparePiPetitionPaConfig: GuidedStepConfig = {
  title: 'Prepare Your Pennsylvania PI Complaint',
  reassurance:
    'Pennsylvania uses notice pleading — your complaint must give fair notice of your claims but does not require the level of specificity some other states demand. We will walk you through the key procedural requirements unique to PA.',

  questions: [
    // === Compulsory Arbitration Check ===
    {
      id: 'arbitration_header',
      type: 'info',
      prompt:
        'PA Compulsory Arbitration — 42 Pa.C.S. §7361\n\nPennsylvania requires compulsory arbitration for claims under a threshold amount (typically $50,000, varies by county). Your case will go to an arbitration panel first.',
    },
    {
      id: 'claim_amount_check',
      type: 'single_choice',
      prompt: 'Is your total claim over $50,000?',
      helpText:
        'The compulsory arbitration threshold varies by county but is typically $50,000. If your claim is under the threshold, the case must first go through an arbitration panel before you can get a jury trial.',
      options: [
        { value: 'yes_over', label: 'Yes — my claim exceeds $50,000' },
        { value: 'no_under', label: 'No — my claim is $50,000 or less' },
        { value: 'unsure', label: 'I am not sure' },
      ],
    },
    {
      id: 'arbitration_info',
      type: 'info',
      prompt:
        'Compulsory Arbitration — What to Expect\n\nYour case will first go to compulsory arbitration. An arbitration panel hears the case and issues an award. Either party can appeal for a full trial de novo within 30 days.\n\nImportant: If you appeal and do not get a better result at trial, you may have to pay the other side\'s costs.',
      showIf: (answers) => answers.claim_amount_check === 'no_under',
    },
    {
      id: 'over_50k_info',
      type: 'info',
      prompt:
        'Claim Exceeds Arbitration Threshold\n\nYour case exceeds the compulsory arbitration threshold. Use damages language "in excess of $50,000" in your complaint to avoid being routed to arbitration.',
      showIf: (answers) => answers.claim_amount_check === 'yes_over',
    },

    // === Venue (Pa.R.C.P. 1006) ===
    {
      id: 'venue_info',
      type: 'info',
      prompt:
        'Venue Selection — Pa.R.C.P. 1006\n\nYou may file your personal injury complaint in:\n\n• The county where the cause of action arose (where the incident happened)\n• The county where the defendant resides or does business\n\nFor corporate defendants (Pa.R.C.P. 2179): the county of the registered office, principal place of business, or where the cause of action arose.',
    },
    {
      id: 'venue_county',
      type: 'text',
      prompt: 'In which county will you file?',
      placeholder: 'e.g., Philadelphia, Allegheny, Montgomery',
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
          label: 'The defendant does business in this county',
        },
      ],
    },

    // === Complaint Structure (PA Notice Pleading) ===
    {
      id: 'pleading_info',
      type: 'info',
      prompt:
        'PA Notice Pleading\n\nPennsylvania uses notice pleading — your complaint must give fair notice of your claims but does not need the level of detail Texas requires. There is no TRCP 47(c) relief level. No discovery control plan.',
    },
    {
      id: 'verification_warning',
      type: 'info',
      prompt:
        'IMPORTANT: Verification Requirement — Pa.R.C.P. 1024\n\nPennsylvania requires your complaint to be verified. You must include a sworn statement that the facts in the complaint are true and correct to the best of your knowledge, information, and belief.\n\nFiling an unverified complaint is a procedural defect that the defendant can raise. Do not skip this step.',
    },

    // === Jury Demand Warning ===
    {
      id: 'jury_demand',
      type: 'yes_no',
      prompt: 'Do you want a jury trial?',
      helpText:
        'A jury trial is strongly recommended for personal injury cases. Juries tend to award higher damages than judges, especially for pain and suffering.',
    },
    {
      id: 'jury_warning',
      type: 'info',
      prompt:
        'CRITICAL: Jury Demand Must Be in Your Complaint — Pa.R.C.P. 1007.1\n\nIn Pennsylvania, you MUST include the jury demand in your complaint. If you omit it, you may permanently waive your right to a jury trial.\n\nUnlike California (which gives you until the Case Management Conference to post jury fees), PA requires the jury demand at filing. Include "Plaintiff demands a trial by jury" prominently in your complaint.',
      showIf: (answers) => answers.jury_demand === 'yes',
    },

    // === Damages Categories ===
    {
      id: 'damages_header',
      type: 'info',
      prompt:
        'Damages Categories\n\nSelect which categories of damages apply to your case. In Pennsylvania, you do not include specific dollar amounts in your complaint (except to establish that damages exceed the arbitration threshold). Indicate which categories you are claiming — the exact amounts will be proven at trial or during settlement negotiations.',
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
    {
      id: 'delay_damages_info',
      type: 'info',
      prompt:
        'PA Delay Damages — Pa.R.C.P. 238\n\nYou can recover prejudgment interest at the prime rate plus 1% from the date you file your complaint. This accrues automatically — you do not need to request it separately.\n\nDelay damages are a strong incentive for the defendant to settle promptly, as the interest accumulates for the entire duration of the litigation.',
    },

    // === Cause of Action Elements ===
    {
      id: 'cause_of_action_info',
      type: 'info',
      prompt:
        'Cause of Action Elements\n\nYour complaint must allege separate counts for each cause of action. Each negligence count must include:\n\n• Duty — the defendant owed you a duty of care (pre-filled based on your case sub-type)\n• Breach — the defendant violated that duty\n• Causation — the breach caused your injuries\n\nIf you have claims against multiple defendants or multiple theories of liability, each should be a separate count in your complaint.',
    },
    {
      id: 'cause_of_action_type',
      type: 'single_choice',
      prompt: 'What type of negligence claim are you filing?',
      helpText:
        'This determines the duty element that will be pre-filled in your complaint.',
      options: [
        {
          value: 'motor_vehicle',
          label: 'Motor Vehicle Accident',
        },
        {
          value: 'premises_liability',
          label: 'Premises Liability (slip and fall, unsafe property)',
        },
        {
          value: 'medical_malpractice',
          label: 'Medical Malpractice',
        },
        {
          value: 'general_negligence',
          label: 'General Negligence',
        },
        {
          value: 'products_liability',
          label: 'Products Liability',
        },
      ],
    },
    {
      id: 'breach_description',
      type: 'text',
      prompt: 'Briefly describe how the defendant breached their duty of care.',
      placeholder:
        'e.g., Defendant ran a red light and struck my vehicle; Defendant failed to maintain safe premises',
    },
    {
      id: 'causation_description',
      type: 'text',
      prompt:
        'Briefly describe how the breach caused your injuries.',
      placeholder:
        'e.g., As a direct result of the collision, I suffered a herniated disc and fractured wrist',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Arbitration status
    if (answers.claim_amount_check === 'yes_over') {
      items.push({
        status: 'done',
        text: 'Arbitration: Claim exceeds $50,000 — use "in excess of $50,000" language',
      })
    } else if (answers.claim_amount_check === 'no_under') {
      items.push({
        status: 'info',
        text: 'Arbitration: Case subject to compulsory arbitration — appeal available within 30 days',
      })
    } else if (answers.claim_amount_check === 'unsure') {
      items.push({
        status: 'needed',
        text: 'Arbitration: Claim amount uncertain — verify county threshold before filing',
      })
    } else {
      items.push({ status: 'needed', text: 'Arbitration: Not yet determined' })
    }

    // Venue
    if (answers.venue_county) {
      const basisLabels: Record<string, string> = {
        incident_location: 'incident location',
        defendant_residence: 'defendant residence',
        defendant_business: 'defendant business location',
      }
      const basis = answers.venue_basis
        ? ` (${basisLabels[answers.venue_basis] || answers.venue_basis})`
        : ''
      items.push({
        status: 'done',
        text: `Venue: ${answers.venue_county} County${basis}`,
      })
    } else {
      items.push({ status: 'needed', text: 'Venue: County not yet selected' })
    }

    // Jury demand
    if (answers.jury_demand === 'yes') {
      items.push({
        status: 'info',
        text: 'Jury trial: Requested — MUST include demand in complaint (Pa.R.C.P. 1007.1)',
      })
    } else if (answers.jury_demand === 'no') {
      items.push({ status: 'done', text: 'Jury trial: Waived — bench trial' })
    } else {
      items.push({ status: 'needed', text: 'Jury trial: Not yet decided' })
    }

    // Verification reminder
    items.push({
      status: 'info',
      text: 'Verification: Complaint must include sworn verification statement (Pa.R.C.P. 1024)',
    })

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
    const answeredCount = damagesKeys.filter(
      (k) => answers[k] !== undefined,
    ).length

    if (answeredCount > 0) {
      items.push({
        status: claimedCount > 0 ? 'done' : 'info',
        text: `Damages: ${claimedCount} categor${claimedCount === 1 ? 'y' : 'ies'} claimed`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Damages: Categories not yet selected',
      })
    }

    // Delay damages note
    items.push({
      status: 'info',
      text: 'Delay damages: Prejudgment interest accrues automatically at prime + 1% from filing date (Pa.R.C.P. 238)',
    })

    return items
  },
}
