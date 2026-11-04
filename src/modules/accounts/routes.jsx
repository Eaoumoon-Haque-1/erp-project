import { Navigate } from 'react-router-dom'
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
import BankChequeMapCreate from './bank-cheque-mapping/pages/BankChequeMapCreate'
import BankChequeMapEdit from './bank-cheque-mapping/pages/BankChequeMapEdit'
import BankChequeMapList from './bank-cheque-mapping/pages/BankChequeMapList'
import BankChequeMapView from './bank-cheque-mapping/pages/BankChequeMapView'
import CalendarCreate from './calendar/pages/CalendarCreate'
import CalendarEdit from './calendar/pages/CalendarEdit'
import CalendarList from './calendar/pages/CalendarList'
import CalendarView from './calendar/pages/CalendarView'
import OpenPeriodCreate from './period/pages/OpenPeriodCreate'
import ClosePeriodCreate from './period/pages/ClosePeriodCreate'
import PeriodEdit from './period/pages/PeriodEdit'
import PeriodList from './period/pages/PeriodList'
import PeriodView from './period/pages/PeriodView'
import VoucherList from './voucher/pages/VoucherList'
import VoucherCreate from './voucher/pages/VoucherCreate'
import VoucherEdit from './voucher/pages/VoucherEdit'
import VoucherView from './voucher/pages/VoucherView'
import UserLocationCreate from './user-location/pages/UserLocationCreate'
import UserLocationEdit from './user-location/pages/UserLocationEdit'
import UserLocationList from './user-location/pages/UserLocationList'
import UserLocationView from './user-location/pages/UserLocationView'
import UserSetupCreate from './user-setup/pages/UserSetupCreate'
import UserSetupEdit from './user-setup/pages/UserSetupEdit'
import UserSetupList from './user-setup/pages/UserSetupList'
import UserSetupView from './user-setup/pages/UserSetupView'

