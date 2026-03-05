import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ResearchSidebar } from '@/components/research/research-sidebar'

vi.mock('next/navigation', () => ({
  usePathname: () => '/case/case-123/research/search',
}))

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

describe('ResearchSidebar', () => {
  it('renders navigation links for research sections', () => {
    render(
      <ResearchSidebar
        caseId="case-123"
        caseLabel="Smith v. Jones"
        authorityCount={3}
      />
    )

    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByText('Search')).toBeInTheDocument()
    expect(screen.getByText('Authorities')).toBeInTheDocument()
    expect(screen.getByText('Ask')).toBeInTheDocument()
    expect(screen.getByText('History')).toBeInTheDocument()

    expect(screen.getByRole('link', { name: 'Search' })).toHaveAttribute('href', '/case/case-123/research/search')
  })

  it('marks the active route', () => {
    render(
      <ResearchSidebar
        caseId="case-123"
        caseLabel="Smith v. Jones"
        authorityCount={3}
      />
    )

    const active = screen.getByTestId('research-nav-search')
    expect(active).toHaveAttribute('data-active', 'true')
  })
})
