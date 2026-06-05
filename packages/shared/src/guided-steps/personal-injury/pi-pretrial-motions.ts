import type { GuidedStepConfig } from '../types'

export const piPretrialMotionsConfig: GuidedStepConfig = {
  title: 'Prepare Motion to Compel',
  reassurance:
    'If discovery responses are incomplete or evasive, this step turns selected deficiencies into a motion-to-compel checklist with a meet-and-confer record and requested relief.',

  questions: [
    {
      id: 'discovery_deficiencies',
      type: 'single_choice',
      prompt: 'Did you identify discovery responses that need to be fixed?',
      options: [
        { value: 'yes', label: 'Yes, some responses are deficient' },
        { value: 'no', label: 'No, responses look sufficient' },
        { value: 'not_sure', label: 'I am not sure' },
      ],
    },
    {
      id: 'deficiency_type',
      type: 'single_choice',
      prompt: 'What is the strongest issue for the motion?',
      showIf: (answers) => answers.discovery_deficiencies === 'yes',
      options: [
        { value: 'bare_denial', label: 'Bare denial instead of facts' },
        { value: 'improper_objection', label: 'Improper boilerplate objection' },
        { value: 'missing_documents', label: 'Missing documents' },
        { value: 'privilege_log', label: 'Privilege claim without a log' },
        { value: 'multiple', label: 'Multiple issues' },
      ],
    },
    {
      id: 'meet_and_confer_done',
      type: 'yes_no',
      prompt: 'Have you completed a good-faith meet-and-confer about the deficient responses?',
      showIf: (answers) => answers.discovery_deficiencies === 'yes',
    },
    {
      id: 'meet_and_confer_info',
      type: 'info',
      prompt:
        'Most courts require a meet-and-confer before a motion to compel. Save the letter, email, call notes, dates, and the defendant response. The motion should certify that you tried to resolve the dispute first.',
      showIf: (answers) => answers.meet_and_confer_done === 'no',
    },
    {
      id: 'motion_scope_info',
      type: 'info',
      prompt:
        'A strong motion to compel should use one section per deficiency: what you asked, what they answered, why it is deficient, the governing rule, and the exact relief requested.',
      showIf: (answers) => answers.discovery_deficiencies === 'yes',
    },
    {
      id: 'msj_filed',
      type: 'single_choice',
      prompt: 'Has the defendant filed a motion for summary judgment?',
      showIf: (answers) => answers.discovery_deficiencies !== 'yes',
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
      showIf: (answers) => answers.discovery_deficiencies !== 'yes',
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
      showIf: (answers) => answers.discovery_deficiencies !== 'yes',
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

    if (answers.discovery_deficiencies === 'yes') {
      items.push({
        status: 'needed',
        text: `Prepare motion-to-compel argument for: ${answers.deficiency_type?.replace(/_/g, ' ') ?? 'selected discovery deficiencies'}.`,
      })

      if (answers.meet_and_confer_done === 'yes') {
        items.push({ status: 'done', text: 'Meet-and-confer completed. Include the certification and record in the motion.' })
      } else {
        items.push({ status: 'needed', text: 'Complete and document the meet-and-confer before filing the motion.' })
      }

      items.push({ status: 'info', text: 'Structure the motion with one argument per deficiency and request a deadline for corrected responses.' })
      return items
    }

    if (answers.discovery_deficiencies === 'no') {
      items.push({ status: 'done', text: 'No motion to compel appears necessary from the reviewed responses.' })
    } else if (answers.discovery_deficiencies === 'not_sure') {
      items.push({ status: 'needed', text: 'Review the discovery responses for bare denials, improper objections, missing documents, and privilege-log issues.' })
    }

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
