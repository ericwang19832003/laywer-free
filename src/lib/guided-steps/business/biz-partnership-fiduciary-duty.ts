import type { GuidedStepConfig } from '../types'

export const bizPartnershipFiduciaryDutyConfig: GuidedStepConfig = {
  title: 'Partnership Fiduciary Duty Claims',
  reassurance:
    'Partners owe each other the highest duty in law — loyalty, honesty, and good faith. If your partner breached that duty, the law is on your side.',

  questions: [
    {
      id: 'partnership_type',
      type: 'single_choice',
      prompt: 'What type of business entity is involved?',
      helpText:
        'Under the Texas Business Organizations Code (TBOC) §152.204–207, partners in a general partnership owe fiduciary duties of care and loyalty.',
      options: [
        { value: 'general', label: 'General partnership' },
        { value: 'lp', label: 'Limited partnership (LP)' },
        { value: 'llc', label: 'LLC treated as partnership' },
        { value: 'informal', label: 'Informal / handshake partnership' },
      ],
    },
    {
      id: 'breach_category',
      type: 'single_choice',
      prompt: 'What type of fiduciary breach occurred?',
      options: [
        { value: 'self_dealing', label: 'Self-dealing — partner benefited at the partnership\u2019s expense' },
        { value: 'usurping', label: 'Usurped a partnership opportunity for personal gain' },
        { value: 'commingling', label: 'Commingled partnership funds with personal accounts' },
        { value: 'secret_profits', label: 'Earned secret profits or undisclosed compensation' },
        { value: 'competing', label: 'Competed with the partnership' },
        { value: 'concealment', label: 'Concealed material information from partners' },
        { value: 'multiple', label: 'Multiple breaches' },
      ],
    },
    {
      id: 'self_dealing_detail',
      type: 'text',
      prompt: 'Briefly describe the self-dealing transaction.',
      placeholder: 'e.g., Partner awarded a contract to their own separate company at inflated prices',
      showIf: (answers) =>
        answers.breach_category === 'self_dealing' || answers.breach_category === 'multiple',
    },
    {
      id: 'duty_of_care',
      type: 'yes_no',
      prompt: 'Did the partner act with gross negligence or recklessness in managing the business?',
      helpText:
        'The duty of care (TBOC §152.206) requires partners to act with the care an ordinarily prudent person would exercise. Liability requires gross negligence, not mere poor judgment.',
    },
    {
      id: 'duty_of_loyalty',
      type: 'yes_no',
      prompt: 'Did the partner put their personal interests ahead of the partnership\u2019s interests?',
      helpText:
        'The duty of loyalty (TBOC §152.205) prohibits partners from competing with the partnership, engaging in self-dealing, or usurping partnership opportunities.',
    },
    {
      id: 'accounting_obligations',
      type: 'yes_no',
      prompt: 'Has the partner refused to provide an accounting of partnership finances?',
      helpText:
        'Under TBOC §152.211, every partner has the right to a formal accounting. Refusal is itself evidence of breach.',
    },
    {
      id: 'has_evidence_financial',
      type: 'yes_no',
      prompt: 'Do you have financial evidence of the breach (bank records, invoices, tax returns)?',
    },
    {
      id: 'has_evidence_communications',
      type: 'yes_no',
      prompt: 'Do you have communications showing the partner\u2019s intent or knowledge (emails, texts, recordings)?',
    },
    {
      id: 'has_evidence_witnesses',
      type: 'yes_no',
      prompt: 'Are there witnesses (employees, clients, other partners) who can testify about the breach?',
    },
    {
      id: 'fraud_involved',
      type: 'yes_no',
      prompt: 'Did the partner\u2019s conduct involve fraud, dishonesty, or intentional misrepresentation?',
      helpText:
        'If fraud is involved, you may be entitled to punitive damages in addition to actual damages. Texas does not cap punitive damages in fraud cases involving fiduciary relationships.',
    },
    {
      id: 'damages_info',
      type: 'info',
      prompt:
        'Available damages for fiduciary duty breach:\n\n• Lost profits — what the partnership lost due to the breach\n• Disgorgement — the breaching partner must surrender all secret profits and benefits received\n• Punitive damages — available if the breach involved fraud, malice, or gross negligence\n• Constructive trust — court can impose a trust over assets obtained through breach\n• Accounting — court-ordered full accounting of all partnership finances\n• Attorney fees — recoverable under TBOC or if fraud is proven',
    },
    {
      id: 'seek_injunction',
      type: 'yes_no',
      prompt: 'Is the partner continuing to engage in harmful conduct right now?',
    },
    {
      id: 'injunction_note',
      type: 'info',
      prompt:
        'You should seek emergency injunctive relief. File a petition for a Temporary Restraining Order (TRO) to freeze partnership accounts and prevent further dissipation of assets. Include a request for a temporary injunction hearing within 14 days.',
      showIf: (answers) => answers.seek_injunction === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.partnership_type) {
      const labels: Record<string, string> = {
        general: 'General partnership',
        lp: 'Limited partnership',
        llc: 'LLC treated as partnership',
        informal: 'Informal / handshake partnership',
      }
      items.push({
        status: 'info',
        text: `Entity type: ${labels[answers.partnership_type] ?? answers.partnership_type}.`,
      })
    }

    if (answers.breach_category) {
      const labels: Record<string, string> = {
        self_dealing: 'Self-dealing',
        usurping: 'Usurped partnership opportunity',
        commingling: 'Commingled funds',
        secret_profits: 'Secret profits',
        competing: 'Competing with the partnership',
        concealment: 'Concealment of material information',
        multiple: 'Multiple fiduciary breaches',
      }
      items.push({
        status: 'info',
        text: `Breach type: ${labels[answers.breach_category] ?? answers.breach_category}.`,
      })
    }

    if (answers.duty_of_loyalty === 'yes') {
      items.push({
        status: 'info',
        text: 'Duty of loyalty breached (TBOC §152.205) — partner prioritized personal interests.',
      })
    }

    if (answers.duty_of_care === 'yes') {
      items.push({
        status: 'info',
        text: 'Duty of care breached (TBOC §152.206) — gross negligence or recklessness.',
      })
    }

    if (answers.accounting_obligations === 'yes') {
      items.push({
        status: 'needed',
        text: 'Demand a formal accounting under TBOC §152.211 or seek a court-ordered accounting.',
      })
    }

    const evidenceCount =
      (answers.has_evidence_financial === 'yes' ? 1 : 0) +
      (answers.has_evidence_communications === 'yes' ? 1 : 0) +
      (answers.has_evidence_witnesses === 'yes' ? 1 : 0)

    if (evidenceCount === 3) {
      items.push({ status: 'done', text: 'Strong evidence base: financial records, communications, and witnesses.' })
    } else if (evidenceCount > 0) {
      const missing: string[] = []
      if (answers.has_evidence_financial !== 'yes') missing.push('financial records')
      if (answers.has_evidence_communications !== 'yes') missing.push('communications')
      if (answers.has_evidence_witnesses !== 'yes') missing.push('witness testimony')
      items.push({
        status: 'needed',
        text: `Strengthen evidence — still need: ${missing.join(', ')}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Gather evidence: financial records, communications, and witness testimony.',
      })
    }

    if (answers.fraud_involved === 'yes') {
      items.push({
        status: 'info',
        text: 'Fraud involved — punitive damages and attorney fees may be recoverable.',
      })
    }

    if (answers.seek_injunction === 'yes') {
      items.push({
        status: 'needed',
        text: 'Seek emergency TRO to freeze accounts and stop ongoing harmful conduct.',
      })
    }

    return items
  },
}
