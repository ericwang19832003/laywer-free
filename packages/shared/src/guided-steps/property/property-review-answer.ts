import type { GuidedStepConfig } from '../types'

export const propertyReviewAnswerConfig: GuidedStepConfig = {
  title: 'Review the Other Party\'s Answer',
  reassurance:
    'Understanding their answer helps you plan your next steps. We\'ll walk through the key things to look for in a property dispute response.',

  questions: [
    {
      id: 'denial_type',
      type: 'single_choice',
      prompt: 'Did the other party file a general denial or specific denials?',
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
        'A general denial means the other party denies everything in your petition. You will need to prove each element of your property claim at trial, including your ownership or right to the property.',
      showIf: (answers) => answers.denial_type === 'general',
    },
    {
      id: 'specific_denial_info',
      type: 'info',
      prompt:
        'Specific denials mean the other party only disputes certain facts. Pay close attention to what they admit vs. deny about property boundaries, ownership, or damage. Admissions can simplify your case.',
      showIf: (answers) => answers.denial_type === 'specific',
    },
    {
      id: 'denial_help_info',
      type: 'info',
      prompt:
        'Look at the first page of the answer. If it says "Defendant generally denies each and every allegation," that\'s a general denial. If it addresses specific paragraphs about your property claims, those are specific denials.',
      showIf: (answers) => answers.denial_type === 'not_sure',
    },
    {
      id: 'property_defenses',
      type: 'single_choice',
      prompt: 'Did they raise any property-related defenses?',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'not_sure', label: 'I\'m not sure' },
      ],
    },
    {
      id: 'which_defenses',
      type: 'single_choice',
      prompt: 'Which defense did they raise? (select the primary one)',
      showIf: (answers) => answers.property_defenses === 'yes',
      options: [
        { value: 'adverse_possession', label: 'Adverse possession (they claim ownership by long use)' },
        { value: 'prescriptive_easement', label: 'Prescriptive easement (they claim a right to use your land)' },
        { value: 'boundary_by_acquiescence', label: 'Boundary by acquiescence (agreed boundary over time)' },
        { value: 'statute_of_limitations', label: 'Statute of limitations' },
        { value: 'consent', label: 'They had your consent or permission' },
        { value: 'other', label: 'Other defense' },
      ],
    },
    {
      id: 'adverse_possession_info',
      type: 'info',
      prompt:
        'Adverse possession in Texas requires the other party to prove open, notorious, continuous, and hostile possession for a statutory period (typically 10 years, but can be as short as 3 years with a deed). This is a serious defense — gather evidence of your ownership and use of the property.',
      showIf: (answers) => answers.which_defenses === 'adverse_possession',
    },
    {
      id: 'prescriptive_easement_info',
      type: 'info',
      prompt:
        'A prescriptive easement claim means the other party argues they have a right to use part of your property based on long, open, and continuous use without your permission. Evidence of your objections or permission can defeat this claim.',
      showIf: (answers) => answers.which_defenses === 'prescriptive_easement',
    },
    {
      id: 'counterclaim_property',
      type: 'yes_no',
      prompt: 'Did they file a counterclaim about the property?',
    },
    {
      id: 'counterclaim_info',
      type: 'info',
      prompt:
        'A counterclaim means the other party is making their own property claim against you. Common counterclaims in property disputes include: claiming you are the one encroaching, seeking their own quiet title, or claiming you damaged their property. You generally have 30 days to respond.',
      showIf: (answers) => answers.counterclaim_property === 'yes',
    },
    {
      id: 'lis_pendens',
      type: 'yes_no',
      prompt: 'Did the other party file a lis pendens (notice of pending litigation on the property)?',
    },
    {
      id: 'lis_pendens_info',
      type: 'info',
      prompt:
        'A lis pendens puts the public on notice that the property is subject to litigation. This can affect your ability to sell or refinance the property while the case is pending. If the lis pendens is improper, you may be able to have it removed.',
      showIf: (answers) => answers.lis_pendens === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.denial_type === 'general') {
      items.push({ status: 'info', text: 'Other party filed a general denial. You must prove all elements of your property claim.' })
    } else if (answers.denial_type === 'specific') {
      items.push({ status: 'info', text: 'Other party filed specific denials. Focus discovery on the disputed property facts.' })
    } else {
      items.push({ status: 'needed', text: 'Review the answer to determine the type of denial filed.' })
    }

    if (answers.property_defenses === 'yes') {
      items.push({
        status: 'info',
        text: `Property defense raised: ${answers.which_defenses?.replace(/_/g, ' ') ?? 'see answer document'}.`,
      })
    }

    if (answers.counterclaim_property === 'yes') {
      items.push({ status: 'needed', text: 'Respond to the counterclaim within 30 days.' })
    }

    if (answers.lis_pendens === 'yes') {
      items.push({
        status: 'info',
        text: 'A lis pendens has been filed. This may affect your ability to sell or refinance the property.',
      })
    }

    items.push({ status: 'done', text: 'Answer reviewed. Proceed to discovery.' })

    return items
  },
}
