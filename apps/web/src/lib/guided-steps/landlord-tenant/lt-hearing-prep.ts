import type { GuidedStepConfig } from '../types'

export const ltHearingPrepConfig: GuidedStepConfig = {
  title: 'Prepare for Your Hearing',
  reassurance:
    'Being organized and prepared gives you the best chance of success.',

  questions: [
    {
      id: 'have_lease',
      type: 'yes_no',
      prompt: 'Do you have a copy of the lease agreement?',
      helpText:
        'The lease is your most important document. If you have an oral lease, write down the key terms you agreed to.',
    },
    {
      id: 'have_photos',
      type: 'yes_no',
      prompt: 'Do you have photos of the property condition?',
      helpText:
        'Photos showing damage, needed repairs, or the condition at move-in/move-out are very persuasive evidence.',
    },
    {
      id: 'have_rent_records',
      type: 'yes_no',
      prompt: 'Do you have records of all rent payments?',
      helpText:
        'Bank statements, receipts, or cancelled checks showing payment history.',
    },
    {
      id: 'have_repair_requests',
      type: 'yes_no',
      prompt: 'Do you have copies of any repair requests you made?',
      helpText:
        'Text messages, emails, or letters requesting repairs are important evidence.',
    },
    {
      id: 'copies_made',
      type: 'yes_no',
      prompt: 'Have you made copies of all documents for the judge?',
      helpText:
        'The court expects you to provide copies so everyone can follow along.',
    },
    {
      id: 'copy_reminder',
      type: 'info',
      prompt:
        'Bring 3 copies of everything: one for you, one for the judge, one for the other party.',
      helpText:
        'This is standard court procedure and shows you are well-prepared.',
      showIf: (answers) => answers.copies_made === 'no',
    },
    {
      id: 'practiced_presentation',
      type: 'yes_no',
      prompt: 'Have you organized your evidence in chronological order?',
      helpText:
        'Telling your story in order (lease signed, problem started, what you did about it) is the most effective approach.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.have_lease === 'yes') {
      items.push({ status: 'done', text: 'Lease agreement ready.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Find your lease agreement or write down the oral lease terms you agreed to.',
      })
    }

    if (answers.have_photos === 'yes') {
      items.push({ status: 'done', text: 'Property photos ready.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Take or gather photos of the property condition to support your case.',
      })
    }

    if (answers.have_rent_records === 'yes') {
      items.push({ status: 'done', text: 'Rent payment records ready.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Collect records of all rent payments (bank statements, receipts, cancelled checks).',
      })
    }

    if (answers.have_repair_requests === 'yes') {
      items.push({ status: 'done', text: 'Repair request records ready.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Gather copies of any repair requests you sent (texts, emails, letters).',
      })
    }

    if (answers.copies_made === 'yes') {
      items.push({ status: 'done', text: 'Document copies made for court.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Make 3 copies of all documents: one for you, one for the judge, one for the other party.',
      })
    }

    if (answers.practiced_presentation === 'yes') {
      items.push({ status: 'done', text: 'Evidence organized chronologically.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Organize your evidence in chronological order for a clear presentation.',
      })
    }

    return items
  },
}
