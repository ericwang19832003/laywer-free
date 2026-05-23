import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WelcomePanel } from '@/components/auth/welcome-panel'

describe('WelcomePanel', () => {
  it('renders the headline', () => {
    render(<WelcomePanel />)
    expect(screen.getByText(/facing a legal matter without a lawyer/i)).toBeDefined()
  })

  it('renders three benefit items', () => {
    render(<WelcomePanel />)
    expect(screen.getByText(/ai-assisted legal document drafts/i)).toBeDefined()
    expect(screen.getByText(/deadline tracking you verify/i)).toBeDefined()
    expect(screen.getByText(/step-by-step guidance from intake/i)).toBeDefined()
  })

  it('does not use absolute legal or privacy claims', () => {
    const { container } = render(<WelcomePanel />)
    const text = container.textContent?.toLowerCase() ?? ''

    expect(text).not.toContain('no lawyers required')
    expect(text).not.toContain('automatic deadline tracking')
    expect(text).not.toContain('your data stays private')
    expect(text).toContain('not legal advice')
  })
})
