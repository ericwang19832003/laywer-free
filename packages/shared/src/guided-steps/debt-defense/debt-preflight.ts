import type { GuidedStepConfig } from '../types'

export const debtPreflightConfig: GuidedStepConfig = {
  title: 'Before You Begin',
  reassurance:
    'Understanding your rights and options is the first step to defending yourself.',

  questions: [
    {
      id: 'know_fdcpa_rights',
      type: 'yes_no',
      prompt:
        'Are you aware of your rights under the Fair Debt Collection Practices Act (FDCPA)?',
      helpText:
        'The FDCPA is a federal law that limits what debt collectors can do when collecting debts.',
    },
    {
      id: 'fdcpa_info',
      type: 'info',
      prompt:
        'The FDCPA protects you from: harassment, threats, calling before 8am or after 9pm, contacting you at work after you say stop, and misrepresenting the debt amount.',
      showIf: (answers) => answers.know_fdcpa_rights === 'no',
    },
    {
      id: 'understand_validation',
      type: 'yes_no',
      prompt: 'Do you understand what a debt validation letter does?',
      helpText:
        'Debt validation is a powerful tool that can stop collection activity.',
    },
    {
      id: 'validation_info',
      type: 'info',
      prompt:
        "A validation letter forces the collector to prove: the debt exists, the amount is correct, and they have the right to collect. If they can't prove it, they must stop collection.",
      showIf: (answers) => answers.understand_validation === 'no',
    },
    {
      id: 'answer_strategy',
      type: 'single_choice',
      prompt: 'Which answer strategy are you leaning toward?',
      options: [
        { value: 'general_denial', label: 'General denial' },
        { value: 'specific_defenses', label: 'Specific defenses' },
        { value: 'not_sure', label: "I'm not sure yet" },
      ],
    },
    {
      id: 'general_denial_info',
      type: 'info',
      prompt:
        "A general denial denies every allegation. It's the simplest approach and forces the plaintiff to prove everything.",
      showIf: (answers) => answers.answer_strategy === 'general_denial',
    },
    {
      id: 'specific_info',
      type: 'info',
      prompt:
        'Specific defenses include: statute of limitations, lack of standing (they don\'t own the debt), payment already made, or FDCPA violations.',
      showIf: (answers) => answers.answer_strategy === 'specific_defenses',
    },
    {
      id: 'not_sure_info',
      type: 'info',
      prompt:
        'If unsure, start with a general denial. You can always raise specific defenses later.',
      showIf: (answers) => answers.answer_strategy === 'not_sure',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.know_fdcpa_rights === 'yes') {
      items.push({
        status: 'done',
        text: 'You understand your FDCPA rights.',
      })
    } else {
      items.push({
        status: 'done',
        text: 'You reviewed your FDCPA rights. Collectors cannot harass, threaten, or misrepresent the debt.',
      })
    }

    if (answers.understand_validation === 'yes') {
      items.push({
        status: 'done',
        text: 'You understand debt validation.',
      })
    } else {
      items.push({
        status: 'done',
        text: 'You learned about debt validation letters and how they can stop collection.',
      })
    }

    if (answers.answer_strategy === 'general_denial') {
      items.push({
        status: 'info',
        text: 'Strategy: general denial. This denies every allegation and forces the plaintiff to prove everything.',
      })
    } else if (answers.answer_strategy === 'specific_defenses') {
      items.push({
        status: 'info',
        text: 'Strategy: specific defenses. You may raise statute of limitations, lack of standing, prior payment, or FDCPA violations.',
      })
    } else {
      items.push({
        status: 'info',
        text: "Strategy: not decided yet. A general denial is a safe starting point \u2014 you can raise specific defenses later.",
      })
    }

    items.push({
      status: 'needed',
      text: 'Gather your court papers, creditor correspondence, payment records, and account statements before proceeding.',
    })

    return items
  },
}
