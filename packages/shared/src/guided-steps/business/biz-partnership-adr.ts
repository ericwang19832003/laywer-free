import type { GuidedStepConfig } from '../types'

export const bizPartnershipAdrConfig: GuidedStepConfig = {
  title: 'Mediation or Arbitration',
  reassurance:
    'Many partnership agreements require mediation or arbitration before filing a lawsuit. Let\u2019s check.',

  questions: [
    {
      id: 'has_adr_clause',
      type: 'yes_no',
      prompt:
        'Does your partnership or operating agreement require mediation or arbitration?',
    },
    {
      id: 'no_agreement_info',
      type: 'info',
      prompt:
        'If there\u2019s no mandatory ADR clause, you can still choose mediation voluntarily. It\u2019s often faster and cheaper.',
      showIf: (answers) => answers.has_adr_clause === 'no',
    },
    {
      id: 'adr_type',
      type: 'single_choice',
      prompt: 'What does your agreement require?',
      options: [
        { value: 'mediation', label: 'Mediation' },
        { value: 'arbitration', label: 'Arbitration' },
        {
          value: 'both',
          label: 'Both (mediation first, then arbitration)',
        },
      ],
      showIf: (answers) => answers.has_adr_clause === 'yes',
    },
    {
      id: 'has_mediator',
      type: 'yes_no',
      prompt: 'Have you identified a mediator or arbitrator?',
    },
    {
      id: 'attempted_adr',
      type: 'yes_no',
      prompt: 'Have you already attempted ADR?',
    },
    {
      id: 'adr_complete_info',
      type: 'info',
      prompt:
        'If ADR didn\u2019t resolve the dispute, you\u2019ve satisfied the requirement and can proceed to filing.',
      showIf: (answers) => answers.attempted_adr === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.has_adr_clause === 'yes') {
      items.push({
        status: 'info',
        text: 'Partnership agreement requires ADR before filing.',
      })

      if (answers.adr_type) {
        const labels: Record<string, string> = {
          mediation: 'Mediation',
          arbitration: 'Arbitration',
          both: 'Both (mediation first, then arbitration)',
        }
        items.push({
          status: 'done',
          text: `ADR type required: ${labels[answers.adr_type]}.`,
        })
      }
    } else if (answers.has_adr_clause === 'no') {
      items.push({
        status: 'info',
        text: 'No mandatory ADR clause. Mediation is optional but recommended.',
      })
    }

    if (answers.has_mediator === 'yes') {
      items.push({
        status: 'done',
        text: 'Mediator or arbitrator identified.',
      })
    } else if (answers.has_mediator === 'no') {
      items.push({
        status: 'needed',
        text: 'Identify a mediator or arbitrator.',
      })
    }

    if (answers.attempted_adr === 'yes') {
      items.push({
        status: 'done',
        text: 'ADR attempted. Requirement satisfied.',
      })
    } else if (answers.attempted_adr === 'no') {
      if (answers.has_adr_clause === 'yes') {
        items.push({
          status: 'needed',
          text: 'Complete the required ADR process before filing.',
        })
      } else {
        items.push({
          status: 'info',
          text: 'ADR not yet attempted. Consider voluntary mediation.',
        })
      }
    }

    return items
  },
}
