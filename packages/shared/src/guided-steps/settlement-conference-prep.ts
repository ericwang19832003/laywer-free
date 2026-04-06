import type { GuidedStepConfig } from './types'

export const settlementConferencePrepConfig: GuidedStepConfig = {
  title: 'Prepare for Settlement Conference',
  reassurance:
    'A settlement conference can resolve your case without the time and cost of trial.',

  questions: [
    {
      id: 'settlement_offer_received',
      type: 'yes_no',
      prompt: 'Have you received or will you receive a settlement offer?',
    },
    {
      id: 'offer_amount',
      type: 'yes_no',
      prompt: 'Do you know the amount of the settlement offer?',
    },
    {
      id: 'settlement_authority',
      type: 'yes_no',
      prompt: 'Do you have authority to settle within a range?',
    },
    {
      id: 'authority_info',
      type: 'info',
      prompt: 'You may need someone available by phone with authority to approve a settlement during the conference.',
      showIf: (answers) => answers.settlement_authority === 'no',
    },
    {
      id: 'case_value_calculated',
      type: 'yes_no',
      prompt: 'Have you calculated the value of your case?',
    },
    {
      id: 'value_factors',
      type: 'info',
      prompt: 'Consider: damages, liability strength, evidence quality, cost of trial, time to resolution, and risk of losing.',
      showIf: (answers) => answers.case_value_calculated === 'no',
    },
    {
      id: 'settlement_range',
      type: 'yes_no',
      prompt: 'Do you have a clear settlement range (minimum/maximum)?',
    },
    {
      id: 'walkaway_point',
      type: 'yes_no',
      prompt: 'Do you know your walkaway point (when you would rather go to trial)?',
    },
    {
      id: 'BATNA_considered',
      type: 'yes_no',
      prompt: 'Have you considered your BATNA (Best Alternative to Negotiated Agreement)?',
    },
    {
      id: 'BATNA_info',
      type: 'info',
      prompt: 'Your BATNA is what happens if settlement fails. Consider: trial costs, time, stress, and likelihood of winning.',
      showIf: (answers) => answers.BATNA_considered === 'no',
    },
    {
      id: 'settlement_terms',
      type: 'yes_no',
      prompt: 'Have you thought about what settlement terms you need?',
    },
    {
      id: 'terms_info',
      type: 'info',
      prompt: 'Beyond money, consider: payment timing, confidentiality, releases, dismissals, and non-disparagement clauses.',
      showIf: (answers) => answers.settlement_terms === 'no',
    },
    {
      id: 'opposing_view',
      type: 'yes_no',
      prompt: 'Have you considered the opposing party\'s perspective and constraints?',
    },
    {
      id: 'preparation_notes',
      type: 'yes_no',
      prompt: 'Have you prepared notes on your key points and fallback positions?',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.settlement_offer_received === 'yes') {
      items.push({ status: 'done', text: 'Settlement offer received.' })
    } else {
      items.push({
        status: 'info',
        text: 'You may receive an offer at or before the settlement conference.',
      })
    }

    if (answers.offer_amount === 'yes') {
      items.push({ status: 'done', text: 'Settlement amount known.' })
    } else {
      items.push({
        status: 'info',
        text: 'Ask about the settlement offer amount before or during the conference.',
      })
    }

    if (answers.settlement_authority === 'yes') {
      items.push({ status: 'done', text: 'Settlement authority confirmed.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Ensure someone with settlement authority is available during the conference.',
      })
    }

    if (answers.case_value_calculated === 'yes') {
      items.push({ status: 'done', text: 'Case value calculated.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Calculate the value of your case considering damages, liability, and risks.',
      })
    }

    if (answers.settlement_range === 'yes') {
      items.push({ status: 'done', text: 'Settlement range determined.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Determine your ideal settlement, acceptable range, and walkaway point.',
      })
    }

    if (answers.walkaway_point === 'yes') {
      items.push({ status: 'done', text: 'Walkaway point identified.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Know the point at which you would prefer to proceed to trial.',
      })
    }

    if (answers.BATNA_considered === 'yes') {
      items.push({ status: 'done', text: 'BATNA considered.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Consider what happens if settlement fails - trial costs, time, and risks.',
      })
    }

    if (answers.settlement_terms === 'yes') {
      items.push({ status: 'done', text: 'Settlement terms identified.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Consider non-monetary terms: timing, confidentiality, releases, etc.',
      })
    }

    if (answers.preparation_notes === 'yes') {
      items.push({ status: 'done', text: 'Preparation notes ready.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Prepare notes on key points, supporting evidence, and fallback positions.',
      })
    }

    return items
  },
}
