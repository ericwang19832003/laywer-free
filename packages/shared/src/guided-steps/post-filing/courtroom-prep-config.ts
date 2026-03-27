import type { GuidedStepConfig } from '../types'

export const courtroomPrepConfig: GuidedStepConfig = {
  title: 'Prepare for Your Hearing',
  reassurance: "Let's make sure you're ready for court day.",

  questions: [
    {
      id: 'know_court_location',
      type: 'yes_no',
      prompt: 'Do you know where the courthouse is and how to get there?',
      helpText:
        'Visit the courthouse before your hearing date if possible. Know the courtroom number.',
    },
    {
      id: 'court_location_tip',
      type: 'info',
      prompt:
        'Arrive 30 minutes early. Bring a valid photo ID. Dress professionally — business casual or better.',
    },
    {
      id: 'documents_organized',
      type: 'yes_no',
      prompt: 'Are all your documents organized and ready to present?',
      helpText:
        'Bring at least 3 copies of everything: one for you, one for the judge, one for the other party.',
    },
    {
      id: 'know_what_to_say',
      type: 'yes_no',
      prompt: 'Have you practiced what you want to tell the judge?',
      helpText:
        'Keep it brief, factual, and organized. Judges appreciate concise presentations.',
    },
    {
      id: 'etiquette_tips',
      type: 'info',
      prompt:
        'In court: Stand when the judge enters. Say "Your Honor" when addressing the judge. Wait your turn to speak. Stay calm and respectful, even if the other side is not.',
    },
    {
      id: 'witnesses_ready',
      type: 'yes_no',
      prompt: 'If you have witnesses, have they confirmed they will attend?',
      helpText:
        'Witnesses should be prepared to testify about specific facts, not opinions.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.know_court_location === 'yes') {
      items.push({ status: 'done', text: 'You know your courthouse location.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Look up your courthouse address and courtroom number before the hearing.',
      })
    }

    if (answers.documents_organized === 'yes') {
      items.push({ status: 'done', text: 'Documents are organized and ready.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Organize all documents and make 3 copies of everything.',
      })
    }

    if (answers.know_what_to_say === 'yes') {
      items.push({ status: 'done', text: 'You have practiced your presentation.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Practice explaining your case: keep it brief, factual, and organized.',
      })
    }

    if (answers.witnesses_ready === 'yes') {
      items.push({ status: 'done', text: 'Witnesses are confirmed to attend.' })
    } else if (answers.witnesses_ready === 'no') {
      items.push({
        status: 'needed',
        text: 'Confirm your witnesses will attend and prepare them to testify about facts.',
      })
    }

    items.push({
      status: 'info',
      text: 'Arrive 30 minutes early. Address the judge as "Your Honor." Stay calm and respectful.',
    })

    return items
  },
}
