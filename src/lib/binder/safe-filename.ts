/**
 * Sanitize a string for use in a ZIP file path.
 *
 * - Strips slashes (path traversal)
 * - Strips control characters (0x00–0x1F, 0x7F)
 * - Replaces spaces and unsafe chars with underscores
 * - Collapses consecutive underscores
 * - Trims leading/trailing underscores and dots
 * - Limits total length (default 80)
 * - Returns 'unnamed' if result would be empty
 */
export function safeFileName(name: string, maxLen = 80): string {
  let result = name
    // Replace control chars, slashes, and backslashes with underscore
    .replace(/[\x00-\x1F\x7F/\\]/g, '_')
    // Replace remaining unsafe chars with underscore
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    // Collapse consecutive underscores
    .replace(/_+/g, '_')
    // Trim leading/trailing underscores and dots
    .replace(/^[_.]+|[_.]+$/g, '')

  // Limit length (preserve extension if present)
  if (result.length > maxLen) {
    const dotIdx = result.lastIndexOf('.')
    if (dotIdx > 0 && result.length - dotIdx <= 10) {
      // Has a short extension — preserve it
      const ext = result.slice(dotIdx)
      result = result.slice(0, maxLen - ext.length) + ext
    } else {
      result = result.slice(0, maxLen)
    }
    // Clean up trailing underscores after truncation
    result = result.replace(/_+$/, '')
  }

  return result || 'unnamed'
}

/**
 * Pad exhibit number for deterministic sort order.
 * Numeric: "1" → "001". Alpha: "A" stays "A".
 */
export function padExhibitNo(no: string): string {
  const n = Number(no)
  if (!Number.isNaN(n)) return String(n).padStart(3, '0')
  return no
}

/**
 * Build a deterministic exhibit filename for the ZIP.
 *
 * Format: Exhibit_001_Lease_Agreement.pdf
 */
export function exhibitFileName(
  exhibitNo: string,
  title: string | null,
  originalFileName: string
): string {
  const ext = originalFileName.includes('.')
    ? originalFileName.slice(originalFileName.lastIndexOf('.'))
    : ''

  const stem = safeFileName(
    title || originalFileName.replace(/\.[^.]+$/, ''),
    50
  )

  return `Exhibit_${padExhibitNo(exhibitNo)}_${stem}${ext}`
}
