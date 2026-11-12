/**
 * @file Browser-session storage for authenticated API tokens.
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
    if (!session.accessToken) {
      clearAuthSession()
      return null
    }

    // Keep an expired access token only when it can be renewed.
    const hasValidRefreshToken = Boolean(
      session.refreshToken && session.refreshToken !== session.accessToken,
    )
    if (session.expiresAt && session.expiresAt <= Date.now() && !hasValidRefreshToken) {
      clearAuthSession()
      return null
    }

    return session
  } catch {
    clearAuthSession()
    return null
  }
}

export function saveAuthSession(response, previousSession = {}) {
  const expiresIn = Number(response.expiresIn)
  const accessToken = response.accessToken || previousSession.accessToken
  const session = {
    accessToken,
    refreshToken:
      response.refreshToken
      || (previousSession.refreshToken !== previousSession.accessToken ? previousSession.refreshToken : '')
      || '',
    tokenType: response.tokenType || previousSession.tokenType || 'Bearer',
    expiresAt: Number.isFinite(expiresIn) && expiresIn > 0
      ? Date.now() + expiresIn * 1000
      : previousSession.expiresAt || Date.now(),
    username: response.username || previousSession.username || '',
    role: response.role || previousSession.role || '',
    userId: response.userId ?? previousSession.userId ?? null,
    userEmpId: response.userEmpId ?? previousSession.userEmpId ?? null,
    bgId: response.bgId ?? previousSession.bgId ?? null,
    buId: response.buId ?? previousSession.buId ?? null,
    employeeName:
      response.employeeName
      || response.empName
      || previousSession.employeeName
      || '',
    businessUnitName:
      response.businessUnitName
      || response.businessUnit
      || response.buName
      || previousSession.businessUnitName
      || '',
  }

  if (!accessToken) {
    throw new Error('Authentication response did not include an access token.')
  }

  sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
  return session
}

export function clearAuthSession() {
  sessionStorage.removeItem(AUTH_STORAGE_KEY)
}
