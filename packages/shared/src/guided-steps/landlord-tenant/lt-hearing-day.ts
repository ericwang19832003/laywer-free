import type { GuidedStepConfig } from '../types'

export const ltHearingDayConfig: GuidedStepConfig = {
  title: 'Hearing Day',
  reassurance:
    'Stay calm, be respectful, and present your case clearly.',

  questions: [
    {
      id: 'know_time_location',
      type: 'yes_no',
      prompt: 'Do you know when and where your hearing is?',
      helpText:
        'Check your citation or court notice for the date, time, and courtroom number. Arrive 30 minutes early.',
    },
    {
      id: 'have_documents',
      type: 'yes_no',
      prompt: 'Do you have all your documents and copies?',
      helpText:
        'Bring your evidence folder with 3 copies of everything, plus a pen and notepad.',
    },
    {
      id: 'hearing_procedure',
      type: 'info',
      prompt:
        'The judge will call your case. Both sides will be sworn in. Present your evidence calmly. Don\'t interrupt the other party. Let the judge guide the process.',
      helpText:
        'Landlord-tenant hearings in JP Court are usually 15\u201330 minutes. The judge may ask questions to both sides.',
    },
    {
      id: 'possible_outcomes_info',
      type: 'info',
      prompt:
        'Possible outcomes: the judge may rule in your favor, rule against you, or order mediation. For evictions, the judge may grant a "writ of possession" giving the tenant time to move.',
      helpText:
        'If the other party doesn\'t show up, you may win by default judgment.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.know_time_location === 'yes') {
      items.push({ status: 'done', text: 'Hearing time and location confirmed.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Confirm your hearing date, time, and courtroom number from the court notice.',
      })
    }

    if (answers.have_documents === 'yes') {
      items.push({ status: 'done', text: 'Documents and copies are ready.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Prepare your evidence folder with 3 copies of all documents.',
      })
    }

    items.push({
      status: 'info',
      text: 'Arrive 30 minutes early. Dress professionally. Turn off your phone.',
    })

    items.push({
      status: 'info',
      text: 'Present your case chronologically. Stay calm and respectful, even if you disagree with the other party.',
    })

    return items
  },
}
