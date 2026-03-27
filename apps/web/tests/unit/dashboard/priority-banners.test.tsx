import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

// ---- Mocks ----------------------------------------------------------------

// Mock the server Supabase client (prevent real DB calls)
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

// Mock calculateSol so we don't need the full shared package
vi.mock('@lawyer-free/shared/rules/statute-of-limitations', () => ({
  calculateSol: vi.fn(() => ({
    years: 2,
    expiresAt: new Date('2027-01-01'),
    daysRemaining: 365,
    level: 'safe',
    notes: null,
  })),
}))

// Track which child components are rendered
const solBannerSpy = vi.fn()
const filingCardSpy = vi.fn()

vi.mock('@/components/dashboard/sol-banner', () => ({
  SolBanner: (props: Record<string, unknown>) => {
    solBannerSpy(props)
    return <div data-testid="sol-banner" />
  },
}))

vi.mock('@/components/dashboard/filing-instructions-card', () => ({
  FilingInstructionsCard: (props: Record<string, unknown>) => {
    filingCardSpy(props)
    return <div data-testid="filing-instructions" />
  },
}))

// Minimal Supabase mock chain
function createMockSupabase(intakeData: Record<string, unknown> | null = null) {
  const chain = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: intakeData }),
  }
  return chain
}

// Must import AFTER mocks are declared
import { createClient } from '@/lib/supabase/server'
import { PriorityBanners } from '@/components/dashboard/priority-banners'

const mockedCreateClient = vi.mocked(createClient)

// ---- Helpers ---------------------------------------------------------------

const baseProps = {
  caseId: 'case-1',
  jurisdiction: 'CA',
  courtType: 'superior',
  county: 'Los Angeles',
}

// ---- Tests -----------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks()
})

describe('PriorityBanners', () => {
  describe('focus placement', () => {
    it('renders SOL banner for personal_injury (priority dispute type)', async () => {
      mockedCreateClient.mockResolvedValue(createMockSupabase() as never)

      const Component = await PriorityBanners({
        ...baseProps,
        disputeType: 'personal_injury',
        placement: 'focus',
      })
      render(<>{Component}</>)

      expect(screen.getByTestId('sol-banner')).toBeInTheDocument()
      expect(screen.queryByTestId('filing-instructions')).not.toBeInTheDocument()
    })

    it('renders filing instructions for landlord_tenant (priority dispute type)', async () => {
      mockedCreateClient.mockResolvedValue(createMockSupabase() as never)

      const Component = await PriorityBanners({
        ...baseProps,
        disputeType: 'landlord_tenant',
        placement: 'focus',
      })
      render(<>{Component}</>)

      expect(screen.queryByTestId('sol-banner')).not.toBeInTheDocument()
      expect(screen.getByTestId('filing-instructions')).toBeInTheDocument()
    })

    it('renders nothing for property (no type-specific priority cards)', async () => {
      const Component = await PriorityBanners({
        ...baseProps,
        disputeType: 'property',
        placement: 'focus',
      })
      render(<>{Component}</>)

      expect(screen.queryByTestId('sol-banner')).not.toBeInTheDocument()
      expect(screen.queryByTestId('filing-instructions')).not.toBeInTheDocument()
      // Should not have created a Supabase client since nothing to show
      expect(mockedCreateClient).not.toHaveBeenCalled()
    })
  })

  describe('overview placement', () => {
    it('renders SOL banner for property (non-priority → overview)', async () => {
      mockedCreateClient.mockResolvedValue(createMockSupabase() as never)

      const Component = await PriorityBanners({
        ...baseProps,
        disputeType: 'property',
        placement: 'overview',
      })
      render(<>{Component}</>)

      expect(screen.getByTestId('sol-banner')).toBeInTheDocument()
      expect(screen.getByTestId('filing-instructions')).toBeInTheDocument()
    })

    it('does NOT render SOL banner for personal_injury on overview (it is in focus)', async () => {
      mockedCreateClient.mockResolvedValue(createMockSupabase() as never)

      const Component = await PriorityBanners({
        ...baseProps,
        disputeType: 'personal_injury',
        placement: 'overview',
      })
      render(<>{Component}</>)

      expect(screen.queryByTestId('sol-banner')).not.toBeInTheDocument()
      expect(screen.getByTestId('filing-instructions')).toBeInTheDocument()
    })

    it('does NOT render filing instructions for landlord_tenant on overview (it is in focus)', async () => {
      mockedCreateClient.mockResolvedValue(createMockSupabase() as never)

      const Component = await PriorityBanners({
        ...baseProps,
        disputeType: 'landlord_tenant',
        placement: 'overview',
      })
      render(<>{Component}</>)

      expect(screen.getByTestId('sol-banner')).toBeInTheDocument()
      expect(screen.queryByTestId('filing-instructions')).not.toBeInTheDocument()
    })
  })

  describe('SOL data fetching', () => {
    it('extracts incident_date from intake task metadata', async () => {
      const { calculateSol } = await import('@lawyer-free/shared/rules/statute-of-limitations')
      const mockedCalc = vi.mocked(calculateSol)

      mockedCreateClient.mockResolvedValue(
        createMockSupabase({ metadata: { incident_date: '2025-06-15' } }) as never
      )

      const Component = await PriorityBanners({
        ...baseProps,
        disputeType: 'personal_injury',
        placement: 'focus',
      })
      render(<>{Component}</>)

      expect(mockedCalc).toHaveBeenCalledWith('CA', 'personal_injury', null, '2025-06-15')
    })

    it('falls back through date fields: contract_date, lease_start_date, separation_date', async () => {
      const { calculateSol } = await import('@lawyer-free/shared/rules/statute-of-limitations')
      const mockedCalc = vi.mocked(calculateSol)

      mockedCreateClient.mockResolvedValue(
        createMockSupabase({ metadata: { lease_start_date: '2024-03-01' } }) as never
      )

      const Component = await PriorityBanners({
        ...baseProps,
        disputeType: 'debt_collection',
        placement: 'focus',
      })
      render(<>{Component}</>)

      expect(mockedCalc).toHaveBeenCalledWith('CA', 'debt_collection', null, '2024-03-01')
    })
  })
})
