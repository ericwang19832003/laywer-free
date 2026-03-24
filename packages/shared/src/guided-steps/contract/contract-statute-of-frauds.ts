import type { GuidedStepConfig } from '../types'

export const contractStatuteOfFraudsConfig: GuidedStepConfig = {
  title: 'Does Your Contract Need to Be in Writing?',
  reassurance:
    'Not all contracts need to be written — but some do. Knowing the rules protects your claim.',

  questions: [
    {
      id: 'statute_of_frauds_info',
      type: 'info',
      prompt:
        'TEXAS STATUTE OF FRAUDS (Bus. & Com. Code §26.01):\nCertain contracts MUST be in writing to be enforceable:\n1. Contracts for the sale of real property (land, homes)\n2. Contracts that cannot be performed within one year\n3. Contracts to pay someone else\'s debt (guaranty)\n4. Contracts for the sale of goods over $500 (UCC §2.201)\n5. Leases lasting more than one year',
    },
    {
      id: 'contract_type',
      type: 'single_choice',
      prompt: 'What type of contract is this?',
      options: [
        { value: 'services', label: 'Services (can be completed within one year)' },
        { value: 'goods_under_500', label: 'Sale of goods under $500' },
        { value: 'goods_over_500', label: 'Sale of goods over $500' },
        { value: 'real_property', label: 'Sale of real property (land, home)' },
        { value: 'lease_over_year', label: 'Lease lasting more than one year' },
        { value: 'employment_over_year', label: 'Employment contract over one year' },
        { value: 'guaranty', label: 'Guaranty (promise to pay someone else\'s debt)' },
        { value: 'other', label: 'Other' },
      ],
    },
    {
      id: 'services_info',
      type: 'info',
      prompt:
        'SERVICES (completable within one year): A writing is generally NOT required. Oral service contracts are enforceable in Texas as long as you can prove the terms. However, a written contract is always stronger evidence.',
      showIf: (answers) => answers.contract_type === 'services',
    },
    {
      id: 'goods_under_500_info',
      type: 'info',
      prompt:
        'GOODS UNDER $500: A writing is NOT required. The UCC Statute of Frauds only applies to goods valued at $500 or more. Your oral agreement is enforceable.',
      showIf: (answers) => answers.contract_type === 'goods_under_500',
    },
    {
      id: 'goods_over_500_info',
      type: 'info',
      prompt:
        'GOODS OVER $500: A writing IS required under UCC §2.201. The writing must indicate a sale of goods, be signed by the party you\'re suing, and state a quantity. Exception: if the goods were specially manufactured for you, the Statute of Frauds may not apply.',
      showIf: (answers) => answers.contract_type === 'goods_over_500',
    },
    {
      id: 'real_property_info',
      type: 'info',
      prompt:
        'REAL PROPERTY: A writing IS required. Contracts for the sale of land, homes, or any interest in real property must be in writing. This is one of the strictest applications of the Statute of Frauds. Partial performance (e.g., paying earnest money, taking possession) may create an exception.',
      showIf: (answers) => answers.contract_type === 'real_property',
    },
    {
      id: 'lease_over_year_info',
      type: 'info',
      prompt:
        'LEASE OVER ONE YEAR: A writing IS required. Leases lasting more than one year fall under the Statute of Frauds. Month-to-month leases and leases under one year do not require a writing.',
      showIf: (answers) => answers.contract_type === 'lease_over_year',
    },
    {
      id: 'employment_over_year_info',
      type: 'info',
      prompt:
        'EMPLOYMENT OVER ONE YEAR: A writing IS required. If the employment contract cannot be performed within one year from the date it was made, it must be in writing. Note: if the contract COULD be completed within one year (even if unlikely), a writing is not required.',
      showIf: (answers) => answers.contract_type === 'employment_over_year',
    },
    {
      id: 'guaranty_info',
      type: 'info',
      prompt:
        'GUARANTY: A writing IS required. A promise to pay someone else\'s debt must be in writing. Exception: the "main purpose" doctrine — if the guarantor\'s main purpose was to benefit themselves (not just help the debtor), the oral promise may be enforceable.',
      showIf: (answers) => answers.contract_type === 'guaranty',
    },
    {
      id: 'other_info',
      type: 'info',
      prompt:
        'For other contract types, consider: Can the contract be performed within one year? Does it involve real property, goods over $500, or a guaranty? If none of these apply, a writing is likely not required — but having one always strengthens your case.',
      showIf: (answers) => answers.contract_type === 'other',
    },
    {
      id: 'has_written_contract',
      type: 'yes_no',
      prompt: 'Do you have a written contract?',
    },
    {
      id: 'no_writing_required_info',
      type: 'info',
      prompt:
        'Even without a written contract, your oral agreement is enforceable for this type of contract. However, you\'ll need to prove the terms through witness testimony, emails, texts, invoices, or other evidence of the agreement.',
      showIf: (answers) =>
        answers.has_written_contract === 'no' &&
        (answers.contract_type === 'services' || answers.contract_type === 'goods_under_500'),
    },
    {
      id: 'no_writing_sof_applies_info',
      type: 'info',
      prompt:
        'Your contract may be subject to the Statute of Frauds. But exceptions exist:\n- PARTIAL PERFORMANCE: If you\'ve already partially performed (paid money, delivered goods, started work), courts may enforce the oral agreement\n- WRITTEN CONFIRMATION: Emails, texts, or letters confirming the agreement may satisfy the \'writing\' requirement\n- PROMISSORY ESTOPPEL: If you reasonably relied on the promise to your detriment\n\nGather all emails, texts, and documents showing the agreement.',
      showIf: (answers) =>
        answers.has_written_contract === 'no' &&
        answers.contract_type !== 'services' &&
        answers.contract_type !== 'goods_under_500',
    },
    {
      id: 'has_emails_texts',
      type: 'yes_no',
      prompt: 'Do you have emails or texts discussing the agreement terms?',
    },
    {
      id: 'emails_texts_yes_info',
      type: 'info',
      prompt:
        'Good — emails and texts CAN satisfy the Statute of Frauds. They must show: the parties, the subject matter, and the essential terms. Print them and include in your evidence.',
      showIf: (answers) => answers.has_emails_texts === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    const writingRequired =
      answers.contract_type !== 'services' && answers.contract_type !== 'goods_under_500'

    if (answers.contract_type) {
      const labels: Record<string, string> = {
        services: 'Services contract — writing NOT required.',
        goods_under_500: 'Goods under $500 — writing NOT required.',
        goods_over_500: 'Goods over $500 — writing IS required (UCC §2.201).',
        real_property: 'Real property — writing IS required.',
        lease_over_year: 'Lease over one year — writing IS required.',
        employment_over_year: 'Employment over one year — writing IS required.',
        guaranty: 'Guaranty — writing IS required.',
        other: 'Other contract type — review Statute of Frauds applicability.',
      }
      items.push({ status: 'info', text: labels[answers.contract_type] })
    } else {
      items.push({ status: 'needed', text: 'Identify the type of contract.' })
    }

    if (answers.has_written_contract === 'yes') {
      items.push({ status: 'done', text: 'Written contract available.' })
    } else if (answers.has_written_contract === 'no') {
      if (writingRequired) {
        items.push({ status: 'needed', text: 'No written contract — Statute of Frauds may apply. Look for exceptions (partial performance, emails/texts, estoppel).' })
      } else {
        items.push({ status: 'info', text: 'No written contract, but writing not required for this type. Gather evidence of the oral agreement.' })
      }
    } else {
      items.push({ status: 'needed', text: 'Determine whether you have a written contract.' })
    }

    if (answers.has_emails_texts === 'yes') {
      items.push({ status: 'done', text: 'Emails/texts available — may satisfy Statute of Frauds writing requirement.' })
    } else if (answers.has_emails_texts === 'no' && writingRequired && answers.has_written_contract === 'no') {
      items.push({ status: 'needed', text: 'Search for any written communications (emails, texts, letters) confirming the agreement.' })
    }

    return items
  },
}
