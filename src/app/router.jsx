/**
 * @file Root React Router composition for the application.
 * Sections: module route imports, RootLayout children, home page, and final catch-all route.
 * Spread new module route arrays before the catch-all route.
 */
import { createBrowserRouter } from 'react-router-dom'
import RequireAuth from '../components/auth/RequireAuth'
import RootLayout from '../layouts/RootLayout'
import { accountsRoutes } from '../modules/accounts/routes'
import { assetRoutes } from '../modules/asset/routes'
import { hrisRoutes } from '../modules/hris/routes'
import { procureToPayRoutes } from '../modules/procure-to-pay/routes'
import { salesRoutes } from '../modules/sales/routes'
import { superAdminRoutes } from '../modules/super-admin/routes'
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/LoginPage'
import NotFoundPage from '../pages/NotFoundPage'

/**
 * Root route registry.
 *
 * Each business module owns its route array. To add a new module, export its
 * routes and spread them here before the catch-all `*` route. Feature links
 * are maintained inside the module's menu/pages, not in this file.
 */
export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <RootLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <HomePage /> },
      ...superAdminRoutes,
      ...hrisRoutes,
      ...assetRoutes,
      ...procureToPayRoutes,
      ...accountsRoutes,
      ...salesRoutes,
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
