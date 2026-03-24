import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

// Polyfill ResizeObserver for jsdom
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver

// ---------------------------------------------------------------------------
// Mocks — heavy dependencies that NewCaseDialog imports
// ---------------------------------------------------------------------------

// next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

// sonner
vi.mock('sonner', () => ({ toast: vi.fn() }))

// supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: { getSession: () => Promise.resolve({ data: { session: null } }) },
  }),
}))

// subscription hook
vi.mock('@/hooks/use-subscription', () => ({
  useSubscription: () => ({ casesRemaining: 5, tier: 'free', loading: false }),
}))

// upgrade-gate provider
vi.mock('@/components/subscription/upgrade-gate-provider', () => ({
  useUpgradeGateContext: () => ({ gatedFetch: vi.fn() }),
}))

// court-recommendation — only the recommendCourt function is used at render time
vi.mock('@lawyer-free/shared/rules/court-recommendation', async () => {
  const actual = await vi.importActual<
    typeof import('@lawyer-free/shared/rules/court-recommendation')
  >('@lawyer-free/shared/rules/court-recommendation')
  return {
    ...actual,
    recommendCourt: vi.fn(() => ({
      recommended: 'district',
      reasoning: 'mock',
      confidence: 'high',
    })),
  }
})

// Wizard sub-step components — render minimal stubs so the dialog is lightweight
vi.mock('@/components/cases/wizard/wizard-progress', () => ({
  WizardProgress: () => <div data-testid="wizard-progress" />,
}))
vi.mock('@/components/cases/wizard/state-step', () => ({
  StateStep: () => <div data-testid="state-step" />,
}))
vi.mock('@/components/cases/wizard/role-step', () => ({
  RoleStep: () => <div data-testid="role-step" />,
}))
vi.mock('@/components/cases/wizard/dispute-type-step', () => ({
  DisputeTypeStep: () => <div data-testid="dispute-type-step" />,
}))
vi.mock('@/components/cases/wizard/amount-step', () => ({
  AmountStep: () => <div data-testid="amount-step" />,
}))
vi.mock('@/components/cases/wizard/circumstances-step', () => ({
  CircumstancesStep: () => <div data-testid="circumstances-step" />,
}))
vi.mock('@/components/cases/wizard/recommendation-step', () => ({
  RecommendationStep: () => <div data-testid="recommendation-step" />,
}))
vi.mock('@/components/cases/wizard/family-sub-type-step', () => ({
  FamilySubTypeStep: () => <div data-testid="family-sub-type-step" />,
}))
vi.mock('@/components/cases/wizard/small-claims-sub-type-step', () => ({
  SmallClaimsSubTypeStep: () => <div data-testid="small-claims-sub-type-step" />,
}))
vi.mock('@/components/cases/wizard/landlord-tenant-sub-type-step', () => ({
  LandlordTenantSubTypeStep: () => <div data-testid="landlord-tenant-sub-type-step" />,
}))
vi.mock('@/components/cases/wizard/debt-side-step', () => ({
  DebtSideStep: () => <div data-testid="debt-side-step" />,
}))
vi.mock('@/components/cases/wizard/debt-sub-type-step', () => ({
  DebtSubTypeStep: () => <div data-testid="debt-sub-type-step" />,
}))
vi.mock('@/components/cases/wizard/pi-sub-type-step', () => ({
  PISubTypeStep: () => <div data-testid="pi-sub-type-step" />,
}))
vi.mock('@/components/cases/wizard/business-sub-type-step', () => ({
  BusinessSubTypeStep: () => <div data-testid="business-sub-type-step" />,
}))

// Minimal Dialog/Button stubs so we don't need radix-ui internals
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ open, children }: { open: boolean; children: React.ReactNode }) => (
    <div data-testid="dialog" data-open={open}>
      {children}
    </div>
  ),
  DialogTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-trigger">{children}</div>
  ),
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/components/ui/button', () => ({
  Button: (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props} />
  ),
}))

// Import the component under test AFTER mocks are set up
import { NewCaseDialog } from '@/components/cases/new-case-dialog'

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('NewCaseDialog — onboarding dispute-type prefill', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  afterEach(() => {
    sessionStorage.clear()
  })

  it('reads onboarding_dispute_type from sessionStorage and opens with dispute type pre-selected', async () => {
    sessionStorage.setItem('onboarding_dispute_type', 'family')

    render(<NewCaseDialog />)

    // The dialog should auto-open and advance past step 3 (dispute type)
    await waitFor(() => {
      const dialog = screen.getByTestId('dialog')
      expect(dialog).toHaveAttribute('data-open', 'true')
    })

    // Should show step 4 (family sub-type) since dispute type was set to 'family'
    expect(screen.getByTestId('family-sub-type-step')).toBeInTheDocument()

    // sessionStorage should be cleared
    expect(sessionStorage.getItem('onboarding_dispute_type')).toBeNull()
  })

  it('clears sessionStorage after reading the value', async () => {
    sessionStorage.setItem('onboarding_dispute_type', 'landlord_tenant')

    render(<NewCaseDialog />)

    await waitFor(() => {
      expect(sessionStorage.getItem('onboarding_dispute_type')).toBeNull()
    })
  })

  it('does not auto-open when no onboarding_dispute_type in sessionStorage', () => {
    render(<NewCaseDialog />)

    const dialog = screen.getByTestId('dialog')
    expect(dialog).toHaveAttribute('data-open', 'false')
  })

  it('pre-selects debt_collection and shows debt side step at step 4', async () => {
    sessionStorage.setItem('onboarding_dispute_type', 'debt_collection')

    render(<NewCaseDialog />)

    await waitFor(() => {
      const dialog = screen.getByTestId('dialog')
      expect(dialog).toHaveAttribute('data-open', 'true')
    })

    // Step 4 for debt_collection shows DebtSideStep
    expect(screen.getByTestId('debt-side-step')).toBeInTheDocument()
  })

  it('pre-selects personal_injury and shows PI sub-type step at step 4', async () => {
    sessionStorage.setItem('onboarding_dispute_type', 'personal_injury')

    render(<NewCaseDialog />)

    await waitFor(() => {
      const dialog = screen.getByTestId('dialog')
      expect(dialog).toHaveAttribute('data-open', 'true')
    })

    expect(screen.getByTestId('pi-sub-type-step')).toBeInTheDocument()
  })
})
