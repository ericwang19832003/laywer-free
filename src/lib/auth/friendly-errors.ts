const ERROR_MAP: Record<string, string> = {
  'Invalid login credentials': "That email/password combination didn't work. Double-check and try again.",
  'User already registered': 'An account with this email already exists. Try signing in instead.',
  'Password should be at least 6 characters': 'Password needs at least 6 characters.',
  'Email rate limit exceeded': 'Too many attempts. Please wait a moment and try again.',
  'For security purposes, you can only request this after 60 seconds': 'Please wait 60 seconds before requesting another reset link.',
}

export function friendlyError(message: string): string {
  return ERROR_MAP[message] ?? message
}
