import type { GuidedStepConfig } from '../types'
import { isPropertyDamageSubType } from './constants'

const propertyDamageTrialPrepConfig: GuidedStepConfig = {
  title: 'Prepare for Trial',
  reassurance:
    'Being well-prepared gives you the best chance of presenting your case effectively.',

  questions: [
    {
      id: 'has_repair_docs',
      type: 'single_choice',
      prompt: 'Do you have your repair estimates and invoices organized?',
      helpText: 'Organized cost documentation makes it much easier to present your damages clearly.',
      options: [
        { value: 'all_organized', label: 'Yes, all organized' },
        { value: 'some_not_all', label: 'Some, but not all' },
        { value: 'not_started', label: "I haven't started collecting them" },
      ],
    },
    {
      id: 'has_photos',
      type: 'yes_no',
      prompt: 'Do you have before and after photos of the property damage?',
      helpText: 'Visual evidence is very persuasive in court. Before-the-incident photos establish prior condition.',
    },
    {
      id: 'has_police_report',
      type: 'yes_no',
      prompt: 'Do you have a copy of the police or incident report?',
      helpText: 'The incident report documents key facts. You can request a copy from the responding agency.',
    },
    {
      id: 'has_demand_letter_copies',
      type: 'yes_no',
      prompt: 'Do you have copies of your demand letter and insurance correspondence?',
      helpText: 'This shows the judge you attempted to resolve the case before trial.',
    },
    {
      id: 'has_loss_of_use_proof',
      type: 'single_choice',
      prompt: 'Do you have documentation for any loss of use (rental car, lost income from property, etc.)?',
      helpText: 'If the damage prevented you from using your property, you may be entitled to loss-of-use compensation.',
      options: [
        { value: 'yes', label: 'Yes, I have documentation' },
        { value: 'not_applicable', label: "I didn't incur any loss of use" },
        { value: 'no', label: "No, I don't have proof yet" },
      ],
    },
    {
      id: 'damages_summary_prepared',
      type: 'yes_no',
      prompt:
        'Have you prepared a damages summary organized by category (repairs, replacement, loss of use, diminished value)?',
      helpText: 'A clear summary sheet helps the judge follow your case and see your total damages.',
    },
    {
      id: 'direct_exam_outline',
      type: 'yes_no',
      prompt:
        'Have you written an outline of your testimony (what happened, the damage caused, your repair efforts and costs)?',
      helpText: 'Telling your story in chronological order is the most effective approach.',
    },
    {
      id: 'cross_exam_info',
      type: 'info',
      prompt:
        "During cross-examination: stay calm, answer only the question asked, and never volunteer extra information. It is okay to say \"I don't remember\" if you genuinely don't. Do not argue with the other side's attorney.",
      helpText:
        "If you don't understand a question, ask for clarification before answering.",
      acknowledgeLabel: "I'm ready for cross-examination →",
    },
    {
      id: 'three_copies',
      type: 'info',
      prompt:
        'Bring 3 copies of ALL documents: one for you, one for the judge, and one for the defendant.',
      helpText:
        'This is standard court procedure and shows you are well-prepared.',
      acknowledgeLabel: "I'll bring 3 copies of everything →",
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.has_repair_docs === 'all_organized') {
      items.push({ status: 'done', text: 'Repair estimates and invoices are organized.' })
    } else if (answers.has_repair_docs === 'some_not_all') {
      items.push({
        status: 'needed',
        text: 'Finish collecting all repair estimates and invoices.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Collect repair estimates and invoices from every provider.',
      })
    }

    if (answers.has_photos === 'yes') {
      items.push({ status: 'done', text: 'Before/after photos of damage are ready.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Gather before-the-incident and after-the-incident photos of the damage.',
      })
    }

    if (answers.has_police_report === 'yes') {
      items.push({ status: 'done', text: 'Incident report obtained.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Request a copy of the incident or police report.',
      })
    }

    if (answers.has_demand_letter_copies === 'yes') {
      items.push({ status: 'done', text: 'Demand letter and insurance correspondence ready.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Collect copies of your demand letter and all insurance correspondence.',
      })
    }

    if (answers.has_loss_of_use_proof === 'yes') {
      items.push({ status: 'done', text: 'Loss-of-use documentation ready.' })
    } else if (answers.has_loss_of_use_proof === 'no') {
      items.push({
        status: 'needed',
        text: 'Get proof of loss of use: rental receipts, business records, or other documentation.',
      })
    }

    if (answers.damages_summary_prepared === 'yes') {
      items.push({ status: 'done', text: 'Damages summary organized by category.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Prepare a damages summary organized by category (repairs, replacement, loss of use, diminished value).',
      })
    }

    if (answers.direct_exam_outline === 'yes') {
      items.push({ status: 'done', text: 'Testimony outline written.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Write an outline of your testimony covering what happened, the damage, and your repair efforts and costs.',
      })
    }

    items.push({
      status: 'info',
      text: 'Remember: bring 3 copies of ALL documents (you, judge, defendant).',
    })

    items.push({
      status: 'info',
      text: "During cross-examination, stay calm, answer only the question asked, and don't volunteer extra information.",
    })

    return items
  },
}

