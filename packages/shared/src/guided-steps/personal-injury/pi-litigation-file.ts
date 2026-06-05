import { isPropertyDamageSubType } from './constants'

export type PiLitigationJurisdiction = 'state' | 'federal' | 'unknown'

export interface PiLitigationStage {
  id: string
  stageNumber: number
  title: string
  taskKey: string
  category: string
  deadlineLabel: string
  assistantFocus: string
  requiredFacts: string[]
  jurisdictionNote: string
}

export function isPiPropertyDamageSubtype(piSubType?: string | null): boolean {
  return isPropertyDamageSubType(piSubType ?? undefined)
}

export function getPropertyDamageDiscoveryRequests(): string[] {
  return [
    'Interrogatory: state every fact supporting any denial that the defendant was at fault for the property damage incident.',
    'Interrogatory: identify all witnesses, photos, estimates, appraisals, or inspections the defendant relies on to dispute repair costs.',
    'Interrogatory: explain the basis for any claim that the repair or replacement amount is excessive or unsupported.',
    'Request for production: produce photos, videos, appraisals, repair estimates, invoices, and payment records for either damaged property item or vehicle.',
    'Request for production: produce communications with any insurer or adjuster about the incident, claim, repair cost, or property valuation.',
    'Request for admission: admit the defendant was operating or controlling the property or vehicle involved in the incident.',
    'Request for admission: admit the traffic signal, sign, or relevant safety control was functioning normally if that fact matters to liability.',
  ]
}

export function getPiLitigationStages(
  piSubType?: string | null,
  jurisdiction: PiLitigationJurisdiction = 'unknown'
): PiLitigationStage[] {
  const isPropertyDamage = isPiPropertyDamageSubtype(piSubType)
  const subject = isPropertyDamage ? 'property damage' : 'personal injury'
  const disclosureNote = jurisdiction === 'federal'
    ? 'Federal court: build around Rule 26(f), initial disclosures, and a joint discovery plan.'
    : jurisdiction === 'state'
      ? 'Texas state-court path: use state disclosure and discovery rules instead of assuming federal Rule 26(f).'
      : 'Confirm the court type before applying federal Rule 26(f) or state-court discovery deadlines.'

  return [
    {
      id: 'await_answer',
      stageNumber: 1,
      title: 'Await the Defendant Answer',
      taskKey: 'pi_wait_for_answer',
      category: 'Litigation - pleadings',
      deadlineLabel: 'Answer due after service',
      assistantFocus: 'Track the answer deadline and flag default-judgment options if no answer appears.',
      requiredFacts: [
        'file-stamped petition date',
        'court case number',
        'service completion date',
        'service method',
        'defendant served',
      ],
      jurisdictionNote: 'The answer deadline starts from service, not from the petition drafting date.',
    },
    {
      id: 'review_answer',
      stageNumber: 2,
      title: 'Review the Defendant Answer',
      taskKey: 'pi_review_answer',
      category: 'Litigation - pleadings',
      deadlineLabel: 'Counterclaim response deadline if one was filed',
      assistantFocus: 'Separate admissions, denials, affirmative defenses, counterclaims, and discovery targets.',
      requiredFacts: ['defendant answer upload', 'filing date', 'service method for the answer'],
      jurisdictionNote: 'If the answer includes a counterclaim, create a response deadline before discovery planning.',
    },
    {
      id: 'plan_disclosures_discovery',
      stageNumber: 3,
      title: 'Plan Disclosures and Discovery',
      taskKey: 'pi_scheduling_conference',
      category: 'Litigation - case management',
      deadlineLabel: 'Court-specific disclosure or conference deadline',
      assistantFocus: `Prepare the first litigation plan for the ${subject} issues that remain disputed.`,
      requiredFacts: ['court type', 'scheduling order if any', 'known witnesses', 'core documents'],
      jurisdictionNote: disclosureNote,
    },
    {
      id: 'draft_discovery',
      stageNumber: 4,
      title: 'Draft Discovery Requests',
      taskKey: 'pi_discovery_prep',
      category: 'Litigation - discovery',
      deadlineLabel: 'Responses usually due after service of requests',
      assistantFocus: isPropertyDamage
        ? 'Draft targeted questions and document requests about fault, repair cost, valuation, photos, and insurer communications.'
        : 'Draft targeted questions and document requests about fault, causation, damages, medical records, and witnesses.',
      requiredFacts: ['disputed facts from answer', 'damages computation', 'evidence list'],
      jurisdictionNote: 'Discovery requests should be drafted from the defendant denials, not from a generic checklist.',
    },
    {
      id: 'review_discovery_responses',
      stageNumber: 5,
      title: 'Review Discovery Responses',
      taskKey: 'pi_discovery_responses',
      category: 'Litigation - discovery',
      deadlineLabel: 'Meet-and-confer deadline before motion practice',
      assistantFocus: 'Flag evasive answers, boilerplate objections, missing documents, privilege-log gaps, and useful admissions.',
      requiredFacts: ['served discovery requests', 'opposing responses', 'production index', 'date received'],
      jurisdictionNote: 'Only deficient responses should move forward into a motion to compel.',
    },
    {
      id: 'motion_to_compel',
      stageNumber: 6,
      title: 'Prepare Motion to Compel',
      taskKey: 'pi_pretrial_motions',
      category: 'Litigation - motion practice',
      deadlineLabel: 'Motion deadline from scheduling order or local rule',
      assistantFocus: 'Build one argument per selected deficiency, with meet-and-confer certification and requested relief.',
      requiredFacts: ['selected deficiencies', 'meet-and-confer record', 'requested relief'],
      jurisdictionNote: 'Use court-specific motion rules and local rules before generating a filing-ready motion.',
    },
  ]
}
