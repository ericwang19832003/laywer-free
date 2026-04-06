import type { GuidedStepConfig } from '../types'

export const debtHearingPrepConfig: GuidedStepConfig = {
  title: 'Prepare for Your Hearing',
  reassurance:
    'Debt collectors win most cases by default. By showing up prepared, you\'re already ahead.',

  questions: [
    {
      id: 'evidence_organized',
      type: 'yes_no',
      prompt: 'Do you have your evidence organized?',
    },
    {
      id: 'evidence_info',
      type: 'info',
      prompt:
        'Gather: the original contract (if you have it), all payment records, the debt validation response, and any FDCPA violation evidence.',
      showIf: (answers) => answers.evidence_organized === 'no',
    },
    {
      id: 'defense_strategy',
      type: 'single_choice',
      prompt: 'Which defense are you primarily relying on?',
      options: [
        { value: 'statute_of_limitations', label: 'Statute of limitations' },
        { value: 'lack_of_standing', label: 'Lack of standing' },
        { value: 'fdcpa_violations', label: 'FDCPA violations' },
        { value: 'general_denial', label: 'General denial' },
        { value: 'multiple', label: 'Multiple defenses' },
      ],
    },
    {
      id: 'sol_info',
      type: 'info',
      prompt:
        'If the debt is past the statute of limitations (4 years in Texas for written contracts), the collector cannot legally collect through the courts.',
      showIf: (answers) => answers.defense_strategy === 'statute_of_limitations',
    },
    {
      id: 'standing_info',
      type: 'info',
      prompt:
        "Debt buyers must prove they own the debt through a complete chain of assignment. Many can't. Challenge them to prove standing.",
      showIf: (answers) => answers.defense_strategy === 'lack_of_standing',
    },
    {
      id: 'settlement_contacted',
      type: 'yes_no',
      prompt: "Has the plaintiff's attorney contacted you about settlement?",
    },
    {
      id: 'open_to_settlement',
      type: 'single_choice',
      prompt: 'Are you open to settling?',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'depends', label: 'It depends on the terms' },
      ],
      showIf: (answers) => answers.settlement_contacted === 'yes',
    },
    {
      id: 'settlement_info',
      type: 'info',
      prompt:
        'If settling, negotiate for: reduced amount, payment plan, deletion from credit reports, and a written agreement before paying.',
      showIf: (answers) =>
        answers.open_to_settlement === 'yes' ||
        answers.open_to_settlement === 'depends',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.evidence_organized === 'yes') {
      items.push({ status: 'done', text: 'Evidence organized and ready.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Organize your evidence: original contract, payment records, debt validation response, and FDCPA violation evidence.',
      })
    }

    const strategyLabels: Record<string, string> = {
      statute_of_limitations: 'statute of limitations',
      lack_of_standing: 'lack of standing',
      fdcpa_violations: 'FDCPA violations',
      general_denial: 'general denial',
      multiple: 'multiple defenses',
    }

    if (answers.defense_strategy) {
      items.push({
        status: 'done',
        text: `Primary defense strategy: ${strategyLabels[answers.defense_strategy]}.`,
      })

      if (answers.defense_strategy === 'statute_of_limitations') {
        items.push({
          status: 'info',
          text: 'Be ready to show the court your last payment date and that 4+ years have passed.',
        })
      } else if (answers.defense_strategy === 'lack_of_standing') {
        items.push({
          status: 'info',
          text: 'Prepare to challenge the plaintiff to produce the complete chain of debt assignment.',
        })
      } else if (answers.defense_strategy === 'fdcpa_violations') {
        items.push({
          status: 'info',
          text: 'Bring all evidence of FDCPA violations: call logs, letters, timestamps.',
        })
      } else if (answers.defense_strategy === 'multiple') {
        items.push({
          status: 'info',
          text: 'Prepare documentation for each defense you plan to raise.',
        })
      }
    }

    if (answers.settlement_contacted === 'yes') {
      if (
        answers.open_to_settlement === 'yes' ||
        answers.open_to_settlement === 'depends'
      ) {
        items.push({
          status: 'info',
          text: 'If settling, negotiate for reduced amount, payment plan, credit report deletion, and get everything in writing.',
        })
      } else {
        items.push({
          status: 'info',
          text: 'You plan to proceed to hearing rather than settle.',
        })
      }
    } else {
      items.push({
        status: 'info',
        text: "The plaintiff's attorney may offer a settlement before or at the hearing. You are not obligated to accept.",
      })
    }

    return items
  },
}
