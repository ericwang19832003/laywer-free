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

const PROPERTY_DAMAGE_ONLY_SUBTYPES = new Set([
  'vehicle_damage',
  'property_damage',
  'property_damage_negligence',
  'vandalism',
  'other_property_damage',
])

export function createPiDamagesCalculationConfig(piSubType?: string): GuidedStepConfig {
  const isPropertyDamageOnly = !!piSubType && PROPERTY_DAMAGE_ONLY_SUBTYPES.has(piSubType)

  return {
  title: 'Calculating Your Damages',
  reassurance:
    'Understanding what your case is worth helps you negotiate from strength — not desperation.',

  questions: [
    {
      id: 'damages_intro',
      type: 'info',
      prompt: isPropertyDamageOnly
        ? 'PROPERTY DAMAGE — what you may recover:\n\n1. REPAIR OR REPLACEMENT COST (pick one):\n   • Repairable → get 2–3 written estimates; courts use a reasonable estimate\n   • Totaled/destroyed → fair market value just before the incident (not repair cost)\n\n2. DIMINISHED VALUE (repaired property only):\n   The drop in market value even after repair — e.g., a car\'s CarFax now shows an accident. Requires a written appraisal or dealer estimate. Does not apply if you claimed replacement value.\n\n3. LOSS OF USE:\n   Actual rental or substitute costs you paid while your property was out of service. Keep receipts. If you didn\'t rent, you may still claim a reasonable daily amount.\n\n4. TOWING & STORAGE (if applicable):\n   Tow fees and storage yard charges are separately recoverable — include receipts.\n\nYour demand = repair OR replacement cost + any applicable items above that you can document.'
        : 'DAMAGES ARE WHAT THE LAW SAYS YOU\'RE OWED.\n\nTwo types:\n1. ECONOMIC (specials): Medical bills, lost wages, property damage — things with receipts\n2. NON-ECONOMIC (generals): Pain, suffering, mental anguish, loss of enjoyment — things without receipts\n\nYour total demand = Economic damages + Non-economic damages.\n\nThere is no legal formula for non-economic damages — a judge or jury decides a fair amount based on the evidence. Document how your injury affected your daily life: activities you can no longer do, medical appointments, pain levels, time missed with family. The more specific and concrete, the more persuasive.',
    },
    {
      id: 'medical_expenses',
      type: 'text',
      prompt: 'What are your total medical expenses so far?',
      placeholder: '$0',
      helpText:
        'Include ER visits, surgery, physical therapy, prescriptions, and any other medical costs related to the injury.',
      showIf: () => !isPropertyDamageOnly,
    },
    {
      id: 'expect_future_medical',
      type: 'yes_no',
      prompt: 'Do you expect future medical treatment?',
      helpText:
        'This includes follow-up surgeries, ongoing physical therapy, future prescriptions, or long-term care.',
      showIf: () => !isPropertyDamageOnly,
    },
    {
      id: 'future_medical_cost',
      type: 'text',
      prompt: 'What is your estimated cost of future medical treatment?',
      placeholder: '$0',
      helpText:
        'Ask your doctor for an estimate. Include ongoing therapy, future surgeries, and long-term medication costs.',
      showIf: (answers) => !isPropertyDamageOnly && answers.expect_future_medical === 'yes',
    },
    {
      id: 'missed_work',
      type: 'yes_no',
      prompt: 'Have you missed work because of your injury?',
      showIf: () => !isPropertyDamageOnly,
    },
    {
      id: 'lost_wages',
      type: 'text',
      prompt: 'How much have you lost in wages so far?',
      placeholder: '$0',
      helpText:
        'Calculate: (hourly rate or daily pay) × days missed. Include bonuses, overtime, and benefits you would have earned.',
      showIf: (answers) => !isPropertyDamageOnly && answers.missed_work === 'yes',
    },
    {
      id: 'injury_severity',
      type: 'single_choice',
      prompt: 'How severe is your injury?',
      helpText:
        'Insurance adjusters typically use a multiplier of your economic damages as a starting point for settlement negotiations. This is an industry benchmark — not a legal formula. Courts award whatever the evidence supports.',
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
      showIf: () => !isPropertyDamageOnly,
    },
    {
      id: 'repair_cost',
      type: 'text',
      prompt: 'What is the repair or replacement cost of the damaged property?',
      placeholder: '$0',
      helpText: 'Enter the highest estimate you have. You\'ll need at least one written estimate from a licensed professional.',
      showIf: () => isPropertyDamageOnly,
    },
    {
      id: 'has_diminished_value',
      type: 'yes_no',
      prompt: 'Is the property worth less now even after repair?',
      helpText: 'This is "diminished value" — e.g., a repaired car that sells for less than an identical undamaged car.',
      notApplicable: 'Not applicable — I\'m claiming replacement value, not repair cost',
      showIf: () => isPropertyDamageOnly,
    },
    {
      id: 'diminished_value',
      type: 'text',
      prompt: 'How much has the property lost in value?',
      placeholder: '$0',
      helpText: 'Get a written appraisal or use the difference between pre-damage and post-repair market values.',
      showIf: (answers) => isPropertyDamageOnly && answers.has_diminished_value === 'yes',
    },
    {
      id: 'has_loss_of_use',
      type: 'yes_no',
      prompt: 'Did you incur rental or temporary replacement costs while the property was being repaired?',
      showIf: () => isPropertyDamageOnly,
    },
    {
      id: 'loss_of_use_cost',
      type: 'text',
      prompt: 'How much did you spend on rental or temporary replacement?',
      placeholder: '$0',
      helpText: 'Include rental car receipts, equipment rental, or any other temporary replacement costs.',
      showIf: (answers) => isPropertyDamageOnly && answers.has_loss_of_use === 'yes',
    },
    {
      id: 'damages_calculation',
      type: 'info',
      prompt: '', // Populated dynamically via generateSummary; placeholder for step display
      showIf: (answers) => {
        if (isPropertyDamageOnly) return !!answers.repair_cost
        return !!answers.injury_severity && !!answers.medical_expenses
      },
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (isPropertyDamageOnly) {
      const repairCost = parseDollars(answers.repair_cost)
      const diminishedValue = parseDollars(answers.diminished_value)
      const lossOfUse = parseDollars(answers.loss_of_use_cost)

      if (repairCost > 0) {
        items.push({ status: 'done', text: `Repair/replacement cost: ${formatDollars(repairCost)}` })
      } else {
        items.push({ status: 'needed', text: 'Get written repair/replacement estimates from a licensed professional.' })
      }

      if (answers.has_diminished_value === 'yes') {
        if (diminishedValue > 0) {
          items.push({ status: 'done', text: `Diminished value: ${formatDollars(diminishedValue)}` })
        } else {
          items.push({ status: 'needed', text: 'Get an appraisal to document diminished value.' })
        }
      } else if (answers.has_diminished_value === 'na') {
        items.push({ status: 'done', text: 'Diminished value not applicable — claiming replacement value.' })
      }

      if (answers.has_loss_of_use === 'yes') {
        if (lossOfUse > 0) {
          items.push({ status: 'done', text: `Loss of use costs: ${formatDollars(lossOfUse)}` })
        } else {
          items.push({ status: 'needed', text: 'Document rental or temporary replacement receipts.' })
        }
      }

      const total = repairCost + diminishedValue + lossOfUse
      if (total > 0) {
        items.push({ status: 'info', text: `Estimated total demand: ${formatDollars(total)}` })
      }

      return items
    }

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
          text: `Insurance settlement benchmark — non-economic damages (${severity}, ${result.painSufferingMultiplier}x economic): ~${formatDollars(result.painSufferingEstimate)}`,
        })
        items.push({
          status: 'info',
          text: `Estimated demand range (negotiation starting point, not a legal entitlement): ${formatDollars(result.totalDemandRange.low)} – ${formatDollars(result.totalDemandRange.high)}`,
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
}

export const piDamagesCalculationConfig = createPiDamagesCalculationConfig()
