import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DeadlinesCard } from '@/components/dashboard/deadlines-card'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function dateOffset(offsetDays: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}T00:00:00`
}

const makeDeadline = (overrides: Record<string, unknown> = {}) => ({
  id: 'dl-001',
  key: 'answer_deadline_confirmed',
  due_at: dateOffset(10),
  source: 'user_confirmed',
  label: null,
  consequence: null,
  ...overrides,
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('DeadlinesCard — source labels', () => {
  describe('hero deadline (CountdownBox)', () => {
    it('shows "Confirmed" badge in calm-green for user_confirmed source', () => {
      render(
        <DeadlinesCard
          caseId="case-001"
          deadlines={[makeDeadline({ source: 'user_confirmed' })]}
        />
      )
      const badges = screen.getAllByTestId('source-badge')
      const heroBadge = badges[0]
      expect(heroBadge.textContent).toBe('Confirmed')
      expect(heroBadge.className).toContain('text-calm-green')
    })

    it('shows "Confirmed" badge for court_notice source', () => {
      render(
        <DeadlinesCard
          caseId="case-001"
          deadlines={[makeDeadline({ source: 'court_notice' })]}
        />
      )
      const badges = screen.getAllByTestId('source-badge')
      expect(badges[0].textContent).toBe('Confirmed')
      expect(badges[0].className).toContain('text-calm-green')
    })

    it('shows "Estimated" badge in calm-amber for system source', () => {
      render(
        <DeadlinesCard
          caseId="case-001"
          deadlines={[makeDeadline({ key: 'answer_deadline_estimated', source: 'system' })]}
        />
      )
      const badges = screen.getAllByTestId('source-badge')
      expect(badges[0].textContent).toBe('Estimated')
      expect(badges[0].className).toContain('text-calm-amber')
    })

    it('shows "Estimated" badge for ai_generated source', () => {
      render(
        <DeadlinesCard
          caseId="case-001"
          deadlines={[makeDeadline({ key: 'service_deadline', source: 'ai_generated' })]}
        />
      )
      const badges = screen.getAllByTestId('source-badge')
      expect(badges[0].textContent).toBe('Estimated')
      expect(badges[0].className).toContain('text-calm-amber')
    })
  })

  describe('confirmed + estimated pair', () => {
    it('shows confirmed deadline with "Originally estimated" date when both exist', () => {
      const deadlines = [
        makeDeadline({
          id: 'dl-confirmed',
          key: 'answer_deadline_confirmed',
          due_at: dateOffset(15),
          source: 'user_confirmed',
        }),
        makeDeadline({
          id: 'dl-estimated',
          key: 'answer_deadline_estimated',
          due_at: dateOffset(12),
          source: 'system',
        }),
      ]
      render(<DeadlinesCard caseId="case-001" deadlines={deadlines} />)

      // Confirmed is shown
      const badges = screen.getAllByTestId('source-badge')
      expect(badges[0].textContent).toBe('Confirmed')

      // "Originally estimated" text is shown
      const estimatedEl = screen.getByTestId('originally-estimated')
      expect(estimatedEl.textContent).toContain('Originally estimated:')
      expect(estimatedEl.className).toContain('text-warm-muted')
    })

    it('does not render the estimated deadline as a separate item', () => {
      const deadlines = [
        makeDeadline({
          id: 'dl-confirmed',
          key: 'answer_deadline_confirmed',
          due_at: dateOffset(15),
          source: 'user_confirmed',
        }),
        makeDeadline({
          id: 'dl-estimated',
          key: 'answer_deadline_estimated',
          due_at: dateOffset(12),
          source: 'system',
        }),
      ]
      render(<DeadlinesCard caseId="case-001" deadlines={deadlines} />)

      // Only one source badge total (the confirmed hero), not two
      const badges = screen.getAllByTestId('source-badge')
      expect(badges).toHaveLength(1)
    })

    it('does not show "Originally estimated" when only estimated exists (no confirmed)', () => {
      render(
        <DeadlinesCard
          caseId="case-001"
          deadlines={[
            makeDeadline({
              key: 'answer_deadline_estimated',
              source: 'system',
              due_at: dateOffset(12),
            }),
          ]}
        />
      )
      expect(screen.queryByTestId('originally-estimated')).not.toBeInTheDocument()
    })
  })

  describe('list item deadlines (non-hero)', () => {
    it('shows source badges on list items with correct colors', () => {
      const deadlines = [
        makeDeadline({
          id: 'dl-1',
          key: 'answer_deadline_confirmed',
          due_at: dateOffset(5),
          source: 'user_confirmed',
        }),
        makeDeadline({
          id: 'dl-2',
          key: 'service_deadline',
          due_at: dateOffset(20),
          source: 'system',
        }),
      ]
      render(<DeadlinesCard caseId="case-001" deadlines={deadlines} />)

      const badges = screen.getAllByTestId('source-badge')
      // Hero (confirmed) + list item (estimated)
      expect(badges).toHaveLength(2)
      expect(badges[0].textContent).toBe('Confirmed')
      expect(badges[0].className).toContain('text-calm-green')
      expect(badges[1].textContent).toBe('Estimated')
      expect(badges[1].className).toContain('text-calm-amber')
    })
  })

  describe('inline format: label · date · source', () => {
    it('renders hero with dot-separated label, date, and source', () => {
      render(
        <DeadlinesCard
          caseId="case-001"
          deadlines={[makeDeadline({ id: 'dl-hero', due_at: dateOffset(10) })]}
        />
      )
      const box = screen.getByTestId('countdown-box-dl-hero')
      // Should contain the middle-dot separators
      const dots = box.querySelectorAll('.mx-1')
      expect(dots.length).toBe(2)
    })
  })
})
