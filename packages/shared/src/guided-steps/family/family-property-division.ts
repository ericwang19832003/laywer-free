import type { GuidedStepConfig } from '../types'

export const propertyDivisionConfig: GuidedStepConfig = {
  title: 'Property Division',
  reassurance: 'Texas is a community property state. Property acquired during marriage is generally divided "just and right," which doesn\'t always mean 50/50.',
  questions: [
    {
      id: 'inventory_complete',
      type: 'yes_no',
      prompt: 'Have you completed an inventory of all community property?',
      helpText: 'Community property includes real estate, vehicles, bank accounts, retirement accounts, and personal property acquired during marriage.',
    },
    {
      id: 'inventory_info',
      type: 'info',
      prompt: 'Create a detailed inventory: real estate, vehicles, bank accounts, retirement/investment accounts, household items of value, and any business interests.',
      showIf: (a) => a.inventory_complete === 'no',
    },
    {
      id: 'separate_property',
      type: 'yes_no',
      prompt: 'Do either of you claim separate property?',
      helpText: 'Separate property is what you owned before marriage, inherited, or received as a gift.',
    },
    {
      id: 'separate_property_info',
      type: 'info',
      prompt: 'Gather documentation proving separate property: pre-marriage bank statements, inheritance documents, gift records.',
      showIf: (a) => a.separate_property === 'yes',
    },
    {
      id: 'debts_documented',
      type: 'yes_no',
      prompt: 'Have you documented all community debts?',
      helpText: 'Include mortgages, car loans, credit cards, student loans, and any other debts incurred during marriage.',
    },
    {
      id: 'valuations_obtained',
      type: 'yes_no',
      prompt: 'Have you obtained valuations for major assets?',
      helpText: 'Real estate appraisals, business valuations, and retirement account statements help ensure fair division.',
    },
  ],
  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.inventory_complete === 'yes') {
      items.push({ status: 'done', text: 'Community property inventory completed.' })
    } else {
      items.push({ status: 'needed', text: 'Complete a detailed inventory of all community property.' })
    }

    if (answers.separate_property === 'yes') {
      items.push({ status: 'info', text: 'Separate property claims identified. Gather documentation.' })
    }

    if (answers.debts_documented === 'yes') {
      items.push({ status: 'done', text: 'Community debts documented.' })
    } else {
      items.push({ status: 'needed', text: 'Document all community debts.' })
    }

    if (answers.valuations_obtained === 'yes') {
      items.push({ status: 'done', text: 'Asset valuations obtained.' })
    } else {
      items.push({ status: 'needed', text: 'Obtain valuations for major assets.' })
    }

    items.push({ status: 'info', text: 'Texas divides community property "just and right" — not necessarily 50/50.' })
    return items
  },
}
