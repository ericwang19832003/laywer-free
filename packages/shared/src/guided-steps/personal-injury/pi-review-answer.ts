import type { GuidedStepConfig } from '../types'
import { isPiPropertyDamageSubtype } from './pi-litigation-file'

export function createPiReviewAnswerConfig(piSubType?: string | null): GuidedStepConfig {
  const isPropertyDamage = isPiPropertyDamageSubtype(piSubType)
  const disputedDamages = isPropertyDamage
    ? 'repair cost, replacement value, diminished value, loss of use, or mitigation'
    : 'medical causation, treatment, lost wages, pain and suffering, or mitigation'

  return {
    title: 'Review the Defendant Answer',
    reassurance:
      'Upload or review the defendant answer like a litigation file: admissions, denials, affirmative defenses, counterclaims, and the exact issues discovery should target.',

    questions: [
      {
        id: 'answer_uploaded',
        type: 'yes_no',
        prompt: 'Do you have the defendant answer saved or uploaded?',
      },
      {
        id: 'answer_upload_info',
        type: 'info',
        prompt:
          'Save the answer before continuing. The strongest next steps come from the actual document: what they admitted, what they denied, and whether they sued you back.',
        showIf: (answers) => answers.answer_uploaded === 'no',
      },
      {
        id: 'denial_type',
        type: 'single_choice',
        prompt: 'Did opposing counsel file a general denial or specific denials?',
        showIf: (answers) => answers.answer_uploaded === 'yes',
        options: [
          { value: 'general', label: 'General denial' },
          { value: 'specific', label: 'Specific denials' },
          { value: 'not_sure', label: 'I\'m not sure' },
        ],
      },
      {
        id: 'general_denial_info',
        type: 'info',
        prompt:
          'A general denial means the defendant denies everything in your petition. This is common and means you\'ll need to prove each element of your claim at trial.',
        showIf: (answers) => answers.denial_type === 'general',
      },
      {
        id: 'specific_denial_info',
        type: 'info',
        prompt:
          'Specific denials mean the defendant only disputes certain facts. Look carefully at what they admit vs. deny — admissions can simplify your case.',
        showIf: (answers) => answers.denial_type === 'specific',
      },
      {
        id: 'denial_help_info',
        type: 'info',
        prompt:
          'Look at the first page of the answer document. If it says "Defendant generally denies each and every allegation," that\'s a general denial. If it addresses specific paragraphs of your petition, those are specific denials.',
        showIf: (answers) => answers.denial_type === 'not_sure',
      },
      {
        id: 'affirmative_defenses',
        type: 'single_choice',
        prompt: 'Did they raise any affirmative defenses?',
        showIf: (answers) => answers.answer_uploaded === 'yes',
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
          { value: 'not_sure', label: 'I\'m not sure' },
        ],
      },
      {
        id: 'which_defenses',
        type: 'single_choice',
        prompt: 'Which affirmative defenses did they raise? (select the primary one)',
        showIf: (answers) => answers.affirmative_defenses === 'yes',
        options: [
          { value: 'contributory_negligence', label: 'Contributory/comparative negligence' },
          { value: 'assumption_of_risk', label: 'Assumption of risk' },
          { value: 'statute_of_limitations', label: 'Statute of limitations' },
          { value: 'failure_to_mitigate', label: 'Failure to mitigate damages' },
          { value: 'other', label: 'Other defense' },
        ],
      },
      {
        id: 'contributory_info',
        type: 'info',
        prompt:
          'Contributory negligence means they claim you were partly at fault. In Texas, you can still recover damages as long as you\'re less than 51% at fault, but your award is reduced by your percentage of fault.',
        showIf: (answers) => answers.which_defenses === 'contributory_negligence',
      },
      {
        id: 'counterclaim',
        type: 'yes_no',
        prompt: 'Did they file a counterclaim against you?',
        showIf: (answers) => answers.answer_uploaded === 'yes',
      },
      {
        id: 'counterclaim_info',
        type: 'info',
        prompt:
          'A counterclaim means the defendant is suing you back. You generally have 30 days to respond to the counterclaim. Consider consulting an attorney if the counterclaim involves significant damages.',
        showIf: (answers) => answers.counterclaim === 'yes',
      },
      {
        id: 'special_exceptions',
        type: 'single_choice',
        prompt: 'Did they file special exceptions (challenges to your petition\'s form)?',
        showIf: (answers) => answers.answer_uploaded === 'yes',
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
          { value: 'not_sure', label: 'I\'m not sure' },
        ],
      },
      {
        id: 'special_exceptions_info',
        type: 'info',
        prompt:
          'Special exceptions challenge the form of your petition — they\'re saying your petition isn\'t specific enough. You may need to amend your petition to address these. The court will typically give you a chance to fix any issues.',
        showIf: (answers) => answers.special_exceptions === 'yes',
      },
      {
        id: 'damages_disputed',
        type: 'yes_no',
        prompt: `Does the answer dispute your ${disputedDamages}?`,
        showIf: (answers) => answers.answer_uploaded === 'yes',
      },
      {
        id: 'damages_discovery_info',
        type: 'info',
        prompt: isPropertyDamage
          ? 'Make this a discovery focus. Ask for every estimate, appraisal, photo, inspection, repair invoice, insurer note, and factual basis they rely on to dispute your property damage amount.'
          : 'Make this a discovery focus. Ask for the records, experts, photos, witness statements, and factual basis they rely on to dispute causation or damages.',
        showIf: (answers) => answers.damages_disputed === 'yes',
      },
    ],

    generateSummary(answers) {
      const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

      if (answers.answer_uploaded !== 'yes') {
        items.push({ status: 'needed', text: 'Save or upload the defendant answer before building the litigation strategy.' })
        return items
      }

      if (answers.denial_type === 'general') {
        items.push({ status: 'info', text: 'Defendant filed a general denial. You must prove all elements of your claim.' })
      } else if (answers.denial_type === 'specific') {
        items.push({ status: 'info', text: 'Defendant filed specific denials. Focus discovery on the disputed facts.' })
      } else {
        items.push({ status: 'needed', text: 'Review the answer to determine the type of denial filed.' })
      }

      if (answers.affirmative_defenses === 'yes') {
        items.push({ status: 'info', text: `Affirmative defense raised: ${answers.which_defenses?.replace(/_/g, ' ') ?? 'see answer document'}.` })
      }

      if (answers.counterclaim === 'yes') {
        items.push({ status: 'needed', text: 'Respond to the counterclaim within 30 days.' })
      }

      if (answers.special_exceptions === 'yes') {
        items.push({ status: 'needed', text: 'Address special exceptions by amending your petition.' })
      }

      if (answers.damages_disputed === 'yes') {
        items.push({ status: 'needed', text: 'Use discovery to force the defendant to identify the factual basis and documents behind the damages dispute.' })
      }

      items.push({ status: 'done', text: 'Answer reviewed. Proceed to discovery.' })

      return items
    },
  }
}

export const piReviewAnswerConfig: GuidedStepConfig = createPiReviewAnswerConfig()
