/**
 * @file Sidebar menu configuration for Sales.
 * Sections: parent groups and leaf items containing visible labels, stable keys, and absolute paths.
 * Every leaf path must match the corresponding routes.jsx entry and page navigation links.
 */
export const salesMenu = [
  // Keep these absolute `/admin/...` links synchronized with the relative
  // entries in routes.jsx.
  {
    label: 'Admin',
    key: 'admin',
    children: [
      {
        label: 'Sales Agreement',
        key: 'sales-agreement',
        path: '/admin/sales-agreement',
      },
      {
        label: 'Sales Payment Process',
        key: 'sales-payment-process',
        path: '/admin/sales-payment-process',
      },
    ],
  },
]
