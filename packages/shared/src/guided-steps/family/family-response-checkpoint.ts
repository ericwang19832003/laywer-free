import type { GuidedStepConfig } from '../types'

export type ResponseSubType = 'divorce' | 'custody' | 'child_support' | 'visitation' | 'spousal_support' | 'modification'

export function createResponseCheckpointConfig(subType: ResponseSubType): GuidedStepConfig {
  return {
    title: 'What Happened After Service?',
    reassurance:
      'Every response — even no response — has a clear next step. You are not stuck, and we will walk you through what comes next.',

    questions: [
      {
        id: 'response_status',
        type: 'single_choice',
        prompt: 'What happened after the other party was served?',
        helpText: 'If you are not sure, choose "Still waiting for a response."',
        options: [
          { value: 'agreed', label: 'They agreed — we are on the same page' },
          { value: 'answer_filed', label: 'They filed an answer (or a counter-petition)' },
          { value: 'no_response', label: 'They never responded' },
          { value: 'waiting', label: 'Still waiting for a response' },
        ],
      },

      // --- agreed path ---
      {
        id: 'agreed_info',
        type: 'info',
        prompt:
          'Great news — when both parties agree, your case can move much faster. This is sometimes called an "uncontested" or "agreed" case. You can skip mediation and go straight to drafting a final order for the judge to sign.',
        showIf: (a) => a.response_status === 'agreed',
      },
      {
        id: 'agreed_waiver_timing',
        type: 'info',
        prompt:
          'Important timing rule: if the other party signed a Waiver of Service, that waiver must be signed at least one day AFTER the petition was filed with the court. A waiver signed on the same day as filing is not valid. If yours was signed the same day, you will need to have it re-signed.',
        showIf: (a) => a.response_status === 'agreed',
      },
      {
        id: 'agreed_divorce_waiting_period',
        type: 'info',
        prompt:
          'Remember: Texas has a mandatory 60-day waiting period for divorce, and it runs from the date you FILED — not the date of service. If 60 days have passed since filing, you may be able to finalize soon.',
        showIf: (a) => a.response_status === 'agreed' && subType === 'divorce',
      },

      // --- answer filed (contested) path ---
      {
        id: 'answer_filed_info',
        type: 'info',
        prompt:
          'When the other party files an answer, your case becomes "contested." This does not mean things are hostile — it just means there are issues you have not agreed on yet. Most contested cases still settle before trial, often through mediation.',
        showIf: (a) => a.response_status === 'answer_filed',
      },
      {
        id: 'answer_filed_next_steps',
        type: 'info',
        prompt:
          'Your next steps in a contested case:\n1. Read their answer carefully — note what they agree and disagree with.\n2. The court will likely set a scheduling order with deadlines.\n3. You may exchange information through "discovery" (requests for documents, questions, etc.).\n4. Most courts require mediation before a trial date is set.\n\nTake it one step at a time — you do not need to figure it all out today.',
        showIf: (a) => a.response_status === 'answer_filed',
      },
      {
        id: 'answer_filed_divorce_waiting_period',
        type: 'info',
        prompt:
          'Even in a contested divorce, the 60-day waiting period runs from the date you filed — not from service or from the answer. Keep that date in mind as you plan next steps.',
        showIf: (a) => a.response_status === 'answer_filed' && subType === 'divorce',
      },

      // --- no response (default) path ---
      {
        id: 'no_response_info',
        type: 'info',
        prompt:
          'If the other party was properly served and did not file an answer within the deadline, you may be able to get a "default judgment." This means the judge can grant your requests without the other party participating. It is one of the most straightforward paths to finishing your case.',
        showIf: (a) => a.response_status === 'no_response',
      },
      {
        id: 'no_response_documents',
        type: 'info',
        prompt:
          'To proceed with a default, you will typically need:\n1. Military Status Declaration — a sworn statement about whether the other party is on active military duty (required by federal law).\n2. Certificate of Last Known Mailing Address — confirms the address where you sent the papers.\n\nWe will help you prepare both of these.',
        showIf: (a) => a.response_status === 'no_response',
      },
      {
        id: 'no_response_divorce_waiting_period',
        type: 'info',
        prompt:
          'For divorce cases, remember that the 60-day waiting period runs from the filing date, not the service date. You cannot finalize — even by default — until that period has passed.',
        showIf: (a) => a.response_status === 'no_response' && subType === 'divorce',
      },

      // --- still waiting path ---
      {
        id: 'waiting_info',
        type: 'info',
        prompt:
          'After being served, the other party generally has until 10:00 AM on the first Monday after 20 days have passed to file an answer. Mark that date on your calendar. Until then, there is nothing you need to do — the ball is in their court.',
        showIf: (a) => a.response_status === 'waiting',
      },
      {
        id: 'waiting_deadline_tip',
        type: 'info',
        prompt:
          'If the deadline passes with no response, you can move forward with a default judgment. We will guide you through that process when the time comes. For now, just keep an eye on the calendar.',
        showIf: (a) => a.response_status === 'waiting',
      },
      {
        id: 'waiting_divorce_waiting_period',
        type: 'info',
        prompt:
          'While you wait for a response, keep in mind that the 60-day divorce waiting period is already running — it started the day you filed, not the day of service.',
        showIf: (a) => a.response_status === 'waiting' && subType === 'divorce',
      },
    ],

    generateSummary(answers) {
      const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

      switch (answers.response_status) {
        case 'agreed':
          items.push({ status: 'done', text: 'Both parties are in agreement — uncontested path available.' })
          items.push({ status: 'needed', text: 'Draft the agreed final order for the judge to sign.' })
          items.push({ status: 'info', text: 'Verify that any Waiver of Service was signed at least one day after the petition was filed.' })
          if (subType === 'divorce') {
            items.push({ status: 'info', text: 'The 60-day waiting period runs from the filing date. Check whether it has passed before scheduling a final hearing.' })
          }
          break

        case 'answer_filed':
          items.push({ status: 'info', text: 'The other party filed an answer — your case is contested.' })
          items.push({ status: 'needed', text: 'Review the answer to understand which issues are in dispute.' })
          items.push({ status: 'needed', text: 'Prepare for the court\'s scheduling order and potential discovery.' })
          items.push({ status: 'info', text: 'Most contested cases settle through mediation before reaching trial.' })
          if (subType === 'divorce') {
            items.push({ status: 'info', text: 'The 60-day waiting period runs from the filing date, not from service or the answer.' })
          }
          break

        case 'no_response':
          items.push({ status: 'info', text: 'No response received — default judgment path is available.' })
          items.push({ status: 'needed', text: 'Prepare a Military Status Declaration.' })
          items.push({ status: 'needed', text: 'Prepare a Certificate of Last Known Mailing Address.' })
          if (subType === 'divorce') {
            items.push({ status: 'info', text: 'The 60-day waiting period must have passed (from filing date) before finalizing.' })
          }
          break

        case 'waiting':
          items.push({ status: 'info', text: 'Waiting for the other party to respond.' })
          items.push({ status: 'info', text: 'The deadline is 10:00 AM on the first Monday after 20 days from service.' })
          if (subType === 'divorce') {
            items.push({ status: 'info', text: 'The 60-day divorce waiting period is already running from the filing date.' })
          }
          break

        default:
          items.push({ status: 'needed', text: 'Indicate what happened after the other party was served.' })
          break
      }

      return items
    },
  }
}
