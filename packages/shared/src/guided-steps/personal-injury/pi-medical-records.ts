import type { GuidedStepConfig } from '../types'

export const piMedicalRecordsConfig: GuidedStepConfig = {
  title: 'Organize Your Medical Records',
  reassurance:
    'Complete medical documentation strengthens your case and helps calculate your full damages.',

  questions: [
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
        'Contact the hospital\'s medical records department to request copies.',
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
        'Request records from each specialist\'s office using a HIPAA authorization form.',
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
      helpText:
        'Prescription costs are part of your medical damages.',
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
      prompt:
        'Are you doing physical therapy or rehabilitation?',
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
        'Do NOT send your demand letter until you reach Maximum Medical Improvement (MMI) or complete treatment. Sending too early means you may undervalue your claim because future medical costs won\'t be included.',
      helpText:
        'Ask your doctor when they expect you to reach MMI. This is the point where your condition has stabilized.',
    },
    {
      id: 'lien_section_header',
      type: 'info',
      prompt:
        '🏥 Hospital Lien Check\n\nTexas law (Property Code Chapter 55) allows hospitals to file a lien against your personal injury settlement. If a lien exists, it must be paid from your settlement before you receive any money.',
    },
    {
      id: 'hospital_admitted_72h',
      type: 'yes_no',
      prompt:
        'Were you admitted to a hospital (not just an ER visit and release) within 72 hours of the incident?',
      helpText:
        'Hospital admission means you were formally admitted as an inpatient, not just treated and released from the emergency room.',
    },
    {
      id: 'lien_check_guidance',
      type: 'info',
      prompt:
        '📋 How to Check for Hospital Liens\n\nContact the county clerk in the county where you received treatment and ask if a hospital lien has been filed under your name. You can also check online — many Texas counties have searchable lien records.\n\nThe hospital must have filed the lien to enforce it. If no lien was filed, you are not bound by it.',
      showIf: (answers) => answers.hospital_admitted_72h === 'yes',
    },
    {
      id: 'lien_filed',
      type: 'yes_no',
      prompt: 'Have you found a hospital lien filed against you?',
      showIf: (answers) => answers.hospital_admitted_72h === 'yes',
    },
    {
      id: 'lien_hospital_name',
      type: 'text',
      prompt: 'What is the name of the hospital that filed the lien?',
      placeholder: 'Hospital name',
      showIf: (answers) => answers.lien_filed === 'yes',
    },
    {
      id: 'lien_amount',
      type: 'text',
      prompt: 'What is the lien amount (if known)?',
      placeholder: 'e.g., $15,000',
      showIf: (answers) => answers.lien_filed === 'yes',
    },
    {
      id: 'lien_county',
      type: 'text',
      prompt: 'In what county was the lien filed?',
      placeholder: 'County name',
      showIf: (answers) => answers.lien_filed === 'yes',
    },
    {
      id: 'lien_cap_info',
      type: 'info',
      prompt:
        '💡 Lien Amount Cap\n\nGood news: Texas law caps hospital liens. The hospital can only recover the lesser of:\n\n• Total charges for the first 100 days of hospitalization, OR\n• 50% of your total settlement/judgment amount\n\nAlso, hospital liens do NOT attach to:\n• UM/UIM (uninsured/underinsured motorist) benefits\n• PIP (Personal Injury Protection) benefits\n• Med-Pay benefits',
      showIf: (answers) => answers.lien_filed === 'yes',
    },
    {
      id: 'medical_auth_warning',
      type: 'info',
      prompt:
        '🚫 DON\'T Sign Blanket Medical Authorizations\n\nThe insurance company may ask you to sign a broad medical authorization giving them access to your entire medical history. DON\'T do this.\n\n✅ DO: Only authorize release of records directly related to this injury.\n❌ DON\'T: Sign anything that gives them access to unrelated medical history.\n\nThey want to find pre-existing conditions to reduce your claim.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

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

    if (answers.hospital_admitted_72h === 'yes') {
      if (answers.lien_filed === 'yes') {
        items.push({
          status: answers.lien_hospital_name ? 'done' : 'needed',
          text: `Hospital lien: ${answers.lien_hospital_name || 'Hospital name needed'} — ${answers.lien_amount || 'Amount unknown'}`,
        })
        items.push({
          status: 'info',
          text: 'Lien must be satisfied before distributing any settlement',
        })
      } else if (answers.lien_filed === 'no') {
        items.push({
          status: 'done',
          text: 'Hospital lien check complete — no lien found',
        })
      } else {
        items.push({
          status: 'needed',
          text: 'Hospital lien check needed — contact county clerk',
        })
      }
    }

    items.push({
      status: 'info',
      text: 'Wait until you reach Maximum Medical Improvement (MMI) before sending your demand letter.',
    })

    return items
  },
}
