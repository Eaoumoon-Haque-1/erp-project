import { Navigate } from 'react-router-dom'
import ChartOfAccountsCreate from './chart-of-accounts/pages/ChartOfAccountsCreate'
import ChartOfAccountsEdit from './chart-of-accounts/pages/ChartOfAccountsEdit'
import ChartOfAccountsList from './chart-of-accounts/pages/ChartOfAccountsList'
import ChartOfAccountView from './chart-of-accounts/pages/ChartOfAccountView'
import AfmChartOfAccountsCreate from './afm-chart-of-accounts/pages/AfmChartOfAccountsCreate'
import AfmChartOfAccountsEdit from './afm-chart-of-accounts/pages/AfmChartOfAccountsEdit'
import AfmChartOfAccountsList from './afm-chart-of-accounts/pages/AfmChartOfAccountsList'
import AfmChartOfAccountsView from './afm-chart-of-accounts/pages/AfmChartOfAccountsView'
import BankCreate from './bank/pages/BankCreate'
import BankEdit from './bank/pages/BankEdit'
import BankList from './bank/pages/BankList'
import BankView from './bank/pages/BankView'

export const accountsRoutes = [
  // Fallbacks & shortcuts
  { path: 'accounts', element: <Navigate to="/accounts/voucher-setup/bank" replace /> },
  { path: 'accounts/voucher-setup', element: <Navigate to="/accounts/voucher-setup/bank" replace /> },

  // Legacy / Backup Chart of Accounts
  { path: 'accounts/chart-of-accounts', element: <ChartOfAccountsList /> },
  { path: 'accounts/chart-of-accounts/create', element: <ChartOfAccountsCreate /> },
  { path: 'accounts/chart-of-accounts/:accountId/edit', element: <ChartOfAccountsEdit /> },
  { path: 'accounts/chart-of-accounts/:accountId/view', element: <ChartOfAccountView /> },

  // Voucher Setup -> Chart of accounts (AFM Chart of Accounts)
  { path: 'accounts/voucher-setup/chart-of-accounts', element: <AfmChartOfAccountsList /> },
  { path: 'accounts/voucher-setup/chart-of-accounts/create', element: <AfmChartOfAccountsCreate /> },
  { path: 'accounts/voucher-setup/chart-of-accounts/:accountId/edit', element: <AfmChartOfAccountsEdit /> },
  { path: 'accounts/voucher-setup/chart-of-accounts/:accountId/view', element: <AfmChartOfAccountsView /> },

  // Voucher Setup -> Bank Information
  { path: 'accounts/voucher-setup/bank', element: <BankList /> },
  { path: 'accounts/voucher-setup/bank/create', element: <BankCreate /> },
  { path: 'accounts/voucher-setup/bank/:bankId/edit', element: <BankEdit /> },
  { path: 'accounts/voucher-setup/bank/:bankId/view', element: <BankView /> },

  // Direct alias routes for AFM Chart of Accounts
  { path: 'accounts/afm-chart-of-accounts', element: <AfmChartOfAccountsList /> },
  { path: 'accounts/afm-chart-of-accounts/create', element: <AfmChartOfAccountsCreate /> },
  { path: 'accounts/afm-chart-of-accounts/:accountId/edit', element: <AfmChartOfAccountsEdit /> },
  { path: 'accounts/afm-chart-of-accounts/:accountId/view', element: <AfmChartOfAccountsView /> },

  // Direct alias routes for Bank Information
  { path: 'accounts/bank', element: <BankList /> },
  { path: 'accounts/bank/create', element: <BankCreate /> },
  { path: 'accounts/bank/:bankId/edit', element: <BankEdit /> },
  { path: 'accounts/bank/:bankId/view', element: <BankView /> },
  { path: 'accounts/bank-information', element: <BankList /> },
  { path: 'accounts/bank-information/create', element: <BankCreate /> },
]

