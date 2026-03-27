import type { GuidedStepConfig } from '../types'

export const scEvidenceRulesConfig: GuidedStepConfig = {
  title: 'Evidence Rules in Small Claims Court',
  reassurance:
    "JP Court has the most relaxed evidence rules in Texas. You don't need to be a lawyer to present your case.",

  questions: [
    {
      id: 'know_relaxed_rules',
      type: 'yes_no',
      prompt: 'Do you know how evidence rules differ in JP Court?',
    },
    {
      id: 'relaxed_rules_info',
      type: 'info',
      prompt:
        'Under TRCP 500.3, JP Court uses relaxed evidence rules. Hearsay is more acceptable than in other courts, business records are easier to admit, and the judge has wide discretion on what to consider. You don\'t need to know the formal Texas Rules of Evidence.',
      showIf: (answers) => answers.know_relaxed_rules === 'no',
    },
    {
      id: 'claim_type',
      type: 'single_choice',
      prompt: 'What type of claim are you bringing? (This determines what evidence you need.)',
      options: [
        { value: 'security_deposit', label: 'Security deposit' },
        { value: 'contract', label: 'Breach of contract' },
        { value: 'car_accident', label: 'Car accident / property damage' },
        { value: 'unpaid_loan', label: 'Unpaid loan' },
        { value: 'consumer', label: 'Consumer dispute' },
        { value: 'other', label: 'Other' },
      ],
    },
    {
      id: 'security_deposit_evidence',
      type: 'info',
      prompt:
        'For a security deposit claim, bring: (1) Your lease agreement. (2) Move-in and move-out photos showing the property\'s condition. (3) Your written forwarding address letter or proof it was sent. (4) Any itemized deduction list you received (or note that you didn\'t receive one). (5) Proof of deposit payment (bank statement, canceled check, receipt).',
      showIf: (answers) => answers.claim_type === 'security_deposit',
    },
    {
      id: 'contract_evidence',
      type: 'info',
      prompt:
        'For a breach of contract claim, bring: (1) The signed contract or written agreement. (2) Proof of your payment (bank statements, receipts, canceled checks). (3) Communications showing the breach (texts, emails where you asked for performance or complained). (4) Evidence of what you received vs. what was promised. (5) Photos if applicable.',
      showIf: (answers) => answers.claim_type === 'contract',
    },
    {
      id: 'car_accident_evidence',
      type: 'info',
      prompt:
        'For a car accident claim, bring: (1) The police report. (2) Photos of the damage to your vehicle. (3) At least one repair estimate (preferably 2-3). (4) Rental car receipts if applicable. (5) Insurance correspondence. (6) Medical bills if claiming injury (must be under $20K total).',
      showIf: (answers) => answers.claim_type === 'car_accident',
    },
    {
      id: 'unpaid_loan_evidence',
      type: 'info',
      prompt:
        'For an unpaid loan claim, bring: (1) The promissory note or written loan agreement. If no written agreement, bring text messages or emails showing the agreement to borrow and repay. (2) Proof you transferred the money (bank statement, Venmo/Zelle records). (3) Any payment records showing partial payments. (4) Communications where you requested repayment.',
      showIf: (answers) => answers.claim_type === 'unpaid_loan',
    },
    {
      id: 'consumer_evidence',
      type: 'info',
      prompt:
        'For a consumer dispute, bring: (1) Your receipt or proof of purchase. (2) The product listing, advertisement, or description showing what was promised. (3) Photos of the defective product or unfinished work. (4) Communications with the seller/business. (5) Evidence of your refund request and their response.',
      showIf: (answers) => answers.claim_type === 'consumer',
    },
    {
      id: 'know_how_to_present',
      type: 'yes_no',
      prompt: 'Do you know how to present evidence to the judge?',
    },
    {
      id: 'present_info',
      type: 'info',
      prompt:
        'When it\'s your turn, hand the judge the document and say: "Your Honor, I\'d like to show you [describe what it is]." Then explain briefly what it shows and why it matters. For example: "This is the lease agreement showing my deposit was $1,500" or "These are photos I took on move-out day showing the apartment was clean."',
      showIf: (answers) => answers.know_how_to_present === 'no',
    },
    {
      id: 'evidence_organized',
      type: 'yes_no',
      prompt: 'Have you organized your evidence with numbered exhibits and 3 copies?',
    },
    {
      id: 'organize_info',
      type: 'info',
      prompt:
        'Number each piece of evidence as an exhibit (Exhibit 1, Exhibit 2, etc.) in the order you\'ll present them. Make 3 copies of everything: one for you, one for the judge, and one for the other side. Use a folder or binder to keep everything organized.',
      showIf: (answers) => answers.evidence_organized === 'no',
    },
    {
      id: 'have_witnesses',
      type: 'yes_no',
      prompt: 'Do you have witnesses who can support your case?',
    },
    {
      id: 'witness_info',
      type: 'info',
      prompt:
        'In JP Court, written witness statements (affidavits) are accepted even if the witness can\'t attend the hearing. Have your witness write a signed, dated statement describing what they saw or know. If possible, get it notarized. A witness who appears in person is more persuasive, but an affidavit is better than nothing.',
      showIf: (answers) => answers.have_witnesses === 'yes',
    },
    {
      id: 'no_witness_info',
      type: 'info',
      prompt:
        'You don\'t need witnesses to win. Many small claims cases are won on documents alone. Focus on your paper trail: contracts, receipts, photos, and communications.',
      showIf: (answers) => answers.have_witnesses === 'no',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.know_relaxed_rules === 'yes') {
      items.push({ status: 'done', text: 'Understands TRCP 500.3 relaxed evidence rules.' })
    } else {
      items.push({
        status: 'info',
        text: 'JP Court uses relaxed evidence rules (TRCP 500.3). Hearsay is more acceptable and business records are easier to admit.',
      })
    }

    if (answers.claim_type) {
      const evidenceLists: Record<string, string> = {
        security_deposit: 'Lease, move-in/move-out photos, forwarding address letter, deduction list, deposit payment proof.',
        contract: 'Contract, payment proof, communications, evidence of breach.',
        car_accident: 'Police report, damage photos, repair estimates, rental car receipts.',
        unpaid_loan: 'Promissory note or text agreement, proof of transfer, payment records, repayment requests.',
        consumer: 'Receipt, product listing/ad, defect photos, communications, refund request proof.',
        other: 'Gather all documents, photos, and communications related to your claim.',
      }
      items.push({
        status: answers.claim_type === 'other' ? 'info' : 'needed',
        text: `Evidence needed: ${evidenceLists[answers.claim_type]}`,
      })
    }

    if (answers.know_how_to_present === 'yes') {
      items.push({ status: 'done', text: 'Knows how to present evidence to the judge.' })
    } else {
      items.push({
        status: 'info',
        text: 'Hand the judge each document, explain what it is and why it matters.',
      })
    }

    if (answers.evidence_organized === 'yes') {
      items.push({ status: 'done', text: 'Evidence numbered as exhibits with 3 copies prepared.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Number evidence as exhibits and make 3 copies (you, judge, other side).',
      })
    }

    if (answers.have_witnesses === 'yes') {
      items.push({
        status: 'info',
        text: 'Get written affidavits from witnesses. In-person testimony is stronger, but signed statements are accepted in JP Court.',
      })
    }

    return items
  },
}
