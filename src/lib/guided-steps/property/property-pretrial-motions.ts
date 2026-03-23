import type { GuidedStepConfig } from '../types'

export const propertyPretrialMotionsConfig: GuidedStepConfig = {
  title: 'Pretrial Motions That Can Win Your Case',
  reassurance:
    'Some property cases can be won before trial if the evidence is clear enough.',

  questions: [
    {
      id: 'summary_judgment_intro',
      type: 'info',
      prompt:
        'MOTION FOR SUMMARY JUDGMENT:\nIf the facts are undisputed (e.g., survey clearly shows boundary, deed is unambiguous), you can ask the judge to rule without a trial. This is common in boundary and title disputes.',
    },
    {
      id: 'clear_documentary_evidence',
      type: 'yes_no',
      prompt:
        'Is your case based on clear documentary evidence (survey, deed, title records) where the facts are not in dispute?',
      helpText:
        'Summary judgment works best when the key facts are proven by documents and the other side cannot reasonably dispute them.',
    },
    {
      id: 'summary_judgment_info',
      type: 'info',
      prompt:
        'FILING A SUMMARY JUDGMENT MOTION:\n1. Draft a motion stating there are no genuine issues of material fact\n2. Attach supporting evidence (survey, deed, photos, expert reports)\n3. Include affidavits from surveyors or other experts if available\n4. File with the court and serve on the other party\n5. The other party has 21 days to respond (Texas Rules)\n6. The judge will hold a hearing — no jury, just legal arguments\n\nThis can resolve your case in weeks instead of months.',
      showIf: (answers) => answers.clear_documentary_evidence === 'yes',
    },
    {
      id: 'no_summary_judgment_info',
      type: 'info',
      prompt:
        'If the facts are disputed (e.g., both sides disagree about where the boundary is, or what caused the damage), summary judgment is unlikely to succeed. Focus on building the strongest trial case instead.',
      showIf: (answers) => answers.clear_documentary_evidence === 'no',
    },
    {
      id: 'temporary_injunction_intro',
      type: 'info',
      prompt:
        'MOTION FOR TEMPORARY INJUNCTION:\nIf the damage is ONGOING (neighbor keeps trespassing, tree keeps dropping branches on your property, HOA keeps fining you), you can ask the court to ORDER them to stop while the case is pending.',
    },
    {
      id: 'damage_ongoing',
      type: 'yes_no',
      prompt: 'Is the damage to your property ongoing right now?',
      helpText:
        'Ongoing means it is continuing to happen — not a one-time event that already occurred.',
    },
    {
      id: 'temporary_injunction_info',
      type: 'info',
      prompt:
        'TEMPORARY INJUNCTION REQUIREMENTS:\nTo get a temporary injunction in Texas, you must show:\n\n1. IRREPARABLE HARM: The damage cannot be adequately compensated by money alone (e.g., ongoing trespass, destruction of trees, continued encroachment)\n2. LIKELIHOOD OF SUCCESS: You are likely to win at trial based on the evidence\n3. BALANCE OF HARDSHIPS: The harm to you without the injunction outweighs the burden on the defendant\n\nYou will need to post a bond (amount set by the judge). The court will hold a hearing — bring all evidence of ongoing damage, photos with dates, and any communications showing you asked them to stop.',
      showIf: (answers) => answers.damage_ongoing === 'yes',
    },
    {
      id: 'no_injunction_info',
      type: 'info',
      prompt:
        'If the damage already occurred and is not continuing, a temporary injunction is not appropriate. Focus on documenting the damage thoroughly for trial and pursuing monetary damages for the harm already done.',
      showIf: (answers) => answers.damage_ongoing === 'no',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.clear_documentary_evidence === 'yes') {
      items.push({
        status: 'info',
        text: 'Your case may be a candidate for summary judgment — consider filing a motion to resolve the case without trial.',
      })
      items.push({
        status: 'needed',
        text: 'Gather all documentary evidence (surveys, deeds, expert reports) to support a summary judgment motion.',
      })
    } else if (answers.clear_documentary_evidence === 'no') {
      items.push({
        status: 'info',
        text: 'Summary judgment is unlikely — focus on building the strongest trial case.',
      })
    }

    if (answers.damage_ongoing === 'yes') {
      items.push({
        status: 'info',
        text: 'Ongoing damage may justify a temporary injunction — the court can order the defendant to stop while the case is pending.',
      })
      items.push({
        status: 'needed',
        text: 'Document ongoing damage with dated photos and communications to support an injunction request.',
      })
      items.push({
        status: 'needed',
        text: 'Be prepared to post a bond for the temporary injunction (amount set by judge).',
      })
    } else if (answers.damage_ongoing === 'no') {
      items.push({
        status: 'info',
        text: 'No ongoing damage — focus on monetary damages for the harm already done.',
      })
    }

    return items
  },
}
