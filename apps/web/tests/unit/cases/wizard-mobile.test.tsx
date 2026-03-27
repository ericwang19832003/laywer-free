import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'

// Polyfill ResizeObserver for jsdom
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver

// ---------------------------------------------------------------------------
// Mocks — same pattern as new-case-prefill.test.tsx
// ---------------------------------------------------------------------------

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

vi.mock('sonner', () => ({ toast: vi.fn() }))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: { getSession: () => Promise.resolve({ data: { session: null } }) },
  }),
}))

vi.mock('@/hooks/use-subscription', () => ({
  useSubscription: () => ({ casesRemaining: 5, tier: 'free', loading: false }),
}))

vi.mock('@/components/subscription/upgrade-gate-provider', () => ({
  useUpgradeGateContext: () => ({ gatedFetch: vi.fn() }),
}))

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

// Wizard sub-step stubs
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

// Dialog mock that forwards className so we can assert mobile classes
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ open, children }: { open: boolean; children: React.ReactNode }) => (
    <div data-testid="dialog" data-open={open}>
      {children}
    </div>
  ),
  DialogTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-trigger">{children}</div>
  ),
  DialogContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="dialog-content" className={className}>
      {children}
    </div>
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

// Import component under test AFTER mocks
import { NewCaseDialog } from '@/components/cases/new-case-dialog'

// ---------------------------------------------------------------------------
// Tests — mobile full-screen behavior
// ---------------------------------------------------------------------------

describe('NewCaseDialog — mobile full-screen layout', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  afterEach(() => {
    sessionStorage.clear()
  })

  it('DialogContent has max-sm full-screen classes for mobile viewports', () => {
    render(<NewCaseDialog />)

    const content = screen.getByTestId('dialog-content')
    const cls = content.className

    // Full-screen on mobile: no rounding, full width/height, no border
    expect(cls).toContain('max-sm:min-h-screen')
    expect(cls).toContain('max-sm:w-screen')
    expect(cls).toContain('max-sm:rounded-none')
    expect(cls).toContain('max-sm:border-0')
    expect(cls).toContain('max-sm:h-screen')
    expect(cls).toContain('max-sm:max-w-none')
  })

  it('DialogContent retains desktop dialog classes', () => {
    render(<NewCaseDialog />)

    const content = screen.getByTestId('dialog-content')
    const cls = content.className

    // Desktop classes preserved
    expect(cls).toContain('sm:max-h-[85vh]')
    expect(cls).toContain('flex')
    expect(cls).toContain('flex-col')
  })

  it('overrides positioning for mobile so dialog covers full viewport', () => {
    render(<NewCaseDialog />)

    const content = screen.getByTestId('dialog-content')
    const cls = content.className

    expect(cls).toContain('max-sm:inset-0')
    expect(cls).toContain('max-sm:translate-x-0')
    expect(cls).toContain('max-sm:translate-y-0')
  })

  it('scroll area has flex-1 class on mobile for proper height distribution', () => {
    // Open dialog via sessionStorage prefill so content renders
    sessionStorage.setItem('onboarding_dispute_type', 'family')
    render(<NewCaseDialog />)

    // The scrollable div wrapping step content
    const scrollArea = screen.getByTestId('dialog-content').querySelector('.overflow-y-auto')
    expect(scrollArea).not.toBeNull()
    expect(scrollArea!.className).toContain('max-sm:flex-1')
  })
})
