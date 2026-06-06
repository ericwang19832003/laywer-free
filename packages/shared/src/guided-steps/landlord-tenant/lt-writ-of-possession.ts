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
      acknowledgeLabel: 'I understand the post-judgment eviction timeline and my 5-day appeal window',
    },
    {
      id: 'rights_during_process',
      type: 'info',
      prompt:
        'YOUR RIGHTS DURING THIS PROCESS:\n- You MUST be given written notice before physical removal\n- The constable must be present (landlord cannot self-help)\n- You can take your personal belongings\n- Landlord must store your property for a reasonable time if you can\'t take it all\n- You are NOT responsible for the landlord\'s eviction costs unless the judge ordered it',
      acknowledgeLabel: 'I understand my rights — the landlord cannot remove me without a constable and proper written notice',
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
      type: 'multi_select',
      prompt:
        'EMERGENCY STEPS — Check off each action you have taken or will take immediately:',
      helpText:
        'Time is critical. If you are within the 5-day appeal window, filing an appeal will immediately stop the eviction process.',
      options: [
        { value: 'file_appeal', label: 'File an appeal NOW if within 5 days of judgment (this STOPS the eviction)' },
        { value: 'contact_lone_star', label: 'Contact Lone Star Legal Aid: 1-800-733-8394' },
        { value: 'contact_trla', label: 'Contact Texas RioGrande Legal Aid: 1-888-988-9996' },
        { value: 'move_belongings', label: 'Begin moving most important belongings' },
        { value: 'secure_documents', label: 'Secure important documents (ID, lease, financial records)' },
        { value: 'contact_211', label: 'Contact 211 (United Way) for emergency housing assistance' },
      ],
      showIf: (answers) => answers.facing_removal === 'yes',
    },
    {
      id: 'resources_info',
      type: 'info',
      prompt:
        'RESOURCES FOR DISPLACED TENANTS:\n- 211 Texas: emergency housing, food, utilities assistance\n- texaslawhelp.org: free legal information\n- Salvation Army & local churches: temporary shelter\n- Local housing authority: Section 8 vouchers and public housing',
      acknowledgeLabel: "I've noted these resources and will contact them if I need housing assistance",
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.facing_removal === 'yes') {
      const completedSteps = answers.emergency_steps
        ? new Set(answers.emergency_steps.split(','))
        : new Set<string>()

      items.push({
        status: completedSteps.has('file_appeal') ? 'done' : 'needed',
        text: 'URGENT: If within 5 days of judgment, file an appeal NOW to stop the eviction.',
      })
      items.push({
        status: completedSteps.has('contact_lone_star') || completedSteps.has('contact_trla') ? 'done' : 'needed',
        text: 'Contact legal aid: Lone Star Legal Aid 1-800-733-8394 or Texas RioGrande Legal Aid 1-888-988-9996.',
      })
      items.push({
        status: completedSteps.has('secure_documents') && completedSteps.has('move_belongings') ? 'done' : 'needed',
        text: 'Secure important documents and begin moving essential belongings.',
      })
      items.push({
        status: completedSteps.has('contact_211') ? 'done' : 'needed',
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
