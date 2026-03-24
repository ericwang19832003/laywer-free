import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DashboardError from '@/app/(authenticated)/case/[id]/error'

describe('DashboardError (error.tsx)', () => {
  const mockError = new Error('Supabase query failed')
  const mockReset = vi.fn()

  it('renders the error message and reassurance text', () => {
    render(<DashboardError error={mockError} reset={mockReset} />)

    expect(screen.getByText('Something went wrong.')).toBeDefined()
    expect(
      screen.getByText(/Your case data is safe/),
    ).toBeDefined()
  })

  it('renders a "Try again" button', () => {
    render(<DashboardError error={mockError} reset={mockReset} />)

    const button = screen.getByRole('button', { name: /try again/i })
    expect(button).toBeDefined()
  })

  it('calls reset() when the retry button is clicked', () => {
    render(<DashboardError error={mockError} reset={mockReset} />)

    const button = screen.getByRole('button', { name: /try again/i })
    fireEvent.click(button)

    expect(mockReset).toHaveBeenCalledTimes(1)
  })
})
