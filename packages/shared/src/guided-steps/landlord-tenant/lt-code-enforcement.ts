import type { GuidedStepConfig } from '../types'

export const ltCodeEnforcementConfig: GuidedStepConfig = {
  title: 'Filing a Code Enforcement Complaint',
  reassurance:
    'Code enforcement can compel your landlord to make repairs. Filing a complaint creates an official record and triggers legal protections for you.',

  questions: [
    {
      id: 'code_enforcement_overview',
      type: 'info',
      prompt:
        'If your landlord refuses to repair dangerous conditions, you can file a complaint with your city or county code enforcement department. This creates an official record AND can result in the city ORDERING the landlord to repair.',
      acknowledgeLabel: 'I understand how code enforcement complaints work and what they can accomplish',
    },
    {
      id: 'condition_type',
      type: 'single_choice',
      prompt: 'What type of condition are you reporting?',
      options: [
        {
          value: 'health_hazard',
          label: 'Health/safety hazard — mold, sewage, pests, no water',
        },
        { value: 'structural', label: 'Structural issues — roof, foundation, walls' },
        {
          value: 'fire_safety',
          label: 'Fire safety — smoke detectors, exits, electrical',
        },
        { value: 'overcrowding', label: 'Overcrowding or zoning violations' },
        { value: 'other', label: 'Other condition' },
      ],
    },
    {
      id: 'how_to_file',
      type: 'info',
      prompt:
        'HOW TO FILE — Contact your city\'s code compliance department (search "[your city] code enforcement" online). You can usually file by phone, online, or in person. Provide: the property address, your name and contact info, a description of the violations, and photos if available.',
      acknowledgeLabel: "I understand — I'll look up my city's code enforcement department and file a complaint",
    },
    {
      id: 'complaint_filed',
      type: 'yes_no',
      prompt: 'Have you filed a code enforcement complaint?',
    },
    {
      id: 'what_happens_next',
      type: 'info',
      prompt:
        'WHAT HAPPENS NEXT — The city will schedule an inspection. If violations are found, the landlord receives a notice to repair. Failure to comply can result in fines. IMPORTANT: Keep your complaint receipt and any inspection reports — these are powerful evidence for your case AND trigger the 6-month retaliation protection (§ 92.331).',
      acknowledgeLabel: "I understand — I'll save my complaint receipt and all inspection reports as evidence",
      showIf: (answers) => answers.complaint_filed === 'yes',
    },
    {
      id: 'file_soon',
      type: 'info',
      prompt:
        'FILE SOON — A code enforcement complaint creates an official government record of the conditions. This is valuable evidence for habitability claims, repair requests, and constructive eviction. It also triggers the 6-month retaliation protection under § 92.331.',
      acknowledgeLabel: "I understand the importance of filing — I'll file a code enforcement complaint promptly",
      showIf: (answers) => answers.complaint_filed === 'no',
    },
    {
      id: 'retaliation_protection',
      type: 'info',
      prompt:
        'RETALIATION PROTECTION — Filing a code enforcement complaint is a protected activity. If your landlord retaliates (eviction, rent increase, service decrease) within 6 months, the law presumes it\'s retaliation (§ 92.331).',
      acknowledgeLabel: 'I understand my 6-month retaliation protection under § 92.331 after filing this complaint',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.condition_type) {
      const labels: Record<string, string> = {
        health_hazard: 'Health/safety hazard',
        structural: 'Structural issues',
        fire_safety: 'Fire safety',
        overcrowding: 'Overcrowding or zoning violations',
        other: 'Other condition',
      }
      items.push({
        status: 'info',
        text: `Condition type: ${labels[answers.condition_type] ?? answers.condition_type}.`,
      })
    }

    if (answers.complaint_filed === 'yes') {
      items.push({
        status: 'done',
        text: 'Code enforcement complaint filed.',
      })
      items.push({
        status: 'needed',
        text: 'Keep your complaint receipt and any inspection reports as evidence.',
      })
    } else if (answers.complaint_filed === 'no') {
      items.push({
        status: 'needed',
        text: 'File a code enforcement complaint to create an official record and trigger retaliation protection.',
      })
    }

    items.push({
      status: 'info',
      text: 'You are protected from landlord retaliation for 6 months after filing a code enforcement complaint (§ 92.331).',
    })

    return items
  },
}
