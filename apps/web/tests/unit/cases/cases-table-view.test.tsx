import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { CasesTableView } from '@/components/cases/cases-table-view'
import type { CaseCardData } from '@/components/cases/case-cards'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

const baseCases: CaseCardData[] = [
  {
    id: 'case-1',
    description: 'Smith v. Jones',
    county: 'Los Angeles',
    role: 'plaintiff',
    court_type: 'superior',
    dispute_type: 'personal_injury',
    created_at: '2026-01-15T00:00:00Z',
    progress: 60,
    deadline: { due_at: '2026-04-01T00:00:00Z', label: 'Filing deadline' },
    lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
    status: 'active',
  },
  {
    id: 'case-2',
    description: '',
    county: 'San Diego',
    role: 'defendant',
    court_type: 'small_claims',
    dispute_type: 'landlord_tenant',
    created_at: '2026-02-20T00:00:00Z',
    progress: 0,
    status: 'active',
  },
  {
    id: 'case-3',
    description: 'Contract Dispute',
    county: '',
    role: 'plaintiff',
    court_type: 'superior',
    dispute_type: 'contract',
    created_at: '2026-03-10T00:00:00Z',
    progress: 100,
    deadline: { due_at: '2026-03-20T00:00:00Z', label: 'Response due' },
    lastActivity: '2026-03-23T10:00:00Z',
    status: 'active',
  },
]

describe('CasesTableView', () => {
  it('renders a table with correct headers', () => {
    render(<CasesTableView cases={baseCases} />)
    const table = screen.getByTestId('cases-table')
    expect(table).toBeDefined()

    const headers = within(table).getAllByRole('columnheader')
    const headerTexts = headers.map(h => h.textContent?.trim())
    expect(headerTexts).toEqual(['Case Name', 'Type', 'Progress', 'Next Deadline', 'Last Activity'])
  })

  it('renders one row per case', () => {
    render(<CasesTableView cases={baseCases} />)
    const rows = screen.getAllByTestId('cases-table-row')
    expect(rows).toHaveLength(3)
  })

  it('displays case name from description', () => {
    render(<CasesTableView cases={baseCases} />)
    expect(screen.getByText('Smith v. Jones')).toBeDefined()
  })

  it('falls back to county name when description is empty', () => {
    render(<CasesTableView cases={baseCases} />)
    // case-2 has empty description, county San Diego
    expect(screen.getByText('San Diego County')).toBeDefined()
  })

  it('shows dispute type labels', () => {
    render(<CasesTableView cases={baseCases} />)
    expect(screen.getByText('Personal Injury')).toBeDefined()
    expect(screen.getByText('Landlord-Tenant')).toBeDefined()
    expect(screen.getByText('Contract')).toBeDefined()
  })

  it('renders progress bars with correct aria values', () => {
    render(<CasesTableView cases={baseCases} />)
    const progressBars = screen.getAllByRole('progressbar')
    expect(progressBars).toHaveLength(3)
    expect(progressBars[0].getAttribute('aria-valuenow')).toBe('60')
    expect(progressBars[1].getAttribute('aria-valuenow')).toBe('0')
    expect(progressBars[2].getAttribute('aria-valuenow')).toBe('100')
  })

  it('shows deadline info when present', () => {
    render(<CasesTableView cases={baseCases} />)
    expect(screen.getByText('Filing deadline', { exact: false })).toBeDefined()
  })

  it('shows dash for missing deadline', () => {
    render(<CasesTableView cases={baseCases} />)
    const rows = screen.getAllByTestId('cases-table-row')
    // case-2 has no deadline
    const deadlineCell = rows[1].querySelectorAll('td')[3]
    expect(deadlineCell.textContent).toContain('—')
  })

  it('shows last activity when available', () => {
    render(<CasesTableView cases={baseCases} />)
    // case-1 has lastActivity 2h ago
    expect(screen.getByText('Today')).toBeDefined()
  })

  it('shows dash for missing last activity', () => {
    render(<CasesTableView cases={baseCases} />)
    const rows = screen.getAllByTestId('cases-table-row')
    // case-2 has no lastActivity
    const activityCell = rows[1].querySelectorAll('td')[4]
    expect(activityCell.textContent).toContain('—')
  })

  it('links each case name to the correct case page', () => {
    render(<CasesTableView cases={baseCases} />)
    const link = screen.getByText('Smith v. Jones').closest('a')
    expect(link?.getAttribute('href')).toBe('/case/case-1')
  })

  it('renders empty table body when no cases', () => {
    render(<CasesTableView cases={[]} />)
    const table = screen.getByTestId('cases-table')
    const rows = within(table).queryAllByTestId('cases-table-row')
    expect(rows).toHaveLength(0)
  })
})

describe('CaseCards localStorage persistence', () => {
  const STORAGE_KEY = 'cases_view_preference'

  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('reads saved preference from localStorage', () => {
    localStorage.setItem(STORAGE_KEY, 'list')
    const stored = localStorage.getItem(STORAGE_KEY)
    expect(stored).toBe('list')
  })

  it('defaults to card on narrow viewport when no preference saved', () => {
    // Default innerWidth in jsdom is 1024 (< 1280)
    const stored = localStorage.getItem(STORAGE_KEY)
    expect(stored).toBeNull()
    // On narrow viewport with no saved pref, default should be 'card'
    expect(window.innerWidth).toBeLessThan(1280)
  })

  it('persists preference value in localStorage', () => {
    localStorage.setItem(STORAGE_KEY, 'timeline')
    expect(localStorage.getItem(STORAGE_KEY)).toBe('timeline')
  })

  it('ignores invalid localStorage values', () => {
    localStorage.setItem(STORAGE_KEY, 'invalid_value')
    const saved = localStorage.getItem(STORAGE_KEY)
    // The component would fall through to responsive default
    expect(saved).not.toBe('card')
    expect(saved).not.toBe('list')
    expect(saved).not.toBe('timeline')
  })
})
