import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AuthTabs } from '@/components/auth/auth-tabs'

describe('AuthTabs', () => {
  it('renders Email and Phone tabs', () => {
    render(
      <AuthTabs activeTab="email" onTabChange={() => {}}>
        <div>content</div>
      </AuthTabs>
    )
    expect(screen.getByRole('button', { name: 'Email' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Phone' })).toBeDefined()
  })

  it('default active tab is Email', () => {
    render(
      <AuthTabs activeTab="email" onTabChange={() => {}}>
        <div>content</div>
      </AuthTabs>
    )
    const emailTab = screen.getByRole('button', { name: 'Email' })
    expect(emailTab.className).toContain('bg-primary')
  })

  it('calls onTabChange when Phone tab is clicked', () => {
    let changed = ''
    render(
      <AuthTabs activeTab="email" onTabChange={(tab) => { changed = tab }}>
        <div>content</div>
      </AuthTabs>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Phone' }))
    expect(changed).toBe('phone')
  })

  it('renders children', () => {
    render(
      <AuthTabs activeTab="email" onTabChange={() => {}}>
        <div data-testid="child">hello</div>
      </AuthTabs>
    )
    expect(screen.getByTestId('child')).toBeDefined()
  })
})
