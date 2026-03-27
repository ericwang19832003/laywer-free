import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PhoneOtpForm } from '@/components/auth/phone-otp-form'

// Mock supabase client
const mockSignInWithOtp = vi.fn()
const mockVerifyOtp = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithOtp: mockSignInWithOtp,
      verifyOtp: mockVerifyOtp,
    },
  }),
}))

// Mock next/navigation
const mockPush = vi.fn()
const mockRefresh = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('PhoneOtpForm', () => {
  it('renders phone input initially', () => {
    render(<PhoneOtpForm />)
    expect(screen.getByLabelText('Phone Number')).toBeDefined()
    expect(screen.getByRole('button', { name: 'Send Code' })).toBeDefined()
  })

  it('does not show OTP input initially', () => {
    render(<PhoneOtpForm />)
    expect(screen.queryByLabelText('Verification Code')).toBeNull()
  })

  it('validates phone number format', async () => {
    render(<PhoneOtpForm />)
    const phoneInput = screen.getByLabelText('Phone Number')
    fireEvent.change(phoneInput, { target: { value: '123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send Code' }))
    await waitFor(() => {
      expect(screen.getByText(/enter a valid.*phone number/i)).toBeDefined()
    })
    expect(mockSignInWithOtp).not.toHaveBeenCalled()
  })

  it('shows OTP input after sending code', async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null })
    render(<PhoneOtpForm />)
    const phoneInput = screen.getByLabelText('Phone Number')
    fireEvent.change(phoneInput, { target: { value: '+12125551234' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send Code' }))
    await waitFor(() => {
      expect(screen.getByLabelText('Verification Code')).toBeDefined()
    })
  })

  it('calls signInWithOtp with phone number', async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null })
    render(<PhoneOtpForm />)
    fireEvent.change(screen.getByLabelText('Phone Number'), {
      target: { value: '+12125551234' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Send Code' }))
    await waitFor(() => {
      expect(mockSignInWithOtp).toHaveBeenCalledWith({ phone: '+12125551234' })
    })
  })

  it('displays error when OTP send fails', async () => {
    mockSignInWithOtp.mockResolvedValue({
      error: { message: 'Rate limit exceeded' },
    })
    render(<PhoneOtpForm />)
    fireEvent.change(screen.getByLabelText('Phone Number'), {
      target: { value: '+12125551234' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Send Code' }))
    await waitFor(() => {
      expect(screen.getByText('Rate limit exceeded')).toBeDefined()
    })
  })

  it('redirects on successful OTP verification', async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null })
    mockVerifyOtp.mockResolvedValue({
      data: { session: { access_token: 'tok' } },
      error: null,
    })
    render(<PhoneOtpForm />)
    fireEvent.change(screen.getByLabelText('Phone Number'), {
      target: { value: '+12125551234' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Send Code' }))
    await waitFor(() => {
      expect(screen.getByLabelText('Verification Code')).toBeDefined()
    })
    fireEvent.change(screen.getByLabelText('Verification Code'), {
      target: { value: '123456' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Verify' }))
    await waitFor(() => {
      expect(mockVerifyOtp).toHaveBeenCalledWith({
        phone: '+12125551234',
        token: '123456',
        type: 'sms',
      })
      expect(mockPush).toHaveBeenCalledWith('/cases')
    })
  })

  it('displays error on wrong OTP', async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null })
    mockVerifyOtp.mockResolvedValue({
      data: { session: null },
      error: { message: 'Invalid OTP' },
    })
    render(<PhoneOtpForm />)
    fireEvent.change(screen.getByLabelText('Phone Number'), {
      target: { value: '+12125551234' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Send Code' }))
    await waitFor(() => {
      expect(screen.getByLabelText('Verification Code')).toBeDefined()
    })
    fireEvent.change(screen.getByLabelText('Verification Code'), {
      target: { value: '000000' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Verify' }))
    await waitFor(() => {
      expect(screen.getByText('Invalid OTP')).toBeDefined()
    })
  })
})
