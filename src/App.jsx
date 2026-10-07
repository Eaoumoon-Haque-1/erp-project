/**
 * @file Top-level application component.
 * Sections: router import and RouterProvider composition.
 * Keep page/layout logic in routes and layouts rather than adding it here.
 */
import { RouterProvider } from 'react-router-dom'
import { router } from './app/router'
import AuthProvider from './auth/AuthProvider'

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App
