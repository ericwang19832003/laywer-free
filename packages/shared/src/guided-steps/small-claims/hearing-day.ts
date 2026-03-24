import type { GuidedStepConfig } from '../types'

export const hearingDayConfig: GuidedStepConfig = {
  title: 'Hearing Day',
  reassurance:
    "You're prepared. Stay calm and present your case clearly.",

  questions: [
    {
      id: 'know_time_location',
      type: 'yes_no',
      prompt: 'Do you know when and where your hearing is?',
    },
    {
      id: 'arrived_early',
      type: 'info',
      prompt:
        'Arrive 30 minutes early to find parking, go through security, and locate your courtroom.',
    },
    {
      id: 'have_all_documents',
      type: 'yes_no',
      prompt: 'Do you have all your documents and copies with you?',
    },
    {
      id: 'hearing_procedure',
      type: 'info',
      prompt:
        "The judge will call your case. You'll be sworn in. Present your side first (if plaintiff). Show evidence when relevant. The defendant gets their turn. The judge may ask questions.",
    },
    {
      id: 'know_after_hearing',
      type: 'yes_no',
      prompt: 'Do you know what happens after the hearing?',
    },
    {
      id: 'after_info',
      type: 'info',
      prompt:
        "The judge may rule immediately or mail the decision. If you win, the defendant has 21 days to pay. If they don't, you can pursue collection. If you lose, you have 21 days to file an appeal.",
      showIf: (answers) => answers.know_after_hearing === 'no',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.know_time_location === 'yes') {
      items.push({
        status: 'done',
        text: 'You know your hearing time and location.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Confirm the date, time, and location of your hearing.',
      })
    }

    if (answers.have_all_documents === 'yes') {
      items.push({
        status: 'done',
        text: 'All documents and copies are ready.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Gather all your documents and make copies before you leave.',
      })
    }

    if (answers.know_after_hearing === 'yes') {
      items.push({
        status: 'done',
        text: 'You know what to expect after the hearing.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Review what happens after the hearing: ruling timeline, payment deadline, and appeal options.',
      })
    }

    items.push({
      status: 'info',
      text: 'Arrive 30 minutes early to find parking, go through security, and locate your courtroom.',
    })

    return items
  },
}
