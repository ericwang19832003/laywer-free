import type { GuidedStepConfig } from '../types'

export const piPretrialMotionsConfig: GuidedStepConfig = {
  title: 'Pre-Trial Motions',
  reassurance:
    'Before trial, either side may file motions that can shape or even resolve the case. We\'ll help you understand what to watch for.',

  questions: [
    {
      id: 'msj_filed',
      type: 'single_choice',
      prompt: 'Has the defendant filed a motion for summary judgment?',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'not_sure', label: 'I\'m not sure' },
      ],
    },
    {
      id: 'msj_info',
      type: 'info',
      prompt:
        'A motion for summary judgment is serious — the defendant is asking the court to rule in their favor without a trial. You must respond with evidence (affidavits, depositions, documents) showing there are genuine disputes about the facts. Missing the response deadline could mean losing your case.',
      showIf: (answers) => answers.msj_filed === 'yes',
    },
    {
      id: 'msj_response_status',
      type: 'single_choice',
      prompt: 'Have you filed or do you need to file a response to the motion?',
      showIf: (answers) => answers.msj_filed === 'yes',
      options: [
        { value: 'filed', label: 'Already filed my response' },
        { value: 'working', label: 'Working on it' },
        { value: 'need_help', label: 'I need help understanding this' },
      ],
    },
    {
      id: 'msj_help_info',
      type: 'info',
      prompt:
        'Your response must include evidence that contradicts the defendant\'s claims. Attach affidavits (sworn statements), relevant deposition excerpts, medical records, and other documents. You typically have 21 days to respond in Texas. Consider consulting an attorney for this critical motion.',
      showIf: (answers) => answers.msj_response_status === 'need_help',
    },
    {
      id: 'motions_in_limine',
      type: 'single_choice',
      prompt: 'Are you considering filing motions in limine (to exclude certain evidence)?',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'not_familiar', label: 'I\'m not familiar with these' },
      ],
    },
    {
      id: 'limine_info',
      type: 'info',
      prompt:
        'Motions in limine ask the judge to exclude certain evidence before trial. In PI cases, you might request excluding: evidence of prior unrelated injuries, mention of insurance coverage (to prevent jury bias), speculative testimony, or evidence obtained improperly.',
      showIf: (answers) => answers.motions_in_limine === 'not_familiar' || answers.motions_in_limine === 'yes',
    },
    {
      id: 'daubert_challenge',
      type: 'single_choice',
      prompt: 'Has the defendant challenged your expert witnesses (Daubert challenge)?',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'not_sure', label: 'I\'m not sure' },
      ],
    },
    {
      id: 'daubert_info',
      type: 'info',
      prompt:
        'A Daubert challenge tries to exclude your expert\'s testimony by arguing it\'s not scientifically reliable. If your medical expert is challenged, you\'ll need to show their opinions are based on accepted medical methodology. This is a serious motion — consider consulting an attorney.',
      showIf: (answers) => answers.daubert_challenge === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.msj_filed === 'yes') {
      if (answers.msj_response_status === 'filed') {
        items.push({ status: 'done', text: 'Response to motion for summary judgment filed.' })
      } else {
        items.push({ status: 'needed', text: 'Respond to the motion for summary judgment with supporting evidence. This is critical.' })
      }
    } else {
      items.push({ status: 'info', text: 'No motion for summary judgment filed by defendant.' })
    }

    if (answers.motions_in_limine === 'yes') {
      items.push({ status: 'info', text: 'Consider filing motions in limine to exclude prejudicial evidence before trial.' })
    }

    if (answers.daubert_challenge === 'yes') {
      items.push({ status: 'needed', text: 'Defend your expert witness against the Daubert challenge. Ensure expert\'s methodology is documented.' })
    }

    return items
  },
}
