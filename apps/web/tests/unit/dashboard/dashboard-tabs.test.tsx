import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DashboardTabs } from '@/components/dashboard/dashboard-tabs'

describe('DashboardTabs', () => {
  function setup() {
    return render(
      <DashboardTabs
        focus={<div>focus content</div>}
        overview={<div>overview content</div>}
        tools={<div>tools content</div>}
      />
    )
  }

  it('shows Focus tab content by default', () => {
    setup()
    expect(screen.getByText('focus content')).toBeVisible()
    expect(screen.getByText('overview content')).not.toBeVisible()
    expect(screen.getByText('tools content')).not.toBeVisible()
  })

  it('switches to Overview tab on click', () => {
    setup()
    fireEvent.click(screen.getByRole('tab', { name: 'Overview' }))
    expect(screen.getByText('overview content')).toBeVisible()
    expect(screen.getByText('focus content')).not.toBeVisible()
  })

  it('switches to Tools tab on click', () => {
    setup()
    fireEvent.click(screen.getByRole('tab', { name: 'Tools' }))
    expect(screen.getByText('tools content')).toBeVisible()
    expect(screen.getByText('focus content')).not.toBeVisible()
  })

  it('marks the active tab as selected', () => {
    setup()
    expect(screen.getByRole('tab', { name: 'Focus' })).toHaveAttribute('aria-selected', 'true')
    fireEvent.click(screen.getByRole('tab', { name: 'Overview' }))
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Focus' })).toHaveAttribute('aria-selected', 'false')
  })
})
