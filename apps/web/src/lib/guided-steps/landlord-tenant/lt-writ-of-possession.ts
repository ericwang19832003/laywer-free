import type { GuidedStepConfig } from '../types'

export const ltWritOfPossessionConfig: GuidedStepConfig = {
  title: 'Writ of Possession — What Happens If You Lose',
  reassurance:
    'Even if you lose the eviction case, you have time. Texas law gives you at least 6 days before you must leave.',

  questions: [
    {
      id: 'timeline_info',
      type: 'info',
      prompt:
        'IF YOU LOSE THE EVICTION CASE:\n\nDay 1-5: Appeal window — you can file an appeal (see Appeal Guide)\nDay 6+: If no appeal filed, landlord can request a \'Writ of Possession\'\nWrit issued: Constable posts notice on your door giving you 24 hours\nAfter 24 hours: Constable can physically remove you and change locks',
    },
    {
      id: 'rights_during_process',
      type: 'info',
      prompt:
        'YOUR RIGHTS DURING THIS PROCESS:\n- You MUST be given written notice before physical removal\n- The constable must be present (landlord cannot self-help)\n- You can take your personal belongings\n- Landlord must store your property for a reasonable time if you can\'t take it all\n- You are NOT responsible for the landlord\'s eviction costs unless the judge ordered it',
    },
    {
      id: 'facing_removal',
      type: 'yes_no',
      prompt: 'Are you facing imminent removal?',
      helpText:
        'If a constable has posted a notice on your door or you expect removal within the next few days.',
    },
    {
      id: 'emergency_steps',
      type: 'info',
      prompt:
        'EMERGENCY STEPS:\n1. File an appeal NOW if within 5 days (this STOPS the eviction)\n2. If past 5 days: Contact legal aid immediately\n   - Lone Star Legal Aid: 1-800-733-8394\n   - Texas RioGrande Legal Aid: 1-888-988-9996\n3. Begin moving your most important belongings\n4. Secure important documents (ID, lease, financial records)\n5. Contact 211 (United Way) for emergency housing assistance',
      helpText:
        'Time is critical. If you are within the 5-day appeal window, filing an appeal will immediately stop the eviction process.',
      showIf: (answers) => answers.facing_removal === 'yes',
    },
    {
      id: 'resources_info',
      type: 'info',
      prompt:
        'RESOURCES FOR DISPLACED TENANTS:\n- 211 Texas: emergency housing, food, utilities assistance\n- texaslawhelp.org: free legal information\n- Salvation Army & local churches: temporary shelter\n- Local housing authority: Section 8 vouchers and public housing',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.facing_removal === 'yes') {
      items.push({
        status: 'needed',
        text: 'URGENT: If within 5 days of judgment, file an appeal NOW to stop the eviction.',
      })
      items.push({
        status: 'needed',
        text: 'Contact legal aid: Lone Star Legal Aid 1-800-733-8394 or Texas RioGrande Legal Aid 1-888-988-9996.',
      })
      items.push({
        status: 'needed',
        text: 'Secure important documents and begin moving essential belongings.',
      })
      items.push({
        status: 'needed',
        text: 'Call 211 for emergency housing assistance.',
      })
    } else {
      items.push({
        status: 'info',
        text: 'You have at least 5 days after judgment to file an appeal before a writ of possession can be issued.',
      })
      items.push({
        status: 'info',
        text: 'If the landlord requests a writ, a constable will post a 24-hour notice on your door before removal.',
      })
    }

    items.push({
      status: 'info',
      text: 'The landlord cannot remove you without a constable — self-help eviction is illegal in Texas.',
    })
    items.push({
      status: 'info',
      text: 'Resources: 211 Texas, texaslawhelp.org, Lone Star Legal Aid (1-800-733-8394).',
    })

    return items
  },
}
