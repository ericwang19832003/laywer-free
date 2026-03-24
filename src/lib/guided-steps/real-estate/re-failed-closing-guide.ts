import type { GuidedStepConfig } from '../types'

export const reFailedClosingGuideConfig: GuidedStepConfig = {
  title: 'What to Do When a Closing Falls Through',
  reassurance:
    'A failed closing is stressful, but the contract and Texas law provide clear rules about who is responsible and what remedies are available. Let us walk through your situation.',

  questions: [
    {
      id: 'your_role',
      type: 'single_choice',
      prompt: 'What is your role in the transaction?',
      options: [
        { value: 'buyer', label: 'I am the buyer' },
        { value: 'seller', label: 'I am the seller' },
      ],
    },
    {
      id: 'failure_cause',
      type: 'single_choice',
      prompt: 'What caused the closing to fail?',
      options: [
        { value: 'buyer_breach', label: 'Buyer backed out or failed to perform' },
        { value: 'seller_breach', label: 'Seller backed out or failed to perform' },
        { value: 'loan_denial', label: 'Lender denied the loan' },
        { value: 'appraisal_shortfall', label: 'Appraisal came in below purchase price' },
        { value: 'title_issue', label: 'Title defect discovered' },
        { value: 'inspection_issue', label: 'Inspection revealed major problems' },
        { value: 'other', label: 'Other reason' },
      ],
    },
    {
      id: 'buyer_breach_info',
      type: 'info',
      prompt:
        'BUYER-CAUSED FAILURE:\n• The seller is typically entitled to keep the earnest money as liquidated damages (per the TREC contract).\n• If the contract allows, the seller may also sue for additional damages: difference between contract price and eventual sale price, carrying costs (mortgage payments, taxes, insurance during the delay), and re-listing costs.\n• The seller may also pursue specific performance — a court order forcing the buyer to complete the purchase.\n• Statute of limitations: 4 years for breach of contract (Tex. Civ. Prac. & Rem. Code §16.004).',
      showIf: (answers) => answers.failure_cause === 'buyer_breach',
    },
    {
      id: 'seller_breach_info',
      type: 'info',
      prompt:
        'SELLER-CAUSED FAILURE:\n• The buyer is entitled to a full return of earnest money.\n• The buyer may also recover additional damages: inspection costs, appraisal fees, rate lock fees, loan application fees, temporary housing costs, and the difference in price if forced to buy a comparable property at a higher price.\n• Specific performance is available — the buyer can ask the court to force the seller to complete the sale. This remedy is particularly strong for real estate because each property is considered "unique."\n• Statute of limitations: 4 years for breach of contract.',
      showIf: (answers) => answers.failure_cause === 'seller_breach',
    },
    {
      id: 'loan_denial_info',
      type: 'info',
      prompt:
        'LENDER DENIED THE LOAN:\n• If the contract has a financing contingency (TREC Third Party Financing Addendum), the buyer can terminate and get earnest money back if the loan is denied.\n• The buyer must provide written notice of the denial within the timeframe specified in the addendum.\n• If there is NO financing contingency, the buyer is still obligated to close and may forfeit earnest money.\n• Check the exact language of your financing addendum — deadlines and notice requirements vary.',
      showIf: (answers) => answers.failure_cause === 'loan_denial',
    },
    {
      id: 'appraisal_shortfall_info',
      type: 'info',
      prompt:
        'APPRAISAL SHORTFALL:\n• If the appraisal comes in below the purchase price, the lender will only loan based on the appraised value.\n• Options: (1) Buyer pays the difference in cash, (2) Seller reduces the price, (3) Both parties negotiate a compromise, (4) Buyer terminates under the financing contingency if the lender won\'t approve the loan at the higher amount.\n• The TREC financing addendum may allow the buyer to terminate if they cannot obtain financing at the contract price.\n• Consider ordering a second appraisal or filing a Reconsideration of Value (ROV) with the lender.',
      showIf: (answers) => answers.failure_cause === 'appraisal_shortfall',
    },
    {
      id: 'earnest_money_status',
      type: 'single_choice',
      prompt: 'What is the status of the earnest money?',
      options: [
        { value: 'held_by_title', label: 'Held by the title company' },
        { value: 'released_to_me', label: 'Released to me' },
        { value: 'released_to_other', label: 'Released to the other party' },
        { value: 'disputed', label: 'Both parties are claiming it' },
      ],
    },
    {
      id: 'earnest_money_disputed_info',
      type: 'info',
      prompt:
        'DISPUTED EARNEST MONEY:\n• The title company will typically hold the funds until both parties agree or a court orders release.\n• Under the TREC contract, the title company may require a release signed by both parties.\n• If neither party will agree, the title company may interplead the funds — deposit them with the court and let the judge decide.\n• To get the earnest money released, you may need to file suit or demand mediation (most TREC contracts require mediation before litigation).\n• Keep all documentation: the contract, amendments, closing timeline, communications, and the reason the closing failed.',
      showIf: (answers) => answers.earnest_money_status === 'disputed',
    },
    {
      id: 'seeking_specific_performance',
      type: 'yes_no',
      prompt: 'Do you want to force the other party to complete the sale (specific performance)?',
      helpText:
        'Specific performance is a court order requiring the other party to go through with the transaction. Courts grant this for real estate because each property is legally considered "unique."',
    },
    {
      id: 'specific_performance_info',
      type: 'info',
      prompt:
        'SPECIFIC PERFORMANCE:\n• Available because real property is considered "unique" under Texas law — monetary damages alone may not make you whole.\n• You must show: (1) a valid contract exists, (2) you were ready, willing, and able to perform, (3) the other party breached, and (4) you have no adequate remedy at law.\n• File a lis pendens (notice of pending litigation) with the county clerk to put third parties on notice that the property is subject to a lawsuit. This prevents the seller from selling to someone else during litigation.\n• Specific performance cases often settle because the lis pendens effectively freezes the property.',
      showIf: (answers) => answers.seeking_specific_performance === 'yes',
    },
    {
      id: 'damages_overview',
      type: 'info',
      prompt:
        'DAMAGES CALCULATION:\nKeep receipts and documentation for all of these potential damages:\n• Earnest money deposited\n• Inspection costs (home inspection, pest inspection, survey)\n• Appraisal fees\n• Loan application and origination fees\n• Rate lock fees lost\n• Temporary housing costs (if you sold your previous home or ended a lease)\n• Moving costs already incurred\n• Difference in purchase/sale price if you must find another property\n• Attorney fees (if the contract provides for them)\n\nStatute of limitations: 4 years from the date of breach (Tex. Civ. Prac. & Rem. Code §16.004).',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.your_role) {
      items.push({
        status: 'done',
        text: `Your role: ${answers.your_role === 'buyer' ? 'Buyer' : 'Seller'}.`,
      })
    } else {
      items.push({ status: 'needed', text: 'Identify your role in the transaction.' })
    }

    if (answers.failure_cause) {
      const labels: Record<string, string> = {
        buyer_breach: 'Buyer backed out or failed to perform',
        seller_breach: 'Seller backed out or failed to perform',
        loan_denial: 'Lender denied the loan',
        appraisal_shortfall: 'Appraisal came in below purchase price',
        title_issue: 'Title defect discovered',
        inspection_issue: 'Inspection revealed major problems',
        other: 'Other reason',
      }
      items.push({ status: 'done', text: `Cause of failure: ${labels[answers.failure_cause]}.` })
    } else {
      items.push({ status: 'needed', text: 'Identify what caused the closing to fail.' })
    }

    if (answers.earnest_money_status === 'disputed') {
      items.push({
        status: 'needed',
        text: 'Earnest money is disputed. Request mediation or file suit to resolve. The title company will hold funds until there is agreement or a court order.',
      })
    } else if (answers.earnest_money_status === 'released_to_other' && answers.your_role === 'buyer' && answers.failure_cause === 'seller_breach') {
      items.push({
        status: 'needed',
        text: 'Earnest money was released to the seller despite seller breach. You may need to sue to recover it.',
      })
    } else if (answers.earnest_money_status) {
      items.push({
        status: 'done',
        text: `Earnest money status: ${answers.earnest_money_status.replace(/_/g, ' ')}.`,
      })
    }

    if (answers.seeking_specific_performance === 'yes') {
      items.push({
        status: 'needed',
        text: 'File a lis pendens with the county clerk to prevent the property from being sold during litigation.',
      })
      items.push({
        status: 'needed',
        text: 'Prepare a specific performance lawsuit — you must show a valid contract, your readiness to perform, and the other party\'s breach.',
      })
    }

    items.push({
      status: 'info',
      text: 'Document all out-of-pocket costs (inspection, appraisal, rate lock, temporary housing). Statute of limitations: 4 years from breach.',
    })

    items.push({
      status: 'info',
      text: 'Most TREC contracts require mediation before litigation. Check your contract for a mediation clause.',
    })

    return items
  },
}
