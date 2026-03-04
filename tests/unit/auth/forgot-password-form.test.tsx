import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'

const mockResetPasswordForEmail = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      resetPasswordForEmail: mockResetPasswordForEmail,
    },
  }),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ForgotPasswordForm', () => {
  it('renders email input and send button', () => {
    render(<ForgotPasswordForm onBack={() => {}} />)
    expect(screen.getByLabelText('Email')).toBeDefined()
    expect(screen.getByRole('button', { name: 'Send Reset Link' })).toBeDefined()
  })

  it('calls resetPasswordForEmail on submit', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null })
    render(<ForgotPasswordForm onBack={() => {}} />)
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Send Reset Link' }))
    await waitFor(() => {
      expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.objectContaining({ redirectTo: expect.any(String) })
      )
    })
  })

  it('shows success message after sending', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null })
    render(<ForgotPasswordForm onBack={() => {}} />)
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Send Reset Link' }))
    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeDefined()
    })
  })

  it('calls onBack when back link is clicked', () => {
    const onBack = vi.fn()
    render(<ForgotPasswordForm onBack={onBack} />)
    fireEvent.click(screen.getByText('Back to Sign In'))
    expect(onBack).toHaveBeenCalled()
  })
})
