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
  const stats = [
    { label: 'Active Cases', value: activeCases, icon: Briefcase, color: 'text-calm-indigo' },
    { label: 'Tasks Done', value: `${tasksCompleted}/${tasksTotal}`, icon: CheckCircle2, color: 'text-calm-green' },
    { label: 'Deadlines (7d)', value: upcomingDeadlines, icon: Clock, color: 'text-calm-amber' },
    { label: 'Avg Health', value: averageHealth !== null ? `${averageHealth}%` : '\u2014', icon: Heart, color: averageHealth !== null && averageHealth >= 70 ? 'text-calm-green' : averageHealth !== null && averageHealth >= 40 ? 'text-calm-amber' : 'text-red-500' },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="py-4 px-4 flex items-center gap-3">
            <stat.icon className={`h-5 w-5 ${stat.color} shrink-0`} />
            <div>
              <p className="text-lg font-semibold text-warm-text">{stat.value}</p>
              <p className="text-xs text-warm-muted">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
