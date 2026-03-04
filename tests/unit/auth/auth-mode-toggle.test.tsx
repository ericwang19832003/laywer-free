import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AuthModeToggle } from '@/components/auth/auth-mode-toggle'

describe('AuthModeToggle', () => {
  it('renders Sign In and Create Account buttons', () => {
    render(<AuthModeToggle mode="login" onModeChange={() => {}} />)
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Create Account' })).toBeDefined()
  })

  it('calls onModeChange when toggled', () => {
    let changed = ''
    render(<AuthModeToggle mode="login" onModeChange={(m) => { changed = m }} />)
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }))
    expect(changed).toBe('signup')
  })

  it('highlights active mode', () => {
    render(<AuthModeToggle mode="signup" onModeChange={() => {}} />)
    const signupBtn = screen.getByRole('button', { name: 'Create Account' })
    expect(signupBtn.className).toContain('bg-primary')
  })
})
