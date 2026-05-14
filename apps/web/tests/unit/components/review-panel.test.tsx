import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ReviewPanel } from '@/components/step/petition-wizard/review-panel'

const allPassResult = {
  legalCorrectness: { agentName: 'Legal Correctness', checks: [{ section: 'a', element: 'b', passed: true, reason: 'ok' }], passCount: 1, totalCount: 1 },
  jurisdictionCompliance: { agentName: 'Jurisdiction Compliance', checks: [{ section: 'a', element: 'b', passed: true, reason: 'ok' }], passCount: 1, totalCount: 1 },
  plainLanguage: { agentName: 'Plain Language', checks: [{ section: 'a', element: 'b', passed: true, reason: 'ok' }], passCount: 1, totalCount: 1 },
  allPassed: true,
}

describe('ReviewPanel', () => {
  it('shows all-green when everything passes', () => {
    render(<ReviewPanel result={allPassResult} onAutoFix={vi.fn()} />)
    expect(screen.getAllByText('1/1 passed')).toHaveLength(3)
    expect(screen.queryByRole('button', { name: /Auto-fix/i })).toBeNull()
  })

  it('shows amber for failed checks with auto-fix button', () => {
    const failResult = {
      ...allPassResult,
      jurisdictionCompliance: {
        agentName: 'Jurisdiction Compliance',
        checks: [{ section: 'cert', element: 'certificate_of_service', passed: false, reason: 'Missing' }],
        passCount: 0, totalCount: 1,
      },
      allPassed: false,
    }
    render(<ReviewPanel result={failResult} onAutoFix={vi.fn()} />)
    expect(screen.getByText('0/1 passed')).toBeDefined()
    expect(screen.getByRole('button', { name: /Auto-fix/i })).toBeDefined()
  })

  it('shows loading state', () => {
    render(<ReviewPanel result={null} loading onAutoFix={vi.fn()} />)
    expect(screen.getByText(/Reviewing/i)).toBeDefined()
  })
})
