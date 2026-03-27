'use client'

export type AuthMode = 'login' | 'signup'

interface AuthModeToggleProps {
  mode: AuthMode
  onModeChange: (mode: AuthMode) => void
}

export function AuthModeToggle({ mode, onModeChange }: AuthModeToggleProps) {
  return (
    <div className="flex gap-1 mb-6 p-1 bg-warm-bg rounded-lg">
      <button
        type="button"
        onClick={() => onModeChange('login')}
        className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-colors ${
          mode === 'login'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-warm-muted hover:text-warm-text'
        }`}
      >
        Sign In
      </button>
      <button
        type="button"
        onClick={() => onModeChange('signup')}
        className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-colors ${
          mode === 'signup'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-warm-muted hover:text-warm-text'
        }`}
      >
        Create Account
      </button>
    </div>
  )
}
