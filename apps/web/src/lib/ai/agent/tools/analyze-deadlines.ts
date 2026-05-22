import { tool } from '@langchain/core/tools'
import { z } from 'zod'

interface Deadline {
  key: string
  due_at: string
  label: string
}

export function createAnalyzeDeadlinesTool({ deadlines }: { deadlines: Deadline[] }) {
  return tool(
    async (_input: Record<string, never>) => {
      if (deadlines.length === 0) return 'No deadlines found for this case.'

      const now = Date.now()
      const lines: string[] = []

      for (const d of deadlines) {
        const due = new Date(d.due_at).getTime()
        const daysUntil = Math.ceil((due - now) / 86400000)

        let status: string
        if (daysUntil < 0) status = `OVERDUE by ${Math.abs(daysUntil)} day(s)`
        else if (daysUntil <= 7) status = `URGENT — due in ${daysUntil} day(s)`
        else status = `due in ${daysUntil} day(s)`

        lines.push(`• ${d.label}: ${status} (${d.due_at.slice(0, 10)})`)
      }

      return lines.join('\n')
    },
    {
      name: 'analyze_deadlines',
      description:
        'Analyze the case deadlines to identify what is overdue or urgent. Use when the user asks about timing, what to do next, or whether they are behind.',
      schema: z.object({}),
    }
  )
}
