import type { GuidedStepConfig } from '../types'

export const debtContinuanceRequestConfig: GuidedStepConfig = {
  title: 'Need More Time? Request a Continuance',
  reassurance:
    'Courts understand that pro se litigants need extra time. A continuance is a normal request \u2014 judges grant them regularly.',

  questions: [
    {
      id: 'continuance_reason',
      type: 'single_choice',
      prompt: 'Why do you need more time?',
      options: [
        { value: 'gather_evidence', label: 'I need to gather evidence' },
        { value: 'health_issue', label: 'Health issue' },
        { value: 'schedule_conflict', label: 'Schedule conflict' },
        { value: 'need_legal_advice', label: 'I need to consult a lawyer or legal aid' },
        { value: 'other', label: 'Other reason' },
      ],
    },
    {
      id: 'gather_evidence_info',
      type: 'info',
      showIf: (answers) => answers.continuance_reason === 'gather_evidence',
      prompt:
        'GATHERING EVIDENCE is one of the strongest grounds for a continuance. Texas Rule of Civil Procedure 252 allows continuances when a party needs more time to obtain evidence.\n\nIn your motion, explain:\n- What evidence you need\n- Why you haven\'t been able to get it yet\n- How much time you need (be specific \u2014 "2 weeks" is better than "more time")\n\nExample: "I need to obtain bank records from [bank] showing payment history. I have requested these records but have not yet received them."',
    },
    {
      id: 'health_issue_info',
      type: 'info',
      showIf: (answers) => answers.continuance_reason === 'health_issue',
      prompt:
        'HEALTH ISSUES are a recognized ground for continuance. If possible, bring a doctor\'s note or medical documentation.\n\nIn your motion, state:\n- That you have a medical condition preventing attendance or adequate preparation\n- That you can provide documentation if the court requires it\n- A timeframe for when you expect to be able to proceed\n\nYou do NOT need to disclose your specific diagnosis. "Medical condition" is sufficient.',
    },
    {
      id: 'schedule_conflict_info',
      type: 'info',
      showIf: (answers) => answers.continuance_reason === 'schedule_conflict',
      prompt:
        'SCHEDULE CONFLICTS can support a continuance, especially if you have:\n- A conflicting court date in another case\n- A work obligation you cannot reschedule (bring proof from your employer)\n- A pre-planned trip booked before you received the court date\n\nNote: "I have to work" alone is usually not enough. Show you made efforts to get time off, or that missing work would cause serious hardship.',
    },
    {
      id: 'need_legal_advice_info',
      type: 'info',
      showIf: (answers) => answers.continuance_reason === 'need_legal_advice',
      prompt:
        'SEEKING LEGAL COUNSEL is a valid reason, especially if:\n- You recently received the lawsuit and haven\'t had time to consult anyone\n- You have an appointment scheduled with legal aid\n- You are on a waiting list for free legal services\n\nIn your motion, state: "Defendant is proceeding pro se and needs additional time to consult with legal aid regarding the defenses available in this case."\n\nTexas legal aid resources:\n- Lone Star Legal Aid: 1-800-733-8394\n- Texas RioGrande Legal Aid: 1-888-988-9996\n- TexasLawHelp.org',
    },
    {
      id: 'other_reason_info',
      type: 'info',
      showIf: (answers) => answers.continuance_reason === 'other',
      prompt:
        'For other reasons, be honest and specific in your request. Judges appreciate straightforward explanations. Whatever your reason, emphasize:\n- You are taking the case seriously\n- You have been diligent in preparing\n- A continuance will not unfairly prejudice the plaintiff\n- You are requesting a specific, reasonable amount of additional time',
    },
    {
      id: 'how_to_request_info',
      type: 'info',
      prompt:
        'HOW TO REQUEST:\n\nOption 1 (Written Motion \u2014 recommended):\nFile a "Motion for Continuance" with the court at least 7 days before your hearing date.\n\nOption 2 (Oral Request at Hearing):\nWhen your case is called, say: "Your Honor, I respectfully request a continuance because [reason]. I need approximately [2-4 weeks] to [gather evidence / consult with legal aid / recover from illness]."\n\nThe judge will either grant it (new date set) or deny it (hearing proceeds today).',
    },
    {
      id: 'motion_template_info',
      type: 'info',
      prompt:
        'MOTION TEMPLATE:\n\nMOTION FOR CONTINUANCE\n\nDefendant [name] respectfully requests this Court continue the hearing currently set for [date] for the following reasons:\n1. [Reason]\n2. Defendant has been diligent in preparing this case.\n3. A continuance will not prejudice the Plaintiff.\n4. Defendant requests the hearing be reset approximately [2-4] weeks from today.\n\nRespectfully submitted,\n[Name], Pro Se',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    const reasonLabels: Record<string, string> = {
      gather_evidence: 'gathering evidence',
      health_issue: 'a health issue',
      schedule_conflict: 'a schedule conflict',
      need_legal_advice: 'needing to consult a lawyer or legal aid',
      other: 'another reason',
    }

    const reason = reasonLabels[answers.continuance_reason] || 'your stated reason'

    items.push({
      status: 'info',
      text: `You need more time due to ${reason}.`,
    })

    items.push({
      status: 'needed',
      text: 'File your Motion for Continuance at least 7 days before your hearing date.',
    })

    items.push({
      status: 'info',
      text: 'If you cannot file in advance, you can make an oral request when your case is called.',
    })

    items.push({
      status: 'done',
      text: 'You reviewed the motion template and how to request a continuance.',
    })

    return items
  },
}
