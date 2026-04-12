import { describe, it, expect } from 'vitest'
import { buildAutoFixPrompt } from '@lawyer-free/shared/validators/triple-review/auto-fix'

describe('buildAutoFixPrompt', () => {
  it('includes only failed checks in the prompt', () => {
    const failedChecks = [
      { section: 'certificate_of_service', element: 'certificate paragraph', passed: false, reason: 'Missing entirely' },
    ]
    const { user } = buildAutoFixPrompt('ORIGINAL DRAFT', failedChecks, 'TX')
    expect(user).toContain('certificate')
    expect(user).toContain('ORIGINAL DRAFT')
    expect(user).toContain('TX')
  })

  it('system prompt instructs minimal targeted edits', () => {
    const { system } = buildAutoFixPrompt('draft', [], 'TX')
    expect(system).toContain('minimal')
    expect(system).not.toContain('rewrite')
  })

  it('lists each failed check with its reason', () => {
    const failedChecks = [
      { section: 'verification', element: 'signed under penalty', passed: false, reason: 'No verification paragraph found' },
      { section: 'affirmative_defenses', element: 'statute of limitations', passed: false, reason: 'SOL defense not mentioned' },
    ]
    const { user } = buildAutoFixPrompt('DRAFT TEXT', failedChecks, 'TX')
    expect(user).toContain('signed under penalty')
    expect(user).toContain('No verification paragraph found')
    expect(user).toContain('statute of limitations')
    expect(user).toContain('SOL defense not mentioned')
  })
})
