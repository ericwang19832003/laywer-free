import type { GuidedStepConfig } from '../types'

export const temporaryOrdersConfig: GuidedStepConfig = {
  title: 'Temporary Orders',
  reassurance:
    'Temporary orders protect you and your children while the case is pending.',

  questions: [
    {
      id: 'safety_concerns',
      type: 'yes_no',
      prompt:
        'Are there immediate safety concerns for you or your children?',
    },
    {
      id: 'safety_info',
      type: 'info',
      prompt:
        "If there's danger, you can request an emergency protective order. Contact the court clerk immediately or call the National Domestic Violence Hotline: 1-800-799-7233.",
      showIf: (answers) => answers.safety_concerns === 'yes',
    },
    {
      id: 'need_temp_custody',
      type: 'yes_no',
      prompt: 'Do you need temporary custody arrangements?',
    },
    {
      id: 'need_temp_support',
      type: 'yes_no',
      prompt: 'Do you need temporary child support?',
    },
    {
      id: 'need_property_restraint',
      type: 'yes_no',
      prompt:
        'Do you need property restraining orders (to prevent the other party from selling or hiding assets)?',
    },
    {
      id: 'temp_orders_info',
      type: 'info',
      prompt:
        'Temporary orders remain in effect until the court issues final orders. They can cover: custody, support, property use, bill payment, and behavior requirements.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.safety_concerns === 'yes') {
      items.push({
        status: 'needed',
        text: 'Request an emergency protective order. Contact the court clerk or call 1-800-799-7233.',
      })
    } else {
      items.push({
        status: 'done',
        text: 'No immediate safety concerns identified.',
      })
    }

    if (answers.need_temp_custody === 'yes') {
      items.push({
        status: 'needed',
        text: 'File for temporary custody arrangements.',
      })
    } else {
      items.push({
        status: 'done',
        text: 'Temporary custody arrangements are not needed at this time.',
      })
    }

    if (answers.need_temp_support === 'yes') {
      items.push({
        status: 'needed',
        text: 'File for temporary child support.',
      })
    } else {
      items.push({
        status: 'done',
        text: 'Temporary child support is not needed at this time.',
      })
    }

    if (answers.need_property_restraint === 'yes') {
      items.push({
        status: 'needed',
        text: 'File for property restraining orders to prevent asset dissipation.',
      })
    } else {
      items.push({
        status: 'done',
        text: 'Property restraining orders are not needed at this time.',
      })
    }

    items.push({
      status: 'info',
      text: 'Temporary orders remain in effect until the court issues final orders.',
    })

    return items
  },
}

export function createTemporaryOrdersConfig(subType: 'divorce' | 'custody' | 'child_support' | 'spousal_support'): GuidedStepConfig {
  const titles: Record<string, string> = {
    divorce: 'Temporary Orders',
    custody: 'Temporary Custody Orders',
    child_support: 'Temporary Child Support',
    spousal_support: 'Temporary Spousal Support',
  }

  return {
    ...temporaryOrdersConfig,
    title: titles[subType] ?? 'Temporary Orders',
  }
}
