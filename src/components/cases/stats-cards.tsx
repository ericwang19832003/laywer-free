'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Briefcase, CheckCircle2, Clock, Heart } from 'lucide-react'

interface StatsCardsProps {
  activeCases: number
  tasksCompleted: number
  tasksTotal: number
  upcomingDeadlines: number
  averageHealth: number | null
}

export function StatsCards({ activeCases, tasksCompleted, tasksTotal, upcomingDeadlines, averageHealth }: StatsCardsProps) {
  const healthColor = averageHealth !== null && averageHealth >= 70
    ? 'green' : averageHealth !== null && averageHealth >= 40
    ? 'amber' : 'red'

  const stats = [
    {
      label: 'Active Cases',
      value: activeCases,
      subtitle: null as string | null,
      icon: Briefcase,
      iconColor: 'text-warm-muted',
    },
    {
      label: 'Tasks Done',
      value: `${tasksCompleted}/${tasksTotal}`,
      subtitle: null as string | null,
      icon: CheckCircle2,
      iconColor: 'text-warm-muted',
    },
    {
      label: 'Deadlines (7d)',
      value: upcomingDeadlines,
      subtitle: upcomingDeadlines === 0 ? 'None this week' : null,
      icon: Clock,
      iconColor: 'text-warm-muted',
    },
    {
      label: 'Avg Health',
      value: averageHealth !== null ? `${averageHealth}%` : '\u2014',
      subtitle: null as string | null,
      icon: Heart,
      iconColor: healthColor === 'green' ? 'text-green-600' : healthColor === 'amber' ? 'text-amber-600' : averageHealth !== null ? 'text-red-600' : 'text-warm-muted',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 mb-8 sm:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="bg-white">
          <CardContent className="py-4 px-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-warm-muted">{stat.label}</p>
              <stat.icon className={`h-3.5 w-3.5 ${stat.iconColor}`} />
            </div>
            <p className="text-xl font-semibold text-warm-text">{stat.value}</p>
            {stat.subtitle && (
              <p className="text-xs text-warm-muted mt-0.5">{stat.subtitle}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
