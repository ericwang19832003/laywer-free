import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LegalDisclaimer } from '@/components/layout/legal-disclaimer'

describe('LegalDisclaimer', () => {
  it('links users to the privacy policy before entering case details', () => {
    render(<LegalDisclaimer />)

    expect(screen.getByText(/not a law firm/i)).toBeInTheDocument()

    const privacyLink = screen.getByRole('link', { name: /privacy policy/i })
    expect(privacyLink).toHaveAttribute('href', '/privacy')
  })
})
