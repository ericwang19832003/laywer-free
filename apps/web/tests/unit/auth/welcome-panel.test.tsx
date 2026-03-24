import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WelcomePanel } from '@/components/auth/welcome-panel'

describe('WelcomePanel', () => {
  it('renders the headline', () => {
    render(<WelcomePanel />)
    expect(screen.getByText(/organize your legal situation/i)).toBeDefined()
  })

  it('renders three benefit items', () => {
    render(<WelcomePanel />)
    expect(screen.getByText(/step-by-step case management/i)).toBeDefined()
    expect(screen.getByText(/know your deadlines/i)).toBeDefined()
    expect(screen.getByText(/ai-drafted legal documents/i)).toBeDefined()
  })
})
