import crypto from 'crypto'

/**
 * Generates a random CSRF token
 * @returns {string} A random hexadecimal token
 */
export function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Validates a CSRF token using constant-time comparison
 * @param {string} providedToken - Token from the request
 * @param {string} sessionToken - Token stored in the session
 * @returns {boolean} True if tokens match, false otherwise
 */
export function validateCsrfToken(providedToken, sessionToken) {
  if (!providedToken || !sessionToken) {
    return false
  }

  // Use constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(providedToken),
    Buffer.from(sessionToken)
  )
}

