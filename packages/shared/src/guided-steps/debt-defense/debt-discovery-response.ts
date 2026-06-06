import type { GuidedStepConfig } from '../types'

export const debtDiscoveryResponseConfig: GuidedStepConfig = {
  title: "Responding to the Plaintiff's Discovery",
  reassurance:
    "Discovery can feel overwhelming, but it is just a formal way of exchanging information. You have the same right to ask the plaintiff for evidence as they have to ask you. Many debt cases fall apart during discovery because the plaintiff cannot produce the documents they need to win. Take it one step at a time — you can do this.",

  questions: [
    {
      id: 'rfa_critical_warning',
      type: 'info',
      acknowledgeLabel: 'Understood — responding to RFAs is my top priority →',
      prompt:
        'CRITICAL WARNING — REQUESTS FOR ADMISSION\n\nThis is the #1 mistake pro se defendants make. If you received Requests for Admission (RFAs) and do NOT respond within 30 days, every single request is automatically DEEMED ADMITTED — meaning the court treats them as true, even if they are not.\n\nThis can lose your entire case instantly. The plaintiff can then file a motion for summary judgment based on your "admissions" and win without a trial.\n\nIf you have received RFAs, responding to them is your most urgent priority. Do not wait. Count 30 days from the date you received them and work backward to give yourself time to prepare and file your responses.',
    },
    {
      id: 'received_discovery',
      type: 'yes_no',
      prompt: 'Have you received discovery requests from the plaintiff?',
      helpText:
        'Discovery requests are formal documents asking you to answer questions, produce documents, or admit/deny specific facts. They are usually titled "Interrogatories," "Requests for Production," or "Requests for Admission."',
    },
    {
      id: 'discovery_types',
      type: 'single_choice',
      prompt: 'What types of discovery requests have you received?',
      helpText:
        'If you received a single document containing multiple types, choose "Multiple types." If you are not sure what you received, choose "Not sure."',
      options: [
        { value: 'interrogatories', label: 'Interrogatories (written questions)' },
        {
          value: 'requests_for_production',
          label: 'Requests for Production (asking for documents)',
        },
        {
          value: 'requests_for_admission',
          label: 'Requests for Admission (asking you to admit or deny facts)',
        },
        {
          value: 'multiple',
          label: 'Multiple types (received more than one kind)',
        },
        { value: 'not_sure', label: "Not sure what I received" },
      ],
      showIf: (answers) => answers.received_discovery === 'yes',
    },
    {
      id: 'rfa_response_guide',
      type: 'info',
      acknowledgeLabel: 'Got it — I know how to respond →',
      prompt:
        'HOW TO RESPOND TO REQUESTS FOR ADMISSION (RFAs)\n\nYou must respond to each individual RFA with one of three answers:\n\n1. "ADMITTED" — You agree the statement is true. Only admit facts you are 100% certain about.\n\n2. "DENIED" — You disagree with the statement. Be specific in your denial. Example: "Denied. Defendant did not sign any agreement with Plaintiff."\n\n3. "OBJECTION" — The request is improper. State the specific legal grounds (vague, overly broad, compound, assumes facts not in evidence, etc.).\n\nCommon RFAs in debt collection cases:\n- "Admit that you owe $X to Plaintiff." — Deny if the amount is wrong or you dispute the debt.\n- "Admit that you signed the credit agreement." — Deny if you did not sign it or have no memory of signing it.\n- "Admit that you received the goods/services." — Deny if you are unsure or did not receive them.\n\nIMPORTANT: If you are not sure whether something is true, DENY IT. The plaintiff must then prove it. An admission cannot be taken back without a court order.',
      showIf: (answers) =>
        answers.received_discovery === 'yes' &&
        (answers.discovery_types === 'requests_for_admission' ||
          answers.discovery_types === 'multiple'),
    },
    {
      id: 'interrogatories_guide',
      type: 'info',
      acknowledgeLabel: 'Got it — I know how to respond →',
      prompt:
        'HOW TO RESPOND TO INTERROGATORIES\n\nInterrogatories are written questions you must answer under oath. Key rules:\n\n- Answer each question directly and truthfully, but do NOT volunteer extra information. Answer only what is asked.\n- If a question is overly broad, vague, or seeks privileged information, you may object. State the specific grounds: "Objection. This interrogatory is overly broad and unduly burdensome."\n- If you do not know the answer, say so: "Defendant does not have sufficient information to answer this interrogatory."\n- Keep your answers short and factual. Do not speculate or guess.\n- Your answers are under oath — they can be used against you at trial. Be careful and precise.',
      showIf: (answers) =>
        answers.received_discovery === 'yes' &&
        (answers.discovery_types === 'interrogatories' ||
          answers.discovery_types === 'multiple'),
    },
    {
      id: 'rfp_guide',
      type: 'info',
      acknowledgeLabel: 'Got it — I know how to respond →',
      prompt:
        'HOW TO RESPOND TO REQUESTS FOR PRODUCTION\n\nRequests for Production ask you to provide copies of documents. Key rules:\n\n- Produce documents you actually have. You are not required to create documents that do not exist.\n- If you do not have a requested document, say so: "Defendant does not possess, and after reasonable inquiry cannot locate, the requested document."\n- If a request is overly broad or seeks privileged information, object with specific grounds: "Objection. This request is overly broad and not reasonably calculated to lead to the discovery of admissible evidence."\n- Assert privilege where applicable — communications with your attorney (if any) are protected by attorney-client privilege.\n- Organize your responses by matching each numbered request with your response.',
      showIf: (answers) =>
        answers.received_discovery === 'yes' &&
        (answers.discovery_types === 'requests_for_production' ||
          answers.discovery_types === 'multiple'),
    },
    {
      id: 'response_deadline',
      type: 'text',
      prompt: 'When is your discovery response deadline?',
      helpText:
        'The standard deadline is 30 days from the date you received the discovery requests, unless the court has ordered a different timeline. Check the discovery requests themselves — they sometimes state a specific due date. If you are unsure, count 30 days from receipt.',
      placeholder: 'e.g., April 15, 2026',
      showIf: (answers) => answers.received_discovery === 'yes',
    },
    {
      id: 'sent_discovery_items',
      type: 'multi_select',
      prompt: 'Which of these discovery items have you sent (or plan to send) to the plaintiff?',
      options: [
        { value: 'original_agreement', label: 'Original signed credit agreement' },
        { value: 'chain_of_assignment', label: 'Complete chain of debt assignment documents' },
        { value: 'account_statements', label: 'Complete account statements (all charges, fees, interest)' },
        { value: 'payment_records', label: 'Payment records showing how each payment was applied' },
        { value: 'business_records_affidavit', label: 'Business records affidavit (to qualify documents as evidence)' },
      ],
      noneLabel: "Haven't sent any yet",
    },
    {
      id: 'discovery_power_info',
      type: 'info',
      prompt:
        'These requests frequently expose weak cases. Many debt buyers purchased debts in bulk with minimal documentation and simply cannot produce what you are asking for. If they fail to respond within 30 days, you can file a motion to compel.',
      acknowledgeLabel: 'Got it — sending my requests →',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // RFA urgency
    if (
      answers.received_discovery === 'yes' &&
      (answers.discovery_types === 'requests_for_admission' ||
        answers.discovery_types === 'multiple')
    ) {
      items.push({
        status: 'needed',
        text: 'URGENT: You have Requests for Admission that must be answered within 30 days or they are automatically deemed admitted. This is your highest priority.',
      })
    }

    // Discovery response status
    if (answers.received_discovery === 'yes') {
      const typeLabels: Record<string, string> = {
        interrogatories: 'Interrogatories',
        requests_for_production: 'Requests for Production',
        requests_for_admission: 'Requests for Admission',
        multiple: 'Multiple discovery types',
        not_sure: 'Discovery requests (type unclear)',
      }
      const typeLabel =
        typeLabels[answers.discovery_types] || 'Discovery requests'
      items.push({
        status: 'needed',
        text: `You received ${typeLabel}. Prepare and file your responses before your deadline.`,
      })
    } else if (answers.received_discovery === 'no') {
      items.push({
        status: 'info',
        text: 'You have not received discovery requests yet. The plaintiff may send them later — be ready to respond promptly when they arrive.',
      })
    }

    // Deadline
    if (answers.response_deadline) {
      items.push({
        status: 'needed',
        text: `Your discovery response deadline is ${answers.response_deadline}. Mark this on your calendar and aim to finish at least a few days early.`,
      })
    }

    // Own discovery
    if (answers.sent_discovery_items && answers.sent_discovery_items !== 'none') {
      const sentItems = answers.sent_discovery_items.split(',')
      items.push({
        status: sentItems.length === 5 ? 'done' : 'needed',
        text: `You have sent ${sentItems.length} of 5 discovery item${sentItems.length !== 1 ? 's' : ''} to the plaintiff. Follow up if they do not respond within 30 days — you can file a motion to compel.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Send your own discovery requests to the plaintiff. Request the original signed agreement, chain of assignment, complete account statements, payment records, and business records affidavit. This often exposes weak cases.',
      })
    }

    return items
  },
}
