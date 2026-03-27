import type { GuidedStepConfig } from '../types'

export const mediationConfig: GuidedStepConfig = {
  title: 'Mediation',
  reassurance:
    'Mediation can help you reach an agreement without the stress and cost of trial.',

  questions: [
    {
      id: 'court_ordered',
      type: 'yes_no',
      prompt: 'Has the court ordered mediation?',
    },
    {
      id: 'mediator_chosen',
      type: 'yes_no',
      prompt: 'Have you chosen a mediator?',
    },
    {
      id: 'mediator_info',
      type: 'info',
      prompt:
        "You and the other party usually agree on a mediator. If you can't agree, the court will appoint one. Many counties have low-cost mediation programs.",
      showIf: (answers) => answers.mediator_chosen === 'no',
    },
    {
      id: 'issues_listed',
      type: 'yes_no',
      prompt:
        'Have you prepared a list of issues to resolve in mediation?',
    },
    {
      id: 'issues_info',
      type: 'info',
      prompt:
        'Make a prioritized list: custody arrangements, property division, child support, spousal support. Know which items are most important to you and where you can compromise.',
      showIf: (answers) => answers.issues_listed === 'no',
    },
    {
      id: 'mediation_overview',
      type: 'info',
      prompt:
        "How mediation works: A neutral mediator helps both parties negotiate. It's confidential \u2014 nothing said can be used in court. If you reach agreement, it becomes a binding court order.",
    },
    {
      id: 'fail_info',
      type: 'info',
      prompt:
        'If mediation fails, your case proceeds to trial. The judge will make the decisions instead.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.court_ordered === 'yes') {
      items.push({
        status: 'done',
        text: 'Court-ordered mediation confirmed.',
      })
    } else {
      items.push({
        status: 'info',
        text: 'Mediation has not been court-ordered. You can still choose to mediate voluntarily.',
      })
    }

    if (answers.mediator_chosen === 'yes') {
      items.push({
        status: 'done',
        text: 'You have chosen a mediator.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Choose a mediator. Check your county for low-cost mediation programs.',
      })
    }

    if (answers.issues_listed === 'yes') {
      items.push({
        status: 'done',
        text: 'Your list of issues for mediation is prepared.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Prepare a prioritized list of issues: custody, property, support. Know your must-haves and where you can compromise.',
      })
    }

    items.push({
      status: 'info',
      text: 'Mediation is confidential. If you reach agreement, it becomes a binding court order. If not, the case proceeds to trial.',
    })

    return items
  },
}

export function createMediationConfig(subType: 'divorce' | 'custody' | 'visitation' | 'modification'): GuidedStepConfig {
  const mandatory = subType === 'custody' || subType === 'visitation'

  return {
    ...mediationConfig,
    reassurance: mandatory
      ? 'Texas Family Code §153.0071 requires mediation in custody and visitation cases before trial. This is mandatory.'
      : mediationConfig.reassurance,
  }
}
