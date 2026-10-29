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
import AfmLookupCreate from './afm-lookup/pages/AfmLookupCreate'
import AfmLookupEdit from './afm-lookup/pages/AfmLookupEdit'
import AfmLookupList from './afm-lookup/pages/AfmLookupList'
import AfmLookupView from './afm-lookup/pages/AfmLookupView'
import PaymentTypeMappingCreate from './payment-type-mapping/pages/PaymentTypeMappingCreate'
import PaymentTypeMappingEdit from './payment-type-mapping/pages/PaymentTypeMappingEdit'
import PaymentTypeMappingList from './payment-type-mapping/pages/PaymentTypeMappingList'
import PaymentTypeMappingView from './payment-type-mapping/pages/PaymentTypeMappingView'
import VoucherTypeMappingCreate from './voucher-type-mapping/pages/VoucherTypeMappingCreate'
import VoucherTypeMappingEdit from './voucher-type-mapping/pages/VoucherTypeMappingEdit'
import VoucherTypeMappingList from './voucher-type-mapping/pages/VoucherTypeMappingList'
import VoucherTypeMappingView from './voucher-type-mapping/pages/VoucherTypeMappingView'

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

  // Voucher Setup -> Lookup Type (AFM Lookup Type & Lookup Values)
  { path: 'accounts/voucher-setup/lookup', element: <AfmLookupList /> },
  { path: 'accounts/voucher-setup/lookup/create', element: <AfmLookupCreate /> },
  { path: 'accounts/voucher-setup/lookup/:lookupId/edit', element: <AfmLookupEdit /> },
  { path: 'accounts/voucher-setup/lookup/:lookupId/view', element: <AfmLookupView /> },
  { path: 'accounts/voucher-setup/lookup-type', element: <AfmLookupList /> },
  { path: 'accounts/voucher-setup/lookup-type/create', element: <AfmLookupCreate /> },
  { path: 'accounts/voucher-setup/lookup-type/:lookupId/edit', element: <AfmLookupEdit /> },
  { path: 'accounts/voucher-setup/lookup-type/:lookupId/view', element: <AfmLookupView /> },

  // Voucher Setup -> Payment Type and Payment Through Mapping
  { path: 'accounts/voucher-setup/payment-type-mapping', element: <PaymentTypeMappingList /> },
  { path: 'accounts/voucher-setup/payment-type-mapping/create', element: <PaymentTypeMappingCreate /> },
  { path: 'accounts/voucher-setup/payment-type-mapping/:mappingId/edit', element: <PaymentTypeMappingEdit /> },
  { path: 'accounts/voucher-setup/payment-type-mapping/:mappingId/view', element: <PaymentTypeMappingView /> },

  // Voucher Setup -> Voucher and Payment Type Mapping
  { path: 'accounts/voucher-setup/voucher-type-mapping', element: <VoucherTypeMappingList /> },
  { path: 'accounts/voucher-setup/voucher-type-mapping/create', element: <VoucherTypeMappingCreate /> },
  { path: 'accounts/voucher-setup/voucher-type-mapping/:mappingId/edit', element: <VoucherTypeMappingEdit /> },
  { path: 'accounts/voucher-setup/voucher-type-mapping/:mappingId/view', element: <VoucherTypeMappingView /> },

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

  // Direct alias routes for Lookup Type
  { path: 'accounts/lookup', element: <AfmLookupList /> },
  { path: 'accounts/lookup/create', element: <AfmLookupCreate /> },
  { path: 'accounts/lookup/:lookupId/edit', element: <AfmLookupEdit /> },
  { path: 'accounts/lookup/:lookupId/view', element: <AfmLookupView /> },
  { path: 'accounts/afm-lookup', element: <AfmLookupList /> },
  { path: 'accounts/afm-lookup/create', element: <AfmLookupCreate /> },
  { path: 'accounts/afm-lookup/:lookupId/edit', element: <AfmLookupEdit /> },
  { path: 'accounts/afm-lookup/:lookupId/view', element: <AfmLookupView /> },
  { path: 'accounts/afm-lookup-type', element: <AfmLookupList /> },
  { path: 'accounts/afm-lookup-type/create', element: <AfmLookupCreate /> },
  { path: 'accounts/afm-lookup-type/:lookupId/edit', element: <AfmLookupEdit /> },
  { path: 'accounts/afm-lookup-type/:lookupId/view', element: <AfmLookupView /> },

  // Direct alias routes for Payment Type Mapping
  { path: 'accounts/payment-type-mapping', element: <PaymentTypeMappingList /> },
  { path: 'accounts/payment-type-mapping/create', element: <PaymentTypeMappingCreate /> },
  { path: 'accounts/payment-type-mapping/:mappingId/edit', element: <PaymentTypeMappingEdit /> },
  { path: 'accounts/payment-type-mapping/:mappingId/view', element: <PaymentTypeMappingView /> },
  { path: 'accounts/payment-type-through-mapping', element: <PaymentTypeMappingList /> },
  { path: 'accounts/payment-type-through-mapping/create', element: <PaymentTypeMappingCreate /> },
  { path: 'accounts/payment-type-through-mapping/:mappingId/edit', element: <PaymentTypeMappingEdit /> },
  { path: 'accounts/payment-type-through-mapping/:mappingId/view', element: <PaymentTypeMappingView /> },

  // Direct alias routes for Voucher Type Mapping
  { path: 'accounts/voucher-type-mapping', element: <VoucherTypeMappingList /> },
  { path: 'accounts/voucher-type-mapping/create', element: <VoucherTypeMappingCreate /> },
  { path: 'accounts/voucher-type-mapping/:mappingId/edit', element: <VoucherTypeMappingEdit /> },
  { path: 'accounts/voucher-type-mapping/:mappingId/view', element: <VoucherTypeMappingView /> },
]


