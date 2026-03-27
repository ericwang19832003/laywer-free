import type { GuidedStepConfig } from '../types'
import { calculatePIDamages, type InjurySeverity } from '../../rules/pi-damages-calculator'

function parseDollars(raw: string | undefined): number {
  if (!raw) return 0
  const cleaned = raw.replace(/[$,\s]/g, '')
  const n = parseFloat(cleaned)
  return isNaN(n) ? 0 : Math.max(0, n)
}

function formatDollars(amount: number): string {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

export const piDamagesCalculationConfig: GuidedStepConfig = {
  title: 'Calculating Your Damages',
  reassurance:
    'Understanding what your case is worth helps you negotiate from strength — not desperation.',

  questions: [
    {
      id: 'damages_intro',
      type: 'info',
      prompt:
        'DAMAGES ARE WHAT THE LAW SAYS YOU\'RE OWED.\n\nTwo types:\n1. ECONOMIC (specials): Medical bills, lost wages, property damage — things with receipts\n2. NON-ECONOMIC (generals): Pain, suffering, mental anguish, loss of enjoyment — things without receipts\n\nYour total demand = Economic damages + (Economic × multiplier for pain/suffering)',
    },
    {
      id: 'medical_expenses',
      type: 'text',
      prompt: 'What are your total medical expenses so far?',
      placeholder: '$0',
      helpText:
        'Include ER visits, surgery, physical therapy, prescriptions, and any other medical costs related to the injury.',
    },
    {
      id: 'expect_future_medical',
      type: 'yes_no',
      prompt: 'Do you expect future medical treatment?',
      helpText:
        'This includes follow-up surgeries, ongoing physical therapy, future prescriptions, or long-term care.',
    },
    {
      id: 'future_medical_cost',
      type: 'text',
      prompt: 'What is your estimated cost of future medical treatment?',
      placeholder: '$0',
      helpText:
        'Ask your doctor for an estimate. Include ongoing therapy, future surgeries, and long-term medication costs.',
      showIf: (answers) => answers.expect_future_medical === 'yes',
    },
    {
      id: 'missed_work',
      type: 'yes_no',
      prompt: 'Have you missed work because of your injury?',
    },
    {
      id: 'lost_wages',
      type: 'text',
      prompt: 'How much have you lost in wages so far?',
      placeholder: '$0',
      helpText:
        'Calculate: (hourly rate or daily pay) × days missed. Include bonuses, overtime, and benefits you would have earned.',
      showIf: (answers) => answers.missed_work === 'yes',
    },
    {
      id: 'injury_severity',
      type: 'single_choice',
      prompt: 'How severe is your injury?',
      helpText:
        'This determines the multiplier used to estimate pain and suffering damages.',
      options: [
        {
          value: 'minor',
          label: 'Minor — Soft tissue (sprains, strains, whiplash), full recovery expected',
        },
        {
          value: 'moderate',
          label: 'Moderate — Broken bones, surgery required, 3–6 month recovery',
        },
        {
          value: 'severe',
          label: 'Severe — Permanent injury, disability, chronic pain',
        },
        {
          value: 'catastrophic',
          label: 'Catastrophic — TBI, paralysis, amputation, loss of organ function',
        },
      ],
    },
    {
      id: 'damages_calculation',
      type: 'info',
      prompt: '', // Populated dynamically via generateSummary; placeholder for step display
      showIf: (answers) => {
        // Show once we have enough info to calculate
        return !!answers.injury_severity && !!answers.medical_expenses
      },
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    const medicalExpenses = parseDollars(answers.medical_expenses)
    const futureMedical = parseDollars(answers.future_medical_cost)
    const lostWages = parseDollars(answers.lost_wages)
    const severity = (answers.injury_severity || 'minor') as InjurySeverity

    if (medicalExpenses > 0) {
      items.push({
        status: 'done',
        text: `Medical expenses documented: ${formatDollars(medicalExpenses)}`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Gather all medical bills and document total expenses.',
      })
    }

    if (answers.expect_future_medical === 'yes') {
      if (futureMedical > 0) {
        items.push({
          status: 'done',
          text: `Future medical estimate: ${formatDollars(futureMedical)}`,
        })
      } else {
        items.push({
          status: 'needed',
          text: 'Get a written estimate from your doctor for future treatment costs.',
        })
      }
    }

    if (answers.missed_work === 'yes') {
      if (lostWages > 0) {
        items.push({
          status: 'done',
          text: `Lost wages documented: ${formatDollars(lostWages)}`,
        })
      } else {
        items.push({
          status: 'needed',
          text: 'Calculate and document your lost wages with pay stubs or employer letter.',
        })
      }
    }

    // Run the calculation if we have enough data
    if (answers.injury_severity && medicalExpenses > 0) {
      try {
        const result = calculatePIDamages({
          medicalExpenses,
          futureMedicalEstimate: futureMedical,
          lostWages,
          futureLostEarnings: 0,
          propertyDamage: 0,
          injurySeverity: severity,
        })

        items.push({
          status: 'info',
          text: `Economic damages (specials): ${formatDollars(result.economicDamages)}`,
        })
        items.push({
          status: 'info',
          text: `Pain & suffering multiplier (${severity}): ${result.painSufferingMultiplier}x → ${formatDollars(result.painSufferingEstimate)}`,
        })
        items.push({
          status: 'info',
          text: `Total demand range: ${formatDollars(result.totalDemandRange.low)} – ${formatDollars(result.totalDemandRange.high)}`,
        })
      } catch {
        items.push({
          status: 'needed',
          text: 'Complete the questions above to calculate your damages estimate.',
        })
      }
    } else {
      items.push({
        status: 'needed',
        text: 'Complete the questions above to calculate your damages estimate.',
      })
    }

    return items
  },
}
