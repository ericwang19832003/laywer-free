import type { GuidedStepConfig } from '../types'

export const piMedicalRecordsPaConfig: GuidedStepConfig = {
  title: 'Organize Your Medical Records',
  reassurance:
    'Complete medical documentation strengthens your case and helps calculate your full damages.',

  questions: [
    // ── Base medical records ──────────────────────────────────────
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

    // ── First-Party (No-Fault) Benefits (PA-specific) ─────────────
    {
      id: 'first_party_header',
      type: 'info',
      prompt:
        '🚗 PA First-Party (No-Fault) Benefits\n\nPennsylvania is a choice no-fault state. Your OWN auto insurance pays medical benefits regardless of who caused the accident. The minimum coverage is $5,000, but many policies carry higher limits. These benefits are available immediately — you do not need to prove fault.',
    },
    {
      id: 'first_party_filed',
      type: 'yes_no',
      prompt:
        'Have you filed a first-party benefits claim with your own auto insurer?',
      helpText:
        'First-party benefits cover medical expenses regardless of fault. File with your own auto insurance company.',
    },
    {
      id: 'first_party_guidance',
      type: 'info',
      prompt:
        '⚠️ File Immediately\n\nFile a first-party benefits claim with your own auto insurer right away. First-party benefits cover medical expenses regardless of fault. Under 75 Pa.C.S. \u00a71720, there is no subrogation — your insurer cannot take this money back from your settlement. This is money you are entitled to keep.',
      showIf: (answers) => answers.first_party_filed === 'no',
    },
    {
      id: 'first_party_amount',
      type: 'text',
      prompt: 'What is your first-party benefits limit?',
      placeholder: 'e.g., $5,000 or $100,000',
      showIf: (answers) => answers.first_party_filed === 'yes',
    },
    {
      id: 'coordination_info',
      type: 'info',
      prompt:
        '📋 Coordination of Benefits\n\nYour first-party benefits coordinate with your health insurance under 75 Pa.C.S. \u00a7\u00a71716\u20131720. Check your auto policy for coordination of benefits provisions — the order in which your auto insurance and health insurance pay can affect your out-of-pocket costs and your claim value.',
    },

    // ── Medical Lien Tracking ─────────────────────────────────────
    {
      id: 'lien_header',
      type: 'info',
      prompt:
        '🏥 PA Medical Lien Tracking\n\nIn Pennsylvania, hospitals and medical providers may assert liens against your personal injury settlement to recover unpaid treatment costs. Understanding and tracking these liens is critical — they must be resolved before you receive your share of any settlement.',
    },
    {
      id: 'hospital_lien',
      type: 'yes_no',
      prompt: 'Has any hospital filed a lien against your case?',
      helpText:
        'Contact the hospital billing department or check with the county prothonotary to determine if a lien has been filed.',
    },
    {
      id: 'lien_hospital_name',
      type: 'text',
      prompt: 'What is the name of the hospital that filed the lien?',
      placeholder: 'Hospital name',
      showIf: (answers) => answers.hospital_lien === 'yes',
    },
    {
      id: 'lien_amount',
      type: 'text',
      prompt: 'What is the lien amount (if known)?',
      placeholder: 'e.g., $15,000',
      showIf: (answers) => answers.hospital_lien === 'yes',
    },
    {
      id: 'lien_county',
      type: 'text',
      prompt: 'In what county was the lien filed?',
      placeholder: 'County name',
      showIf: (answers) => answers.hospital_lien === 'yes',
    },
    {
      id: 'medicare_medicaid',
      type: 'yes_no',
      prompt: 'Did Medicare or Medicaid pay for any of your injury-related treatment?',
      helpText:
        'Government health programs have a statutory right to be reimbursed from your settlement.',
    },
    {
      id: 'medicare_medicaid_guidance',
      type: 'info',
      prompt:
        '🏛️ Federal Reimbursement Liens\n\nIf Medicare or Medicaid paid for your injury-related treatment, they have a federal statutory right to reimbursement from your settlement.\n\n• Medicare: Contact the Benefits Coordination & Recovery Center (BCRC) at 1-855-798-2627 to determine conditional payment amounts. The Medicare Secondary Payer Act (42 U.S.C. \u00a7 1395y) requires repayment.\n• Medicaid: Contact PA Department of Human Services, Third Party Liability Division. Pennsylvania law requires Medicaid reimbursement from personal injury recoveries.\n\nThese liens must be satisfied before you receive your share of any settlement.',
      showIf: (answers) => answers.medicare_medicaid === 'yes',
    },
    {
      id: 'erisa_plan',
      type: 'yes_no',
      prompt:
        'Did an employer-sponsored health plan (ERISA) pay for any of your treatment?',
      helpText:
        'Most employer health plans are governed by federal ERISA law and may have reimbursement rights.',
    },
    {
      id: 'erisa_warning',
      type: 'info',
      prompt:
        '⚠️ ERISA Reimbursement Rights\n\nERISA plans have strong federal reimbursement rights that may not be reduced. Unlike state-law liens, ERISA preempts Pennsylvania law, meaning the plan can enforce its full reimbursement claim regardless of state equitable doctrines.\n\nReview your Summary Plan Description (SPD) for the reimbursement/subrogation clause. The U.S. Supreme Court (US Airways v. McCutchen, 2013) held that plan language controls — if the plan says they get full reimbursement, they likely will.\n\nDo NOT ignore ERISA plan notices. Failure to repay can result in the plan offsetting future benefits.',
      showIf: (answers) => answers.erisa_plan === 'yes',
    },

    // ── Medical auth warning ──────────────────────────────────────
    {
      id: 'medical_auth_warning',
      type: 'info',
      prompt:
        "🚫 DON'T Sign Blanket Medical Authorizations\n\nThe insurance company may ask you to sign a broad medical authorization giving them access to your entire medical history. DON'T do this.\n\n✅ DO: Only authorize release of records directly related to this injury.\n❌ DON'T: Sign anything that gives them access to unrelated medical history.\n\nThey want to find pre-existing conditions to reduce your claim.",
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // First-party benefits status
    if (answers.first_party_filed === 'yes') {
      items.push({
        status: 'done',
        text: `First-party benefits claim filed.${answers.first_party_amount ? ` Limit: ${answers.first_party_amount}.` : ''}`,
      })
    } else if (answers.first_party_filed === 'no') {
      items.push({
        status: 'needed',
        text: 'File a first-party benefits claim with your own auto insurer immediately. No subrogation under 75 Pa.C.S. \u00a71720.',
      })
    }

    // Lien tracking
    if (answers.hospital_lien === 'yes') {
      items.push({
        status: answers.lien_hospital_name ? 'done' : 'needed',
        text: `Hospital lien: ${answers.lien_hospital_name || 'Hospital name needed'} — ${answers.lien_amount || 'Amount unknown'}`,
      })
      items.push({
        status: 'info',
        text: 'Hospital lien must be resolved before distributing any settlement.',
      })
    } else if (answers.hospital_lien === 'no') {
      items.push({
        status: 'done',
        text: 'No hospital lien filed.',
      })
    }

    if (answers.medicare_medicaid === 'yes') {
      items.push({
        status: 'needed',
        text: 'Determine Medicare/Medicaid lien amount — federal reimbursement required before settlement distribution.',
      })
    }

    if (answers.erisa_plan === 'yes') {
      items.push({
        status: 'needed',
        text: 'Review ERISA plan SPD for reimbursement clause — federal preemption gives plan strong recovery rights.',
      })
    }

    // Base medical records status
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

    items.push({
      status: 'info',
      text: 'Wait until you reach Maximum Medical Improvement (MMI) before sending your demand letter.',
    })

    return items
  },
}
