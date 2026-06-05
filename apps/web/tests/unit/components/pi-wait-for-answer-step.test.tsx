import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { toast } from 'sonner'
import { PIWaitForAnswerStep } from '@/components/step/personal-injury/pi-wait-for-answer-step'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

const validAnswers = {
  petition_filed_date: '2026-06-02',
  court_case_number: 'CC-26-04821',
  service_completed_date: '2026-06-04',
  service_method: 'process_server',
  defendant_name_served: 'Penske Truck Leasing Co.',
}

function renderStep(existingAnswers = validAnswers) {
  render(
    <PIWaitForAnswerStep
      caseId="case-001"
      taskId="task-001"
      existingAnswers={existingAnswers}
    />
  )
}

describe('PIWaitForAnswerStep', () => {
  beforeEach(() => {
    mockPush.mockReset()
    vi.mocked(toast.error).mockReset()
    vi.mocked(toast.success).mockReset()
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows validation errors before making API calls', async () => {
    renderStep({
      petition_filed_date: '',
      court_case_number: '',
      service_completed_date: '',
      service_method: '',
      defendant_name_served: '',
    })

    fireEvent.click(screen.getByRole('button', { name: /confirm & start tracking/i }))

    expect(toast.error).toHaveBeenCalledWith('Please complete the required filing and service details.')
    expect(global.fetch).not.toHaveBeenCalled()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('marks the task complete, triggers rules, and returns to the case dashboard', async () => {
    vi.mocked(global.fetch)
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) } as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) } as Response)

    renderStep()
    fireEvent.click(screen.getByRole('button', { name: /confirm & start tracking/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/tasks/task-001',
        expect.objectContaining({
          method: 'PATCH',
          body: expect.stringContaining('"status":"completed"'),
        })
      )
    })
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/cases/case-001/rules/run',
      expect.objectContaining({ method: 'POST' })
    )
    expect(toast.success).toHaveBeenCalledWith('Filing and service details confirmed.')
    expect(mockPush).toHaveBeenCalledWith('/case/case-001')
  })

  it('shows an error and does not redirect when task save fails', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Task save failed.' }),
    } as Response)

    renderStep()
    fireEvent.click(screen.getByRole('button', { name: /confirm & start tracking/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Task save failed.')
    })
    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('shows a deadline tracking error when rules fail after task save', async () => {
    vi.mocked(global.fetch)
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) } as Response)
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Rules failed.' }),
      } as Response)

    renderStep()
    fireEvent.click(screen.getByRole('button', { name: /confirm & start tracking/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Rules failed.')
    })
    expect(global.fetch).toHaveBeenCalledTimes(2)
    expect(mockPush).not.toHaveBeenCalled()
  })
})
