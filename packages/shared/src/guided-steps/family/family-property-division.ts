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
    {
      id: 'retirement_accounts',
      type: 'yes_no',
      prompt: 'Does either spouse have retirement accounts (401(k), pension, IRA)?',
    },
    {
      id: 'qdro_warning',
      type: 'info',
      prompt: 'IMPORTANT — QDRO REQUIRED FOR RETIREMENT ACCOUNTS:\n\nDividing 401(k)s and pensions requires a Qualified Domestic Relations Order (QDRO) — a separate legal document the plan administrator must approve.\n\n\u2022 TexasLawHelp does NOT provide QDRO forms\n\u2022 A missing or defective QDRO can permanently lose your community interest in the retirement plan\n\u2022 QDRO specialists typically charge $500\u2013$1,500 — far less than the benefits at stake\n\u2022 The QDRO must be included with or shortly after the final decree\n\u2022 IRAs can be divided by transfer incident to divorce without a QDRO, but must follow IRS rules\n\nSTRONG RECOMMENDATION: Hire a QDRO specialist or family law attorney for this part, even if you handle the rest yourself.',
      showIf: (a) => a.retirement_accounts === 'yes',
    },
    {
      id: 'debt_creditor_warning',
      type: 'info',
      prompt: 'DEBT REMINDER: Creditors are NOT bound by the divorce decree. If your name is on a joint debt (mortgage, credit card, car loan), the creditor can still pursue you even if the decree assigns that debt to your spouse. Consider requiring refinancing as part of the settlement — especially for mortgages.',
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

    if (answers.retirement_accounts === 'yes') {
      items.push({ status: 'needed', text: 'Retirement accounts require a QDRO. Strongly consider hiring a QDRO specialist ($500–$1,500).' })
    }

    items.push({ status: 'info', text: 'Creditors are NOT bound by the decree — joint debts can still be collected from either spouse.' })
    items.push({ status: 'info', text: 'Texas divides community property "just and right" — not necessarily 50/50.' })
    return items
  },
}
