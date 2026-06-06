import type { GuidedStepConfig } from '../types'

export const debtHearingPrepDeepConfig: GuidedStepConfig = {
  title: 'Prepare for Your Hearing',
  reassurance:
    "Preparation is your biggest advantage. Most debt collectors expect you won't show up or won't be ready.",

  questions: [
    {
      id: 'which_court',
      type: 'single_choice',
      prompt: 'Which court is your hearing in?',
      helpText:
        'This affects the procedures, formality level, and rules you need to follow.',
      options: [
        { value: 'jp_court', label: 'Justice of the Peace (JP) court' },
        { value: 'county_court', label: 'County court / County court at law' },
        { value: 'district_court', label: 'District court' },
      ],
    },
    {
      id: 'jp_court_info',
      type: 'info',
      prompt:
        'JP court is the most informal. There is no jury unless you request one. The judge will usually let you explain your side in plain language. Strict rules of evidence may be relaxed but you should still bring organized documents. Cases are typically for amounts under $20,000. Hearings are usually short — 15 to 30 minutes. Arrive early and check in with the court clerk.',
      acknowledgeLabel: 'Got it, continue →',
      showIf: (answers) => answers.which_court === 'jp_court',
    },
    {
      id: 'county_court_info',
      type: 'info',
      prompt:
        'County court follows formal rules of civil procedure and evidence. You may face motions, objections, and more structured proceedings. The judge expects proper legal etiquette — stand when speaking, address the judge as "Your Honor," and wait to be recognized before speaking. Cases in county court are typically between $20,000 and $250,000 (county court at law) or up to $500 for small claims in regular county court. Prepare for a longer hearing.',
      acknowledgeLabel: 'Got it, continue →',
      showIf: (answers) => answers.which_court === 'county_court',
    },
    {
      id: 'district_court_info',
      type: 'info',
      prompt:
        'District court is the most formal. Strict rules of evidence and procedure apply. The opposing side will likely have an attorney who is experienced in court. Consider whether you need legal representation. If you proceed on your own, study the Texas Rules of Civil Procedure and the Texas Rules of Evidence. District court handles cases over $250,000 or cases with specific subject matter jurisdiction.',
      acknowledgeLabel: 'Got it, continue →',
      showIf: (answers) => answers.which_court === 'district_court',
    },
    {
      id: 'evidence_organized',
      type: 'yes_no',
      prompt: 'Have you organized your evidence into a folder or binder?',
      helpText:
        'Having organized evidence makes you look prepared and helps you find documents quickly when the judge asks questions.',
    },
    {
      id: 'organize_evidence_info',
      type: 'info',
      prompt:
        'Organize your evidence now. Create labeled tabs or sections for: (1) your answer/response filing, (2) the original debt documents or lack thereof, (3) payment records and bank statements, (4) all correspondence with the collector, (5) your validation letter and any response, (6) any evidence of FDCPA violations. Make three copies of everything — one for you, one for the judge, and one for the opposing party.',
      acknowledgeLabel: "I'll organize my evidence now →",
      showIf: (answers) => answers.evidence_organized === 'no',
    },
    {
      id: 'know_judge_rules',
      type: 'yes_no',
      prompt:
        "Do you know the judge's specific rules or standing orders for your court?",
      helpText:
        'Many judges have specific preferences for how hearings are conducted, how evidence is submitted, and what they expect from parties.',
    },
    {
      id: 'judge_rules_info',
      type: 'info',
      prompt:
        "Check the court's website for the judge's standing orders or rules of court. You can also call the court clerk and ask if the judge has any specific requirements. Some judges require exhibits to be pre-marked and exchanged with the opposing party before the hearing. Some require a witness list. Knowing these rules in advance prevents surprises.",
      acknowledgeLabel: "I'll check the judge's rules →",
      showIf: (answers) => answers.know_judge_rules === 'no',
    },
    {
      id: 'what_to_bring',
      type: 'multi_select',
      prompt: 'Which items have you prepared for your hearing?',
      options: [
        { value: 'three_copies', label: '3 copies of all evidence and documents' },
        { value: 'stamped_answer', label: 'Filed answer with court clerk stamp' },
        { value: 'written_outline', label: 'Written outline of key arguments and defenses' },
        { value: 'photo_id', label: 'Government-issued photo ID' },
        { value: 'court_notice', label: 'Court notice or citation (with date, time, courtroom)' },
        { value: 'subpoenaed_docs', label: 'Subpoenaed documents or witnesses (if applicable)' },
      ],
      noneLabel: "Haven't gathered these yet",
    },
    {
      id: 'what_not_to_say',
      type: 'info',
      prompt:
        'What NOT to say or do at your hearing: (1) Never admit the debt amount is correct — even casually. Say "I dispute the amount" if asked. (2) Never agree to a payment plan on the spot. Ask for time to review any proposed agreement. (3) Do not discuss details of your case in the hallway with opposing counsel without understanding the implications — anything you say can be used against you. (4) Do not get emotional or argue with the opposing attorney. Address all statements to the judge. (5) Do not volunteer information that was not asked for. Answer questions directly and briefly. (6) Never say "I know I owe the money but..." — this is an admission that can destroy your defenses.',
      acknowledgeLabel: "I'll avoid these mistakes at my hearing",
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    const courtLabels: Record<string, string> = {
      jp_court: 'Justice of the Peace court (informal procedures)',
      county_court: 'County court (formal rules of procedure and evidence)',
      district_court: 'District court (most formal, strict rules apply)',
    }

    const court = courtLabels[answers.which_court] || 'Not selected'
    items.push({
      status: 'done',
      text: `Court: ${court}.`,
    })

    if (answers.evidence_organized === 'yes') {
      items.push({
        status: 'done',
        text: 'Evidence is organized.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Organize your evidence into a labeled binder with three copies (you, judge, opposing party).',
      })
    }

    if (answers.know_judge_rules === 'yes') {
      items.push({
        status: 'done',
        text: "You have reviewed the judge's rules.",
      })
    } else {
      items.push({
        status: 'needed',
        text: "Check the court website or call the clerk to learn the judge's standing orders and hearing procedures.",
      })
    }

    const bringAnswer = answers.what_to_bring
    if (bringAnswer && bringAnswer !== 'none') {
      const brought = new Set(bringAnswer.split(','))
      if (brought.size >= 5) {
        items.push({ status: 'done', text: 'Hearing materials fully prepared.' })
      } else {
        items.push({ status: 'needed', text: `Gather remaining hearing materials — ${6 - brought.size} item${6 - brought.size !== 1 ? 's' : ''} not yet checked off.` })
      }
    } else {
      items.push({ status: 'needed', text: 'Prepare hearing materials: 3 copies of all documents, filed answer, written outline, photo ID, and court notice.' })
    }

    items.push({
      status: 'info',
      text: 'Remember: do not admit the debt amount, do not agree to a payment plan on the spot, and do not discuss your case in the hallway with opposing counsel.',
    })

    items.push({
      status: 'needed',
      text: 'Arrive at least 30 minutes early. Check in with the court clerk. Review your outline one final time before the hearing begins.',
    })

    return items
  },
}
