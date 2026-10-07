/**
 * @file Shared React context object for authenticated session state.
 * The provider and consumer hook are split into separate files to keep React
 * Fast Refresh and ESLint rules satisfied.
 */
import { createContext } from 'react'

const AuthContext = createContext(null)

export default AuthContext
