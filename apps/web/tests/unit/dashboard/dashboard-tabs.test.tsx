import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DashboardTabs } from '@/components/dashboard/dashboard-tabs'

const mockPush = vi.fn()
const mockPathname = '/case/test-id'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => mockPathname,
}))

describe('DashboardTabs', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  function setup(activeTab: 'focus' | 'analyze' | 'tools' = 'focus') {
    return render(
      <DashboardTabs
        activeTab={activeTab}
        focus={activeTab === 'focus' ? <div>focus content</div> : null}
        overview={activeTab === 'analyze' ? <div>analyze content</div> : null}
        tools={activeTab === 'tools' ? <div>tools content</div> : null}
      />
    )
  }

  it('shows Focus tab content when activeTab is focus', () => {
    setup('focus')
    expect(screen.getByText('focus content')).toBeInTheDocument()
    expect(screen.queryByText('analyze content')).not.toBeInTheDocument()
    expect(screen.queryByText('tools content')).not.toBeInTheDocument()
  })

  it('shows Analyze tab content when activeTab is analyze', () => {
    setup('analyze')
    expect(screen.getByText('analyze content')).toBeInTheDocument()
    expect(screen.queryByText('focus content')).not.toBeInTheDocument()
  })

  it('shows Tools tab content when activeTab is tools', () => {
    setup('tools')
    expect(screen.getByText('tools content')).toBeInTheDocument()
  })

  it('marks the active tab as selected', () => {
    setup('focus')
    expect(screen.getByRole('tab', { name: 'Focus' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Analyze' })).toHaveAttribute('aria-selected', 'false')
    expect(screen.getByRole('tab', { name: 'Tools' })).toHaveAttribute('aria-selected', 'false')
  })

  it('calls router.push with correct tab param on click', () => {
    setup('focus')
    fireEvent.click(screen.getByRole('tab', { name: 'Analyze' }))
    expect(mockPush).toHaveBeenCalledWith('/case/test-id?tab=analyze', { scroll: false })
  })

  it('calls router.push for Tools tab', () => {
    setup('focus')
    fireEvent.click(screen.getByRole('tab', { name: 'Tools' }))
    expect(mockPush).toHaveBeenCalledWith('/case/test-id?tab=tools', { scroll: false })
  })

  it('navigates to next tab with ArrowRight', () => {
    setup('focus')
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowRight' })
    expect(mockPush).toHaveBeenCalledWith('/case/test-id?tab=analyze', { scroll: false })
  })

  it('navigates to previous tab with ArrowLeft', () => {
    setup('focus')
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowLeft' })
    expect(mockPush).toHaveBeenCalledWith('/case/test-id?tab=tools', { scroll: false })
  })

  it('wraps ArrowRight from Tools back to Focus', () => {
    setup('tools')
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowRight' })
    expect(mockPush).toHaveBeenCalledWith('/case/test-id?tab=focus', { scroll: false })
  })

  it('renders tabpanel with correct aria-labelledby', () => {
    setup('focus')
    const panel = screen.getByRole('tabpanel')
    expect(panel).toHaveAttribute('aria-labelledby', 'tab-focus')
    expect(panel).toHaveAttribute('tabindex', '0')
  })
})
