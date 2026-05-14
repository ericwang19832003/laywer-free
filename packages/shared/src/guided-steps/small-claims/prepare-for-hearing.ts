import type { GuidedStepConfig } from '../types'

export const prepareForHearingConfig: GuidedStepConfig = {
  title: 'Prepare for Your Hearing',
  reassurance:
    'Good preparation makes a big difference in small claims court.',

  questions: [
    {
      id: 'evidence_organized',
      type: 'yes_no',
      prompt: 'Do you have all your evidence organized?',
    },
    {
      id: 'copies_made',
      type: 'yes_no',
      prompt: 'Have you made copies for the judge and the defendant?',
      showIf: (answers) => answers.evidence_organized === 'yes',
    },
    {
      id: 'copy_info',
      type: 'info',
      prompt:
        'Bring 3 copies of everything: one for you, one for the judge, one for the defendant.',
      showIf: (answers) => answers.copies_made === 'no',
    },
    {
      id: 'practiced_explanation',
      type: 'yes_no',
      prompt:
        'Have you practiced explaining your case in 5 minutes or less?',
    },
    {
      id: 'practice_info',
      type: 'info',
      prompt:
        'The judge will give you limited time. Practice telling your story: what happened, what you lost, what you\'re asking for.',
      showIf: (answers) => answers.practiced_explanation === 'no',
    },
    {
      id: 'know_what_judge_expects',
      type: 'yes_no',
      prompt: 'Do you know what the judge expects?',
    },
    {
      id: 'judge_info',
      type: 'info',
      prompt:
        "Be concise, stick to facts, don't argue with the other side. Let the judge ask questions. Be respectful.",
      showIf: (answers) => answers.know_what_judge_expects === 'no',
    },
  ],

  noviceExplanation: {
    why: 'A small claims hearing is your one chance to tell the judge your story — preparation makes you credible and dramatically improves your outcome.',
    whatNext: 'After preparing, you\'ll attend the hearing and present your case to the judge.',
    glossaryTerms: [
      { term: 'Plaintiff', plain: 'The person who filed the lawsuit — that\'s you if you started this case.' },
      { term: 'Defendant', plain: 'The person being sued — the other side in your case.' },
      { term: 'Exhibit', plain: 'A document or item you show the judge as evidence, usually labeled Exhibit A, B, C, etc.' },
    ],
  },
  suggestedChatQuestions: [
    'What do I say when the judge asks me to speak?',
    'What if I get nervous and forget something?',
    'Can I bring a friend or family member for support?',
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.evidence_organized === 'yes') {
      items.push({ status: 'done', text: 'Evidence is organized.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Organize all your evidence before the hearing.',
      })
    }

    if (answers.copies_made === 'yes') {
      items.push({
        status: 'done',
        text: 'Copies made for the judge and defendant.',
      })
    } else if (answers.evidence_organized === 'yes') {
      items.push({
        status: 'needed',
        text: 'Make 3 copies of everything: one for you, one for the judge, one for the defendant.',
      })
    }

    if (answers.practiced_explanation === 'yes') {
      items.push({
        status: 'done',
        text: 'Practiced explaining your case concisely.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Practice explaining your case in 5 minutes or less: what happened, what you lost, what you want.',
      })
    }

    if (answers.know_what_judge_expects === 'yes') {
      items.push({
        status: 'done',
        text: 'You know what the judge expects.',
      })
    } else {
      items.push({
        status: 'needed',
        text: "Learn courtroom expectations: be concise, stick to facts, don't argue with the other side, be respectful.",
      })
    }

    return items
  },
}
