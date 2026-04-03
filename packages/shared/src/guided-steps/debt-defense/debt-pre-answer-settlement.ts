import type { GuidedStepConfig } from '../types'

export const debtPreAnswerSettlementConfig: GuidedStepConfig = {
  title: 'Consider Early Settlement',
  reassurance:
    'Settling early can save you significant time and money — and you have more leverage than you think. Many cases resolve favorably at this stage.',

  questions: [
    {
      id: 'pre_answer_leverage_info',
      type: 'info',
      prompt:
        'Before filing your answer, consider whether settlement makes sense. You often have the MOST leverage right now — the plaintiff hasn\'t invested in litigation yet, and many debt buyers will accept significantly less than the full amount.',
    },
    {
      id: 'want_to_settle',
      type: 'single_choice',
      prompt: 'Are you open to settling this case?',
      options: [
        { value: 'yes_if_reasonable', label: 'Yes, if the terms are fair' },
        { value: 'no_want_to_fight', label: 'No, I want to fight this' },
        { value: 'not_sure', label: 'Not sure — what are my options?' },
      ],
    },
    {
      id: 'leverage_points_info',
      type: 'info',
      prompt:
        'SETTLEMENT LEVERAGE POINTS:\n\n- Debt buyers typically purchased your debt for 4-10 cents on the dollar\n- They often accept 20-50% of the claimed amount\n- They want to avoid trial costs (attorney fees, court time)\n- Your strongest leverage: a valid defense (SOL expired, standing issues, FDCPA violations)\n- Settlement saves you court time and stress',
      showIf: (answers) =>
        answers.want_to_settle === 'yes_if_reasonable' ||
        answers.want_to_settle === 'not_sure',
    },
    {
      id: 'what_to_negotiate_info',
      type: 'info',
      prompt:
        'WHAT TO NEGOTIATE:\n\n- Reduced lump sum (start at 25%, they may counter at 40-50%)\n- Payment plan (if you can\'t pay lump sum)\n- "Pay for delete" — they remove the account from your credit report\n- Dismissal with prejudice (they can never refile)\n- Written settlement agreement BEFORE you pay anything\n- NEVER give them direct access to your bank account',
      showIf: (answers) =>
        answers.want_to_settle === 'yes_if_reasonable' ||
        answers.want_to_settle === 'not_sure',
    },
    {
      id: 'settlement_offer',
      type: 'yes_no',
      prompt:
        'Have you received a settlement offer from the plaintiff?',
      showIf: (answers) =>
        answers.want_to_settle === 'yes_if_reasonable' ||
        answers.want_to_settle === 'not_sure',
    },
    {
      id: 'evaluating_offer_info',
      type: 'info',
      prompt:
        'EVALUATING THE OFFER:\n\nBefore accepting any offer:\n- Verify the total amount is correct\n- Ensure it includes dismissal with prejudice\n- Get the agreement in WRITING\n- Never pay until you have the signed agreement\n- Keep copies of everything\n\nDo NOT admit the debt is valid during negotiations.',
      showIf: (answers) =>
        (answers.want_to_settle === 'yes_if_reasonable' ||
          answers.want_to_settle === 'not_sure') &&
        answers.settlement_offer === 'yes',
    },
    {
      id: 'fight_info',
      type: 'info',
      prompt:
        'That\'s a valid choice. Continue preparing your answer and defense. You can always settle later — many cases settle at mediation or even on the day of trial.',
      showIf: (answers) => answers.want_to_settle === 'no_want_to_fight',
    },
    {
      id: 'file_answer_warning_info',
      type: 'info',
      prompt:
        'IMPORTANT — Even if you want to settle, FILE YOUR ANSWER ON TIME. Settlement negotiations do not extend your answer deadline. If you miss the deadline while negotiating, the plaintiff can take a default judgment.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.want_to_settle === 'yes_if_reasonable') {
      items.push({
        status: 'done',
        text: 'You are open to settling if the terms are fair.',
      })
      items.push({
        status: 'info',
        text: 'Start by offering 25% of the claimed amount. Debt buyers often accept 20-50%.',
      })
    } else if (answers.want_to_settle === 'not_sure') {
      items.push({
        status: 'info',
        text: 'You are exploring settlement as an option. Review the leverage points and negotiation tips above.',
      })
    } else if (answers.want_to_settle === 'no_want_to_fight') {
      items.push({
        status: 'done',
        text: 'You plan to fight the case. Continue preparing your answer and defense.',
      })
    }

    if (
      answers.settlement_offer === 'yes' &&
      (answers.want_to_settle === 'yes_if_reasonable' ||
        answers.want_to_settle === 'not_sure')
    ) {
      items.push({
        status: 'needed',
        text: 'Evaluate the plaintiff\'s settlement offer carefully. Verify the amount, require dismissal with prejudice, and get everything in writing before paying.',
      })
    }

    items.push({
      status: 'needed',
      text: 'FILE YOUR ANSWER ON TIME regardless of settlement negotiations. Missing the deadline can result in a default judgment.',
    })

    return items
  },
}
