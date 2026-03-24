import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BackfillBanner } from '@/components/dashboard/backfill-banner'
import { SolBanner } from '@/components/dashboard/sol-banner'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

beforeEach(() => {
  localStorage.clear()
})

// ---------------------------------------------------------------------------
// BackfillBanner
// ---------------------------------------------------------------------------

describe('BackfillBanner dismiss logic', () => {
  const defaultProps = { caseId: 'case-1', skippedCount: 3 }

  it('renders when localStorage view count is 0 (first visit)', () => {
    render(<BackfillBanner {...defaultProps} />)
    expect(screen.getByText(/were skipped/)).toBeInTheDocument()
  })

  it('renders on 2nd and 3rd visit (count < 3)', () => {
    localStorage.setItem('banner_backfill_views_case-1', '1')
    render(<BackfillBanner {...defaultProps} />)
    expect(screen.getByText(/were skipped/)).toBeInTheDocument()
  })

  it('does not render when view count >= 3', () => {
    localStorage.setItem('banner_backfill_views_case-1', '3')
    render(<BackfillBanner {...defaultProps} />)
    expect(screen.queryByText(/were skipped/)).not.toBeInTheDocument()
  })

  it('increments view count on render', () => {
    localStorage.setItem('banner_backfill_views_case-1', '1')
    render(<BackfillBanner {...defaultProps} />)
    expect(localStorage.getItem('banner_backfill_views_case-1')).toBe('2')
  })

  it('manual dismiss sets count to max and hides banner', () => {
    render(<BackfillBanner {...defaultProps} />)
    fireEvent.click(screen.getByLabelText('Dismiss banner'))
    expect(localStorage.getItem('banner_backfill_views_case-1')).toBe('3')
    expect(screen.queryByText(/earlier step/)).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// SolBanner
// ---------------------------------------------------------------------------

describe('SolBanner dismiss logic', () => {
  const defaultProps = {
    caseId: 'case-1',
    sol: {
      years: 2,
      expiresAt: '2027-01-01T00:00:00',
      daysRemaining: 365,
      level: 'safe' as const,
      notes: null,
    },
    disputeType: 'contract',
    state: 'Texas',
  }

  it('renders when localStorage view count is 0 (first visit)', () => {
    render(<SolBanner {...defaultProps} />)
    expect(screen.getByText(/Statute of Limitations/)).toBeInTheDocument()
  })

  it('renders on 2nd and 3rd visit (count < 3)', () => {
    localStorage.setItem('banner_sol_views_case-1', '2')
    render(<SolBanner {...defaultProps} />)
    expect(screen.getByText(/Statute of Limitations/)).toBeInTheDocument()
  })

  it('does not render when view count >= 3', () => {
    localStorage.setItem('banner_sol_views_case-1', '3')
    render(<SolBanner {...defaultProps} />)
    expect(screen.queryByText(/Statute of Limitations/)).not.toBeInTheDocument()
  })

  it('increments view count on render', () => {
    localStorage.setItem('banner_sol_views_case-1', '0')
    render(<SolBanner {...defaultProps} />)
    expect(localStorage.getItem('banner_sol_views_case-1')).toBe('1')
  })

  it('manual dismiss sets count to max and hides banner', () => {
    render(<SolBanner {...defaultProps} />)
    fireEvent.click(screen.getByLabelText('Dismiss SOL banner'))
    expect(localStorage.getItem('banner_sol_views_case-1')).toBe('3')
    expect(screen.queryByText(/Statute of Limitations/)).not.toBeInTheDocument()
  })
})
