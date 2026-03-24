import type { GuidedStepConfig } from '../types'

export const debtWitnessPrepConfig: GuidedStepConfig = {
  title: 'Preparing Your Witnesses',
  reassurance:
    "A witness who saw or heard what happened can be your strongest evidence. Here's how to prepare them without overstepping.",

  questions: [
    {
      id: 'has_witnesses',
      type: 'yes_no',
      prompt: 'Do you have any witnesses who can support your case?',
      helpText:
        'A witness is someone who personally saw or heard something relevant \u2014 for example, a phone call from a collector, a payment you made, or a conversation about the debt.',
    },
    {
      id: 'no_witnesses_info',
      type: 'info',
      showIf: (answers) => answers.has_witnesses === 'no',
      prompt:
        "That's OK \u2014 most debt cases are decided on documents, not witnesses. Focus on your documentary evidence: bank statements, letters, call logs, and any correspondence with the collector.",
    },
    {
      id: 'witness_topic',
      type: 'single_choice',
      showIf: (answers) => answers.has_witnesses === 'yes',
      prompt: 'What can your witness testify about?',
      options: [
        { value: 'fdcpa_violation', label: 'Collector harassment or FDCPA violation they witnessed' },
        { value: 'payment_history', label: 'Payments I made on the debt' },
        { value: 'identity_error', label: 'The debt is not mine (wrong person)' },
        { value: 'other', label: 'Something else relevant to the case' },
      ],
    },
    {
      id: 'fdcpa_witness_info',
      type: 'info',
      showIf: (answers) =>
        answers.has_witnesses === 'yes' && answers.witness_topic === 'fdcpa_violation',
      prompt:
        'A witness to collector harassment is powerful evidence. They can testify about:\n- Calls they overheard (speakerphone, shared space)\n- Threats or abusive language they heard\n- Calls at prohibited hours (before 8am or after 9pm)\n- The collector contacting them about YOUR debt (third-party disclosure violation)\n\nHave your witness write down exactly what they saw/heard, the date, and the time. This written statement can refresh their memory at trial.',
    },
    {
      id: 'payment_witness_info',
      type: 'info',
      showIf: (answers) =>
        answers.has_witnesses === 'yes' && answers.witness_topic === 'payment_history',
      prompt:
        'A witness who saw you make payments can corroborate your records. They can testify about:\n- Watching you write a check or make an online payment\n- Accompanying you to a payment location\n- Conversations where you discussed payments you had made\n\nNote: documentary evidence (bank statements, receipts) is usually stronger than witness testimony for payment history. Use the witness to support your documents, not replace them.',
    },
    {
      id: 'identity_witness_info',
      type: 'info',
      showIf: (answers) =>
        answers.has_witnesses === 'yes' && answers.witness_topic === 'identity_error',
      prompt:
        'If the debt belongs to someone else, a witness can help establish your identity and distinguish you from the actual debtor. They can testify about:\n- Your identity (family member, employer, landlord)\n- That you never had the account in question\n- That another person with a similar name exists\n\nAlso bring government-issued ID and any documents that distinguish you from the alleged debtor.',
    },
    {
      id: 'other_witness_info',
      type: 'info',
      showIf: (answers) =>
        answers.has_witnesses === 'yes' && answers.witness_topic === 'other',
      prompt:
        'Whatever your witness can testify about, make sure it is:\n- Something they personally saw or heard (not something you told them)\n- Relevant to a fact in your case\n- Something they can state clearly and concisely\n\nBefore the hearing, confirm they are available and willing to attend.',
    },
    {
      id: 'witness_rules_info',
      type: 'info',
      showIf: (answers) => answers.has_witnesses === 'yes',
      prompt:
        'RULES FOR WITNESSES:\n- You CAN review the facts with them beforehand\n- You CANNOT tell them what to say (that\'s coaching, and it\'s unethical)\n- They must testify from their own memory\n- They should stick to what they personally saw or heard\n- They should dress appropriately and address the judge respectfully',
    },
    {
      id: 'subpoena_info',
      type: 'info',
      showIf: (answers) => answers.has_witnesses === 'yes',
      prompt:
        'SUBPOENAING A WITNESS:\nIf your witness is unwilling to come voluntarily, you can subpoena them (force them to attend). Ask the court clerk for a subpoena form. File it with the clerk, then have it served on the witness at least 48 hours before the hearing.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.has_witnesses === 'no') {
      items.push({
        status: 'info',
        text: 'No witnesses \u2014 focus on documentary evidence (bank statements, letters, call logs).',
      })
    } else {
      const topicLabels: Record<string, string> = {
        fdcpa_violation: 'FDCPA violations / collector harassment',
        payment_history: 'payment history',
        identity_error: 'identity error (wrong person)',
        other: 'other case-relevant facts',
      }

      const topic = topicLabels[answers.witness_topic] || 'your case'

      items.push({
        status: 'done',
        text: `You have a witness who can testify about ${topic}.`,
      })

      items.push({
        status: 'needed',
        text: 'Confirm your witness is available and willing to attend the hearing.',
      })

      items.push({
        status: 'info',
        text: 'Review the facts with your witness but do not tell them what to say.',
      })

      items.push({
        status: 'needed',
        text: 'If your witness is unwilling, request a subpoena from the court clerk at least 48 hours before the hearing.',
      })
    }

    return items
  },
}
