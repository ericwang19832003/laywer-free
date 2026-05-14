import type { GuidedStepConfig } from '../types'

export const piMedicalRecordsNyConfig: GuidedStepConfig = {
  title: 'Organize Your Medical Records',
  reassurance:
    'Complete medical documentation strengthens your case and helps calculate your full damages.',

  questions: [
    // ── Base medical records ──────────────────────────────────────
    {
      id: 'visited_er',
      type: 'yes_no',
      prompt: 'Did you visit the emergency room after the incident?',
      helpText: 'ER records document the initial severity of your injuries and are key evidence.',
    },
    {
      id: 'er_records_obtained',
      type: 'yes_no',
      prompt: 'Have you obtained your emergency room records and discharge summary?',
      helpText: "Contact the hospital's medical records department to request copies.",
      showIf: (answers) => answers.visited_er === 'yes',
    },
    {
      id: 'seeing_specialists',
      type: 'yes_no',
      prompt: 'Are you seeing any specialists (orthopedic, neurologist, etc.)?',
    },
    {
      id: 'specialist_records_obtained',
      type: 'single_choice',
      prompt: 'Have you obtained records from all your specialists?',
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
      prompt: 'Do you have copies of imaging results (X-rays, MRIs, CT scans)?',
      helpText: 'Imaging provides objective evidence of your injuries — critical for the serious injury threshold in MVA cases.',
    },
    {
      id: 'taking_prescriptions',
      type: 'yes_no',
      prompt: 'Are you taking any prescriptions related to your injuries?',
    },
    {
      id: 'prescription_receipts',
      type: 'yes_no',
      prompt: 'Do you have receipts or records for all your prescriptions?',
      showIf: (answers) => answers.taking_prescriptions === 'yes',
    },
    {
      id: 'doing_pt',
      type: 'yes_no',
      prompt: 'Are you doing physical therapy or rehabilitation?',
    },
    {
      id: 'mental_health_impact',
      type: 'yes_no',
      prompt: 'Has the incident affected your mental health (anxiety, PTSD, depression)?',
    },
    {
      id: 'hipaa_requests_sent',
      type: 'single_choice',
      prompt: 'Have you sent HIPAA authorization requests to all your medical providers?',
      options: [
        { value: 'all_sent', label: 'Yes, sent to all providers' },
        { value: 'some_sent', label: 'Sent to some, but not all' },
        { value: 'not_sent', label: "I haven't sent any yet" },
      ],
    },
    {
      id: 'timeline_created',
      type: 'yes_no',
      prompt: 'Have you created a chronological timeline of all your medical visits?',
      helpText: 'For each visit, note the date, provider, treatment, and cost.',
    },
    {
      id: 'mmi_info',
      type: 'info',
      prompt:
        "Do NOT send your demand letter until you reach Maximum Medical Improvement (MMI) or complete treatment. Sending too early means you may undervalue your claim.",
    },

    // ── NY No-Fault Benefits ($50K PIP) ─────────────────────────
    {
      id: 'no_fault_header',
      type: 'info',
      prompt:
        'NY No-Fault Benefits (Insurance Law Article 51)\n\nIf this is a motor vehicle accident, your OWN auto insurance pays up to $50,000 in "basic economic loss" — medical bills + 80% of lost earnings (up to $2,000/month) — regardless of fault.\n\nYou must file a no-fault application within 30 days of the accident (11 NYCRR §65-1.1). Benefits are payable within 30 days of proof of claim.',
    },
    {
      id: 'no_fault_filed',
      type: 'yes_no',
      prompt: 'Have you filed a no-fault benefits application with your own auto insurer?',
      helpText: 'You must file within 30 days of the accident to preserve benefits.',
    },
    {
      id: 'no_fault_guidance',
      type: 'info',
      prompt:
        'File Immediately\n\nFile a no-fault application with your own auto insurer right away. The 30-day deadline is strict. No-fault covers up to $50,000 in basic economic loss:\n• Reasonable medical expenses\n• 80% of lost earnings (up to $2,000/month for 3 years)\n• Up to $25/day for other necessary expenses\n\nYour insurer cannot subrogate against you for no-fault benefits in most cases.',
      showIf: (answers) => answers.no_fault_filed === 'no',
    },

    // ── Serious Injury Medical Evidence ──────────────────────────
    {
      id: 'serious_injury_evidence_header',
      type: 'info',
      prompt:
        'Serious Injury Evidence (Motor Vehicle Cases)\n\nIf this is a motor vehicle accident, you need objective medical evidence to prove "serious injury" under Insurance Law §5102(d). The defense will move for summary judgment on this issue.\n\nCritical evidence includes:\n• MRI showing structural damage (disc herniations, tears)\n• Range-of-motion testing with a goniometer showing quantified loss\n• EMG/NCV studies showing nerve damage\n• Sworn medical reports from treating physicians\n\nSubjective complaints alone are insufficient (Toure v. Avis, 98 N.Y.2d 345).',
    },
    {
      id: 'rom_testing',
      type: 'yes_no',
      prompt: 'Has your doctor performed range-of-motion (ROM) testing with a goniometer?',
      helpText: 'Quantified ROM loss is the most common way to prove "significant limitation of use."',
    },
    {
      id: 'rom_guidance',
      type: 'info',
      prompt:
        'Get ROM Testing Done\n\nAsk your doctor to perform range-of-motion testing with a goniometer and document the results in your medical records. Without quantified ROM loss, the defense will argue your injuries are only subjective and do not meet the serious injury threshold.\n\nThe doctor should compare your ROM to normal values and note the percentage of loss.',
      showIf: (answers) => answers.rom_testing === 'no',
    },

    // ── Collateral Source (CPLR §4545) ──────────────────────────
    {
      id: 'collateral_source_header',
      type: 'info',
      prompt:
        'Collateral Source Tracking — CPLR §4545\n\nNew York has a modified collateral source rule. At trial, defendants can introduce evidence that your medical expenses were paid by insurance, Medicare, or other sources to reduce your award.\n\nHowever, amounts YOU paid for insurance premiums are subtracted from the reduction — so having paid for insurance still benefits you.\n\nTrack all payments and who made them.',
    },
    {
      id: 'health_insurance_paid',
      type: 'yes_no',
      prompt: 'Has your health insurance paid for any injury-related treatment?',
    },
    {
      id: 'medicare_medicaid',
      type: 'yes_no',
      prompt: 'Did Medicare or Medicaid pay for any of your injury-related treatment?',
    },
    {
      id: 'medicare_medicaid_guidance',
      type: 'info',
      prompt:
        'Federal Reimbursement Liens\n\nMedicare and Medicaid have a federal statutory right to reimbursement from your settlement (42 U.S.C. §1395y).\n\n• Medicare: Contact the BCRC at 1-855-798-2627 to determine conditional payment amounts.\n• Medicaid: Contact NY Department of Health, Third Party Liability Unit.\n\nThese liens must be satisfied before you receive your share of any settlement.',
      showIf: (answers) => answers.medicare_medicaid === 'yes',
    },
    {
      id: 'erisa_plan',
      type: 'yes_no',
      prompt: 'Did an employer-sponsored health plan (ERISA) pay for any of your treatment?',
    },
    {
      id: 'erisa_warning',
      type: 'info',
      prompt:
        'ERISA Reimbursement Rights\n\nERISA plans have strong federal reimbursement rights that preempt state law. Review your Summary Plan Description (SPD) for the reimbursement/subrogation clause.\n\nThe Supreme Court (US Airways v. McCutchen, 2013) held that plan language controls. Do NOT ignore ERISA plan notices.',
      showIf: (answers) => answers.erisa_plan === 'yes',
    },

    // ── Hospital Lien Tracking ──────────────────────────────────
    {
      id: 'lien_header',
      type: 'info',
      prompt:
        'NY Hospital Lien Law (Lien Law §189)\n\nNew York hospitals may file liens on your personal injury claim to recover unpaid treatment costs. These liens must be resolved before distributing any settlement proceeds.',
    },
    {
      id: 'hospital_lien',
      type: 'yes_no',
      prompt: 'Has any hospital filed a lien against your case?',
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

    // ── Medical auth warning ──────────────────────────────────────
    {
      id: 'medical_auth_warning',
      type: 'info',
      prompt:
        "DON'T Sign Blanket Medical Authorizations\n\nThe insurance company may ask you to sign a broad medical authorization. DON'T do this.\n\nOnly authorize release of records directly related to this injury. They want to find pre-existing conditions to reduce your claim or argue you don't meet the serious injury threshold.",
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // No-fault benefits
    if (answers.no_fault_filed === 'yes') {
      items.push({ status: 'done', text: 'No-fault application filed (up to $50K in basic economic loss).' })
    } else if (answers.no_fault_filed === 'no') {
      items.push({
        status: 'needed',
        text: 'File no-fault application with your auto insurer immediately — 30-day deadline.',
      })
    }

    // ROM testing
    if (answers.rom_testing === 'yes') {
      items.push({ status: 'done', text: 'ROM testing completed — key evidence for serious injury threshold.' })
    } else if (answers.rom_testing === 'no') {
      items.push({
        status: 'needed',
        text: 'Get range-of-motion (ROM) testing with a goniometer — critical for serious injury threshold.',
      })
    }

    // Lien tracking
    if (answers.hospital_lien === 'yes') {
      items.push({
        status: answers.lien_hospital_name ? 'done' : 'needed',
        text: `Hospital lien: ${answers.lien_hospital_name || 'Hospital name needed'} — ${answers.lien_amount || 'Amount unknown'}`,
      })
    }
    if (answers.medicare_medicaid === 'yes') {
      items.push({
        status: 'needed',
        text: 'Determine Medicare/Medicaid lien amount — federal reimbursement required.',
      })
    }
    if (answers.erisa_plan === 'yes') {
      items.push({
        status: 'needed',
        text: 'Review ERISA plan SPD for reimbursement clause — federal preemption gives plan strong recovery rights.',
      })
    }

    // Base medical records
    if (answers.visited_er === 'yes') {
      items.push({
        status: answers.er_records_obtained === 'yes' ? 'done' : 'needed',
        text: answers.er_records_obtained === 'yes' ? 'ER records obtained.' : 'Request ER records and discharge summary.',
      })
    }
    if (answers.seeing_specialists === 'yes') {
      if (answers.specialist_records_obtained === 'all') {
        items.push({ status: 'done', text: 'All specialist records obtained.' })
      } else {
        items.push({ status: 'needed', text: 'Collect records from all specialists.' })
      }
    }
    if (answers.has_imaging === 'yes') {
      items.push({ status: 'done', text: 'Imaging results collected.' })
    } else if (answers.has_imaging === 'no') {
      items.push({ status: 'needed', text: 'Request imaging results (X-rays, MRIs, CT scans).' })
    }

    if (answers.hipaa_requests_sent === 'all_sent') {
      items.push({ status: 'done', text: 'HIPAA requests sent to all providers.' })
    } else {
      items.push({ status: 'needed', text: 'Send HIPAA requests to all medical providers.' })
    }

    if (answers.timeline_created === 'yes') {
      items.push({ status: 'done', text: 'Medical timeline created.' })
    } else {
      items.push({ status: 'needed', text: 'Create chronological timeline of all medical visits.' })
    }

    items.push({
      status: 'info',
      text: 'Wait until MMI before sending demand letter. Collateral source rule (CPLR §4545) — track who paid each bill.',
    })

    return items
  },
}
