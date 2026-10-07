/**
 * @file Browser-session storage for the authenticated API token.
 * Keep token persistence in one place so API requests and React auth state use
 * the same expiry rules. This project intentionally uses sessionStorage, so a
 * token is cleared when the browser tab/session ends.
 */
const AUTH_STORAGE_KEY = 'cloud-erp.auth'

export function readAuthSession() {
  try {
    const rawSession = sessionStorage.getItem(AUTH_STORAGE_KEY)
    if (!rawSession) return null

    const session = JSON.parse(rawSession)
    if (!session.accessToken || session.expiresAt <= Date.now()) {
      clearAuthSession()
      return null
    }

    return session
  } catch {
    clearAuthSession()
    return null
  }
}

export function saveAuthSession(response) {
  const session = {
    accessToken: response.accessToken,
    tokenType: response.tokenType || 'Bearer',
    expiresAt: Date.now() + Number(response.expiresIn || 0) * 1000,
    username: response.username || '',
    role: response.role || '',
  }

  sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
  return session
}

export function clearAuthSession() {
  sessionStorage.removeItem(AUTH_STORAGE_KEY)
}
