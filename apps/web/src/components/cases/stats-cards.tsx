'use client'

interface StatsCardsProps {
  activeCases: number
  tasksCompleted: number
  tasksTotal: number
  upcomingDeadlines: number
  averageHealth: number | null
}

export function StatsCards({ activeCases, tasksCompleted, tasksTotal, upcomingDeadlines, averageHealth }: StatsCardsProps) {
  const healthColor = averageHealth !== null && averageHealth >= 70
    ? 'text-calm-green'
    : averageHealth !== null && averageHealth >= 40
    ? 'text-calm-amber'
    : averageHealth !== null
    ? 'text-destructive'
    : 'text-warm-muted'

  const stats = [
    {
      label: 'Active matters',
      value: String(activeCases),
    },
    {
      label: 'Tasks complete',
      value: `${tasksCompleted}`,
      sub: `/${tasksTotal}`,
    },
    {
      label: 'Due this week',
      value: String(upcomingDeadlines),
    },
    {
      label: 'Avg. case health',
      value: averageHealth !== null ? String(averageHealth) : '—',
      suffix: averageHealth !== null ? '%' : undefined,
      valueColor: healthColor,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 mb-8 sm:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-xl border border-warm-border bg-white px-5 py-4">
          <p className="text-xs text-warm-muted mb-2">{stat.label}</p>
          <p className={`text-2xl font-semibold tabular-nums ${stat.valueColor ?? 'text-warm-text'}`}>
            {stat.value}
            {stat.sub && <span className="text-base font-normal text-warm-muted">{stat.sub}</span>}
            {stat.suffix && <span className="text-base font-normal">{stat.suffix}</span>}
          </p>
        </div>
      ))}
    </div>
  )
}
