import type { GuidedStepConfig } from '../types'
import { isPropertyDamageSubType } from './constants'

const bodilyInjuryExpertWitnessGuideConfig: GuidedStepConfig = {
  title: 'Do You Need Expert Witnesses?',
  reassurance:
    'Three quick questions. Your answers determine exactly which experts (if any) you need — and we\'ll show you affordable options.',

  questions: [
    {
      id: 'liability_disputed',
      type: 'single_choice',
      prompt: 'Is there a dispute about who caused the accident?',
      helpText: 'If a police report or admission clearly shows the other party was at fault, you likely won\'t need a liability expert.',
      options: [
        { value: 'no', label: 'No — fault is clear or admitted', description: 'Police report, witnesses, or the other party already acknowledged fault.' },
        { value: 'yes', label: 'Yes — the other side disputes fault', description: 'The other driver or their insurer is blaming you or denying responsibility.' },
        { value: 'unsure', label: 'Not sure yet', description: 'Fault hasn\'t been clearly established.' },
      ],
    },
    {
      id: 'accident_reconstruction_info',
      type: 'info',
      prompt:
        "ACCIDENT RECONSTRUCTION EXPERT\nAn accident reconstruction expert analyzes physical evidence — skid marks, vehicle damage, road conditions, sight lines — to determine who was at fault.\n• Best for: Multi-vehicle accidents, hit-and-runs with physical evidence, no-witness disputes\n• Typical cost: $2,000–$5,000 for a report; $3,000–$5,000+ for trial testimony\n• Budget option: Retired highway patrol officers often do reconstruction at $1,500–$2,500\n• Where to find: University engineering departments, retired law enforcement, professional engineering firms",
      acknowledgeLabel: 'Got it — I\'ll look into a reconstruction expert →',
      showIf: (answers) => answers.liability_disputed === 'yes' || answers.liability_disputed === 'unsure',
    },
    {
      id: 'causation_concern',
      type: 'single_choice',
      prompt: 'Do you have any prior injuries or health conditions in the same area that was hurt?',
      helpText: 'The defense commonly argues injuries were "pre-existing." If you had prior issues in the same body part, a medical expert can clarify what the accident actually caused.',
      options: [
        { value: 'no', label: 'No — this area was healthy before the accident', description: 'No prior injuries, surgeries, or conditions affecting the same body part.' },
        { value: 'yes', label: 'Yes — I had prior issues in the same area', description: 'A medical expert can explain what the accident worsened or newly caused.' },
        { value: 'unsure', label: 'Not sure — the defense might argue it anyway', description: 'Minor gap in treatment, a low-impact crash, or any reason they might push back.' },
      ],
    },
    {
      id: 'medical_expert_info',
      type: 'info',
      prompt:
        "MEDICAL EXPERT (CAUSATION)\nA medical expert reviews your records and testifies that your injuries were caused (or worsened) by the accident — not by a pre-existing condition.\n• Best for: Prior injuries to the same area, low-impact accidents with significant injuries, complex diagnoses\n• Typical cost: $1,500–$3,000 for a records review and written report; $2,500–$5,000 for deposition or trial\n• Cheapest option: Your treating doctor already knows your case — ask if they'll write a causation letter or testify\n• Without this: The defense may seek summary judgment arguing there's no expert evidence linking the accident to your injuries",
      acknowledgeLabel: 'Got it — I\'ll contact my treating doctor first →',
      showIf: (answers) => answers.causation_concern === 'yes' || answers.causation_concern === 'unsure',
    },
    {
      id: 'lost_earning_capacity',
      type: 'single_choice',
      prompt: 'Have your injuries affected your ability to work or earn income going forward?',
      helpText: 'This covers lost earning capacity — long-term or permanent impacts, not just time off work while recovering.',
      options: [
        { value: 'no', label: 'No — I\'ve fully recovered or expect to return to my previous work', description: 'Short-term missed work while healing, but no lasting impact on earning ability.' },
        { value: 'yes', label: 'Yes — I can\'t return to my previous job or my earning ability is reduced', description: 'Permanent disability, career change, or significant ongoing limitations.' },
        { value: 'unsure', label: 'I\'m still figuring this out', description: 'Still in treatment or unclear about long-term impact.' },
      ],
    },
    {
      id: 'vocational_expert_info',
      type: 'info',
      prompt:
        "VOCATIONAL EXPERT (LOST EARNING CAPACITY)\nA vocational expert evaluates your education, work history, skills, and physical limitations to calculate how the injury affects your future earning ability.\n• Best for: Permanent disability, required career change, significant ongoing limitations\n• Typical cost: $2,000–$4,000 for evaluation and report\n• Where to find: Vocational rehabilitation counselors, university professors in rehabilitation or economics\n• What they calculate: Pre-injury earning capacity vs. post-injury capacity × remaining work-life expectancy\n• Without this: The jury has no framework for future lost earnings and often underestimates",
      acknowledgeLabel: 'Got it — I\'ll find a vocational expert →',
      showIf: (answers) => answers.lost_earning_capacity === 'yes' || answers.lost_earning_capacity === 'unsure',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.liability_disputed === 'yes') {
      items.push({
        status: 'needed',
        text: 'Fault is disputed — consider an accident reconstruction expert ($2,000–$5,000 for a report). Retired highway patrol officers are a budget option.',
      })
    } else if (answers.liability_disputed === 'unsure') {
      items.push({
        status: 'needed',
        text: 'Fault isn\'t established yet — monitor closely. If the other side disputes it, you\'ll likely need a reconstruction expert.',
      })
    } else {
      items.push({
        status: 'done',
        text: 'Fault is clear — an accident reconstruction expert is probably not needed.',
      })
    }

    if (answers.causation_concern === 'yes' || answers.causation_concern === 'unsure') {
      items.push({
        status: 'needed',
        text: 'Causation may be challenged — contact your treating doctor first. Ask if they\'ll write a causation letter or testify. This is your most affordable expert option.',
      })
    } else {
      items.push({
        status: 'done',
        text: 'No prior injuries in the affected area — a causation expert may not be necessary unless the defense raises it.',
      })
    }

    if (answers.lost_earning_capacity === 'yes') {
      items.push({
        status: 'needed',
        text: 'Claiming lost earning capacity — a vocational expert ($2,000–$4,000) can quantify future losses. Without one, the jury must estimate, and they usually underestimate.',
      })
    } else if (answers.lost_earning_capacity === 'unsure') {
      items.push({
        status: 'info',
        text: 'Earning impact is unclear — hold off on a vocational expert for now, but revisit once treatment is complete and your prognosis is known.',
      })
    } else {
      items.push({
        status: 'done',
        text: 'No permanent earning impact claimed — a vocational expert is not needed.',
      })
    }

    items.push({
      status: 'info',
      text: 'Finding experts affordably: University professors ($1,500–$3,000), retired professionals, and your treating physician. Many experts in PI cases defer payment until settlement — ask.',
    })

    return items
  },
}

