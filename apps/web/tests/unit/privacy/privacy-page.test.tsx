import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import PrivacyPage from '@/app/privacy/page'

describe('PrivacyPage', () => {
  it('discloses third-party processors used for sensitive legal self-help data', () => {
    render(<PrivacyPage />)

    expect(screen.getByRole('heading', { name: /privacy policy/i })).toBeInTheDocument()
    expect(screen.getByText(/OpenAI/i)).toBeInTheDocument()
    expect(screen.getByText(/Anthropic/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Supabase/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/Stripe/i)).toBeInTheDocument()
    expect(screen.getByText(/Resend/i)).toBeInTheDocument()
    expect(screen.getByText(/Plausible/i)).toBeInTheDocument()
    expect(screen.getByText(/Gmail/i)).toBeInTheDocument()
  })

  it('warns users not to enter highly sensitive identifiers unless necessary', () => {
    render(<PrivacyPage />)

    expect(screen.getByText(/Social Security numbers/i)).toBeInTheDocument()
    expect(screen.getByText(/bank account numbers/i)).toBeInTheDocument()
    expect(screen.getByText(/medical records/i)).toBeInTheDocument()
  })
})
