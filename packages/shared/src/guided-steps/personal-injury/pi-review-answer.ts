import type { GuidedStepConfig } from '../types'

export const piReviewAnswerConfig: GuidedStepConfig = {
  title: 'Review the Opposing Answer',
  reassurance:
    'Understanding the defendant\'s answer helps you prepare your case strategy. We\'ll walk through what to look for.',

  questions: [
    {
      id: 'denial_type',
      type: 'single_choice',
      prompt: 'Did opposing counsel file a general denial or specific denials?',
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
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

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

    items.push({ status: 'done', text: 'Answer reviewed. Proceed to discovery.' })

    return items
  },
}
