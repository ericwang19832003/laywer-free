/**
 * Pre-Trial Conference Checklist Generator
 */

export interface PreTrialChecklistItem {
  id: string
  category: string
  item: string
  description: string
  completed: boolean
  dueDate: string | null
  notes: string
}

export interface PreTrialConferenceData {
  caseName: string
  caseNumber: string
  trialDate: string
  preTrialDate: string
  courtName: string
  checklist: PreTrialChecklistItem[]
}

export const DEFAULT_PRETRIAL_CHECKLIST: Omit<PreTrialChecklistItem, 'completed' | 'dueDate' | 'notes'>[] = [
  { id: 'witness_list', category: 'Witnesses', item: 'Witness List', description: 'Complete list of all witnesses with contact info' },
  { id: 'expert_witness', category: 'Witnesses', item: 'Expert Witness Disclosures', description: 'Expert names, qualifications, opinions, and summaries' },
  { id: 'exhibit_list', category: 'Exhibits', item: 'Exhibit List', description: 'Numbered list of all exhibits' },
  { id: 'exhibit_organization', category: 'Exhibits', item: 'Exhibit Organization', description: 'Exhibits marked, organized, and ready for trial' },
  { id: 'demonstratives', category: 'Exhibits', item: 'Trial Demonstratives', description: 'Charts, diagrams, timelines for presentation' },
  { id: 'deposition_excerpts', category: 'Exhibits', item: 'Deposition Excerpts', description: 'Relevant deposition excerpts marked and organized' },
  { id: 'motions_limine', category: 'Motions', item: 'Motions in Limine', description: 'Pre-trial motions to exclude prejudicial evidence' },
  { id: 'objections', category: 'Motions', item: 'Pre-Trial Objections', description: 'Anticipated objections to opposing exhibits/witnesses' },
  { id: 'jury_instructions', category: 'Instructions', item: 'Proposed Jury Instructions', description: 'Your proposed jury instructions' },
  { id: 'verdict_form', category: 'Instructions', item: 'Proposed Verdict Form', description: 'Special interrogatories or verdict form' },
  { id: 'trial_brief', category: 'Briefs', item: 'Trial Brief', description: 'Legal theories, facts, and arguments' },
  { id: 'opening_statement', category: 'Presentation', item: 'Opening Statement Draft', description: 'Draft of your opening statement' },
  { id: 'closing_argument', category: 'Presentation', item: 'Closing Argument Outline', description: 'Outline of your closing argument' },
  { id: 'witness_order', category: 'Presentation', item: 'Witness Order', description: 'Order in which you will call witnesses' },
  { id: 'exhibit_order', category: 'Presentation', item: 'Exhibit Presentation Order', description: 'Order for publishing exhibits to court/jury' },
  { id: 'stipulations', category: 'Agreements', item: 'Stipulations', description: 'Agreed facts to avoid proving at trial' },
  { id: 'subpoenas', category: 'Logistics', item: 'Subpoenas', description: 'Witness subpoenas served and proof of service' },
  { id: 'trial_equipment', category: 'Logistics', item: 'Trial Equipment', description: 'Laptop, projector, or other equipment needed' },
]

export function generatePreTrialChecklist(data: {
  caseName: string
  caseNumber: string
  trialDate: string
  preTrialDate: string
  courtName: string
}): { checklist: PreTrialChecklistItem[]; data: PreTrialConferenceData } {
  const checklist: PreTrialChecklistItem[] = DEFAULT_PRETRIAL_CHECKLIST.map((item) => ({
    ...item,
    completed: false,
    dueDate: data.preTrialDate,
    notes: '',
  }))

  return {
    checklist,
    data: {
      caseName: data.caseName,
      caseNumber: data.caseNumber,
      trialDate: data.trialDate,
      preTrialDate: data.preTrialDate,
      courtName: data.courtName,
      checklist,
    },
  }
}

export function generatePreTrialChecklistText(checklist: PreTrialChecklistItem[]): string {
  const lines: string[] = []

  lines.push('='.repeat(70))
  lines.push('PRE-TRIAL CONFERENCE CHECKLIST')
  lines.push('='.repeat(70))
  lines.push('')

  const categories = [...new Set(checklist.map((item) => item.category))]

  for (const category of categories) {
    lines.push(category.toUpperCase())
    lines.push('-'.repeat(40))
    const categoryItems = checklist.filter((item) => item.category === category)
    for (const item of categoryItems) {
      const status = item.completed ? '[✓]' : '[ ]'
      lines.push(`  ${status} ${item.item}`)
      lines.push(`      ${item.description}`)
      if (item.notes) {
        lines.push(`      Notes: ${item.notes}`)
      }
    }
    lines.push('')
  }

  lines.push('='.repeat(70))
  lines.push('')
  lines.push('Court Deadlines:')
  lines.push('-'.repeat(40))
  lines.push('Witness List Due: _______________')
  lines.push('Exhibit List Due: _______________')
  lines.push('Motions in Limine Due: _______________')
  lines.push('Trial Brief Due: _______________')
  lines.push('Pre-Trial Conference: _______________')
  lines.push('Trial Date: _______________')
  lines.push('')
  lines.push('='.repeat(70))

  return lines.join('\n')
}
