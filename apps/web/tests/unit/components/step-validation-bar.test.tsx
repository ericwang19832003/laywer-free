import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StepValidationBar } from '@/components/step/petition-wizard/step-validation-bar'

describe('StepValidationBar', () => {
  it('shows nothing when no blocks or warnings', () => {
    const { container } = render(
      <StepValidationBar blocks={[]} warnings={[]} glossaryHits={[]} />
    )
    expect(container.children).toHaveLength(0)
  })

  it('shows amber warning messages', () => {
    render(
      <StepValidationBar
        blocks={[]}
        warnings={[{ condition: 'test', message: 'Consider adding X' }]}
        glossaryHits={[]}
      />
    )
    expect(screen.getByText('Consider adding X')).toBeDefined()
  })

  it('shows block messages with stronger styling', () => {
    render(
      <StepValidationBar
        blocks={[{ field: 'date', message: 'This field is required' }]}
        warnings={[]}
        glossaryHits={[]}
      />
    )
    expect(screen.getByText('This field is required')).toBeDefined()
  })

  it('shows glossary tooltip triggers', () => {
    render(
      <StepValidationBar
        blocks={[]}
        warnings={[]}
        glossaryHits={[{ term: 'Statute of Limitations', plainEnglish: 'A deadline...' }]}
      />
    )
    expect(screen.getByText(/Statute of Limitations/)).toBeDefined()
  })
})
