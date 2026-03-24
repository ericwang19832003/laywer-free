import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
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
  it('renders the Evidence Vault title and reassurance text', () => {
    render(<EvidenceVaultStep caseId="case-123" taskId="task-123" />)

    expect(screen.getByText(/Evidence Vault/i)).toBeInTheDocument()
    expect(screen.getByText(/organized evidence/i)).toBeInTheDocument()
  })

  it('shows the first question about contracts', () => {
    render(<EvidenceVaultStep caseId="case-123" taskId="task-123" />)

    // GuidedStep shows one question at a time; first is about contracts
    expect(screen.getByText(/contracts or written agreements/i)).toBeInTheDocument()
    // Yes/No buttons should be rendered
    expect(screen.getByRole('button', { name: /Yes/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /No/i })).toBeInTheDocument()
  })
})
