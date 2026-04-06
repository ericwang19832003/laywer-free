import type { GuidedStepConfig } from '../types'

export const ltRepairRequestConfig: GuidedStepConfig = {
  title: 'Request Repairs from Your Landlord',
  reassurance:
    'Texas law requires landlords to maintain habitable conditions. You have the right to request repairs.',

  questions: [
    {
      id: 'repair_type',
      type: 'single_choice',
      prompt: 'What type of repair is needed?',
      options: [
        { value: 'plumbing', label: 'Plumbing' },
        { value: 'electrical', label: 'Electrical' },
        { value: 'structural', label: 'Structural' },
        { value: 'hvac', label: 'HVAC (heating/cooling)' },
        { value: 'pest', label: 'Pest control' },
        { value: 'mold', label: 'Mold' },
        { value: 'appliance', label: 'Appliance' },
        { value: 'other', label: 'Other' },
      ],
    },
    {
      id: 'issue_duration',
      type: 'single_choice',
      prompt: 'How long has the issue existed?',
      options: [
        { value: 'less_than_week', label: 'Less than a week' },
        { value: 'one_to_four_weeks', label: '1–4 weeks' },
        { value: 'one_to_three_months', label: '1–3 months' },
        { value: 'over_three_months', label: 'Over 3 months' },
      ],
    },
    {
      id: 'prior_notice',
      type: 'yes_no',
      prompt: 'Have you notified your landlord about this issue before?',
    },
    {
      id: 'notice_method',
      type: 'single_choice',
      prompt: 'How did you notify them?',
      options: [
        { value: 'verbal', label: 'Verbal (in person or phone)' },
        { value: 'text_email', label: 'Text message or email' },
        { value: 'written_letter', label: 'Written letter' },
      ],
      showIf: (answers) => answers.prior_notice === 'yes',
    },
    {
      id: 'legal_info',
      type: 'info',
      prompt:
        'Under Texas Property Code § 92.052, your landlord must make a diligent effort to repair conditions that materially affect health or safety. You must give written notice, and the landlord has a reasonable time to repair.',
      helpText:
        'Written notice is a legal requirement before you can pursue remedies like repair-and-deduct or lease termination.',
    },
    {
      id: 'has_documentation',
      type: 'yes_no',
      prompt: 'Have you documented the issue with photos or video?',
      helpText:
        'Visual evidence strengthens your case significantly.',
    },
    {
      id: 'documentation_reminder',
      type: 'info',
      prompt:
        'Documenting the issue with photos or video is critical. Take dated photos showing the problem, any damage, and the overall condition. This evidence supports your repair request and protects you if the issue escalates.',
      helpText:
        'Even phone photos with timestamps can serve as strong evidence.',
      showIf: (answers) => answers.has_documentation === 'no',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.repair_type) {
      const labels: Record<string, string> = {
        plumbing: 'Plumbing',
        electrical: 'Electrical',
        structural: 'Structural',
        hvac: 'HVAC',
        pest: 'Pest control',
        mold: 'Mold',
        appliance: 'Appliance',
        other: 'Other',
      }
      items.push({
        status: 'info',
        text: `Repair type: ${labels[answers.repair_type] ?? answers.repair_type}.`,
      })
    }

    if (answers.issue_duration) {
      const durations: Record<string, string> = {
        less_than_week: 'less than a week',
        one_to_four_weeks: '1–4 weeks',
        one_to_three_months: '1–3 months',
        over_three_months: 'over 3 months',
      }
      items.push({
        status: 'info',
        text: `Issue has existed for ${durations[answers.issue_duration] ?? answers.issue_duration}.`,
      })
    }

    if (answers.prior_notice === 'yes') {
      items.push({ status: 'done', text: 'Landlord has been notified previously.' })
      if (answers.notice_method === 'written_letter') {
        items.push({ status: 'done', text: 'Written notice already provided.' })
      } else {
        items.push({
          status: 'needed',
          text: 'Send written notice (letter or email) to your landlord. Verbal notice alone is not sufficient under Texas law.',
        })
      }
    } else {
      items.push({
        status: 'needed',
        text: 'Send written notice to your landlord describing the repair needed. This is required under Texas Property Code § 92.052.',
      })
    }

    if (answers.has_documentation === 'yes') {
      items.push({ status: 'done', text: 'Issue documented with photos or video.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Take dated photos or video of the issue to document the condition.',
      })
    }

    return items
  },
}
