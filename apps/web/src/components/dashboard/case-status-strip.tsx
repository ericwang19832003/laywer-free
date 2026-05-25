function differenceInCalendarDays(a: Date, b: Date): number {
  const aDay = new Date(a.getFullYear(), a.getMonth(), a.getDate())
  const bDay = new Date(b.getFullYear(), b.getMonth(), b.getDate())
  return Math.round((aDay.getTime() - bDay.getTime()) / 86400000)
}

interface CaseStatusStripProps {
  upcomingDeadlines: Array<{ due_at: string; label: string | null }>
  tasksSummary: Record<string, number>
  riskLevel: string | null | undefined
}

function deadlineText(deadlines: Array<{ due_at: string; label: string | null }>): string {
  if (!deadlines.length) return 'No upcoming deadlines'
  const days = differenceInCalendarDays(new Date(deadlines[0].due_at), new Date())
  if (days === 0) return 'Deadline today'
  if (days === 1) return 'Deadline tomorrow'
  if (days < 0) return 'Deadline passed'
  return `Next deadline: ${days} days`
}

function progressText(tasksSummary: Record<string, number>): string {
  const total = Object.values(tasksSummary).reduce((s, v) => s + v, 0)
  const done = (tasksSummary['completed'] ?? 0) + (tasksSummary['skipped'] ?? 0)
  if (total === 0) return 'Getting started'
  return `${done} of ${total} steps done`
}

function strengthText(riskLevel: string | null | undefined): { text: string; color: string } {
  switch (riskLevel) {
    case 'low': return { text: 'Your case looks solid', color: 'bg-calm-green/10 text-calm-green' }
    case 'medium': return { text: 'A few things to watch', color: 'bg-calm-amber/10 text-calm-amber' }
    case 'high': return { text: 'Needs your attention', color: 'bg-red-100 text-red-700' }
    default: return { text: 'Still gathering data', color: 'bg-warm-border/40 text-warm-muted' }
  }
}

export function CaseStatusStrip({ upcomingDeadlines, tasksSummary, riskLevel }: CaseStatusStripProps) {
  const strength = strengthText(riskLevel)

  return (
    <div className="flex flex-wrap gap-2">
      <span className="inline-flex items-center rounded-full bg-calm-indigo/10 px-3 py-1 text-xs font-medium text-calm-indigo">
        {deadlineText(upcomingDeadlines)}
      </span>
      <span className="inline-flex items-center rounded-full bg-warm-border/40 px-3 py-1 text-xs font-medium text-warm-muted">
        {progressText(tasksSummary)}
      </span>
      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${strength.color}`}>
        {strength.text}
      </span>
    </div>
  )
}
