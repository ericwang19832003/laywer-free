import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PreGenChecklist } from '@/components/step/petition-wizard/pre-gen-checklist'

describe('PreGenChecklist', () => {
  const onGenerate = vi.fn()
  const onGoToStep = vi.fn()

  it('shows Generate button when no gaps', () => {
    render(<PreGenChecklist gaps={[]} onGenerate={onGenerate} onGoToStep={onGoToStep} />)
    expect(screen.getByRole('button', { name: /Generate Petition/i })).toBeDefined()
  })

  it('shows gap list with step navigation', () => {
    render(
      <PreGenChecklist
        gaps={[{ sectionId: 'facts', sectionLabel: 'Facts', wizardStep: 'facts', message: 'Need more detail' }]}
        onGenerate={onGenerate}
        onGoToStep={onGoToStep}
      />
    )
    expect(screen.getByText('Need more detail')).toBeDefined()
    expect(screen.getByRole('button', { name: /Go back/i })).toBeDefined()
  })

  it('calls onGoToStep when gap navigation clicked', () => {
    render(
      <PreGenChecklist
        gaps={[{ sectionId: 'facts', sectionLabel: 'Facts', wizardStep: 'facts', message: 'Need detail' }]}
        onGenerate={onGenerate}
        onGoToStep={onGoToStep}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /Go back/i }))
    expect(onGoToStep).toHaveBeenCalledWith('facts')
  })

  it('still allows generate with placeholders when gaps exist', () => {
    render(
      <PreGenChecklist
        gaps={[{ sectionId: 'relief', sectionLabel: 'Relief', wizardStep: 'relief', message: 'Missing amount' }]}
        onGenerate={onGenerate}
        onGoToStep={onGoToStep}
      />
    )
    expect(screen.getByRole('button', { name: /Generate anyway/i })).toBeDefined()
  })
})
