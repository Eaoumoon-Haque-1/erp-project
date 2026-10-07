/** @file Accounts route registry. Keep these paths synchronized with menu.js. */
import ChartOfAccountsCreate from './chart-of-accounts/pages/ChartOfAccountsCreate'
import ChartOfAccountsEdit from './chart-of-accounts/pages/ChartOfAccountsEdit'
import ChartOfAccountsList from './chart-of-accounts/pages/ChartOfAccountsList'

export const accountsRoutes = [
  { path: 'accounts/chart-of-accounts', element: <ChartOfAccountsList /> },
  { path: 'accounts/chart-of-accounts/create', element: <ChartOfAccountsCreate /> },
  { path: 'accounts/chart-of-accounts/:accountId/edit', element: <ChartOfAccountsEdit /> },
]
