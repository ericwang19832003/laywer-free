import type { GuidedStepConfig } from '../types'

export const otherReviewAnswerConfig: GuidedStepConfig = {
  title: 'Review the Other Party\'s Answer',
  reassurance:
    'Understanding the other party\'s response helps you prepare your strategy. Take your time reading through each part.',

  questions: [
    {
      id: 'read_answer',
      type: 'yes_no',
      prompt: 'Have you read the other party\'s answer in full?',
    },
    {
      id: 'read_tip',
      type: 'info',
      prompt:
        'Read the entire answer carefully, including any attached exhibits. Note which of your claims they admit, deny, or claim insufficient knowledge about.',
      showIf: (answers) => answers.read_answer === 'no',
    },
    {
      id: 'raises_defenses',
      type: 'yes_no',
      prompt: 'Does the answer raise any affirmative defenses?',
    },
    {
      id: 'defense_info',
      type: 'info',
      prompt:
        'Common affirmative defenses include: statute of limitations, failure to state a claim, comparative fault, waiver, or estoppel. Each defense shifts some burden to the other party to prove. Make a list of every defense raised so you can address each one.',
      showIf: (answers) => answers.raises_defenses === 'yes',
    },
    {
      id: 'has_counterclaims',
      type: 'yes_no',
      prompt: 'Did the other party file any counterclaims against you?',
    },
    {
      id: 'counterclaim_info',
      type: 'info',
      prompt:
        'A counterclaim means the other party is now suing you as part of the same case. You will need to file a response to their counterclaim, usually within the same timeframe they had to answer your claims. Take this seriously even if you believe it has no merit.',
      showIf: (answers) => answers.has_counterclaims === 'yes',
    },
    {
      id: 'understand_next_steps',
      type: 'yes_no',
      prompt: 'Do you understand what happens next in the case?',
    },
    {
      id: 'next_steps_info',
      type: 'info',
      prompt:
        'After the answer is filed, cases typically move into discovery (exchanging documents and information), followed by possible mediation, pre-trial motions, and eventually trial. The court may set a scheduling conference to establish deadlines.',
      showIf: (answers) => answers.understand_next_steps === 'no',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.read_answer === 'yes') {
      items.push({ status: 'done', text: 'Other party\'s answer reviewed.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Read the other party\'s answer in full, noting admissions, denials, and claims of insufficient knowledge.',
      })
    }

    if (answers.raises_defenses === 'yes') {
      items.push({
        status: 'needed',
        text: 'List each affirmative defense raised and research how to counter them.',
      })
    } else if (answers.raises_defenses === 'no') {
      items.push({
        status: 'done',
        text: 'No affirmative defenses raised.',
      })
    }

    if (answers.has_counterclaims === 'yes') {
      items.push({
        status: 'needed',
        text: 'File a response to the counterclaim within the court\'s deadline.',
      })
    } else if (answers.has_counterclaims === 'no') {
      items.push({
        status: 'done',
        text: 'No counterclaims filed.',
      })
    }

    if (answers.understand_next_steps === 'yes') {
      items.push({ status: 'done', text: 'Next steps understood.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Review the typical case progression: discovery, mediation, pre-trial motions, and trial.',
      })
    }

    return items
  },
}
