import type { GuidedStepConfig } from '../types'

export const propertyDemandLetterConfig: GuidedStepConfig = {
  title: 'Send a Demand Letter',
  reassurance:
    'A demand letter formally notifies the other party of your property rights and gives them a chance to resolve the dispute before you file suit.',

  questions: [
    {
      id: 'recipient_name',
      type: 'text',
      prompt: 'Who will the demand letter be addressed to?',
      helpText:
        'The person or entity violating your property rights (neighbor, seller, HOA, etc.).',
      placeholder: 'e.g. John Smith or Oakwood HOA',
    },
    {
      id: 'property_right_violated',
      type: 'single_choice',
      prompt: 'What property right is being violated?',
      options: [
        { value: 'boundary_encroachment', label: 'Boundary encroachment' },
        { value: 'easement_violation', label: 'Easement violation' },
        { value: 'title_defect', label: 'Title defect or fraud' },
        { value: 'property_damage', label: 'Property damage' },
        { value: 'nuisance', label: 'Nuisance (noise, odor, water runoff, etc.)' },
        { value: 'hoa_overreach', label: 'HOA overreach or violation' },
        { value: 'covenant_violation', label: 'Restrictive covenant violation' },
        { value: 'other', label: 'Other property dispute' },
      ],
    },
    {
      id: 'encroachment_info',
      type: 'info',
      prompt:
        'For boundary encroachments, your demand should reference your property survey and clearly describe what structure or use crosses your boundary line. Include the approximate date you discovered the encroachment.',
      showIf: (answers) => answers.property_right_violated === 'boundary_encroachment',
    },
    {
      id: 'title_info',
      type: 'info',
      prompt:
        'For title defects, reference your deed, title policy, and any title search results. Describe the specific defect (lien, undisclosed encumbrance, forged signature, etc.).',
      showIf: (answers) => answers.property_right_violated === 'title_defect',
    },
    {
      id: 'what_you_want',
      type: 'single_choice',
      prompt: 'What are you requesting in the demand letter?',
      options: [
        { value: 'remove_encroachment', label: 'Remove the encroachment or structure' },
        { value: 'stop_activity', label: 'Stop the offending activity' },
        { value: 'monetary_compensation', label: 'Monetary compensation for damages' },
        { value: 'repair_property', label: 'Repair the property damage' },
        { value: 'clear_title', label: 'Clear the title defect' },
        { value: 'multiple', label: 'Multiple remedies' },
      ],
    },
    {
      id: 'deadline_days',
      type: 'single_choice',
      prompt: 'How many days will you give them to respond?',
      options: [
        { value: '14', label: '14 days' },
        { value: '30', label: '30 days' },
        { value: '60', label: '60 days' },
      ],
    },
    {
      id: 'deadline_info',
      type: 'info',
      prompt:
        '30 days is the most common deadline for property disputes. Shorter deadlines (14 days) may be appropriate if there is ongoing damage. Longer deadlines (60 days) give more time for complex issues like title corrections.',
    },
    {
      id: 'prior_communication',
      type: 'yes_no',
      prompt: 'Have you already tried to resolve this informally (verbal request, email, etc.)?',
    },
    {
      id: 'prior_communication_info',
      type: 'info',
      prompt:
        'Documenting prior attempts to resolve the issue strengthens your demand letter and shows the court you acted in good faith before filing suit.',
      showIf: (answers) => answers.prior_communication === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.recipient_name) {
      items.push({
        status: 'done',
        text: `Demand letter addressed to: ${answers.recipient_name}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Identify the recipient for the demand letter.',
      })
    }

    if (answers.property_right_violated && answers.property_right_violated !== 'other') {
      const labels: Record<string, string> = {
        boundary_encroachment: 'boundary encroachment',
        easement_violation: 'easement violation',
        title_defect: 'title defect or fraud',
        property_damage: 'property damage',
        nuisance: 'nuisance',
        hoa_overreach: 'HOA overreach',
        covenant_violation: 'restrictive covenant violation',
      }
      items.push({
        status: 'done',
        text: `Property right violated: ${labels[answers.property_right_violated] || answers.property_right_violated}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Specify which property right is being violated.',
      })
    }

    if (answers.what_you_want) {
      items.push({
        status: 'done',
        text: `Remedy requested in demand letter.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Specify what you are requesting in the demand letter.',
      })
    }

    if (answers.deadline_days) {
      items.push({
        status: 'done',
        text: `Response deadline: ${answers.deadline_days} days.`,
      })
    }

    if (answers.prior_communication === 'yes') {
      items.push({
        status: 'info',
        text: 'Prior informal attempts to resolve the dispute will strengthen your demand letter.',
      })
    }

    items.push({
      status: 'info',
      text: 'Send the demand letter by certified mail with return receipt requested so you have proof of delivery.',
    })

    return items
  },
}
