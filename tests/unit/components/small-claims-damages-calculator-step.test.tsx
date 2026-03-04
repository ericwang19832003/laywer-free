import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DamagesCalculatorStep } from '@/components/step/small-claims-wizard-steps/damages-calculator-step'

const baseItems = [{ category: '', amount: 0, description: '' }]

describe('DamagesCalculatorStep', () => {
  it('adds a suggested category as a new item', () => {
    const onItemsChange = vi.fn()

    render(
      <DamagesCalculatorStep
        items={baseItems}
        onItemsChange={onItemsChange}
        claimSubType="security_deposit"
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /Security deposit/i }))

    expect(onItemsChange).toHaveBeenCalled()
    const nextItems = onItemsChange.mock.calls[0]?.[0]
    expect(nextItems).toHaveLength(1)
    expect(nextItems[0].category).toBe('Security deposit')
  })

  it('adds a quick amount to the first item', () => {
    const onItemsChange = vi.fn()

    render(
      <DamagesCalculatorStep
        items={baseItems}
        onItemsChange={onItemsChange}
        claimSubType="security_deposit"
      />
    )

    fireEvent.click(screen.getByText('$500'))

    const nextItems = onItemsChange.mock.calls[0]?.[0]
    expect(nextItems[0].amount).toBe(500)
  })
})
