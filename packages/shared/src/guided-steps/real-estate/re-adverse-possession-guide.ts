import type { GuidedStepConfig } from '../types'

export const reAdversePossessionGuideConfig: GuidedStepConfig = {
  title: 'Adverse Possession & Boundary Disputes',
  reassurance:
    'Boundary disputes and adverse possession claims can be confusing, but Texas law provides clear rules. Understanding the requirements helps you evaluate whether you have a claim or need to defend against one.',

  questions: [
    {
      id: 'claim_posture',
      type: 'single_choice',
      prompt: 'What is your situation?',
      options: [
        { value: 'claiming', label: 'I want to claim land through adverse possession' },
        { value: 'defending', label: 'Someone is claiming my land through adverse possession' },
        { value: 'boundary_dispute', label: 'I have a boundary line dispute with a neighbor' },
      ],
    },
    {
      id: 'claiming_overview',
      type: 'info',
      prompt:
        'ADVERSE POSSESSION IN TEXAS:\nTexas recognizes several adverse possession statutes. The two most common are:\n\n1. THREE-YEAR STATUTE (Tex. Civ. Prac. & Rem. Code §16.024): You must have "color of title" — a recorded deed or other document that purports to give you title — AND continuous, open possession for 3 years.\n\n2. TEN-YEAR STATUTE (Tex. Civ. Prac. & Rem. Code §16.026): No deed required, but you must prove open, notorious, hostile, exclusive, and continuous possession for 10 years. This is the most commonly used statute.',
      showIf: (answers) => answers.claim_posture === 'claiming',
    },
    {
      id: 'defending_overview',
      type: 'info',
      prompt:
        'DEFENDING AGAINST AN ADVERSE POSSESSION CLAIM:\n• Act quickly — the longer you wait, the stronger their claim becomes.\n• Post "No Trespassing" signs and send a written demand to vacate.\n• If they refuse to leave, file a trespass-to-try-title action (Tex. Prop. Code Ch. 22).\n• Document that you have NOT abandoned the property: pay taxes, maintain the land, inspect it regularly.\n• A survey showing the true boundary can defeat many adverse possession claims.',
      showIf: (answers) => answers.claim_posture === 'defending',
    },
    {
      id: 'ap_type',
      type: 'single_choice',
      prompt: 'Which adverse possession rule applies to your situation?',
      showIf: (answers) => answers.claim_posture === 'claiming',
      options: [
        { value: 'three_year', label: '3-year statute — I have a recorded deed or title document' },
        { value: 'ten_year', label: '10-year statute — I have been using the land without a deed' },
        { value: 'unsure', label: 'Not sure which applies' },
      ],
    },
    {
      id: 'three_year_info',
      type: 'info',
      prompt:
        'THREE-YEAR STATUTE (§16.024) — REQUIREMENTS:\n1. COLOR OF TITLE: You must have a recorded deed or other instrument that purports to convey title to you (even if the deed turns out to be defective).\n2. OPEN AND NOTORIOUS POSSESSION: Your use of the land must be visible — not hidden or secretive.\n3. CONTINUOUS POSSESSION: You must have possessed the land for a full 3 years without interruption.\n4. HOSTILE: Your possession must be without the true owner\'s permission.\n\nEVIDENCE NEEDED:\n• The recorded deed or title document\n• Proof of continuous use (photos over time, utility bills, improvements made)\n• Witness testimony from neighbors about your use\n• Tax payment records (helpful but not required for the 3-year statute)',
      showIf: (answers) => answers.ap_type === 'three_year',
    },
    {
      id: 'ten_year_info',
      type: 'info',
      prompt:
        'TEN-YEAR STATUTE (§16.026) — REQUIREMENTS:\nYou must prove ALL of the following for a continuous 10-year period:\n\n1. OPEN AND NOTORIOUS: Your use is visible to anyone, including the true owner.\n2. HOSTILE: You occupy without the owner\'s permission. (If the owner gave you permission, the clock resets.)\n3. EXCLUSIVE: You treat the land as your own — not shared with the public or the true owner.\n4. CONTINUOUS: 10 uninterrupted years. Seasonal use (e.g., farming) can count if consistent.\n\nEVIDENCE NEEDED:\n• Survey showing the area you have possessed\n• Photographs over the years showing your use (fencing, farming, structures, landscaping)\n• Witness testimony (neighbors, friends, family) about the duration and nature of your use\n• Tax payment records (paying taxes on the property is strong evidence)\n• Receipts for improvements, maintenance, or utilities',
      showIf: (answers) => answers.ap_type === 'ten_year' || answers.ap_type === 'unsure',
    },
    {
      id: 'boundary_dispute_info',
      type: 'info',
      prompt:
        'BOUNDARY LINE DISPUTES:\n\n1. GET A SURVEY: Hire a licensed Texas surveyor to establish the true boundary. This is almost always the first step.\n2. COMPARE SURVEYS: If the neighbor also has a survey, compare them. Discrepancies often arise from different reference points or old, inaccurate surveys.\n3. BOUNDARY LINE AGREEMENT: Texas allows neighbors to enter into a written agreement establishing the boundary. This is often faster and cheaper than litigation. Record it with the county clerk.\n4. TRESPASS-TO-TRY-TITLE: If you cannot agree, file suit to establish the boundary. The court will rely on surveys, deeds, and historical evidence.\n5. FENCES: A fence does not establish a legal boundary. However, a long-standing fence may support an adverse possession argument if the elements are met.',
      showIf: (answers) => answers.claim_posture === 'boundary_dispute',
    },
    {
      id: 'has_survey',
      type: 'yes_no',
      prompt: 'Do you have a recent survey of the property?',
    },
    {
      id: 'survey_needed_info',
      type: 'info',
      prompt:
        'GET A SURVEY:\n• A licensed Texas surveyor can establish the legal boundary based on the deed descriptions.\n• Cost typically ranges from $300 to $800 for a residential property.\n• The survey will be critical evidence in court if litigation becomes necessary.\n• Ask the surveyor to mark the corners with stakes or pins.\n• Keep the original survey document — you may need to file it with the court.',
      showIf: (answers) => answers.has_survey === 'no',
    },
    {
      id: 'evidence_gathered',
      type: 'yes_no',
      prompt: 'Have you gathered evidence documenting your possession or the boundary dispute?',
      helpText:
        'Evidence includes photographs over time, witness statements, tax records, repair receipts, utility bills, and any written communications with the other party.',
    },
    {
      id: 'resolution_preference',
      type: 'single_choice',
      prompt: 'How would you prefer to resolve this?',
      options: [
        { value: 'negotiation', label: 'Negotiate a boundary line agreement with the neighbor' },
        { value: 'mediation', label: 'Mediation — use a neutral third party' },
        { value: 'litigation', label: 'File a lawsuit (trespass-to-try-title)' },
        { value: 'unsure_resolution', label: 'Not sure yet' },
      ],
    },
    {
      id: 'negotiation_info',
      type: 'info',
      prompt:
        'BOUNDARY LINE AGREEMENT:\n• This is a written agreement between neighbors that establishes the boundary.\n• Both parties sign it and record it with the county clerk, making it binding on future owners.\n• This is often the fastest and cheapest resolution.\n• Consider having each party pay for their own survey, then negotiate based on the results.\n• Put the agreement in writing — oral boundary agreements are difficult to enforce.',
      showIf: (answers) => answers.resolution_preference === 'negotiation',
    },
    {
      id: 'litigation_info',
      type: 'info',
      prompt:
        'TRESPASS-TO-TRY-TITLE (Tex. Prop. Code Ch. 22):\n• This is the lawsuit you file to establish ownership or resolve a boundary dispute.\n• You must describe the property with legal descriptions.\n• File a lis pendens to put third parties on notice.\n• The court will examine deeds, surveys, historical use, and any adverse possession evidence.\n• If you prevail, the court issues a judgment establishing the boundary or awarding title, which you record with the county clerk.',
      showIf: (answers) => answers.resolution_preference === 'litigation',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.claim_posture) {
      const labels: Record<string, string> = {
        claiming: 'Claiming adverse possession',
        defending: 'Defending against adverse possession claim',
        boundary_dispute: 'Boundary line dispute',
      }
      items.push({ status: 'done', text: `Situation: ${labels[answers.claim_posture]}.` })
    } else {
      items.push({ status: 'needed', text: 'Identify your situation (claiming, defending, or boundary dispute).' })
    }

    if (answers.ap_type === 'three_year') {
      items.push({
        status: 'info',
        text: '3-year statute (§16.024): Requires color of title (recorded deed) plus 3 years of open, continuous, hostile possession.',
      })
    } else if (answers.ap_type === 'ten_year' || answers.ap_type === 'unsure') {
      items.push({
        status: 'info',
        text: '10-year statute (§16.026): Requires 10 years of open, notorious, hostile, exclusive, and continuous possession. No deed required.',
      })
    }

    if (answers.has_survey === 'yes') {
      items.push({ status: 'done', text: 'Survey obtained.' })
    } else if (answers.has_survey === 'no') {
      items.push({
        status: 'needed',
        text: 'Hire a licensed Texas surveyor to establish the legal boundary ($300-$800 for residential).',
      })
    }

    if (answers.evidence_gathered === 'yes') {
      items.push({ status: 'done', text: 'Evidence of possession or boundary dispute gathered.' })
    } else if (answers.evidence_gathered === 'no') {
      items.push({
        status: 'needed',
        text: 'Gather evidence: photographs over time, witness statements, tax records, repair receipts, utility bills, and communications.',
      })
    }

    if (answers.resolution_preference) {
      const labels: Record<string, string> = {
        negotiation: 'Negotiate a boundary line agreement',
        mediation: 'Mediation',
        litigation: 'File a trespass-to-try-title lawsuit',
        unsure_resolution: 'Resolution method not yet decided',
      }
      items.push({ status: 'done', text: `Preferred resolution: ${labels[answers.resolution_preference]}.` })
    }

    if (answers.claim_posture === 'defending') {
      items.push({
        status: 'needed',
        text: 'Act quickly: post No Trespassing signs, send a written demand to vacate, and document your own use of the property.',
      })
    }

    return items
  },
}
