import type { GuidedStepConfig } from '../types'

export const propertyDamageAssessmentConfig: GuidedStepConfig = {
  title: 'Documenting Your Property Damage',
  reassurance:
    'Good documentation is your strongest evidence. Photos, estimates, and timelines win property cases.',

  questions: [
    {
      id: 'damage_type',
      type: 'single_choice',
      prompt: 'What type of property damage are you dealing with?',
      options: [
        { value: 'tree_damage', label: 'Tree damage' },
        { value: 'water_intrusion', label: 'Water intrusion' },
        { value: 'structural', label: 'Structural damage' },
        { value: 'fence_boundary', label: 'Fence or boundary damage' },
        { value: 'vehicle_to_property', label: 'Vehicle damage to property' },
        { value: 'neighbor_negligence', label: 'Neighbor negligence' },
        { value: 'hoa_related', label: 'HOA-related damage' },
        { value: 'other', label: 'Other' },
      ],
    },

    // Conditional info for each damage type
    {
      id: 'tree_damage_info',
      type: 'info',
      prompt:
        'For tree damage: Document the tree\'s location, who owns the property the tree is on, and the damage it caused. Photograph the tree, the roots if visible, and all damaged areas. Note whether the tree was dead or diseased before it fell — this matters for liability.',
      showIf: (answers) => answers.damage_type === 'tree_damage',
    },
    {
      id: 'water_intrusion_info',
      type: 'info',
      prompt:
        'For water intrusion: Document the source of the water (neighbor\'s property, shared drainage, broken pipe, etc.). Photograph water stains, mold, warped flooring, and damaged belongings. Get a plumber or water mitigation specialist to identify the source in writing.',
      showIf: (answers) => answers.damage_type === 'water_intrusion',
    },
    {
      id: 'structural_info',
      type: 'info',
      prompt:
        'For structural damage: Document cracks, shifts, or failures with close-up and wide-angle photos. Get a licensed structural engineer\'s inspection report — this is often essential evidence. Note whether the damage is getting worse over time.',
      showIf: (answers) => answers.damage_type === 'structural',
    },
    {
      id: 'fence_boundary_info',
      type: 'info',
      prompt:
        'For fence or boundary damage: Photograph the fence or boundary from both sides. Get a copy of your property survey or hire a surveyor to confirm the boundary line. Note any agreements (written or verbal) with your neighbor about the fence.',
      showIf: (answers) => answers.damage_type === 'fence_boundary',
    },
    {
      id: 'vehicle_to_property_info',
      type: 'info',
      prompt:
        'For vehicle damage to property: Get a police report if one was filed. Photograph the damage to your property and any vehicle debris. Document the driver\'s name, insurance information, and license plate if known.',
      showIf: (answers) => answers.damage_type === 'vehicle_to_property',
    },
    {
      id: 'neighbor_negligence_info',
      type: 'info',
      prompt:
        'For neighbor negligence: Document how the neighbor\'s actions (or inaction) caused the damage. Keep a written log of dates and incidents. Save any communications (texts, emails, letters) between you and the neighbor about the issue.',
      showIf: (answers) => answers.damage_type === 'neighbor_negligence',
    },
    {
      id: 'hoa_related_info',
      type: 'info',
      prompt:
        'For HOA-related damage: Review your CC&Rs to understand maintenance responsibilities. Document the damage and any maintenance requests you\'ve made to the HOA. Save copies of all correspondence with the HOA, including board meeting minutes if relevant.',
      showIf: (answers) => answers.damage_type === 'hoa_related',
    },
    {
      id: 'other_info',
      type: 'info',
      prompt:
        'Document the damage thoroughly: photograph from multiple angles, note the date and time, identify the cause and responsible party, and keep a written record of everything that has happened.',
      showIf: (answers) => answers.damage_type === 'other',
    },

    // Documentation checklist
    {
      id: 'documentation_checklist',
      type: 'info',
      prompt:
        'DOCUMENTATION CHECKLIST:\n1. PHOTOS: Take photos from multiple angles, with timestamps. Include wide shots showing context and close-ups showing damage detail.\n2. VIDEO: Walk through the damage narrating what you see.\n3. ESTIMATES: Get at least 3 written repair estimates from licensed contractors.\n4. TIMELINE: Write down when the damage occurred, when you discovered it, and what\'s happened since.\n5. BEFORE PHOTOS: If you have any photos from before the damage, save them \u2014 they prove the condition changed.',
    },

    // Repair estimates
    {
      id: 'has_estimates',
      type: 'yes_no',
      prompt: 'Have you gotten repair estimates?',
    },
    {
      id: 'estimates_guidance',
      type: 'info',
      prompt:
        'Getting repair estimates is critical for proving your damages. Here\'s what to do:\n\n1. Contact at least 3 licensed contractors who specialize in the type of repair you need.\n2. Ask each contractor for a written estimate that includes: scope of work, materials needed, labor costs, and total price.\n3. Make sure the estimate is on the contractor\'s letterhead with their license number.\n4. Keep all estimates \u2014 even if they vary widely, they help establish the range of damages.',
      showIf: (answers) => answers.has_estimates === 'no',
    },

    // Evidence preservation
    {
      id: 'preserve_evidence',
      type: 'info',
      prompt:
        'PRESERVE THE EVIDENCE: Don\'t repair the damage until you\'ve documented everything AND the other party has had a chance to inspect. If emergency repairs are needed (like a roof leak), document the damage FIRST, then repair, and keep all receipts.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Damage type
    if (answers.damage_type) {
      const labels: Record<string, string> = {
        tree_damage: 'tree damage',
        water_intrusion: 'water intrusion',
        structural: 'structural damage',
        fence_boundary: 'fence or boundary damage',
        vehicle_to_property: 'vehicle damage to property',
        neighbor_negligence: 'neighbor negligence',
        hoa_related: 'HOA-related damage',
        other: 'other property damage',
      }
      items.push({
        status: 'done',
        text: `Damage type identified: ${labels[answers.damage_type]}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Identify the type of property damage.',
      })
    }

    // Documentation
    items.push({
      status: 'needed',
      text: 'Complete the documentation checklist: photos (multiple angles), video walkthrough, timeline of events, and any before-damage photos.',
    })

    // Estimates
    if (answers.has_estimates === 'yes') {
      items.push({
        status: 'done',
        text: 'Repair estimates obtained.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Get at least 3 written repair estimates from licensed contractors.',
      })
    }

    // Preservation reminder
    items.push({
      status: 'info',
      text: 'Do not repair the damage until you have documented everything and the other party has had a chance to inspect. If emergency repairs are needed, document first, then repair, and keep all receipts.',
    })

    return items
  },
}
