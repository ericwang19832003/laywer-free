import type { GuidedStepConfig } from '../types'

export const piCourtroomGuideConfig: GuidedStepConfig = {
  title: 'What to Expect at Your PI Trial',
  reassurance:
    'Understanding the trial process removes the mystery. Preparation and honesty are your greatest advantages.',

  questions: [
    {
      id: 'trial_type',
      type: 'single_choice',
      prompt: 'What type of trial are you expecting?',
      options: [
        { value: 'jury', label: 'Jury trial' },
        { value: 'bench', label: 'Bench trial (judge decides)' },
        { value: 'not_sure', label: 'Not sure yet' },
      ],
    },
    {
      id: 'jury_trial_info',
      type: 'info',
      prompt:
        "JURY TRIAL STRUCTURE:\n1. JURY SELECTION (Voir Dire) \u2014 You and the defendant's attorney question potential jurors to identify bias. You can strike jurors who seem unsympathetic to injury claims or who have connections to the defendant or their insurer.\n2. OPENING STATEMENTS \u2014 You go first. Briefly tell the jury what happened, what your injuries are, and what you're asking for.\n3. PLAINTIFF'S CASE \u2014 You present your evidence: your testimony, witness testimony, medical records, bills, photos, expert reports.\n4. DEFENDANT'S CASE \u2014 The defense presents their evidence and may call witnesses to dispute your claims.\n5. CLOSING ARGUMENTS \u2014 Summarize your case and ask for a specific dollar amount.\n6. JURY DELIBERATION & VERDICT \u2014 The jury decides liability and damages.",
      acknowledgeLabel: 'I understand the jury trial process',
      showIf: (answers) => answers.trial_type === 'jury',
    },
    {
      id: 'bench_trial_info',
      type: 'info',
      prompt:
        "BENCH TRIAL STRUCTURE:\n1. OPENING STATEMENTS \u2014 Brief overview of your case to the judge.\n2. PLAINTIFF'S CASE \u2014 Present your testimony, documents, and witnesses.\n3. DEFENDANT'S CASE \u2014 Defense presents their side.\n4. CLOSING ARGUMENTS \u2014 Summarize the evidence and the law.\n5. JUDGE'S RULING \u2014 The judge decides both liability and damages.\n\nBench trials are typically faster and more focused on legal arguments than emotional appeals. Judges appreciate organized, concise presentations.",
      acknowledgeLabel: 'I understand the bench trial process',
      showIf: (answers) => answers.trial_type === 'bench',
    },
    {
      id: 'testimony_script',
      type: 'info',
      prompt:
        "PI TESTIMONY SCRIPT \u2014 HOW TO DESCRIBE THE ACCIDENT:\n\"I was driving [northbound/southbound/etc.] on [street name] at approximately [speed] mph. The traffic signal was [green/I had right of way]. The defendant's vehicle [ran a red light / failed to yield / rear-ended me / crossed the center line]. I [describe the impact \u2014 was struck on the driver's side / was pushed into the intersection]. I [describe immediate physical response \u2014 felt a sharp pain in my neck and back / was unable to move my left arm / lost consciousness].\n\nAfter the accident, I [was taken to the ER by ambulance / drove myself to the hospital]. My injuries required [describe treatment \u2014 surgery, physical therapy, injections, etc.]. I have incurred $[amount] in medical bills. I missed [number] days of work. My daily life has been affected because [describe limitations \u2014 I can no longer lift my children / I have chronic pain / I cannot return to my previous job].\"\n\nTip: Practice this until it feels natural, but DO NOT memorize it word for word \u2014 the jury can tell.",
      acknowledgeLabel: "I'll practice my testimony",
    },
    {
      id: 'medical_evidence_prepared',
      type: 'multi_select',
      prompt: 'Which of these have you prepared for your medical evidence presentation?',
      options: [
        { value: 'bills_numbered', label: 'Medical bills organized as numbered exhibits (Exhibit 1, 2, 3\u2026)' },
        { value: 'summary_chart', label: 'Summary chart with provider name, date, treatment type, and amount billed' },
        { value: 'records_copied', label: 'Copies of all medical records ready' },
        { value: 'injury_photos', label: 'Photos of injuries (bruises, scars, surgical sites) prepared as exhibits' },
        { value: 'prescription_records', label: 'Prescription records for medications related to your injuries' },
        { value: 'expert_arranged', label: 'Medical expert arranged to testify on causation (if needed)' },
      ],
      noneLabel: "Haven't prepared any yet",
    },
    {
      id: 'presenting_damages',
      type: 'info',
      prompt:
        "PRESENTING DAMAGES:\n\u2022 MEDICAL BILLS \u2014 Introduce as exhibits with a total summary. Include: ER visits, surgeries, imaging (X-rays, MRIs), physical therapy, prescriptions, future estimated treatment costs.\n\u2022 LOST WAGES \u2014 Bring a letter from your employer confirming: your job title, hourly/salary rate, dates missed, and total wages lost. Tax returns and pay stubs corroborate this.\n\u2022 PAIN AND SUFFERING \u2014 Describe how your injuries have affected your daily life, relationships, hobbies, sleep, and mental health. Be specific and honest.\n\u2022 PROPERTY DAMAGE \u2014 Repair estimates or total loss valuation for your vehicle.\n\nTip: Ask the jury for a specific dollar amount in closing. Jurors need a number to anchor their deliberation.",
      acknowledgeLabel: "I'll prepare my damages presentation",
    },
    {
      id: 'what_not_to_say',
      type: 'info',
      prompt:
        "WHAT NOT TO SAY:\n\u2022 Do not exaggerate your injuries \u2014 the defense will test you. If you claim you cannot lift anything but your social media shows you at the gym, your credibility is destroyed.\n\u2022 Do not guess about speeds, distances, or timing \u2014 say \"approximately\" or \"I am not certain of the exact number\"\n\u2022 Do not argue with the defense attorney \u2014 answer calmly and factually\n\u2022 Do not volunteer extra information \u2014 answer the question asked, then stop\n\u2022 Do not say \"I think\" when you mean \"I know\" \u2014 be definitive about what you personally experienced\n\u2022 Do not discuss your case on social media at any point during the lawsuit",
      acknowledgeLabel: 'I understand what to avoid',
    },
    {
      id: 'comparative_fault_argument',
      type: 'info',
      prompt:
        "COMPARATIVE FAULT ARGUMENT:\nThe defense will likely argue you were partially at fault. Be prepared to explain:\n\"Even if I was partially at fault, the defendant was primarily responsible because [they ran the red light / they were speeding / they were texting / they failed to yield]. Under Texas law, I can still recover damages as long as I was less than 51% at fault, with my recovery reduced by my percentage of fault.\"\n\nDo NOT admit fault beyond what the evidence shows. If you made a minor error (like not braking sooner), acknowledge it honestly but emphasize the defendant's greater fault.",
      acknowledgeLabel: 'I understand comparative fault',
    },
    {
      id: 'courtroom_ready',
      type: 'multi_select',
      prompt: 'Which of these courtroom preparation steps have you completed?',
      options: [
        { value: 'arriving_early', label: 'Planning to arrive at least 30 minutes early' },
        { value: 'professional_attire', label: 'Business attire selected \u2014 no flashy jewelry' },
        { value: 'know_your_honor', label: 'Know to address the judge as "Your Honor" and stand when speaking' },
        { value: 'phone_off', label: 'Will turn off phone completely before entering' },
        { value: 'practiced_calm', label: 'Prepared to stay calm when the defense challenges testimony' },
        { value: 'eye_contact', label: 'Will make eye contact with jury (jury trial) or judge (bench trial)' },
      ],
      noneLabel: "Haven't prepared any of these yet",
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.trial_type && answers.trial_type !== 'not_sure') {
      const typeLabels: Record<string, string> = {
        jury: 'Jury trial \u2014 jury selection, opening statements, cases, closing, verdict',
        bench: 'Bench trial \u2014 judge decides liability and damages',
      }
      items.push({
        status: 'done',
        text: `Trial type: ${typeLabels[answers.trial_type] ?? answers.trial_type}`,
      })
    } else {
      items.push({ status: 'needed', text: 'Determine whether you will have a jury or bench trial.' })
    }

    items.push({
      status: 'info',
      text: 'Practice your accident testimony until natural. Describe what happened factually \u2014 do not memorize word for word.',
    })

    if (answers.medical_evidence_prepared && answers.medical_evidence_prepared !== 'none') {
      items.push({
        status: 'done',
        text: 'Medical evidence preparation started.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Organize medical bills as numbered exhibits with a summary chart. Bring prescription records and injury photos.',
      })
    }

    items.push({
      status: 'info',
      text: 'Do NOT exaggerate injuries \u2014 the defense will test your credibility. Answer questions calmly and factually.',
    })

    items.push({
      status: 'info',
      text: 'Be ready for comparative fault arguments. You can recover if you were less than 51% at fault.',
    })

    if (answers.courtroom_ready && answers.courtroom_ready !== 'none') {
      items.push({
        status: 'done',
        text: 'Courtroom preparation underway.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Arrive 30 minutes early. Dress professionally. Address the judge as "Your Honor."',
      })
    }

    return items
  },
}
