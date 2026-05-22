import { describe, it, expect } from 'vitest'
import { createAnalyzeDeadlinesTool } from '../analyze-deadlines'

const mockDeadlines = [
  { key: 'serve_defendant', due_at: new Date(Date.now() - 86400000).toISOString(), label: 'Serve defendant' },
  { key: 'file_answer', due_at: new Date(Date.now() + 3 * 86400000).toISOString(), label: 'File answer' },
  { key: 'discovery_close', due_at: new Date(Date.now() + 30 * 86400000).toISOString(), label: 'Close discovery' },
]

describe('createAnalyzeDeadlinesTool', () => {
  it('flags overdue deadlines', async () => {
    const tool = createAnalyzeDeadlinesTool({ deadlines: mockDeadlines })
    const result = await tool.invoke({})
    expect(result).toContain('OVERDUE')
    expect(result).toContain('Serve defendant')
  })

  it('flags urgent deadlines within 7 days', async () => {
    const tool = createAnalyzeDeadlinesTool({ deadlines: mockDeadlines })
    const result = await tool.invoke({})
    expect(result).toContain('URGENT')
    expect(result).toContain('File answer')
  })

  it('returns no-deadlines message for empty array', async () => {
    const tool = createAnalyzeDeadlinesTool({ deadlines: [] })
    const result = await tool.invoke({})
    expect(result).toBe('No deadlines found for this case.')
  })

  it('handles deadline exactly today (daysUntil = 0) as URGENT', async () => {
    const today = new Date()
    today.setHours(23, 59, 0, 0)
    const tool = createAnalyzeDeadlinesTool({
      deadlines: [{ key: 'file', due_at: today.toISOString(), label: 'File motion' }],
    })
    const result = await tool.invoke({})
    expect(result).toContain('URGENT')
    expect(result).toContain('File motion')
  })

  it('handles multiple deadlines with mixed statuses', async () => {
    const tool = createAnalyzeDeadlinesTool({
      deadlines: [
        { key: 'a', due_at: new Date(Date.now() - 86400000).toISOString(), label: 'Past deadline' },
        { key: 'b', due_at: new Date(Date.now() + 2 * 86400000).toISOString(), label: 'Urgent deadline' },
        { key: 'c', due_at: new Date(Date.now() + 20 * 86400000).toISOString(), label: 'Future deadline' },
      ],
    })
    const result = await tool.invoke({})
    expect(result).toContain('OVERDUE')
    expect(result).toContain('URGENT')
    expect(result).toContain('due in 20')
  })
})
