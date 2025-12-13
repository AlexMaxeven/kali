import DOMPurify from 'dompurify'

/**
 * Sanitizes HTML content using DOMPurify
 * @param {string} dirty - The potentially unsafe HTML string
 * @returns {string} - Sanitized HTML string
 */
export function sanitizeHtml(dirty) {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
  })
}

/**
 * Sanitizes HTML content with more permissive settings (for demonstration)
 * @param {string} dirty - The potentially unsafe HTML string
 * @returns {string} - Sanitized HTML string
 */
export function sanitizeHtmlPermissive(dirty) {
  return DOMPurify.sanitize(dirty)
}

