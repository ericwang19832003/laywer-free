import type { GuidedStepConfig } from '../types'

export const debtFileWithCourtConfig: GuidedStepConfig = {
  title: 'File Your Answer With the Court',
  reassurance:
    'Filing your answer protects you from a default judgment.',

  questions: [
    {
      id: 'know_deadline',
      type: 'yes_no',
      prompt: 'Do you know your answer filing deadline?',
    },
    {
      id: 'deadline_critical',
      type: 'info',
      prompt:
        'Critical: If you miss your deadline, the court can enter a default judgment against you. In Texas, the deadline is typically the Monday following 20 days after you were served.',
    },
    {
      id: 'know_where_to_file',
      type: 'yes_no',
      prompt: 'Do you know where to file your answer?',
    },
    {
      id: 'where_info',
      type: 'info',
      prompt:
        'File at the same court listed on the citation you received. Check the court name and address on your paperwork.',
      showIf: (answers) => answers.know_where_to_file === 'no',
    },
    {
      id: 'using_efile',
      type: 'yes_no',
      prompt: 'Are you using e-filing?',
    },
    {
      id: 'efile_info',
      type: 'info',
      prompt:
        'Texas courts accept e-filing through eFileTexas.gov. It\'s faster than filing in person.',
      showIf: (answers) => answers.using_efile === 'no',
    },
    {
      id: 'know_filing_fee',
      type: 'yes_no',
      prompt: 'Do you know the filing fee?',
    },
    {
      id: 'fee_info',
      type: 'info',
      prompt:
        'Filing fees for an answer are usually $25-$50 in JP court. Fee waivers are available if you qualify.',
      showIf: (answers) => answers.know_filing_fee === 'no',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.know_deadline === 'yes') {
      items.push({ status: 'done', text: 'Filing deadline identified.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Determine your filing deadline immediately — missing it can result in a default judgment.',
      })
    }

    if (answers.know_where_to_file === 'yes') {
      items.push({ status: 'done', text: 'Filing location identified.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Find the court where you need to file by checking your citation paperwork.',
      })
    }

    if (answers.using_efile === 'yes') {
      items.push({
        status: 'done',
        text: 'Using e-filing through eFileTexas.gov.',
      })
    } else {
      items.push({
        status: 'info',
        text: 'Consider e-filing through eFileTexas.gov for faster processing.',
      })
    }

    if (answers.know_filing_fee === 'yes') {
      items.push({ status: 'done', text: 'Filing fee amount known.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Check your filing fee ($25-$50 in JP court). Ask about fee waivers if you qualify.',
      })
    }

    return items
  },
}
