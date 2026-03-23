import type { GuidedStepConfig } from '../types'

export const propertyDamagesGuideConfig: GuidedStepConfig = {
  title: 'Calculating Your Total Damages',
  reassurance:
    'Most people undervalue their property claims. Knowing all your damages ensures you ask for what you deserve.',

  questions: [
    {
      id: 'damages_overview',
      type: 'info',
      prompt:
        'TYPES OF PROPERTY DAMAGES IN TEXAS:\n\n1. REPAIR/REPLACEMENT COST: What it costs to fix or replace the damaged property\n2. DIMINISHED VALUE: Even after repair, property may be worth less (e.g., flood-damaged home)\n3. LOSS OF USE: If you couldn\'t use your property during repairs (temporary housing, rental costs)\n4. CONSEQUENTIAL DAMAGES: Related costs (hotel stays, storage, moving, HOA fines)\n5. MENTAL ANGUISH: In some cases (trespass, nuisance), Texas allows emotional distress damages',
    },
    {
      id: 'repair_cost',
      type: 'text',
      prompt: 'What is the estimated repair or replacement cost?',
      helpText:
        'Use the average of your contractor estimates. If you have already paid for repairs, use the actual amount.',
      placeholder: '$0',
    },
    {
      id: 'has_diminished_value',
      type: 'yes_no',
      prompt:
        'Has the damage reduced your property\'s market value even after repairs?',
      helpText:
        'For example, a home that was flooded may sell for less even after full repairs. A property with a history of foundation damage may be worth less than a comparable home without that history.',
    },
    {
      id: 'diminished_value_info',
      type: 'info',
      prompt:
        'DIMINISHED VALUE:\nGet a before-and-after appraisal to establish diminished value. The difference between your property\'s value before the damage and its value after repair (accounting for the damage history) is your diminished value claim. A licensed appraiser can provide this.',
      showIf: (answers) => answers.has_diminished_value === 'yes',
    },
    {
      id: 'has_loss_of_use',
      type: 'yes_no',
      prompt:
        'Did you have to leave or couldn\'t use the property during repairs?',
      helpText:
        'This includes temporary housing costs, inability to rent the property, or loss of business income if the property was used commercially.',
    },
    {
      id: 'loss_of_use_info',
      type: 'info',
      prompt:
        'LOSS OF USE DAMAGES:\nKeep receipts for all temporary housing, storage, and relocation costs. If you own rental property, calculate lost rental income for the repair period. If the property is used for business, document lost business income. The key is documenting the period you could not use the property and the costs incurred.',
      showIf: (answers) => answers.has_loss_of_use === 'yes',
    },
    {
      id: 'has_consequential_costs',
      type: 'yes_no',
      prompt:
        'Did you incur other costs because of the damage?',
      helpText:
        'Examples: hotel stays, storage fees, moving costs, increased insurance premiums, HOA fines, permit fees, or costs to prevent further damage.',
    },
    {
      id: 'consequential_costs_info',
      type: 'info',
      prompt:
        'CONSEQUENTIAL DAMAGES:\nKeep every receipt. These "extra" costs add up quickly and are recoverable:\n• Hotel/temporary housing\n• Storage unit fees\n• Moving and relocation costs\n• Emergency repair costs (to prevent further damage)\n• Increased insurance premiums\n• HOA fines triggered by the damage\n• Permit and inspection fees\n• Lost wages (time off work to deal with damage)',
      showIf: (answers) => answers.has_consequential_costs === 'yes',
    },
    {
      id: 'damages_summary',
      type: 'info',
      prompt:
        'YOUR TOTAL CLAIM = Repair Cost + Diminished Value + Loss of Use + Consequential Damages\n\nDocument each category separately with receipts, estimates, or appraisals. Present them as line items to the court — judges appreciate organized, itemized damage calculations. Do not round up or guess — use actual numbers backed by evidence.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.repair_cost && answers.repair_cost !== '$0' && answers.repair_cost !== '') {
      items.push({
        status: 'done',
        text: `Repair/replacement cost: ${answers.repair_cost}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Obtain repair/replacement cost estimates from licensed contractors (at least 3).',
      })
    }

    if (answers.has_diminished_value === 'yes') {
      items.push({
        status: 'needed',
        text: 'Obtain a before-and-after property appraisal to establish diminished value.',
      })
    } else if (answers.has_diminished_value === 'no') {
      items.push({
        status: 'done',
        text: 'No diminished value claim.',
      })
    }

    if (answers.has_loss_of_use === 'yes') {
      items.push({
        status: 'needed',
        text: 'Document all loss-of-use costs (temporary housing, lost rent, lost business income) with receipts.',
      })
    } else if (answers.has_loss_of_use === 'no') {
      items.push({
        status: 'done',
        text: 'No loss-of-use claim.',
      })
    }

    if (answers.has_consequential_costs === 'yes') {
      items.push({
        status: 'needed',
        text: 'Gather all receipts for consequential costs (hotel, storage, moving, emergency repairs, etc.).',
      })
    } else if (answers.has_consequential_costs === 'no') {
      items.push({
        status: 'done',
        text: 'No consequential damages claim.',
      })
    }

    items.push({
      status: 'info',
      text: 'Present damages as an itemized list with supporting documentation for each line item.',
    })

    return items
  },
}
