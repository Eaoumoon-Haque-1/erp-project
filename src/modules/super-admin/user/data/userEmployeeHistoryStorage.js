/**
 * Browser-only persistence for the Employee assignment history UI.
 *
 * The current backend User contract stores only the active Employee ID and
 * does not expose Active From/Active To history. Keep this isolated so it can
 * be replaced with a backend history endpoint without changing the form UI.
 */
const STORAGE_PREFIX = 'cloud-erp:user-employee-history:'

export const USER_CREATE_HISTORY_KEY = 'draft'

function storageKey(key) {
  return `${STORAGE_PREFIX}${key}`
}

export function loadUserEmployeeHistory(key) {
  if (!key || typeof window === 'undefined') return []

  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey(key)) || '[]')
    if (!Array.isArray(parsed)) return []
    if (parsed.some((row) => String(row.IS_CURRENT) === '1')) return parsed
    return parsed.map((row, index) => ({
      ...row,
      IS_CURRENT: index === parsed.length - 1 ? '1' : '0',
    }))
  } catch {
    return []
  }
}

export function saveUserEmployeeHistory(key, rows = []) {
  if (!key || typeof window === 'undefined') return

  if (rows.length === 0) {
    window.localStorage.removeItem(storageKey(key))
    return
  }

  window.localStorage.setItem(storageKey(key), JSON.stringify(rows))
}

export function removeUserEmployeeHistory(key) {
  if (!key || typeof window === 'undefined') return
  window.localStorage.removeItem(storageKey(key))
}
