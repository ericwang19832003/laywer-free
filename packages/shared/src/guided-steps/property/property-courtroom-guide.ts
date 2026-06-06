import type { GuidedStepConfig } from '../types'

export const propertyCourtroomGuideConfig: GuidedStepConfig = {
  title: 'What to Expect at Your Property Trial',
  reassurance:
    'Property cases are evidence-heavy, not drama-heavy. Organized evidence wins.',

  questions: [
    {
      id: 'which_court',
      type: 'single_choice',
      prompt: 'Which court is your case in?',
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
      prompt:
        'JP Court is informal. No jury unless requested. The judge may ask questions directly. You can present evidence without formal rules. Keep it simple and organized — judges appreciate brevity.',
      acknowledgeLabel: 'Understood →',
      showIf: (answers) => answers.which_court === 'jp',
    },
    {
      id: 'county_info',
      type: 'info',
      prompt:
        'County Court is more formal than JP Court. Rules of evidence apply. You may have a jury. Dress professionally, address the judge as "Your Honor," and be prepared to formally introduce each piece of evidence.',
      acknowledgeLabel: 'Understood →',
      showIf: (answers) => answers.which_court === 'county',
    },
    {
      id: 'district_info',
      type: 'info',
      prompt:
        'District Court is the most formal. Strict rules of evidence and procedure apply. Jury trials are common. You will need to formally offer each exhibit, lay foundation for evidence, and follow courtroom protocol precisely.',
      acknowledgeLabel: 'Understood →',
      showIf: (answers) => answers.which_court === 'district',
    },
    {
      id: 'unsure_info',
      type: 'info',
      prompt:
        'Check your court paperwork — the court name is on your citation or petition. JP Courts handle claims up to $20,000. County Courts handle claims up to $250,000. District Courts handle claims over $250,000 and all title disputes.',
      acknowledgeLabel: 'Got it →',
      showIf: (answers) => answers.which_court === 'unsure',
    },
    {
      id: 'trial_structure',
      type: 'info',
      prompt:
        'TRIAL STRUCTURE FOR PROPERTY CASES:\n1. Opening statements (brief — 2-3 minutes)\n2. YOUR case first (you\'re the plaintiff):\n   - Present photos (before/after)\n   - Present repair estimates (3+ from contractors)\n   - Present timeline of damage and communications\n   - Testify about what happened\n3. Defendant\'s case\n4. Closing arguments\n5. Judge (or jury) decides',
      acknowledgeLabel: 'Got it →',
    },
    {
      id: 'sample_testimony',
      type: 'info',
      prompt:
        'SAMPLE OPENING TESTIMONY:\n"Your Honor, on [date], [describe what defendant did/failed to do] which caused [describe damage] to my property at [address]. I have [number] contractor estimates showing the repair cost is $[amount]. I also have before and after photographs showing the condition of my property."',
      acknowledgeLabel: 'Got it →',
    },
    {
      id: 'what_not_to_say',
      type: 'info',
      prompt:
        "WHAT NOT TO SAY:\nDon't exaggerate damages — bring receipts. Don't make it personal — focus on the property. Don't guess at costs — use written estimates.",
      acknowledgeLabel: 'Got it →',
    },
    {
      id: 'what_to_bring',
      type: 'multi_select',
      prompt: 'Which items have you prepared for court?',
      options: [
        { value: 'three_copies', label: '3 copies of everything (you, judge, defendant)' },
        { value: 'photos', label: 'Before and after photos (printed, organized by date)' },
        { value: 'estimates', label: 'Repair estimates from licensed contractors (at least 2)' },
        { value: 'timeline', label: 'Written timeline of events' },
        { value: 'communications', label: 'All communications (letters, emails, texts)' },
        { value: 'property_docs', label: 'Property survey, deed, or title documents (if applicable)' },
        { value: 'receipts', label: 'Receipts for all costs incurred' },
        { value: 'witness_list', label: 'Witness list (if any)' },
      ],
      noneLabel: "Haven't gathered these yet",
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.which_court && answers.which_court !== 'unsure') {
      const courtLabels: Record<string, string> = {
        jp: 'Justice of the Peace (JP) Court',
        county: 'County Court',
        district: 'District Court',
      }
      items.push({
        status: 'done',
        text: `Court identified: ${courtLabels[answers.which_court]}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Determine which court your case is in — check your citation or petition.',
      })
    }

    const bringAnswer = answers.what_to_bring
    if (bringAnswer && bringAnswer !== 'none') {
      const brought = new Set(bringAnswer.split(','))
      if (brought.size >= 6) {
        items.push({ status: 'done', text: 'Court materials fully prepared.' })
      } else {
        items.push({ status: 'needed', text: `Gather remaining court materials — ${8 - brought.size} item${8 - brought.size !== 1 ? 's' : ''} not yet checked off.` })
      }
    } else {
      items.push({ status: 'needed', text: 'Prepare court materials: photos, repair estimates, timeline, communications, and 3 copies of everything.' })
    }

    items.push({
      status: 'info',
      text: 'Practice your opening testimony — keep it factual, brief, and focused on the property damage.',
    })

    return items
  },
}
