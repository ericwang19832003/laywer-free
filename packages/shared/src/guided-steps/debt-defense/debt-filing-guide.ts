import type { GuidedStepConfig } from '../types'

export const debtFilingGuideConfig: GuidedStepConfig = {
  title: 'How to File Your Answer',
  reassurance:
    "Filing is simpler than it sounds. We'll walk you through every detail.",

  questions: [
    // Q1: Filing method
    {
      id: 'filing_method',
      type: 'single_choice',
      prompt: 'How do you want to file your answer?',
      helpText:
        'E-filing is the fastest option and available 24/7. In-person filing lets you get instant confirmation. Mail is the slowest but works if you cannot get to the courthouse.',
      options: [
        {
          value: 'efile',
          label: 'Online (eFileTexas.gov) — recommended',
        },
        {
          value: 'in_person',
          label: 'In person at the courthouse',
        },
        {
          value: 'mail',
          label: 'By mail',
        },
      ],
    },

    // eFile instructions
    {
      id: 'efile_instructions',
      type: 'info',
      showIf: (answers) => answers.filing_method === 'efile',
      prompt:
        'To file online:\n1. Go to eFileTexas.gov and create a free account\n2. Select your court and case number (from your citation)\n3. Upload your Answer as a PDF\n4. Submit the filing; there is usually no filing fee to file an Answer\n5. You\'ll receive a confirmation email when accepted\n\nTip: Most courts accept e-filed documents within 24 hours.',
      acknowledgeLabel: 'Got it, continue →',
    },

    // In-person instructions
    {
      id: 'in_person_instructions',
      type: 'info',
      showIf: (answers) => answers.filing_method === 'in_person',
      prompt:
        'To file in person:\n1. Print 3 copies of your Answer (one for the court, one for you, one to serve)\n2. Go to the court clerk\'s office during business hours (usually 8am-5pm)\n3. Tell the clerk: "I need to file an Answer in case number [your case number]"\n4. Ask the clerk to file-stamp all copies — keep your stamped copy as proof\n5. Ask the clerk if they can serve the plaintiff\'s attorney for you',
      acknowledgeLabel: 'Got it, continue →',
    },

    // Mail instructions
    {
      id: 'mail_instructions',
      type: 'info',
      showIf: (answers) => answers.filing_method === 'mail',
      prompt:
        'To file by mail:\n1. Print 3 copies of your Answer\n2. Include a self-addressed stamped envelope for the clerk to return your stamped copy\n3. Mail to the court clerk\'s office via certified mail with return receipt\n4. Keep the mailing receipt and confirm the clerk accepted the filing\n\nWarning: Mail takes time. File at least 5 days before your deadline to be safe.',
      acknowledgeLabel: 'Got it, continue →',
    },

    // Answer fee info
    {
      id: 'answer_fee_info',
      type: 'info',
      prompt:
        'There is usually no filing fee to file an Answer in a debt case. If you also file a counterclaim or counter-petition, ask the clerk whether a filing fee applies and whether you need a Statement of Inability to Afford Payment of Court Costs.',
      acknowledgeLabel: 'Got it, continue →',
    },

    // What to bring checklist
    {
      id: 'what_to_bring',
      type: 'multi_select',
      prompt: 'Which items have you prepared for filing?',
      options: [
        { value: 'signed_answer', label: 'Signed Answer (3 copies)' },
        { value: 'certificate_of_service', label: 'Certificate of Service (attached to Answer)' },
        { value: 'case_number', label: 'Case number (from the citation)' },
        { value: 'photo_id', label: 'Government-issued ID' },
        { value: 'original_citation', label: 'Original citation (for reference)' },
      ],
      noneLabel: "Haven't gathered these yet",
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Filing method
    const methodLabels: Record<string, string> = {
      efile: 'Online via eFileTexas.gov',
      in_person: 'In person at the courthouse',
      mail: 'By certified mail',
    }
    const method = methodLabels[answers.filing_method]
    if (method) {
      items.push({
        status: 'done',
        text: `Filing method selected: ${method}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Choose a filing method (online, in person, or by mail).',
      })
    }

    // Method-specific reminders
    if (answers.filing_method === 'efile') {
      items.push({
        status: 'needed',
        text: 'Create an account at eFileTexas.gov and upload your Answer as a PDF.',
      })
    } else if (answers.filing_method === 'in_person') {
      items.push({
        status: 'needed',
        text: 'Print 3 copies of your Answer and bring them to the court clerk during business hours (8am-5pm).',
      })
    } else if (answers.filing_method === 'mail') {
      items.push({
        status: 'needed',
        text: 'Mail 3 copies via certified mail with return receipt. Include a self-addressed stamped envelope. File at least 5 days before your deadline.',
      })
    }

    items.push({
      status: 'info',
      text: 'There is usually no filing fee to file an Answer. If you add a counterclaim, ask the clerk whether a filing fee or fee waiver form is required.',
    })

    // Filing checklist
    const bringAnswer = answers.what_to_bring
    if (bringAnswer && bringAnswer !== 'none') {
      const brought = new Set(bringAnswer.split(','))
      if (brought.size >= 4) {
        items.push({ status: 'done', text: 'Filing materials fully prepared.' })
      } else {
        items.push({ status: 'needed', text: `Gather remaining filing materials — ${5 - brought.size} item${5 - brought.size !== 1 ? 's' : ''} not yet checked off.` })
      }
    } else {
      items.push({ status: 'needed', text: 'Prepare filing materials: signed Answer (3 copies), Certificate of Service, case number, government ID, and original citation.' })
    }

    items.push({
      status: 'info',
      text: 'After filing, you must serve a copy of the Answer on the plaintiff or their attorney. Ask the court clerk about service options.',
    })

    return items
  },
}
