import type { GuidedStepConfig } from '../types'

export const contractProvisionsCheckConfig: GuidedStepConfig = {
  title: 'Check Your Contract for Key Clauses',
  reassurance:
    'Hidden clauses in your contract can change everything — from where you file to how much you can recover.',

  questions: [
    {
      id: 'has_arbitration',
      type: 'yes_no',
      prompt: 'Does your contract have an arbitration clause?',
    },
    {
      id: 'arbitration_info',
      type: 'info',
      prompt:
        'ARBITRATION CLAUSE: You may be REQUIRED to go to arbitration instead of court. Arbitration is a private process with a hired arbitrator (not a judge). It\'s usually binding. Check:\n- Is arbitration mandatory or optional?\n- Which organization? (AAA, JAMS, other)\n- Who pays the arbitrator? (often split)\n- You may need to file in arbitration first, then confirm the award in court.',
      showIf: (answers) => answers.has_arbitration === 'yes',
    },
    {
      id: 'has_liability_cap',
      type: 'yes_no',
      prompt: 'Does your contract have a limitation of liability clause?',
    },
    {
      id: 'liability_cap_info',
      type: 'info',
      prompt:
        'This caps the damages you can recover. For example: \'Liability shall not exceed the contract price.\' This is enforceable in Texas unless it\'s unconscionable. Adjust your damages demand accordingly.',
      showIf: (answers) => answers.has_liability_cap === 'yes',
    },
    {
      id: 'has_attorney_fees',
      type: 'yes_no',
      prompt: 'Does your contract have an attorney fees clause?',
    },
    {
      id: 'attorney_fees_info',
      type: 'info',
      prompt:
        'GOOD NEWS: Texas follows the \'American Rule\' (each side pays their own fees) UNLESS the contract says otherwise. A fee-shifting clause means the losing party pays the winner\'s attorney fees. This strengthens your demand letter — they risk paying your costs too.',
      showIf: (answers) => answers.has_attorney_fees === 'yes',
    },
    {
      id: 'has_choice_of_law',
      type: 'yes_no',
      prompt: 'Does your contract specify which state\'s law applies?',
    },
    {
      id: 'choice_of_law_info',
      type: 'info',
      prompt:
        'A choice-of-law clause means another state\'s laws may govern. This affects: statute of limitations, available damages, and procedural rules. If it says a state other than Texas, you should research that state\'s contract law.',
      showIf: (answers) => answers.has_choice_of_law === 'yes',
    },
    {
      id: 'has_liquidated_damages',
      type: 'yes_no',
      prompt: 'Does your contract have a liquidated damages clause?',
    },
    {
      id: 'liquidated_damages_info',
      type: 'info',
      prompt:
        'Liquidated damages pre-set the penalty for breach. Enforceable in Texas if: (1) damages were hard to estimate at contract time, and (2) the amount is a reasonable forecast of actual damages. If the amount is unreasonably large, a court may void it as a \'penalty.\'',
      showIf: (answers) => answers.has_liquidated_damages === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.has_arbitration === 'yes') {
      items.push({ status: 'info', text: 'Arbitration clause found — you may need to arbitrate instead of filing in court.' })
    } else if (answers.has_arbitration === 'no') {
      items.push({ status: 'done', text: 'No arbitration clause — you can file directly in court.' })
    } else {
      items.push({ status: 'needed', text: 'Check contract for an arbitration clause.' })
    }

    if (answers.has_liability_cap === 'yes') {
      items.push({ status: 'info', text: 'Liability cap found — your recoverable damages may be limited.' })
    } else if (answers.has_liability_cap === 'no') {
      items.push({ status: 'done', text: 'No liability cap — full damages available.' })
    } else {
      items.push({ status: 'needed', text: 'Check contract for a limitation of liability clause.' })
    }

    if (answers.has_attorney_fees === 'yes') {
      items.push({ status: 'done', text: 'Attorney fees clause found — loser pays winner\'s fees. Use this as leverage.' })
    } else if (answers.has_attorney_fees === 'no') {
      items.push({ status: 'info', text: 'No attorney fees clause — each side pays their own fees (American Rule).' })
    } else {
      items.push({ status: 'needed', text: 'Check contract for an attorney fees clause.' })
    }

    if (answers.has_choice_of_law === 'yes') {
      items.push({ status: 'info', text: 'Choice-of-law clause found — verify which state\'s law governs.' })
    } else if (answers.has_choice_of_law === 'no') {
      items.push({ status: 'done', text: 'No choice-of-law clause — Texas law likely applies.' })
    } else {
      items.push({ status: 'needed', text: 'Check contract for a choice-of-law clause.' })
    }

    if (answers.has_liquidated_damages === 'yes') {
      items.push({ status: 'info', text: 'Liquidated damages clause found — damages may be pre-set. Check if the amount is reasonable.' })
    } else if (answers.has_liquidated_damages === 'no') {
      items.push({ status: 'done', text: 'No liquidated damages clause — calculate actual damages.' })
    } else {
      items.push({ status: 'needed', text: 'Check contract for a liquidated damages clause.' })
    }

    return items
  },
}