export const piTrialPrepConfig: GuidedStepConfig = {
  title: 'Prepare for Trial',
  reassurance:
    'Being well-prepared gives you the best chance of presenting your case effectively.',

  questions: [
    {
      id: 'has_injuries',
      type: 'yes_no',
      prompt: 'Do you have any physical injuries from this incident?',
      helpText:
        'This helps us determine which evidence-gathering steps apply to you.',
    },
    {
      id: 'medical_records_status',
      type: 'single_choice',
      prompt: 'Do you have your medical records organized?',
      helpText:
        'Organized medical records make it much easier to present your damages clearly.',
      options: [
        { value: 'all_organized', label: 'Yes, all organized chronologically' },
        { value: 'some_not_all', label: 'Some, but not all' },
        { value: 'not_started', label: "I haven't started collecting them" },
      ],
      showIf: (answers) => answers.has_injuries === 'yes',
    },
    {
      id: 'medical_bills_totaled',
      type: 'yes_no',
      prompt: 'Do you have a total for all your medical bills?',
      helpText:
        'The judge will want to see a clear number for your medical expenses.',
      showIf: (answers) => answers.has_injuries === 'yes',
    },
    {
      id: 'has_photos',
      type: 'yes_no',
      prompt:
        'Do you have photos of injuries, vehicle damage, or the accident scene?',
      helpText:
        'Visual evidence is very persuasive in court. Photos from the time of the incident are ideal.',
    },
    {
      id: 'has_police_report',
      type: 'yes_no',
      prompt: 'Do you have a copy of the police report?',
      helpText:
        'The police report documents key facts. You can request a copy from the police department that responded.',
    },
    {
      id: 'has_demand_letter_copies',
      type: 'yes_no',
      prompt:
        'Do you have copies of your demand letter and insurance correspondence?',
      helpText:
        'This shows the judge you attempted to resolve the case before trial.',
    },
    {
      id: 'has_lost_wages_proof',
      type: 'single_choice',
      prompt: 'Do you have proof of lost wages (pay stubs, employer letter)?',
      helpText:
        'If you missed work due to your injuries, you may be entitled to lost wage compensation.',
      options: [
        { value: 'yes', label: 'Yes, I have documentation' },
        { value: 'not_applicable', label: "I didn't miss any work" },
        { value: 'no', label: "No, I don't have proof yet" },
      ],
    },
    {
      id: 'damages_summary_prepared',
      type: 'yes_no',
      prompt:
        'Have you prepared a damages summary organized by category (medical, lost wages, property, pain and suffering)?',
      helpText:
        'A clear summary sheet helps the judge follow your case and see your total damages.',
    },
    {
      id: 'direct_exam_outline',
      type: 'yes_no',
      prompt:
        'Have you written an outline of your testimony (what happened, your injuries, your treatment)?',
      helpText:
        'Telling your story in chronological order is the most effective approach.',
    },
    {
      id: 'cross_exam_info',
      type: 'info',
      prompt:
        'During cross-examination: stay calm, answer only the question asked, and never volunteer extra information. It is okay to say "I don\'t remember" if you genuinely don\'t. Do not argue with the other side\'s attorney.',
      helpText:
        'If you don\'t understand a question, ask for clarification before answering.',
      acknowledgeLabel: 'I\'m ready for cross-examination →',
    },
    {
      id: 'three_copies',
      type: 'info',
      prompt:
        'Bring 3 copies of ALL documents: one for you, one for the judge, and one for the defendant.',
      helpText:
        'This is standard court procedure and shows you are well-prepared.',
      acknowledgeLabel: 'I\'ll bring 3 copies of everything →',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    const hasInjuries = answers.has_injuries === 'yes'

    if (hasInjuries) {
      if (answers.medical_records_status === 'all_organized') {
        items.push({ status: 'done', text: 'Medical records are organized.' })
      } else if (answers.medical_records_status === 'some_not_all') {
        items.push({
          status: 'needed',
          text: 'Finish collecting and organizing all medical records chronologically.',
        })
      } else {
        items.push({
          status: 'needed',
          text: 'Start collecting your medical records from every provider you visited.',
        })
      }

      if (answers.medical_bills_totaled === 'yes') {
        items.push({ status: 'done', text: 'Medical bills are totaled.' })
      } else {
        items.push({
          status: 'needed',
          text: 'Total all your medical bills so you can present a clear damages number.',
        })
      }
    }

    if (answers.has_photos === 'yes') {
      items.push({
        status: 'done',
        text: 'Photos of injuries/damage are ready.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Gather any photos of injuries, vehicle damage, or the accident scene.',
      })
    }

    if (answers.has_police_report === 'yes') {
      items.push({ status: 'done', text: 'Police report obtained.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Request a copy of the police report from the responding department.',
      })
    }

    if (answers.has_demand_letter_copies === 'yes') {
      items.push({
        status: 'done',
        text: 'Demand letter and insurance correspondence ready.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Collect copies of your demand letter and all insurance correspondence.',
      })
    }

    if (answers.has_lost_wages_proof === 'yes') {
      items.push({ status: 'done', text: 'Lost wages documentation ready.' })
    } else if (answers.has_lost_wages_proof === 'no') {
      items.push({
        status: 'needed',
        text: 'Get proof of lost wages: pay stubs, employer letter, or tax records.',
      })
    }

    if (answers.damages_summary_prepared === 'yes') {
      items.push({
        status: 'done',
        text: 'Damages summary organized by category.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Prepare a damages summary organized by category (medical, lost wages, property, pain and suffering).',
      })
    }

    if (answers.direct_exam_outline === 'yes') {
      items.push({ status: 'done', text: 'Testimony outline written.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Write an outline of your testimony covering what happened, your injuries, and your treatment.',
      })
    }

    items.push({
      status: 'info',
      text: 'Remember: bring 3 copies of ALL documents (you, judge, defendant).',
    })

    items.push({
      status: 'info',
      text: 'During cross-examination, stay calm, answer only the question asked, and don\'t volunteer extra information.',
    })

    return items
  },
}

export function createPiTrialPrepConfig(piSubType?: string): GuidedStepConfig {
  return isPropertyDamageSubType(piSubType)
    ? propertyDamageTrialPrepConfig
    : piTrialPrepConfig
}
