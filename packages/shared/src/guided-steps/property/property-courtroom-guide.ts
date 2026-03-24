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
      showIf: (answers) => answers.which_court === 'jp',
    },
    {
      id: 'county_info',
      type: 'info',
      prompt:
        'County Court is more formal than JP Court. Rules of evidence apply. You may have a jury. Dress professionally, address the judge as "Your Honor," and be prepared to formally introduce each piece of evidence.',
      showIf: (answers) => answers.which_court === 'county',
    },
    {
      id: 'district_info',
      type: 'info',
      prompt:
        'District Court is the most formal. Strict rules of evidence and procedure apply. Jury trials are common. You will need to formally offer each exhibit, lay foundation for evidence, and follow courtroom protocol precisely.',
      showIf: (answers) => answers.which_court === 'district',
    },
    {
      id: 'unsure_info',
      type: 'info',
      prompt:
        'Check your court paperwork — the court name is on your citation or petition. JP Courts handle claims up to $20,000. County Courts handle claims up to $200,000. District Courts handle claims over $200,000 and all title disputes.',
      showIf: (answers) => answers.which_court === 'unsure',
    },
    {
      id: 'trial_structure',
      type: 'info',
      prompt:
        'TRIAL STRUCTURE FOR PROPERTY CASES:\n1. Opening statements (brief — 2-3 minutes)\n2. YOUR case first (you\'re the plaintiff):\n   - Present photos (before/after)\n   - Present repair estimates (3+ from contractors)\n   - Present timeline of damage and communications\n   - Testify about what happened\n3. Defendant\'s case\n4. Closing arguments\n5. Judge (or jury) decides',
    },
    {
      id: 'sample_testimony',
      type: 'info',
      prompt:
        'SAMPLE OPENING TESTIMONY:\n"Your Honor, on [date], [describe what defendant did/failed to do] which caused [describe damage] to my property at [address]. I have [number] contractor estimates showing the repair cost is $[amount]. I also have before and after photographs showing the condition of my property."',
    },
    {
      id: 'what_not_to_say',
      type: 'info',
      prompt:
        "WHAT NOT TO SAY:\nDon't exaggerate damages — bring receipts. Don't make it personal — focus on the property. Don't guess at costs — use written estimates.",
    },
    {
      id: 'what_to_bring',
      type: 'info',
      prompt:
        'WHAT TO BRING TO COURT:\n• 3 copies of everything (you, judge, defendant)\n• Before and after photos (printed, organized by date)\n• Repair estimates from licensed contractors (at least 3)\n• Timeline of events (written out)\n• All communications (letters, emails, texts)\n• Property survey (if boundary dispute)\n• Deed and title documents\n• Receipts for any costs incurred\n• Witness list (if any)',
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

    items.push({
      status: 'info',
      text: 'Prepare 3 copies of all evidence (you, judge, defendant).',
    })

    items.push({
      status: 'info',
      text: 'Organize photos chronologically (before and after) and print them.',
    })

    items.push({
      status: 'needed',
      text: 'Obtain at least 3 repair estimates from licensed contractors.',
    })

    items.push({
      status: 'info',
      text: 'Practice your opening testimony — keep it factual, brief, and focused on the property damage.',
    })

    return items
  },
}
