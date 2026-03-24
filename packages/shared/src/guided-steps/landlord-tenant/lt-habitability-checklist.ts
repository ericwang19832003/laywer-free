import type { GuidedStepConfig } from '../types'

export const ltHabitabilityChecklistConfig: GuidedStepConfig = {
  title: 'Document Habitability Issues',
  reassurance:
    'Every Texan deserves safe, habitable housing. Documenting these issues builds a strong foundation for your case.',

  questions: [
    {
      id: 'no_hot_water',
      type: 'yes_no',
      prompt: 'No hot water?',
      helpText: 'Lack of hot water is a serious habitability concern.',
    },
    {
      id: 'no_heat',
      type: 'yes_no',
      prompt: 'No heat in winter?',
      helpText:
        'A functioning heating system is required for habitable housing during cold months.',
    },
    {
      id: 'sewage_issues',
      type: 'yes_no',
      prompt: 'Sewage backup or leaks?',
      helpText:
        'Sewage problems pose immediate health risks and are a high-priority habitability issue.',
    },
    {
      id: 'pest_infestation',
      type: 'yes_no',
      prompt: 'Pest infestation?',
      helpText:
        'Rodents, roaches, bedbugs, or other infestations that the landlord has not addressed.',
    },
    {
      id: 'mold_mildew',
      type: 'yes_no',
      prompt: 'Mold or mildew?',
      helpText:
        'Mold can cause serious respiratory issues and often indicates underlying moisture problems.',
    },
    {
      id: 'broken_locks',
      type: 'yes_no',
      prompt: 'Broken locks or security issues?',
      helpText:
        'Under Texas Property Code § 92.151, landlords must provide working locks on exterior doors.',
    },
    {
      id: 'structural_damage',
      type: 'yes_no',
      prompt: 'Structural damage (roof, walls, floors)?',
      helpText:
        'Holes in walls or roof, sagging floors, or other structural problems that compromise safety.',
    },
    {
      id: 'has_written_log',
      type: 'yes_no',
      prompt: 'Have you kept a written log of when issues started?',
      helpText:
        'A dated log of events strengthens your case by showing a pattern and timeline.',
    },
    {
      id: 'habitability_legal_info',
      type: 'info',
      prompt:
        'Under Texas Property Code § 92.052, these conditions may constitute a breach of the implied warranty of habitability. Document everything with dates, photos, and written communications.',
      helpText:
        'Thorough documentation is your strongest tool when pursuing remedies.',
    },
    {
      id: 'sent_written_notice',
      type: 'yes_no',
      prompt: 'Have you sent written notice to your landlord about these issues?',
      helpText:
        'Written notice is a legal prerequisite before pursuing repair remedies under Texas law.',
    },
    {
      id: 'written_notice_reminder',
      type: 'info',
      prompt:
        'Texas law requires written notice to your landlord before you can pursue remedies like repair-and-deduct or lease termination. Send a dated letter or email describing each issue and requesting repair within a reasonable time.',
      helpText:
        'Keep a copy of the notice and any proof of delivery (certified mail receipt, email confirmation).',
      showIf: (answers) => answers.sent_written_notice === 'no',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    const issues: { id: string; label: string }[] = [
      { id: 'no_hot_water', label: 'No hot water' },
      { id: 'no_heat', label: 'No heat in winter' },
      { id: 'sewage_issues', label: 'Sewage backup or leaks' },
      { id: 'pest_infestation', label: 'Pest infestation' },
      { id: 'mold_mildew', label: 'Mold or mildew' },
      { id: 'broken_locks', label: 'Broken locks or security issues' },
      { id: 'structural_damage', label: 'Structural damage' },
    ]

    const reported = issues.filter((i) => answers[i.id] === 'yes')
    if (reported.length > 0) {
      items.push({
        status: 'info',
        text: `Habitability issues identified: ${reported.map((i) => i.label).join(', ')}.`,
      })
    } else {
      items.push({
        status: 'info',
        text: 'No habitability issues were flagged. You can revisit this checklist if conditions change.',
      })
    }

    if (answers.has_written_log === 'yes') {
      items.push({ status: 'done', text: 'Written log of issues maintained.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Start a written log with dates and descriptions of each issue. Include when it started and any communications with your landlord.',
      })
    }

    if (answers.sent_written_notice === 'yes') {
      items.push({ status: 'done', text: 'Written notice sent to landlord.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Send written notice to your landlord describing each issue and requesting repair. Keep proof of delivery.',
      })
    }

    if (reported.length > 0) {
      items.push({
        status: 'needed',
        text: 'Take dated photos or video of every issue listed above. Store copies in a safe place.',
      })
    }

    return items
  },
}
