import type { GuidedStepConfig } from '../types'

export const debtValidationLetterConfig: GuidedStepConfig = {
  title: 'Prepare Validation Letter',
  reassurance:
    'A validation letter is one of the most powerful tools in debt defense. It forces the collector to prove everything.',

  questions: [
    {
      id: 'have_creditor_address',
      type: 'yes_no',
      prompt: "Do you have the creditor's name and mailing address?",
      helpText:
        'You will need a physical address to send the validation letter via certified mail.',
    },
    {
      id: 'find_address_info',
      type: 'info',
      prompt:
        "Check any collection letters you have received — the creditor's name and address are required to be on them. You can also look at the original account statements, check the court filing if you have been sued, or search the creditor's name online for their correspondence address.",
      showIf: (answers) => answers.have_creditor_address === 'no',
    },
    {
      id: 'have_account_number',
      type: 'yes_no',
      prompt: 'Do you have the account number referenced by the collector?',
      helpText:
        'The account number helps identify the specific debt. It may be a different number than your original account.',
    },
    {
      id: 'first_contact_date',
      type: 'text',
      prompt: 'When did the collector first contact you about this debt?',
      placeholder: 'MM/DD/YYYY',
      helpText:
        'This date is critical because you have 30 days from first contact to request validation.',
    },
    {
      id: 'validation_deadline_info',
      type: 'info',
      prompt:
        'You have 30 days from first contact to request validation. After you send this letter, the collector must stop all collection activity until they provide proof of: (1) the original debt agreement, (2) the amount owed including all fees and interest, (3) their authority to collect, and (4) proof they are licensed to collect in your state. Send the letter via certified mail with return receipt requested so you have proof it was delivered.',
      showIf: (answers) => !!answers.first_contact_date,
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.have_creditor_address === 'yes') {
      items.push({
        status: 'done',
        text: 'You have the creditor name and mailing address.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Find the creditor name and mailing address from collection letters, account statements, or court filings.',
      })
    }

    if (answers.have_account_number === 'yes') {
      items.push({
        status: 'done',
        text: 'You have the account number.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Locate the account number from collection correspondence or original account records.',
      })
    }

    if (answers.first_contact_date) {
      const parts = answers.first_contact_date.split('/')
      const contactDate = new Date(`${parts[2]}-${parts[0]}-${parts[1]}`)
      const deadlineDate = new Date(contactDate)
      deadlineDate.setDate(deadlineDate.getDate() + 30)
      const now = new Date()

      if (now > deadlineDate) {
        items.push({
          status: 'info',
          text: `First contact: ${answers.first_contact_date}. The 30-day validation window has passed. You can still send a validation letter, but the collector is not legally required to stop collection while responding.`,
        })
      } else {
        const daysLeft = Math.ceil(
          (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )
        items.push({
          status: 'needed',
          text: `First contact: ${answers.first_contact_date}. You have approximately ${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining to send the validation letter within the 30-day window. Act quickly.`,
        })
      }
    }

    items.push({
      status: 'needed',
      text: 'Send the validation letter via certified mail with return receipt requested. Keep a copy of the letter and the mailing receipt.',
    })

    return items
  },
}
