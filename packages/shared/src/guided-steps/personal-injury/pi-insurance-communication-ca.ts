import type { GuidedStepConfig } from '../types'

/** Helper: answers indicate UM/UIM coverage may be needed */
function needsUmUim(answers: Record<string, string>): boolean {
  return (
    answers.at_fault_has_insurance === 'no' ||
    answers.at_fault_has_insurance === 'unknown' ||
    answers.coverage_sufficient === 'no' ||
    answers.coverage_sufficient === 'unknown'
  )
}

/** Helper: UM/UIM needed AND not rejected in writing */
function uimApplies(answers: Record<string, string>): boolean {
  return needsUmUim(answers) && answers.um_uim_rejected !== 'yes'
}

export const piInsuranceCommunicationCaConfig: GuidedStepConfig = {
  title: 'Communicate With Insurance',
  reassurance:
    "Knowing how to handle insurance communications protects your rights and your claim's value.",

  questions: [
    // ── Section 1: Playbook (identical to TX) ──────────────────────────
    {
      id: 'playbook_header',
      type: 'info',
      prompt:
        '🛡️ Know Before You Talk — Insurance Playbook\n\nBefore communicating with any insurance company, read these critical rules. Insurance companies are not on your side — they are businesses trying to minimize what they pay.',
    },
    {
      id: 'playbook_recorded_statements',
      type: 'info',
      prompt:
        "🎙️ Recorded Statements\n\n❌ DON'T agree to a recorded statement from the other driver's insurance company. You are NOT legally required to give one. Anything you say can and will be used to reduce your claim.\n\n✅ DO keep written notes of every conversation — date, time, who you spoke with, and what was discussed.",
    },
    {
      id: 'playbook_early_offers',
      type: 'info',
      prompt:
        "💰 Early Settlement Offers\n\n❌ DON'T accept the first offer. It is almost always far below the fair value of your claim.\n\n✅ DO wait until you have reached Maximum Medical Improvement (MMI) — the point where your doctor says your condition will not improve further. Settling before MMI means you cannot account for future treatment costs.",
    },
    {
      id: 'playbook_authorizations',
      type: 'info',
      prompt:
        "📋 Blanket Authorizations\n\n❌ DON'T sign blanket medical or employment record authorizations. The insurer wants access to your entire history to find pre-existing conditions.\n\n✅ DO only provide records directly related to this incident.",
    },
    {
      id: 'playbook_surveillance',
      type: 'info',
      prompt:
        "📷 Surveillance\n\n✅ DO be aware that insurance companies may hire investigators to photograph or video you if your claim is significant. Anything inconsistent with your claimed injuries can be used against you.\n\n✅ DO be honest about your limitations — don't exaggerate, but don't push through pain for appearances.",
    },
    {
      id: 'playbook_social_media',
      type: 'info',
      prompt:
        "📱 Social Media\n\n❌ DON'T post about your case, your injuries, or your activities on social media. Insurance companies routinely monitor plaintiff social media.\n\n✅ DO set all profiles to private and avoid posting until your case is resolved.",
    },
    {
      id: 'playbook_acknowledged',
      type: 'yes_no',
      prompt: 'I have read and understand the insurance playbook above.',
    },

    // ── Section 2: Insurance claim tracking (same as TX) ───────────────
    {
      id: 'claim_filed',
      type: 'yes_no',
      prompt:
        'Have you filed an insurance claim (with your own or the at-fault party\'s insurance)?',
      helpText:
        'Most policies require timely notice. Get a claim number and keep it handy.',
    },
    {
      id: 'adjuster_contacted_you',
      type: 'yes_no',
      prompt: 'Has an insurance adjuster contacted you?',
      helpText:
        'Adjusters may call, email, or send letters. Keep a record of all contact.',
    },
    {
      id: 'recorded_statement_requested',
      type: 'yes_no',
      prompt: 'Has the adjuster asked you for a recorded statement?',
      helpText:
        'This is a common request, especially from the other party\'s insurance.',
      showIf: (answers) => answers.adjuster_contacted_you === 'yes',
    },
    {
      id: 'recorded_statement_warning',
      type: 'info',
      prompt:
        'You are NOT required to give a recorded statement to the other party\'s insurance company. You can decline and say "I prefer to communicate in writing." If you do give a statement, prepare your answers in advance and stick to basic facts.',
      helpText:
        'Your own insurance policy may require cooperation, but be cautious about what you say.',
      showIf: (answers) => answers.recorded_statement_requested === 'yes',
    },
    {
      id: 'offered_quick_settlement',
      type: 'yes_no',
      prompt: 'Has the insurance company offered you a quick settlement?',
      helpText:
        'Insurance companies sometimes offer early settlements before you know the full extent of your injuries.',
    },
    {
      id: 'quick_settlement_warning',
      type: 'info',
      prompt:
        'Early settlement offers are almost always too low. Do not accept any settlement before completing medical treatment. Once you accept, you cannot go back and ask for more, even if your injuries turn out to be worse than expected.',
      helpText:
        'Wait until you reach Maximum Medical Improvement (MMI) to know the true value of your claim.',
      showIf: (answers) => answers.offered_quick_settlement === 'yes',
    },
    {
      id: 'documenting_communications',
      type: 'yes_no',
      prompt:
        'Are you documenting all communications with insurance companies (dates, names, what was discussed)?',
      helpText:
        'A written log protects you if there is a dispute about what was said.',
    },
    {
      id: 'know_policy_limits',
      type: 'single_choice',
      prompt:
        "Do you know the at-fault party's insurance policy limits?",
      helpText:
        'Policy limits determine the maximum the insurance will pay. This affects your strategy.',
      options: [
        { value: 'yes', label: 'Yes, I know the limits' },
        { value: 'no', label: "No, I don't know them" },
        { value: 'unsure', label: "I'm not sure what policy limits are" },
      ],
    },
    {
      id: 'adjuster_tactics_info',
      type: 'info',
      prompt:
        'Watch out for common adjuster tactics: offering a lowball settlement before you know your full injuries, calling frequently to pressure you, requesting unnecessary medical authorizations to access your full history, and delaying responses to run out the statute of limitations. Stick to basic facts, say "I\'m still treating" if asked about injuries, and never speculate about fault.',
      helpText:
        'You can always say "I need time to think about it" before agreeing to anything.',
    },

    // ── Section 3: CA UM/UIM (replaces TX UM/UIM) ─────────────────────
    {
      id: 'uim_section_header',
      type: 'info',
      prompt:
        '🚗 You May Have More Coverage Than You Think — California UM/UIM\n\nIn California, auto insurance policies must include Uninsured/Underinsured Motorist (UM/UIM) coverage by default under Insurance Code §11580.2. Unlike most states, you can only reject this coverage in writing.\n\nImportant: CA UM/UIM disputes are resolved through binding arbitration — not a lawsuit against your own insurer.',
    },
    {
      id: 'at_fault_has_insurance',
      type: 'single_choice',
      prompt: 'Does the at-fault driver have insurance?',
      options: [
        { value: 'yes', label: 'Yes — they have insurance' },
        { value: 'no', label: 'No — they are uninsured' },
        { value: 'unknown', label: "I don't know yet" },
        { value: 'not_vehicle', label: 'This is not a motor vehicle case' },
      ],
    },
    {
      id: 'coverage_sufficient',
      type: 'single_choice',
      prompt: 'Is their insurance coverage enough to cover your damages?',
      options: [
        { value: 'yes', label: 'Yes — their coverage seems sufficient' },
        { value: 'no', label: 'No — their limits are too low' },
        { value: 'unknown', label: "I don't know their coverage limits" },
      ],
      showIf: (answers) => answers.at_fault_has_insurance === 'yes',
    },
    {
      id: 'um_uim_rejected',
      type: 'single_choice',
      prompt:
        'Did you reject UM/UIM coverage in writing when you purchased your auto policy?',
      helpText:
        'California requires a signed written rejection. If you never signed one, you have UM/UIM coverage by law (Insurance Code §11580.2).',
      options: [
        { value: 'yes', label: 'Yes — I signed a written rejection' },
        { value: 'no', label: 'No — I did not reject it' },
        { value: 'unknown', label: "I'm not sure" },
      ],
      showIf: needsUmUim,
    },
    {
      id: 'uim_guidance',
      type: 'info',
      prompt:
        '📋 File a UM/UIM Claim With Your Own Insurer\n\nSince the at-fault driver has no insurance or insufficient coverage, you should file a UM/UIM claim with your own auto insurer.\n\nKey CA rules:\n• Arbitration, not litigation — UM/UIM disputes in California are resolved through binding arbitration, not a lawsuit against your insurer.\n• 2-year deadline — You must demand arbitration within 2 years of the accident under Insurance Code §11580.2(i)(1).\n• UIM: exhaust at-fault limits first — For underinsured motorist claims, you generally must exhaust the at-fault driver\'s policy limits before your UIM coverage kicks in.\n• Notify your insurer promptly — Most policies require timely notice of the claim.',
      showIf: uimApplies,
    },
    {
      id: 'uim_insurer_name',
      type: 'text',
      prompt: 'What is your auto insurance company name?',
      placeholder: 'e.g., State Farm, GEICO, Progressive',
      showIf: uimApplies,
    },
    {
      id: 'uim_policy_number',
      type: 'text',
      prompt: 'What is your policy number?',
      placeholder: 'Policy number from declarations page',
      showIf: uimApplies,
    },
    {
      id: 'uim_limits',
      type: 'text',
      prompt: 'What are your UM/UIM coverage limits (if you can find them)?',
      placeholder: 'e.g., $30,000/$60,000',
      showIf: uimApplies,
    },

    // ── Section 4: MedPay (CA-specific) ────────────────────────────────
    {
      id: 'medpay_header',
      type: 'info',
      prompt:
        '🏥 Medical Payments (MedPay) Coverage\n\nCalifornia insurers are required to offer at least $1,000 in Medical Payments (MedPay) coverage under Insurance Code §11580.06. MedPay is optional — you may or may not have it.\n\nMedPay pays for medical expenses regardless of who was at fault. It can help cover immediate costs while your injury claim is pending.',
    },
    {
      id: 'has_medpay',
      type: 'single_choice',
      prompt: 'Do you have Medical Payments (MedPay) coverage on your auto policy?',
      helpText:
        'Check your auto insurance declarations page under "Medical Payments" or "MedPay."',
      options: [
        { value: 'yes', label: 'Yes — I have MedPay' },
        { value: 'no', label: 'No — I do not have MedPay' },
        { value: 'unknown', label: "I'm not sure" },
      ],
    },
    {
      id: 'medpay_guidance',
      type: 'info',
      prompt:
        '💡 File Your MedPay Claim Now\n\nFile your MedPay claim with your own insurer as soon as possible — it covers medical bills regardless of fault and can provide immediate relief.\n\n⚠️ Subrogation warning: Your insurer may have a right to be reimbursed from your injury settlement for MedPay benefits paid. Keep this in mind when calculating your final recovery.',
      showIf: (answers) =>
        answers.has_medpay === 'yes' || answers.has_medpay === 'unknown',
    },
    {
      id: 'medpay_limit',
      type: 'text',
      prompt: 'What is your MedPay coverage limit?',
      placeholder: 'e.g., $5,000',
      showIf: (answers) => answers.has_medpay === 'yes',
    },

    // ── Section 5: Prop 213 reminder ───────────────────────────────────
    {
      id: 'prop_213_uninsured_check',
      type: 'yes_no',
      prompt:
        'Were you driving without valid insurance at the time of the accident?',
      helpText:
        'This affects what types of damages you can recover under California law.',
    },
    {
      id: 'prop_213_reminder',
      type: 'info',
      prompt:
        '⚖️ Proposition 213 Reminder\n\nUnder California\'s Proposition 213 (Civil Code §3333.4), if you were driving without valid insurance at the time of the accident, you cannot recover non-economic damages (pain and suffering) — only economic damages such as medical bills and lost wages.\n\nThis is a significant limitation. Make sure all your economic damages are thoroughly documented.',
      showIf: (answers) => answers.prop_213_uninsured_check === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Playbook
    items.push({
      status: answers.playbook_acknowledged === 'yes' ? 'done' : 'needed',
      text: 'Insurance playbook reviewed',
    })

    if (answers.claim_filed === 'yes') {
      items.push({ status: 'done', text: 'Insurance claim filed.' })
    } else {
      items.push({
        status: 'needed',
        text: 'File an insurance claim promptly. Most policies require timely notice.',
      })
    }

    if (answers.adjuster_contacted_you === 'yes') {
      if (answers.recorded_statement_requested === 'yes') {
        items.push({
          status: 'info',
          text: 'You are NOT required to give a recorded statement to the other party\'s insurer. Consider declining or communicating in writing.',
        })
      }
    }

    if (answers.offered_quick_settlement === 'yes') {
      items.push({
        status: 'needed',
        text: 'Do NOT accept the early settlement offer. Wait until you complete treatment to know the true value of your claim.',
      })
    }

    if (answers.documenting_communications === 'yes') {
      items.push({
        status: 'done',
        text: 'Keeping a log of all insurance communications.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Start documenting all insurance communications: dates, names, and what was discussed.',
      })
    }

    if (answers.know_policy_limits === 'yes') {
      items.push({ status: 'done', text: 'Policy limits are known.' })
    } else if (answers.know_policy_limits === 'unsure') {
      items.push({
        status: 'info',
        text: "Policy limits are the maximum an insurer will pay. Ask the adjuster or check the at-fault party's declarations page.",
      })
    } else {
      items.push({
        status: 'needed',
        text: "Find out the at-fault party's policy limits. This affects your settlement strategy.",
      })
    }

    items.push({
      status: 'info',
      text: 'Watch for adjuster tactics: lowball offers, pressure calls, unnecessary medical authorizations, and delays.',
    })

    // UM/UIM (with arbitration note)
    if (needsUmUim(answers)) {
      if (answers.um_uim_rejected === 'yes') {
        items.push({
          status: 'info',
          text: 'You indicated you rejected UM/UIM coverage in writing. Verify this with your insurer — if no signed rejection exists, you have coverage by law.',
        })
      } else {
        items.push({
          status: answers.uim_insurer_name ? 'done' : 'needed',
          text: `UM/UIM insurer: ${answers.uim_insurer_name || 'Not yet provided'}`,
        })
        items.push({
          status: 'info',
          text: 'CA UM/UIM claims are resolved through binding arbitration. You have 2 years from the accident to demand arbitration (Insurance Code §11580.2(i)(1)).',
        })
      }
    }

    // MedPay
    if (answers.has_medpay === 'yes') {
      items.push({
        status: 'done',
        text: `MedPay coverage available${answers.medpay_limit ? ` (limit: ${answers.medpay_limit})` : ''}. File the claim promptly.`,
      })
    } else if (answers.has_medpay === 'unknown') {
      items.push({
        status: 'needed',
        text: 'Check your auto policy for Medical Payments (MedPay) coverage — CA insurers must offer it.',
      })
    }

    // Prop 213
    if (answers.prop_213_uninsured_check === 'yes') {
      items.push({
        status: 'info',
        text: '⚠️ Prop 213 applies: No non-economic damages (pain & suffering) recovery. Focus on documenting all economic damages thoroughly.',
      })
    }

    return items
  },
}
