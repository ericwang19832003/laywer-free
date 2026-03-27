export type StrengthLevel = 'weak' | 'fair' | 'good' | 'strong'

export interface PasswordStrength {
  level: StrengthLevel
  label: string
  score: number // 0-3
}

export function getPasswordStrength(password: string): PasswordStrength {
  if (password.length === 0) {
    return { level: 'weak', label: 'Weak', score: 0 }
  }

  const hasLower = /[a-z]/.test(password)
  const hasUpper = /[A-Z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSymbol = /[^a-zA-Z0-9]/.test(password)

  if (password.length < 8) {
    return { level: 'weak', label: 'Weak', score: 1 }
  }

  // 8+ characters
  if (hasLower && hasUpper && hasNumber && hasSymbol) {
    return { level: 'strong', label: 'Strong', score: 3 }
  }

  if (hasLower && hasUpper) {
    return { level: 'good', label: 'Good', score: 2 }
  }

  return { level: 'fair', label: 'Fair', score: 1 }
}
