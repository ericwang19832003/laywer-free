import type { GuidedStepConfig } from '../types'

export const debtHearingDayConfig: GuidedStepConfig = {
  title: 'Hearing Day',
  reassurance: "You've prepared. Stay calm and let the facts speak.",

  questions: [
    {
      id: 'know_time_location',
      type: 'yes_no',
      prompt: 'Do you know when and where your hearing is?',
      helpText:
        'Check your court notice for the date, time, and courtroom number. If you are unsure, call the court clerk to confirm.',
    },
    {
      id: 'have_documents',
      type: 'yes_no',
      prompt: 'Do you have all your evidence and copies?',
      helpText:
        'Bring the original plus at least two copies of every document (one for the judge, one for the opposing side).',
    },
    {
      id: 'courtroom_etiquette',
      type: 'info',
      prompt:
        "Address the judge as 'Your Honor.' Stand when speaking. Don't interrupt. Dress professionally. Arrive 30 minutes early.",
    },
    {
      id: 'creditor_tactics_info',
      type: 'info',
      prompt:
        'Watch for: last-minute document production, requests for continuances, or pressure to settle in the hallway. You can ask the judge for time to review any new documents.',
    },
    {
      id: 'possible_outcomes',
      type: 'info',
      prompt:
        'Possible outcomes: case dismissed (you win), judgment for plaintiff (you may owe), judgment for you, or the parties settle. The judge may also continue the case to another date.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.know_time_location === 'yes') {
      items.push({ status: 'done', text: 'You know when and where your hearing is.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Confirm the date, time, and location of your hearing with the court clerk.',
      })
    }

    if (answers.have_documents === 'yes') {
      items.push({ status: 'done', text: 'Evidence and copies are ready.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Gather all your evidence and make copies (one for the judge, one for the opposing side).',
      })
    }

    items.push({
      status: 'info',
      text: "Arrive 30 minutes early. Dress professionally. Address the judge as 'Your Honor.'",
    })

    items.push({
      status: 'info',
      text: 'Watch for last-minute document production or pressure to settle in the hallway.',
    })

    items.push({
      status: 'info',
      text: 'Possible outcomes: dismissal, judgment for either side, settlement, or continuance.',
    })

    return items
  },
}
