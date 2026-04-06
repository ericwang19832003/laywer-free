import type { GuidedStepConfig } from '../types'

export const familyTempOrdersPrepConfig: GuidedStepConfig = {
  title: 'Preparing for Temporary Orders Hearing',
  reassurance:
    'Temporary orders protect you and your children while the case is pending. Preparation is key — these hearings are short, so every minute counts.',

  questions: [
    {
      id: 'temp_orders_needed',
      type: 'single_choice',
      prompt: 'What temporary orders do you need?',
      options: [
        { value: 'custody', label: 'Temporary custody and visitation' },
        { value: 'support', label: 'Temporary child or spousal support' },
        { value: 'property_restraint', label: 'Property restraining order' },
        { value: 'exclusive_use', label: 'Exclusive use of family home' },
        { value: 'all', label: 'All of the above' },
      ],
    },
    {
      id: 'custody_info',
      type: 'info',
      prompt:
        "The court can set interim custody and visitation until the final hearing. Focus on the child's current routine and stability. Bring evidence of who has been the primary caretaker: school pickup records, medical appointment history, and daily schedules.",
      showIf: (a) => a.temp_orders_needed === 'custody' || a.temp_orders_needed === 'all',
    },
    {
      id: 'support_info',
      type: 'info',
      prompt:
        'The court can order temporary child support and spousal support based on guidelines. Bring income documentation for both parties (pay stubs, tax returns) and a list of monthly expenses. Texas child support guidelines use a percentage of net income.',
      showIf: (a) => a.temp_orders_needed === 'support' || a.temp_orders_needed === 'all',
    },
    {
      id: 'property_restraint_info',
      type: 'info',
      prompt:
        'A Standing Order (automatic in many TX counties) prevents either party from hiding, destroying, or spending community assets. If your county does not have one, you can request a Temporary Restraining Order (TRO) to freeze assets.',
      showIf: (a) => a.temp_orders_needed === 'property_restraint' || a.temp_orders_needed === 'all',
    },
    {
      id: 'exclusive_use_info',
      type: 'info',
      prompt:
        "You can request exclusive use of the family home during the case. The court considers: who has primary custody, safety concerns, ability to afford alternative housing. This does NOT affect ownership — it's temporary.",
      showIf: (a) => a.temp_orders_needed === 'exclusive_use' || a.temp_orders_needed === 'all',
    },
    {
      id: 'presentation_info',
      type: 'info',
      prompt:
        'WHAT TO PRESENT:\n1. Your proposed temporary orders (written out)\n2. Evidence supporting your requests (financial docs, child\'s schedule, safety concerns)\n3. A brief explanation of why these temporary orders are necessary\n\nKeep it brief — temporary orders hearings are usually 30-60 minutes.',
    },
    {
      id: 'standard_of_proof_info',
      type: 'info',
      prompt:
        "STANDARD OF PROOF: For temporary orders, the standard is 'preponderance of the evidence' (more likely than not). This is LOWER than the standard for final orders.",
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    const need = answers.temp_orders_needed
    if (need === 'custody' || need === 'all') {
      items.push({ status: 'needed', text: "Prepare evidence of the child's routine and your caretaking involvement." })
    }
    if (need === 'support' || need === 'all') {
      items.push({ status: 'needed', text: 'Gather income documentation and monthly expense records.' })
    }
    if (need === 'property_restraint' || need === 'all') {
      items.push({ status: 'needed', text: 'Check if your county has a Standing Order. If not, prepare a TRO request.' })
    }
    if (need === 'exclusive_use' || need === 'all') {
      items.push({ status: 'needed', text: 'Document why exclusive use of the home is necessary (custody, safety, finances).' })
    }

    items.push({ status: 'needed', text: 'Write out your proposed temporary orders before the hearing.' })
    items.push({ status: 'info', text: 'Temporary orders hearings are usually 30-60 minutes. Be concise and focused.' })

    return items
  },
}
