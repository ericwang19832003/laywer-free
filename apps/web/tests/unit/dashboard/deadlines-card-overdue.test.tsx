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

/**
 * Return a date string offset from today by `offsetDays`.
 * Uses local-time constructor to match how `daysUntil` strips to midnight,
 * avoiding UTC-vs-local timezone mismatches.
 */
function dateOffset(offsetDays: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  // Use "YYYY-MM-DDT00:00:00" (no Z) so `new Date(...)` parses in local time
  return `${y}-${m}-${day}T00:00:00`
}

const makeDeadline = (overrides: Record<string, unknown> = {}) => ({
  id: 'dl-001',
  key: 'answer_deadline_confirmed',
  due_at: dateOffset(0),
  source: 'user_confirmed',
  label: 'Answer Deadline',
  consequence: null,
  ...overrides,
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('DeadlinesCard — overdue vs due-today vs future styling', () => {
  describe('overdue deadline (days < 0)', () => {
    it('renders with destructive border and background', () => {
      render(
        <DeadlinesCard
          caseId="case-001"
          deadlines={[makeDeadline({ id: 'dl-overdue', due_at: dateOffset(-5) })]}
        />
      )
      const box = screen.getByTestId('countdown-box-dl-overdue')
      const countdownContainer = box.querySelector('.border-2')!
      expect(countdownContainer.className).toContain('border-destructive')
      expect(countdownContainer.className).toContain('bg-destructive/10')
    })

    it('renders countdown number with destructive text', () => {
      render(
        <DeadlinesCard
          caseId="case-001"
          deadlines={[makeDeadline({ id: 'dl-overdue', due_at: dateOffset(-3) })]}
        />
      )
      const box = screen.getByTestId('countdown-box-dl-overdue')
      const numberEl = box.querySelector('.text-2xl')!
      expect(numberEl.className).toContain('text-destructive')
      expect(numberEl.textContent).toBe('3')
    })

    it('shows overdue guidance text', () => {
      render(
        <DeadlinesCard
          caseId="case-001"
          deadlines={[makeDeadline({ id: 'dl-overdue', due_at: dateOffset(-7) })]}
        />
      )
      expect(
        screen.getByText('This deadline passed. Take action as soon as possible.')
      ).toBeInTheDocument()
    })

    it('shows "overdue" label instead of "days"', () => {
      render(
        <DeadlinesCard
          caseId="case-001"
          deadlines={[makeDeadline({ id: 'dl-overdue', due_at: dateOffset(-2) })]}
        />
      )
      expect(screen.getByText('overdue')).toBeInTheDocument()
    })
  })

  describe('due-today deadline (days === 0)', () => {
    it('renders with amber border and white background', () => {
      render(
        <DeadlinesCard
          caseId="case-001"
          deadlines={[makeDeadline({ id: 'dl-today', due_at: dateOffset(0) })]}
        />
      )
      const box = screen.getByTestId('countdown-box-dl-today')
      const countdownContainer = box.querySelector('.border-2')!
      expect(countdownContainer.className).toContain('border-amber-500')
      expect(countdownContainer.className).not.toContain('border-destructive')
      expect(countdownContainer.className).toContain('bg-white')
    })

    it('renders countdown number with calm-amber text', () => {
      render(
        <DeadlinesCard
          caseId="case-001"
          deadlines={[makeDeadline({ id: 'dl-today', due_at: dateOffset(0) })]}
        />
      )
      const box = screen.getByTestId('countdown-box-dl-today')
      const numberEl = box.querySelector('.text-2xl')!
      expect(numberEl.className).toContain('text-calm-amber')
    })

    it('does not show overdue guidance text', () => {
      render(
        <DeadlinesCard
          caseId="case-001"
          deadlines={[makeDeadline({ id: 'dl-today', due_at: dateOffset(0) })]}
        />
      )
      expect(
        screen.queryByText('This deadline passed. Take action as soon as possible.')
      ).not.toBeInTheDocument()
    })
  })

  describe('future deadline (days > 7)', () => {
    it('renders with emerald border and white background', () => {
      render(
        <DeadlinesCard
          caseId="case-001"
          deadlines={[makeDeadline({ id: 'dl-future', due_at: dateOffset(30) })]}
        />
      )
      const box = screen.getByTestId('countdown-box-dl-future')
      const countdownContainer = box.querySelector('.border-2')!
      expect(countdownContainer.className).toContain('border-emerald-500')
      expect(countdownContainer.className).not.toContain('border-destructive')
      expect(countdownContainer.className).not.toContain('border-amber-500')
    })

    it('renders countdown number with emerald text', () => {
      render(
        <DeadlinesCard
          caseId="case-001"
          deadlines={[makeDeadline({ id: 'dl-future', due_at: dateOffset(30) })]}
        />
      )
      const box = screen.getByTestId('countdown-box-dl-future')
      const numberEl = box.querySelector('.text-2xl')!
      expect(numberEl.className).toContain('text-emerald-600')
    })

    it('shows "days" label instead of "overdue"', () => {
      render(
        <DeadlinesCard
          caseId="case-001"
          deadlines={[makeDeadline({ id: 'dl-future', due_at: dateOffset(30) })]}
        />
      )
      expect(screen.getByText('days')).toBeInTheDocument()
    })
  })

  describe('near-future deadline (0 < days <= 7)', () => {
    it('renders with amber border', () => {
      render(
        <DeadlinesCard
          caseId="case-001"
          deadlines={[makeDeadline({ id: 'dl-soon', due_at: dateOffset(3) })]}
        />
      )
      const box = screen.getByTestId('countdown-box-dl-soon')
      const countdownContainer = box.querySelector('.border-2')!
      expect(countdownContainer.className).toContain('border-amber-500')
    })
  })
})
