import type { GuidedStepConfig } from '../types'

export const piMedicalRecordsFlConfig: GuidedStepConfig = {
  title: 'Organize Your Medical Records',
  reassurance:
    'Complete medical documentation strengthens your case and helps calculate your full damages.',

  questions: [
    // ── Base medical records ──────────────────────────────────────
    {
      id: 'visited_er',
      type: 'yes_no',
      prompt: 'Did you visit the emergency room after the incident?',
      helpText: 'ER records document initial severity and are key to the Emergency Medical Condition (EMC) determination.',
    },
    {
      id: 'er_records_obtained',
      type: 'yes_no',
      prompt: 'Have you obtained your emergency room records and discharge summary?',
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
    },
    {
      id: 'mmi_info',
      type: 'info',
      prompt: "Do NOT send your demand letter until you reach Maximum Medical Improvement (MMI). Sending too early means you may undervalue your claim.",
    },

    // ── FL PIP Benefits & 14-Day Rule ───────────────────────────
    {
      id: 'pip_header',
      type: 'info',
      prompt:
        'Florida PIP Benefits — §627.736\n\nIf this is a motor vehicle accident, your PIP covers:\n• 80% of reasonable medical expenses\n• 60% of lost wages\n\nCRITICAL: The 14-day rule requires initial treatment within 14 days of the accident. If missed, PIP benefits are lost entirely.\n\nCoverage depends on your Emergency Medical Condition (EMC) status:\n• EMC confirmed: Full $10,000 in medical benefits\n• No EMC: Capped at $2,500',
    },
    {
      id: 'pip_claim_filed',
      type: 'yes_no',
      prompt: 'Have you filed a PIP claim with your own auto insurer?',
    },
    {
      id: 'pip_guidance',
      type: 'info',
      prompt:
        'File Your PIP Claim Immediately\n\nContact your own auto insurer and file a PIP claim. PIP pays regardless of fault. Your insurer must pay or deny within 30 days of receiving proof of loss.\n\nMake sure your initial treating physician documents whether your condition is an Emergency Medical Condition (EMC) — this determines if you get $10,000 or only $2,500 in coverage.',
      showIf: (answers) => answers.pip_claim_filed === 'no',
    },
    {
      id: 'emc_documented',
      type: 'yes_no',
      prompt: 'Has your physician documented an Emergency Medical Condition (EMC) determination?',
      helpText: 'The EMC determination must be made by a licensed physician, dentist, PA, or ARNP. It determines your PIP coverage cap.',
      showIf: (answers) => answers.pip_claim_filed === 'yes',
    },

    // ── HB 837 Collateral Source Changes ────────────────────────
    {
      id: 'collateral_source_header',
      type: 'info',
      prompt:
        'HB 837 Collateral Source Changes — §768.76\n\nHB 837 significantly changed how medical bills are presented at trial:\n\n• The jury now sees the ACTUAL AMOUNT PAID by insurance — not the full billed amount\n• Defendants can introduce evidence of collateral source payments\n• This can dramatically reduce your apparent medical damages\n\nExample: Hospital bills $50,000, but Medicare paid $12,000. The jury sees $12,000, not $50,000.\n\nTrack both billed and paid amounts for all treatment.',
    },
    {
      id: 'tracking_billed_vs_paid',
      type: 'yes_no',
      prompt: 'Are you tracking both billed amounts AND amounts actually paid by insurance?',
      helpText: 'Under HB 837, both figures matter. Track them separately for each provider.',
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
        'Federal Reimbursement Liens\n\nMedicare and Medicaid have a federal statutory right to reimbursement from your settlement.\n\n• Medicare: Contact the BCRC at 1-855-798-2627\n• Medicaid: Contact FL Agency for Health Care Administration (AHCA)\n\nThese liens must be satisfied before you receive your share of any settlement.',
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
        'ERISA Reimbursement Rights\n\nERISA plans have strong federal reimbursement rights that preempt Florida law. Review your SPD for the reimbursement/subrogation clause. Do NOT ignore ERISA plan notices.',
      showIf: (answers) => answers.erisa_plan === 'yes',
    },

    // ── Hospital Lien ───────────────────────────────────────────
    {
      id: 'hospital_lien',
      type: 'yes_no',
      prompt: 'Has any hospital filed a lien against your case?',
      helpText: 'Florida hospitals may assert liens under §395.602 (Hospital Lien Law).',
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

    // ── Letters of Protection ───────────────────────────────────
    {
      id: 'lop_info',
      type: 'info',
      prompt:
        'Letters of Protection (LOP)\n\nIn Florida, many PI plaintiffs use Letters of Protection — a written agreement with a medical provider that treatment costs will be paid from the eventual settlement or judgment.\n\nHB 837 impact: Under the new collateral source rule, LOPs may be scrutinized because the "amount paid" at trial may be different from the LOP amount. Discuss with your providers how billing will be handled.',
    },
    {
      id: 'using_lop',
      type: 'yes_no',
      prompt: 'Are you using a Letter of Protection (LOP) with any medical provider?',
    },

    // ── Medical auth warning ────────────────────────────────────
    {
      id: 'medical_auth_warning',
      type: 'info',
      prompt:
        "DON'T Sign Blanket Medical Authorizations\n\nOnly authorize release of records directly related to this injury. The insurer wants access to your entire medical history to find pre-existing conditions and argue your injuries are not permanent.",
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // PIP status
    if (answers.pip_claim_filed === 'yes') {
      items.push({
        status: 'done',
        text: `PIP claim filed.${answers.emc_documented === 'yes' ? ' EMC documented — full $10K coverage.' : answers.emc_documented === 'no' ? ' EMC not documented — ask your physician.' : ''}`,
      })
    } else if (answers.pip_claim_filed === 'no') {
      items.push({
        status: 'needed',
        text: 'File PIP claim with your auto insurer immediately. Remember the 14-day treatment rule.',
      })
    }

    // Billed vs paid tracking
    if (answers.tracking_billed_vs_paid === 'yes') {
      items.push({ status: 'done', text: 'Tracking billed vs. paid amounts (HB 837 collateral source compliance).' })
    } else if (answers.tracking_billed_vs_paid === 'no') {
      items.push({
        status: 'needed',
        text: 'Start tracking both billed AND paid amounts — HB 837 means jury sees paid amounts, not billed.',
      })
    }

    // LOP
    if (answers.using_lop === 'yes') {
      items.push({
        status: 'info',
        text: 'Using Letter of Protection — be aware of HB 837 impact on collateral source presentation at trial.',
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
      items.push({ status: 'needed', text: 'Determine Medicare/Medicaid lien amount — federal reimbursement required.' })
    }
    if (answers.erisa_plan === 'yes') {
      items.push({ status: 'needed', text: 'Review ERISA plan SPD for reimbursement clause.' })
    }

    // Base records
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
      items.push({ status: 'needed', text: 'Request imaging results.' })
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

    items.push({ status: 'info', text: 'Wait until MMI before sending demand letter.' })

    return items
  },
}
