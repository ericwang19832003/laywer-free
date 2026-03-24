import type { GuidedStepConfig } from '../types'

export const ltIllegalLockoutDefenseConfig: GuidedStepConfig = {
  title: 'Locked Out? Know Your Rights',
  reassurance:
    'Illegal lockouts are one of the clearest violations in Texas law. The court can order your landlord to let you back in immediately.',

  questions: [
    {
      id: 'what_happened',
      type: 'single_choice',
      prompt: 'What happened?',
      options: [
        { value: 'locks_changed', label: 'Locks were changed' },
        { value: 'utilities_shut_off', label: 'Utilities were shut off' },
        { value: 'belongings_removed', label: 'My belongings were removed' },
        { value: 'door_blocked', label: 'Door was blocked or barricaded' },
        { value: 'threatened_lockout', label: 'Landlord threatened to lock me out' },
      ],
    },
    {
      id: 'locks_changed_info',
      type: 'info',
      prompt:
        'Changing locks to prevent a tenant from entering is a clear violation of \u00a792.0081. You are entitled to immediate court relief, including a court order to restore access and damages.',
      showIf: (answers) => answers.what_happened === 'locks_changed',
    },
    {
      id: 'utilities_info',
      type: 'info',
      prompt:
        'Shutting off utilities (water, gas, electricity) to force a tenant out is illegal under \u00a792.008. This applies even if the utilities are in the landlord\'s name. You can recover damages plus penalties.',
      showIf: (answers) => answers.what_happened === 'utilities_shut_off',
    },
    {
      id: 'belongings_info',
      type: 'info',
      prompt:
        'Removing a tenant\'s belongings without a court order is illegal. Your landlord cannot seize, move, or dispose of your property. This may also constitute theft under the Texas Penal Code.',
      showIf: (answers) => answers.what_happened === 'belongings_removed',
    },
    {
      id: 'door_blocked_info',
      type: 'info',
      prompt:
        'Physically blocking access to your rental unit is an illegal lockout. This includes barricading doors, removing doors, or any action that prevents you from entering your home.',
      showIf: (answers) => answers.what_happened === 'door_blocked',
    },
    {
      id: 'threatened_info',
      type: 'info',
      prompt:
        'Even a threat to lock you out can be actionable. Document the threat (save texts, emails, or get witness statements). If the landlord follows through, you have strong evidence of intent.',
      showIf: (answers) => answers.what_happened === 'threatened_lockout',
    },
    {
      id: 'law_overview',
      type: 'info',
      prompt:
        'TEXAS LAW IS CLEAR (\u00a792.0081):\n- A landlord CANNOT change locks, remove doors, or shut off utilities to force you out\n- This is true even if you owe rent\n- Even if you have NO lease\n- The ONLY legal way to evict is through the court system',
    },
    {
      id: 'what_to_do',
      type: 'info',
      prompt:
        "WHAT TO DO RIGHT NOW:\n1. Call the police \u2014 an illegal lockout may be a criminal offense\n2. Document everything (photos, video, witness names)\n3. Go to JP Court IMMEDIATELY and file for emergency relief\n4. Ask for: court order to restore access + up to one month's rent in damages + $1,000 penalty + attorney fees\n5. The court can issue an emergency order the SAME DAY",
    },
    {
      id: 'called_police',
      type: 'yes_no',
      prompt: 'Have you called the police?',
    },
    {
      id: 'call_police_now',
      type: 'info',
      prompt:
        "Call the non-emergency line for your local police department. Tell them: 'My landlord has illegally locked me out of my residence.' Ask for an officer to come document the situation.",
      showIf: (answers) => answers.called_police === 'no',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    const scenarioLabels: Record<string, string> = {
      locks_changed: 'locks being changed',
      utilities_shut_off: 'utilities being shut off',
      belongings_removed: 'belongings being removed',
      door_blocked: 'door being blocked',
      threatened_lockout: 'lockout threats',
    }

    const scenario = scenarioLabels[answers.what_happened] || 'an illegal lockout'
    items.push({
      status: 'info',
      text: `You reported ${scenario}. This is a clear violation of Texas Property Code \u00a792.0081.`,
    })

    if (answers.called_police === 'yes') {
      items.push({ status: 'done', text: 'Police have been contacted.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Call the police non-emergency line to document the illegal lockout.',
      })
    }

    items.push({
      status: 'needed',
      text: 'Document everything with photos, video, and witness names.',
    })

    items.push({
      status: 'needed',
      text: 'Go to JP Court immediately and file for emergency relief. The court can issue an order the same day.',
    })

    items.push({
      status: 'info',
      text: "You may recover up to one month's rent in damages, a $1,000 penalty, and attorney fees.",
    })

    return items
  },
}
