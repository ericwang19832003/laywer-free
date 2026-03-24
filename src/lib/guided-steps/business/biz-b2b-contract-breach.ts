import type { GuidedStepConfig } from '../types'

export const bizB2bContractBreachConfig: GuidedStepConfig = {
  title: 'B2B Contract Breach — Your Legal Options',
  reassurance:
    'Commercial contract disputes have clear rules. The law is designed to make the non-breaching party whole.',

  questions: [
    {
      id: 'contract_subject',
      type: 'single_choice',
      prompt: 'What is the primary subject of the contract?',
      options: [
        { value: 'goods', label: 'Sale of goods (UCC applies)' },
        { value: 'services', label: 'Services only' },
        { value: 'mixed', label: 'Mixed — goods and services' },
        { value: 'software', label: 'Software or licensing' },
      ],
    },
    {
      id: 'ucc_note',
      type: 'info',
      prompt:
        'Because your contract involves the sale of goods, the Uniform Commercial Code (UCC) applies. The UCC provides additional remedies like the right to "cover" (buy substitute goods) and recover the price difference.',
      showIf: (answers) =>
        answers.contract_subject === 'goods' || answers.contract_subject === 'mixed',
    },
    {
      id: 'breach_type',
      type: 'single_choice',
      prompt: 'How would you describe the breach?',
      options: [
        { value: 'total', label: 'Total breach — they refused to perform entirely' },
        { value: 'partial', label: 'Partial breach — they performed but not fully' },
        { value: 'anticipatory', label: 'Anticipatory — they said they will not perform' },
        { value: 'late', label: 'Late performance — they performed but too late' },
      ],
    },
    {
      id: 'has_notice_clause',
      type: 'yes_no',
      prompt: 'Does the contract include a notice requirement before claiming breach?',
      helpText:
        'Many commercial contracts require written notice of breach and a specified cure period before you can sue.',
    },
    {
      id: 'notice_sent',
      type: 'yes_no',
      prompt: 'Have you sent a formal written notice of breach?',
      showIf: (answers) => answers.has_notice_clause === 'yes',
    },
    {
      id: 'notice_warning',
      type: 'info',
      prompt:
        'You should send formal notice of breach immediately. Failing to comply with a contractual notice requirement can bar your claims. Send via certified mail and email to the address specified in the contract.',
      showIf: (answers) =>
        answers.has_notice_clause === 'yes' && answers.notice_sent === 'no',
    },
    {
      id: 'has_cure_period',
      type: 'yes_no',
      prompt: 'Does the contract include a cure period (time for the other side to fix the breach)?',
    },
    {
      id: 'cure_period_expired',
      type: 'yes_no',
      prompt: 'Has the cure period expired without the breach being fixed?',
      showIf: (answers) => answers.has_cure_period === 'yes',
    },
    {
      id: 'damages_type',
      type: 'single_choice',
      prompt: 'What type of damages best describes your loss?',
      helpText:
        'Expectation damages = what you expected to gain. Reliance damages = what you spent in reliance on the contract. Restitution = value the other side received. Cover = cost to get a substitute.',
      options: [
        { value: 'expectation', label: 'Lost profits or benefit of the bargain (expectation)' },
        { value: 'reliance', label: 'Out-of-pocket costs spent relying on the contract (reliance)' },
        { value: 'restitution', label: 'Value the other side received from you (restitution)' },
        { value: 'cover', label: 'Cost to buy substitute goods or services (cover)' },
        { value: 'unsure', label: 'Not sure yet' },
      ],
    },
    {
      id: 'cover_note',
      type: 'info',
      prompt:
        'Under UCC §2-712, a buyer can "cover" by purchasing substitute goods in good faith and recover the difference between the cover price and the contract price, plus incidental and consequential damages.',
      showIf: (answers) =>
        answers.damages_type === 'cover' &&
        (answers.contract_subject === 'goods' || answers.contract_subject === 'mixed'),
    },
    {
      id: 'has_limitation_clause',
      type: 'yes_no',
      prompt: 'Does the contract include a limitation of liability or cap on damages?',
      helpText:
        'Commercial contracts often limit liability to direct damages or cap total recovery. These clauses are generally enforceable in B2B settings under Texas law unless unconscionable.',
    },
    {
      id: 'limitation_detail',
      type: 'single_choice',
      prompt: 'What does the limitation clause restrict?',
      showIf: (answers) => answers.has_limitation_clause === 'yes',
      options: [
        { value: 'cap', label: 'Caps total damages at a dollar amount' },
        { value: 'no_consequential', label: 'Excludes consequential or indirect damages' },
        { value: 'both', label: 'Both a dollar cap and exclusion of consequential damages' },
        { value: 'not_sure', label: 'Not sure — need to review' },
      ],
    },
    {
      id: 'commercial_reasonableness',
      type: 'yes_no',
      prompt: 'Did you act commercially reasonably to minimize your losses after the breach?',
      helpText:
        'The duty to mitigate requires you to take reasonable steps to reduce damages. Courts will reduce your recovery if you failed to mitigate.',
    },
    {
      id: 'demand_letter_template',
      type: 'info',
      prompt:
        'Sample B2B Demand Letter Structure:\n\n1. Identify the parties and the contract (date, title, subject)\n2. State the specific obligations breached (cite contract sections)\n3. Describe the notice and cure period compliance\n4. Quantify damages with supporting documentation\n5. Demand specific performance or monetary relief\n6. Set a deadline for response (typically 15–30 days)\n7. State that litigation will follow if unresolved\n8. Send via certified mail AND email to the contract notice address',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.contract_subject) {
      const labels: Record<string, string> = {
        goods: 'Sale of goods (UCC applies)',
        services: 'Services only',
        mixed: 'Mixed goods and services (UCC applies)',
        software: 'Software or licensing',
      }
      items.push({
        status: 'info',
        text: `Contract type: ${labels[answers.contract_subject] ?? answers.contract_subject}.`,
      })
    }

    if (answers.breach_type) {
      const labels: Record<string, string> = {
        total: 'Total breach — refused to perform',
        partial: 'Partial breach — incomplete performance',
        anticipatory: 'Anticipatory breach — stated refusal to perform',
        late: 'Late performance',
      }
      items.push({
        status: 'info',
        text: `Breach type: ${labels[answers.breach_type] ?? answers.breach_type}.`,
      })
    }

    if (answers.has_notice_clause === 'yes' && answers.notice_sent === 'yes') {
      items.push({ status: 'done', text: 'Formal notice of breach has been sent.' })
    } else if (answers.has_notice_clause === 'yes' && answers.notice_sent === 'no') {
      items.push({
        status: 'needed',
        text: 'Send formal written notice of breach per the contract requirements.',
      })
    }

    if (answers.has_cure_period === 'yes' && answers.cure_period_expired === 'yes') {
      items.push({ status: 'done', text: 'Cure period has expired without remedy.' })
    } else if (answers.has_cure_period === 'yes' && answers.cure_period_expired === 'no') {
      items.push({
        status: 'needed',
        text: 'Wait for the cure period to expire before filing suit.',
      })
    }

    if (answers.damages_type) {
      const labels: Record<string, string> = {
        expectation: 'Expectation damages (lost profits / benefit of bargain)',
        reliance: 'Reliance damages (out-of-pocket costs)',
        restitution: 'Restitution (value conferred to breaching party)',
        cover: 'Cover damages (substitute purchase cost difference)',
        unsure: 'Damages type to be determined',
      }
      items.push({
        status: answers.damages_type === 'unsure' ? 'needed' : 'info',
        text: `Damages theory: ${labels[answers.damages_type] ?? answers.damages_type}.`,
      })
    }

    if (answers.has_limitation_clause === 'yes') {
      items.push({
        status: 'info',
        text: 'Contract contains a limitation of liability clause — review carefully with counsel.',
      })
    }

    if (answers.commercial_reasonableness === 'yes') {
      items.push({ status: 'done', text: 'Took commercially reasonable steps to mitigate damages.' })
    } else if (answers.commercial_reasonableness === 'no') {
      items.push({
        status: 'needed',
        text: 'Document steps taken to mitigate damages — courts require commercial reasonableness.',
      })
    }

    return items
  },
}
