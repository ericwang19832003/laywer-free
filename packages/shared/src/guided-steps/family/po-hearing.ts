import type { GuidedStepConfig } from '../types'

export const poHearingConfig: GuidedStepConfig = {
  title: 'Protective Order Hearing',
  reassurance: 'The full hearing typically occurs within 14 days of filing. The court will decide whether to grant a protective order lasting up to 2 years.',
  questions: [
    {
      id: 'hearing_date_known',
      type: 'yes_no',
      prompt: 'Do you know the date of your hearing?',
    },
    {
      id: 'hearing_info',
      type: 'info',
      prompt: 'The hearing must be set within 14 days of your application. Check with the court clerk for your hearing date.',
      showIf: (a) => a.hearing_date_known === 'no',
    },
    {
      id: 'evidence_prepared',
      type: 'yes_no',
      prompt: 'Have you gathered evidence of the abuse to present at the hearing?',
      helpText: 'Photos of injuries, threatening messages, medical records, police reports, and witness statements are all powerful evidence.',
    },
    {
      id: 'evidence_info',
      type: 'info',
      prompt: 'Gather: photos of injuries, screenshots of threatening messages, medical records, police reports, and names of witnesses.',
      showIf: (a) => a.evidence_prepared === 'no',
    },
    {
      id: 'witnesses_available',
      type: 'yes_no',
      prompt: 'Will any witnesses be available to testify?',
    },
    {
      id: 'safety_plan',
      type: 'yes_no',
      prompt: 'Do you have a safety plan in place?',
      helpText: 'A safety plan includes a safe place to go, emergency contacts, and copies of important documents.',
    },
    {
      id: 'safety_plan_info',
      type: 'info',
      prompt: 'Create a safety plan: identify a safe place, save emergency contacts, keep copies of IDs and documents. DV Hotline: 1-800-799-7233.',
      showIf: (a) => a.safety_plan === 'no',
    },
    {
      id: 'hearing_procedure',
      type: 'info',
      prompt: 'At the hearing: both parties can present evidence and testimony. The respondent has a right to be present. Focus on specific incidents with dates and details.',
    },
  ],
  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.hearing_date_known === 'yes') {
      items.push({ status: 'done', text: 'Hearing date is known.' })
    } else {
      items.push({ status: 'needed', text: 'Check with the court clerk for your hearing date.' })
    }

    if (answers.evidence_prepared === 'yes') {
      items.push({ status: 'done', text: 'Evidence of abuse gathered.' })
    } else {
      items.push({ status: 'needed', text: 'Gather evidence: photos, messages, medical records, police reports.' })
    }

    if (answers.witnesses_available === 'yes') {
      items.push({ status: 'done', text: 'Witnesses available to testify.' })
    } else {
      items.push({ status: 'info', text: 'No witnesses available. Your testimony alone can be sufficient.' })
    }

    if (answers.safety_plan === 'yes') {
      items.push({ status: 'done', text: 'Safety plan in place.' })
    } else {
      items.push({ status: 'needed', text: 'Create a safety plan. DV Hotline: 1-800-799-7233.' })
    }

    items.push({ status: 'info', text: 'The hearing occurs within 14 days. If granted, the protective order lasts up to 2 years.' })
    return items
  },
}
