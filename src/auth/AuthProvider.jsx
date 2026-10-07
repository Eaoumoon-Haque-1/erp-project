/**
 * @file Application authentication provider.
 * Owns login/logout actions and mirrors the persisted browser session into
 * React state. Session expiry events originate from the shared Axios client.
 */
import { useEffect, useMemo, useState } from 'react'
import { login as loginRequest, logout as logoutRequest } from '../api/authApi'
import {
  clearAuthSession,
  readAuthSession,
  saveAuthSession,
} from '../api/authStorage'
import AuthContext from './AuthContext'

function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readAuthSession())

  useEffect(() => {
    const handleSessionExpired = () => setSession(null)
    window.addEventListener('cloud-erp:session-expired', handleSessionExpired)

    return () =>
      window.removeEventListener(
        'cloud-erp:session-expired',
        handleSessionExpired,
      )
  }, [])

  const value = useMemo(
    () => ({
      session,
      isAuthenticated: Boolean(session?.accessToken),
      async login(credentials) {
        const response = await loginRequest(credentials)
        const nextSession = saveAuthSession(response)
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
