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
        'To file online:\n1. Go to eFileTexas.gov and create a free account\n2. Select your court and case number (from your citation)\n3. Upload your Answer as a PDF\n4. Pay the filing fee online (or submit fee waiver)\n5. You\'ll receive a confirmation email when accepted\n\nTip: Most courts accept e-filed documents within 24 hours.',
    },

    // In-person instructions
    {
      id: 'in_person_instructions',
      type: 'info',
      showIf: (answers) => answers.filing_method === 'in_person',
      prompt:
        'To file in person:\n1. Print 3 copies of your Answer (one for the court, one for you, one to serve)\n2. Go to the court clerk\'s office during business hours (usually 8am-5pm)\n3. Tell the clerk: "I need to file an Answer in case number [your case number]"\n4. Pay the filing fee (or bring a completed fee waiver form)\n5. The clerk will stamp all copies — keep your stamped copy as proof\n6. Ask the clerk if they can serve the plaintiff\'s attorney for you',
    },

    // Mail instructions
    {
      id: 'mail_instructions',
      type: 'info',
      showIf: (answers) => answers.filing_method === 'mail',
      prompt:
        'To file by mail:\n1. Print 3 copies of your Answer\n2. Include a self-addressed stamped envelope for the clerk to return your stamped copy\n3. Mail to the court clerk\'s office via certified mail with return receipt\n4. Include a check or money order for the filing fee (or fee waiver form)\n\nWarning: Mail takes time. File at least 5 days before your deadline to be safe.',
    },

    // Fee affordability
    {
      id: 'can_afford_fee',
      type: 'yes_no',
      prompt: 'Can you afford the filing fee?',
      helpText:
        'JP Court fees are typically $35-54. County/District Court fees are $250-400.',
    },

    // Fee waiver info
    {
      id: 'fee_waiver_info',
      type: 'info',
      showIf: (answers) => answers.can_afford_fee === 'no',
      prompt:
        'You can file a "Statement of Inability to Afford Payment of Court Costs" (sometimes called Affidavit of Indigency). This is an official Texas form (OCA form).\n\n1. Download the form from texaslawhelp.org or ask the court clerk\n2. Fill it out honestly — include your income, expenses, and why you can\'t pay\n3. File it WITH your Answer (same time)\n4. The court will review it — most are approved within a few days\n5. If approved, you pay $0. If denied, you can appeal the denial.',
    },

    // What to bring checklist
    {
      id: 'what_to_bring',
      type: 'info',
      prompt:
        'Checklist — what to bring when filing:\n\n- Your Answer (3 copies, signed)\n- Certificate of Service (attached to Answer)\n- Your case number (from the citation you received)\n- Filing fee payment or fee waiver form\n- Government-issued ID\n- A pen (in case you need to sign anything)\n- The original citation (so you can reference the case number and court)',
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

    // Fee waiver
    if (answers.can_afford_fee === 'yes') {
      items.push({
        status: 'done',
        text: 'Filing fee: prepared to pay.',
      })
    } else if (answers.can_afford_fee === 'no') {
      items.push({
        status: 'needed',
        text: 'Download and complete the Statement of Inability to Afford Payment of Court Costs (OCA form) from texaslawhelp.org. File it together with your Answer.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Determine if you can afford the filing fee. Fee waivers are available if you qualify.',
      })
    }

    // Universal reminders
    items.push({
      status: 'needed',
      text: 'Bring your case number, government-issued ID, and the original citation when filing.',
    })

    items.push({
      status: 'info',
      text: 'After filing, you must serve a copy of the Answer on the plaintiff or their attorney. Ask the court clerk about service options.',
    })

    return items
  },
}
