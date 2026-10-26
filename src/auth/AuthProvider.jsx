/**
 * @file Application authentication provider.
 * Owns login/logout actions and mirrors the persisted browser session into
 * React state. Session expiry events originate from the shared Axios client.
 */
import { useEffect, useMemo, useState } from 'react'
import {
  loadAuthIdentity,
  login as loginRequest,
  logout as logoutRequest,
} from '../api/authApi'
import {
  clearAuthSession,
  readAuthSession,
  saveAuthSession,
} from '../api/authStorage'
import AuthContext from './AuthContext'

async function enrichSessionIdentity(session) {
  if (!session?.accessToken) return session
  const needsEmployee = Boolean(!session.employeeName && (session.userEmpId || session.userId))
  const needsBusinessUnit = Boolean(!session.businessUnitName && (session.buId || session.userId))
  if (!needsEmployee && !needsBusinessUnit) return session

  const identity = await loadAuthIdentity(session)
  if (
    identity.userEmpId === session.userEmpId
    && identity.bgId === session.bgId
    && identity.buId === session.buId
    && identity.employeeName === session.employeeName
    && identity.businessUnitName === session.businessUnitName
  ) return session

  return saveAuthSession(identity, session)
}

function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readAuthSession())

  useEffect(() => {
    const handleSessionExpired = () => setSession(null)
    const handleSessionRefreshed = (event) => setSession(event.detail)
    window.addEventListener('cloud-erp:session-expired', handleSessionExpired)
    window.addEventListener('cloud-erp:session-refreshed', handleSessionRefreshed)

    return () => {
      window.removeEventListener(
        'cloud-erp:session-expired',
        handleSessionExpired,
      )
      window.removeEventListener(
        'cloud-erp:session-refreshed',
        handleSessionRefreshed,
      )
    }
  }, [])

  useEffect(() => {
    let active = true
    const needsIdentity = Boolean(
      session?.accessToken
      && (((session.userEmpId || session.userId) && !session.employeeName)
        || ((session.buId || session.userId) && !session.businessUnitName)),
    )

    if (needsIdentity) {
      enrichSessionIdentity(session).then((nextSession) => {
        if (active) setSession(nextSession)
      })
    }

    return () => {
      active = false
    }
  }, [session])

  const value = useMemo(
    () => ({
      session,
      isAuthenticated: Boolean(session?.accessToken),
      async login(credentials) {
        const response = await loginRequest(credentials)
        const savedSession = saveAuthSession(response)
        const nextSession = await enrichSessionIdentity(savedSession)
        setSession(nextSession)
        return nextSession
      },
      async logout() {
        try {
          if (session?.accessToken) await logoutRequest()
        } finally {
          clearAuthSession()
          setSession(null)
        }
      },
    }),
    [session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
