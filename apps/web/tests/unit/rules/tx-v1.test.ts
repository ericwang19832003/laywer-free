import { computeDeadlinesFromServiceFacts } from '@/lib/rules/tx-v1'

describe('computeDeadlinesFromServiceFacts', () => {
  it('returns empty array when served_at is null', () => {
    const result = computeDeadlinesFromServiceFacts({ served_at: null })
    expect(result).toEqual([])
  })

  it('computes answer_deadline_estimated as served_at + 14 days, next Monday 10am', () => {
    // 2026-01-15 is a Thursday. +14 days = 2026-01-29 (Thursday). Next Monday = 2026-02-02.
    const result = computeDeadlinesFromServiceFacts({ served_at: '2026-01-15' })
    const answer = result.find((d) => d.key === 'answer_deadline_estimated')
    expect(answer).toBeDefined()

    const dueDate = new Date(answer!.due_at)
    expect(dueDate.getDay()).toBe(1) // Monday
    expect(dueDate.getHours()).toBe(10)
    expect(dueDate.getFullYear()).toBe(2026)
    expect(dueDate.getMonth()).toBe(1) // February (0-indexed)
    expect(dueDate.getDate()).toBe(2)
  })

  it('keeps Monday if served_at + 14 already lands on Monday', () => {
    // 2026-01-05 is a Monday. +14 days = 2026-01-19 (Monday). Should stay Monday.
    const result = computeDeadlinesFromServiceFacts({ served_at: '2026-01-05' })
    const answer = result.find((d) => d.key === 'answer_deadline_estimated')

    const dueDate = new Date(answer!.due_at)
    expect(dueDate.getDay()).toBe(1) // Monday
    expect(dueDate.getDate()).toBe(19)
  })

  it('computes check_docket 7 days after answer deadline', () => {
    const result = computeDeadlinesFromServiceFacts({ served_at: '2026-01-15' })
    const answer = result.find((d) => d.key === 'answer_deadline_estimated')
    const checkDocket = result.find((d) => d.key === 'check_docket_after_answer_deadline')

    expect(checkDocket).toBeDefined()

    const answerDate = new Date(answer!.due_at)
    const checkDate = new Date(checkDocket!.due_at)
    const diffDays = (checkDate.getTime() - answerDate.getTime()) / (24 * 60 * 60 * 1000)
    expect(diffDays).toBe(7)
  })

  it('includes default_earliest_info when return_filed_at is provided', () => {
    const result = computeDeadlinesFromServiceFacts({
      served_at: '2026-01-15',
      return_filed_at: '2026-01-20',
    })
    const info = result.find((d) => d.key === 'default_earliest_info')
    expect(info).toBeDefined()

    const infoDate = new Date(info!.due_at)
    expect(infoDate.getDate()).toBe(21) // 2026-01-20 + 1 day
  })

  it('excludes default_earliest_info when return_filed_at is null', () => {
    const result = computeDeadlinesFromServiceFacts({
      served_at: '2026-01-15',
      return_filed_at: null,
    })
    const info = result.find((d) => d.key === 'default_earliest_info')
    expect(info).toBeUndefined()
  })

  it('always returns 2 deadlines without return_filed_at', () => {
    const result = computeDeadlinesFromServiceFacts({ served_at: '2026-01-15' })
    expect(result).toHaveLength(2)
    expect(result.map((d) => d.key)).toEqual([
      'answer_deadline_estimated',
      'check_docket_after_answer_deadline',
    ])
  })

  it('returns 3 deadlines with return_filed_at', () => {
    const result = computeDeadlinesFromServiceFacts({
      served_at: '2026-01-15',
      return_filed_at: '2026-01-20',
    })
    expect(result).toHaveLength(3)
  })

  it('all deadlines have calc_version TX_V1', () => {
    const result = computeDeadlinesFromServiceFacts({
      served_at: '2026-01-15',
      return_filed_at: '2026-01-20',
    })
    for (const d of result) {
      expect(d.calc_version).toBe('TX_V1')
    }
  })

  it('all deadlines have non-empty rationale', () => {
    const result = computeDeadlinesFromServiceFacts({
      served_at: '2026-01-15',
      return_filed_at: '2026-01-20',
    })
    for (const d of result) {
      expect(d.rationale.length).toBeGreaterThan(0)
    }
  })

  it('handles Sunday service date correctly (next Monday after +14)', () => {
    // 2026-01-11 is a Sunday. +14 = 2026-01-25 (Sunday). Next Monday = 2026-01-26.
    const result = computeDeadlinesFromServiceFacts({ served_at: '2026-01-11' })
    const answer = result.find((d) => d.key === 'answer_deadline_estimated')

    const dueDate = new Date(answer!.due_at)
    expect(dueDate.getDay()).toBe(1) // Monday
    expect(dueDate.getDate()).toBe(26)
  })

  it('handles Saturday service date correctly', () => {
    // 2026-01-10 is a Saturday. +14 = 2026-01-24 (Saturday). Next Monday = 2026-01-26.
    const result = computeDeadlinesFromServiceFacts({ served_at: '2026-01-10' })
    const answer = result.find((d) => d.key === 'answer_deadline_estimated')

    const dueDate = new Date(answer!.due_at)
    expect(dueDate.getDay()).toBe(1) // Monday
    expect(dueDate.getDate()).toBe(26)
  })
})
