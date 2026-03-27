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
    expect(screen.getByText(/ai-drafted legal documents in minutes/i)).toBeDefined()
    expect(screen.getByText(/automatic deadline tracking/i)).toBeDefined()
    expect(screen.getByText(/step-by-step guidance from intake/i)).toBeDefined()
  })
})
