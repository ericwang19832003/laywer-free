import type { GuidedStepConfig } from '../types'

export const contractDamagesMethodsConfig: GuidedStepConfig = {
  title: 'Calculating Your Contract Damages',
  reassurance:
    'Knowing exactly how much you\'re owed — and being able to prove it — is the foundation of your case.',

  questions: [
    {
      id: 'damages_methods_info',
      type: 'info',
      prompt:
        'HOW COURTS CALCULATE DAMAGES:\n\nThere are 3 ways courts measure what you\'re owed for a breach of contract. The right method depends on your situation.\n\nThe next question will help identify which one applies to you.',
      acknowledgeLabel: "Got it — let's find my method →",
    },
    {
      id: 'damages_method',
      type: 'single_choice',
      prompt: 'Which method fits your situation?',
      options: [
        { value: 'expectation', label: 'Expectation — I want the benefit of the bargain' },
        { value: 'reliance', label: 'Reliance — I want to recover what I spent' },
        { value: 'restitution', label: 'Restitution — I want back what I gave them' },
        { value: 'unsure', label: 'Not sure which applies' },
      ],
    },
    {
      id: 'expectation_info',
      type: 'info',
      prompt:
        'EXPECTATION DAMAGES — YOUR CALCULATION:\n\nStep 1: What is the value of the promised performance? (What would you have if the contract was fulfilled?)\nStep 2: What value did you actually receive? (Anything of value from partial performance?)\nStep 3: What costs did you save because the contract wasn\'t completed? (Money you didn\'t have to spend?)\n\nYour damages = Step 1 - Step 2 - Step 3\n\nDocument each number with receipts, invoices, quotes, or estimates.',
      acknowledgeLabel: "I'll calculate my expectation damages using the formula",
      showIf: (answers) => answers.damages_method === 'expectation',
    },
    {
      id: 'reliance_info',
      type: 'info',
      prompt:
        'RELIANCE DAMAGES — YOUR CALCULATION:\n\nList every expense you incurred BECAUSE of the contract:\n- Payments made to the other party\n- Materials purchased\n- Labor costs (your time or hired help)\n- Travel expenses\n- Opportunity costs (other contracts you turned down)\n\nYour damages = Total of all expenses incurred in reliance on the contract\n\nKeep all receipts and invoices. If you turned down other work, document the lost opportunity.',
      acknowledgeLabel: "I'll list every expense I incurred because of the contract",
      showIf: (answers) => answers.damages_method === 'reliance',
    },
    {
      id: 'restitution_info',
      type: 'info',
      prompt:
        'RESTITUTION DAMAGES — YOUR CALCULATION:\n\nList everything of value you gave the other party:\n- Cash payments (show bank records, canceled checks)\n- Property transferred\n- Services performed (calculate fair market value)\n- Deposits or down payments\n\nYour damages = Total value of what you gave them\n\nThis method is simplest to prove — focus on documenting every payment or transfer.',
      acknowledgeLabel: "I'll document everything of value I gave the other party",
      showIf: (answers) => answers.damages_method === 'restitution',
    },
    {
      id: 'unsure_info',
      type: 'info',
      prompt:
        'NOT SURE? Use this guide:\n\n- Did you pay for something and get NOTHING? → Expectation or Restitution (they overlap here)\n- Did you pay and get PARTIAL delivery? → Expectation (value of full performance minus what you got)\n- Did you spend money PREPARING for the contract? → Reliance\n- Is the contract unenforceable (no writing, etc.)? → Restitution\n- Were profits uncertain or speculative? → Reliance (easier to prove than lost profits)\n\nWhen in doubt, calculate all three and use the highest amount you can prove.',
      acknowledgeLabel: "I'll calculate all three methods and use the strongest",
      showIf: (answers) => answers.damages_method === 'unsure',
    },
    {
      id: 'mitigated_damages',
      type: 'yes_no',
      prompt: 'Have you mitigated your damages?',
      helpText:
        'Texas law requires you to take reasonable steps to reduce your losses. For example, if a contractor walks off the job, you must hire a replacement at a reasonable cost — not wait and let damages grow.',
    },
    {
      id: 'what_you_cannot_recover_info',
      type: 'info',
      prompt:
        'WHAT YOU CAN\'T RECOVER:\n- Speculative damages (profits from a business that didn\'t exist yet — unless you can prove them)\n- Unforeseeable damages (losses the other party couldn\'t have predicted when making the contract)\n- Punitive damages (not available in most contract cases — only if there\'s also fraud)\n- Emotional distress (generally not recoverable in contract cases)',
      acknowledgeLabel: "I understand what I cannot recover",
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.damages_method && answers.damages_method !== 'unsure') {
      const labels: Record<string, string> = {
        expectation: 'Expectation damages — recover the benefit of the bargain.',
        reliance: 'Reliance damages — recover expenses incurred in reliance on the contract.',
        restitution: 'Restitution damages — recover the value of what you gave the other party.',
      }
      items.push({ status: 'done', text: labels[answers.damages_method] })
    } else if (answers.damages_method === 'unsure') {
      items.push({ status: 'needed', text: 'Calculate damages using all three methods and choose the strongest.' })
    } else {
      items.push({ status: 'needed', text: 'Determine which damages calculation method fits your situation.' })
    }

    if (answers.mitigated_damages === 'yes') {
      items.push({ status: 'done', text: 'Damages mitigated — document the steps you took to reduce losses.' })
    } else if (answers.mitigated_damages === 'no') {
      items.push({ status: 'needed', text: 'Take reasonable steps to mitigate damages. Texas law requires it — failure to mitigate can reduce your recovery.' })
    } else {
      items.push({ status: 'needed', text: 'Assess whether you have mitigated your damages.' })
    }

    items.push({ status: 'info', text: 'Remember: no punitive damages, no emotional distress, and no speculative losses unless provable.' })

    return items
  },
}