const propertyDamageExpertWitnessGuideConfig: GuidedStepConfig = {
  title: 'Do You Need Expert Witnesses?',
  reassurance:
    'Three questions about your property damage dispute. Your answers will show which experts (if any) you need and affordable ways to find them.',

  questions: [
    {
      id: 'repair_disputed',
      type: 'single_choice',
      prompt: 'Is the other side disputing your repair cost or replacement estimate?',
      helpText: 'Common when the insurer offers much less than your repair estimate, or the defendant claims the damage was minor.',
      options: [
        { value: 'no', label: 'No — the repair cost is agreed upon', description: 'The other side accepted your estimate.' },
        { value: 'yes', label: 'Yes — they\'re disputing the amount or necessity of repairs', description: 'Independent estimates can counter their position.' },
        { value: 'unsure', label: 'Not settled yet', description: 'Still in negotiation.' },
      ],
    },
    {
      id: 'repair_expert_info',
      type: 'info',
      prompt:
        "REPAIR COST EXPERT\nAn independent appraiser or estimator inspects the damage and explains the reasonable cost of repair or replacement.\n• Vehicle damage: independent auto appraiser, body shop estimator, or mechanic\n• Home or property: licensed contractor, engineer, remediation specialist, or inspector\n• Typical cost: $250–$1,500 for an estimate or report\n• Budget option: Get 2–3 written estimates from independent shops and ask each whether they can testify if needed",
      acknowledgeLabel: 'Got it — I\'ll get independent estimates →',
      showIf: (answers) => answers.repair_disputed === 'yes' || answers.repair_disputed === 'unsure',
    },
    {
      id: 'diminished_value',
      type: 'single_choice',
      prompt: 'Is the property worth less now, even after repairs?',
      helpText: 'Known as "diminished value" — a repaired vehicle with accident history, or a house with a disclosed structural repair, is often worth less on the market.',
      options: [
        { value: 'no', label: 'No — repairs fully restored the value', description: 'No loss in market value after repairs.' },
        { value: 'yes', label: 'Yes — it\'s worth less even though it\'s repaired', description: 'An appraiser can document and quantify this loss.' },
        { value: 'unsure', label: 'I\'m not sure', description: 'An appraiser can assess this for you.' },
      ],
    },
    {
      id: 'appraiser_info',
      type: 'info',
      prompt:
        "DIMINISHED VALUE APPRAISER\nAn appraiser compares the property\'s pre-damage value to its current value, accounting for the repair history.\n• Vehicle: diminished value appraiser or licensed independent adjuster\n• Real property: licensed real estate appraiser or broker price opinion\n• Typical cost: $300–$1,500 for a report\n• Bring: photos, repair invoices, prior condition records, market listings, and any insurer valuation",
      acknowledgeLabel: 'Got it — I\'ll get a diminished value appraisal →',
      showIf: (answers) => answers.diminished_value === 'yes' || answers.diminished_value === 'unsure',
    },
    {
      id: 'causation_disputed',
      type: 'single_choice',
      prompt: 'Is the other side arguing the damage was already there, unrelated, or caused by wear and tear?',
      helpText: 'If the defendant or insurer is claiming the damage predates the incident, or isn\'t related to it, a causation expert can counter that.',
      options: [
        { value: 'no', label: 'No — they agree the incident caused this damage', description: 'Causation is not in dispute.' },
        { value: 'yes', label: 'Yes — they\'re blaming prior damage or normal wear', description: 'An expert can connect the damage pattern to the incident.' },
        { value: 'unsure', label: 'Not clear yet', description: 'They haven\'t taken a clear position.' },
      ],
    },
    {
      id: 'causation_expert_info',
      type: 'info',
      prompt:
        "CAUSATION EXPERT\nA causation expert explains how the incident produced the specific damage pattern observed, distinguishing incident damage from prior wear and tear.\n• Vehicle cases: accident reconstruction expert, mechanic, or auto damage analyst\n• Building/property: engineer, contractor, remediation specialist, or inspector\n• Best evidence to gather now: before/after photos, maintenance records, repair invoices, weather or incident reports, witness statements\n• Budget option: A detailed written estimate explaining causation may be sufficient for negotiation even without a formal retained expert",
      acknowledgeLabel: 'Got it — I\'ll start gathering causation evidence →',
      showIf: (answers) => answers.causation_disputed === 'yes' || answers.causation_disputed === 'unsure',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.repair_disputed === 'yes') {
      items.push({
        status: 'needed',
        text: 'Repair cost is disputed — get 2–3 independent written estimates. Ask each estimator if they can testify. Cost: typically $250–$1,500.',
      })
    } else if (answers.repair_disputed === 'unsure') {
      items.push({
        status: 'info',
        text: 'Repair cost negotiations are ongoing — get independent estimates now so you\'re ready if they dispute the amount.',
      })
    } else {
      items.push({
        status: 'done',
        text: 'Repair cost agreed — a repair expert may not be needed.',
      })
    }

    if (answers.diminished_value === 'yes' || answers.diminished_value === 'unsure') {
      items.push({
        status: 'needed',
        text: 'Diminished value claim — get a written appraisal. Cost: $300–$1,500. Bring photos, repair invoices, and market listings.',
      })
    } else {
      items.push({
        status: 'done',
        text: 'No diminished value claim — an appraiser is not needed for that issue.',
      })
    }

    if (answers.causation_disputed === 'yes' || answers.causation_disputed === 'unsure') {
      items.push({
        status: 'needed',
        text: 'Causation may be challenged — gather before/after photos, maintenance records, and incident reports now. A written estimate explaining causation may be enough for negotiation.',
      })
    } else {
      items.push({
        status: 'done',
        text: 'Causation not disputed — photos, receipts, and estimates should be sufficient.',
      })
    }

    items.push({
      status: 'info',
      text: 'Start with professionals already involved: your repair shop, contractor, inspector, or adjuster. Ask for a written report explaining scope, cause, and cost in plain language.',
    })

    return items
  },
}

export function createPiExpertWitnessGuideConfig(piSubType?: string): GuidedStepConfig {
  return isPropertyDamageSubType(piSubType)
    ? propertyDamageExpertWitnessGuideConfig
    : bodilyInjuryExpertWitnessGuideConfig
}

export const piExpertWitnessGuideConfig = createPiExpertWitnessGuideConfig()
