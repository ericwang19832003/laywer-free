import type { GuidedStepConfig } from '../types'

export const reEarnestMoneyGuideConfig: GuidedStepConfig = {
  title: 'Earnest Money Disputes',
  reassurance:
    'Earnest money disputes are common and usually follow a clear set of rules defined in your purchase agreement. We will help you understand your rights and next steps.',

  questions: [
    // Your role
    {
      id: 'your_role',
      type: 'single_choice',
      prompt: 'What is your role in this transaction?',
      options: [
        { value: 'buyer', label: 'I am the buyer' },
        { value: 'seller', label: 'I am the seller' },
      ],
    },

    // How escrow works
    {
      id: 'escrow_info',
      type: 'info',
      prompt:
        'HOW ESCROW WORKS:\nEarnest money is deposited with a neutral third party (usually the title company) when the purchase agreement is signed. The title company holds the funds in an escrow account and cannot release them without:\n\n1. Written agreement from BOTH buyer and seller (mutual release form), OR\n2. A court order\n\nThe title company is NOT allowed to decide who gets the money on their own. They are a neutral stakeholder.',
    },

    // What happened
    {
      id: 'what_happened',
      type: 'single_choice',
      prompt: 'What happened with the transaction?',
      options: [
        { value: 'buyer_backed_out', label: 'The buyer backed out of the deal' },
        { value: 'seller_backed_out', label: 'The seller backed out of the deal' },
        { value: 'failed_contingency', label: 'A contingency was not met (inspection, financing, etc.)' },
        { value: 'mutual_disagreement', label: 'Both parties disagree about who breached' },
        { value: 'title_company_holding', label: 'The title company is holding the money and will not release it' },
      ],
    },

    // Buyer backed out
    {
      id: 'buyer_backed_out_info',
      type: 'info',
      prompt:
        'BUYER BACKED OUT:\n\nIf the buyer simply changed their mind (no valid contingency):\n- The seller is typically entitled to the earnest money as liquidated damages\n- Check your contract — the TREC standard form usually states the earnest money is the seller\'s sole remedy for buyer default\n- The buyer must sign a mutual release form for the title company to release the funds to the seller\n- If the buyer refuses to sign, the seller must demand release in writing, then potentially seek a court order\n\nBUT: If the buyer terminated during the option period (paid option fee), the buyer gets the earnest money back. The option period is a separate right to terminate for ANY reason.',
      showIf: (answers) => answers.what_happened === 'buyer_backed_out',
    },

    // Seller backed out
    {
      id: 'seller_backed_out_info',
      type: 'info',
      prompt:
        'SELLER BACKED OUT:\n\nIf the seller refused to close or breached the contract:\n- The buyer is entitled to the return of ALL earnest money\n- The buyer may also be entitled to additional damages:\n  - Inspection costs\n  - Appraisal costs\n  - Loan application fees\n  - Difference between the contract price and the price the buyer ultimately pays for a similar property\n- The buyer can sue for specific performance (force the sale) or monetary damages\n- The seller must sign a mutual release form for the title company to return the earnest money. If they refuse, the buyer must demand release in writing, then seek a court order.',
      showIf: (answers) => answers.what_happened === 'seller_backed_out',
    },

    // Failed contingency
    {
      id: 'failed_contingency_info',
      type: 'info',
      prompt:
        'FAILED CONTINGENCY:\n\nIf a contingency was not met and the buyer properly terminated:\n- The buyer is entitled to a full refund of the earnest money\n- Common contingencies: financing (buyer could not get a loan), inspection (major defects found), appraisal (property appraised below purchase price), sale of buyer\'s current home\n- The buyer must have terminated WITHIN the deadline specified in the contract and in the manner required (usually written notice)\n\nIf the buyer missed the contingency deadline, they may have waived the contingency and the earnest money may be at risk.',
      showIf: (answers) => answers.what_happened === 'failed_contingency',
    },

    // Mutual disagreement
    {
      id: 'mutual_disagreement_info',
      type: 'info',
      prompt:
        'BOTH PARTIES DISAGREE:\n\nThis is the most common earnest money dispute scenario. When neither party will sign a mutual release:\n\n1. DEMAND LETTER: Send a written demand to the other party explaining why you are entitled to the earnest money and requesting they sign the mutual release form within 10-15 days.\n2. MEDIATION: Many purchase agreements require mediation before filing suit. Check your contract.\n3. INTERPLEADER: The title company may file an interpleader action — they deposit the money with the court and let the judge decide. This relieves the title company of liability.\n4. LAWSUIT: File suit for breach of contract and recovery of the earnest money.\n\nThe title company will NOT release the money until both parties agree or a court orders it.',
      showIf: (answers) => answers.what_happened === 'mutual_disagreement',
    },

    // Title company holding
    {
      id: 'title_company_holding_info',
      type: 'info',
      prompt:
        'TITLE COMPANY HOLDING THE MONEY:\n\nThe title company is legally required to hold the money until:\n- Both parties sign a mutual release form (Release of Earnest Money form), OR\n- A court orders the release\n\nIf the title company is holding the money and neither party will agree:\n- The title company may file an INTERPLEADER ACTION — they deposit the money with the court and ask the judge to decide who gets it\n- The title company can recover its attorney\'s fees for filing the interpleader from the earnest money\n- You cannot sue the title company for holding the money — they are doing what the law requires\n\nTo break the deadlock: Send a demand letter to the other party, then file suit if they do not respond.',
      showIf: (answers) => answers.what_happened === 'title_company_holding',
    },

    // Amount
    {
      id: 'earnest_amount',
      type: 'text',
      prompt: 'How much earnest money is at stake?',
      placeholder: 'e.g. $5,000',
    },

    // Option period
    {
      id: 'option_period',
      type: 'yes_no',
      prompt: 'Did the buyer terminate during the option period?',
      helpText:
        'The option period is a negotiated number of days (usually 7-10) during which the buyer can terminate for ANY reason. The buyer pays a separate option fee for this right.',
    },
    {
      id: 'option_period_yes_info',
      type: 'info',
      prompt:
        'TERMINATION DURING OPTION PERIOD:\nIf the buyer properly terminated during the option period:\n- The buyer gets ALL earnest money back (the option fee is non-refundable, but earnest money is separate)\n- The termination must have been in writing and delivered before the option period expired\n- The seller must sign the mutual release form — there is no legitimate basis to withhold the earnest money if the buyer terminated within the option period',
      showIf: (answers) => answers.option_period === 'yes',
    },

    // Demand letter
    {
      id: 'sent_demand',
      type: 'yes_no',
      prompt: 'Have you sent a written demand for the earnest money?',
    },
    {
      id: 'demand_info',
      type: 'info',
      prompt:
        'DEMAND LETTER FOR EARNEST MONEY RETURN:\nYour demand letter should include:\n\n1. The property address and contract date\n2. The amount of earnest money deposited\n3. The name of the title company holding the funds\n4. WHY you are entitled to the money (cite the specific contract provision — option period termination, failed contingency, or the other party\'s breach)\n5. A deadline to sign the mutual release form (10-15 days is reasonable)\n6. A statement that you will file suit if the money is not released\n\nSend by certified mail with return receipt requested to the other party AND copy the title company. Keep a copy for your records.',
      showIf: (answers) => answers.sent_demand === 'no',
    },

    // Dispute resolution
    {
      id: 'dispute_resolution_info',
      type: 'info',
      prompt:
        'DISPUTE RESOLUTION OPTIONS:\n\n1. MUTUAL RELEASE FORM: The simplest path — both parties sign and the title company releases the money. Use the TREC Release of Earnest Money form.\n\n2. MEDIATION: Many TREC contracts require mediation before filing suit. Cost: $200-500 per party for a half-day session. A neutral mediator helps you negotiate.\n\n3. INTERPLEADER: The title company deposits the money with the court and lets the judge decide. This usually happens when the title company is caught in the middle.\n\n4. SMALL CLAIMS COURT: If the earnest money is under $20,000, you can file in JP Court. Filing fee: $35-75. Faster and simpler than district court.\n\n5. DISTRICT COURT: For larger amounts or if you are also seeking additional damages (e.g., specific performance, consequential damages).',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Role
    if (answers.your_role) {
      items.push({
        status: 'done',
        text: `Your role: ${answers.your_role === 'buyer' ? 'Buyer' : 'Seller'}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Identify your role in the transaction (buyer or seller).',
      })
    }

    // What happened
    if (answers.what_happened) {
      const labels: Record<string, string> = {
        buyer_backed_out: 'Buyer backed out of the deal',
        seller_backed_out: 'Seller backed out of the deal',
        failed_contingency: 'A contingency was not met',
        mutual_disagreement: 'Both parties disagree about who breached',
        title_company_holding: 'Title company is holding the money',
      }
      items.push({
        status: 'done',
        text: `Situation: ${labels[answers.what_happened]}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Identify what happened with the transaction.',
      })
    }

    // Earnest amount
    if (answers.earnest_amount) {
      items.push({
        status: 'done',
        text: `Earnest money at stake: ${answers.earnest_amount}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Confirm the amount of earnest money deposited.',
      })
    }

    // Option period
    if (answers.option_period === 'yes') {
      items.push({
        status: 'info',
        text: 'Buyer terminated during the option period — the buyer is entitled to a full refund of the earnest money.',
      })
    }

    // Demand letter
    if (answers.sent_demand === 'yes') {
      items.push({
        status: 'done',
        text: 'Written demand for earnest money sent.',
      })
    } else if (answers.sent_demand === 'no') {
      items.push({
        status: 'needed',
        text: 'Send a written demand letter by certified mail. Include the property address, contract date, earnest money amount, why you are entitled, and a 10-15 day deadline.',
      })
    }

    // Next steps based on situation
    if (answers.what_happened === 'mutual_disagreement' || answers.what_happened === 'title_company_holding') {
      items.push({
        status: 'info',
        text: 'Check your purchase agreement for a mandatory mediation clause. Many TREC contracts require mediation before filing suit.',
      })
    }

    if (answers.what_happened === 'seller_backed_out' && answers.your_role === 'buyer') {
      items.push({
        status: 'info',
        text: 'You may be entitled to additional damages beyond the earnest money (inspection costs, appraisal fees, price difference for a replacement property).',
      })
    }

    items.push({
      status: 'info',
      text: 'The title company cannot release earnest money without a signed mutual release form or a court order. If the other party refuses to sign, you will need to file suit or wait for the title company to file an interpleader.',
    })

    return items
  },
}
