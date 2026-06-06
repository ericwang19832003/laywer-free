import type { GuidedStepConfig } from '../types'

export const debtCourtroomGuideConfig: GuidedStepConfig = {
  title: 'What to Expect at Your Hearing',
  reassurance:
    "Most defendants don't know what happens in court. After reading this, you'll know more than most. That's your advantage.",

  questions: [
    {
      id: 'court_type',
      type: 'single_choice',
      prompt: 'Which court is your hearing in?',
      options: [
        { value: 'jp', label: 'Justice of the Peace (JP) Court' },
        { value: 'county', label: 'County Court' },
        { value: 'district', label: 'District Court' },
        { value: 'unsure', label: "I'm not sure" },
      ],
    },
    {
      id: 'jp_info',
      type: 'info',
      showIf: (answers) => answers.court_type === 'jp',
      prompt:
        "JP Court is the most informal. The judge sits at a desk, not a bench. You can speak normally — no legal jargon needed. There's no jury unless you requested one. The hearing usually lasts 15-30 minutes.\n\nThe process:\n1. Both sides sit and wait to be called\n2. Judge calls your case number\n3. Plaintiff (or their lawyer) presents first — they must prove you owe the money\n4. You get to respond — present your defenses\n5. Judge makes a decision (sometimes immediately, sometimes by mail)\n\nDress: Business casual. No hats, no tank tops.",
      acknowledgeLabel: 'Got it, continue →',
    },
    {
      id: 'formal_court_info',
      type: 'info',
      showIf: (answers) =>
        answers.court_type === 'county' ||
        answers.court_type === 'district',
      prompt:
        'County and District courts are more formal. Address the judge as "Your Honor." Stand when speaking. The hearing may take 30-60 minutes.\n\nThe process:\n1. Check in with the court clerk or bailiff when you arrive\n2. Wait in the gallery (audience seating) until your case is called\n3. When called, come to the front table on the defendant\'s side (usually the RIGHT side)\n4. Plaintiff presents their case first — listen carefully, don\'t interrupt\n5. You present your defense — state your name, then your arguments\n6. Judge may ask questions\n7. Decision may come immediately or by mail',
      acknowledgeLabel: 'Got it, continue →',
    },
    {
      id: 'unsure_court_info',
      type: 'info',
      showIf: (answers) => answers.court_type === 'unsure',
      prompt:
        'Check your citation or petition for the court name. It will say "Justice Court," "County Court at Law," or "District Court." You can also call the court clerk with your case number and they will tell you. Knowing your court type helps you prepare properly.',
      acknowledgeLabel: "I'll look up my court type →",
    },
    {
      id: 'defense_type',
      type: 'single_choice',
      prompt: 'What is your main defense at the hearing?',
      helpText: 'Select the defense you will present to the judge. If you have multiple defenses, choose the strongest one — you can mention others too.',
      options: [
        { value: 'sol', label: 'Statute of limitations has expired' },
        { value: 'standing', label: 'Plaintiff cannot prove they own the debt' },
        { value: 'fdcpa', label: 'Collector violated the FDCPA or TDCPA' },
        { value: 'general', label: 'General denial — challenging them to prove their case' },
      ],
    },
    {
      id: 'script_opening',
      type: 'info',
      prompt:
        "When the judge asks you to present, say:\n\n\"Your Honor, my name is [your name]. I am the defendant in this case. I filed a general denial and I have [number] defenses to present.\"\n\nSpeak slowly and clearly. Address the judge as \"Your Honor\" — not \"sir,\" \"ma'am,\" or by name.",
      acknowledgeLabel: "Got it — I'll use this opening →",
    },
    {
      id: 'script_sol',
      type: 'info',
      showIf: (answers) => answers.defense_type === 'sol',
      prompt:
        'STATUTE OF LIMITATIONS SCRIPT:\n\n"Your Honor, the statute of limitations on this debt has expired. Under Texas Civil Practice and Remedies Code Section 16.004, the limitations period is [4/6] years. The last activity on this account was [date], which is more than [4/6] years ago. This debt is time-barred and the case should be dismissed."\n\nHand the judge your account statement showing the last payment date.',
      acknowledgeLabel: "Got it, I'll use this script →",
    },
    {
      id: 'script_standing',
      type: 'info',
      showIf: (answers) => answers.defense_type === 'standing',
      prompt:
        'LACK OF STANDING SCRIPT:\n\n"Your Honor, the plaintiff has not proven they own this debt. I sent a debt validation letter on [date] and they [did not respond / could not provide proof of assignment]. Without a complete chain of assignment from the original creditor to the plaintiff, they have no legal authority to collect this debt."\n\nHand the judge your validation letter and any response (or lack of response) you received.',
      acknowledgeLabel: "Got it, I'll use this script →",
    },
    {
      id: 'script_fdcpa',
      type: 'info',
      showIf: (answers) => answers.defense_type === 'fdcpa',
      prompt:
        'FDCPA / TDCPA VIOLATION SCRIPT:\n\n"Your Honor, the debt collector violated the Fair Debt Collection Practices Act by [describe violation — e.g., calling before 8am, threatening arrest, misrepresenting the amount]. I have evidence of this violation and I am asserting it as a defense and counterclaim under FDCPA § 1692k and Texas Finance Code Ch. 392."\n\nHand the judge your evidence (call logs, letters, voicemails).',
      acknowledgeLabel: "Got it, I'll use this script →",
    },
    {
      id: 'dont_say_info',
      type: 'info',
      prompt:
        'WHAT NOT TO SAY:\n\n- "I know I owe the money, but..." — This admits the debt\n- "I can pay [amount] per month" — This admits the debt AND offers a payment plan\n- "The debt is too old" — Instead say "The statute of limitations has expired"\n- Don\'t argue with the plaintiff\'s attorney — address only the judge\n- Don\'t get emotional or raise your voice\n- Don\'t discuss your case in the hallway with the plaintiff\'s attorney without understanding the implications\n\nIf the plaintiff\'s attorney approaches you before the hearing and offers a deal, you can say: "I\'d like to present my case to the judge." You are NOT required to settle.',
      acknowledgeLabel: "I'll avoid these mistakes at my hearing",
    },
    {
      id: 'no_show_info',
      type: 'info',
      prompt:
        "WHAT IF THE PLAINTIFF DOESN'T SHOW UP?\n\nThis is more common than you think, especially with debt buyers.\n\nIf the plaintiff (or their attorney) doesn't appear:\n1. Wait until your case is called\n2. Tell the judge: \"Your Honor, the plaintiff is not present. I move for dismissal.\"\n3. The judge will likely dismiss the case\n\nBring your Answer and all evidence anyway — just in case they show up late.",
      acknowledgeLabel: 'Good to know →',
    },
    {
      id: 'bring_checklist',
      type: 'multi_select',
      prompt: 'Which items have you prepared for your hearing?',
      options: [
        { value: 'three_copies', label: '3 copies of everything (you, judge, plaintiff)' },
        { value: 'filed_answer', label: 'Filed Answer with court stamp' },
        { value: 'proof_of_service', label: 'Proof of service (certified mail receipt or e-filing confirmation)' },
        { value: 'defense_evidence', label: 'Evidence supporting your defenses (SOL proof, validation letters, FDCPA evidence)' },
        { value: 'photo_id', label: 'Government-issued ID' },
        { value: 'case_number', label: 'Case number written down (not just on your phone)' },
      ],
      noneLabel: "Haven't gathered these yet",
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    const ct = answers.court_type
    if (ct === 'jp') {
      items.push({
        status: 'info',
        text: 'Your hearing is in JP Court — informal setting, 15-30 minutes.',
      })
    } else if (ct === 'county' || ct === 'district') {
      items.push({
        status: 'info',
        text: 'Your hearing is in a formal court — address judge as "Your Honor," stand when speaking.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Determine which court your hearing is in by checking your citation or calling the clerk.',
      })
    }

    items.push({
      status: 'done',
      text: 'You reviewed sample scripts for presenting your defense.',
    })

    items.push({
      status: 'done',
      text: 'You know what NOT to say (never admit the debt).',
    })

    const bringAnswer = answers.bring_checklist
    if (bringAnswer && bringAnswer !== 'none') {
      const brought = new Set(bringAnswer.split(','))
      if (brought.size >= 5) {
        items.push({ status: 'done', text: 'Hearing materials fully prepared. Arrive 30 minutes early.' })
      } else {
        items.push({ status: 'needed', text: `Gather remaining hearing materials — ${6 - brought.size} item${6 - brought.size !== 1 ? 's' : ''} not yet checked off. Arrive 30 minutes early.` })
      }
    } else {
      items.push({ status: 'needed', text: 'Prepare 3 copies of all documents, filed Answer, proof of service, defense evidence, and photo ID. Arrive 30 minutes early.' })
    }

    return items
  },
}
