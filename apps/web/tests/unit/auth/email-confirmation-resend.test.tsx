import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { WelcomeAuthCard } from '@/components/auth/welcome-auth-card'

const mockSignUp = vi.fn()
const mockResend = vi.fn()
const mockPush = vi.fn()
const mockRefresh = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signUp: mockSignUp,
      resend: mockResend,
      signInWithPassword: vi.fn(),
    },
  }),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.useRealTimers()
})

async function reachConfirmationScreen() {
  mockSignUp.mockResolvedValue({ data: { session: null }, error: null })

  render(<WelcomeAuthCard initialMode="signup" />)

  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: 'test@example.com' },
  })
  fireEvent.change(screen.getByLabelText('Password'), {
    target: { value: 'securepass123' },
  })

  const submitBtn = screen.getAllByRole('button', { name: 'Create Account' })
    .find(btn => btn.getAttribute('type') === 'submit')!
  fireEvent.click(submitBtn)

  await waitFor(() => {
    expect(screen.getByText(/check your email to confirm/i)).toBeDefined()
  })
}

describe('Email confirmation resend', () => {
  it('shows resend button on confirmation screen', async () => {
    await reachConfirmationScreen()

    const resendBtn = screen.getByText(/didn.t get the email/i)
    expect(resendBtn).toBeDefined()
    expect(resendBtn.tagName.toLowerCase()).toBe('button')
  })

  it('shows spam folder guidance', async () => {
    await reachConfirmationScreen()

    expect(screen.getByText(/check your spam folder/i)).toBeDefined()
  })

  it('disables resend button during 30-second cooldown after resend', async () => {
    vi.useFakeTimers()
    mockSignUp.mockResolvedValue({ data: { session: null }, error: null })
    mockResend.mockResolvedValue({ error: null })

    render(<WelcomeAuthCard initialMode="signup" />)

    // Fill in form
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'securepass123' },
    })

    // Submit signup
    const submitBtn = screen.getAllByRole('button', { name: 'Create Account' })
      .find(btn => btn.getAttribute('type') === 'submit')!

    await act(async () => {
      fireEvent.click(submitBtn)
      // Flush the signUp promise
      await vi.advanceTimersByTimeAsync(0)
    })

    // Confirm we're on the confirmation screen
    expect(screen.getByText(/check your email to confirm/i)).toBeDefined()

    // Resend button should be enabled
    const resendBtn = screen.getByText(/didn.t get the email/i)
    expect(resendBtn).not.toBeDisabled()

    // Click resend
    await act(async () => {
      fireEvent.click(resendBtn)
      await vi.advanceTimersByTimeAsync(0)
    })

    // After successful resend, button should show cooldown and be disabled
    const cooldownBtn = screen.getByText(/resend available in \d+s/i)
    expect(cooldownBtn).toBeDisabled()

    // Advance 10 seconds (each tick is a chained setTimeout, advance one at a time)
    for (let i = 0; i < 10; i++) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1_000)
      })
    }
    // Should still be in cooldown
    expect(screen.getByText(/resend available in \d+s/i)).toBeDisabled()

    // Advance the remaining seconds past cooldown
    for (let i = 0; i < 25; i++) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1_000)
      })
    }

    // Button should be enabled again
    expect(screen.getByText(/didn.t get the email/i)).not.toBeDisabled()
  }, 15_000)

  it('shows confirmation email sent address', async () => {
    await reachConfirmationScreen()

    expect(screen.getByText('test@example.com')).toBeDefined()
  })
})
