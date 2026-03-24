import type { GuidedStepConfig } from './types'

export const understandRemovalConfig: GuidedStepConfig = {
  title: 'Understand the Removal',
  reassurance:
    'Understanding removal helps you decide your best strategy.',

  questions: [
    {
      id: 'case_removed',
      type: 'yes_no',
      prompt: 'Has your case been removed to federal court?',
    },
    {
      id: 'understand_why',
      type: 'single_choice',
      prompt: 'Do you understand why it was removed?',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'somewhat', label: 'Somewhat' },
        { value: 'no', label: 'No' },
      ],
      showIf: (answers) => answers.case_removed === 'yes',
    },
    {
      id: 'removal_info',
      type: 'info',
      prompt:
        'Cases are usually removed because: the amount exceeds $75,000 AND parties are from different states (diversity jurisdiction), or the case involves a federal question.',
      showIf: (answers) =>
        answers.case_removed === 'yes' && answers.understand_why !== 'yes',
    },
    {
      id: 'know_options',
      type: 'yes_no',
      prompt:
        'Do you know your options for responding to the removal?',
    },
    {
      id: 'options_info',
      type: 'info',
      prompt:
        'You can: file a motion to remand (send it back to state court), continue in federal court, or file an amended complaint to defeat diversity jurisdiction.',
      showIf: (answers) => answers.know_options === 'no',
    },
    {
      id: 'chosen_strategy',
      type: 'single_choice',
      prompt: 'Which strategy are you leaning toward?',
      options: [
        { value: 'remand_motion', label: 'File a motion to remand' },
        { value: 'continue_federal', label: 'Continue in federal court' },
        { value: 'amend_complaint', label: 'File an amended complaint' },
        { value: 'undecided', label: 'Undecided' },
      ],
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.case_removed === 'yes') {
      items.push({
        status: 'done',
        text: 'Case removal confirmed.',
      })
    } else {
      items.push({
        status: 'info',
        text: 'If your case has not been removed, this step may not apply yet.',
      })
    }

    if (answers.understand_why === 'yes') {
      items.push({
        status: 'done',
        text: 'Removal basis understood.',
      })
    } else if (answers.understand_why === 'somewhat' || answers.understand_why === 'no') {
      items.push({
        status: 'needed',
        text: 'Review the Notice of Removal to understand the jurisdictional basis.',
      })
    }

    if (answers.know_options === 'yes') {
      items.push({
        status: 'done',
        text: 'Response options reviewed.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Review your options: motion to remand, continue in federal court, or amend complaint.',
      })
    }

    // Strategy-specific next steps
    switch (answers.chosen_strategy) {
      case 'remand_motion':
        items.push({
          status: 'needed',
          text: 'Prepare your motion to remand. Must be filed within 30 days of removal.',
        })
        items.push({
          status: 'info',
          text: 'Argue that the federal court lacks jurisdiction (e.g., amount under $75,000 or no diversity).',
        })
        break
      case 'continue_federal':
        items.push({
          status: 'needed',
          text: 'Familiarize yourself with federal court procedures and FRCP rules.',
        })
        items.push({
          status: 'info',
          text: 'You will need to file through PACER/CM-ECF and follow federal discovery rules.',
        })
        break
      case 'amend_complaint':
        items.push({
          status: 'needed',
          text: 'Draft an amended complaint that defeats diversity jurisdiction.',
        })
        items.push({
          status: 'info',
          text: 'Adding an in-state defendant or reducing the amount below $75,000 can defeat diversity.',
        })
        break
      case 'undecided':
        items.push({
          status: 'needed',
          text: 'Decide on a strategy soon. The 30-day deadline for a motion to remand runs from the date of removal.',
        })
        break
    }

    return items
  },
}
