import type { GuidedStepConfig } from '../types'

export const piPretrialPreparationConfig: GuidedStepConfig = {
  title: 'Pretrial Preparation Checklist',
  reassurance:
    'The period between discovery and trial is when cases are won or lost. Organized pretrial preparation gives you the best chance at trial.',

  questions: [
    {
      id: 'pretrial_overview',
      type: 'info',
      prompt:
        'Pretrial preparation bridges the gap between discovery/motions and trial. Key tasks include organizing exhibits, finalizing witness lists, filing motions in limine, and preparing for the pretrial conference.',
    },
    {
      id: 'pretrial_order_received',
      type: 'yes_no',
      prompt: 'Have you received a pretrial order from the court?',
      helpText:
        'A pretrial order sets deadlines for exhibit lists, witness lists, and other pretrial filings. If you haven\'t received one, check your docket control order.',
    },
    {
      id: 'pretrial_order_guidance',
      type: 'info',
      prompt:
        'Review your pretrial order carefully. Extract ALL deadlines and add them to your calendar. Common pretrial order requirements:\n\n- Exhibit list filing deadline\n- Witness list filing deadline\n- Motions in limine deadline\n- Pretrial conference date\n- Trial brief deadline (if required)',
      showIf: (answers) => answers.pretrial_order_received === 'yes',
    },
    {
      id: 'exhibit_list_prepared',
      type: 'yes_no',
      prompt: 'Have you prepared your exhibit list?',
    },
    {
      id: 'exhibit_guidance',
      type: 'info',
      prompt:
        'Exhibit List Preparation\n\n1. Number each exhibit sequentially (Plaintiff\'s Exhibit 1, 2, 3...)\n2. Include: description, number of pages, witness who will authenticate it\n3. Organize chronologically or by topic\n4. Common PI exhibits: medical records, medical bills, photos of injuries, police report, wage records, correspondence, expert reports\n5. Prepare 3 copies of each exhibit: one for the court, one for opposing counsel, one for the witness stand',
      showIf: (answers) => answers.exhibit_list_prepared === 'no',
    },
    {
      id: 'witness_list_prepared',
      type: 'yes_no',
      prompt: 'Have you prepared your witness list?',
    },
    {
      id: 'witness_guidance',
      type: 'info',
      prompt:
        'Witness List Preparation\n\n1. List every witness you may call (fact and expert)\n2. Include: full name, address, brief description of expected testimony\n3. Estimate time for direct and cross-examination\n4. For each witness, ask: Do I need a subpoena to compel attendance?\n5. Common PI witnesses: plaintiff, treating doctors, employer (lost wages), eyewitnesses, expert witnesses (medical, economic)',
      showIf: (answers) => answers.witness_list_prepared === 'no',
    },
    {
      id: 'motions_in_limine',
      type: 'yes_no',
      prompt:
        'Do you plan to file any motions in limine (requests to exclude specific evidence before trial)?',
    },
    {
      id: 'motions_in_limine_guidance',
      type: 'info',
      prompt:
        'Common PI Motions in Limine\n\n- Exclude mention of plaintiff\'s prior unrelated injuries\n- Exclude reference to insurance coverage (Texas Rule of Evidence 411)\n- Exclude settlement discussions (TRE 408)\n- Exclude inflammatory or gruesome photographs\n- Exclude hearsay medical opinions\n- Exclude mention of plaintiff\'s immigration status\n- Exclude subsequent remedial measures (TRE 407)\n\nFile motions in limine before the pretrial conference. The court will rule on them before trial begins.',
      showIf: (answers) => answers.motions_in_limine === 'yes',
    },
    {
      id: 'trial_brief_needed',
      type: 'yes_no',
      prompt: 'Does the court require a trial brief?',
      helpText:
        'Some courts require trial briefs, others don\'t. Check your pretrial order or local rules.',
    },
    {
      id: 'trial_brief_guidance',
      type: 'info',
      prompt:
        'Trial Brief Contents\n\n- Summary of facts\n- Legal theories (causes of action)\n- Key evidence supporting each element\n- Anticipated contested issues\n- Relevant case law and statutes\n- Proposed jury instructions (if jury trial)',
      showIf: (answers) => answers.trial_brief_needed === 'yes',
    },
    {
      id: 'pretrial_conference_date',
      type: 'text',
      prompt: 'When is your pretrial conference? (YYYY-MM-DD)',
      placeholder: 'YYYY-MM-DD',
    },
    {
      id: 'subpoenas_needed',
      type: 'yes_no',
      prompt: 'Do you need to subpoena any witnesses for trial?',
    },
    {
      id: 'subpoena_guidance',
      type: 'info',
      prompt:
        'Subpoena Basics\n\n- Must be served at least 10 days before trial (reasonable time)\n- Can require testimony and/or documents\n- Must include witness fee ($10) and mileage\n- Served by any person over 18 who is not a party\n- Non-compliance can result in contempt of court',
      showIf: (answers) => answers.subpoenas_needed === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.exhibit_list_prepared === 'yes') {
      items.push({ status: 'done', text: 'Exhibit list prepared.' })
    } else if (answers.exhibit_list_prepared === 'no') {
      items.push({ status: 'needed', text: 'Prepare your exhibit list.' })
    }

    if (answers.witness_list_prepared === 'yes') {
      items.push({ status: 'done', text: 'Witness list prepared.' })
    } else if (answers.witness_list_prepared === 'no') {
      items.push({ status: 'needed', text: 'Prepare your witness list.' })
    }

    if (answers.motions_in_limine === 'yes') {
      items.push({
        status: 'info',
        text: 'Planning to file motions in limine.',
      })
    } else if (answers.motions_in_limine === 'no') {
      items.push({
        status: 'info',
        text: 'No motions in limine planned.',
      })
    }

    if (answers.trial_brief_needed === 'yes') {
      items.push({ status: 'needed', text: 'Trial brief required by the court.' })
    } else if (answers.trial_brief_needed === 'no') {
      items.push({ status: 'info', text: 'No trial brief required.' })
    }

    if (answers.subpoenas_needed === 'yes') {
      items.push({ status: 'needed', text: 'Subpoena witnesses for trial.' })
    } else if (answers.subpoenas_needed === 'no') {
      items.push({ status: 'info', text: 'No subpoenas needed.' })
    }

    if (answers.pretrial_conference_date) {
      items.push({
        status: 'info',
        text: `Pretrial conference date: ${answers.pretrial_conference_date}`,
      })
    } else {
      items.push({ status: 'needed', text: 'Set your pretrial conference date.' })
    }

    return items
  },
}