export const accountsRoutes = [
  // Fallbacks & shortcuts
  { path: 'accounts', element: <Navigate to="/accounts/voucher-setup/bank" replace /> },
  { path: 'accounts/voucher-setup', element: <Navigate to="/accounts/voucher-setup/bank" replace /> },

  // AFM Chart of Accounts shortcut
  { path: 'accounts/chart-of-accounts', element: <Navigate to="/accounts/voucher-setup/chart-of-accounts" replace /> },

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

  // Voucher Setup -> Bank Cheque Mapping
  { path: 'accounts/voucher-setup/bank-cheque-mapping', element: <BankChequeMapList /> },
  { path: 'accounts/voucher-setup/bank-cheque-mapping/create', element: <BankChequeMapCreate /> },
  { path: 'accounts/voucher-setup/bank-cheque-mapping/:mappingId/edit', element: <BankChequeMapEdit /> },
  { path: 'accounts/voucher-setup/bank-cheque-mapping/:mappingId/view', element: <BankChequeMapView /> },

  // Voucher Setup -> Accounting Calendar
  { path: 'accounts/voucher-setup/calendar', element: <CalendarList /> },
  { path: 'accounts/voucher-setup/calendar/create', element: <CalendarCreate /> },
  { path: 'accounts/voucher-setup/calendar/:calendarId/edit', element: <CalendarEdit /> },
  { path: 'accounts/voucher-setup/calendar/:calendarId/view', element: <CalendarView /> },

  // Voucher Setup -> Accounting Period Open / Close
  { path: 'accounts/voucher-setup/period', element: <PeriodList /> },
  { path: 'accounts/voucher-setup/period/create', element: <OpenPeriodCreate /> },
  { path: 'accounts/voucher-setup/period/open', element: <OpenPeriodCreate /> },
  { path: 'accounts/voucher-setup/period/open/create', element: <OpenPeriodCreate /> },
  { path: 'accounts/voucher-setup/period/close', element: <ClosePeriodCreate /> },
  { path: 'accounts/voucher-setup/period/close/create', element: <ClosePeriodCreate /> },
  { path: 'accounts/voucher-setup/period/:periodId/edit', element: <PeriodEdit /> },
  { path: 'accounts/voucher-setup/period/:periodId/view', element: <PeriodView /> },

  // Voucher Setup -> User Location (AFM_USER_LOCATION)
  { path: 'accounts/voucher-setup/user-location', element: <UserLocationList /> },
  { path: 'accounts/voucher-setup/user-location/create', element: <UserLocationCreate /> },
  { path: 'accounts/voucher-setup/user-location/:locationId/edit', element: <UserLocationEdit /> },
  { path: 'accounts/voucher-setup/user-location/:locationId/view', element: <UserLocationView /> },

  // Voucher Setup -> User Setup (AFM_USER_SETUP)
  { path: 'accounts/voucher-setup/user-setup', element: <UserSetupList /> },
  { path: 'accounts/voucher-setup/user-setup/create', element: <UserSetupCreate /> },
  { path: 'accounts/voucher-setup/user-setup/:setupId/edit', element: <UserSetupEdit /> },
  { path: 'accounts/voucher-setup/user-setup/:setupId/view', element: <UserSetupView /> },

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

  // Direct alias routes for Bank Cheque Mapping
  { path: 'accounts/bank-cheque-mapping', element: <BankChequeMapList /> },
  { path: 'accounts/bank-cheque-mapping/create', element: <BankChequeMapCreate /> },
  { path: 'accounts/bank-cheque-mapping/:mappingId/edit', element: <BankChequeMapEdit /> },
  { path: 'accounts/bank-cheque-mapping/:mappingId/view', element: <BankChequeMapView /> },

  // Direct alias routes for Accounting Calendar
  { path: 'accounts/calendar', element: <CalendarList /> },
  { path: 'accounts/calendar/create', element: <CalendarCreate /> },
  { path: 'accounts/calendar/:calendarId/edit', element: <CalendarEdit /> },
  { path: 'accounts/calendar/:calendarId/view', element: <CalendarView /> },
  { path: 'accounts/accounting-calendar', element: <CalendarList /> },
  { path: 'accounts/accounting-calendar/create', element: <CalendarCreate /> },

  // Direct alias routes for Accounting Period Open / Close
  { path: 'accounts/period', element: <PeriodList /> },
  { path: 'accounts/period/create', element: <OpenPeriodCreate /> },
  { path: 'accounts/period/open', element: <OpenPeriodCreate /> },
  { path: 'accounts/period/open/create', element: <OpenPeriodCreate /> },
  { path: 'accounts/period/close', element: <ClosePeriodCreate /> },
  { path: 'accounts/period/close/create', element: <ClosePeriodCreate /> },
  { path: 'accounts/period/:periodId/edit', element: <PeriodEdit /> },
  { path: 'accounts/period/:periodId/view', element: <PeriodView /> },
  { path: 'accounts/period-open', element: <PeriodList /> },
  { path: 'accounts/period-open/create', element: <OpenPeriodCreate /> },
  { path: 'accounts/accounting-period-open', element: <PeriodList /> },
  { path: 'accounts/accounting-period-open/create', element: <OpenPeriodCreate /> },

  // Direct alias routes for User Location
  { path: 'accounts/user-location', element: <UserLocationList /> },
  { path: 'accounts/user-location/create', element: <UserLocationCreate /> },
  { path: 'accounts/user-location/:locationId/edit', element: <UserLocationEdit /> },
  { path: 'accounts/user-location/:locationId/view', element: <UserLocationView /> },

  // Direct alias routes for User Setup
  { path: 'accounts/user-setup', element: <UserSetupList /> },
  { path: 'accounts/user-setup/create', element: <UserSetupCreate /> },
  { path: 'accounts/user-setup/:setupId/edit', element: <UserSetupEdit /> },
  { path: 'accounts/user-setup/:setupId/view', element: <UserSetupView /> },

  // Account Voucher (AFM_VOUCHER, AFM_VOUCHER_DETAIL, AFM_VOUCHER_ATTACH)
  { path: 'accounts/voucher', element: <VoucherList /> },
  { path: 'accounts/voucher/create', element: <VoucherCreate /> },
  { path: 'accounts/voucher/:voucherId/edit', element: <VoucherEdit /> },
  { path: 'accounts/voucher/:voucherId/view', element: <VoucherView /> },
  { path: 'accounts/vouchers', element: <VoucherList /> },
  { path: 'accounts/vouchers/create', element: <VoucherCreate /> },
  { path: 'accounts/vouchers/:voucherId/edit', element: <VoucherEdit /> },
  { path: 'accounts/vouchers/:voucherId/view', element: <VoucherView /> },
  { path: 'accounts/voucher-setup/voucher', element: <VoucherList /> },
  { path: 'accounts/voucher-setup/voucher/create', element: <VoucherCreate /> },
  { path: 'accounts/voucher-setup/voucher/:voucherId/edit', element: <VoucherEdit /> },
  { path: 'accounts/voucher-setup/voucher/:voucherId/view', element: <VoucherView /> },
]
