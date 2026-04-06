import type { GuidedStepConfig } from '../types'

export const debtServiceGuideConfig: GuidedStepConfig = {
  title: 'How to Serve Your Answer on the Plaintiff',
  reassurance:
    "Service just means giving the other side a copy of what you filed. It's required by law, but it's straightforward.",

  questions: [
    {
      id: 'service_method',
      type: 'single_choice',
      prompt: "How will you serve your Answer on the plaintiff's attorney?",
      options: [
        {
          value: 'efile',
          label:
            'Electronically (if you e-filed, this happens automatically)',
        },
        {
          value: 'certified_mail',
          label: 'Certified mail with return receipt',
        },
        {
          value: 'hand_delivery',
          label: 'Hand delivery to their office',
        },
      ],
    },
    {
      id: 'efile_service_info',
      type: 'info',
      showIf: (answers) => answers.service_method === 'efile',
      prompt:
        "Good news! If you filed through eFileTexas.gov and the plaintiff's attorney is registered, service happens automatically. You'll see a \"Service\" confirmation in your e-filing receipt. Keep this receipt — it's your proof of service.",
    },
    {
      id: 'certified_mail_info',
      type: 'info',
      showIf: (answers) => answers.service_method === 'certified_mail',
      prompt:
        'To serve by certified mail:\n1. Go to your local post office\n2. Ask for "certified mail with return receipt requested" (green card)\n3. Address it to the PLAINTIFF\'S ATTORNEY (name and address from your court papers)\n4. Mail a copy of your Answer WITH the Certificate of Service attached\n5. Keep the certified mail receipt AND the green return receipt card when it comes back\n6. Cost: approximately $10-15\n\nImportant: Do this the SAME DAY you file your Answer with the court.',
    },
    {
      id: 'hand_delivery_info',
      type: 'info',
      showIf: (answers) => answers.service_method === 'hand_delivery',
      prompt:
        "To serve by hand delivery:\n1. Bring a copy of your Answer with Certificate of Service to the attorney's office\n2. Ask the receptionist to accept service\n3. Ask them to SIGN or STAMP your extra copy with the date received\n4. If no one is available, leave it with any person at the office and note who accepted it\n\nKeep your signed/stamped copy as proof of delivery.",
    },
    {
      id: 'timing_info',
      type: 'info',
      prompt:
        "CRITICAL TIMING: You must serve the plaintiff's attorney on the same day you file, or before. Courts require proof that you served the other side. If you file but don't serve, your Answer may be rejected.\n\nThe easiest approach: File and serve on the SAME DAY.",
    },
    {
      id: 'have_attorney_address',
      type: 'yes_no',
      prompt:
        "Do you know the plaintiff's attorney's name and mailing address?",
      helpText:
        'This is usually on the first page of the petition/complaint you received, or on the citation.',
    },
    {
      id: 'find_attorney_info',
      type: 'info',
      showIf: (answers) => answers.have_attorney_address === 'no',
      prompt:
        "To find the attorney's address:\n1. Check the petition/complaint (first page, usually top or bottom)\n2. Check the citation (the document that was served on you)\n3. Call the court clerk and ask for the attorney of record\n4. Search the Texas State Bar website (texasbar.com/AM/Template.cfm?Section=Find_A_Lawyer) with the attorney's name\n\nIf no attorney is listed, the plaintiff may be pro se — serve them directly at the address on the petition.",
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.service_method === 'efile') {
      items.push({
        status: 'done',
        text: 'Service will happen automatically through eFileTexas.',
      })
    } else if (answers.service_method === 'certified_mail') {
      items.push({
        status: 'needed',
        text: "Send Answer via certified mail to plaintiff's attorney on the same day you file.",
      })
    } else {
      items.push({
        status: 'needed',
        text: "Hand-deliver Answer to plaintiff's attorney's office on the same day you file.",
      })
    }

    items.push({
      status: 'needed',
      text: 'Attach Certificate of Service to your Answer before filing.',
    })

    items.push({
      status: 'info',
      text: 'Keep ALL receipts and proof of service — you may need them later.',
    })

    return items
  },
}
