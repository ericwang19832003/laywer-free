import type { GuidedStepConfig } from '../types'

export const piMedicalImprovementConfig: GuidedStepConfig = {
  title: 'When to Settle — Maximum Medical Improvement',
  reassurance:
    'Timing your settlement correctly can mean the difference between a fair recovery and leaving money on the table.',

  questions: [
    {
      id: 'mmi_overview',
      type: 'info',
      prompt:
        'MAXIMUM MEDICAL IMPROVEMENT (MMI) is when your doctor says you\'ve recovered as much as you\'re going to. This is the RIGHT time to settle — not before.\n\nSettling before MMI means you might not know your full medical costs. Settling after MMI means you have complete documentation.',
      acknowledgeLabel: 'I understand MMI timing',
    },
    {
      id: 'reached_mmi',
      type: 'yes_no',
      prompt: 'Has your doctor said you\'ve reached Maximum Medical Improvement (MMI)?',
      helpText:
        'MMI doesn\'t mean you\'re fully healed — it means your condition has stabilized and further significant improvement is not expected.',
    },
    {
      id: 'not_mmi_warning',
      type: 'info',
      prompt:
        'DON\'T SETTLE YET. Wait until your doctor confirms:\n- Your condition has stabilized\n- Future treatment needs are known\n- A disability rating (if applicable) has been assigned\n\nTell the insurance adjuster: \'I\'m still treating. I\'ll make a demand when my treatment is complete.\'',
      acknowledgeLabel: "I will not settle before reaching MMI",
      showIf: (answers) => answers.reached_mmi === 'no',
    },
    {
      id: 'mmi_ready_checklist',
      type: 'multi_select',
      prompt: 'Which of these do you have ready to calculate your demand?',
      helpText: "Check what you have. Anything unchecked needs to be gathered before you send a demand letter.",
      noneLabel: "I haven't gathered any of these yet",
      options: [
        { value: 'medical_records', label: 'All medical records from every treating provider' },
        { value: 'medical_bills', label: 'All medical bills (full billed amounts, not just what insurance paid)' },
        { value: 'final_report', label: "Doctor's final report or discharge summary with prognosis" },
        { value: 'disability_rating', label: 'Permanent disability or impairment rating (if applicable)' },
        { value: 'symptom_log', label: 'Documentation of ongoing symptoms and how they affect daily life' },
      ],
      showIf: (answers) => answers.reached_mmi === 'yes',
    },
    {
      id: 'still_treating',
      type: 'yes_no',
      prompt: 'Are you still treating with any doctors?',
      helpText:
        'This includes follow-up visits, physical therapy, pain management, mental health treatment, or any ongoing care.',
    },
    {
      id: 'still_treating_info',
      type: 'info',
      prompt:
        'Document every ongoing treatment visit and cost. These are part of your future damages claim.\n\nKeep a treatment log:\n- Date of each visit\n- Provider name and specialty\n- Treatment received\n- Cost (even if insurance covers it — the full billed amount matters)\n- How you felt before and after\n\nYour ongoing treatment costs strengthen your demand by showing the injury\'s lasting impact.',
      acknowledgeLabel: "I'll keep a treatment log",
      showIf: (answers) => answers.still_treating === 'yes',
    },
    {
      id: 'not_treating_info',
      type: 'info',
      prompt:
        'If you\'ve finished treatment and reached MMI, you have everything you need to calculate your full damages and send a demand letter. Gather all your records and proceed to the damages calculation step.',
      acknowledgeLabel: "I'll proceed to damages calculation",
      showIf: (answers) =>
        answers.still_treating === 'no' && answers.reached_mmi === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.reached_mmi === 'yes') {
      items.push({
        status: 'done',
        text: 'Reached Maximum Medical Improvement — ready to calculate full damages.',
      })
    } else if (answers.reached_mmi === 'no') {
      items.push({
        status: 'needed',
        text: 'DO NOT settle yet. Wait until your doctor confirms you\'ve reached MMI.',
      })
    }

    if (answers.still_treating === 'yes') {
      items.push({
        status: 'needed',
        text: 'Keep a treatment log documenting every visit, cost, and how the injury affects your daily life.',
      })

      if (answers.reached_mmi === 'yes') {
        items.push({
          status: 'info',
          text: 'Include ongoing treatment costs in your future damages estimate when calculating your demand.',
        })
      }
    } else if (answers.still_treating === 'no' && answers.reached_mmi === 'yes') {
      items.push({
        status: 'done',
        text: 'Treatment complete. Gather all medical records and bills for your demand calculation.',
      })
    }

    if (answers.reached_mmi === 'yes') {
      const allDocs = ['medical_records', 'medical_bills', 'final_report', 'disability_rating', 'symptom_log']
      if (answers.mmi_ready_checklist && answers.mmi_ready_checklist !== 'none') {
        const have = new Set(answers.mmi_ready_checklist.split(','))
        const missing = allDocs.filter((d) => !have.has(d))
        if (missing.length === 0) {
          items.push({ status: 'done', text: 'All demand documentation gathered — ready to calculate and send your demand.' })
        } else {
          items.push({ status: 'needed', text: `Gather ${missing.length} remaining document type${missing.length !== 1 ? 's' : ''} before sending your demand letter.` })
        }
      } else if (answers.mmi_ready_checklist === 'none') {
        items.push({ status: 'needed', text: 'Gather all medical records, bills, final report, disability rating, and symptom documentation before calculating your demand.' })
      } else {
        items.push({
          status: 'info',
          text: 'Next step: Collect all medical records, bills, and disability ratings, then proceed to calculate your damages.',
        })
      }
    } else if (answers.reached_mmi === 'no') {
      items.push({
        status: 'info',
        text: 'If the insurance adjuster pressures you to settle, say: "I\'m still under medical care. I\'ll present my demand when treatment is complete."',
      })
    }

    return items
  },
}
