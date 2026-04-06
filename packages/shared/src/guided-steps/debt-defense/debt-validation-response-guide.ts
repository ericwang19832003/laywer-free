import type { GuidedStepConfig } from '../types'

export const debtValidationResponseGuideConfig: GuidedStepConfig = {
  title: 'What Happened After Your Validation Letter',
  reassurance:
    'Whether the collector responded or stayed silent, you now have valuable information for your defense.',

  questions: [
    {
      id: 'collector_response',
      type: 'single_choice',
      prompt: 'Did the collector respond to your validation letter?',
      options: [
        { value: 'no_response', label: 'No response' },
        { value: 'partial_response', label: 'Partial or incomplete response' },
        { value: 'full_response', label: 'Full response with documentation' },
      ],
    },
    {
      id: 'no_response_info',
      type: 'info',
      prompt:
        'The collector failed to validate the debt. This is a strong defense. At trial, you can argue: "I requested validation under 15 USC \u00a7 1692g. The collector failed to respond within 30 days. They cannot prove the debt is valid." Keep your certified mail receipt as evidence.',
      showIf: (answers) => answers.collector_response === 'no_response',
    },
    {
      id: 'partial_response_info',
      type: 'info',
      prompt:
        'The collector sent something but it\'s incomplete. Common incomplete responses:\n- Just a bill or statement (not proof of original agreement)\n- No chain of assignment from original creditor\n- Wrong amount or wrong account\n\nAn incomplete response is almost as good as no response. The collector must prove the ORIGINAL agreement and their right to collect.',
      showIf: (answers) => answers.collector_response === 'partial_response',
    },
    {
      id: 'full_response_info',
      type: 'info',
      prompt:
        'The collector provided documentation. Review it carefully:\n- Is the original signed agreement attached? (If no \u2192 incomplete)\n- Does the chain of assignment go from original creditor to current collector? (If gaps \u2192 challenge standing)\n- Is the amount correct including interest calculations? (If wrong \u2192 challenge amount)\n- Is the account yours? (If different name/address \u2192 dispute identity)',
      showIf: (answers) => answers.collector_response === 'full_response',
    },
    {
      id: 'continued_collecting',
      type: 'yes_no',
      prompt:
        'Did the collector continue collecting during the validation period?',
      helpText:
        'The validation period is 30 days from when you sent your validation letter.',
    },
    {
      id: 'fdcpa_violation_info',
      type: 'info',
      prompt:
        'This is an FDCPA violation under 15 USC \u00a7 1692g(b). The collector must stop all collection activity until they provide validation. Document every contact they made during this period (dates, times, what was said). Add this as an additional FDCPA defense — you may be entitled to statutory damages up to $1,000 plus attorney fees.',
      showIf: (answers) => answers.continued_collecting === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.collector_response === 'no_response') {
      items.push({
        status: 'done',
        text: 'Collector failed to validate the debt. This is a strong defense at trial.',
      })
      items.push({
        status: 'needed',
        text: 'Keep your certified mail receipt as proof that you sent the validation letter.',
      })
    } else if (answers.collector_response === 'partial_response') {
      items.push({
        status: 'info',
        text: 'Collector sent an incomplete response. They still have not proven the original agreement or their right to collect.',
      })
      items.push({
        status: 'needed',
        text: 'Document what was missing from the response: original agreement, chain of assignment, correct amount, or account verification.',
      })
    } else if (answers.collector_response === 'full_response') {
      items.push({
        status: 'info',
        text: 'Collector provided documentation. Review it carefully for gaps in the chain of assignment, incorrect amounts, or missing signatures.',
      })
      items.push({
        status: 'needed',
        text: 'Compare the documentation against your own records. Note any discrepancies in amounts, dates, or account details.',
      })
    }

    if (answers.continued_collecting === 'yes') {
      items.push({
        status: 'info',
        text: 'The collector violated the FDCPA by continuing collection during the validation period. This is an additional defense and may entitle you to damages.',
      })
      items.push({
        status: 'needed',
        text: 'Document all collection contacts during the validation period: dates, times, methods, and what was communicated.',
      })
    }

    return items
  },
}
