import type { GuidedStepConfig } from '../types'

export const waitingPeriodConfig: GuidedStepConfig = {
  title: 'Mandatory Waiting Period',
  reassurance:
    'The waiting period is required by law. Use this time to prepare.',

  questions: [
    {
      id: 'know_end_date',
      type: 'yes_no',
      prompt: 'Do you know when your 60-day waiting period ends?',
    },
    {
      id: 'waiting_period_info',
      type: 'info',
      prompt:
        'Texas Family Code requires a 60-day waiting period from the date the petition was filed before the court can finalize a divorce.',
    },
    {
      id: 'using_time_wisely',
      type: 'yes_no',
      prompt: 'Are you using this time to prepare for your case?',
    },
    {
      id: 'preparation_suggestions',
      type: 'info',
      prompt:
        'During the waiting period: gather financial documents, inventory community property, research custody arrangements, and consider temporary orders if needed.',
      showIf: (answers) => answers.using_time_wisely === 'no',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.know_end_date === 'yes') {
      items.push({
        status: 'done',
        text: 'You know when your 60-day waiting period ends.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Find out when your 60-day waiting period ends. Count 60 days from the date your petition was filed.',
      })
    }

    if (answers.using_time_wisely === 'yes') {
      items.push({
        status: 'done',
        text: 'You are using the waiting period to prepare.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Use this time wisely: gather financial documents, inventory community property, research custody arrangements, and consider temporary orders.',
      })
    }

    items.push({
      status: 'info',
      text: 'The 60-day waiting period is required by Texas Family Code before the court can finalize a divorce.',
    })

    return items
  },
}

export function createWaitingPeriodConfig(): GuidedStepConfig {
  return waitingPeriodConfig
}
