import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ResearchAnswer } from '@/components/research/research-answer'

describe('ResearchAnswer', () => {
  it('renders an inline limitation notice when provided', () => {
    render(
      <ResearchAnswer
        answer="Sample answer"
        citations={[]}
        notice="Why this was limited: not enough supporting excerpts."
      />
    )

    expect(screen.getByText('Why this was limited: not enough supporting excerpts.')).toBeInTheDocument()
  })
})
