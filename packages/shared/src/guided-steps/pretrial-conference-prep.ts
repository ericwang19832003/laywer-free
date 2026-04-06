import type { GuidedStepConfig } from './types'

export const pretrialConferencePrepConfig: GuidedStepConfig = {
  title: 'Prepare for Pre-Trial Conference',
  reassurance:
    'The pre-trial conference finalizes everything before your trial date.',

  questions: [
    {
      id: 'scheduling_order_reviewed',
      type: 'yes_no',
      prompt: 'Have you reviewed the pre-trial order requirements?',
    },
    {
      id: 'order_info',
      type: 'info',
      prompt: 'Pre-trial orders typically require: witness lists, exhibit lists, motions in limine, proposed jury instructions, and trial brief.',
      showIf: (answers) => answers.scheduling_order_reviewed === 'no',
    },
    {
      id: 'witness_list_prepared',
      type: 'yes_no',
      prompt: 'Have you prepared your witness list?',
    },
    {
      id: 'witness_list_info',
      type: 'info',
      prompt: 'List all witnesses you plan to call, including fact witnesses and expert witnesses. Include their expected testimony.',
      showIf: (answers) => answers.witness_list_prepared === 'no',
    },
    {
      id: 'exhibit_list_prepared',
      type: 'yes_no',
      prompt: 'Have you prepared your exhibit list?',
    },
    {
      id: 'exhibit_organization',
      type: 'yes_no',
      prompt: 'Are your exhibits organized and marked?',
    },
    {
      id: 'motions_in_limine',
      type: 'yes_no',
      prompt: 'Do you need to file any motions in limine (pre-trial motions)?',
    },
    {
      id: 'motions_info',
      type: 'info',
      prompt: 'Motions in limine exclude evidence that might be prejudicial. Common ones: exclude settlement talks, prior convictions, character evidence.',
      showIf: (answers) => answers.motions_in_limine === 'yes',
    },
    {
      id: 'jury_instructions',
      type: 'yes_no',
      prompt: 'Have you drafted proposed jury instructions?',
    },
    {
      id: 'trial_brief',
      type: 'yes_no',
      prompt: 'Have you prepared your trial brief?',
    },
    {
      id: 'trial_brief_info',
      type: 'info',
      prompt: 'A trial brief outlines your legal theories, key facts, and anticipated arguments. Check if required by local rules.',
      showIf: (answers) => answers.trial_brief === 'no',
    },
    {
      id: 'demonstratives_ready',
      type: 'yes_no',
      prompt: 'Are your trial demonstratives (charts, diagrams, timelines) prepared?',
    },
    {
      id: 'final_checklist',
      type: 'yes_no',
      prompt: 'Have you completed your final trial checklist?',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.scheduling_order_reviewed === 'yes') {
      items.push({ status: 'done', text: 'Pre-trial order requirements reviewed.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Review the pre-trial scheduling order from the court.',
      })
    }

    if (answers.witness_list_prepared === 'yes') {
      items.push({ status: 'done', text: 'Witness list prepared.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Prepare your witness list with expected testimony for each witness.',
      })
    }

    if (answers.exhibit_list_prepared === 'yes') {
      items.push({ status: 'done', text: 'Exhibit list prepared.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Prepare your exhibit list with numbered exhibits ready for trial.',
      })
    }

    if (answers.exhibit_organization === 'yes') {
      items.push({ status: 'done', text: 'Exhibits organized and marked.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Organize and mark your exhibits with exhibit numbers.',
      })
    }

    if (answers.motions_in_limine === 'no') {
      items.push({ status: 'done', text: 'No motions in limine needed.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Prepare and file motions in limine before the deadline.',
      })
    }

    if (answers.jury_instructions === 'yes') {
      items.push({ status: 'done', text: 'Proposed jury instructions prepared.' })
    } else {
      items.push({
        status: 'info',
        text: 'Consider drafting proposed jury instructions if required.',
      })
    }

    if (answers.trial_brief === 'yes') {
      items.push({ status: 'done', text: 'Trial brief prepared.' })
    } else {
      items.push({
        status: 'info',
        text: 'Prepare a trial brief outlining your legal theories and key facts.',
      })
    }

    if (answers.demonstratives_ready === 'yes') {
      items.push({ status: 'done', text: 'Trial demonstratives prepared.' })
    } else {
      items.push({
        status: 'info',
        text: 'Prepare charts, diagrams, and timelines to help explain your case.',
      })
    }

    if (answers.final_checklist === 'yes') {
      items.push({ status: 'done', text: 'Final trial checklist completed.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Complete a final checklist before the pre-trial conference.',
      })
    }

    return items
  },
}
