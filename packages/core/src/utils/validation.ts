export const USERNAME_MAX_LENGTH = 20
export const USERNAME_PATTERN = /^[A-Za-z0-9_@]+$/

// Returns a user-facing error message, or null if the username is valid.
export function getUsernameError(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return 'Username is required.'
  if (trimmed.length > USERNAME_MAX_LENGTH) return `Username must be ${USERNAME_MAX_LENGTH} characters or fewer.`
  if (!USERNAME_PATTERN.test(trimmed)) return 'Username can only contain letters, numbers, underscores, and @.'
  return null
}
