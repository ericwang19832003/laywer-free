import type { GuidedStepConfig } from '../types'

export const contractBreachAnalysisConfig: GuidedStepConfig = {
  title: 'Is This a Material Breach?',
  reassurance:
    'Understanding the severity of the breach determines your remedies and strengthens your negotiating position.',

  questions: [
    {
      id: 'breach_types_info',
      type: 'info',
      prompt:
        'TWO TYPES OF BREACH:\n\n1. MATERIAL BREACH: The other party failed to do something essential. You didn\'t get the substantial benefit of the contract. Example: contractor was paid to build a garage but never started.\n\n2. MINOR BREACH: The other party did most of what was promised but missed a detail. Example: contractor built the garage but used a slightly different paint color.\n\nWHY IT MATTERS: A material breach lets you cancel the contract AND sue for damages. A minor breach only lets you sue for the cost to fix the deficiency.',
    },
    {
      id: 'contract_promise',
      type: 'text',
      prompt: 'What did the contract promise?',
      placeholder: 'Describe the main obligation',
    },
    {
      id: 'what_happened',
      type: 'single_choice',
      prompt: 'What actually happened?',
      options: [
        { value: 'nothing_done', label: 'Nothing was done at all' },
        { value: 'partial_performance', label: 'Partial performance — some work was done but not completed' },
        { value: 'completed_with_defects', label: 'Completed with defects — finished but with problems' },
        { value: 'late_performance', label: 'Late performance — done but after the deadline' },
        { value: 'wrong_thing_delivered', label: 'Wrong thing delivered — something different than promised' },
      ],
    },
    {
      id: 'nothing_done_info',
      type: 'info',
      prompt:
        'TOTAL NON-PERFORMANCE: This is almost certainly a material breach. The other party failed entirely. You can cancel the contract, demand a full refund of anything you paid, and sue for additional damages (such as the cost to hire someone else).',
      showIf: (answers) => answers.what_happened === 'nothing_done',
    },
    {
      id: 'partial_performance_info',
      type: 'info',
      prompt:
        'PARTIAL PERFORMANCE: This is likely a material breach if the incomplete work deprives you of the substantial benefit. Key question: can you use what was delivered? If the partial work is essentially useless without completion, it\'s material. If it has standalone value, it may be minor.',
      showIf: (answers) => answers.what_happened === 'partial_performance',
    },
    {
      id: 'completed_with_defects_info',
      type: 'info',
      prompt:
        'COMPLETED WITH DEFECTS: This is usually a minor breach — you received the substantial benefit but with imperfections. Your remedy is the cost to fix the defects, not cancellation. Exception: if the defects are so severe the work is essentially unusable, it could be material.',
      showIf: (answers) => answers.what_happened === 'completed_with_defects',
    },
    {
      id: 'late_performance_info',
      type: 'info',
      prompt:
        'LATE PERFORMANCE: Usually a minor breach unless "time was of the essence." If the contract explicitly states a deadline is critical (e.g., wedding venue, event supplies), late performance can be material. Otherwise, you can recover damages caused by the delay but cannot cancel.',
      showIf: (answers) => answers.what_happened === 'late_performance',
    },
    {
      id: 'wrong_thing_delivered_info',
      type: 'info',
      prompt:
        'WRONG THING DELIVERED: This is typically a material breach. You contracted for something specific and received something different. You can reject what was delivered, cancel the contract, and sue for damages — including the cost to obtain what was actually promised.',
      showIf: (answers) => answers.what_happened === 'wrong_thing_delivered',
    },
    {
      id: 'received_benefit',
      type: 'yes_no',
      prompt: 'Did you receive ANY benefit from the contract?',
    },
    {
      id: 'received_benefit_yes_info',
      type: 'info',
      prompt:
        'If you received substantial benefit, the breach may be considered minor. You can still recover damages for the deficiencies but cannot cancel the entire contract.',
      showIf: (answers) => answers.received_benefit === 'yes',
    },
    {
      id: 'received_benefit_no_info',
      type: 'info',
      prompt:
        'If you received no substantial benefit, this is likely a material breach. You can cancel the contract, demand a full refund, and sue for additional damages.',
      showIf: (answers) => answers.received_benefit === 'no',
    },
    {
      id: 'anticipatory_breach_info',
      type: 'info',
      prompt:
        'ANTICIPATORY BREACH: If the other party has told you (or their actions show) they WON\'T perform in the future, that\'s an anticipatory breach. You can treat the contract as broken NOW — you don\'t have to wait until the performance deadline.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.contract_promise) {
      items.push({ status: 'done', text: 'Contract obligation identified.' })
    } else {
      items.push({ status: 'needed', text: 'Describe what the contract promised.' })
    }

    if (answers.what_happened) {
      const labels: Record<string, string> = {
        nothing_done: 'Total non-performance — likely material breach.',
        partial_performance: 'Partial performance — likely material breach if substantial benefit was lost.',
        completed_with_defects: 'Completed with defects — likely minor breach.',
        late_performance: 'Late performance — minor breach unless time was of the essence.',
        wrong_thing_delivered: 'Wrong thing delivered — likely material breach.',
      }
      items.push({ status: 'info', text: labels[answers.what_happened] })
    } else {
      items.push({ status: 'needed', text: 'Identify what actually happened with the contract performance.' })
    }

    if (answers.received_benefit === 'yes') {
      items.push({ status: 'info', text: 'Benefit received — breach may be minor. Recover cost of deficiencies.' })
    } else if (answers.received_benefit === 'no') {
      items.push({ status: 'info', text: 'No benefit received — likely material breach. Full refund and damages available.' })
    } else {
      items.push({ status: 'needed', text: 'Determine whether you received any benefit from the contract.' })
    }

    return items
  },
}
