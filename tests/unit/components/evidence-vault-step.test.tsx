import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EvidenceVaultStep } from '@/components/step/evidence-vault-step'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

describe('EvidenceVaultStep', () => {
  it('offers a quick start checklist with controls', () => {
    render(<EvidenceVaultStep caseId="case-123" taskId="task-123" />)

    expect(screen.getByText(/Quick start checklist/i)).toBeInTheDocument()

    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes.length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole('button', { name: /Mark all done/i }))
    checkboxes.forEach((checkbox) => expect(checkbox).toBeChecked())

    fireEvent.click(screen.getByRole('button', { name: /Reset checklist/i }))
    checkboxes.forEach((checkbox) => expect(checkbox).not.toBeChecked())
  })

  it('shows file naming templates for evidence', () => {
    render(<EvidenceVaultStep caseId="case-123" taskId="task-123" />)

    expect(screen.getByText(/File naming templates/i)).toBeInTheDocument()
    expect(screen.getAllByText(/YYYY-MM-DD/i).length).toBeGreaterThan(0)
  })
})
