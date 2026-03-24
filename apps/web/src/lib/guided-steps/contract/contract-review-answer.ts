import type { GuidedStepConfig } from '../types'

export const contractReviewAnswerConfig: GuidedStepConfig = {
  title: 'Review the Opposing Answer',
  reassurance:
    'Understanding the defendant\'s response to your contract claim helps you prepare your case strategy and anticipate their arguments at trial.',

  questions: [
    {
      id: 'denial_type',
      type: 'single_choice',
      prompt: 'Did the defendant file a general denial or specific denials?',
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
        'A general denial means the defendant denies everything. You will need to prove: (1) a valid contract existed, (2) you performed your obligations, (3) the defendant breached, and (4) you suffered damages.',
      showIf: (answers) => answers.denial_type === 'general',
    },
    {
      id: 'specific_denial_info',
      type: 'info',
      prompt:
        'Specific denials mean the defendant only disputes certain facts. Look carefully at what they admit vs. deny. For example, they may admit the contract exists but deny they breached it, which narrows the issues for trial.',
      showIf: (answers) => answers.denial_type === 'specific',
    },
    {
      id: 'denial_help_info',
      type: 'info',
      prompt:
        'Look at the first page of the answer. If it says "Defendant generally denies each and every allegation," that\'s a general denial. If it addresses specific paragraphs, those are specific denials.',
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
      prompt: 'Which affirmative defense did they raise? (select the primary one)',
      showIf: (answers) => answers.affirmative_defenses === 'yes',
      options: [
        { value: 'statute_of_limitations', label: 'Statute of limitations' },
        { value: 'prior_material_breach', label: 'Prior material breach (by you)' },
        { value: 'impossibility', label: 'Impossibility / impracticability' },
        { value: 'fraud_duress', label: 'Fraud / duress / unconscionability' },
        { value: 'waiver', label: 'Waiver / estoppel' },
        { value: 'other', label: 'Other defense' },
      ],
    },
    {
      id: 'prior_breach_info',
      type: 'info',
      prompt:
        'If they claim you breached first, gather evidence that you performed your obligations under the contract. Emails, receipts, and delivery records are especially useful for rebutting this defense.',
      showIf: (answers) => answers.which_defenses === 'prior_material_breach',
    },
    {
      id: 'sol_info',
      type: 'info',
      prompt:
        'In Texas, the statute of limitations is 4 years for written contracts and 4 years for oral contracts. Calculate from the date of the breach, not the date the contract was signed.',
      showIf: (answers) => answers.which_defenses === 'statute_of_limitations',
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
        'A counterclaim means the defendant is suing you back for breach of contract. You generally have 30 days to respond. Review their counterclaim carefully and gather evidence to refute their claims.',
      showIf: (answers) => answers.counterclaim === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.denial_type === 'general') {
      items.push({ status: 'info', text: 'Defendant filed a general denial. You must prove all four elements of breach of contract.' })
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

    items.push({ status: 'done', text: 'Answer reviewed. Proceed to discovery.' })

    return items
  },
}
