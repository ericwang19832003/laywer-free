import type { GuidedStepConfig } from '../types'

export const ltRentIntoRegistryConfig: GuidedStepConfig = {
  title: 'Paying Rent Into the Court Registry',
  reassurance:
    'This process keeps you in your home during the appeal. Paying rent into the court registry shows the court you are acting in good faith.',

  questions: [
    {
      id: 'registry_overview',
      type: 'info',
      prompt:
        'To STAY IN YOUR HOME during an eviction appeal, you MUST pay rent into the court registry. Miss this and your appeal can be dismissed.',
      acknowledgeLabel: "I understand — missing registry payments can get my appeal dismissed",
    },
    {
      id: 'registry_timeline',
      type: 'info',
      prompt:
        'TIMELINE — First payment due within 5 DAYS of filing the appeal in JP Court. Then monthly payments to the County Court registry once the case transfers (typically 6–10 days after appeal filed).',
      acknowledgeLabel: "I understand the payment deadlines — first payment within 5 days, then monthly after transfer",
    },
    {
      id: 'appeal_filed',
      type: 'yes_no',
      prompt: 'Have you filed your appeal?',
    },
    {
      id: 'first_payment_made',
      type: 'yes_no',
      prompt: 'Have you made the first rent payment into the JP Court registry?',
      showIf: (answers) => answers.appeal_filed === 'yes',
    },
    {
      id: 'urgent_payment_warning',
      type: 'info',
      prompt:
        'URGENT — Pay immediately. The amount is the fair market rental rate set by the eviction judgment, or $250, whichever is GREATER. Go to the JP Court clerk and ask to deposit rent into the court registry. Get a receipt.',
      acknowledgeLabel: "I understand — I'll go to the JP Court clerk today and get a receipt for my registry payment",
      showIf: (answers) =>
        answers.appeal_filed === 'yes' && answers.first_payment_made === 'no',
    },
    {
      id: 'how_it_works',
      type: 'info',
      prompt:
        'HOW IT WORKS — You pay the clerk, not the landlord. The clerk holds the money. If you win the appeal, the money is returned to you. If you lose, it goes to the landlord. Keep all receipts as proof of payment.',
      acknowledgeLabel: "I understand — I pay the clerk directly and keep all receipts",
    },
    {
      id: 'affordability_info',
      type: 'info',
      prompt:
        'WHAT IF YOU CAN\'T AFFORD IT — If you filed a Statement of Inability to Pay Court Costs, the court may still require rent payments. However, the amount may be adjusted. Talk to the clerk or a legal aid attorney about your options.',
      acknowledgeLabel: "I understand — I'll speak with the clerk or legal aid attorney about adjusting my payment amount",
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.appeal_filed === 'yes') {
      items.push({ status: 'done', text: 'Appeal has been filed.' })

      if (answers.first_payment_made === 'yes') {
        items.push({
          status: 'done',
          text: 'First rent payment made into JP Court registry.',
        })
        items.push({
          status: 'needed',
          text: 'Continue making monthly payments to the County Court registry once the case transfers.',
        })
      } else if (answers.first_payment_made === 'no') {
        items.push({
          status: 'needed',
          text: 'URGENT: Make first rent payment into JP Court registry immediately. Payment is due within 5 days of filing the appeal.',
        })
      }
    } else if (answers.appeal_filed === 'no') {
      items.push({
        status: 'needed',
        text: 'File your appeal first, then pay rent into the court registry within 5 days.',
      })
    }

    items.push({
      status: 'info',
      text: 'Keep all payment receipts as proof. You pay the clerk, not the landlord.',
    })

    return items
  },
}
