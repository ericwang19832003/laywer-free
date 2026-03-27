import type { GuidedStepConfig } from '../types'

export const bizDiscoveryGuideConfig: GuidedStepConfig = {
  title: 'Discovery in Business Disputes',
  reassurance:
    'Discovery is where business cases are won. Getting the right financial records and communications is your strongest weapon.',

  questions: [
    {
      id: 'dispute_category',
      type: 'single_choice',
      prompt: 'What type of business dispute is this discovery for?',
      options: [
        { value: 'contract', label: 'Contract breach (B2B)' },
        { value: 'partnership', label: 'Partnership or LLC dispute' },
        { value: 'trade_secret', label: 'Trade secret misappropriation' },
        { value: 'fraud', label: 'Business fraud or misrepresentation' },
        { value: 'employment', label: 'Employment dispute' },
        { value: 'other', label: 'Other business dispute' },
      ],
    },
    {
      id: 'financial_docs',
      type: 'single_choice',
      prompt: 'Which financial documents do you need most urgently?',
      helpText:
        'Financial records are the backbone of business litigation. Request these early because production often takes 30+ days.',
      options: [
        { value: 'statements', label: 'Financial statements (P&L, balance sheet, cash flow)' },
        { value: 'bank', label: 'Bank records and account statements' },
        { value: 'tax', label: 'Tax returns (business and personal)' },
        { value: 'all', label: 'All of the above' },
      ],
    },
    {
      id: 'rfp_financial_template',
      type: 'info',
      prompt:
        'Sample Requests for Production — Financial Records:\n\nRFP No. 1: All financial statements, including profit and loss statements, balance sheets, and cash flow statements, for [Company Name] for the period [date range].\n\nRFP No. 2: All bank account statements, deposit slips, cancelled checks, and wire transfer records for any account held by or in the name of [Company Name] for the period [date range].\n\nRFP No. 3: All federal and state tax returns, including all schedules and attachments, filed by or on behalf of [Company Name] for tax years [years].\n\nRFP No. 4: All general ledgers, journals, and accounting records maintained by or on behalf of [Company Name] for the period [date range].\n\nRFP No. 5: All invoices, purchase orders, and receipts related to [specific transaction or category] for the period [date range].',
    },
    {
      id: 'communications_needed',
      type: 'yes_no',
      prompt: 'Do you need to obtain the other side\u2019s internal communications?',
    },
    {
      id: 'ediscovery_scope',
      type: 'single_choice',
      prompt: 'What types of electronic communications are relevant?',
      showIf: (answers) => answers.communications_needed === 'yes',
      options: [
        { value: 'email', label: 'Emails only' },
        { value: 'email_text', label: 'Emails and text messages' },
        { value: 'all_digital', label: 'All digital (email, texts, Slack, Teams, social media)' },
      ],
    },
    {
      id: 'rfp_communications_template',
      type: 'info',
      prompt:
        'Sample Requests for Production — Communications:\n\nRFP No. 6: All emails, including attachments, sent to or from [person/department] concerning [subject matter] for the period [date range].\n\nRFP No. 7: All text messages, instant messages, and chat communications (including Slack, Microsoft Teams, and WhatsApp) between [persons] concerning [subject matter] for the period [date range].\n\nRFP No. 8: All internal memoranda, reports, and presentations concerning [subject matter] for the period [date range].\n\nTip: Include a litigation hold letter demanding preservation of all electronic communications. Destruction of evidence after litigation is reasonably anticipated can result in spoliation sanctions.',
      showIf: (answers) => answers.communications_needed === 'yes',
    },
    {
      id: 'contracts_needed',
      type: 'yes_no',
      prompt: 'Do you need to obtain contracts, agreements, or amendments from the other side?',
    },
    {
      id: 'rfp_contracts_template',
      type: 'info',
      prompt:
        'Sample Requests for Production — Contracts:\n\nRFP No. 9: All contracts, agreements, amendments, addenda, and side letters between [parties] concerning [subject matter], including all drafts and redlines.\n\nRFP No. 10: All documents relating to the negotiation of [specific contract], including correspondence, term sheets, proposals, and meeting notes.',
      showIf: (answers) => answers.contracts_needed === 'yes',
    },
    {
      id: 'interrogatories_needed',
      type: 'yes_no',
      prompt: 'Do you want to send written interrogatories (questions under oath)?',
      helpText:
        'Texas allows 25 interrogatories per party (including subparts). Use them strategically for information you cannot get from documents alone.',
    },
    {
      id: 'interrogatory_template',
      type: 'info',
      prompt:
        'Sample Interrogatories for Business Disputes:\n\nNo. 1: Identify all persons with knowledge of the facts relating to [the dispute/transaction], including their name, title, employer, and the subject of their knowledge.\n\nNo. 2: State in detail the factual basis for each affirmative defense raised in your Answer.\n\nNo. 3: Identify all bank accounts (by institution, account number, and account holder name) into which any revenue from [the business/transaction] was deposited during [date range].\n\nNo. 4: State the total amount of revenue received from [specific source/customer] during [date range], broken down by month.\n\nNo. 5: Identify all damages you claim, the amount of each category of damages, and the method of calculation.\n\nRemember: Texas limits you to 25 interrogatories total (Tex. R. Civ. P. 197.1). Use them wisely.',
      showIf: (answers) => answers.interrogatories_needed === 'yes',
    },
    {
      id: 'deposition_targets',
      type: 'single_choice',
      prompt: 'Who is the most important person to depose?',
      helpText:
        'In business disputes, deposing the right person is critical. You can also notice a corporate representative deposition (Tex. R. Civ. P. 199.2(b)(1)) to force the company to designate a witness on specific topics.',
      options: [
        { value: 'cfo', label: 'CFO or financial officer' },
        { value: 'partner', label: 'Partner or co-owner' },
        { value: 'decision_maker', label: 'Key decision-maker for the disputed transaction' },
        { value: 'corporate_rep', label: 'Corporate representative (Rule 199.2(b)(1))' },
        { value: 'multiple', label: 'Multiple witnesses needed' },
      ],
    },
    {
      id: 'privilege_concerns',
      type: 'single_choice',
      prompt: 'Are there privilege issues you expect the other side to raise?',
      options: [
        { value: 'attorney_client', label: 'Attorney-client privilege' },
        { value: 'trade_secret', label: 'Trade secret privilege' },
        { value: 'both', label: 'Both attorney-client and trade secret' },
        { value: 'none', label: 'No significant privilege issues expected' },
      ],
    },
    {
      id: 'privilege_note',
      type: 'info',
      prompt:
        'When the other side claims privilege:\n\n• Demand a privilege log identifying each withheld document, the privilege claimed, and the basis\n• Challenge overbroad privilege claims — the "crime-fraud exception" pierces attorney-client privilege if the communication furthered a crime or fraud\n• For trade secret claims, request a protective order rather than allowing wholesale withholding — the court can order production under a "for attorneys\u2019 eyes only" designation\n• If they claim trade secret privilege over information central to your claims, move to compel with a briefing on why the information is essential',
      showIf: (answers) =>
        answers.privilege_concerns === 'attorney_client' ||
        answers.privilege_concerns === 'trade_secret' ||
        answers.privilege_concerns === 'both',
    },
    {
      id: 'third_party_subpoenas',
      type: 'yes_no',
      prompt: 'Do you need records from third parties (banks, accountants, vendors)?',
      helpText:
        'Third-party subpoenas duces tecum can be served on banks, CPAs, customers, vendors, and IT providers. They must comply or file a motion to quash within the time specified.',
    },
    {
      id: 'subpoena_targets',
      type: 'single_choice',
      prompt: 'Which third party\u2019s records are most critical?',
      showIf: (answers) => answers.third_party_subpoenas === 'yes',
      options: [
        { value: 'banks', label: 'Banks or financial institutions' },
        { value: 'accountants', label: 'Accountants or CPAs' },
        { value: 'customers', label: 'Customers or clients' },
        { value: 'vendors', label: 'Vendors or suppliers' },
        { value: 'it_providers', label: 'IT providers or cloud services' },
      ],
    },
    {
      id: 'protective_order',
      type: 'yes_no',
      prompt: 'Does this case involve confidential business information that needs a protective order?',
      helpText:
        'A protective order limits who can see confidential business documents produced in discovery. Standard tiers: "Confidential" (attorneys + parties) and "Attorneys\u2019 Eyes Only" (attorneys + experts only).',
    },
    {
      id: 'protective_order_note',
      type: 'info',
      prompt:
        'File an Agreed Protective Order early in the case. Standard provisions should include:\n\n• "Confidential" tier — viewable by attorneys, parties, and testifying experts\n• "Attorneys\u2019 Eyes Only" tier — viewable only by attorneys and consulting experts\n• Prohibition on using confidential information for any purpose outside the litigation\n• Procedure for challenging designations\n• Return or destruction of confidential materials at case conclusion\n\nMost courts prefer agreed protective orders. Draft one and propose it to opposing counsel.',
      showIf: (answers) => answers.protective_order === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.dispute_category) {
      const labels: Record<string, string> = {
        contract: 'Contract breach (B2B)',
        partnership: 'Partnership or LLC dispute',
        trade_secret: 'Trade secret misappropriation',
        fraud: 'Business fraud or misrepresentation',
        employment: 'Employment dispute',
        other: 'Other business dispute',
      }
      items.push({
        status: 'info',
        text: `Dispute type: ${labels[answers.dispute_category] ?? answers.dispute_category}.`,
      })
    }

    if (answers.financial_docs) {
      items.push({
        status: 'needed',
        text: 'Serve Requests for Production for financial records (statements, bank records, tax returns).',
      })
    }

    if (answers.communications_needed === 'yes') {
      const scope: Record<string, string> = {
        email: 'emails',
        email_text: 'emails and text messages',
        all_digital: 'all digital communications (email, texts, Slack, Teams)',
      }
      items.push({
        status: 'needed',
        text: `Request ${scope[answers.ediscovery_scope ?? ''] ?? 'electronic communications'} and send a litigation hold letter.`,
      })
    }

    if (answers.contracts_needed === 'yes') {
      items.push({
        status: 'needed',
        text: 'Request all contracts, amendments, and negotiation documents.',
      })
    }

    if (answers.interrogatories_needed === 'yes') {
      items.push({
        status: 'needed',
        text: 'Draft and serve interrogatories (25 max under Tex. R. Civ. P. 197.1).',
      })
    }

    if (answers.deposition_targets) {
      const labels: Record<string, string> = {
        cfo: 'CFO or financial officer',
        partner: 'Partner or co-owner',
        decision_maker: 'Key decision-maker',
        corporate_rep: 'Corporate representative (Rule 199.2(b)(1))',
        multiple: 'Multiple witnesses',
      }
      items.push({
        status: 'needed',
        text: `Schedule deposition of: ${labels[answers.deposition_targets] ?? answers.deposition_targets}.`,
      })
    }

    if (
      answers.privilege_concerns === 'attorney_client' ||
      answers.privilege_concerns === 'trade_secret' ||
      answers.privilege_concerns === 'both'
    ) {
      items.push({
        status: 'info',
        text: 'Expect privilege objections — demand a privilege log and challenge overbroad claims.',
      })
    }

    if (answers.third_party_subpoenas === 'yes') {
      const labels: Record<string, string> = {
        banks: 'banks or financial institutions',
        accountants: 'accountants or CPAs',
        customers: 'customers or clients',
        vendors: 'vendors or suppliers',
        it_providers: 'IT providers or cloud services',
      }
      items.push({
        status: 'needed',
        text: `Serve third-party subpoena duces tecum on ${labels[answers.subpoena_targets ?? ''] ?? 'third parties'}.`,
      })
    }

    if (answers.protective_order === 'yes') {
      items.push({
        status: 'needed',
        text: 'Draft and propose an Agreed Protective Order with Confidential and Attorneys\u2019 Eyes Only tiers.',
      })
    }

    return items
  },
}
