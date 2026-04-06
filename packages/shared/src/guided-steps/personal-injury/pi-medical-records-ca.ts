import type { GuidedStepConfig } from '../types'

export const piMedicalRecordsCaConfig: GuidedStepConfig = {
  title: 'Organize Your Medical Records',
  reassurance:
    'Complete medical documentation strengthens your case and helps calculate your full damages.',

  questions: [
    // ── Base medical records (same as TX) ──────────────────────────
    {
      id: 'visited_er',
      type: 'yes_no',
      prompt: 'Did you visit the emergency room after the incident?',
      helpText:
        'ER records document the initial severity of your injuries and are key evidence.',
    },
    {
      id: 'er_records_obtained',
      type: 'yes_no',
      prompt:
        'Have you obtained your emergency room records and discharge summary?',
      helpText:
        "Contact the hospital's medical records department to request copies.",
      showIf: (answers) => answers.visited_er === 'yes',
    },
    {
      id: 'seeing_specialists',
      type: 'yes_no',
      prompt:
        'Are you seeing any specialists (orthopedic, neurologist, etc.)?',
      helpText:
        'Specialist records provide detailed documentation of specific injuries.',
    },
    {
      id: 'specialist_records_obtained',
      type: 'single_choice',
      prompt: 'Have you obtained records from all your specialists?',
      helpText:
        "Request records from each specialist's office using a HIPAA authorization form.",
      options: [
        { value: 'all', label: 'Yes, I have all specialist records' },
        { value: 'some', label: 'Some, but not all' },
        { value: 'none', label: "No, I haven't requested any yet" },
      ],
      showIf: (answers) => answers.seeing_specialists === 'yes',
    },
    {
      id: 'has_imaging',
      type: 'yes_no',
      prompt:
        'Do you have copies of imaging results (X-rays, MRIs, CT scans)?',
      helpText:
        'Imaging provides objective evidence of your injuries. Request copies from the imaging facility.',
    },
    {
      id: 'taking_prescriptions',
      type: 'yes_no',
      prompt:
        'Are you taking any prescriptions related to your injuries?',
      helpText: 'Prescription costs are part of your medical damages.',
    },
    {
      id: 'prescription_receipts',
      type: 'yes_no',
      prompt:
        'Do you have receipts or records for all your prescriptions?',
      helpText:
        'Your pharmacy can provide a printout of all prescriptions filled since the incident.',
      showIf: (answers) => answers.taking_prescriptions === 'yes',
    },
    {
      id: 'doing_pt',
      type: 'yes_no',
      prompt: 'Are you doing physical therapy or rehabilitation?',
      helpText:
        'PT records show ongoing treatment needs and help demonstrate the severity of your injuries.',
    },
    {
      id: 'mental_health_impact',
      type: 'yes_no',
      prompt:
        'Has the incident affected your mental health (anxiety, PTSD, depression)?',
      helpText:
        'Mental health impacts are compensable damages. Records from a therapist or counselor strengthen this part of your claim.',
    },
    {
      id: 'hipaa_requests_sent',
      type: 'single_choice',
      prompt:
        'Have you sent HIPAA authorization requests to all your medical providers?',
      helpText:
        'Most providers must respond within 30 days. Keep copies of every request you send.',
      options: [
        { value: 'all_sent', label: 'Yes, sent to all providers' },
        { value: 'some_sent', label: 'Sent to some, but not all' },
        { value: 'not_sent', label: "I haven't sent any yet" },
      ],
    },
    {
      id: 'timeline_created',
      type: 'yes_no',
      prompt:
        'Have you created a chronological timeline of all your medical visits?',
      helpText:
        'For each visit, note the date, provider, treatment, and cost. This is your medical narrative.',
    },
    {
      id: 'mmi_info',
      type: 'info',
      prompt:
        "Do NOT send your demand letter until you reach Maximum Medical Improvement (MMI) or complete treatment. Sending too early means you may undervalue your claim because future medical costs won't be included.",
      helpText:
        'Ask your doctor when they expect you to reach MMI. This is the point where your condition has stabilized.',
    },

    // ── Howell v. Hamilton Meats Section ───────────────────────────
    {
      id: 'howell_header',
      type: 'info',
      prompt:
        '💰 Billed vs. Paid — Howell v. Hamilton Meats (2011)\n\nUnder California law, you can only recover the amount actually paid or incurred for medical treatment — not the full amount billed. The California Supreme Court ruled in Howell v. Hamilton Meats & Provisions (2011) that the relevant measure of damages is the lesser amount actually paid, including any insurance negotiated rate.\n\nThis means you need both your medical bills AND your Explanation of Benefits (EOBs) showing what was actually paid.',
    },
    {
      id: 'has_health_insurance',
      type: 'single_choice',
      prompt:
        'Did health insurance cover any of your treatment?',
      options: [
        { value: 'yes', label: 'Yes, insurance covered my treatment' },
        { value: 'partial', label: 'Partially — some treatment was covered' },
        { value: 'no', label: 'No, I paid everything out of pocket' },
      ],
    },
    {
      id: 'eob_guidance',
      type: 'info',
      prompt:
        '📄 Collect Your Explanation of Benefits (EOBs)\n\nFor every medical visit covered by insurance, your insurer sends an EOB showing what was billed, what the insurer paid, and what you owe. Collect EOBs for every treatment related to this injury.\n\nKeep BOTH the original bills and the EOBs — you will need both to calculate your damages under Howell.',
      showIf: (answers) =>
        answers.has_health_insurance === 'yes' ||
        answers.has_health_insurance === 'partial',
    },
    {
      id: 'collected_eobs',
      type: 'yes_no',
      prompt: 'Have you collected your Explanation of Benefits (EOBs) from your insurer?',
      showIf: (answers) =>
        answers.has_health_insurance === 'yes' ||
        answers.has_health_insurance === 'partial',
    },

    // ── Treatment on Lien ──────────────────────────────────────────
    {
      id: 'lien_header',
      type: 'info',
      prompt:
        '🏥 Treatment on Lien\n\nIn California, some medical providers agree to treat you "on a lien" — meaning they defer payment until your case settles. Unlike insurance-negotiated rates, the full billed amount from a lien provider may be considered the reasonable value of services under Howell, because no insurer negotiated it down.\n\nLien-based treatment can be valuable when you lack insurance, but it comes with important considerations.',
    },
    {
      id: 'treatment_on_lien',
      type: 'yes_no',
      prompt: 'Are any of your medical providers treating you on a lien?',
    },
    {
      id: 'lien_warning',
      type: 'info',
      prompt:
        '⚠️ Lien Billing Considerations\n\nBe aware that lien-based medical bills may be higher than what insurance would pay. However, these amounts are negotiable — you are not required to pay the full billed amount. The lien provider\'s bill is a starting point, not the final word.\n\nDocument everything and keep copies of all lien agreements.',
      showIf: (answers) => answers.treatment_on_lien === 'yes',
    },
    {
      id: 'lien_provider_name',
      type: 'text',
      prompt: 'What is the name of the lien provider?',
      placeholder: 'Provider name',
      showIf: (answers) => answers.treatment_on_lien === 'yes',
    },
    {
      id: 'lien_amount',
      type: 'text',
      prompt: 'What is the current lien amount (if known)?',
      placeholder: 'e.g., $15,000',
      showIf: (answers) => answers.treatment_on_lien === 'yes',
    },

    // ── Medi-Cal / Medicare ────────────────────────────────────────
    {
      id: 'govt_lien_header',
      type: 'info',
      prompt:
        '🏛️ Medi-Cal & Medicare Reimbursement\n\nIf Medi-Cal or Medicare paid for any of your injury-related treatment, they have a statutory right to be reimbursed from your settlement. Federal and state law require that these government liens be satisfied before you receive your share.\n\nFailure to repay can result in future benefits issues or legal action.',
    },
    {
      id: 'medi_cal_paid',
      type: 'yes_no',
      prompt: 'Did Medi-Cal pay for any of your injury-related treatment?',
    },
    {
      id: 'medi_cal_guidance',
      type: 'info',
      prompt:
        '📞 Medi-Cal Lien Resolution\n\nContact the Department of Health Care Services (DHCS) Third Party Liability and Recovery Division to determine the lien amount and negotiate if possible.\n\nPhone: (916) 650-0490\n\nRequest an itemized statement of all payments made on your behalf. California law (Welfare & Institutions Code § 14124.71) allows reduction of the Medi-Cal lien in certain circumstances.',
      showIf: (answers) => answers.medi_cal_paid === 'yes',
    },
    {
      id: 'medicare_paid',
      type: 'yes_no',
      prompt: 'Did Medicare pay for any of your injury-related treatment?',
    },
    {
      id: 'medicare_guidance',
      type: 'info',
      prompt:
        "📞 Medicare Lien Resolution\n\nContact the Benefits Coordination & Recovery Center (BCRC) to determine Medicare's conditional payment amount.\n\nPhone: 1-855-798-2627\n\nRequest a conditional payment letter showing all Medicare payments related to your injury. You must satisfy Medicare's lien from your settlement — the Medicare Secondary Payer Act (42 U.S.C. § 1395y) requires it.",
      showIf: (answers) => answers.medicare_paid === 'yes',
    },
    {
      id: 'govt_lien_amount',
      type: 'text',
      prompt:
        'What is the total government lien amount (Medi-Cal and/or Medicare), if known?',
      placeholder: 'e.g., $5,000',
      showIf: (answers) =>
        answers.medi_cal_paid === 'yes' || answers.medicare_paid === 'yes',
    },

    // ── Medical auth warning (same as TX) ──────────────────────────
    {
      id: 'medical_auth_warning',
      type: 'info',
      prompt:
        "🚫 DON'T Sign Blanket Medical Authorizations\n\nThe insurance company may ask you to sign a broad medical authorization giving them access to your entire medical history. DON'T do this.\n\n✅ DO: Only authorize release of records directly related to this injury.\n❌ DON'T: Sign anything that gives them access to unrelated medical history.\n\nThey want to find pre-existing conditions to reduce your claim.",
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Base medical records summary
    if (answers.visited_er === 'yes') {
      if (answers.er_records_obtained === 'yes') {
        items.push({ status: 'done', text: 'ER records obtained.' })
      } else {
        items.push({
          status: 'needed',
          text: 'Request your emergency room records and discharge summary.',
        })
      }
    }

    if (answers.seeing_specialists === 'yes') {
      if (answers.specialist_records_obtained === 'all') {
        items.push({
          status: 'done',
          text: 'All specialist records obtained.',
        })
      } else if (answers.specialist_records_obtained === 'some') {
        items.push({
          status: 'needed',
          text: 'Finish collecting records from all your specialists.',
        })
      } else {
        items.push({
          status: 'needed',
          text: 'Request records from each specialist using a HIPAA authorization form.',
        })
      }
    }

    if (answers.has_imaging === 'yes') {
      items.push({ status: 'done', text: 'Imaging results collected.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Request copies of all imaging (X-rays, MRIs, CT scans) from the imaging facility.',
      })
    }

    if (answers.taking_prescriptions === 'yes') {
      if (answers.prescription_receipts === 'yes') {
        items.push({
          status: 'done',
          text: 'Prescription receipts collected.',
        })
      } else {
        items.push({
          status: 'needed',
          text: 'Get a printout of all prescriptions from your pharmacy.',
        })
      }
    }

    if (answers.doing_pt === 'yes') {
      items.push({
        status: 'info',
        text: 'Keep collecting PT/rehab records as treatment continues.',
      })
    }

    if (answers.mental_health_impact === 'yes') {
      items.push({
        status: 'info',
        text: 'Document mental health treatment. Records from a therapist or counselor strengthen this part of your claim.',
      })
    }

    if (answers.hipaa_requests_sent === 'all_sent') {
      items.push({
        status: 'done',
        text: 'HIPAA requests sent to all providers.',
      })
    } else if (answers.hipaa_requests_sent === 'some_sent') {
      items.push({
        status: 'needed',
        text: 'Send HIPAA authorization requests to your remaining providers.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Send HIPAA authorization requests to all your medical providers.',
      })
    }

    if (answers.timeline_created === 'yes') {
      items.push({
        status: 'done',
        text: 'Medical timeline created.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Create a chronological timeline of all medical visits (date, provider, treatment, cost).',
      })
    }

    // Howell / EOB status
    if (
      answers.has_health_insurance === 'yes' ||
      answers.has_health_insurance === 'partial'
    ) {
      if (answers.collected_eobs === 'yes') {
        items.push({
          status: 'done',
          text: 'EOBs collected — Howell documentation in order.',
        })
      } else {
        items.push({
          status: 'needed',
          text: 'Collect Explanation of Benefits (EOBs) from your insurer for Howell damages calculation.',
        })
      }
    }

    // Lien tracking
    if (answers.treatment_on_lien === 'yes') {
      items.push({
        status: answers.lien_provider_name ? 'done' : 'needed',
        text: `Treatment on lien: ${answers.lien_provider_name || 'Provider name needed'} — ${answers.lien_amount || 'Amount unknown'}`,
      })
      items.push({
        status: 'info',
        text: 'Lien amounts are negotiable — do not assume billed amount is final.',
      })
    }

    // Medi-Cal / Medicare status
    if (answers.medi_cal_paid === 'yes' || answers.medicare_paid === 'yes') {
      const sources: string[] = []
      if (answers.medi_cal_paid === 'yes') sources.push('Medi-Cal')
      if (answers.medicare_paid === 'yes') sources.push('Medicare')

      items.push({
        status: answers.govt_lien_amount ? 'done' : 'needed',
        text: `${sources.join(' & ')} lien: ${answers.govt_lien_amount || 'Amount unknown — contact agency to determine'}`,
      })
      items.push({
        status: 'info',
        text: 'Government liens must be satisfied from your settlement before distribution.',
      })
    }

    items.push({
      status: 'info',
      text: 'Wait until you reach Maximum Medical Improvement (MMI) before sending your demand letter.',
    })

    return items
  },
}
