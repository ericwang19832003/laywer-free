import type { GuidedStepConfig } from '../types'

export const standingOrdersConfig: GuidedStepConfig = {
  title: 'County Standing Orders',
  reassurance:
    'Standing orders are routine — they apply to both parties equally and are designed to keep things fair during your case.',

  questions: [
    {
      id: 'standing_orders_overview',
      type: 'info',
      prompt:
        'Many Texas counties — including Harris, Dallas, Travis, Tarrant, Bexar, and Collin — have automatic standing orders (injunctions) that take effect the moment a family case is filed. These orders apply to BOTH parties. Violating a standing order can result in contempt of court.',
      acknowledgeLabel: 'I understand standing orders apply →',
    },
    {
      id: 'standing_orders_aware',
      type: 'yes_no',
      prompt: 'Have you checked whether your county has standing orders?',
      helpText:
        'You can ask the district clerk or check your county\'s website for local rules.',
    },
    {
      id: 'how_to_find_out',
      type: 'info',
      prompt:
        'To find out if your county has standing orders: (1) Call or visit your district clerk\'s office and ask. (2) Check your county\'s district court website — look for "Standing Orders" or "Local Rules." (3) Search for "[Your County] family court standing orders." Most counties post them online.',
      acknowledgeLabel: 'I\'ll check my county\'s standing orders →',
      showIf: (answers) => answers.standing_orders_aware === 'no',
    },
    {
      id: 'typical_prohibitions',
      type: 'info',
      prompt:
        'Typical standing order prohibitions include: • Do not destroy, hide, or transfer community property. • Do not cancel or change insurance policies (health, auto, life). • Do not make extraordinary purchases or incur unusual debt. • Do not harass, threaten, or intimidate the other party. • Do not remove children from the court\'s jurisdiction. • Do not change the locks on the residence (unless you have a protective order). • Do not destroy documents or electronic data. • Do not open or divert the other party\'s mail.',
      acknowledgeLabel: 'I understand all the restrictions →',
    },
    {
      id: 'understood',
      type: 'yes_no',
      prompt: 'Do you understand the restrictions that standing orders may impose?',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.standing_orders_aware === 'yes') {
      items.push({
        status: 'done',
        text: 'You have checked whether your county has standing orders.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Check whether your county has standing orders — contact the district clerk or visit your county\'s court website.',
      })
    }

    if (answers.understood === 'yes') {
      items.push({
        status: 'done',
        text: 'You understand the restrictions imposed by standing orders.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Review the standing order restrictions carefully. Violations can result in contempt of court.',
      })
    }

    items.push({
      status: 'info',
      text: 'Standing orders apply to both parties and prohibit actions like hiding property, canceling insurance, removing children from the jurisdiction, and destroying documents.',
    })

    return items
  },
}
