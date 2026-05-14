import type { GuidedStepConfig } from '../types'

export const ltConstructiveEvictionConfig: GuidedStepConfig = {
  title: 'Constructive Eviction — When You Can Legally Leave',
  reassurance:
    'If conditions are truly uninhabitable, you may be able to leave without breaking the lease. The law protects tenants in these situations.',

  questions: [
    {
      id: 'constructive_eviction_overview',
      type: 'info',
      prompt:
        'CONSTRUCTIVE EVICTION means the property is so uninhabitable that it\'s as if the landlord evicted you — even though they didn\'t formally do so. If you can prove it, you can terminate your lease without penalty.',
    },
    {
      id: 'four_elements',
      type: 'info',
      prompt:
        'FOUR ELEMENTS YOU MUST PROVE:\n1. The landlord breached a duty to maintain the property (§ 92.052)\n2. The breach substantially interferes with your use and enjoyment\n3. You gave the landlord written notice and reasonable time to fix it\n4. You VACATED the property within a reasonable time after the landlord failed to fix it',
    },
    {
      id: 'conditions',
      type: 'single_choice',
      prompt: 'What conditions are you dealing with?',
      options: [
        { value: 'no_water', label: 'No running water' },
        { value: 'no_heat_ac', label: 'No heat or AC in extreme weather' },
        { value: 'sewage', label: 'Raw sewage backup' },
        { value: 'structural', label: 'Structural damage / unsafe conditions' },
        { value: 'mold', label: 'Severe mold' },
        { value: 'pests', label: 'Severe pest infestation' },
        { value: 'multiple', label: 'Multiple serious issues' },
      ],
    },
    {
      id: 'gave_written_notice',
      type: 'yes_no',
      prompt: 'Did you give the landlord WRITTEN notice of these conditions?',
    },
    {
      id: 'written_notice_required',
      type: 'info',
      prompt:
        'WRITTEN NOTICE IS REQUIRED — You must give written notice before you can claim constructive eviction. Send a letter (certified mail recommended) describing the conditions, requesting repair, and stating that you will terminate the lease if not repaired within a reasonable time (7–14 days). Keep a copy.',
      showIf: (answers) => answers.gave_written_notice === 'no',
    },
    {
      id: 'landlord_failed_to_repair',
      type: 'yes_no',
      prompt:
        'Did the landlord fail to repair within a reasonable time after your notice?',
    },
    {
      id: 'next_steps_info',
      type: 'info',
      prompt:
        'NEXT STEPS — You may now vacate and terminate the lease. Document everything before leaving (photos, videos). Send a written notice of termination citing constructive eviction and the landlord\'s failure to repair. Keep copies. You may also be entitled to damages: moving costs, rent differential, storage costs.',
      showIf: (answers) => answers.landlord_failed_to_repair === 'yes',
    },
    {
      id: 'warning_info',
      type: 'info',
      prompt:
        'WARNING — If you leave WITHOUT proper notice and documentation, the landlord may treat it as lease abandonment and hold you liable for remaining rent. Follow the steps carefully.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.conditions) {
      const labels: Record<string, string> = {
        no_water: 'No running water',
        no_heat_ac: 'No heat or AC in extreme weather',
        sewage: 'Raw sewage backup',
        structural: 'Structural damage / unsafe conditions',
        mold: 'Severe mold',
        pests: 'Severe pest infestation',
        multiple: 'Multiple serious issues',
      }
      items.push({
        status: 'info',
        text: `Condition reported: ${labels[answers.conditions] ?? answers.conditions}.`,
      })
    }

    if (answers.gave_written_notice === 'yes') {
      items.push({ status: 'done', text: 'Written notice given to landlord.' })
    } else if (answers.gave_written_notice === 'no') {
      items.push({
        status: 'needed',
        text: 'Send written notice to landlord via certified mail describing the conditions and requesting repair within 7–14 days.',
      })
    }

    if (answers.landlord_failed_to_repair === 'yes') {
      items.push({
        status: 'info',
        text: 'Landlord failed to repair after notice. You may vacate and terminate the lease.',
      })
      items.push({
        status: 'needed',
        text: 'Document all conditions (photos, videos) and send written termination notice citing constructive eviction before leaving.',
      })
    } else if (answers.landlord_failed_to_repair === 'no') {
      items.push({
        status: 'info',
        text: 'Landlord has not yet failed to repair. Allow reasonable time (7–14 days) before claiming constructive eviction.',
      })
    }

    return items
  },
}
