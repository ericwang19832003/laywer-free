import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { toast } from 'sonner'
import { PriorityAlertsSection } from '@/components/dashboard/priority-alerts-section'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

// Mock next/navigation
const mockRefresh = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}))

// Mock sonner
vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}))

// ── Fixtures ─────────────────────────────────────

const makeAlert = (overrides = {}) => ({
  id: 'esc-001',
  case_id: 'case-001',
  deadline_id: 'dl-001',
  escalation_level: 3,
  message: 'Your answer deadline is tomorrow (March 15, 2026).',
  triggered_at: '2026-03-14T00:00:00Z',
  due_at: '2026-03-15T00:00:00Z',
  deadline_key: 'answer_deadline_confirmed',
  ...overrides,
})

beforeEach(() => {
  vi.clearAllMocks()
  global.fetch = vi.fn()
})

describe('PriorityAlertsSection', () => {
  describe('empty state', () => {
    it('renders nothing when alerts array is empty', () => {
      const { container } = render(
        <PriorityAlertsSection caseId="case-001" alerts={[]} />
      )
      expect(container.innerHTML).toBe('')
    })
  })

  describe('rendering alerts', () => {
    it('renders the section label', () => {
      render(
        <PriorityAlertsSection caseId="case-001" alerts={[makeAlert()]} />
      )
      expect(screen.getByText('Priority Alerts')).toBeInTheDocument()
    })

    it('renders correct number of alert cards', () => {
      render(
        <PriorityAlertsSection
          caseId="case-001"
          alerts={[
            makeAlert({ id: 'esc-001', escalation_level: 3 }),
            makeAlert({ id: 'esc-002', escalation_level: 2, message: 'Discovery due in 3 days.' }),
          ]}
        />
      )
      expect(screen.getByText('Your answer deadline is tomorrow (March 15, 2026).')).toBeInTheDocument()
      expect(screen.getByText('Discovery due in 3 days.')).toBeInTheDocument()
    })

    it('displays message text', () => {
      render(
        <PriorityAlertsSection caseId="case-001" alerts={[makeAlert()]} />
      )
      expect(screen.getByText('Your answer deadline is tomorrow (March 15, 2026).')).toBeInTheDocument()
    })

    it('displays formatted due date', () => {
      render(
        <PriorityAlertsSection caseId="case-001" alerts={[makeAlert()]} />
      )
      expect(screen.getByText(/March 15, 2026/)).toBeInTheDocument()
    })
  })

  describe('border colors by level', () => {
    it('level 3 has red left border', () => {
      render(
        <PriorityAlertsSection
          caseId="case-001"
          alerts={[makeAlert({ escalation_level: 3 })]}
        />
      )
      const card = screen.getByTestId('alert-card-esc-001')
      expect(card.className).toContain('border-l-red-500')
      expect(card.className).toContain('bg-red-50')
    })

    it('level 2 has amber left border', () => {
      render(
        <PriorityAlertsSection
          caseId="case-001"
          alerts={[makeAlert({ id: 'esc-002', escalation_level: 2 })]}
        />
      )
      const card = screen.getByTestId('alert-card-esc-002')
      expect(card.className).toContain('border-l-calm-amber')
      expect(card.className).toContain('bg-calm-amber/5')
    })

    it('level 1 has neutral border', () => {
      render(
        <PriorityAlertsSection
          caseId="case-001"
          alerts={[makeAlert({ id: 'esc-003', escalation_level: 1 })]}
        />
      )
      const card = screen.getByTestId('alert-card-esc-003')
      expect(card.className).toContain('border-l-warm-border')
      expect(card.className).toContain('bg-warm-bg')
    })
  })

  describe('buttons', () => {
    it('"Review" links to the deadlines page', () => {
      render(
        <PriorityAlertsSection caseId="case-001" alerts={[makeAlert()]} />
      )
      const reviewLink = screen.getByRole('link', { name: 'Review' })
      expect(reviewLink).toHaveAttribute('href', '/case/case-001/deadlines')
    })

    it('"Acknowledge" button is present', () => {
      render(
        <PriorityAlertsSection caseId="case-001" alerts={[makeAlert()]} />
      )
      expect(screen.getByRole('button', { name: 'Acknowledge' })).toBeInTheDocument()
    })
  })

  describe('acknowledge flow', () => {
    it('removes card from DOM on successful acknowledge', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })

      render(
        <PriorityAlertsSection caseId="case-001" alerts={[makeAlert()]} />
      )

      fireEvent.click(screen.getByRole('button', { name: 'Acknowledge' }))

      await waitFor(() => {
        expect(screen.queryByText('Your answer deadline is tomorrow (March 15, 2026).')).not.toBeInTheDocument()
      })
    })

    it('calls the correct API endpoint', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
      global.fetch = mockFetch

      render(
        <PriorityAlertsSection caseId="case-001" alerts={[makeAlert()]} />
      )

      fireEvent.click(screen.getByRole('button', { name: 'Acknowledge' }))

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/reminder-escalations/esc-001/acknowledge',
          expect.objectContaining({ method: 'PATCH' })
        )
      })
    })

    it('restores card on API failure', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Not found' }),
      })

      render(
        <PriorityAlertsSection caseId="case-001" alerts={[makeAlert()]} />
      )

      fireEvent.click(screen.getByRole('button', { name: 'Acknowledge' }))

      await waitFor(() => {
        expect(screen.getByText('Your answer deadline is tomorrow (March 15, 2026).')).toBeInTheDocument()
      })
    })

    it('shows error toast on API failure', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false, json: () => Promise.resolve({ error: 'Not found' }) })

      render(<PriorityAlertsSection caseId="case-001" alerts={[makeAlert()]} />)
      fireEvent.click(screen.getByRole('button', { name: 'Acknowledge' }))

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Could not acknowledge this alert. Please try again.'
        )
      })
    })

    it('restores card on network exception', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network failure'))

      render(<PriorityAlertsSection caseId="case-001" alerts={[makeAlert()]} />)
      fireEvent.click(screen.getByRole('button', { name: 'Acknowledge' }))

      await waitFor(() => {
        expect(screen.getByText('Your answer deadline is tomorrow (March 15, 2026).')).toBeInTheDocument()
      })
    })

    it('calls router.refresh on successful acknowledge', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ success: true }) })

      render(<PriorityAlertsSection caseId="case-001" alerts={[makeAlert()]} />)
      fireEvent.click(screen.getByRole('button', { name: 'Acknowledge' }))

      await waitFor(() => {
        expect(mockRefresh).toHaveBeenCalled()
      })
    })

    it('hides entire section when last alert is acknowledged', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })

      const { container } = render(
        <PriorityAlertsSection caseId="case-001" alerts={[makeAlert()]} />
      )

      fireEvent.click(screen.getByRole('button', { name: 'Acknowledge' }))

      await waitFor(() => {
        expect(container.innerHTML).toBe('')
      })
    })
  })
})
