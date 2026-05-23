import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow'

// Mock fetch for the user-preferences API call
const mockFetch = vi.fn().mockResolvedValue({ ok: true })
vi.stubGlobal('fetch', mockFetch)

describe('OnboardingFlow', () => {
  const mockOnComplete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  function advanceToRoleScreen() {
    render(<OnboardingFlow onComplete={mockOnComplete} />)
    fireEvent.click(screen.getByRole('button', { name: /get started/i }))
  }

  function selectRoleAndState(role: 'plaintiff' | 'defendant' = 'defendant') {
    const roleButtonName = role === 'plaintiff'
      ? /i.m filing a case/i
      : /someone filed against me/i

    fireEvent.click(screen.getByRole('button', { name: roleButtonName }))
    fireEvent.change(screen.getByLabelText(/what state is your case in/i), {
      target: { value: 'TX' },
    })
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))
  }

  function renderAtSituationScreen(role: 'plaintiff' | 'defendant' = 'defendant') {
    advanceToRoleScreen()
    selectRoleAndState(role)
  }

  describe('Screen 1 — How it works', () => {
    it('renders welcome heading', () => {
      render(<OnboardingFlow onComplete={mockOnComplete} />)
      expect(screen.getByText('Welcome to Lawyer Free')).toBeInTheDocument()
    })

    it('displays three explanation steps', () => {
      render(<OnboardingFlow onComplete={mockOnComplete} />)
      expect(screen.getByText('Describe your situation')).toBeInTheDocument()
      expect(screen.getByText('Get AI-guided steps')).toBeInTheDocument()
      expect(screen.getByText('File with confidence')).toBeInTheDocument()
    })

    it('has a get-started button that advances to screen 2', () => {
      advanceToRoleScreen()
      expect(screen.getByText('Tell us about your role')).toBeInTheDocument()
    })
  })

  describe('Screen 2 — Situation selection', () => {
    it('shows all situation cards', () => {
      renderAtSituationScreen('defendant')
      expect(screen.getByText('Being sued')).toBeInTheDocument()
      expect(screen.getByText('Facing eviction')).toBeInTheDocument()
      expect(screen.getByText('Debt collection')).toBeInTheDocument()
      expect(screen.getByText('Family matter')).toBeInTheDocument()
      expect(screen.getByText('Contract claim against me')).toBeInTheDocument()
      expect(screen.getByText('Business claim against me')).toBeInTheDocument()
      expect(screen.getByText('Something else')).toBeInTheDocument()
    })

    it('shows back button that returns to screen 1', () => {
      advanceToRoleScreen()
      fireEvent.click(screen.getByText(/back/i))
      expect(screen.getByText('Welcome to Lawyer Free')).toBeInTheDocument()
    })

    it('selecting a situation advances to screen 3 and calls onComplete with dispute type', async () => {
      renderAtSituationScreen('defendant')
      fireEvent.click(screen.getByText('Being sued'))

      // Screen 3 shows loading state
      expect(screen.getByText('Setting up your case')).toBeInTheDocument()

      // Eventually calls onComplete with the dispute type
      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledWith('small_claims')
      })
    })

    it('selecting "Something else" calls onComplete with undefined', async () => {
      renderAtSituationScreen('defendant')
      fireEvent.click(screen.getByText('Something else'))

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledWith(undefined)
      })
    })
  })

  describe('Screen 3 — Transition', () => {
    it('calls the user-preferences API', async () => {
      renderAtSituationScreen('defendant')
      fireEvent.click(screen.getByText('Facing eviction'))

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/user-preferences', { method: 'POST' })
      })
    })

    it('calls onComplete even if API call fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      renderAtSituationScreen('defendant')
      fireEvent.click(screen.getByText('Debt collection'))

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledWith('debt_collection')
      })
    })
  })
})
