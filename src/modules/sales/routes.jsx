/**
 * @file Route registry for Sales.
 * Sections: page imports and relative path-to-component mappings grouped by sidebar section.
 * Keep paths synchronized with menu.js and all List/New/Edit navigation links.
 */
import SalesAgreementCreate from './sales-agreement/pages/SalesAgreementCreate'
import SalesAgreementList from './sales-agreement/pages/SalesAgreementList'
import SalesPaymentProcessList from './sales-payment-process/pages/SalesPaymentProcessList'

// The code stays in the sales module, but its visible parent menu is Admin;
// therefore canonical public URLs start with `admin/`, not `sales/admin/`.
export const salesRoutes = [
  {
    path: 'admin/sales-agreement',
    element: <SalesAgreementList />,
  },
  {
    path: 'admin/sales-agreement/create',
    element: <SalesAgreementCreate />,
  },
  {
    path: 'admin/sales-payment-process',
    element: <SalesPaymentProcessList />,
  },
]
