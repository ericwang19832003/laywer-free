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
      render(<OnboardingFlow onComplete={mockOnComplete} />)
      const button = screen.getByRole('button', { name: /get started/i })
      fireEvent.click(button)
      expect(screen.getByText("What's your situation?")).toBeInTheDocument()
    })
  })

  describe('Screen 2 — Situation selection', () => {
    function renderAtScreen2() {
      render(<OnboardingFlow onComplete={mockOnComplete} />)
      fireEvent.click(screen.getByRole('button', { name: /get started/i }))
    }

    it('shows all situation cards', () => {
      renderAtScreen2()
      expect(screen.getByText('Being sued')).toBeInTheDocument()
      expect(screen.getByText('Facing eviction')).toBeInTheDocument()
      expect(screen.getByText('Debt collection')).toBeInTheDocument()
      expect(screen.getByText('Family matter')).toBeInTheDocument()
      expect(screen.getByText('Personal injury')).toBeInTheDocument()
      expect(screen.getByText('Something else')).toBeInTheDocument()
    })

    it('shows back button that returns to screen 1', () => {
      renderAtScreen2()
      fireEvent.click(screen.getByText(/back/i))
      expect(screen.getByText('Welcome to Lawyer Free')).toBeInTheDocument()
    })

    it('selecting a situation advances to screen 3 and calls onComplete with dispute type', async () => {
      renderAtScreen2()
      fireEvent.click(screen.getByText('Being sued'))

      // Screen 3 shows loading state
      expect(screen.getByText('Setting up your case')).toBeInTheDocument()

      // Eventually calls onComplete with the dispute type
      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledWith('small_claims')
      })
    })

    it('selecting "Something else" calls onComplete with undefined', async () => {
      renderAtScreen2()
      fireEvent.click(screen.getByText('Something else'))

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledWith(undefined)
      })
    })
  })

  describe('Screen 3 — Transition', () => {
    it('calls the user-preferences API', async () => {
      render(<OnboardingFlow onComplete={mockOnComplete} />)
      fireEvent.click(screen.getByRole('button', { name: /get started/i }))
      fireEvent.click(screen.getByText('Facing eviction'))

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/user-preferences', { method: 'POST' })
      })
    })

    it('calls onComplete even if API call fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      render(<OnboardingFlow onComplete={mockOnComplete} />)
      fireEvent.click(screen.getByRole('button', { name: /get started/i }))
      fireEvent.click(screen.getByText('Debt collection'))

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledWith('debt_collection')
      })
    })
  })
})
