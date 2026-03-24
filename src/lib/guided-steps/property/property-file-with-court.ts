import type { GuidedStepConfig } from '../types'

export const propertyFileWithCourtConfig: GuidedStepConfig = {
  title: 'File Your Property Petition with the Court',
  reassurance:
    'Filing officially starts your property dispute case. We\'ll walk you through the process step by step.',

  questions: [
    {
      id: 'filing_method',
      type: 'single_choice',
      prompt: 'How do you plan to file your petition?',
      options: [
        { value: 'efiling', label: 'E-filing (online)' },
        { value: 'in_person', label: 'In person at the courthouse' },
        { value: 'not_sure', label: 'I\'m not sure' },
      ],
    },
    {
      id: 'efiling_info',
      type: 'info',
      prompt:
        'Texas requires e-filing in most courts. Use eFileTexas.gov to submit your petition electronically. You will need to create an account and pay the filing fee online. E-filing provides instant confirmation.',
      showIf: (answers) => answers.filing_method === 'efiling',
    },
    {
      id: 'in_person_info',
      type: 'info',
      prompt:
        'Some courts (especially JP courts) still accept in-person filings. Bring your petition, any exhibits, and payment for the filing fee. Ask the clerk if they accept cash, check, or credit card.',
      showIf: (answers) => answers.filing_method === 'in_person',
    },
    {
      id: 'not_sure_info',
      type: 'info',
      prompt:
        'Most Texas courts require e-filing through eFileTexas.gov. Check your county court\'s website or call the clerk\'s office to confirm their filing requirements for property disputes.',
      showIf: (answers) => answers.filing_method === 'not_sure',
    },
    {
      id: 'filing_fee_paid',
      type: 'single_choice',
      prompt: 'Have you paid the filing fee?',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'fee_waiver', label: 'I need a fee waiver' },
      ],
    },
    {
      id: 'fee_info',
      type: 'info',
      prompt:
        'Filing fees for property disputes vary by court. District court cases typically cost $250-$350. County court cases are usually $150-$250. JP court fees are lower. You will also need to pay for service of process.',
    },
    {
      id: 'fee_waiver_info',
      type: 'info',
      prompt:
        'If you cannot afford the filing fee, you can request a fee waiver by filing a "Statement of Inability to Afford Payment of Court Costs." The court will review your financial situation and may waive the fees.',
      showIf: (answers) => answers.filing_fee_paid === 'fee_waiver',
    },
    {
      id: 'lis_pendens_filed',
      type: 'single_choice',
      prompt: 'Have you filed a lis pendens (notice of pending suit) on the property?',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'not_sure', label: 'I\'m not sure what that is' },
      ],
    },
    {
      id: 'lis_pendens_info',
      type: 'info',
      prompt:
        'A lis pendens puts the public on notice that the property is subject to a lawsuit. This prevents the other party from selling or transferring the property to avoid the judgment. In Texas, file it with the county clerk where the property is located.',
      showIf: (answers) => answers.lis_pendens_filed !== 'yes',
    },
    {
      id: 'filing_confirmed',
      type: 'yes_no',
      prompt: 'Have you received confirmation that your petition was accepted and filed?',
    },
    {
      id: 'cause_number',
      type: 'text',
      prompt: 'What is your cause number (case number)?',
      helpText:
        'You\'ll find this on the court\'s filing confirmation or stamped petition.',
      placeholder: 'e.g. 2024-CV-12345',
      showIf: (answers) => answers.filing_confirmed === 'yes',
    },
    {
      id: 'not_confirmed_info',
      type: 'info',
      prompt:
        'If you e-filed, check your eFileTexas account for the filing status. If you filed in person, the clerk should have given you a file-stamped copy with your cause number. Call the clerk\'s office if you have not received confirmation.',
      showIf: (answers) => answers.filing_confirmed === 'no',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.filing_method) {
      const labels: Record<string, string> = {
        efiling: 'e-filing',
        in_person: 'in-person filing',
        not_sure: 'undecided',
      }
      items.push({
        status: answers.filing_method !== 'not_sure' ? 'done' : 'needed',
        text: `Filing method: ${labels[answers.filing_method]}.`,
      })
    }

    if (answers.filing_fee_paid === 'yes') {
      items.push({ status: 'done', text: 'Filing fee paid.' })
    } else if (answers.filing_fee_paid === 'fee_waiver') {
      items.push({ status: 'needed', text: 'File a Statement of Inability to Afford Payment of Court Costs for a fee waiver.' })
    } else {
      items.push({ status: 'needed', text: 'Pay the filing fee.' })
    }

    if (answers.lis_pendens_filed === 'yes') {
      items.push({ status: 'done', text: 'Lis pendens filed on the property.' })
    } else {
      items.push({ status: 'needed', text: 'Consider filing a lis pendens to prevent transfer of the property during litigation.' })
    }

    if (answers.filing_confirmed === 'yes') {
      const causeInfo = answers.cause_number ? ` (Cause No. ${answers.cause_number})` : ''
      items.push({ status: 'done', text: `Petition accepted and filed${causeInfo}. Next step: serve the other party.` })
    } else {
      items.push({ status: 'needed', text: 'Confirm your petition was accepted. Check your e-filing account or call the clerk.' })
    }

    return items
  },
}
