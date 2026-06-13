// Server-side only — security utilities for input sanitization and validation

const INJECTION_PATTERNS = [
  /ignore\s+(previous|prior|all|above)\s+instructions/gi,
  /disregard\s+(your|all|the)\s+(previous|prior|above|system|instructions)/gi,
  /forget\s+(everything|all|your)\s*(instructions|rules|above)?/gi,
  /you\s+are\s+now\s+(a|an|the)/gi,
  /act\s+as\s+(a|an|the|if)/gi,
  /new\s+(role|persona|instructions|prompt):/gi,
  /system\s*:/gi,
  /\[system\]/gi,
  /<system>/gi,
  /reveal\s+(your|the|all)\s*(prompt|instructions|key|secret|api)/gi,
  /show\s+(me\s+)?(your|the)\s*(prompt|instructions|key|secret|system)/gi,
  /print\s+(your|the)\s*(prompt|instructions|system)/gi,
  /repeat\s+(your|the|all)\s*(instructions|prompt|system)/gi,
  /output\s+(your|the|all)\s*(instructions|prompt|system)/gi,
  /override\s+(the|your|all)?\s*(instructions|prompt|rules)/gi,
  /jailbreak/gi,
  /DAN\s+(mode|prompt)/gi,
]

/**
 * Sanitizes a user-supplied string before it is embedded in an AI prompt.
 * - Truncates to maxLen characters
 * - Strips null bytes and control characters
 * - Removes known prompt injection phrases
 * - Collapses excessive whitespace
 */
export function sanitizeInput(input: unknown, maxLen: number): string {
  if (typeof input !== 'string') return ''
  let s = input
    .slice(0, maxLen * 2)              // pre-truncate before regex work
    .replace(/\0/g, '')                 // null bytes
    .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // control chars (keep \t \n \r)
    .replace(/\r\n?/g, '\n')            // normalize line endings

  for (const pattern of INJECTION_PATTERNS) {
    s = s.replace(pattern, '[removed]')
  }

  // Collapse runs of 3+ newlines to 2
  s = s.replace(/\n{3,}/g, '\n\n')
  // Trim and hard-truncate to maxLen
  return s.trim().slice(0, maxLen)
}

/**
 * Validates that a string is a well-formed UUID v4.
 */
export function isValidUUID(s: unknown): s is string {
  return typeof s === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s)
}

/**
 * Validates a redirect target is a safe relative path (no open-redirect).
 * Rejects absolute URLs, protocol-relative URLs, and unusual patterns.
 */
export function isSafeRedirectPath(path: unknown): path is string {
  if (typeof path !== 'string') return false
  return (
    path.startsWith('/') &&
    !path.startsWith('//') &&      // protocol-relative
    !path.includes('://') &&       // absolute URL
    !path.includes('\n') &&        // header injection
    !path.includes('\r') &&
    path.length <= 200
  )
}
