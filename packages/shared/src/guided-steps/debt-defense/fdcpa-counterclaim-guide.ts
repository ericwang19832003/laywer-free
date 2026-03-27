import type { GuidedStepConfig } from '../types'

export const fdcpaCounterclaimGuideConfig: GuidedStepConfig = {
  title: 'File a Counterclaim for Collector Violations',
  reassurance:
    'If a debt collector broke the law, you can fight back — and potentially recover money from them.',

  questions: [
    {
      id: 'what_is_counterclaim',
      type: 'info',
      prompt:
        "WHAT IS A COUNTERCLAIM? It's your lawsuit AGAINST the collector, filed in the same case. Under the FDCPA, you can recover: up to $1,000 in statutory damages (per lawsuit, not per violation), actual damages (stress, lost wages, medical bills), and attorney fees (even for pro se litigants in some courts).",
    },
    {
      id: 'how_to_file',
      type: 'info',
      prompt:
        "HOW TO FILE: Include your counterclaim IN your Answer (Texas allows this). Add a section titled 'DEFENDANT'S COUNTERCLAIM' after your defenses. List each FDCPA violation with the statute section, describe what happened, and state the damages you're claiming.",
    },
    {
      id: 'which_violation',
      type: 'single_choice',
      prompt: 'Which violations did you identify?',
      helpText:
        'Select the violation that best describes what the collector did. If multiple apply, choose "Multiple violations" at the bottom.',
      options: [
        {
          value: 'calling_hours',
          label: 'Called outside allowed hours (before 8am or after 9pm)',
        },
        {
          value: 'threats',
          label: 'Threatened arrest, violence, or illegal action',
        },
        {
          value: 'harassment',
          label: 'Repeated or continuous calls meant to harass',
        },
        {
          value: 'misrepresentation',
          label: 'Lied about the debt amount, creditor, or legal status',
        },
        {
          value: 'failed_validation',
          label: 'Failed to validate the debt after you requested it',
        },
        {
          value: 'multiple_violations',
          label: 'Multiple violations from the list above',
        },
      ],
    },
    {
      id: 'calling_hours_info',
      type: 'info',
      prompt:
        'CALLING OUTSIDE ALLOWED HOURS — 15 U.S.C. \u00a7 1692c(a)(1)\n\nIn your counterclaim, write: "On [date] at [time], Plaintiff contacted Defendant by telephone. This contact occurred outside the hours permitted by 15 U.S.C. \u00a7 1692c(a)(1), which prohibits communication before 8:00 a.m. or after 9:00 p.m. local time at the consumer\'s location."\n\nEvidence to include: phone records showing the call time, voicemail recordings if available.',
      showIf: (answers) =>
        answers.which_violation === 'calling_hours' ||
        answers.which_violation === 'multiple_violations',
    },
    {
      id: 'threats_info',
      type: 'info',
      prompt:
        'THREATS OF ARREST, VIOLENCE, OR ILLEGAL ACTION — 15 U.S.C. \u00a7 1692d & \u00a7 1692e\n\nIn your counterclaim, write: "On [date], Plaintiff threatened Defendant with [describe threat — e.g., arrest, wage garnishment without judgment, criminal prosecution]. These threats constitute violations of 15 U.S.C. \u00a7 1692d (harassment or abuse) and \u00a7 1692e (false or misleading representations), as Plaintiff had no legal authority to carry out these threats."\n\nEvidence to include: recordings, written correspondence, notes of conversations with dates and times.',
      showIf: (answers) =>
        answers.which_violation === 'threats' ||
        answers.which_violation === 'multiple_violations',
    },
    {
      id: 'harassment_info',
      type: 'info',
      prompt:
        'HARASSMENT THROUGH REPEATED CALLS — 15 U.S.C. \u00a7 1692d(5)\n\nIn your counterclaim, write: "Plaintiff caused Defendant\'s telephone to ring repeatedly and continuously with intent to annoy, abuse, or harass, in violation of 15 U.S.C. \u00a7 1692d(5). Between [start date] and [end date], Plaintiff called Defendant approximately [number] times, including [number] calls in a single day on [date]."\n\nEvidence to include: phone records showing call frequency, a log or spreadsheet of all calls with dates and times.',
      showIf: (answers) =>
        answers.which_violation === 'harassment' ||
        answers.which_violation === 'multiple_violations',
    },
    {
      id: 'misrepresentation_info',
      type: 'info',
      prompt:
        'MISREPRESENTATION OF THE DEBT — 15 U.S.C. \u00a7 1692e\n\nIn your counterclaim, write: "Plaintiff made false, deceptive, or misleading representations in connection with the collection of this debt, in violation of 15 U.S.C. \u00a7 1692e. Specifically, Plaintiff [describe — e.g., falsely represented the amount owed, falsely claimed to be an attorney, misrepresented the legal status of the debt, threatened action they could not legally take]."\n\nEvidence to include: letters or statements from the collector showing false information, comparison with original creditor records.',
      showIf: (answers) =>
        answers.which_violation === 'misrepresentation' ||
        answers.which_violation === 'multiple_violations',
    },
    {
      id: 'failed_validation_info',
      type: 'info',
      prompt:
        'FAILURE TO VALIDATE THE DEBT — 15 U.S.C. \u00a7 1692g\n\nIn your counterclaim, write: "Defendant timely requested validation of the alleged debt pursuant to 15 U.S.C. \u00a7 1692g(b) on [date]. Plaintiff failed to cease collection activity and/or failed to provide adequate validation, in violation of 15 U.S.C. \u00a7 1692g(b). Plaintiff continued collection activity on [dates] without providing the required validation."\n\nEvidence to include: your validation request letter (with proof of mailing), any response received (or lack thereof), evidence of continued collection after your request.',
      showIf: (answers) =>
        answers.which_violation === 'failed_validation' ||
        answers.which_violation === 'multiple_violations',
    },
    {
      id: 'counterclaim_template',
      type: 'info',
      prompt:
        "COUNTERCLAIM TEMPLATE:\n\nDEFENDANT'S COUNTERCLAIM\n\n1. Defendant counterclaims against Plaintiff under 15 U.S.C. \u00a7 1692 et seq. (Fair Debt Collection Practices Act).\n2. On [date], Plaintiff [describe violation].\n3. This conduct violates 15 U.S.C. \u00a7 [section].\n4. Defendant has suffered [actual damages description].\n5. Defendant requests statutory damages of $1,000, actual damages, court costs, and reasonable attorney fees.",
    },
    {
      id: 'has_evidence',
      type: 'yes_no',
      prompt: 'Have you documented the violations with evidence?',
      helpText:
        'Evidence can include call logs, phone records, voicemails, letters from the collector, recordings (if legal in your state), or written notes of conversations with dates and times.',
    },
    {
      id: 'gather_evidence_info',
      type: 'info',
      prompt:
        'BEFORE YOU FILE, GATHER YOUR EVIDENCE:\n\n1. CALL LOGS — Request your phone records from your carrier showing dates, times, and duration of calls from the collector.\n2. RECORDINGS — If you recorded any calls (Texas is a one-party consent state, so you can record your own calls), save them.\n3. LETTERS — Keep every piece of mail from the collector. Photograph or scan them.\n4. TIMESTAMPS — Write down every interaction you remember: date, time, what was said, who said it.\n5. VALIDATION REQUEST — If you sent a debt validation letter, keep the certified mail receipt and any response.\n6. WITNESSES — If anyone else heard threatening or harassing calls, note their name and what they witnessed.\n\nOrganize everything in chronological order. Judges respond well to clear, dated evidence.',
      showIf: (answers) => answers.has_evidence === 'no',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    const violationLabels: Record<string, string> = {
      calling_hours: 'Calling outside allowed hours (15 U.S.C. \u00a7 1692c)',
      threats: 'Threats of arrest or illegal action (15 U.S.C. \u00a7 1692d/e)',
      harassment: 'Harassment through repeated calls (15 U.S.C. \u00a7 1692d)',
      misrepresentation:
        'Misrepresentation of the debt (15 U.S.C. \u00a7 1692e)',
      failed_validation:
        'Failure to validate the debt (15 U.S.C. \u00a7 1692g)',
      multiple_violations: 'Multiple FDCPA violations identified',
    }

    const violation =
      violationLabels[answers.which_violation] || 'Not selected'
    items.push({
      status: 'info',
      text: `Identified violation: ${violation}.`,
    })

    if (answers.has_evidence === 'yes') {
      items.push({
        status: 'done',
        text: 'You have documented the violations with evidence.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Gather evidence of the violations before filing: call logs, recordings, letters, timestamps, and witness information.',
      })
    }

    items.push({
      status: 'needed',
      text: "Draft your counterclaim using the template provided and include it in your Answer under a section titled 'DEFENDANT'S COUNTERCLAIM.'",
    })

    items.push({
      status: 'info',
      text: 'You may recover up to $1,000 in statutory damages, plus actual damages and attorney fees under the FDCPA.',
    })

    return items
  },
}
