import type { GuidedStepConfig } from './types'

export const trialPrepChecklistConfig: GuidedStepConfig = {
  title: 'Trial Preparation Checklist',
  reassurance:
    'Careful preparation is the key to presenting your case confidently.',

  questions: [
    {
      id: 'pretrial_motions_filed',
      type: 'yes_no',
      prompt: 'Have you filed all necessary pre-trial motions?',
    },
    {
      id: 'exhibits_organized',
      type: 'yes_no',
      prompt: 'Are your exhibits organized, labeled, and numbered?',
    },
    {
      id: 'exhibit_copies',
      type: 'yes_no',
      prompt:
        'Have you made copies of all exhibits for the judge and opposing party?',
      showIf: (answers) => answers.exhibits_organized === 'yes',
    },
    {
      id: 'witness_list_prepared',
      type: 'yes_no',
      prompt: 'Have you prepared your witness list?',
    },
    {
      id: 'witnesses_notified',
      type: 'yes_no',
      prompt: 'Have you notified your witnesses of the trial date?',
      showIf: (answers) => answers.witness_list_prepared === 'yes',
    },
    {
      id: 'visited_courtroom',
      type: 'yes_no',
      prompt:
        'Have you visited the courtroom beforehand to know the layout?',
    },
    {
      id: 'opening_statement',
      type: 'yes_no',
      prompt: 'Have you drafted your opening statement?',
    },
    {
      id: 'closing_argument',
      type: 'yes_no',
      prompt: 'Have you drafted your closing argument?',
    },
    {
      id: 'case_law_reviewed',
      type: 'yes_no',
      prompt: 'Have you reviewed relevant case law and statutes?',
    },
    {
      id: 'courtroom_etiquette',
      type: 'info',
      prompt:
        "Address the judge as 'Your Honor.' Stand when speaking. Don't interrupt. Dress professionally.",
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed'; text: string }[] = []

    if (answers.pretrial_motions_filed === 'yes') {
      items.push({ status: 'done', text: 'Pre-trial motions filed.' })
    } else {
      items.push({
        status: 'needed',
        text: 'File all necessary pre-trial motions before the deadline.',
      })
    }

    if (answers.exhibits_organized === 'yes') {
      items.push({ status: 'done', text: 'Exhibits organized, labeled, and numbered.' })
      if (answers.exhibit_copies === 'yes') {
        items.push({ status: 'done', text: 'Exhibit copies prepared for judge and opposing party.' })
      } else {
        items.push({
          status: 'needed',
          text: 'Make copies of all exhibits for the judge and opposing party.',
        })
      }
    } else {
      items.push({
        status: 'needed',
        text: 'Organize, label, and number all your exhibits.',
      })
    }

    if (answers.witness_list_prepared === 'yes') {
      items.push({ status: 'done', text: 'Witness list prepared.' })
      if (answers.witnesses_notified === 'yes') {
        items.push({ status: 'done', text: 'Witnesses notified of the trial date.' })
      } else {
        items.push({
          status: 'needed',
          text: 'Notify all your witnesses of the trial date.',
        })
      }
    } else {
      items.push({
        status: 'needed',
        text: 'Prepare your witness list.',
      })
    }

    if (answers.visited_courtroom === 'yes') {
      items.push({ status: 'done', text: 'Courtroom visited and layout is familiar.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Visit the courtroom beforehand to familiarize yourself with the layout.',
      })
    }

    if (answers.opening_statement === 'yes') {
      items.push({ status: 'done', text: 'Opening statement drafted.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Draft your opening statement.',
      })
    }

    if (answers.closing_argument === 'yes') {
      items.push({ status: 'done', text: 'Closing argument drafted.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Draft your closing argument.',
      })
    }

    if (answers.case_law_reviewed === 'yes') {
      items.push({ status: 'done', text: 'Relevant case law and statutes reviewed.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Review relevant case law and statutes for your case.',
      })
    }

    return items
  },
}
